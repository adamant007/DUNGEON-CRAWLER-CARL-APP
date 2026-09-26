import React, { useEffect, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import PortraitBlock from "@/components/character/PortraitBlock";
import VaultDialog from "@/components/character/VaultDialog";
import Hotbar from "@/components/character/Hotbar";
import CharacterBar from "@/components/character/CharacterBar";
import CharacterCreatorDialog from "@/components/character/creator/CharacterCreatorDialog";
import ParchmentDialog from "@/components/character/ParchmentDialog";
import RulebookLibrary from "@/components/rulebooks/RulebookLibrary";
import { listBuiltinProfiles, resolveProfile } from "@/rules-profile";
import { recordFromPregen } from "@/components/character/creator/pregenToCharacter";
import { recordFromWizard } from "@/components/character/creator/wizard/wizardToCharacter";
import { dccStatMods, dccStatModsNumeric } from "@/components/character/statModifiers";
import { rollDice, rollD20, resolveStatMods } from "@/components/character/dice";
import { parseQty, parseConsumableEffect } from "@/components/character/consumableEffect";
import { parseHealSlots } from "@/components/character/spellData";
import RollResultCard from "@/components/character/RollResultCard";
import DimensionalStoragePanel from "@/components/character/DimensionalStoragePanel";
import CraftingPanel from "@/components/character/CraftingPanel";
import FourPageCharacterSheet from "@/components/character/FourPageCharacterSheet";
import PrintSheetDialog from "@/components/character/PrintSheetDialog";
import UnsavedDialog from "@/components/character/UnsavedDialog";
import InventoryItemDialog from "@/components/character/InventoryItemDialog";
import LoadDialog from "@/components/character/LoadDialog";
import PigmentsFlyout from "@/components/character/PigmentsFlyout";
import { resolvePigment, pigmentAccentVars, pigmentAccentHex, pigmentAccentText, pigmentBorderVars } from "@/components/character/pigments";
import { blankCharacter, blankSheet, recordFromSheet, sheetFromRecord } from "@/components/character/characterStorage";
import ClassAdvancementDialog from "@/components/character/advancement/ClassAdvancementDialog";
import RaceAdvancementDialog from "@/components/character/advancement/RaceAdvancementDialog";
import StatAllocationDialog from "@/components/character/advancement/StatAllocationDialog";
import DescendFloorDialog from "@/components/character/advancement/DescendFloorDialog";
import GuidedHomebrewBuilderDialog from "@/components/character/homebrew/GuidedHomebrewBuilderDialog";
import {
  applyThirdFloorRace,
  applyThirdFloorClass,
  applyCharacterActorFloor,
  needsThirdFloorRace,
  needsThirdFloorClass,
  needsCharacterActorFloor,
} from "@/components/character/advancement/classAdvancement";
import {
  allocateStatPoints,
  descendFloor,
  eligibleCatalog,
  levelUpCharacter,
  optionEligibility,
  progressionState,
} from "@/components/character/advancement/progression";
import "./character-handwritten.css";
import "./character-tome.css";
import "./character-dark.css";

/* One canonical record per character in the database, owned by the
   signed-in user (row-level security on the Character entity). The sheet
   hydrates from that record and every edit stays local until Save. */
export default function CharacterSheet() {
  const b = blankSheet();
  const entryParams = new URLSearchParams(window.location.search);
  const gmCampaignId = entryParams.get("gmCampaign") || "";
  const gmCharacterId = entryParams.get("gmCharacter") || "";
  const gmMode = Boolean(gmCampaignId && gmCharacterId);
  const [name, setName] = useState(b.name);
  const [portrait, setPortrait] = useState(b.portrait);
  const [portraitSettings, setPortraitSettings] = useState({ ...b.portraitSettings });
  const [customization, setCustomization] = useState({ ...b.customization });
  const [info, setInfo] = useState({ ...b.info });
  const [gear, setGear] = useState({ ...b.gear });
  const [attrs, setAttrs] = useState({ ...b.attrs });
  const [skills, setSkills] = useState({});
  const [hp, setHp] = useState(b.hp), [maxHp, setMaxHp] = useState(b.maxHp);
  const [mana, setMana] = useState(b.mana), [maxMana, setMaxMana] = useState(b.maxMana);
  const [defense, setDefense] = useState({ ...b.defense });
  const [attacks, setAttacks] = useState(b.attacks.map((r) => ({ ...r })));
  const [spells, setSpells] = useState(b.spells.map((r) => ({ ...r })));
  const [hotbar, setHotbar] = useState([...b.hotbar]);
  const [inventory, setInventory] = useState(b.inventory.map((r) => ({ ...r })));
  const [notes, setNotes] = useState(b.notes);
  const [profile, setProfile] = useState({ ...b.profile }); // Rules Profile reference (additive)
  /* Pregen provenance + preserved rules data (additive) — set on load or
     create, immutable while editing, and carried through every save so the
     stored DCCarl stat modifiers survive each round-trip. */
  const [characterSource, setCharacterSource] = useState("");
  const [sourceTemplateId, setSourceTemplateId] = useState("");
  const [rulesetData, setRulesetData] = useState({});
  const resolvedProfileNow = profile?.systemKey ? resolveProfile({ system_key: profile.systemKey }) : null;
  const activeRulesProfile = resolvedProfileNow?.status === "ok" ? resolvedProfileNow.profile : null;
  const advancementClassCatalog = activeRulesProfile?.advancement?.stages?.third_floor?.classes?.catalog ?? {};
  const advancementRaceCatalog = activeRulesProfile?.advancement?.stages?.third_floor?.races?.catalog ?? {};
  const savedCustomRaces = Array.isArray(rulesetData?.homebrew?.races) ? rulesetData.homebrew.races : [];
  const savedCustomClasses = Array.isArray(rulesetData?.homebrew?.classes) ? rulesetData.homebrew.classes : [];
  const customRaceCatalog = Object.fromEntries(savedCustomRaces.filter((x) => x?.id).map((x) => [x.id, x]));
  const customClassCatalog = Object.fromEntries(savedCustomClasses.filter((x) => x?.id).map((x) => [x.id, x]));
  const raceCatalogWithCustom = { ...advancementRaceCatalog, ...customRaceCatalog };
  const classCatalogWithCustom = { ...advancementClassCatalog, ...customClassCatalog };

  const [loading, setLoading] = useState(true); // sheet is not editable until saved data (or its absence) is known
  const [currentId, setCurrentId] = useState(null); // null = unsaved draft
  const [draft, setDraft] = useState(false); // true while the record is an unfinished creation draft
  const [creationStep, setCreationStep] = useState(""); // where an unfinished creation flow left off
  const [savedJson, setSavedJson] = useState(null); // snapshot of the saved/loaded record
  const [saveState, setSaveState] = useState("idle"); // idle | saving | success | error
  const [dirty, setDirty] = useState(false); // sheet differs from the saved snapshot
  const [dialog, setDialog] = useState(null); // "new" | "load" | "rulebooks" | "unsaved" | "saveAccount"
  /* Try-then-save: a visitor without an account plays the whole sheet in
     THIS browser only; their record is written to the database the first
     time they sign in. */
  const [signedIn, setSignedIn] = useState(false);
  const authedRef = useRef(false);
  const builtinProfiles = React.useMemo(() => listBuiltinProfiles(), []);
  const [pendingSwitch, setPendingSwitch] = useState(null); // continuation after the unsaved prompt
  const [editMode, setEditMode] = useState(false); // EDIT CHARACTER — OFF is normal play (fields protected); ON is deliberate character management
  const [preEdit, setPreEdit] = useState(null); // sheet snapshot from before editing started (CANCEL restores it)
  const [lastRoll, setLastRoll] = useState(null); // shared dice result overlay: { action, roll }
  const [rankDraft, setRankDraft] = useState(null); // temporary in-memory skill-rank draft — Edit Character transaction (see applyRankDraft)
  const [manageInv, setManageInv] = useState(null); // Inventory row open for restock/manage (index into the canonical inventory)
  const [currency, setCurrency] = useState({ ...b.currency }); // canonical currency amounts (profile-defined id -> count)
  const [activeSheetPage, setActiveSheetPage] = useState(1); // four-page digital character sheet tabs
  const [gmAccessError, setGmAccessError] = useState("");
  const advancementPromptRef = useRef("");
  const [floorResult, setFloorResult] = useState(null);

  /* Latest-value refs — saves fired from timers, Retry, and dialogs must
     always read the CURRENT sheet, character id, and snapshot, never a
     stale render. */
  const currentSheetRef = useRef(null);
  const currentIdRef = useRef(null);
  const savedJsonRef = useRef(null);
  const dirtyRef = useRef(false);
  const chainRef = useRef(Promise.resolve()); // save queue: one request in flight at a time

  const currentSheet = () => ({
    name, portrait, portraitSettings, customization, info, gear, attrs, skills,
    hp, maxHp, mana, maxMana, defense, attacks, spells, hotbar, inventory, currency, notes,
    draft, creationStep, profile, characterSource, sourceTemplateId, rulesetData,
  });

  /* Mirror the live values into refs after every render. Declared before
     the effects that read them, so those always see the latest values. */
  useEffect(() => {
    currentSheetRef.current = currentSheet;
    currentIdRef.current = currentId;
    savedJsonRef.current = savedJson;
    dirtyRef.current = dirty;
  });

  /* Apply a saved record to every field of the sheet. */
  const apply = (rec) => {
    const s = sheetFromRecord(rec);
    setName(s.name);
    setPortrait(s.portrait);
    setPortraitSettings(s.portraitSettings);
    setCustomization(s.customization);
    setInfo(s.info);
    setGear(s.gear);
    setAttrs(s.attrs);
    setSkills(s.skills);
    setHp(s.hp);
    setMaxHp(s.maxHp);
    setMana(s.mana);
    setMaxMana(s.maxMana);
    setDefense(s.defense);
    setAttacks(s.attacks);
    setSpells(s.spells);
    setHotbar(s.hotbar);
    setInventory(s.inventory);
    setCurrency({ ...s.currency });
    setNotes(s.notes);
    setDraft(s.draft);
    setCreationStep(s.creationStep);
    setProfile({ ...s.profile });
    setCharacterSource(s.characterSource);
    setSourceTemplateId(s.sourceTemplateId);
    setRulesetData(s.rulesetData ?? {});
    setEditMode(false); // a character switch always returns to normal play
    setPreEdit(null);
    setRankDraft(null);
    setCurrentId(rec.id);
    const snap = JSON.stringify(recordFromSheet(s));
    savedJsonRef.current = snap;
    setSavedJson(snap);
    setSaveState("idle");
    setDirty(false);
  };

  const resetToBlank = () => {
    const blank = blankSheet();
    setName(blank.name);
    setPortrait(blank.portrait);
    setPortraitSettings({ ...blank.portraitSettings });
    setCustomization({ ...blank.customization });
    setInfo({ ...blank.info });
    setGear({ ...blank.gear });
    setAttrs({ ...blank.attrs });
    setSkills({});
    setHp(blank.hp);
    setMaxHp(blank.maxHp);
    setMana(blank.mana);
    setMaxMana(blank.maxMana);
    setDefense({ ...blank.defense });
    setAttacks(blank.attacks.map((r) => ({ ...r })));
    setSpells(blank.spells.map((r) => ({ ...r })));
    setHotbar([...blank.hotbar]);
    setInventory(blank.inventory.map((r) => ({ ...r })));
    setCurrency({ ...blank.currency });
    setNotes(blank.notes);
    setDraft(false);
    setCreationStep("");
    setProfile({ ...blank.profile });
    setCharacterSource(blank.characterSource);
    setSourceTemplateId(blank.sourceTemplateId);
    setRulesetData(blank.rulesetData);
    setEditMode(false);
    setPreEdit(null);
    setRankDraft(null);
    setCurrentId(null);
    savedJsonRef.current = null;
    setSavedJson(null);
    setSaveState("idle");
    setDirty(false);
  };

  /* Remember the active character on the user, so refresh and sign-in
     return to the same crawler. */
  const setActive = (id) => base44.auth.updateMe({ active_character_id: id }).catch(() => {});

  /* Guest draft — the try-out character lives in localStorage (this
     browser only) until the visitor creates an account. */
  const GUEST_DRAFT_KEY = "gds_guest_character_draft";
  const stashGuestDraft = (rec) => {
    try {
      localStorage.setItem(GUEST_DRAFT_KEY, JSON.stringify(rec ?? recordFromSheet(currentSheetRef.current())));
    } catch {}
  };

  /* On entry: resolve who's here and what they were playing.
     - Signed in: restore the remembered active character (or the most
       recent one).
     - Signed in WITH a stashed guest draft (try-then-save): the visitor
       just created an account — save that draft as their first real
       record now.
     - Visitor: restore the guest draft from this browser, if any. */
  useEffect(() => {
    let alive = true;
    (async () => {
      let rec = null;
      let authed = false;
      let guest = null;
      try {
        guest = JSON.parse(localStorage.getItem(GUEST_DRAFT_KEY) || "null");
      } catch {
        guest = null;
      }
      let me = null;
      try {
        me = await base44.auth.me();
        authed = true;
      } catch {
        /* A plain /character visit is a saved-character destination, not a
           silent blank guest sheet. Keep guest mode only when the visitor
           explicitly chose New Character or already has a local guest draft. */
        const entryAction = new URLSearchParams(window.location.search).get("action");
        if (!guest && entryAction !== "new") {
          base44.auth.redirectToLogin(window.location.pathname + window.location.search);
          return;
        }
      }
      if (authed && gmMode) {
        try {
          /* A campaign GM is allowed to view the canonical characters linked
             to their campaign even when RLS correctly prevents a generic
             Character.get() on another player's private row. Resolve through
             the campaign-scoped API, then open the matching full sheet. */
          const campaignCharacters = await base44.campaigns.characters(gmCampaignId);
          rec = (campaignCharacters ?? []).find((row) => row.id === gmCharacterId) ?? null;
          if (!rec) throw new Error("This crawler is not linked to that campaign.");
        } catch (err) {
          rec = null;
          setGmAccessError(err?.message || "This crawler is not available to this campaign GM.");
        }
      }
      if (!gmMode && authed && guest) {
        try {
          rec = await base44.entities.Character.create(guest);
          localStorage.removeItem(GUEST_DRAFT_KEY);
        } catch {
          rec = null;
        }
      } else if (!gmMode && !authed && guest) {
        rec = guest; // returning visitor — pick the try-out back up
      }
      if (!gmMode && authed && !rec) {
        const activeId = me?.active_character_id;
        if (activeId) {
          try {
            rec = await base44.entities.Character.get(activeId);
          } catch {
            rec = null;
          }
        }
        if (!rec) {
          const rest = await base44.entities.Character.list("-updated_date", 1);
          rec = rest?.[0] || null;
        }
      }
      if (!alive) return;
      setSignedIn(authed);
      authedRef.current = authed;
      if (rec) apply(rec);
      setLoading(false);
      /* Deep links from the home page — /character?action=new|load opens
         the corresponding EXISTING flow once; the param is cleared so a
         refresh returns to the plain sheet. */
      const urlParams = new URLSearchParams(window.location.search);
      const action = urlParams.get("action");
      if (action === "new" || action === "load") {
        window.history.replaceState({}, "", window.location.pathname);
        /* CHARACTERS from the home toolbar: saved characters open the
           existing selector; none exist yet → straight into the existing
           Create Character flow. */
        setDialog(action === "new" || !rec ? "new" : "load");
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  /* GM campaign pushes can update a crawler while the player has the sheet
     open. Refresh only when the open sheet is clean so a remote update can
     never overwrite unsaved local edits. */
  useEffect(() => {
    let alive = true;
    const onCampaignCharacterUpdated = async (event) => {
      const id = event?.detail?.characterId;
      if (!id || id !== currentIdRef.current || dirtyRef.current || gmMode) return;
      try {
        const rec = await base44.entities.Character.get(id);
        if (alive && rec) apply(rec);
      } catch {
        // The campaign alert remains visible even if refresh is unavailable.
      }
    };
    window.addEventListener("gds:campaign-character-updated", onCampaignCharacterUpdated);
    return () => {
      alive = false;
      window.removeEventListener("gds:campaign-character-updated", onCampaignCharacterUpdated);
    };
  }, []);

  /* Unsaved-changes check: compares the live sheet against the last
     saved/loaded snapshot (or the blank defaults for a fresh draft). */
  const isDirty = () =>
    JSON.stringify(recordFromSheet(currentSheetRef.current())) !==
    (savedJsonRef.current ?? JSON.stringify(blankCharacter()));

  /* Serialized save — exactly one request in flight at a time; a save
     that starts later always runs after the earlier one resolves and
     captures the sheet at that moment, so an older request can never
     overwrite newer edits. A save resolving after the user switched
     characters is discarded instead of stamping the new one. `finishDraft`
     (manual Save Character) promotes an unfinished draft to a full
     character. On failure the sheet keeps every edit. */
  const doSave = (opts = {}) => {
    const run = async () => {
      /* Try-then-save — a visitor without an account never writes to the
         database; Save offers the account step instead, with the draft
         stashed so it survives the sign-up redirect. */
      if (!authedRef.current) {
        stashGuestDraft();
        setSaveState("idle");
        setDialog("saveAccount");
        return false;
      }
      const idAtStart = currentIdRef.current;
      const sheet = currentSheetRef.current();
      /* Explicit saves pass freshly committed values (ruleset data from
         SAVE CHANGES, currency from the Vault) explicitly: the state
         mirror can still be one
         render behind when the save chain runs, so the payload must not
         depend on it. */
      const effectiveSheet = opts.values
        ? { ...sheet, ...opts.values }
        : opts.rulesetData
          ? { ...sheet, rulesetData: opts.rulesetData }
          : sheet;
      const changed =
        JSON.stringify(recordFromSheet(effectiveSheet)) !==
        (savedJsonRef.current ?? JSON.stringify(blankCharacter()));
      if (!changed && idAtStart && !opts.finishDraft) return true; // nothing to write
      setSaveState("saving");
      try {
        const data = recordFromSheet({
          ...effectiveSheet,
          draft: opts.finishDraft ? false : sheet.draft,
          creationStep: opts.finishDraft ? "" : sheet.creationStep,
        });
        let rec;
        if (idAtStart) {
          rec = gmMode
            ? await base44.campaigns.gmUpdateCharacter(
                gmCampaignId,
                idAtStart,
                data,
                Boolean(opts.finishDraft)
              )
            : await base44.entities.Character.update(idAtStart, data);
        } else {
          if (gmMode) throw new Error("A GM campaign view cannot create a replacement character.");
          rec = await base44.entities.Character.create(data);
        }
        // Switched away mid-flight — this save landed on the old record.
        if (idAtStart && currentIdRef.current !== idAtStart) return true;
        if (!idAtStart) setCurrentId(rec.id);
        const snap = JSON.stringify(data);
        savedJsonRef.current = snap;
        setSavedJson(snap);
        if (opts.finishDraft) setDraft(false);
        if (!gmMode) setActive(rec.id);
        setSaveState("success");
        return true;
      } catch {
        if (currentIdRef.current === idAtStart) setSaveState("error");
        return false;
      }
    };
    const p = chainRef.current.then(run, run);
    chainRef.current = p;
    return p;
  };

  /* Manual save — immediate, and completes an unfinished draft. */
  const save = () => doSave({ finishDraft: true });

  /* ===== Skill-rank edit transaction (Edit Character) =====
     While EDIT CHARACTER is ON, rank taps write ONLY to this temporary
     in-memory draft — the canonical rulesetData is untouched, so no
     background autosave can commit a rank change mid-session. SAVE
     CHANGES merges the draft into the canonical data and persists
     through the normal save path; CANCEL discards the draft, so the
     untouched canonical ranks return immediately. No second record and
     no second storage — the draft is transient state only. */
  const applyRankDraft = (rd, draft) => {
    if (!draft || !Array.isArray(rd?.skills)) return rd;
    return { ...rd, skills: rd.skills.map((s, i) => (i in draft ? { ...s, rank: draft[i] } : s)) };
  };
  const adjustSkillRank = (index, next) =>
    setRankDraft((d) => ({ ...(d ?? {}), [index]: next }));

  /* ===== Skill advancement mark =====
     Each skill carries ONE advancement checkbox (advancement_mark) —
     separate data from Skill Rank. It is marked automatically when a
     qualifying Skill Check roll occurs (success or failure), and can be
     toggled manually (a GM-called roll outside the app). Repeated uses
     never stack: a skill is simply marked or unmarked. Marking never
     changes Rank and never triggers level-ups. The mark persists through
     the same canonical autosave path as every other field. */
  const markSkillAdvancement = (index) =>
    setRulesetData((rd) => {
      if (!Array.isArray(rd?.skills) || !rd.skills[index]) return rd;
      if (rd.skills[index].advancement_mark) return rd; // already marked — never stacks
      const skills = [...rd.skills];
      skills[index] = { ...skills[index], advancement_mark: true };
      return { ...rd, skills };
    });
  const toggleSkillAdvancement = (index) =>
    setRulesetData((rd) => {
      if (!Array.isArray(rd?.skills) || !rd.skills[index]) return rd;
      const skills = [...rd.skills];
      skills[index] = { ...skills[index], advancement_mark: !skills[index].advancement_mark };
      return { ...rd, skills };
    });

  /* Skill Check roll — d20 + Stat Modifier + Skill Rank. The roll is
     executed and the result shown through the same shared dice overlay as
     attacks and spells; the skill's advancement checkbox is marked ✓
     automatically (success or failure) if not already marked. No invented
     mechanics — the stat mod and rank come from the skill's preserved
     data. */
  const rollSkillCheck = (skill, index) => {
    const statMod = parseInt(String(skill?.mod ?? "").replace(/[+\s]/g, ""), 10) || 0;
    const rank = Number(skill?.rank) || 0;
    const skillStat = String(skill?.stat ?? "").toLowerCase();
    const directAdvantage = Array.isArray(rulesetData?.skillCheckAdvantages) &&
      rulesetData.skillCheckAdvantages.includes(skill?.id);
    const statSkillAdvantage = Array.isArray(rulesetData?.statSkillCheckAdvantages) &&
      rulesetData.statSkillCheckAdvantages.includes(skillStat);
    const hasAdvantage = directAdvantage || statSkillAdvantage;
    const first = 1 + Math.floor(Math.random() * 20);
    const second = hasAdvantage ? 1 + Math.floor(Math.random() * 20) : null;
    const die = hasAdvantage ? Math.max(first, second) : first;
    const total = die + statMod + rank;
    showRoll(`${skill?.name ?? "Skill"} — Skill Check`, {
      display: `${hasAdvantage ? "2d20 keep highest" : "d20"}${statMod >= 0 ? " +" : " −"} ${Math.abs(statMod)} + Rank ${rank}`,
      sides: 20,
      dice: hasAdvantage ? [first, second] : [first],
      mod: statMod + rank,
      total,
    });
    markSkillAdvancement(index);
  };

  /* Hotbar consumable use — the SAME canonical Inventory item's ONE
     shared quantity. The item's STORED effect definition (canonical
     inventory notes, else the hotbar slot's preserved detail) applies to
     the canonical HP/Mana state; the quantity decrements by exactly 1
     only AFTER the effect resolves, never below 0. Items whose mechanics
     define no executable effect are never consumed and never guessed. */
  const useConsumable = (invIndex, effectText) => {
    const item = inventory[invIndex];
    const qty = parseQty(item?.qty);
    if (qty <= 0) return; // zero quantity — no effect, never below 0
    const effect = parseConsumableEffect(item?.item, effectText);
    if (!effect) return; // no executable effect — never consumed
    if (effect.type === "heal_slots") {
      const slotValue = Number(rulesetData?.identity?.healthBarSlotValue) || 0;
      if (slotValue <= 0) return; // effect cannot resolve — do not burn the item
      setHp((h) => Math.min(Number(maxHp) || 0, Math.max(0, (Number(h) || 0) + effect.slots * slotValue)));
    } else if (effect.type === "mana_full") {
      setMana(Math.max(0, Number(maxMana) || 0));
    }
    setInventory((list) =>
      list.map((it, i) => (i === invIndex ? { ...it, qty: qty - 1 } : it))
    );
  };

  /* Restock / Manage in Inventory — writes the edited quantity (and
     notes) back into the SAME canonical Inventory row. No new row is
     ever created, so the Hotbar tile, the potion popup, and the
     Inventory panel all read the ONE real count, persisted through the
     normal autosave. */
  const saveInventoryItem = (index, row) => {
    setInventory((list) => list.map((it, i) => (i === index ? { ...it, ...row } : it)));
    setManageInv(null);
  };

  /* ===== EDIT CHARACTER toggle + shared dice interactions ===== */

  /* EDIT CHARACTER — OFF (default) is normal play: character-building
     fields are protected from accidental inline edits while every play
     interaction (dice, casting, HP/Mana, hotbar, navigation) keeps
     working. ON is deliberate character management of THIS player's
     canonical Character only. SAVE CHANGES persists through the existing
     save path (no new record, no new storage) and switches OFF; CANCEL
     restores the values from before editing started and switches OFF. */
  const restoreSnapshot = (s) => {
    setName(s.name);
    setPortrait(s.portrait);
    setPortraitSettings({ ...s.portraitSettings });
    setCustomization({ ...s.customization });
    setInfo({ ...s.info });
    setGear({ ...s.gear });
    setAttrs({ ...s.attrs });
    setSkills({ ...s.skills });
    setHp(s.hp);
    setMaxHp(s.maxHp);
    setMana(s.mana);
    setMaxMana(s.maxMana);
    setDefense({ ...s.defense });
    setAttacks(s.attacks.map((r) => ({ ...r })));
    setSpells(s.spells.map((r) => ({ ...r })));
    setHotbar([...s.hotbar]);
    setInventory(s.inventory.map((r) => ({ ...r })));
    setCurrency({ ...s.currency });
    setNotes(s.notes);
    setDraft(s.draft);
    setCreationStep(s.creationStep);
    setProfile({ ...s.profile });
    setCharacterSource(s.characterSource);
    setSourceTemplateId(s.sourceTemplateId);
    /* Independent copy again on restore, so the restored state never
       shares nested references with the snapshot object. */
    setRulesetData(s.rulesetData ? JSON.parse(JSON.stringify(s.rulesetData)) : {});
  };

  const toggleEdit = (next) => {
    if (next) {
      /* The pre-edit snapshot must be a TRUE independent copy. Sheet
         values like ruleset_data (skill ranks), details, and equipment
         hold mutable nested objects/arrays; capturing them by reference
         lets mid-session edits leak into the snapshot, so CANCEL would
         "restore" the edited values instead of the pre-edit ones. A
         JSON round-trip is safe here — every sheet field is plain
         serializable data that already round-trips through the DB. */
      setPreEdit(JSON.parse(JSON.stringify(currentSheet()))); // values from before editing started — CANCEL restores these
      setRankDraft(null); // fresh rank draft for this edit session
      setEditMode(true);
    } else {
      /* Manual off keeps the current values: fold any uncommitted rank
         draft into the canonical sheet data, exactly like every other
         field's in-session edits. */
      if (rankDraft) {
        setRulesetData(applyRankDraft(rulesetData, rankDraft));
        setRankDraft(null);
      }
      setEditMode(false); // manual off: current values stay as they are
    }
  };
  const saveChanges = async () => {
    /* Commit the session's rank draft into the canonical data, then
       persist through the existing save path (same record, same
       storage). The merged data is passed to doSave explicitly so the
       payload never depends on a one-render-behind state mirror. */
    const merged = applyRankDraft(rulesetData, rankDraft);
    if (merged !== rulesetData) setRulesetData(merged);
    setRankDraft(null);
    const ok = await doSave({ finishDraft: true, rulesetData: merged }); // existing persistence — same record, same storage
    if (ok) {
      setPreEdit(null);
      setEditMode(false);
    }
  };
  const cancelChanges = () => {
    /* Discard the uncommitted rank draft — the canonical ranks were
       never modified during the session, so the pre-edit values are
       what remains on screen and in the record. */
    setRankDraft(null);
    if (preEdit) restoreSnapshot(preEdit);
    setPreEdit(null);
    setEditMode(false);
    /* The restored values re-persist through the normal autosave if an
       edit had already been auto-saved mid-session. */
  };

  /* ONE shared dice result overlay for every action roll. */
  const showRoll = (action, roll) => {
    if (roll) setLastRoll({ action, roll });
  };
  const rollAttack = (name, bonus) => showRoll(`${name} — Attack`, rollD20(bonus));
  /* Structural damage formulas ("1d4 + STR Mod") resolve the LIVE Stat Mod
     from the character's preserved stats before rolling — the stored entry
     never freezes a summed number. */
  const rollDamage = (name, expr) =>
    showRoll(`${name} — Damage`, rollDice(resolveStatMods(expr, rulesetData?.stats)));
  /* Raw Core Stat check (play mode only) — d20 + the stat's existing
     stored modifier. No skill rank, no use_count, no counters. */
  const rollStatCheck = (label, mod) => showRoll(`${label} — Stat Check`, rollD20(mod));

  /* DCCarl resource pools — the Rules Profile's canonical formulas:
     Max Health = CON Mod × 10 (the official threshold-table mod derived
     from the ENHANCED stat) and Max Mana = the Enhanced INT stat value.
     When the driving stat changes, the pool maximum snaps to the formula
     and the CURRENT value moves by the same delta, clamped to the new
     maximum — a full pool stays full, a shrunk pool can never exceed it;
     there is never a silent refill. The HP heal-slot unit
     (healthBarSlotValue = max ÷ 10 segments) follows the new maximum so
     heal effects keep resolving in the correct units. Other rules
     profiles keep their stored pools untouched. */
  const updateAttrs = (next) => {
    const prevInt = Number(attrs?.int) || 0;
    setAttrs(next);
    if (profile?.systemKey !== "dungeon_crawler_carl") return;
    /* Max Mana = Enhanced INT stat value. */
    const nextInt = Number(next?.int) || 0;
    if (nextInt > 0 && nextInt !== prevInt) {
      setMaxMana(nextInt);
      setMana((cur) => Math.min(nextInt, Math.max(0, (Number(cur) || 0) + (nextInt - prevInt))));
    }
    /* Max Health = CON Mod × 10 — the CON mod recomputed from the NEW
       enhanced CON through the profile's official threshold table. */
    const conMod = dccStatModsNumeric(profile, rulesetData, next)?.con;
    if (typeof conMod === "number" && conMod > 0) {
      const nextMax = conMod * 10;
      const prevMax = Number(maxHp) || 0;
      if (nextMax !== prevMax) {
        setMaxHp(nextMax);
        setHp((cur) => Math.min(nextMax, Math.max(0, (Number(cur) || 0) + (nextMax - prevMax))));
        setRulesetData((rd) => ({
          ...rd,
          identity: { ...(rd?.identity ?? {}), healthBarSlotValue: nextMax / 10 },
        }));
      }
    }
  };

  /* CAST first, then roll. Mana is deducted only when the character can
     pay — it can never go negative — and the change persists through the
     normal autosave. Heal effects described in the spell's preserved
     data apply immediately; spells without canonical dice get no roll. */
  const castSpell = (spell) => {
    const cost = Number(spell?.mana) || 0;
    const current = Number(mana) || 0;
    if (current < cost) return { ok: false, cost, current };
    setMana(Math.max(0, current - cost));
    const slots = parseHealSlots(spell?.detail);
    if (slots) {
      const slotValue = Number(rulesetData?.identity?.healthBarSlotValue) || 0;
      if (slotValue > 0) {
        setHp(Math.min(Number(maxHp) || 0, Math.max(0, (Number(hp) || 0) + slots * slotValue)));
      }
    }
    return { ok: true };
  };
  const rollSpell = (spell) => showRoll(spell?.name, rollDice(spell?.attack?.damage ?? ""));

  /* Background autosave — the sheet saves itself about 2 seconds after
     the user stops editing. Never runs for the zero-character blank
     draft (no record yet) and never while a character is still loading,
     so blank defaults can't reach the database. A temporary failure
     retries once automatically; after that the manual Retry appears. */
  useEffect(() => {
    if (loading) return;
    const nowDirty = isDirty();
    setDirty(nowDirty);
    if (!nowDirty) return;
    if (!signedIn) {
      /* Guest try-out — edits mirror to this browser only; nothing
         reaches the database until an account exists. */
      const t = setTimeout(() => stashGuestDraft(), 800);
      return () => clearTimeout(t);
    }
    if (!currentId) return;
    let retryTimer = null;
    const timer = setTimeout(() => {
      doSave().then((ok) => {
        if (!ok) retryTimer = setTimeout(() => doSave(), 5000);
      });
    }, 2000);
    return () => {
      clearTimeout(timer);
      if (retryTimer) clearTimeout(retryTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, portrait, portraitSettings, customization, info, gear, attrs, skills, hp, maxHp, mana, maxMana, defense, attacks, spells, hotbar, inventory, currency, notes, draft, creationStep, profile, rulesetData, loading, currentId, savedJson, signedIn]);

  /* Floor milestone prompt. On entering Floor 3, accumulated Stat points
     are spent before Race, then Class. Later floor-start class mechanics
     (Former Child Actor) remain after the permanent Third-Floor choices. */
  useEffect(() => {
    if (loading || gmMode || !activeRulesProfile || dialog) return;
    const sheet = currentSheetRef.current?.() ?? currentSheet();
    const floor = Number(sheet?.info?.floor) || 1;
    const progress = progressionState(sheet);
    if (needsThirdFloorRace(sheet) && progress.statPointsAvailable > 0) {
      const key = `${currentId ?? "guest"}:${floor}:floor3-stats`;
      if (advancementPromptRef.current !== key) {
        advancementPromptRef.current = key;
        setDialog("statAllocateRequired");
      }
      return;
    }
    if (needsThirdFloorRace(sheet)) {
      const key = `${currentId ?? "guest"}:${floor}:floor3-race`;
      if (advancementPromptRef.current !== key) {
        advancementPromptRef.current = key;
        setDialog("raceAdvance");
      }
      return;
    }
    if (needsCharacterActorFloor(sheet)) {
      setDialog("characterActor");
      return;
    }
    if (needsThirdFloorClass(sheet)) {
      const key = `${currentId ?? "guest"}:${floor}:floor3-class`;
      if (advancementPromptRef.current !== key) {
        advancementPromptRef.current = key;
        setDialog("classAdvance");
      }
    }
  }, [loading, gmMode, currentId, info?.floor, info?.class, rulesetData, dialog, activeRulesProfile]);

  /* Warn before leaving with unsaved changes — no last-second save on
     browser close; the debounce keeps the record current to the last edit. */
  useEffect(() => {
    const onBeforeUnload = (e) => {
      if (dirtyRef.current) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, []);

  /* Creating or loading another character first offers to protect unsaved
     edits; the chosen continuation runs only after that's resolved. */
  const runGuarded = (action) => {
    if (isDirty()) {
      setPendingSwitch(() => action);
      setDialog("unsaved");
    } else {
      action();
    }
  };

  /* NEW CHARACTER opens the Character Creator (entry + wizard); the Load
     dialog's create-new path shares it. Unsaved-edit protection applies. */
  const startNew = () => runGuarded(() => setDialog("new"));
  const openLoad = () => runGuarded(() => setDialog("load"));
  /* RULEBOOKS — the SAME private Rulebook Library the Character Creator
     reaches (same component, same Rulebook records). Managing rulebooks
     never touches the active character, so no unsaved-edit guard and no
     character switch are involved: closing it simply returns to the
     sheet exactly as it was. */
  const openRulebooks = () => setDialog("rulebooks");

  /* Step 3A.4 — create ONE new canonical Character record copied from the
     selected immutable First Floor pregen template, make it the active
     character, and show it on this sheet. The template itself is never
     modified; on failure the exception bubbles to the creator, which
     stays open and offers retry. */
  const createFromPregen = async (template) => {
    const data = recordFromPregen(template);
    if (!authedRef.current) {
      /* Visitor: the sheet shows the pregen now — it becomes a real
         saved record the first time they sign in. */
      apply(data);
      stashGuestDraft(data);
      setDialog(null);
      return;
    }
    const rec = await base44.entities.Character.create(data);
    apply(rec);
    setActive(rec.id);
    setDialog(null);
  };

  /* Step 3B.9 — create ONE new canonical Character record from the FULLY
     VALIDATED wizard draft, make it the active character, and show it on
     this sheet. The wizard only calls this after its Review hub passes
     every required issue; on failure the exception bubbles back to the
     wizard, which stays open and offers retry — no partial record is
     ever written. */
  const createFromWizard = async (selection, draft) => {
    const data = recordFromWizard(selection.profile, draft);
    if (!authedRef.current) {
      /* Visitor: same try-then-save path as the pregens. */
      apply(data);
      stashGuestDraft(data);
      setDialog(null);
      return;
    }
    const rec = await base44.entities.Character.create(data);
    apply(rec);
    setActive(rec.id);
    setDialog(null);
  };

  /* ===== Core DCC Progression =====
     Level and Floor are separate. Tutorial-floor Levels are converted into
     the accumulated Third-Floor Stat pool on descent. Once on Floor 3 or
     deeper, each new Level grants 3 more banked Stat points. */
  const handleLevelUp = async () => {
    if (!activeRulesProfile) return;
    const result = levelUpCharacter(currentSheet());
    const ok = await persistAdvancedSheet(result.sheet);
    if (!ok) return;
    if (result.statPointsGained > 0) setDialog("statAllocate");
  };

  const handleDescend = () => setDialog("descendFloor");

  const confirmDescend = async () => {
    if (!activeRulesProfile) return;
    const result = descendFloor(activeRulesProfile, currentSheet());
    const ok = await persistAdvancedSheet(result.sheet);
    if (!ok) return;
    setFloorResult(result);
    const progress = progressionState(result.sheet);
    if (result.to === 3 && needsThirdFloorRace(result.sheet) && progress.statPointsAvailable > 0) {
      setDialog("statAllocateRequired");
      return;
    }
    if (result.rolls.length) {
      setDialog("floorResult");
      return;
    }
    setDialog(null);
  };

  const confirmStatAllocation = async (allocation, forced = false) => {
    if (!activeRulesProfile) return { ok: false, reason: "No active DCC rules profile." };
    const result = allocateStatPoints(activeRulesProfile, currentSheet(), allocation);
    if (!result.ok) return result;
    const ok = await persistAdvancedSheet(result.sheet);
    if (!ok) return { ok: false, reason: "Could not save the Stat allocation." };

    const remaining = progressionState(result.sheet).statPointsAvailable;
    if (forced && remaining > 0) {
      return { ok: false, reason: `Spend all ${remaining} remaining Stat points before Race selection.` };
    }
    if (forced && needsThirdFloorRace(result.sheet)) setDialog("raceAdvance");
    else setDialog(null);
    return { ok: true };
  };

  /* ===== Third-Floor Class Advancement =====
     Applies to the SAME canonical character. A permanent class is applied
     once; Former Child Actor's Character Actor layer is replaced each floor. */
  const persistAdvancedSheet = async (nextSheet) => {
    restoreSnapshot(nextSheet);
    if (!authedRef.current) {
      stashGuestDraft(recordFromSheet(nextSheet));
      return true;
    }
    return doSave({ finishDraft: true, values: nextSheet });
  };

  const saveGuidedHomebrew = async (entry) => {
    if (!entry?.id) return false;
    const next = JSON.parse(JSON.stringify(currentSheet()));
    const rules = next.rulesetData ?? {};
    const homebrew = {
      races: Array.isArray(rules?.homebrew?.races) ? [...rules.homebrew.races] : [],
      classes: Array.isArray(rules?.homebrew?.classes) ? [...rules.homebrew.classes] : [],
    };
    const key = entry.race_type ? "races" : "classes";
    homebrew[key] = [...homebrew[key].filter((x) => x?.id !== entry.id), entry];
    rules.homebrew = homebrew;
    next.rulesetData = rules;
    const ok = await persistAdvancedSheet(next);
    if (ok) setDialog(null);
    return ok;
  };

  const confirmThirdFloorRace = async (raceId) => {
    if (!activeRulesProfile) return;
    const entry = raceCatalogWithCustom[raceId];
    if (!entry) return;
    const eligibility = optionEligibility(entry, currentSheet(), activeRulesProfile, "race");
    if (!eligibility.eligible) return;
    const floor = Math.max(3, Number(info?.floor) || 3);
    const next = applyThirdFloorRace(activeRulesProfile, currentSheet(), entry, floor);
    const ok = await persistAdvancedSheet(next);
    if (!ok) return;
    setDialog("classAdvance");
  };

  const confirmThirdFloorClass = async (classId) => {
    if (!activeRulesProfile) return;
    const entry = classCatalogWithCustom[classId];
    if (!entry) return;
    const eligibility = optionEligibility(entry, currentSheet(), activeRulesProfile, "class");
    if (!eligibility.eligible) return;
    const floor = Math.max(3, Number(info?.floor) || 3);
    const next = applyThirdFloorClass(activeRulesProfile, currentSheet(), entry, floor);
    const ok = await persistAdvancedSheet(next);
    if (!ok) return;
    setDialog(entry.id === "former_child_actor" ? "characterActor" : null);
  };

  const confirmCharacterActorClass = async (classId, rolls) => {
    if (!activeRulesProfile) return;
    const entry = advancementClassCatalog[classId];
    if (!entry) return;
    const floor = Math.max(3, Number(info?.floor) || 3);
    const next = applyCharacterActorFloor(activeRulesProfile, currentSheet(), entry, rolls, floor);
    const ok = await persistAdvancedSheet(next);
    if (ok) setDialog(null);
  };

  const advancementSheet = () => currentSheet();
  const floor3RaceNeeded = activeRulesProfile ? needsThirdFloorRace(advancementSheet()) : false;
  const floor3ClassNeeded = activeRulesProfile ? needsThirdFloorClass(advancementSheet()) : false;
  const actorFloorNeeded = activeRulesProfile ? needsCharacterActorFloor(advancementSheet()) : false;
  const progression = progressionState(advancementSheet());
  const qualifiedRaceCatalog = activeRulesProfile
    ? eligibleCatalog(raceCatalogWithCustom, advancementSheet(), activeRulesProfile, "race")
    : {};
  const qualifiedClassCatalog = activeRulesProfile
    ? eligibleCatalog(classCatalogWithCustom, advancementSheet(), activeRulesProfile, "class")
    : {};
  const openAdvancement = () => {
    if (floor3RaceNeeded && progression.statPointsAvailable > 0) setDialog("statAllocateRequired");
    else setDialog(floor3RaceNeeded ? "raceAdvance" : actorFloorNeeded ? "characterActor" : "classAdvance");
  };

  const loadCharacter = (rec) => {
    apply(rec);
    setActive(rec.id);
    setDialog(null);
  };

  /* After a delete: if the active character went, hand the sheet to the
     next saved one, or to a blank draft with the create-character empty
     state (the Load dialog stays open showing it). */
  const handleDeleted = (deletedId, remaining) => {
    if (deletedId !== currentId) return;
    if (remaining.length > 0) {
      loadCharacter(remaining[0]);
    } else {
      resetToBlank();
      setDialog("load");
    }
  };

  const resolveUnsaved = async (choice) => {
    const next = pendingSwitch;
    if (choice === "save") {
      await chainRef.current; // let any in-flight autosave land first
      if (isDirty()) {
        const ok = await doSave();
        if (!ok) return false; // dialog stays open: Retry, Discard, or Cancel
      }
      setPendingSwitch(null);
      setDialog(null);
      next?.();
      return true;
    }
    setPendingSwitch(null);
    setDialog(null);
    if (choice === "discard") next?.();
  };

  /* Pass 2 composition — the SAME live panels, only repositioned. Wide
     viewports (>=1024px): LEFT = compact Portrait + Identity band, Core
     Stats, Spells/Abilities, Equipped Gear, Inventory; RIGHT = HP/Mana
     with the Hotbar directly beneath it, then Attacks, Skills,
     Defense/Movement, and the flavor panel. Narrow viewports stack the
     identical panels in the approved phone order. Every panel keeps its
     existing props, handlers, and mechanics — placement only. */
  /* Pigments of Poor Decisions — PRESENTATION ONLY. The active pigment comes
     from the character's customization object (persisted through the
     normal autosave); it drives the panel gradient's CSS variables and,
     for light pigments, the automatic dark-ink text scope. */
  const pigment = resolvePigment(customization);
  /* Sheet APPEARANCE — Dungeon (Dark) is the original sheet and the
     default; Tome (Light) re-faces the panels in aged ivory. Saved with
     the character in customization, same as the pigment. */
  const appearance = customization?.appearance === "tome" ? "tome" : "dungeon";
  /* Pigments of Poor Decisions are ACCENT colors — the pigment only
     re-inks the accents (thick panel borders, dividers, headings).
     Border channels are a brighter display version on Dark and
     contrast-tuned on Light; Default Brown sets no variables,
     restoring the completely original gold/bronze accents. */
  const pigmentOn = pigment.key !== "default" && !!pigment.hex;
  const pigmentStyle = pigmentOn
    ? {
        "--pig-accent": pigmentAccentHex(pigment.hex, appearance),
        "--pig-accent-text": pigmentAccentText(pigment.hex, appearance),
        "--pig-accent-rgb": pigmentAccentVars(pigment.hex, appearance),
        "--pig-border-rgb": pigmentBorderVars(pigment.hex, appearance),
      }
    : undefined;
  const portraitBlock = (
    <PortraitBlock
      portrait={portrait} setPortrait={setPortrait}
      portraitSettings={portraitSettings} setPortraitSettings={setPortraitSettings}
      customization={customization} setCustomization={setCustomization}
      playMode={!editMode}
    />
  );

  const hotbarBlock = (
    <Hotbar
      slots={hotbar}
      setSlots={setHotbar}
      playMode={!editMode}
      spells={spells}
      rulesetData={rulesetData}
      attacks={attacks}
      inventory={inventory}
      mana={mana}
      maxMana={maxMana}
      onCast={castSpell}
      onRollSpell={rollSpell}
      onRollSkill={rollSkillCheck}
      onToggleSkillAdv={toggleSkillAdvancement}
      onAttackRoll={rollAttack}
      onDamageRoll={rollDamage}
      onUseConsumable={useConsumable}
      onManageConsumable={(idx) => setManageInv(idx)}
    />
  );

  const profileCurrencies = resolvedProfileNow?.status === "ok" ? (resolvedProfileNow.profile?.currency?.currencies ?? []) : [];
  const saveVault = async (clean) => {
    setCurrency((cur) => ({ ...cur, ...clean }));
    await doSave({ values: { currency: { ...currency, ...clean } } });
  };

  const storageBlock = (
    <DimensionalStoragePanel
      inventory={inventory}
      setInventory={setInventory}
      strength={attrs?.str}
    />
  );

  const craftingBlock = (
    <CraftingPanel
      inventory={inventory}
      setInventory={setInventory}
      floor={Number(info?.floor) || 1}
    />
  );

  return (
    <>
      <div className="pb-8 px-2">
        <article
          className={`parchment crawler-tome sheet-frame sheet-edge relative mx-auto w-full max-w-[1120px] p-2.5 sm:p-7 ${!editMode ? "play-locked" : ""}${pigmentOn ? " pigment-on" : ""}${appearance === "tome" ? " tome-light" : ""}`}
          style={pigmentStyle}
        >
          <div className="relative z-[1]">
            {gmMode && (
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-md border border-[#8a642f] bg-[#23170e] px-3 py-2 text-[#f2e5cb]">
                <div>
                  <strong className="font-fell-sc text-xs tracking-[0.12em] text-[#e2b363]">GM CHARACTER VIEW</strong>
                  <p className="font-fell text-[11px] text-[#d6c2a0]">
                    You are viewing a crawler assigned to this campaign. EDIT CHARACTER saves back to this crawler only.
                  </p>
                </div>
                <a href="/gm-tools" className="font-fell-sc text-xs font-bold underline text-[#f2d49b]">BACK TO GM TOOLS</a>
              </div>
            )}
            <CharacterBar
              className="-mt-2 sm:-mt-5 mb-1"
              gmMode={gmMode}
              onRulebooks={openRulebooks}
              onNew={startNew}
              onSave={save}
              onLoad={openLoad}
              onPrint={() => setDialog("print")}
              onPigments={() => setDialog("pigments")}
              onBuilder={() => setDialog("guidedBuilder")}
              showBuilder={profile?.systemKey === "dungeon_crawler_carl" && !loading && (!!currentId || !!name)}
              onAdvance={openAdvancement}
              showProgression={profile?.systemKey === "dungeon_crawler_carl" && !loading && (!!currentId || !!name)}
              onLevelUp={handleLevelUp}
              onDescend={handleDescend}
              onSpendStats={() => setDialog("statAllocate")}
              statPointsAvailable={progression.statPointsAvailable}
              canAdvance={floor3RaceNeeded || floor3ClassNeeded || actorFloorNeeded}
              advanceLabel={actorFloorNeeded ? `Floor ${Number(info?.floor) || 3} Actor Class` : floor3RaceNeeded ? "Floor 3 Race" : "Floor 3 Class"}
              saveState={saveState}
              dirty={dirty}
              onRetry={() => doSave()}
              busy={loading}
              editMode={editMode}
              onToggleEdit={toggleEdit}
              onSaveChanges={saveChanges}
              onCancelChanges={cancelChanges}
            />
            {loading ? (
              <p className="py-16 text-center font-fell italic text-sm text-[var(--ink-soft)]">
                Unrolling your parchment…
              </p>
            ) : gmAccessError ? (
              <div className="mx-auto my-10 max-w-xl rounded border border-[#8b2f2a] bg-[#2a1210]/80 p-5 text-center">
                <p className="font-display text-lg font-bold text-[#f2d5c8]">Crawler unavailable</p>
                <p className="mt-2 font-fell text-sm text-[#dcc6b8]">{gmAccessError}</p>
                <a href="/gm-tools" className="mt-4 inline-block font-fell-sc text-xs font-bold underline">Return to GM Tools</a>
              </div>
            ) : (
              <FourPageCharacterSheet
                page={activeSheetPage}
                setPage={setActiveSheetPage}
                name={name}
                info={info}
                attrs={attrs}
                onAttrsChange={updateAttrs}
                statMods={dccStatMods(profile, rulesetData, attrs)}
                rulesetData={rulesetData}
                portrait={portrait}
                hp={hp}
                maxHp={maxHp}
                setHp={setHp}
                mana={mana}
                maxMana={maxMana}
                setMana={setMana}
                defense={defense}
                attacks={attacks}
                onAttackRoll={rollAttack}
                onDamageRoll={rollDamage}
                inventory={inventory}
                onUseConsumable={useConsumable}
                onManageConsumable={(idx) => setManageInv(idx)}
                rankDraft={rankDraft}
                editing={editMode}
                onAdjustRank={adjustSkillRank}
                onToggleAdv={toggleSkillAdvancement}
                onRollSkill={rollSkillCheck}
                hotbar={hotbar}
                gear={gear}
                notes={notes}
                onEditPortrait={() => setDialog("portrait")}
                onManageStorage={() => setDialog("storage")}
                onManageHotlist={() => setDialog("hotbar")}
                onCrafting={() => setDialog("crafting")}
                onOpenVault={() => setDialog("vault")}
              />
            )}

          </div>
        </article>
      </div>

      <RollResultCard result={lastRoll} onClose={() => setLastRoll(null)} />

      {dialog === "guidedBuilder" && activeRulesProfile && (
        <GuidedHomebrewBuilderDialog
          profile={activeRulesProfile}
          savedRaces={savedCustomRaces}
          savedClasses={savedCustomClasses}
          onSave={saveGuidedHomebrew}
          onClose={() => setDialog(null)}
        />
      )}
      {dialog === "statAllocate" && activeRulesProfile && progression.statPointsAvailable > 0 && (
        <StatAllocationDialog
          sheet={currentSheet()}
          available={progression.statPointsAvailable}
          onConfirm={(allocation) => confirmStatAllocation(allocation, false)}
          onClose={() => setDialog(null)}
        />
      )}
      {dialog === "statAllocateRequired" && activeRulesProfile && progression.statPointsAvailable > 0 && (
        <StatAllocationDialog
          sheet={currentSheet()}
          available={progression.statPointsAvailable}
          forced
          onConfirm={(allocation) => confirmStatAllocation(allocation, true)}
        />
      )}
      {dialog === "descendFloor" && activeRulesProfile && (
        <DescendFloorDialog
          sheet={currentSheet()}
          onConfirm={confirmDescend}
          onClose={() => setDialog(null)}
        />
      )}
      {dialog === "floorResult" && floorResult && (
        <ParchmentDialog title={`Floor ${floorResult.from} Advancement`} medium onClose={() => setDialog(null)}>
          <div className="space-y-2">
            <p className="font-fell text-[13px] text-[#24180f]">
              Descended to Floor {floorResult.to}. Floor-end Skill Advancement checks:
            </p>
            {floorResult.rolls.map((roll) => (
              <div key={roll.id} className="border border-[var(--rule)] px-3 py-2 font-fell text-[12px] text-[#24180f]">
                <strong>{roll.name}</strong> — d20: {roll.die} vs Rank {roll.rank}
                {" — "}{roll.success ? `SUCCESS → Rank ${roll.nextRank}` : "No increase"}
              </div>
            ))}
            <div className="flex justify-end pt-2">
              <button type="button" className="ink-box px-3 py-2 font-fell-sc text-[13px] font-bold text-[#24180f]" onClick={() => setDialog(null)}>
                Continue
              </button>
            </div>
          </div>
        </ParchmentDialog>
      )}
      {dialog === "raceAdvance" && activeRulesProfile && (
        <RaceAdvancementDialog
          catalog={qualifiedRaceCatalog}
          profile={activeRulesProfile}
          sheet={currentSheet()}
          floor={Math.max(3, Number(info?.floor) || 3)}
          onConfirm={confirmThirdFloorRace}
          onClose={() => setDialog(null)}
        />
      )}
      {dialog === "classAdvance" && activeRulesProfile && (
        <ClassAdvancementDialog
          mode="thirdFloor"
          catalog={qualifiedClassCatalog}
          profile={activeRulesProfile}
          sheet={currentSheet()}
          floor={Math.max(3, Number(info?.floor) || 3)}
          seed={currentId ?? name ?? "crawler"}
          onConfirm={confirmThirdFloorClass}
          onClose={() => setDialog(null)}
        />
      )}
      {dialog === "characterActor" && activeRulesProfile && (
        <ClassAdvancementDialog
          mode="characterActor"
          catalog={classCatalogWithCustom}
          profile={activeRulesProfile}
          sheet={currentSheet()}
          floor={Math.max(3, Number(info?.floor) || 3)}
          seed={currentId ?? name ?? "crawler"}
          onConfirm={confirmCharacterActorClass}
        />
      )}
      {dialog === "print" && (
        <PrintSheetDialog
          sheet={currentSheet()}
          statMods={dccStatMods(profile, rulesetData, attrs)}
          characterId={currentId}
          onClose={() => setDialog(null)}
        />
      )}
      {dialog === "new" && (
        <CharacterCreatorDialog
          onClose={() => setDialog(null)}
          onCreatePregen={createFromPregen}
          onCreateWizard={createFromWizard}
        />
      )}
      {/* Rulebooks from the sheet-top strip — the SAME Rulebook Library the
          Character Creator opens (same component, same records). CREATE
          CHARACTER from a READY rulebook here hands off to the existing
          Character Creator entry screen; the library closes first. */}
      {dialog === "rulebooks" && (
        <ParchmentDialog title="Rulebooks" large onClose={() => setDialog(null)}>
          <RulebookLibrary
            builtins={builtinProfiles}
            onBack={() => setDialog(null)}
            onStartCreation={() => setDialog("new")}
          />
        </ParchmentDialog>
      )}
      {/* Pigments of Poor Decisions — LIVE-PREVIEW flyout (no backdrop):
          the sheet stays visible while pigments and the Dungeon/Tome
          appearance switch instantly on selection. Nothing closes after
          a selection; DONE dismisses. Both choices save with the
          character (customization field) and persist on reload. */}
      {dialog === "pigments" && (
        <PigmentsFlyout
          value={pigment.key}
          customHex={pigment.key === "custom" ? pigment.hex ?? "" : ""}
          appearance={appearance}
          onSelect={(key, hex) =>
            setCustomization((c) => ({ ...c, pigment: key, ...(key === "custom" && hex ? { pigmentCustom: hex } : {}) }))
          }
          onAppearance={(mode) => setCustomization((c) => ({ ...c, appearance: mode }))}
          onDone={() => setDialog(null)}
        />
      )}
      {/* Try-then-save — Save for a visitor without an account: the
          character is safe in this browser, and an account makes it
          permanent. Sign-up returns straight back to the sheet. */}
      {dialog === "saveAccount" && (
        <ParchmentDialog title="Save Your Crawler" onClose={() => setDialog(null)}>
          <div className="text-center">
            <p className="font-fell text-[16px] text-[var(--ink)]">
              Your crawler is being kept in this browser. Create a free account to save it permanently — it will be waiting right here the moment you return.
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => {
                  stashGuestDraft();
                  window.location.href = "/register?returnTo=" + encodeURIComponent("/character");
                }}
                className="nameplate px-4 py-2 font-display text-[16px] font-bold text-[#f0e2c8]"
              >
                Sign Up
              </button>
              <button
                type="button"
                onClick={() => {
                  stashGuestDraft();
                  window.location.href = "/login?returnTo=" + encodeURIComponent("/character");
                }}
                className="ink-box px-4 py-2 text-[16px] text-[#24180f]"
              >
                Log In
              </button>
              <button
                type="button"
                onClick={() => setDialog(null)}
                className="ink-box px-4 py-2 text-[16px] text-[#24180f]"
              >
                Keep Playing
              </button>
            </div>
          </div>
        </ParchmentDialog>
      )}
      {dialog === "load" && (
        <LoadDialog
          activeId={currentId}
          onLoad={loadCharacter}
          onCreateNew={() => setDialog("new")}
          onDeleted={handleDeleted}
          onClose={() => setDialog(null)}
        />
      )}
      {dialog === "unsaved" && (
        <UnsavedDialog
          characterName={name}
          saving={saveState === "saving"}
          onSave={() => resolveUnsaved("save")}
          onDiscard={() => resolveUnsaved("discard")}
          onClose={() => resolveUnsaved("cancel")}
        />
      )}
      {dialog === "portrait" && (
        <ParchmentDialog title="Portrait" medium onClose={() => setDialog(null)}>
          {portraitBlock}
        </ParchmentDialog>
      )}
      {dialog === "storage" && (
        <ParchmentDialog title="Dimensional Storage" large onClose={() => setDialog(null)}>
          {storageBlock}
        </ParchmentDialog>
      )}
      {dialog === "crafting" && (
        <ParchmentDialog title="Crafting" large onClose={() => setDialog(null)}>
          {craftingBlock}
        </ParchmentDialog>
      )}
      {dialog === "hotbar" && (
        <ParchmentDialog title="Hotlist" large onClose={() => setDialog(null)}>
          {hotbarBlock}
        </ParchmentDialog>
      )}
      {/* The Vault — the pouch's contents: editable currency from the
          active Rules Profile plus the canonical Inventory items. MANAGE
          opens the SAME restock dialog the Hotbar potion popup uses. */}
      {dialog === "vault" && (
        <VaultDialog
          currency={currency}
          currencies={profileCurrencies}
          onSave={saveVault}
          onClose={() => setDialog(null)}
        />
      )}
      {/* Restock / Manage — opened from the Hotbar potion popup; edits the
          referenced canonical Inventory row in place (never a duplicate),
          and the hotbar/popup quantity updates automatically on save. */}
      {manageInv !== null && inventory[manageInv] && (
        <InventoryItemDialog
          item={inventory[manageInv]}
          onSave={(row) => saveInventoryItem(manageInv, row)}
          onClose={() => setManageInv(null)}
        />
      )}
    </>
  );
}