const fs = require('fs');
const path = require('path');
const { Level } = require('level');

const ROOT = process.cwd();
const PACKS = path.join(ROOT, 'packs');
const ACTOR_PACK = path.join(PACKS, 'lotm_actors');
const ACTORS24_PACK = path.join(PACKS, 'actors24');
const MONSTERS_PACK = path.join(PACKS, 'monsters');
const PATHWAYS_PACK = path.join(PACKS, 'lotm_pathways');
const ABILITIES_PACK = path.join(PACKS, 'lotm_abilities');
const ITEMS_PACK = path.join(PACKS, 'lotm_items');

const FOLDER_ID = '4ycYbyEyGS4OwxCe';
const FACTION = 'Church of Steam and Machinery';
const FAITH = 'God of Steam and Machinery';

const READER = 'lotmPathway00007';
const MYSTERY_PRYER = 'lotmPathway00014';
const SAVANT = 'lotmPathway00015';

const TEMPLATE_CHARACTER_ID = 'AkraLv0100000000';
const TEMPLATE_PRIEST_ID = 'PVD5wRdyO7iCJPs1';
const TEMPLATE_GUARD_ID = 'E9CvDPDg5dFEpVjS';

const ITEM_IDS = {
  conductorLantern: 'ddff4b9a492be86e',
  contractLedger: '49a73677ef427fa1',
  forgersPlateKit: '592bfffa1f5c003f',
  occultForensicsKit: '8e19a8fe8cacd89e',
  portableRitualBrazier: 'cffd8adaccf12060',
  ritualChalk: 'ef5fe145fd6c7ee3',
  silverRitualDagger: '1105230f11214924',
  spiritCompass: '3788199f6a00ad34',
  spiritVisionSalve: 'ef7fa2c215f54a76'
};

const MONSTER_ITEM_KEYS = {
  chainShirt: '!actors.items!E9CvDPDg5dFEpVjS.2reHgwNJRFbhmxqA',
  dagger: '!actors.items!5ngbctIMeEnuC1p1.io78wguVwNy9VfZ4',
  lightCrossbow: '!actors.items!EMvcuOpu7ABCmBWi.rNQK7okIBNZ2zDvD',
  quarterstaff: '!actors.items!K15Yl8JmB5iPircc.KUP8WEfLxlcY7K2x',
  mace: '!actors.items!PVD5wRdyO7iCJPs1.B0jROhxuoqvfmz2B'
};

const READER_ABILITIES = {
  9: ['lotmAbilityR9001', 'lotmAbilityR9002'],
  8: ['lotmAbilityR8001', 'lotmAbilityR8002'],
  7: ['lotmAbilityR7001', 'lotmAbilityR7002', 'lotmAbilityR7003'],
  6: ['lotmAbilityR6001', 'lotmAbilityR6002', 'lotmAbilityR6003'],
  5: ['lotmAbilityR5001', 'lotmAbilityR5002', 'lotmAbilityR5003'],
  4: ['lotmAbilityR4001', 'lotmAbilityR4002', 'lotmAbilityR4003', 'lotmAbilityR4004']
};

const PRYER_ABILITIES = {
  9: ['lotmAbilityP9001', 'lotmAbilityP9002'],
  8: ['lotmAbilityP8001', 'lotmAbilityP8002'],
  7: ['lotmAbilityP7001', 'lotmAbilityP7002', 'lotmAbilityP7003'],
  6: ['lotmAbilityP6001', 'lotmAbilityP6002', 'lotmAbilityP6003'],
  5: ['lotmAbilityP5001', 'lotmAbilityP5002', 'lotmAbilityP5003'],
  4: ['lotmAbilityP4001', 'lotmAbilityP4002', 'lotmAbilityP4003', 'lotmAbilityP4004']
};

const SAVANT_ABILITIES = {
  9: ['lotmAbilityT9001', 'lotmAbilityT9002'],
  8: ['lotmAbilityT8001', 'lotmAbilityT8002'],
  7: ['lotmAbilityT7001', 'lotmAbilityT7002', 'lotmAbilityT7003'],
  6: ['lotmAbilityT6001', 'lotmAbilityT6002', 'lotmAbilityT6003'],
  5: ['lotmAbilityT5001', 'lotmAbilityT5002', 'lotmAbilityT5003', 'lotmAbilityT5004']
};

const SLOT_OVERRIDES = {
  9: {},
  8: { spell1: 3 },
  7: { spell1: 3, spell2: 2 },
  6: { spell1: 4, spell2: 3, spell3: 2 },
  5: { spell1: 4, spell2: 3, spell3: 2, spell4: 1 },
  4: { spell1: 4, spell2: 3, spell3: 3, spell4: 2, spell5: 1 }
};

const SPIRITUALITY_BY_SEQUENCE = { 9: 10, 8: 12, 7: 24, 6: 34, 5: 50, 4: 82 };
const POTENCY_BY_SEQUENCE = { 9: 2, 8: 2, 7: 3, 6: 4, 5: 5, 4: 6 };
const RESISTANCE_BY_SEQUENCE = { 9: 2, 8: 2, 7: 3, 6: 4, 5: 5, 4: 6 };

const ACTORS = [
  {
    kind: 'npc',
    name: 'Steam Church Parish Mechanic',
    role: 'church of steam parish mechanic',
    template: 'priest',
    img: 'systems/lotm/tokens/humanoid/Noble.webp',
    description: '<p>A lay technician who keeps lifts, lamps, boilers, and workshop shrines running in ordinary parishes. Useful for repairs, sabotage scenes, and grounded industrial logistics.</p>',
    alignment: 'Lawful Neutral',
    cr: 0.125,
    hp: 11,
    hpFormula: '2d8+2',
    abilities: { str: 10, dex: 10, con: 11, int: 13, wis: 12, cha: 11 },
    languages: { value: ['common'], custom: 'workshop slang and maintenance shorthand' },
    items: ['conductorLantern', 'forgersPlateKit', 'quarterstaff']
  },
  {
    kind: 'npc',
    name: 'Steam Church Contract Clerk',
    role: 'church of steam contract clerk',
    template: 'priest',
    img: 'systems/lotm/tokens/humanoid/Spy.webp',
    description: '<p>A procurement official who handles tenders, sealed requisitions, and church-backed industrial charters. Useful for negotiations, permit barriers, and faction leverage without combat.</p>',
    alignment: 'Lawful Neutral',
    cr: 0.5,
    hp: 18,
    hpFormula: '4d8',
    abilities: { str: 9, dex: 11, con: 11, int: 14, wis: 13, cha: 14 },
    languages: { value: ['common'], custom: 'contract cant and ministry bookkeeping' },
    items: ['contractLedger', 'forgersPlateKit', 'dagger']
  },
  {
    kind: 'npc',
    name: 'Steam Church Relay Tower Warden',
    role: 'church of steam relay tower warden',
    template: 'guard',
    img: 'systems/lotm/tokens/humanoid/Scout.webp',
    description: '<p>A signal-watch guard assigned to relay towers, foundry roofs, and machine halls where sabotage can become catastrophe. Built as a practical sentry and skirmish escort.</p>',
    alignment: 'Lawful Neutral',
    cr: 0.5,
    hp: 20,
    hpFormula: '4d8+2',
    abilities: { str: 11, dex: 14, con: 12, int: 10, wis: 13, cha: 10 },
    languages: { value: ['common'], custom: 'signal-flags and watch rotations' },
    items: ['chainShirt', 'lightCrossbow', 'dagger', 'conductorLantern']
  },
  {
    kind: 'character',
    name: 'Steam Church Savant Novice',
    img: 'systems/lotm/tokens/humanoid/ApprenticeWizard.webp',
    description: '<p>A newly advanced Savant trusted with maintenance logs, defect checks, and supervised workshop rites. Useful as a low-tier engineer, assistant, or technical escort.</p>',
    alignment: 'Lawful Neutral',
    pathway: SAVANT,
    sequence: 9,
    hp: 12,
    abilities: { str: 9, dex: 11, con: 11, int: 15, wis: 12, cha: 10 },
    languages: { value: ['common'], custom: 'maintenance notation and guild jargon' },
    gear: ['conductorLantern', 'forgersPlateKit', 'quarterstaff']
  },
  {
    kind: 'character',
    name: 'Steam Church Calibration Acolyte',
    img: 'systems/lotm/tokens/humanoid/Acolyte.webp',
    description: '<p>A sequence-eight Savant assigned to tune ritual engines, shrine dynamos, and sealed workshop devices before they become dangerous. Best used as a support engineer under pressure.</p>',
    alignment: 'Lawful Neutral',
    pathway: SAVANT,
    sequence: 8,
    hp: 16,
    abilities: { str: 9, dex: 11, con: 11, int: 16, wis: 13, cha: 10 },
    languages: { value: ['common'], custom: 'calibration script and workshop hand signs' },
    gear: ['conductorLantern', 'forgersPlateKit', 'portableRitualBrazier']
  },
  {
    kind: 'character',
    name: 'Steam Church Relay Inspector',
    img: 'systems/lotm/tokens/humanoid/Scout.webp',
    description: '<p>A field Savant who audits rail relays, liftworks, and pressure systems for sabotage, hidden flaws, and unsafe improvisation. Built for site control and practical investigations.</p>',
    alignment: 'Neutral',
    pathway: SAVANT,
    sequence: 7,
    hp: 30,
    abilities: { str: 10, dex: 12, con: 12, int: 17, wis: 13, cha: 10 },
    languages: { value: ['common'], custom: 'inspection codes and relay cant' },
    gear: ['conductorLantern', 'spiritCompass', 'lightCrossbow']
  },
  {
    kind: 'character',
    name: 'Steam Church Ruin Surveyor',
    img: 'systems/lotm/tokens/humanoid/Mage.webp',
    description: '<p>A Savant attached to excavation teams and buried machine-temples, trusted to read structural history before others trigger a collapse or curse. Functions as an explorer, analyst, and encounter guide.</p>',
    alignment: 'Neutral',
    pathway: SAVANT,
    sequence: 7,
    hp: 29,
    abilities: { str: 9, dex: 11, con: 12, int: 17, wis: 14, cha: 10 },
    languages: { value: ['common'], custom: 'ruin diagrams and survey shorthand' },
    gear: ['occultForensicsKit', 'spiritCompass', 'dagger']
  },
  {
    kind: 'character',
    name: 'Steam Church Artifact Appraiser',
    img: 'systems/lotm/tokens/humanoid/MageOrb.webp',
    description: '<p>A mid-tier Savant assigned to sealed vaults, prototype relics, and unstable church machinery. Useful for hazard control, technical support, and relic-driven encounters.</p>',
    alignment: 'Lawful Neutral',
    pathway: SAVANT,
    sequence: 6,
    hp: 38,
    abilities: { str: 9, dex: 11, con: 12, int: 17, wis: 14, cha: 10 },
    languages: { value: ['common'], custom: 'vault codes and appraisal notation' },
    gear: ['conductorLantern', 'occultForensicsKit', 'spiritCompass']
  },
  {
    kind: 'character',
    name: 'Steam Church Furnace Deacon',
    img: 'systems/lotm/tokens/humanoid/Priest.webp',
    description: '<p>A senior workshop deacon who keeps foundry shrines, purification furnaces, and ritual fixtures stable during crises. Strong as a command-support engineer with real battlefield utility.</p>',
    alignment: 'Lawful Neutral',
    pathway: SAVANT,
    sequence: 6,
    hp: 40,
    abilities: { str: 10, dex: 10, con: 13, int: 17, wis: 14, cha: 12 },
    languages: { value: ['common'], custom: 'liturgical process calls and foundry cant' },
    gear: ['conductorLantern', 'portableRitualBrazier', 'mace']
  },
  {
    kind: 'character',
    name: 'Steam Church Ordinance Canon',
    img: 'systems/lotm/tokens/humanoid/Veteran.webp',
    description: '<p>An elite Savant who oversees weaponized prototypes, armored escorts, and emergency fabrication under battlefield conditions. Works as a durable controller and industrial tactician.</p>',
    alignment: 'Lawful Neutral',
    pathway: SAVANT,
    sequence: 5,
    hp: 54,
    abilities: { str: 11, dex: 11, con: 13, int: 18, wis: 14, cha: 12 },
    languages: { value: ['common'], custom: 'ordnance marks and restricted workshop doctrine' },
    gear: ['conductorLantern', 'spiritCompass', 'chainShirt', 'lightCrossbow']
  },
  {
    kind: 'character',
    name: 'Steam Church Grand Fabricator',
    img: 'systems/lotm/tokens/humanoid/Archmage.webp',
    description: '<p>A saint-grade industrial hierophant trusted with relic programs, emergency production, and church machine infrastructure at regional scale. This is the folder’s leader-grade engineer and capstone threat.</p>',
    alignment: 'Lawful Neutral',
    pathway: SAVANT,
    sequence: 4,
    hp: 92,
    abilities: { str: 10, dex: 11, con: 13, int: 19, wis: 15, cha: 13 },
    languages: { value: ['common'], custom: 'sealed design doctrine and saint-tier fabrication codes' },
    gear: ['conductorLantern', 'spiritCompass', 'portableRitualBrazier', 'ritualChalk', 'silverRitualDagger']
  }
];

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function randomId(length = 16) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let out = '';
  for (let i = 0; i < length; i += 1) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

function seqToClassLevel(sequence) {
  return 10 - sequence;
}

function cumulativeAbilityIds(sequenceMap, sequence) {
  const ids = [];
  for (const seq of Object.keys(sequenceMap).map(Number).sort((a, b) => b - a)) {
    if (seq >= sequence) ids.push(...sequenceMap[seq]);
  }
  return ids;
}

function buildSpellSlots(sequence) {
  const spells = {
    spell1: { value: 0 },
    spell2: { value: 0 },
    spell3: { value: 0 },
    spell4: { value: 0 },
    spell5: { value: 0 },
    spell6: { value: 0 },
    spell7: { value: 0 },
    spell8: { value: 0 },
    spell9: { value: 0 },
    pact: { value: 0 }
  };
  const overrides = SLOT_OVERRIDES[sequence] || {};
  for (const [slot, value] of Object.entries(overrides)) spells[slot] = { value, override: value };
  return spells;
}

async function scanKey(db, key) {
  for await (const [entryKey, value] of db.iterator({ gte: key, lte: key })) {
    if (entryKey === key) return value;
  }
  throw new Error(`Missing doc: ${key}`);
}

async function loadSources() {
  const actors24Db = new Level(ACTORS24_PACK, { valueEncoding: 'json' });
  const monstersDb = new Level(MONSTERS_PACK, { valueEncoding: 'json' });
  const pathwaysDb = new Level(PATHWAYS_PACK, { valueEncoding: 'json' });
  const abilitiesDb = new Level(ABILITIES_PACK, { valueEncoding: 'json' });
  const itemsDb = new Level(ITEMS_PACK, { valueEncoding: 'json' });

  try {
    const [characterTemplate, priestTemplate, guardTemplate] = await Promise.all([
      scanKey(actors24Db, `!actors!${TEMPLATE_CHARACTER_ID}`),
      scanKey(monstersDb, `!actors!${TEMPLATE_PRIEST_ID}`),
      scanKey(monstersDb, `!actors!${TEMPLATE_GUARD_ID}`)
    ]);

    const docs = {};
    for (const id of [READER, MYSTERY_PRYER, SAVANT]) {
      docs[id] = await scanKey(pathwaysDb, `!items!${id}`);
    }

    const abilityIds = new Set([
      ...Object.values(READER_ABILITIES).flat(),
      ...Object.values(PRYER_ABILITIES).flat(),
      ...Object.values(SAVANT_ABILITIES).flat()
    ]);
    for (const id of abilityIds) docs[id] = await scanKey(abilitiesDb, `!items!${id}`);

    for (const id of Object.values(ITEM_IDS)) docs[id] = await scanKey(itemsDb, `!items!${id}`);
    for (const key of Object.values(MONSTER_ITEM_KEYS)) docs[key] = await scanKey(monstersDb, key);

    return { characterTemplate, priestTemplate, guardTemplate, docs };
  } finally {
    await Promise.allSettled([
      actors24Db.close(),
      monstersDb.close(),
      pathwaysDb.close(),
      abilitiesDb.close(),
      itemsDb.close()
    ]);
  }
}

function prepareEmbedded(doc) {
  const item = clone(doc);
  item._id = randomId();
  item.folder = null;
  item.sort = 0;
  return item;
}

function baseCharacter(template, spec) {
  const actor = clone(template);
  actor._id = randomId();
  actor.name = spec.name;
  actor.type = 'character';
  actor.folder = FOLDER_ID;
  actor.img = spec.img;
  actor.items = [];
  actor.effects = [];
  actor.flags = actor.flags || {};
  actor.flags.lotm = {
    sourceBook: 'LoTM Core',
    faction: FACTION,
    organization: FACTION
  };
  actor.prototypeToken = actor.prototypeToken || {};
  actor.prototypeToken.texture = actor.prototypeToken.texture || {};
  actor.prototypeToken.texture.src = spec.img;

  actor.system.details.biography.value = spec.description;
  actor.system.details.alignment = spec.alignment;
  actor.system.details.race = null;
  actor.system.details.background = null;
  actor.system.details.faith = FAITH;
  actor.system.details.faction = FACTION;
  actor.system.details.organization = FACTION;

  actor.system.traits.languages.value = spec.languages.value;
  actor.system.traits.languages.custom = spec.languages.custom;
  actor.system.traits.weaponProf.value = ['sim'];
  actor.system.traits.weaponProf.custom = '';
  actor.system.traits.armorProf.value = ['lgt'];
  actor.system.traits.armorProf.custom = '';

  for (const [ability, value] of Object.entries(spec.abilities)) actor.system.abilities[ability].value = value;

  actor.system.attributes.hp.value = spec.hp;
  actor.system.attributes.hp.max = spec.hp;
  actor.system.attributes.spirituality = actor.system.attributes.spirituality || {
    value: 0,
    max: 0,
    temp: 0,
    tempmax: 0,
    formula: ''
  };
  actor.system.attributes.corruption = actor.system.attributes.corruption || {
    value: 0,
    max: 100,
    temp: 0,
    tempmax: 0
  };
  actor.system.attributes.spirituality.value = SPIRITUALITY_BY_SEQUENCE[spec.sequence];
  actor.system.attributes.spirituality.max = SPIRITUALITY_BY_SEQUENCE[spec.sequence];
  actor.system.attributes.potency = POTENCY_BY_SEQUENCE[spec.sequence];
  actor.system.attributes.resistance = RESISTANCE_BY_SEQUENCE[spec.sequence];
  actor.system.attributes.stability = 100;
  actor.system.attributes.corruption.value = 0;
  actor.system.attributes.corruption.max = 100;
  actor.system.spells = buildSpellSlots(spec.sequence);

  return actor;
}

function baseNpc(template, spec) {
  const actor = clone(template);
  actor._id = randomId();
  actor.name = spec.name;
  actor.type = 'npc';
  actor.folder = FOLDER_ID;
  actor.img = spec.img;
  actor.items = [];
  actor.effects = [];
  actor.flags = actor.flags || {};
  actor.flags.lotm = {
    sourceBook: 'LoTM Core',
    faction: FACTION,
    organization: FACTION
  };
  actor.prototypeToken = actor.prototypeToken || {};
  actor.prototypeToken.texture = actor.prototypeToken.texture || {};
  actor.prototypeToken.texture.src = spec.img;

  actor.system.details.biography.value = spec.description;
  actor.system.details.alignment = spec.alignment;
  actor.system.details.type.value = 'humanoid';
  actor.system.details.type.subtype = FACTION;
  actor.system.details.type.custom = spec.role;
  actor.system.details.cr = spec.cr;
  actor.system.details.spellLevel = 0;
  actor.system.details.faction = FACTION;
  actor.system.details.organization = FACTION;

  actor.system.traits.languages.value = spec.languages.value;
  actor.system.traits.languages.custom = spec.languages.custom;

  for (const [ability, value] of Object.entries(spec.abilities)) actor.system.abilities[ability].value = value;

  actor.system.attributes.hp.value = spec.hp;
  actor.system.attributes.hp.max = spec.hp;
  actor.system.attributes.hp.formula = spec.hpFormula;
  actor.system.attributes.spellcasting = '';
  actor.system.spells = {
    spell1: { value: 0 },
    spell2: { value: 0 },
    spell3: { value: 0 },
    spell4: { value: 0 },
    spell5: { value: 0 },
    spell6: { value: 0 },
    spell7: { value: 0 },
    spell8: { value: 0 },
    spell9: { value: 0 },
    pact: { value: 0 }
  };

  return actor;
}

function pathwayAbilities(pathway, sequence) {
  if (pathway === READER) return cumulativeAbilityIds(READER_ABILITIES, sequence);
  if (pathway === MYSTERY_PRYER) return cumulativeAbilityIds(PRYER_ABILITIES, sequence);
  if (pathway === SAVANT) return cumulativeAbilityIds(SAVANT_ABILITIES, sequence);
  return [];
}

function buildActorAndItems(spec, templates, docs) {
  const actor = spec.kind === 'character'
    ? baseCharacter(templates.characterTemplate, spec)
    : baseNpc(spec.template === 'guard' ? templates.guardTemplate : templates.priestTemplate, spec);

  const embedded = [];

  if (spec.kind === 'character') {
    const classItem = prepareEmbedded(docs[spec.pathway]);
    classItem.system = classItem.system || {};
    classItem.system.levels = seqToClassLevel(spec.sequence);
    embedded.push(classItem);
    actor.system.details.originalClass = classItem._id;

    for (const abilityId of pathwayAbilities(spec.pathway, spec.sequence)) embedded.push(prepareEmbedded(docs[abilityId]));
    for (const gearId of spec.gear) embedded.push(prepareEmbedded(docs[ITEM_IDS[gearId] || MONSTER_ITEM_KEYS[gearId] || gearId]));
  } else {
    actor.system.details.originalClass = null;
    for (const gearId of spec.items) embedded.push(prepareEmbedded(docs[ITEM_IDS[gearId] || MONSTER_ITEM_KEYS[gearId] || gearId]));
  }

  actor.items = embedded.map(item => item._id);
  return { actor, embedded };
}

async function main() {
  const templatesAndDocs = await loadSources();
  const actorDb = new Level(ACTOR_PACK, { valueEncoding: 'json' });
  const ops = [];
  let createdActors = 0;
  let createdItems = 0;

  try {
    await actorDb.open();
    const namesToDelete = new Set(ACTORS.map(a => a.name));
    const actorIdsToDelete = [];

    for await (const [key, value] of actorDb.iterator({ gte: '!actors!', lte: '!actors!~' })) {
      if (namesToDelete.has(value?.name)) actorIdsToDelete.push(value._id);
    }

    for (const actorId of actorIdsToDelete) {
      ops.push({ type: 'del', key: `!actors!${actorId}` });
      for await (const [key] of actorDb.iterator({ gte: `!actors.items!${actorId}.`, lte: `!actors.items!${actorId}.~` })) ops.push({ type: 'del', key });
    }

    for (const spec of ACTORS) {
      const { actor, embedded } = buildActorAndItems(spec, templatesAndDocs, templatesAndDocs.docs);
      ops.push({ type: 'put', key: `!actors!${actor._id}`, value: actor });
      for (const item of embedded) ops.push({ type: 'put', key: `!actors.items!${actor._id}.${item._id}`, value: item });
      createdActors += 1;
      createdItems += embedded.length;
    }

    await actorDb.batch(ops);
    console.log(JSON.stringify({ createdActors, createdItems }, null, 2));
  } finally {
    await actorDb.close();
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
