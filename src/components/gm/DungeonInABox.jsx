import React, { useEffect, useMemo, useState } from "react";

const panel = "rounded-xl border border-[#6d4b26]/70 bg-[#17110d]/95 p-4 shadow-xl";
const input = "w-full rounded-md border border-[#7b5a31] bg-[#0f0c09] px-3 py-2 text-[#f2e5cb] outline-none focus:border-[#d4a055]";
const button = "rounded-md border border-[#b47a36] bg-[#2b1c10] px-3 py-2 font-fell-sc text-xs font-bold text-[#f2d49b] hover:bg-[#3a2818] disabled:opacity-50";
const dangerButton = "rounded-md border border-[#7e3f32] bg-[#2c1310] px-3 py-2 font-fell-sc text-xs font-bold text-[#efb5aa] hover:bg-[#3a1714]";

const TABS = [
  ["setup", "Floor Setup"],
  ["rooms", "Rooms"],
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

const pick = (items) => items[Math.floor(Math.random() * items.length)];
const makeId = () => (globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`);

const defaultFloor = (campaignName = "") => ({
  version: 1,
  name: campaignName ? `${campaignName} — New Floor` : "New Floor",
  floorNumber: 1,
  theme: "Ruined Citadel",
  objective: OBJECTIVES[0],
  tone: "Tense",
  partySize: 4,
  partyLevel: 1,
  difficulty: "Standard",
  roomCount: 8,
  timer: "",
  notes: "",
  rooms: [],
  mobs: [],
  boss: {
    name: "",
    role: "Solo boss",
    maxHp: 0,
    currentHp: 0,
    evade: "",
    dr: "",
    attacks: "",
    phases: ["Opening phase", "Escalation phase", "Final phase"],
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

export default function DungeonInABox({ campaignId, campaignName }) {
  const [floor, setFloor] = useState(() => defaultFloor(campaignName));
  const [activeTab, setActiveTab] = useState("setup");
  const [status, setStatus] = useState("");
  const [hydrated, setHydrated] = useState(false);

  const storageKey = campaignId ? `gds_dungeon_in_a_box_${campaignId}` : "";

  useEffect(() => {
    if (!storageKey) return;
    setHydrated(false);
    try {
      const saved = localStorage.getItem(storageKey);
      setFloor(saved ? { ...defaultFloor(campaignName), ...JSON.parse(saved) } : defaultFloor(campaignName));
    } catch {
      setFloor(defaultFloor(campaignName));
    }
    setHydrated(true);
  }, [storageKey, campaignName]);

  useEffect(() => {
    if (!storageKey || !hydrated) return;
    localStorage.setItem(storageKey, JSON.stringify(floor));
  }, [floor, hydrated, storageKey]);

  const updateFloor = (patch) => setFloor((current) => ({ ...current, ...patch }));

  const generateFloor = () => {
    const themeName = floor.theme || "Ruined Citadel";
    const theme = THEMES[themeName] || THEMES["Ruined Citadel"];
    const roomCount = Math.max(4, Math.min(20, Number(floor.roomCount) || 8));
    const partySize = Math.max(1, Number(floor.partySize) || 4);
    const partyLevel = Math.max(1, Number(floor.partyLevel) || 1);
    const multiplier = DIFFICULTY_SCALE[floor.difficulty] || 1;
    const baseHp = Math.max(5, Math.round((partyLevel * 6 + partySize * 3) * multiplier));

    const rooms = Array.from({ length: roomCount }, (_, index) => {
      const isBoss = index === roomCount - 1;
      const isStart = index === 0;
      return {
        id: makeId(),
        name: isStart ? "Floor Entry" : isBoss ? "Boss Chamber" : pick(theme.rooms),
        type: isStart ? "Entry" : isBoss ? "Boss" : pick(["Combat", "Exploration", "Hazard", "Puzzle", "Mixed"]),
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
    const boss = {
      name: bossName,
      role: "Solo boss with environmental pressure",
      maxHp: maxBossHp,
      currentHp: maxBossHp,
      evade: Math.max(8, Math.round(8 + partyLevel * 0.7 + multiplier * 2)),
      dr: Math.max(0, Math.round(partyLevel / 3)),
      attacks: "One reliable attack, one heavy telegraphed attack, and one movement/control ability.",
      phases: [
        "Opening: tests the party and uses the room.",
        "Escalation: summons help or activates a floor hazard at roughly 60% HP.",
        "Final: becomes more aggressive at roughly 25% HP.",
      ],
      weakness: "A clue or interaction elsewhere on the floor can suppress one boss advantage.",
      tactics: "Move the boss, use terrain, and change behavior between phases rather than only increasing damage.",
      reward: pick(theme.loot),
      defeated: false,
    };

    setFloor((current) => ({
      ...current,
      rooms,
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
    setFloor(defaultFloor(campaignName));
    setActiveTab("setup");
    setStatus("Started a fresh floor.");
  };

  const addRoom = () => {
    setFloor((current) => ({
      ...current,
      rooms: [...current.rooms, { id: makeId(), name: "New Room", type: "Mixed", encounter: "", feature: "", notes: "", cleared: false }],
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

  const summary = useMemo(() => {
    const lines = [
      `${floor.name} (Floor ${floor.floorNumber})`,
      `Theme: ${floor.theme} | Tone: ${floor.tone} | Difficulty: ${floor.difficulty}`,
      `Party: ${floor.partySize} crawler(s), level ${floor.partyLevel}`,
      `Objective: ${floor.objective || "Not set"}`,
      floor.timer ? `Timer / Pressure: ${floor.timer}` : "",
      "",
      "ROOMS",
      ...floor.rooms.map((room, index) => `${index + 1}. ${room.name} [${room.type}] — ${room.encounter || "No encounter"}${room.feature ? ` | ${room.feature}` : ""}`),
      "",
      "MOB GROUPS",
      ...floor.mobs.map((mob) => `• ${mob.name} x${mob.quantity} (${mob.role}) — HP ${mob.hpEach} each. ${mob.behavior || ""}`),
      "",
      "BOSS",
      floor.boss.name ? `${floor.boss.name} — HP ${floor.boss.maxHp}, Evade ${floor.boss.evade}, DR ${floor.boss.dr}` : "Not configured",
      ...floor.boss.phases.map((phase, index) => `  Phase ${index + 1}: ${phase}`),
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
          <button type="button" className={button} onClick={generateFloor}>🎲 GENERATE FLOOR</button>
          <button type="button" className={dangerButton} onClick={clearFloor}>NEW FLOOR</button>
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
                <Field label="Room Count" type="number" min={4} max={20} value={floor.roomCount} onChange={(roomCount) => updateFloor({ roomCount })} />
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
                Generation uses Ginger Dragon's own tables and math. The result is saved locally for this campaign and remains fully editable.
              </p>
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
              <Field label="Role" value={floor.boss.role} onChange={(role) => updateFloor({ boss: { ...floor.boss, role } })} />
              <Field label="Max HP" type="number" min={0} value={floor.boss.maxHp} onChange={(maxHp) => updateFloor({ boss: { ...floor.boss, maxHp, currentHp: Math.min(floor.boss.currentHp || maxHp, maxHp) } })} />
              <Field label="Current HP" type="number" min={0} value={floor.boss.currentHp} onChange={(currentHp) => updateFloor({ boss: { ...floor.boss, currentHp } })} />
              <Field label="Evade" value={floor.boss.evade} onChange={(evade) => updateFloor({ boss: { ...floor.boss, evade } })} />
              <Field label="DR" value={floor.boss.dr} onChange={(dr) => updateFloor({ boss: { ...floor.boss, dr } })} />
            </div>
            <TextArea label="Attacks / Signature Moves" value={floor.boss.attacks} onChange={(attacks) => updateFloor({ boss: { ...floor.boss, attacks } })} />
            <div className="mt-3 grid gap-2">
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
            <div className="mt-3 grid gap-3 lg:grid-cols-2">
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
        <span>{status || "Autosaves on this device for the selected campaign."}</span>
      </div>
    </section>
  );
}

function generatedAtLabel(value) {
  if (!value) return "Hand-built floor";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Generated floor" : `Generated ${date.toLocaleString()}`;
}
