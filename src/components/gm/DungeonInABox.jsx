import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";

const panel = "rounded-xl border border-[#6d4b26]/70 bg-[#17110d]/95 p-4 shadow-xl";
const input = "w-full rounded-md border border-[#7b5a31] bg-[#0f0c09] px-3 py-2 text-[#f2e5cb] outline-none focus:border-[#d4a055]";
const button = "rounded-md border border-[#b47a36] bg-[#2b1c10] px-3 py-2 font-fell-sc text-xs font-bold text-[#f2d49b] hover:bg-[#3a2818] disabled:opacity-50";
const dangerButton = "rounded-md border border-[#7e3f32] bg-[#2c1310] px-3 py-2 font-fell-sc text-xs font-bold text-[#efb5aa] hover:bg-[#3a1714]";

const TABS = [
  ["setup", "Floor Setup"],
  ["library", "Saved Floors"],
  ["rooms", "Rooms"],
  ["layout", "Layout"],
  ["mobs", "Mobs"],
  ["boss", "Boss"],
  ["traps", "Traps"],
  ["loot", "Loot"],
  ["npcs", "NPCs & Events"],
  ["rules", "Floor Rules"],
  ["run", "Run Floor"],
  ["summary", "Summary"],
];

const THEMES = {
  "Ruined Citadel": {
    rooms: ["Collapsed Hall", "Broken Barracks", "Watch Chamber", "Old Armory", "Siege Gallery", "Cracked Throne Room"],
    mobs: ["Ash Guard", "Rubble Stalker", "Rustbound Brute", "Citadel Archer", "Wall-Crawler"],
    hazards: ["Falling masonry", "Unstable battlement", "Dust-choked passage", "Snapping siege cable"],
    loot: ["Sealed officer cache", "Forgotten war chest", "Jeweled command badge", "Masterwork salvage"],
    rules: ["Every loud fight risks drawing reinforcements.", "Damaged architecture can be turned into cover or hazards."],
  },
  "Fungal Depths": {
    rooms: ["Spore Garden", "Mushroom Vault", "Bioluminescent Grotto", "Rot Pool", "Root Bridge", "Bloom Chamber"],
    mobs: ["Sporeling Pack", "Mycelial Hunter", "Rotcap Brute", "Glow Mite Swarm", "Fungal Sentinel"],
    hazards: ["Hallucinogenic spores", "Slippery rot", "Bursting puffball field", "Caustic slime"],
    loot: ["Rare alchemical spores", "Luminescent crystal growth", "Preserved explorer pack", "Living fungal charm"],
    rules: ["Bright light changes the behavior of some creatures.", "Lingering in one room allows spores to thicken."],
  },
  "Arcane Foundry": {
    rooms: ["Rune Press", "Cooling Hall", "Mana Reservoir", "Assembly Bay", "Glyph Conveyor", "Core Furnace"],
    mobs: ["Rune Drone", "Arcane Loader", "Spark Hound", "Foundry Warden", "Mana Leech"],
    hazards: ["Runaway conveyor", "Mana surge", "Overheated floor plates", "Unstable rune lattice"],
    loot: ["Charged component", "Experimental focus", "Arcane scrap bundle", "Sealed artificer case"],
    rules: ["Arcane effects may overload nearby machinery.", "Controls in one room can alter hazards in another."],
  },
  "Sunken Temple": {
    rooms: ["Flooded Nave", "Drowned Shrine", "Tidal Stair", "Barnacle Hall", "Reliquary", "Deep Sanctum"],
    mobs: ["Drowned Guardian", "Reef Stalker", "Temple Eel", "Salt Wraith", "Barnacle Brute"],
    hazards: ["Sudden flood surge", "Collapsing soaked floor", "Air pocket failure", "Razor coral"],
    loot: ["Pearled reliquary", "Ancient tide idol", "Waterproof priest cache", "Coral-inlaid weapon"],
    rules: ["Water level changes as the floor progresses.", "Some routes open only when another chamber is drained."],
  },
  "Infernal Carnival": {
    rooms: ["Prize Alley", "Mirror Tent", "Burning Midway", "Rigged Arcade", "Beast Ring", "Grand Big Top"],
    mobs: ["Ticket Ripper", "Laughing Brute", "Mirror Double", "Carnival Hound", "Ash Clown"],
    hazards: ["Rigged game trap", "Exploding confetti charge", "Distorting mirror maze", "Runaway ride"],
    loot: ["Cursed prize box", "Golden admission token", "Ringmaster strongbox", "Impossible stuffed animal"],
    rules: ["Cheating the games creates advantages later.", "The floor rewards spectacle as much as efficiency."],
  },
};

const OBJECTIVES = [
  "Reach the boss chamber and break the floor seal.",
  "Rescue a trapped survivor before the floor timer expires.",
  "Recover three keys from different wings before confronting the boss.",
  "Shut down the floor's power source and escape.",
  "Find the hidden exit while surviving escalating encounters.",
];

const TONES = ["Tense", "Chaotic", "Horror", "Heroic", "Darkly Funny", "Puzzle-Heavy"];

const DIFFICULTY_SCALE = {
  Standard: 1,
  Hard: 1.25,
  Brutal: 1.5,
  "Near-Death": 1.8,
};

const SCOPE_PRESETS = {
  "Burrow / Lair": {
    count: 6, start: "Burrow Entrance", boss: "Heart Chamber",
    locations: ["Nesting Chamber", "Feeding Pit", "Collapsed Tunnel", "Bone Den", "Brood Hollow", "Hidden Vent", "Hunter's Run"],
  },
  "Dungeon Floor": {
    count: 8, start: "Floor Entry", boss: "Boss Chamber",
    locations: ["Guard Room", "Crossroads", "Vault", "Shrine", "Workshop", "Prison", "Gallery", "Hidden Chamber"],
  },
  "Mega-Dungeon Level": {
    count: 14, start: "Level Gate", boss: "Level Core",
    locations: ["Forgotten Wing", "Transit Hall", "Faction Hold", "Deep Vault", "Collapsed Sector", "Ancient Machine Room", "Sanctum"],
  },
  "Neighborhood": {
    count: 10, start: "Neighborhood Approach", boss: "Local Stronghold",
    locations: ["Market Row", "Tenement Block", "Back Alley", "Corner Shrine", "Workshop Lane", "Public Square", "Warehouse", "Rooftop Route"],
  },
  "Borough / District": {
    count: 14, start: "District Boundary", boss: "Seat of Power",
    locations: ["Ward Gate", "Canal Junction", "Civic Plaza", "Industrial Block", "Temple Quarter", "Barracks", "Market District", "Undercity Access"],
  },
  "City": {
    count: 18, start: "City Approach", boss: "City Center / Final Stronghold",
    locations: ["Grand Market", "Residential Ward", "Docks", "Old Town", "Government Quarter", "Arena", "Temple District", "Factory Ward", "Sewer Nexus", "Transit Hub"],
  },
  "Region / Wilderness": {
    count: 16, start: "Regional Entry", boss: "Regional Threat Lair",
    locations: ["Crossroads", "Ruined Hamlet", "River Crossing", "Watchtower", "Cave System", "Forest Clearing", "Old Fort", "Mountain Pass", "Hidden Camp"],
  },
};

const BOSS_TYPES = [
  "Random / Surprise",
  "Solo / Apex",
  "Brute / Tank",
  "Skirmisher / Duelist",
  "Artillery / Ranged",
  "Controller / Battlefield",
  "Summoner / Minion Master",
  "Swarm / Hive Mind",
  "Duo / Twins",
  "Trio",
  "Council / Multiple Leaders",
  "Puzzle / Gimmick",
  "Environmental / Hazard Boss",
  "Siege Engine / Vehicle",
  "Chase / Pursuit",
  "Social / Negotiation",
  "Possession / Hidden Host",
  "Transforming / Multi-Phase",
  "Raid / Set-Piece",
  "Endurance / Gauntlet",
  "Nemesis / Rival",
  "Living Dungeon / Location",
  "Secret / Optional",
  "Final / Capstone",
  "Assassin / Stalker",
  "Commander / Support",
  "Mirror / Copycat",
  "Trapmaster / Architect",
  "Army / Warlord",
  "Colossus / Kaiju",
  "Timed Survival",
  "Objective Defense",
  "Resource Drain / Attrition",
  "Multi-Arena / Moving Fight",
  "Unkillable / Escape Objective",
  "Mythic / Reality-Bending",
];

const BOSS_HINTS = {
  "Solo / Apex": "One centerpiece enemy with strong action economy, movement, and phase changes.",
  "Duo / Twins": "Two bosses whose abilities interact; defeating one changes the other.",
  "Council / Multiple Leaders": "Several distinct leaders with different jobs and shared objectives.",
  "Swarm / Hive Mind": "Many bodies acting as one encounter; damage can reduce capability instead of only HP.",
  "Puzzle / Gimmick": "The party must understand and disrupt a mechanic, not simply race HP to zero.",
  "Environmental / Hazard Boss": "The arena or disaster is the boss; objectives and survival matter more than a creature stat block.",
  "Siege Engine / Vehicle": "Break components, board it, disable systems, or attack weak points.",
  "Chase / Pursuit": "Position, distance, obstacles, and escape/catch conditions drive the fight.",
  "Social / Negotiation": "Victory can come through leverage, persuasion, bargains, exposure, or changing loyalties.",
  "Transforming / Multi-Phase": "The boss changes form, rules, arena, or priorities between phases.",
  "Raid / Set-Piece": "Large encounter with simultaneous objectives, adds, hazards, and assigned party jobs.",
  "Living Dungeon / Location": "The place itself is alive; rooms, organs, nodes, or systems function as boss parts.",
  "Unkillable / Escape Objective": "The boss cannot be defeated normally; success is surviving, escaping, sealing, or delaying it.",
  "Mythic / Reality-Bending": "Rules of the encounter change as reality, time, terrain, or causality shifts.",
};

const pick = (items) => items[Math.floor(Math.random() * items.length)];
const makeId = () => (globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`);

function arrangeRooms(rooms, style = "Branching") {
  const count = Math.max(1, rooms.length);
  return rooms.map((room, index) => {
    let mapX = 50;
    let mapY = 50;
    if (style === "Linear") {
      mapX = 8 + (84 * index) / Math.max(1, count - 1);
      mapY = 50;
    } else if (style === "Hub & Spoke") {
      if (index === 0) {
        mapX = 50; mapY = 50;
      } else {
        const angle = ((index - 1) / Math.max(1, count - 1)) * Math.PI * 2;
        mapX = 50 + Math.cos(angle) * 38;
        mapY = 50 + Math.sin(angle) * 36;
      }
    } else if (style === "Looping") {
      const angle = (index / count) * Math.PI * 2 - Math.PI / 2;
      mapX = 50 + Math.cos(angle) * 39;
      mapY = 50 + Math.sin(angle) * 37;
    } else {
      const cols = style === "Open Zone" ? 4 : 3;
      const row = Math.floor(index / cols);
      const col = index % cols;
      mapX = 16 + col * (68 / Math.max(1, cols - 1));
      mapY = 14 + row * 18 + (style === "Branching" && row % 2 ? 7 : 0);
      mapY = Math.min(90, mapY);
    }
    return { ...room, mapX: Math.round(mapX), mapY: Math.round(mapY) };
  });
}

function normalizeFloor(source, campaignName = "") {
  const base = defaultFloor(campaignName);
  const next = { ...base, ...(source || {}) };
  next.boss = { ...base.boss, ...(source?.boss || {}) };
  next.rooms = (source?.rooms || []).map((room) => ({
    mapX: 50, mapY: 50, ...room,
  }));
  next.mobs = source?.mobs || [];
  next.traps = source?.traps || [];
  next.loot = source?.loot || [];
  next.npcs = source?.npcs || [];
  next.rules = source?.rules || [];
  return next;
}

const defaultFloor = (campaignName = "") => ({
  version: 2,
  name: campaignName ? `${campaignName} — New Floor` : "New Floor",
  floorNumber: 1,
  scope: "Dungeon Floor",
  theme: "Ruined Citadel",
  objective: OBJECTIVES[0],
  tone: "Tense",
  partySize: 4,
  partyLevel: 1,
  difficulty: "Standard",
  roomCount: 8,
  timer: "",
  notes: "",
  layoutStyle: "Branching",
  layoutNotes: "",
  rooms: [],
  mobs: [],
  boss: {
    name: "",
    type: "Solo / Apex",
    role: "Primary threat",
    maxHp: 0,
    currentHp: 0,
    evade: "",
    dr: "",
    attacks: "",
    phases: ["Opening phase", "Escalation phase", "Final phase"],
    minions: "",
    arena: "",
    enrage: "",
    victoryCondition: "Defeat the boss or complete the encounter objective.",
    alternateWin: "",
    defeatConsequence: "",
    weakness: "",
    tactics: "",
    reward: "",
    defeated: false,
  },
  traps: [],
  loot: [],
  npcs: [],
  rules: [],
  generatedAt: "",
});

function Field({ label, value, onChange, type = "text", min, max }) {
  return (
    <label className="grid gap-1">
      <span className="font-fell-sc text-[11px] text-[#d4a055]">{label}</span>
      <input
        className={input}
        type={type}
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(type === "number" ? Number(e.target.value) : e.target.value)}
      />
    </label>
  );
}

function TextArea({ label, value, onChange, rows = 3 }) {
  return (
    <label className="grid gap-1">
      <span className="font-fell-sc text-[11px] text-[#d4a055]">{label}</span>
      <textarea
        className={input}
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

function Card({ children, className = "" }) {
  return <div className={`rounded-lg border border-[#4f3922] bg-black/20 p-3 ${className}`}>{children}</div>;
}

export default function DungeonInABox({ campaignId, campaignName, characters = [] }) {
  const [floor, setFloor] = useState(() => defaultFloor(campaignName));
  const [activeTab, setActiveTab] = useState("setup");
  const [status, setStatus] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const [projects, setProjects] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [currentProjectId, setCurrentProjectId] = useState("");
  const [cloudBusy, setCloudBusy] = useState(false);
  const [pushDraft, setPushDraft] = useState({
    kind: "announcement",
    targetId: "",
    title: "",
    detail: "",
    amount: 5,
  });

  const storageKey = campaignId ? `gds_dungeon_in_a_box_${campaignId}` : "";

  useEffect(() => {
    if (!storageKey || !campaignId) return;
    let alive = true;
    setHydrated(false);
    setCurrentProjectId("");
    let localDraft = defaultFloor(campaignName);
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) localDraft = normalizeFloor(JSON.parse(saved), campaignName);
    } catch {}
    setFloor(localDraft);

    (async () => {
      try {
        const [savedFloors, savedTemplates] = await Promise.all([
          base44.campaigns.floorProjects(campaignId),
          base44.campaigns.floorTemplates(),
        ]);
        if (!alive) return;
        setProjects(savedFloors || []);
        setTemplates(savedTemplates || []);
        if (savedFloors?.[0]) {
          setCurrentProjectId(savedFloors[0].id);
          setFloor(normalizeFloor(savedFloors[0], campaignName));
          setStatus("Latest cloud floor loaded.");
        }
      } catch (err) {
        if (alive) setStatus(err?.message || "Cloud floor library unavailable; local draft is still safe.");
      } finally {
        if (alive) setHydrated(true);
      }
    })();

    return () => { alive = false; };
  }, [storageKey, campaignId, campaignName]);

  useEffect(() => {
    if (!storageKey || !hydrated) return;
    localStorage.setItem(storageKey, JSON.stringify(floor));
  }, [floor, hydrated, storageKey]);

  useEffect(() => {
    if (!hydrated || !campaignId || !floor.rooms.length) return;
    const timer = window.setTimeout(async () => {
      try {
        const saved = await base44.campaigns.saveFloorProject(campaignId, {
          ...floor,
          id: currentProjectId || undefined,
        });
        if (saved?.id && !currentProjectId) {
          setCurrentProjectId(saved.id);
          const savedFloors = await base44.campaigns.floorProjects(campaignId);
          setProjects(savedFloors || []);
        }
      } catch {
        // Local autosave remains the fallback if cloud sync is temporarily unavailable.
      }
    }, 1200);
    return () => window.clearTimeout(timer);
  }, [floor, hydrated, campaignId, currentProjectId]);

  const updateFloor = (patch) => setFloor((current) => ({ ...current, ...patch }));

  const refreshLibrary = async () => {
    const [savedFloors, savedTemplates] = await Promise.all([
      base44.campaigns.floorProjects(campaignId),
      base44.campaigns.floorTemplates(),
    ]);
    setProjects(savedFloors || []);
    setTemplates(savedTemplates || []);
  };

  const saveCloud = async () => {
    if (!campaignId || cloudBusy) return;
    setCloudBusy(true);
    setStatus("Saving floor to cloud…");
    try {
      const saved = await base44.campaigns.saveFloorProject(campaignId, {
        ...floor,
        id: currentProjectId || undefined,
      });
      if (saved?.id) setCurrentProjectId(saved.id);
      await refreshLibrary();
      setStatus("Floor saved to Ginger Dragon cloud.");
    } catch (err) {
      setStatus(err?.message || "Could not save floor to cloud.");
    } finally {
      setCloudBusy(false);
    }
  };

  const saveTemplate = async () => {
    if (cloudBusy) return;
    setCloudBusy(true);
    setStatus("Saving reusable template…");
    try {
      await base44.campaigns.saveFloorTemplate({
        ...floor,
        name: floor.name + " — Template",
      });
      await refreshLibrary();
      setStatus("Reusable template saved. It can be loaded into any GM campaign.");
    } catch (err) {
      setStatus(err?.message || "Could not save template.");
    } finally {
      setCloudBusy(false);
    }
  };

  const loadProject = (project, duplicate = false) => {
    const next = normalizeFloor(project, campaignName);
    if (duplicate) {
      next.name = "Copy of " + next.name;
      setCurrentProjectId("");
    } else {
      setCurrentProjectId(project.project_type === "floor" ? project.id : "");
    }
    setFloor(next);
    setActiveTab("setup");
    setStatus(project.project_type === "template" ? "Template loaded as a new floor." : "Cloud floor loaded.");
  };

  const deleteProject = async (project) => {
    if (!project?.id || cloudBusy) return;
    setCloudBusy(true);
    try {
      await base44.campaigns.deleteFloorProject(project.id);
      if (currentProjectId === project.id) {
        setCurrentProjectId("");
        setFloor(defaultFloor(campaignName));
      }
      await refreshLibrary();
      setStatus("Saved floor removed.");
    } catch (err) {
      setStatus(err?.message || "Could not remove saved floor.");
    } finally {
      setCloudBusy(false);
    }
  };

  const generateFloor = () => {
    const themeName = floor.theme || "Ruined Citadel";
    const theme = THEMES[themeName] || THEMES["Ruined Citadel"];
    const scopePreset = SCOPE_PRESETS[floor.scope] || SCOPE_PRESETS["Dungeon Floor"];
    const roomCount = Math.max(4, Math.min(36, Number(floor.roomCount) || scopePreset.count || 8));
    const partySize = Math.max(1, Number(floor.partySize) || 4);
    const partyLevel = Math.max(1, Number(floor.partyLevel) || 1);
    const multiplier = DIFFICULTY_SCALE[floor.difficulty] || 1;
    const baseHp = Math.max(5, Math.round((partyLevel * 6 + partySize * 3) * multiplier));

    const rooms = Array.from({ length: roomCount }, (_, index) => {
      const isBoss = index === roomCount - 1;
      const isStart = index === 0;
      return {
        id: makeId(),
        name: isStart ? scopePreset.start : isBoss ? scopePreset.boss : pick([...theme.rooms, ...scopePreset.locations]),
        type: isStart ? "Entry" : isBoss ? "Boss" : pick(["Combat", "Exploration", "Hazard", "Puzzle", "Social", "Stronghold", "Mixed"]),
        encounter: isStart ? "Arrival, orientation, and the first clue." : isBoss ? "Final confrontation." : pick(theme.mobs),
        feature: isBoss ? pick(theme.hazards) : pick([...theme.hazards, "Useful cover", "Hidden route", "Interactive machinery", "Suspicious silence"]),
        notes: "",
        cleared: false,
      };
    });

    const mobGroups = Array.from({ length: Math.max(3, Math.ceil(roomCount / 2)) }, (_, index) => {
      const quantity = Math.max(1, Math.round((partySize * multiplier) / (index % 3 === 0 ? 2 : 1.5)));
      return {
        id: makeId(),
        name: pick(theme.mobs),
        role: pick(["Skirmisher", "Brute", "Ranged", "Controller", "Ambusher"]),
        quantity,
        hpEach: Math.max(4, Math.round(baseHp * pick([0.35, 0.45, 0.55]))),
        behavior: pick(["Rush the weakest target", "Hold terrain and force movement", "Attack from cover", "Split the party", "Protect a tougher ally"]),
        spawn: pick(["Starts in the room", "Arrives after the first round", "Hidden until triggered", "Patrols between two rooms"]),
        notes: "",
        defeated: false,
      };
    });

    const maxBossHp = Math.max(20, Math.round(baseHp * (2.4 + partySize * 0.15)));

    const traps = Array.from({ length: Math.max(2, Math.floor(roomCount / 3)) }, () => ({
      id: makeId(),
      name: pick(theme.hazards),
      trigger: pick(["Entering the marked area", "Opening a container", "Crossing the room midpoint", "Failing a puzzle step", "Making too much noise"]),
      detect: pick(["Obvious warning signs", "Moderate inspection", "Hard to notice", "Only visible from another angle"]),
      consequence: pick(["Damage and forced movement", "Alarm and reinforcements", "Temporary condition", "Route becomes blocked", "Resource drain"]),
      bypass: pick(["Careful movement", "Disable mechanism", "Use the environment", "Alternate route"]),
      disarmed: false,
    }));

    const loot = Array.from({ length: Math.max(3, Math.floor(roomCount / 2)) }, (_, index) => ({
      id: makeId(),
      name: index === 0 ? pick(theme.loot) : pick([...theme.loot, "Consumable cache", "Odd trophy", "Useful floor key"]),
      location: pick(["After a hard encounter", "Hidden side room", "Boss chamber", "Hazard reward", "NPC possession"]),
      value: pick(["Minor", "Useful", "Major", "Signature"]),
      notes: "",
      claimed: false,
    }));

    const npcs = [
      {
        id: makeId(),
        name: "Stranded Survivor",
        role: "Potential ally",
        motivation: "Get off the floor alive.",
        secret: "Knows one safe route and one dangerous shortcut.",
        event: "Appears after the party clears an early room.",
        resolved: false,
      },
      {
        id: makeId(),
        name: "Floor Rival",
        role: "Complication",
        motivation: "Reach the objective before the party.",
        secret: "Will bargain if cornered.",
        event: "Interferes near the midpoint.",
        resolved: false,
      },
    ];

    const bossName = `${themeName} Overlord`;
    const bossType = floor.boss?.type && floor.boss.type !== "Random / Surprise"
      ? floor.boss.type
      : pick(BOSS_TYPES.filter((type) => type !== "Random / Surprise"));
    const boss = {
      name: bossName,
      type: bossType,
      role: bossType + " encounter",
      maxHp: maxBossHp,
      currentHp: maxBossHp,
      evade: Math.max(8, Math.round(8 + partyLevel * 0.7 + multiplier * 2)),
      dr: Math.max(0, Math.round(partyLevel / 3)),
      attacks: "One reliable attack, one heavy telegraphed attack, and one movement/control ability.",
      phases: [
        "Opening: tests the party and uses the room.",
        "Escalation: changes the problem at roughly 60% progress.",
        "Final: raises the stakes at roughly 25% progress.",
      ],
      minions: bossType.includes("Summoner") || bossType.includes("Commander") || bossType.includes("Raid") ? "Uses supporting creatures or reinforcements with distinct battlefield jobs." : "",
      arena: "The arena contains at least one interactive feature that can help or hurt either side.",
      enrage: "If the party stalls, escalate pressure with reinforcements, hazards, lost cover, or a stronger move.",
      victoryCondition: bossType.includes("Social") ? "Win the confrontation by changing the boss's decision, leverage, or support." : bossType.includes("Unkillable") ? "Survive, escape, seal, delay, or complete the objective instead of reducing HP to zero." : "Defeat the boss or complete the encounter objective.",
      alternateWin: "A clue, environmental interaction, bargain, or secondary objective can create a non-damage path to victory.",
      defeatConsequence: "If the party fails, advance the floor threat instead of ending the entire campaign unless the GM wants a lethal result.",
      weakness: "A clue or interaction elsewhere on the floor can suppress one boss advantage.",
      tactics: "Move the boss, use terrain, and change behavior between phases rather than only increasing damage.",
      reward: pick(theme.loot),
      defeated: false,
    };

    const layoutStyle = pick(["Linear", "Branching", "Hub & Spoke", "Looping", "Maze-Like"]);
    setFloor((current) => ({
      ...current,
      layoutStyle,
      layoutNotes: "Use room order as the default path, then add shortcuts, locked branches, or alternate routes as needed.",
      rooms: arrangeRooms(rooms, layoutStyle),
      mobs: mobGroups,
      traps,
      loot,
      npcs,
      boss,
      rules: [...theme.rules],
      generatedAt: new Date().toISOString(),
    }));
    setActiveTab("rooms");
    setStatus("Floor generated from Ginger Dragon tables. Everything is editable and autosaved.");
  };

  const clearFloor = () => {
    setCurrentProjectId("");
    setFloor(defaultFloor(campaignName));
    setActiveTab("setup");
    setStatus("Started a fresh floor.");
  };

  const addRoom = () => {
    setFloor((current) => ({
      ...current,
      rooms: [...current.rooms, { id: makeId(), name: "New Room", type: "Mixed", encounter: "", feature: "", notes: "", cleared: false, mapX: 50, mapY: 50 }],
    }));
  };

  const addMob = () => {
    setFloor((current) => ({
      ...current,
      mobs: [...current.mobs, { id: makeId(), name: "New Mob Group", role: "Skirmisher", quantity: 1, hpEach: 10, behavior: "", spawn: "", notes: "", defeated: false }],
    }));
  };

  const addTrap = () => {
    setFloor((current) => ({
      ...current,
      traps: [...current.traps, { id: makeId(), name: "New Hazard", trigger: "", detect: "", consequence: "", bypass: "", disarmed: false }],
    }));
  };

  const addLoot = () => {
    setFloor((current) => ({
      ...current,
      loot: [...current.loot, { id: makeId(), name: "New Reward", location: "", value: "Useful", notes: "", claimed: false }],
    }));
  };

  const addNpc = () => {
    setFloor((current) => ({
      ...current,
      npcs: [...current.npcs, { id: makeId(), name: "New NPC", role: "", motivation: "", secret: "", event: "", resolved: false }],
    }));
  };

  const autoArrange = () => {
    setFloor((current) => ({
      ...current,
      rooms: arrangeRooms(current.rooms, current.layoutStyle),
    }));
    setStatus("Locations arranged on the map.");
  };

  const sendPush = async () => {
    if (cloudBusy) return;
    const kind = pushDraft.kind;
    const targetId = pushDraft.targetId;
    if (kind !== "announcement" && !targetId) {
      setStatus("Choose a crawler for that push.");
      return;
    }
    setCloudBusy(true);
    setStatus("Sending GM push…");
    try {
      let title = pushDraft.title.trim();
      let detail = pushDraft.detail.trim();
      const amount = Math.max(0, Number(pushDraft.amount) || 0);
      let eventType = "gm_effect";
      let targetIsGuest = false;

      if (kind === "announcement") {
        title = title || "GM Announcement";
        detail = detail || "The GM sent a campaign update.";
        eventType = "gm_announcement";
      } else {
        const liveCharacters = await base44.campaigns.characters(campaignId);
        const character = (liveCharacters || []).find((row) => row.id === targetId);
        if (!character) throw new Error("That crawler is no longer assigned to this campaign.");
        targetIsGuest = Boolean(character.is_guest);
        const characterData = { ...character };
        delete characterData.id;
        delete characterData.created_date;
        delete characterData.updated_date;
        delete characterData.created_by_id;
        delete characterData.owner_user_id;
        delete characterData.campaign_user_id;
        delete characterData.is_guest;

        if (kind === "loot") {
          title = title || "GM Reward";
          detail = detail || "Reward added to inventory.";
          const inventory = Array.isArray(characterData.inventory) ? [...characterData.inventory] : [];
          inventory.push({ item: title, qty: "1", notes: detail });
          await base44.campaigns.gmUpdateCharacter(campaignId, targetId, { ...characterData, inventory }, true);
          eventType = "gm_reward";
        } else if (kind === "damage") {
          const health = Math.max(0, Number(characterData.health || 0) - amount);
          title = title || `${amount} damage`;
          detail = detail || `Health changed to ${health}.`;
          await base44.campaigns.gmUpdateCharacter(campaignId, targetId, { ...characterData, health }, true);
        } else if (kind === "healing") {
          const maxHealth = Math.max(0, Number(characterData.max_health || characterData.health || 0));
          const health = Math.min(maxHealth, Number(characterData.health || 0) + amount);
          title = title || `${amount} healing`;
          detail = detail || `Health changed to ${health}.`;
          await base44.campaigns.gmUpdateCharacter(campaignId, targetId, { ...characterData, health }, true);
        } else if (kind === "condition") {
          title = title || "GM Condition";
          detail = detail || "A GM-applied condition is active.";
          const ruleset = { ...(characterData.ruleset_data || {}) };
          const gmEffects = Array.isArray(ruleset.gmEffects) ? [...ruleset.gmEffects] : [];
          gmEffects.push({ id: makeId(), title, detail, appliedAt: new Date().toISOString(), active: true });
          ruleset.gmEffects = gmEffects;
          await base44.campaigns.gmUpdateCharacter(campaignId, targetId, { ...characterData, ruleset_data: ruleset }, true);
        }
      }

      if (!(kind !== "announcement" && targetIsGuest)) {
        await base44.campaigns.pushEvent(
          campaignId,
          eventType,
          { kind, title, detail, amount, floorName: floor.name, pushedAt: new Date().toISOString() },
          kind === "announcement" ? null : targetId
        );
      }
      setPushDraft((draft) => ({ ...draft, title: "", detail: "" }));
      setStatus(
        kind === "announcement"
          ? "Announcement pushed to the campaign."
          : targetIsGuest
            ? "Guest crawler updated. There is no player account to alert yet."
            : "Crawler updated and player alert pushed."
      );
    } catch (err) {
      setStatus(err?.message || "Could not push that GM action.");
    } finally {
      setCloudBusy(false);
    }
  };

  const summary = useMemo(() => {
    const lines = [
      `${floor.name} (Floor ${floor.floorNumber})`,
      `Scope: ${floor.scope} | Theme: ${floor.theme} | Tone: ${floor.tone} | Difficulty: ${floor.difficulty}`,
      `Party: ${floor.partySize} crawler(s), level ${floor.partyLevel}`,
      `Objective: ${floor.objective || "Not set"}`,
      `Layout: ${floor.layoutStyle}${floor.layoutNotes ? ` — ${floor.layoutNotes}` : ""}`,
      floor.timer ? `Timer / Pressure: ${floor.timer}` : "",
      "",
      "ROOMS",
      ...floor.rooms.map((room, index) => `${index + 1}. ${room.name} [${room.type}] — ${room.encounter || "No encounter"}${room.feature ? ` | ${room.feature}` : ""}`),
      "",
      "MOB GROUPS",
      ...floor.mobs.map((mob) => `• ${mob.name} x${mob.quantity} (${mob.role}) — HP ${mob.hpEach} each. ${mob.behavior || ""}`),
      "",
      "BOSS",
      floor.boss.name ? `${floor.boss.name} [${floor.boss.type}] — HP ${floor.boss.maxHp}, Evade ${floor.boss.evade}, DR ${floor.boss.dr}` : "Not configured",
      ...floor.boss.phases.map((phase, index) => `  Phase ${index + 1}: ${phase}`),
      floor.boss.victoryCondition ? `  Victory: ${floor.boss.victoryCondition}` : "",
      floor.boss.alternateWin ? `  Alternate win: ${floor.boss.alternateWin}` : "",
      floor.boss.arena ? `  Arena: ${floor.boss.arena}` : "",
      floor.boss.enrage ? `  Escalation: ${floor.boss.enrage}` : "",
      "",
      "TRAPS / HAZARDS",
      ...floor.traps.map((trap) => `• ${trap.name}: ${trap.trigger}; consequence: ${trap.consequence}`),
      "",
      "LOOT / REWARDS",
      ...floor.loot.map((item) => `• ${item.name} (${item.value}) — ${item.location}`),
      "",
      "NPCS / EVENTS",
      ...floor.npcs.map((npc) => `• ${npc.name} — ${npc.role}; ${npc.event}`),
      "",
      "FLOOR RULES",
      ...floor.rules.map((rule) => `• ${rule}`),
      floor.notes ? `\nGM NOTES\n${floor.notes}` : "",
    ];
    return lines.filter((line) => line !== null && line !== undefined).join("\n");
  }, [floor]);

  const copySummary = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      setStatus("Floor summary copied.");
    } catch {
      setStatus("Copy failed. Select the summary text manually.");
    }
  };

  const updateListItem = (key, id, patch) => {
    setFloor((current) => ({
      ...current,
      [key]: current[key].map((item) => item.id === id ? { ...item, ...patch } : item),
    }));
  };

  const removeListItem = (key, id) => {
    setFloor((current) => ({ ...current, [key]: current[key].filter((item) => item.id !== id) }));
  };

  if (!campaignId) return null;

  return (
    <section className={panel}>
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#6d4b26] pb-3">
        <div>
          <p className="font-fell-sc text-xs tracking-[0.18em] text-[#d4a055]">GINGER DRAGON GM TOOLS</p>
          <h2 className="font-display text-2xl font-bold">Dungeon in a Box</h2>
          <p className="mt-1 max-w-3xl font-fell text-sm text-[#cbb99b]">
            Build a complete playable floor, generate one from built-in tables, edit every piece, then run it from the same screen. No AI API is required.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className={button} disabled={cloudBusy} onClick={() => void saveCloud()}>☁ SAVE CLOUD</button>
          <button type="button" className={button} onClick={generateFloor}>🎲 GENERATE</button>
          <button type="button" className={dangerButton} onClick={clearFloor}>NEW</button>
        </div>
      </div>

      <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
        {TABS.map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveTab(key)}
            className={`${button} whitespace-nowrap ${activeTab === key ? "border-[#e3b664] bg-[#4a2f18] text-white" : ""}`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-3">
        {activeTab === "setup" && (
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <h3 className="font-display text-lg font-bold">Floor Identity</h3>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <Field label="Floor Name" value={floor.name} onChange={(name) => updateFloor({ name })} />
                <Field label="Floor Number" type="number" min={1} value={floor.floorNumber} onChange={(floorNumber) => updateFloor({ floorNumber })} />
                <label className="grid gap-1">
                  <span className="font-fell-sc text-[11px] text-[#d4a055]">Adventure Scale</span>
                  <select
                    className={input}
                    value={floor.scope}
                    onChange={(e) => {
                      const scope = e.target.value;
                      const preset = SCOPE_PRESETS[scope];
                      updateFloor({ scope, roomCount: preset?.count || floor.roomCount });
                    }}
                  >
                    {Object.keys(SCOPE_PRESETS).map((scope) => <option key={scope}>{scope}</option>)}
                  </select>
                </label>
                <label className="grid gap-1">
                  <span className="font-fell-sc text-[11px] text-[#d4a055]">Theme</span>
                  <select className={input} value={floor.theme} onChange={(e) => updateFloor({ theme: e.target.value })}>
                    {Object.keys(THEMES).map((theme) => <option key={theme}>{theme}</option>)}
                  </select>
                </label>
                <label className="grid gap-1">
                  <span className="font-fell-sc text-[11px] text-[#d4a055]">Tone</span>
                  <select className={input} value={floor.tone} onChange={(e) => updateFloor({ tone: e.target.value })}>
                    {TONES.map((tone) => <option key={tone}>{tone}</option>)}
                  </select>
                </label>
              </div>
              <TextArea label="Objective" value={floor.objective} onChange={(objective) => updateFloor({ objective })} />
              <TextArea label="GM Notes" value={floor.notes} onChange={(notes) => updateFloor({ notes })} />
            </Card>

            <Card>
              <h3 className="font-display text-lg font-bold">Party & Pressure</h3>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <Field label="Party Size" type="number" min={1} max={12} value={floor.partySize} onChange={(partySize) => updateFloor({ partySize })} />
                <Field label="Party Level" type="number" min={1} max={20} value={floor.partyLevel} onChange={(partyLevel) => updateFloor({ partyLevel })} />
                <Field label="Room Count" type="number" min={4} max={36} value={floor.roomCount} onChange={(roomCount) => updateFloor({ roomCount })} />
                <label className="grid gap-1">
                  <span className="font-fell-sc text-[11px] text-[#d4a055]">Difficulty</span>
                  <select className={input} value={floor.difficulty} onChange={(e) => updateFloor({ difficulty: e.target.value })}>
                    {Object.keys(DIFFICULTY_SCALE).map((difficulty) => <option key={difficulty}>{difficulty}</option>)}
                  </select>
                </label>
              </div>
              <TextArea label="Timer / Escalation Pressure" value={floor.timer} onChange={(timer) => updateFloor({ timer })} rows={2} />
              <button type="button" className={button + " mt-3 w-full"} onClick={generateFloor}>
                BUILD THIS FLOOR
              </button>
              <p className="mt-2 font-fell text-xs text-[#a9916e]">
                Generation uses Ginger Dragon's own tables and math. Active projects autosave locally and to your private GM cloud library.
              </p>
            </Card>
          </div>
        )}

        {activeTab === "library" && (
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="font-display text-lg font-bold">Campaign Floors</h3>
                  <p className="font-fell text-xs text-[#cbb99b]">Cloud-saved run state for this campaign. The most recent floor opens automatically on another device.</p>
                </div>
                <button type="button" className={button} disabled={cloudBusy} onClick={() => void saveCloud()}>SAVE NOW</button>
              </div>
              <div className="mt-3 grid gap-2">
                {projects.map((project) => (
                  <div key={project.id} className="rounded border border-[#4f3922] bg-[#0f0c09] p-3">
                    <div className="font-garamond text-lg font-bold">{project.name}</div>
                    <div className="font-fell text-xs text-[#a9916e]">{project.scope || "Dungeon Floor"} · {project.updated_at ? new Date(project.updated_at).toLocaleString() : ""}</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <button type="button" className={button} onClick={() => loadProject(project)}>LOAD</button>
                      <button type="button" className={button} onClick={() => loadProject(project, true)}>DUPLICATE</button>
                      <button type="button" className={dangerButton} disabled={cloudBusy} onClick={() => void deleteProject(project)}>DELETE</button>
                    </div>
                  </div>
                ))}
                {!projects.length && <p className="font-fell italic text-sm text-[#a9916e]">No cloud floors yet. Generate or add a room and Ginger Dragon will create one automatically.</p>}
              </div>
            </Card>
            <Card>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="font-display text-lg font-bold">Reusable Templates</h3>
                  <p className="font-fell text-xs text-[#cbb99b]">Templates belong to the GM account, not one campaign, so they can seed future games.</p>
                </div>
                <button type="button" className={button} disabled={cloudBusy} onClick={() => void saveTemplate()}>SAVE CURRENT AS TEMPLATE</button>
              </div>
              <div className="mt-3 grid gap-2">
                {templates.map((project) => (
                  <div key={project.id} className="rounded border border-[#4f3922] bg-[#0f0c09] p-3">
                    <div className="font-garamond text-lg font-bold">{project.name}</div>
                    <div className="font-fell text-xs text-[#a9916e]">{project.scope || "Dungeon Floor"}</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <button type="button" className={button} onClick={() => loadProject(project)}>USE TEMPLATE</button>
                      <button type="button" className={dangerButton} disabled={cloudBusy} onClick={() => void deleteProject(project)}>DELETE</button>
                    </div>
                  </div>
                ))}
                {!templates.length && <p className="font-fell italic text-sm text-[#a9916e]">No reusable templates yet.</p>}
              </div>
            </Card>
          </div>
        )}

        {activeTab === "rooms" && (
          <div>
            <div className="mb-3 flex items-center justify-between gap-2">
              <div>
                <h3 className="font-display text-lg font-bold">Rooms & Encounters</h3>
                <p className="font-fell text-xs text-[#cbb99b]">Build the floor room by room. Run Mode uses the cleared state below.</p>
              </div>
              <button type="button" className={button} onClick={addRoom}>ADD ROOM</button>
            </div>
            <div className="grid gap-3 lg:grid-cols-2">
              {floor.rooms.map((room, index) => (
                <Card key={room.id}>
                  <div className="flex items-center justify-between gap-2">
                    <strong className="font-display">Room {index + 1}</strong>
                    <button type="button" className={dangerButton} onClick={() => removeListItem("rooms", room.id)}>REMOVE</button>
                  </div>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    <Field label="Name" value={room.name} onChange={(name) => updateListItem("rooms", room.id, { name })} />
                    <Field label="Type" value={room.type} onChange={(type) => updateListItem("rooms", room.id, { type })} />
                  </div>
                  <TextArea label="Encounter" value={room.encounter} onChange={(encounter) => updateListItem("rooms", room.id, { encounter })} rows={2} />
                  <TextArea label="Feature / Terrain" value={room.feature} onChange={(feature) => updateListItem("rooms", room.id, { feature })} rows={2} />
                  <TextArea label="GM Notes" value={room.notes} onChange={(notes) => updateListItem("rooms", room.id, { notes })} rows={2} />
                </Card>
              ))}
              {!floor.rooms.length && <p className="font-fell italic text-sm text-[#a9916e]">No rooms yet. Generate a floor or add one manually.</p>}
            </div>
          </div>
        )}

        {activeTab === "layout" && (
          <div className="grid gap-4 lg:grid-cols-[0.75fr_1.25fr]">
            <Card>
              <h3 className="font-display text-lg font-bold">Map & Placement</h3>
              <label className="mt-3 grid gap-1">
                <span className="font-fell-sc text-[11px] text-[#d4a055]">Layout Style</span>
                <select className={input} value={floor.layoutStyle} onChange={(e) => updateFloor({ layoutStyle: e.target.value })}>
                  {["Linear", "Branching", "Hub & Spoke", "Looping", "Maze-Like", "Open Zone"].map((style) => <option key={style}>{style}</option>)}
                </select>
              </label>
              <button type="button" className={button + " mt-2 w-full"} onClick={autoArrange}>AUTO-ARRANGE LOCATIONS</button>
              <div className="mt-3">
                <TextArea label="Connections / Secret Routes / Locked Paths" value={floor.layoutNotes} onChange={(layoutNotes) => updateFloor({ layoutNotes })} rows={5} />
              </div>
              <div className="mt-3 grid gap-2">
                {floor.rooms.map((room, index) => (
                  <div key={room.id} className="rounded border border-[#4f3922] bg-[#0f0c09] p-2">
                    <div className="font-fell-sc text-[10px] text-[#d4a055]">{index + 1}. {room.name}</div>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <Field label="Map X %" type="number" min={2} max={98} value={room.mapX ?? 50} onChange={(mapX) => updateListItem("rooms", room.id, { mapX })} />
                      <Field label="Map Y %" type="number" min={2} max={98} value={room.mapY ?? 50} onChange={(mapY) => updateListItem("rooms", room.id, { mapY })} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
            <Card>
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h3 className="font-display text-lg font-bold">{floor.scope} Map</h3>
                  <p className="font-fell text-xs text-[#cbb99b]">Locations use percentage coordinates so the layout survives phone, tablet, and desktop sizes.</p>
                </div>
              </div>
              <div className="relative mt-3 min-h-[520px] overflow-hidden rounded-lg border border-[#6d4b26] bg-[#0b0907]">
                <div className="pointer-events-none absolute inset-0 opacity-20" style={{ backgroundImage: "linear-gradient(#6d4b26 1px, transparent 1px), linear-gradient(90deg, #6d4b26 1px, transparent 1px)", backgroundSize: "10% 10%" }} />
                {floor.rooms.map((room, index) => (
                  <div
                    key={room.id}
                    className="absolute w-28 -translate-x-1/2 -translate-y-1/2 rounded border border-[#b47a36] bg-[#21160e] p-2 text-center shadow-lg"
                    style={{ left: `${Math.max(2, Math.min(98, Number(room.mapX ?? 50)))}%`, top: `${Math.max(2, Math.min(98, Number(room.mapY ?? 50)))}%` }}
                    title={room.feature || room.encounter || room.name}
                  >
                    <div className="font-fell-sc text-[9px] text-[#d4a055]">{index + 1}</div>
                    <div className="truncate font-garamond text-xs font-bold">{room.name}</div>
                    <div className="truncate font-fell text-[9px] text-[#a9916e]">{room.type}</div>
                  </div>
                ))}
                {!floor.rooms.length && <div className="absolute inset-0 grid place-items-center font-fell italic text-sm text-[#a9916e]">Generate or add locations to place them here.</div>}
              </div>
            </Card>
          </div>
        )}

        {activeTab === "mobs" && (
          <div>
            <div className="mb-3 flex items-center justify-between gap-2">
              <div>
                <h3 className="font-display text-lg font-bold">Mob Groups</h3>
                <p className="font-fell text-xs text-[#cbb99b]">These are encounter groups, separate from your reusable campaign Mob Stat Library below.</p>
              </div>
              <button type="button" className={button} onClick={addMob}>ADD MOB GROUP</button>
            </div>
            <div className="grid gap-3 lg:grid-cols-2">
              {floor.mobs.map((mob) => (
                <Card key={mob.id}>
                  <div className="flex items-center justify-between gap-2">
                    <strong className="font-display">{mob.name}</strong>
                    <button type="button" className={dangerButton} onClick={() => removeListItem("mobs", mob.id)}>REMOVE</button>
                  </div>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    <Field label="Name" value={mob.name} onChange={(name) => updateListItem("mobs", mob.id, { name })} />
                    <Field label="Role" value={mob.role} onChange={(role) => updateListItem("mobs", mob.id, { role })} />
                    <Field label="Quantity" type="number" min={1} value={mob.quantity} onChange={(quantity) => updateListItem("mobs", mob.id, { quantity })} />
                    <Field label="HP Each" type="number" min={1} value={mob.hpEach} onChange={(hpEach) => updateListItem("mobs", mob.id, { hpEach })} />
                  </div>
                  <TextArea label="Behavior / Tactics" value={mob.behavior} onChange={(behavior) => updateListItem("mobs", mob.id, { behavior })} rows={2} />
                  <TextArea label="Spawn Condition" value={mob.spawn} onChange={(spawn) => updateListItem("mobs", mob.id, { spawn })} rows={2} />
                  <TextArea label="Notes" value={mob.notes} onChange={(notes) => updateListItem("mobs", mob.id, { notes })} rows={2} />
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === "boss" && (
          <Card>
            <h3 className="font-display text-lg font-bold">Boss Builder</h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Field label="Boss Name" value={floor.boss.name} onChange={(name) => updateFloor({ boss: { ...floor.boss, name } })} />
              <label className="grid gap-1">
                <span className="font-fell-sc text-[11px] text-[#d4a055]">Boss Type</span>
                <select className={input} value={floor.boss.type || "Solo / Apex"} onChange={(e) => updateFloor({ boss: { ...floor.boss, type: e.target.value } })}>
                  {BOSS_TYPES.map((type) => <option key={type}>{type}</option>)}
                </select>
              </label>
              <div className="sm:col-span-2 lg:col-span-4 rounded border border-[#4f3922] bg-[#0f0c09] p-2 font-fell text-xs text-[#cbb99b]">
                {BOSS_HINTS[floor.boss.type] || "Use this archetype to shape the boss's action economy, objectives, arena, and phase changes."}
              </div>
              <Field label="Role / Job" value={floor.boss.role} onChange={(role) => updateFloor({ boss: { ...floor.boss, role } })} />
              <Field label="Max HP" type="number" min={0} value={floor.boss.maxHp} onChange={(maxHp) => updateFloor({ boss: { ...floor.boss, maxHp, currentHp: Math.min(floor.boss.currentHp || maxHp, maxHp) } })} />
              <Field label="Current HP" type="number" min={0} value={floor.boss.currentHp} onChange={(currentHp) => updateFloor({ boss: { ...floor.boss, currentHp } })} />
              <Field label="Evade" value={floor.boss.evade} onChange={(evade) => updateFloor({ boss: { ...floor.boss, evade } })} />
              <Field label="DR" value={floor.boss.dr} onChange={(dr) => updateFloor({ boss: { ...floor.boss, dr } })} />
            </div>
            <TextArea label="Attacks / Signature Moves" value={floor.boss.attacks} onChange={(attacks) => updateFloor({ boss: { ...floor.boss, attacks } })} />
            <div className="mt-3">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <h4 className="font-display text-sm font-bold">Boss Phases</h4>
                <div className="flex gap-2">
                  <button type="button" className={button} onClick={() => updateFloor({ boss: { ...floor.boss, phases: [...floor.boss.phases, "New phase"] } })}>ADD PHASE</button>
                  {floor.boss.phases.length > 1 && <button type="button" className={dangerButton} onClick={() => updateFloor({ boss: { ...floor.boss, phases: floor.boss.phases.slice(0, -1) } })}>REMOVE LAST</button>}
                </div>
              </div>
              <div className="grid gap-2">
                {floor.boss.phases.map((phase, index) => (
                  <TextArea
                    key={index}
                    label={`Phase ${index + 1}`}
                    value={phase}
                    onChange={(value) => {
                      const phases = [...floor.boss.phases];
                      phases[index] = value;
                      updateFloor({ boss: { ...floor.boss, phases } });
                    }}
                    rows={2}
                  />
                ))}
              </div>
            </div>
            <div className="mt-3 grid gap-3 lg:grid-cols-2">
              <TextArea label="Minions / Adds" value={floor.boss.minions} onChange={(minions) => updateFloor({ boss: { ...floor.boss, minions } })} />
              <TextArea label="Arena / Lair Mechanics" value={floor.boss.arena} onChange={(arena) => updateFloor({ boss: { ...floor.boss, arena } })} />
              <TextArea label="Enrage / Escalation" value={floor.boss.enrage} onChange={(enrage) => updateFloor({ boss: { ...floor.boss, enrage } })} />
              <TextArea label="Victory Condition" value={floor.boss.victoryCondition} onChange={(victoryCondition) => updateFloor({ boss: { ...floor.boss, victoryCondition } })} />
              <TextArea label="Alternate Win Condition" value={floor.boss.alternateWin} onChange={(alternateWin) => updateFloor({ boss: { ...floor.boss, alternateWin } })} />
              <TextArea label="Failure / Defeat Consequence" value={floor.boss.defeatConsequence} onChange={(defeatConsequence) => updateFloor({ boss: { ...floor.boss, defeatConsequence } })} />
              <TextArea label="Weakness / Counterplay" value={floor.boss.weakness} onChange={(weakness) => updateFloor({ boss: { ...floor.boss, weakness } })} />
              <TextArea label="Tactics" value={floor.boss.tactics} onChange={(tactics) => updateFloor({ boss: { ...floor.boss, tactics } })} />
              <TextArea label="Boss Reward" value={floor.boss.reward} onChange={(reward) => updateFloor({ boss: { ...floor.boss, reward } })} />
            </div>
          </Card>
        )}

        {activeTab === "traps" && (
          <div>
            <div className="mb-3 flex items-center justify-between gap-2">
              <h3 className="font-display text-lg font-bold">Traps & Hazards</h3>
              <button type="button" className={button} onClick={addTrap}>ADD HAZARD</button>
            </div>
            <div className="grid gap-3 lg:grid-cols-2">
              {floor.traps.map((trap) => (
                <Card key={trap.id}>
                  <div className="flex items-center justify-between gap-2">
                    <Field label="Name" value={trap.name} onChange={(name) => updateListItem("traps", trap.id, { name })} />
                    <button type="button" className={dangerButton} onClick={() => removeListItem("traps", trap.id)}>REMOVE</button>
                  </div>
                  <TextArea label="Trigger" value={trap.trigger} onChange={(trigger) => updateListItem("traps", trap.id, { trigger })} rows={2} />
                  <TextArea label="Detection" value={trap.detect} onChange={(detect) => updateListItem("traps", trap.id, { detect })} rows={2} />
                  <TextArea label="Consequence" value={trap.consequence} onChange={(consequence) => updateListItem("traps", trap.id, { consequence })} rows={2} />
                  <TextArea label="Bypass / Disarm" value={trap.bypass} onChange={(bypass) => updateListItem("traps", trap.id, { bypass })} rows={2} />
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === "loot" && (
          <div>
            <div className="mb-3 flex items-center justify-between gap-2">
              <h3 className="font-display text-lg font-bold">Loot & Rewards</h3>
              <button type="button" className={button} onClick={addLoot}>ADD REWARD</button>
            </div>
            <div className="grid gap-3 lg:grid-cols-2">
              {floor.loot.map((item) => (
                <Card key={item.id}>
                  <div className="flex items-center justify-between gap-2">
                    <strong className="font-display">{item.name}</strong>
                    <button type="button" className={dangerButton} onClick={() => removeListItem("loot", item.id)}>REMOVE</button>
                  </div>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    <Field label="Reward" value={item.name} onChange={(name) => updateListItem("loot", item.id, { name })} />
                    <Field label="Value / Tier" value={item.value} onChange={(value) => updateListItem("loot", item.id, { value })} />
                  </div>
                  <TextArea label="Where Found" value={item.location} onChange={(location) => updateListItem("loot", item.id, { location })} rows={2} />
                  <TextArea label="Notes" value={item.notes} onChange={(notes) => updateListItem("loot", item.id, { notes })} rows={2} />
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === "npcs" && (
          <div>
            <div className="mb-3 flex items-center justify-between gap-2">
              <h3 className="font-display text-lg font-bold">NPCs & Scripted Events</h3>
              <button type="button" className={button} onClick={addNpc}>ADD NPC / EVENT</button>
            </div>
            <div className="grid gap-3 lg:grid-cols-2">
              {floor.npcs.map((npc) => (
                <Card key={npc.id}>
                  <div className="flex items-center justify-between gap-2">
                    <strong className="font-display">{npc.name}</strong>
                    <button type="button" className={dangerButton} onClick={() => removeListItem("npcs", npc.id)}>REMOVE</button>
                  </div>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    <Field label="Name" value={npc.name} onChange={(name) => updateListItem("npcs", npc.id, { name })} />
                    <Field label="Role" value={npc.role} onChange={(role) => updateListItem("npcs", npc.id, { role })} />
                  </div>
                  <TextArea label="Motivation" value={npc.motivation} onChange={(motivation) => updateListItem("npcs", npc.id, { motivation })} rows={2} />
                  <TextArea label="Secret / Leverage" value={npc.secret} onChange={(secret) => updateListItem("npcs", npc.id, { secret })} rows={2} />
                  <TextArea label="Trigger / Event" value={npc.event} onChange={(event) => updateListItem("npcs", npc.id, { event })} rows={2} />
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === "rules" && (
          <Card>
            <div className="flex items-center justify-between gap-2">
              <div>
                <h3 className="font-display text-lg font-bold">Floor-Wide Rules</h3>
                <p className="font-fell text-xs text-[#cbb99b]">Use these for altered magic, darkness, timers, roaming threats, healing restrictions, gravity, or any other floor gimmick.</p>
              </div>
              <button
                type="button"
                className={button}
                onClick={() => updateFloor({ rules: [...floor.rules, "New floor rule"] })}
              >
                ADD RULE
              </button>
            </div>
            <div className="mt-3 grid gap-2">
              {floor.rules.map((rule, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    className={input}
                    value={rule}
                    onChange={(e) => {
                      const rules = [...floor.rules];
                      rules[index] = e.target.value;
                      updateFloor({ rules });
                    }}
                  />
                  <button
                    type="button"
                    className={dangerButton}
                    onClick={() => updateFloor({ rules: floor.rules.filter((_, i) => i !== index) })}
                  >
                    REMOVE
                  </button>
                </div>
              ))}
            </div>
          </Card>
        )}

        {activeTab === "run" && (
          <div className="grid gap-4 lg:grid-cols-[1.2fr_.8fr]">
            <Card>
              <h3 className="font-display text-lg font-bold">Live Floor Tracker</h3>
              <div className="mt-3 grid gap-2">
                {floor.rooms.map((room, index) => (
                  <button
                    key={room.id}
                    type="button"
                    onClick={() => updateListItem("rooms", room.id, { cleared: !room.cleared })}
                    className={`rounded border p-3 text-left ${room.cleared ? "border-[#466d45] bg-[#132014]" : "border-[#4f3922] bg-[#0f0c09]"}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <strong className="font-garamond">Room {index + 1}: {room.name}</strong>
                      <span className="font-fell-sc text-[10px]">{room.cleared ? "CLEARED" : "ACTIVE"}</span>
                    </div>
                    <div className="mt-1 font-fell text-xs text-[#cbb99b]">{room.encounter}</div>
                  </button>
                ))}
              </div>
            </Card>

            <div className="grid content-start gap-4">
              <Card>
                <h3 className="font-display text-lg font-bold">Boss</h3>
                <div className="mt-2 font-garamond text-xl font-bold">{floor.boss.name || "No boss configured"}</div>
                <div className="font-fell-sc text-[10px] text-[#d4a055]">{floor.boss.type || "Boss"}</div>
                <div className="mt-1 font-fell text-sm text-[#cbb99b]">
                  HP {floor.boss.currentHp} / {floor.boss.maxHp} · Evade {floor.boss.evade || "—"} · DR {floor.boss.dr || "—"}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button type="button" className={button} onClick={() => updateFloor({ boss: { ...floor.boss, currentHp: Math.max(0, Number(floor.boss.currentHp || 0) - 5) } })}>-5 HP</button>
                  <button type="button" className={button} onClick={() => updateFloor({ boss: { ...floor.boss, currentHp: Math.min(Number(floor.boss.maxHp || 0), Number(floor.boss.currentHp || 0) + 5) } })}>+5 HP</button>
                  <button type="button" className={floor.boss.defeated ? button : dangerButton} onClick={() => updateFloor({ boss: { ...floor.boss, defeated: !floor.boss.defeated } })}>
                    {floor.boss.defeated ? "BOSS DEFEATED" : "MARK DEFEATED"}
                  </button>
                </div>
                <div className="mt-3 grid gap-2">
                  {floor.boss.phases.map((phase, index) => (
                    <div key={index} className="rounded border border-[#4f3922] bg-[#0f0c09] p-2 font-fell text-xs">
                      <strong className="text-[#f2d49b]">Phase {index + 1}:</strong> {phase}
                    </div>
                  ))}
                </div>
              </Card>

              <Card>
                <h3 className="font-display text-lg font-bold">Mob Groups</h3>
                <div className="mt-2 grid gap-2">
                  {floor.mobs.map((mob) => (
                    <button
                      key={mob.id}
                      type="button"
                      onClick={() => updateListItem("mobs", mob.id, { defeated: !mob.defeated })}
                      className={`rounded border p-2 text-left font-fell text-xs ${mob.defeated ? "border-[#466d45] bg-[#132014]" : "border-[#4f3922] bg-[#0f0c09]"}`}
                    >
                      <strong>{mob.name} x{mob.quantity}</strong> — HP {mob.hpEach} each · {mob.defeated ? "Defeated" : mob.behavior}
                    </button>
                  ))}
                </div>
              </Card>

              <Card>
                <h3 className="font-display text-lg font-bold">Push to Players</h3>
                <p className="mt-1 font-fell text-xs text-[#cbb99b]">Damage, healing and loot update the crawler record before the alert is sent.</p>
                <label className="mt-3 grid gap-1">
                  <span className="font-fell-sc text-[11px] text-[#d4a055]">Push Type</span>
                  <select className={input} value={pushDraft.kind} onChange={(e) => setPushDraft((d) => ({ ...d, kind: e.target.value }))}>
                    <option value="announcement">Campaign Announcement</option>
                    <option value="loot">Loot / Reward</option>
                    <option value="damage">Damage</option>
                    <option value="healing">Healing</option>
                    <option value="condition">Condition / Effect</option>
                  </select>
                </label>
                {pushDraft.kind !== "announcement" && (
                  <label className="mt-2 grid gap-1">
                    <span className="font-fell-sc text-[11px] text-[#d4a055]">Target Crawler</span>
                    <select className={input} value={pushDraft.targetId} onChange={(e) => setPushDraft((d) => ({ ...d, targetId: e.target.value }))}>
                      <option value="">Choose crawler…</option>
                      {characters.map((character) => <option key={character.id} value={character.id}>{character.name || "Unnamed Crawler"}</option>)}
                    </select>
                  </label>
                )}
                {(pushDraft.kind === "damage" || pushDraft.kind === "healing") && (
                  <div className="mt-2">
                    <Field label="Amount" type="number" min={0} value={pushDraft.amount} onChange={(amount) => setPushDraft((d) => ({ ...d, amount }))} />
                  </div>
                )}
                <div className="mt-2">
                  <Field label="Title" value={pushDraft.title} onChange={(title) => setPushDraft((d) => ({ ...d, title }))} />
                </div>
                <div className="mt-2">
                  <TextArea label="Details / Message" value={pushDraft.detail} onChange={(detail) => setPushDraft((d) => ({ ...d, detail }))} rows={3} />
                </div>
                <button type="button" className={button + " mt-2 w-full"} disabled={cloudBusy} onClick={() => void sendPush()}>
                  PUSH NOW
                </button>
              </Card>

              <Card>
                <h3 className="font-display text-lg font-bold">Quick Resolution</h3>
                <div className="mt-2 grid gap-2">
                  {floor.traps.map((trap) => (
                    <button key={trap.id} type="button" className={button} onClick={() => updateListItem("traps", trap.id, { disarmed: !trap.disarmed })}>
                      {trap.disarmed ? "✓ " : ""}{trap.name}
                    </button>
                  ))}
                  {floor.loot.map((item) => (
                    <button key={item.id} type="button" className={button} onClick={() => updateListItem("loot", item.id, { claimed: !item.claimed })}>
                      {item.claimed ? "✓ " : ""}{item.name}
                    </button>
                  ))}
                  {floor.npcs.map((npc) => (
                    <button key={npc.id} type="button" className={button} onClick={() => updateListItem("npcs", npc.id, { resolved: !npc.resolved })}>
                      {npc.resolved ? "✓ " : ""}{npc.name}
                    </button>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "summary" && (
          <Card>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="font-display text-lg font-bold">GM Floor Summary</h3>
                <p className="font-fell text-xs text-[#cbb99b]">A compact room-by-room version you can copy into notes, a session plan, or another tool.</p>
              </div>
              <button type="button" className={button} onClick={copySummary}>COPY SUMMARY</button>
            </div>
            <pre className="mt-3 whitespace-pre-wrap rounded-lg border border-[#4f3922] bg-[#0a0806] p-4 font-mono text-xs leading-6 text-[#ead9b8]">{summary}</pre>
          </Card>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[#4f3922] pt-3 font-fell text-[11px] text-[#a9916e]">
        <span>{generatedAtLabel(floor.generatedAt)}</span>
        <span>{status || (currentProjectId ? "Autosaving locally + private GM cloud." : "Local draft; cloud project begins automatically once locations exist.")}</span>
      </div>
    </section>
  );
}

function generatedAtLabel(value) {
  if (!value) return "Hand-built floor";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Generated floor" : `Generated ${date.toLocaleString()}`;
}
