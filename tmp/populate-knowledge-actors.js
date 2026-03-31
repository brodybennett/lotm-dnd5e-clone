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

const FOLDER_ID = 'b06vFqCe16HfSgvx';
const FACTION = 'Church of Knowledge and Wisdom';
const FAITH = 'God of Knowledge and Wisdom';

const READER = 'lotmPathway00007';
const MYSTERY_PRYER = 'lotmPathway00014';
const SAVANT = 'lotmPathway00015';

const TEMPLATE_CHARACTER_ID = 'AkraLv0100000000';
const TEMPLATE_PRIEST_ID = 'PVD5wRdyO7iCJPs1';
const TEMPLATE_GUARD_ID = 'E9CvDPDg5dFEpVjS';

const ITEM_IDS = {
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
    name: 'Wisdom Church Archive Clerk',
    role: 'church of knowledge archive clerk',
    template: 'priest',
    img: 'systems/lotm/tokens/humanoid/Noble.webp',
    description: '<p>A lay archivist who manages sensitive ledgers, requisitions, and doctrinal records. Useful in social scenes, bureaucratic obstacles, and quiet information leaks.</p>',
    alignment: 'Lawful Neutral',
    cr: 0.125,
    hp: 11,
    hpFormula: '2d8+2',
    abilities: { str: 9, dex: 10, con: 11, int: 14, wis: 13, cha: 12 },
    languages: { value: ['common'], custom: 'scholarly shorthand and bureaucratic cant' },
    items: ['forgersPlateKit', 'quarterstaff']
  },
  {
    kind: 'npc',
    name: 'Wisdom Church Cipher Examiner',
    role: 'church of knowledge cipher examiner',
    template: 'priest',
    img: 'systems/lotm/tokens/humanoid/Spy.webp',
    description: '<p>An investigator trained to compare testimony, detect document tampering, and reconstruct occult incidents from residue and contradiction. Strong as a handler or mystery-support NPC.</p>',
    alignment: 'Neutral',
    cr: 0.5,
    hp: 18,
    hpFormula: '4d8',
    abilities: { str: 9, dex: 12, con: 11, int: 15, wis: 14, cha: 11 },
    languages: { value: ['common'], custom: 'cipher cant and ritual notation' },
    items: ['occultForensicsKit', 'spiritCompass', 'silverRitualDagger']
  },
  {
    kind: 'npc',
    name: 'Wisdom Church Observatory Warden',
    role: 'church of knowledge observatory warden',
    template: 'guard',
    img: 'systems/lotm/tokens/humanoid/Scout.webp',
    description: '<p>A roofline scout and night watchman assigned to observatories, libraries, and relay towers. Useful as a practical sentry who spots tampering before scholars do.</p>',
    alignment: 'Lawful Neutral',
    cr: 0.5,
    hp: 20,
    hpFormula: '4d8+2',
    abilities: { str: 11, dex: 14, con: 12, int: 11, wis: 13, cha: 10 },
    languages: { value: ['common'], custom: 'signal-codes and watch rotations' },
    items: ['chainShirt', 'lightCrossbow', 'dagger', 'spiritCompass']
  },
  {
    kind: 'character',
    name: 'Wisdom Church Reader Novice',
    img: 'systems/lotm/tokens/humanoid/ApprenticeWizard.webp',
    description: '<p>A newly advanced Reader trusted with catalog work, text comparison, and supervised inquiries. Useful as a low-tier investigator or studious escort.</p>',
    alignment: 'Lawful Neutral',
    pathway: READER,
    sequence: 9,
    hp: 12,
    abilities: { str: 8, dex: 11, con: 11, int: 15, wis: 13, cha: 10 },
    languages: { value: ['common'], custom: 'formal liturgy and filing shorthand' },
    gear: ['forgersPlateKit', 'quarterstaff']
  },
  {
    kind: 'character',
    name: 'Wisdom Church Index Theologian',
    img: 'systems/lotm/tokens/humanoid/Priest.webp',
    description: '<p>A sequence-eight Reader who maintains secure doctrinal indexes and reinforces archives against theft, forgery, and hasty ritual errors. Best used as a support Beyonder.</p>',
    alignment: 'Lawful Neutral',
    pathway: READER,
    sequence: 8,
    hp: 16,
    abilities: { str: 8, dex: 11, con: 11, int: 16, wis: 14, cha: 11 },
    languages: { value: ['common'], custom: 'ecclesiastical code-phrases' },
    gear: ['forgersPlateKit', 'portableRitualBrazier', 'ritualChalk']
  },
  {
    kind: 'character',
    name: 'Wisdom Church Case Analyst',
    img: 'systems/lotm/tokens/humanoid/Mage.webp',
    description: '<p>A field Reader assigned to doctrinal disputes, artifact thefts, and layered conspiracies. Built for clue extraction, procedural control, and informed counterplay.</p>',
    alignment: 'Neutral',
    pathway: READER,
    sequence: 7,
    hp: 30,
    abilities: { str: 9, dex: 12, con: 12, int: 17, wis: 14, cha: 11 },
    languages: { value: ['common'], custom: 'case notation and legal citations' },
    gear: ['occultForensicsKit', 'spiritCompass', 'dagger']
  },
  {
    kind: 'character',
    name: 'Wisdom Church Mysticism Lecturer',
    img: 'systems/lotm/tokens/humanoid/Witch.webp',
    description: '<p>An occult scholar who trains junior clergy in ritual theory, spirit inquiry, and the safe interpretation of dangerous mysteries. Functions as a ritualist, advisor, and strange support piece.</p>',
    alignment: 'Neutral Good',
    pathway: MYSTERY_PRYER,
    sequence: 7,
    hp: 29,
    abilities: { str: 8, dex: 11, con: 12, int: 15, wis: 17, cha: 12 },
    languages: { value: ['common'], custom: 'occult notation and prayer-ciphers' },
    gear: ['portableRitualBrazier', 'ritualChalk', 'silverRitualDagger', 'spiritVisionSalve']
  },
  {
    kind: 'character',
    name: 'Wisdom Church Relic Methodologist',
    img: 'systems/lotm/tokens/humanoid/MageOrb.webp',
    description: '<p>A Savant assigned to sealed vaults and unstable relics, more engineer than preacher. Useful for technical support, hazard control, and artifact-driven encounters.</p>',
    alignment: 'Lawful Neutral',
    pathway: SAVANT,
    sequence: 6,
    hp: 38,
    abilities: { str: 9, dex: 12, con: 12, int: 17, wis: 14, cha: 10 },
    languages: { value: ['common'], custom: 'technical shorthand and workshop signs' },
    gear: ['forgersPlateKit', 'spiritCompass', 'lightCrossbow']
  },
  {
    kind: 'character',
    name: 'Wisdom Church Archive Provost',
    img: 'systems/lotm/tokens/humanoid/Noble.webp',
    description: '<p>A senior Reader who directs investigators, controls access to restricted shelves, and turns correct procedure into battlefield leverage. Strong as a command-support operator.</p>',
    alignment: 'Lawful Neutral',
    pathway: READER,
    sequence: 6,
    hp: 40,
    abilities: { str: 9, dex: 11, con: 12, int: 18, wis: 15, cha: 13 },
    languages: { value: ['common'], custom: 'administrative doctrine and coded directives' },
    gear: ['forgersPlateKit', 'spiritCompass', 'portableRitualBrazier']
  },
  {
    kind: 'character',
    name: 'Wisdom Church White Tower Canon',
    img: 'systems/lotm/tokens/humanoid/Priest.webp',
    description: '<p>An elite doctrinal authority whose deductions reshape a scene before steel is drawn. Works as an encounter controller, social heavyweight, or high-status inquest leader.</p>',
    alignment: 'Lawful Neutral',
    pathway: READER,
    sequence: 5,
    hp: 54,
    abilities: { str: 9, dex: 11, con: 12, int: 18, wis: 16, cha: 14 },
    languages: { value: ['common'], custom: 'high liturgy and restricted doctrine' },
    gear: ['spiritCompass', 'portableRitualBrazier', 'ritualChalk', 'silverRitualDagger']
  },
  {
    kind: 'character',
    name: 'Wisdom Church Oracle Dean',
    img: 'systems/lotm/tokens/humanoid/Archmage.webp',
    description: '<p>A rare White Tower authority trusted with doctrinal crises, hostile negotiations, and the interpretation of impossible patterns. This is the folder’s leader-grade strategist and capstone intellect.</p>',
    alignment: 'Lawful Neutral',
    pathway: READER,
    sequence: 4,
    hp: 92,
    abilities: { str: 9, dex: 12, con: 13, int: 19, wis: 17, cha: 14 },
    languages: { value: ['common'], custom: 'sealed doctrine, legal formulae, and prophecy indices' },
    gear: ['spiritCompass', 'portableRitualBrazier', 'ritualChalk', 'silverRitualDagger', 'spiritVisionSalve']
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
