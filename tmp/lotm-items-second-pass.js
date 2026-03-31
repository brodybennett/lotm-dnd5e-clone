const path = require("path");
const crypto = require("crypto");
const { ClassicLevel } = require("./node-tools/node_modules/classic-level");

const ROOT = path.join(__dirname, "..");
const PACK = (name) => path.join(ROOT, "packs", name);
const MASTER_PACK = "lotm_items";
const CATEGORY_PACKS = {
  LOxFBqesgQ1OfPjh: "lotm_items_armor",
  LOhzzA6eM70QAVL6: "lotm_items_consumables",
  "4eIdvJQzTs7c0taj": "lotm_items_equipment",
  wsNh2lLy1muOc97X: "lotm_items_tools",
  OZfOaplmVF7VV7ta: "lotm_items_traps",
  s2wvLeCz92BaGi24: "lotm_items_weapons",
  vR6wEqLYW8TuAP2r: "lotm_items_sealed_artifacts"
};
const F = {
  armor: "LOxFBqesgQ1OfPjh",
  consumables: "LOhzzA6eM70QAVL6",
  equipment: "4eIdvJQzTs7c0taj",
  tools: "wsNh2lLy1muOc97X",
  traps: "OZfOaplmVF7VV7ta",
  weapons: "s2wvLeCz92BaGi24",
  artifacts: "vR6wEqLYW8TuAP2r"
};
const NOW = Date.now();
const SOURCE = { custom: "", rules: "2024", revision: 1, license: "", book: "LoTM Core" };
const BASE_STATS = {
  duplicateSource: null,
  coreVersion: "13.351",
  systemId: "lotm",
  systemVersion: "5.2.6",
  createdTime: NOW,
  modifiedTime: NOW,
  lastModifiedBy: "PlJLjweCoMIT3aIO",
  exportSource: null
};
const TRAP_NAMES = new Set([
  "Razor Spring Snare",
  "Soot Flask Alarm",
  "Scorchline Sigil",
  "Grave-Salt Ward",
  "Whisper Thread Tripline",
  "Sleep Pollen Charge",
  "Mirror-Shard Hex",
  "Black Flame Lure"
]);

const makeId = (seed) => crypto.createHash("sha1").update(seed).digest("hex").slice(0, 16);
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const uniq = (arr) => [...new Set(arr.filter(Boolean))];
const html = (...parts) => parts.filter(Boolean).map((p) => `<p>${p}</p>`).join("");
const riders = () => ({ dnd5e: { riders: { activity: [], effect: [] } } });
const stats = () => ({ ...BASE_STATS });
const usesTarget = (value = "1") => [{ type: "itemUses", value: String(value), target: "", scaling: {} }];

function baseActivity(name, type, options = {}) {
  const activity = {
    type,
    name,
    _id: makeId(`activity:${name}:${type}:${JSON.stringify(options)}`),
    sort: 0,
    activation: {
      type: options.activationType || "action",
      value: options.activationValue ?? 1,
      condition: "",
      override: false
    },
    consumption: {
      scaling: { allowed: false, max: "" },
      spellSlot: true,
      targets: options.consumeUses ? usesTarget(options.consumeValue || "1") : []
    },
    description: { chatFlavor: "" },
    duration: {
      units: options.durationUnits || "inst",
      value: options.durationValue || "",
      concentration: false,
      special: "",
      override: false
    },
    effects: [],
    range: { override: false, units: options.rangeUnits || "self", special: options.rangeSpecial || "" },
    target: {
      template: {
        count: "",
        contiguous: false,
        type: options.templateType || "",
        size: options.templateSize === undefined ? "" : String(options.templateSize),
        width: "",
        height: "",
        units: options.templateType ? (options.templateUnits || "ft") : ""
      },
      affects: {
        choice: false,
        count: options.targetCount === undefined ? "" : String(options.targetCount),
        type: options.targetType || "",
        special: options.targetSpecial || ""
      },
      override: false,
      prompt: !!options.prompt
    },
    uses: { spent: 0, recovery: [], max: "" },
    img: "",
    appliedEffects: []
  };
  if (options.rangeValue !== undefined) activity.range.value = String(options.rangeValue);
  return activity;
}

function util(name, options = {}) {
  const activity = baseActivity(name, "utility", options);
  activity.roll = { prompt: false, visible: false, name: "", formula: "" };
  return activity;
}

function save(name, options = {}) {
  const activity = baseActivity(name, "save", options);
  activity.damage = { parts: options.parts || [], onSave: options.onSave || "none" };
  activity.save = { ability: options.saveAbility || "wis", dc: { calculation: "", formula: String(options.dcFormula ?? "") } };
  return activity;
}

function dmgPart(number, denomination, type, bonus = "") {
  return {
    custom: { enabled: false, formula: "" },
    number,
    denomination,
    bonus,
    types: type ? [type] : [],
    scaling: { number: 1 }
  };
}

function common(name, folder, img) {
  return {
    _id: makeId(`item:${folder}:${name}`),
    name,
    folder,
    img,
    effects: [],
    sort: 0,
    ownership: { default: 0 },
    _stats: stats()
  };
}

function equipment(config) {
  return {
    ...common(config.name, config.folder, config.img),
    type: "equipment",
    flags: riders(),
    system: {
      description: { value: config.desc, chat: "" },
      price: { value: config.price, denomination: config.denom || "gp" },
      source: { ...SOURCE },
      identified: true,
      unidentified: { description: "" },
      container: null,
      quantity: 1,
      weight: { value: config.weight, units: "lb" },
      rarity: config.rarity || "",
      attunement: config.att || "",
      attuned: false,
      equipped: false,
      cover: null,
      crewed: false,
      uses: config.uses || { max: "", spent: 0, recovery: [] },
      armor: { value: config.ac ?? null, magicalBonus: null, dex: config.dex ?? null },
      hp: { value: null, max: null, dt: null, conditions: "" },
      type: { value: config.etype || "trinket", baseItem: "" },
      properties: uniq([...(config.props || []), ...(config.mag ? ["mgc"] : [])]),
      speed: { value: null, conditions: "" },
      strength: config.str ?? null,
      proficient: null,
      activities: Object.fromEntries((config.activities || []).map((a) => [a._id, a])),
      identifier: config.id || slug(config.name)
    }
  };
}

function imageFor(item) {
  const name = item.name.toLowerCase();
  const folder = item.folder;

  if (folder === F.armor) {
    if (name.includes("storm")) return "icons/svg/damage/lightning.svg";
    if (name.includes("mirror")) return "icons/svg/schools/illusion.svg";
    if (name.includes("night")) return "icons/svg/statuses/hiding.svg";
    if (name.includes("grave")) return "icons/svg/damage/necrotic.svg";
    if (name.includes("buckler")) return "icons/svg/rosa-shield.svg";
    return "icons/svg/checked-shield.svg";
  }
  if (folder === F.consumables) {
    if (name.includes("poultice")) return "icons/svg/activity/heal.svg";
    if (name.includes("dream")) return "icons/svg/statuses/sleeping.svg";
    if (name.includes("vision")) return "icons/svg/schools/divination.svg";
    if (name.includes("toxin") || name.includes("antitoxin")) return "icons/svg/statuses/poisoned.svg";
    if (name.includes("oil")) return "icons/svg/damage/radiant.svg";
    if (name.includes("flame") || name.includes("scorch")) return "icons/svg/damage/fire.svg";
    if (name.includes("moon")) return "icons/svg/statuses/invisible.svg";
    if (name.includes("salt")) return "icons/svg/items/consumable.svg";
    return "icons/svg/items/consumable.svg";
  }
  if (folder === F.equipment) {
    if (name.includes("chalk") || name.includes("ledger")) return "icons/svg/ink-pot.svg";
    if (name.includes("compass")) return "icons/svg/schools/divination.svg";
    if (name.includes("lockbox")) return "icons/svg/items/container.svg";
    if (name.includes("thread") || name.includes("reel")) return "icons/svg/range-connector.svg";
    if (name.includes("veil")) return "icons/svg/statuses/hiding.svg";
    if (name.includes("brazier") || name.includes("lantern")) return "icons/svg/properties/magical.svg";
    return "icons/svg/items/equipment.svg";
  }
  if (folder === F.tools) {
    if (name.includes("forensics")) return "icons/svg/facilities/research.svg";
    if (name.includes("poison")) return "icons/svg/statuses/poisoned.svg";
    if (name.includes("cipher") || name.includes("forger")) return "icons/svg/ink-pot.svg";
    if (name.includes("engraver")) return "icons/svg/facilities/craft.svg";
    if (name.includes("wire")) return "icons/svg/range-connector.svg";
    if (name.includes("surveyor")) return "icons/svg/scale-value.svg";
    return "icons/svg/items/tool.svg";
  }
  if (folder === F.traps) {
    if (name.includes("sleep")) return "icons/svg/statuses/sleeping.svg";
    if (name.includes("flame") || name.includes("scorch")) return "icons/svg/damage/fire.svg";
    if (name.includes("mirror")) return "icons/svg/statuses/cursed.svg";
    if (name.includes("salt")) return "icons/svg/damage/radiant.svg";
    if (name.includes("alarm")) return "icons/svg/statuses/marked.svg";
    return "icons/svg/statuses/restrained.svg";
  }
  if (folder === F.weapons) {
    if (name.includes("verdict")) return "icons/svg/activity/order.svg";
    if (name.includes("storm")) return "icons/svg/damage/lightning.svg";
    if (name.includes("air bullet")) return "icons/svg/damage/force.svg";
    if (name.includes("flame")) return "icons/svg/damage/fire.svg";
    if (name.includes("shovel") || name.includes("cane")) return "icons/svg/damage/bludgeoning.svg";
    if (name.includes("hatchet") || name.includes("knife") || name.includes("dagger")) return "icons/svg/damage/slashing.svg";
    return "icons/svg/items/weapon.svg";
  }
  if (folder === F.artifacts) {
    if (name.includes("midnight") || name.includes("veil")) return "icons/svg/statuses/hiding.svg";
    if (name.includes("contract") || name.includes("clause") || name.includes("tribunal")) return "icons/svg/activity/order.svg";
    if (name.includes("door") || name.includes("key")) return "icons/svg/schools/conjuration.svg";
    if (name.includes("sun") || name.includes("rosary")) return "icons/svg/damage/radiant.svg";
    if (name.includes("mirror")) return "icons/svg/schools/illusion.svg";
    if (name.includes("marionette") || name.includes("thread")) return "icons/svg/range-connector.svg";
    if (name.includes("storm")) return "icons/svg/damage/lightning.svg";
    if (name.includes("fate")) return "icons/svg/schools/divination.svg";
    if (name.includes("undertaker") || name.includes("funeral") || name.includes("coffin")) return "icons/svg/damage/necrotic.svg";
    if (name.includes("candle") || name.includes("dream")) return "icons/svg/statuses/sleeping.svg";
    if (name.includes("mire")) return "icons/svg/statuses/restrained.svg";
    return "icons/svg/properties/magical.svg";
  }
  return "icons/svg/documents/item.svg";
}

const NEW_ARTIFACTS = [
  equipment({
    name: "Sealed Artifact 3-011: Candle of Dreamless Crossing",
    folder: F.artifacts,
    img: "icons/svg/statuses/sleeping.svg",
    price: 950,
    weight: 1,
    rarity: "rare",
    mag: true,
    att: "required",
    uses: { max: "1", spent: 0, recovery: [] },
    activities: [util("Dream Message", { activationType: "minute", activationValue: 10, consumeUses: true, durationValue: "10", durationUnits: "minute", targetType: "creature", targetCount: 1 })],
    desc: html("<em>Sealed Artifact 3-011, rare, attunement required. Sleepless Pathway, derived from Dream Transfer and Dream Invasion.</em>", "Burn the candle for 10 minutes while naming and picturing one sleeping creature you know within 1 mile. You may send a brief dream-message or ask one yes-or-no question; an unwilling target may resist with a DC 13 Wisdom save.", "Drawback: after each use, your next sleep is crowded with borrowed fragments. You cannot benefit from the first short rest you take before your next long rest.")
  }),
  equipment({
    name: "Sealed Artifact 3-024: Ashen Clause Pen",
    folder: F.artifacts,
    img: "icons/svg/ink-pot.svg",
    price: 1100,
    weight: 0,
    rarity: "rare",
    mag: true,
    att: "required",
    uses: { max: "1", spent: 0, recovery: [] },
    activities: [save("Draft Clause", { consumeUses: true, rangeUnits: "touch", targetType: "creature", targetCount: 1, saveAbility: "wis", dcFormula: 13, parts: [dmgPart(1, 6, "radiant")], onSave: "none" })],
    desc: html("<em>Sealed Artifact 3-024, rare, attunement required. Arbiter and Lawyer pathways, derived from Holy Contract.</em>", "A creature that signs or marks a clause written with the pen is bound by one simple condition for 1 hour. The first knowing violation forces a DC 13 Wisdom save; on a failure the target takes 1d6 radiant damage and its breach is audibly announced within 20 feet.", "Drawback: while attuned, abandoned obligations gnaw at you. If you knowingly leave a promised task unfinished, you have disadvantage on your next Deception or Persuasion check.")
  }),
  equipment({
    name: "Sealed Artifact 3-039: Narrow Door Key",
    folder: F.artifacts,
    img: "icons/svg/schools/conjuration.svg",
    price: 1250,
    weight: 0,
    rarity: "rare",
    mag: true,
    att: "required",
    uses: { max: "1", spent: 0, recovery: [] },
    activities: [util("Slip Through", { activationType: "bonus", consumeUses: true, rangeUnits: "ft", rangeValue: 30, targetType: "self" })],
    desc: html("<em>Sealed Artifact 3-039, rare, attunement required. Apprentice Pathway, derived from Traveler's Door.</em>", "As a bonus action, pass through one doorway, window, hatch, or similar opening and emerge from another such opening you can see within 30 feet.", "Drawback: the key steals your bearings. Until the start of your next turn after using it, you cannot take reactions and have disadvantage on checks made to track direction or pursuit.")
  }),
  equipment({
    name: "Sealed Artifact 3-057: Black Mire Seal Nail",
    folder: F.artifacts,
    img: "icons/svg/statuses/restrained.svg",
    price: 1400,
    weight: 1,
    rarity: "rare",
    mag: true,
    att: "required",
    uses: { max: "1", spent: 0, recovery: [] },
    activities: [save("Pin Mire", { consumeUses: true, rangeUnits: "ft", rangeValue: 30, templateType: "square", templateSize: 5, saveAbility: "dex", dcFormula: 13, onSave: "none" })],
    desc: html("<em>Sealed Artifact 3-057, rare, attunement required. Pathway-linked binding craft, derived from Black Mire Seal and Sealing Edict.</em>", "Drive or throw the nail to create a 5-foot square of clinging black mire for 1 minute. A creature entering the square for the first time on a turn or starting there must succeed on a DC 13 Dexterity save or have its speed reduced to 0 until the end of its turn.", "Drawback: the mire remembers its owner. For 1 hour after each use, occult trackers have advantage to identify you from residue left at the scene.")
  }),
  equipment({
    name: "Sealed Artifact 3-072: Mirror-Backed Coin",
    folder: F.artifacts,
    img: "icons/svg/schools/illusion.svg",
    price: 1500,
    weight: 0,
    rarity: "rare",
    mag: true,
    att: "required",
    uses: { max: "1", spent: 0, recovery: [] },
    activities: [util("Mirror Blink", { activationType: "reaction", consumeUses: true, rangeUnits: "ft", rangeValue: 15, targetType: "self" })],
    desc: html("<em>Sealed Artifact 3-072, rare, attunement required. Mirror-themed mysticism, derived from Mirror Blink and Mirror Persona.</em>", "When targeted by an attack while within 15 feet of a visible reflection, you may step to another reflected point within 15 feet that you can see, imposing disadvantage on that triggering attack.", "Drawback: mirrors take an unhealthy interest in you. Until you finish a short rest after using the coin, you have disadvantage on the first Insight or Perception check you make while looking through glass or polished metal.")
  }),
  equipment({
    name: "Sealed Artifact 3-083: Salt-Tide Rosary",
    folder: F.artifacts,
    img: "icons/svg/damage/radiant.svg",
    price: 1700,
    weight: 1,
    rarity: "rare",
    mag: true,
    att: "required",
    uses: { max: "1", spent: 0, recovery: [] },
    activities: [util("Consecrate Tide", { consumeUses: true, durationValue: "1", durationUnits: "minute", templateType: "radius", templateSize: 10 })],
    desc: html("<em>Sealed Artifact 3-083, rare, attunement required. Sun Pathway, derived from Sun Holy Water and Sun Halo.</em>", "For 1 minute, a 10-foot aura around you is lightly consecrated. Undead, spirits, and concealed creatures inside the aura cannot take reactions on the first turn they enter it, and they cannot benefit from invisibility while within it.", "Drawback: the rosary makes you spiritually loud. Until your next short rest, your first attempt to Hide is made with disadvantage and nearby spirits can sense your direction.")
  }),
  equipment({
    name: "Sealed Artifact 3-095: Whispering Thread Thimble",
    folder: F.artifacts,
    img: "icons/svg/range-connector.svg",
    price: 1800,
    weight: 0,
    rarity: "rare",
    mag: true,
    att: "required",
    uses: { max: "2", spent: 0, recovery: [] },
    activities: [util("Threaded Hand", { activationType: "bonus", consumeUses: true, durationValue: "1", durationUnits: "minute", rangeUnits: "ft", rangeValue: 30, targetType: "object", targetCount: 1 })],
    desc: html("<em>Sealed Artifact 3-095, rare, attunement required. Seer Pathway, derived from Marionette Imprint.</em>", "For 1 minute, manipulate one unattended Tiny object within 30 feet as though by a spectral hand: open a latch, pull a key ring, lift a note, or trigger a simple switch.", "Drawback: the thread remembers motions that were never yours. After each use, your first Sleight of Hand or other delicate Dexterity check before a short rest is made with disadvantage.")
  }),
  equipment({
    name: "Sealed Artifact 2-118: Coffin Lid Gavel",
    folder: F.artifacts,
    img: "icons/svg/damage/necrotic.svg",
    price: 5600,
    weight: 3,
    rarity: "veryRare",
    mag: true,
    att: "required",
    uses: { max: "2", spent: 0, recovery: [] },
    activities: [save("Funerary Jurisdiction", { consumeUses: true, rangeUnits: "ft", rangeValue: 30, templateType: "radius", templateSize: 15, saveAbility: "wis", dcFormula: 15, onSave: "none" })],
    desc: html("<em>Sealed Artifact 2-118, very rare, attunement required. Corpse Collector Pathway, derived from Underworld Authority and Sealing Edict.</em>", "Strike the gavel to establish a 15-foot funerary jurisdiction within 30 feet for 1 minute. Spirits, undead, and corpse-puppets in the area must make a DC 15 Wisdom save; on a failure they cannot take reactions and their speed is halved until the end of their next turn.", "Drawback: each use unsettles nearby death. For the next hour, unattended corpses within 60 feet may knock, twitch, or murmur once when you pass.")
  }),
  equipment({
    name: "Sealed Artifact 2-133: Mirror Fugue Compact",
    folder: F.artifacts,
    img: "icons/svg/schools/illusion.svg",
    price: 6100,
    weight: 1,
    rarity: "veryRare",
    mag: true,
    att: "required",
    uses: { max: "2", spent: 0, recovery: [] },
    activities: [util("Fugue Double", { activationType: "bonus", consumeUses: true, durationValue: "1", durationUnits: "minute", targetType: "self" })],
    desc: html("<em>Sealed Artifact 2-133, very rare, attunement required. Mirror-themed authority, derived from Mirror Persona and Mirror Blink.</em>", "For 1 minute, a mirrored double haunts your movements. The first attack against you each round is made with disadvantage, and once during the effect you may swap places with your double as a reaction.", "Drawback: reflected routes briefly feel more trustworthy than real ones. Until a short rest, you have disadvantage on the first Survival, Investigation, or navigation check you make involving physical space or directions.")
  }),
  equipment({
    name: "Sealed Artifact 2-147: Pilgrim's Chalk Door",
    folder: F.artifacts,
    img: "icons/svg/schools/conjuration.svg",
    price: 6800,
    weight: 1,
    rarity: "legendary",
    mag: true,
    att: "required",
    uses: { max: "2", spent: 0, recovery: [] },
    activities: [util("Draw Passage", { activationType: "action", consumeUses: true, rangeUnits: "ft", rangeValue: 60, targetType: "self" })],
    desc: html("<em>Sealed Artifact 2-147, legendary, attunement required. Apprentice Pathway, derived from Traveler's Door and Underground Travel.</em>", "Draw a chalk outline on a nonmagical surface within reach to open a usable door for 1 round. The passage may lead through a wall, floor, or barrier to a location within 60 feet that you can accurately picture; up to three Medium creatures may pass before it collapses.", "Drawback: the artifact announces movement by sympathy. For 1 hour after use, doors, cabinets, and windows within 30 feet of you creak or tap when you approach them.")
  }),
  equipment({
    name: "Sealed Artifact 1-014: Tribunal Noose",
    folder: F.artifacts,
    img: "icons/svg/statuses/silenced.svg",
    price: 14000,
    weight: 2,
    rarity: "legendary",
    mag: true,
    att: "required",
    uses: { max: "1", spent: 0, recovery: [] },
    activities: [save("Pronounce Sentence", { consumeUses: true, rangeUnits: "ft", rangeValue: 60, targetType: "creature", targetCount: 1, saveAbility: "wis", dcFormula: 17, onSave: "none" })],
    desc: html("<em>Sealed Artifact 1-014, legendary, attunement required. Arbiter and Lawyer pathways, derived from Contract Dominion and Sanctified Verdict.</em>", "Choose one creature within 60 feet and speak a prohibition such as 'Do not flee,' 'Do not lie,' or 'Do not raise steel.' On a failed DC 17 Wisdom save, the creature is bound for 1 minute; the first attempted violation each round deals 2d6 psychic damage and wastes the action, attack, or movement used to attempt it.", "Drawback: while attuned, your own speech calcifies. Deliberate lies fail automatically, and every use imposes disadvantage on your next attempt to negotiate, compromise, or speak vaguely.")
  }),
  equipment({
    name: "Sealed Artifact 1-031: Funeral March Scepter",
    folder: F.artifacts,
    img: "icons/svg/damage/necrotic.svg",
    price: 16500,
    weight: 4,
    rarity: "legendary",
    mag: true,
    att: "required",
    uses: { max: "1", spent: 0, recovery: [] },
    activities: [save("Open the Procession", { consumeUses: true, rangeUnits: "ft", rangeValue: 90, templateType: "radius", templateSize: 30, saveAbility: "wis", dcFormula: 17, onSave: "none" })],
    desc: html("<em>Sealed Artifact 1-031, legendary, attunement required. Corpse Collector Pathway, derived from Door to the Underworld and Underworld Authority.</em>", "Open a 30-foot-radius funerary procession within 90 feet for 1 minute. Spirits, undead, and soul-damaged creatures in the area must make a DC 17 Wisdom save; on a failure they are pacified, cannot take reactions, and can move only toward or away from the center on their turns.", "Drawback: each use leaves a deathly escort in your wake. Until your next long rest, ordinary animals refuse your presence and sleepers within 60 feet dream of your funeral.")
  }),
  equipment({
    name: "Sealed Artifact 0-005: Crown of the False Sun",
    folder: F.artifacts,
    img: "icons/svg/damage/radiant.svg",
    price: 32000,
    weight: 2,
    rarity: "artifact",
    mag: true,
    att: "required",
    uses: { max: "1", spent: 0, recovery: [] },
    activities: [save("False Dawn", { consumeUses: true, durationValue: "1", durationUnits: "minute", templateType: "radius", templateSize: 60, saveAbility: "con", dcFormula: 18, parts: [dmgPart(3, 6, "radiant")], onSave: "half" })],
    desc: html("<em>Sealed Artifact 0-005, artifact, attunement required. Sun Pathway, derived from Unshadowed Domain, Sacred Sun, and Flaring Sun.</em>", "For 1 minute, you raise a 60-foot false dawn centered on yourself. Magical darkness, concealment, and invisibility are suppressed inside it. Once on each of your turns, choose one hostile creature in the area: it must make a DC 18 Constitution save or take 3d6 radiant damage and be blinded until the start of its next turn, or half damage on a success.", "Drawback: the crown burns identity into the world. After each use, make a DC 17 Wisdom save. On a failure, you gain one level of severe spiritual exhaustion and every creature that has ever seen you in person dreams of your silhouette at the next midnight.")
  })
];

async function readPack(name) {
  const db = new ClassicLevel(PACK(name), { valueEncoding: "utf8" });
  await db.open();
  const folders = [];
  const items = [];
  for await (const [key, value] of db.iterator()) {
    const doc = JSON.parse(value);
    if (key.startsWith("!folders!")) folders.push(doc);
    if (key.startsWith("!items!")) items.push(doc);
  }
  await db.close();
  return { folders, items };
}

async function writePack(name, docs, folders = []) {
  const db = new ClassicLevel(PACK(name), { valueEncoding: "utf8" });
  await db.open();
  const keys = [];
  for await (const [key] of db.iterator()) keys.push(key);
  const ops = keys.map((key) => ({ type: "del", key }));
  for (const folder of folders) ops.push({ type: "put", key: `!folders!${folder._id}`, value: JSON.stringify(folder) });
  for (const doc of docs) ops.push({ type: "put", key: `!items!${doc._id}`, value: JSON.stringify(doc) });
  await db.batch(ops);
  await db.close();
}

function normalizeItem(item) {
  const folder = TRAP_NAMES.has(item.name) ? F.traps : item.folder;
  const normalized = { ...item, folder };
  return {
    ...normalized,
    img: imageFor(normalized),
    _stats: { ...normalized._stats, modifiedTime: NOW, lastModifiedBy: "PlJLjweCoMIT3aIO" }
  };
}

function cloneForCategory(doc) {
  return {
    ...doc,
    folder: null,
    _stats: { ...doc._stats, modifiedTime: NOW, lastModifiedBy: "PlJLjweCoMIT3aIO" }
  };
}

function countByFolder(items) {
  const counts = { Armor: 0, Consumables: 0, Equipment: 0, Tools: 0, Traps: 0, Weapons: 0, "Sealed Artifacts": 0 };
  for (const item of items) {
    if (item.folder === F.armor) counts.Armor += 1;
    if (item.folder === F.consumables) counts.Consumables += 1;
    if (item.folder === F.equipment) counts.Equipment += 1;
    if (item.folder === F.tools) counts.Tools += 1;
    if (item.folder === F.traps) counts.Traps += 1;
    if (item.folder === F.weapons) counts.Weapons += 1;
    if (item.folder === F.artifacts) counts["Sealed Artifacts"] += 1;
  }
  return counts;
}

(async () => {
  const master = await readPack(MASTER_PACK);
  const existing = master.items.map(normalizeItem);
  const seen = new Set(existing.map((item) => item._id));
  const additions = NEW_ARTIFACTS.filter((item) => !seen.has(item._id)).map(normalizeItem);
  const allItems = [...existing, ...additions];

  await writePack(MASTER_PACK, allItems, master.folders);

  for (const [folderId, packName] of Object.entries(CATEGORY_PACKS)) {
    const subset = allItems.filter((item) => item.folder === folderId).map(cloneForCategory);
    await writePack(packName, subset, []);
  }

  console.log("Master counts");
  console.log(JSON.stringify(countByFolder(allItems), null, 2));
  for (const [folderId, packName] of Object.entries(CATEGORY_PACKS)) {
    const count = allItems.filter((item) => item.folder === folderId).length;
    console.log(`${packName}: ${count}`);
  }
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
