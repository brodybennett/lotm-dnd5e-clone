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

const FOLDER_ID = 'XJblceskvm04bW3B';
const FACTION = 'Church of Storms';
const FAITH = 'Lord of Storms';

const SAILOR = 'lotmPathway00006';
const APPRENTICE = 'lotmPathway00004';
const WARRIOR = 'lotmPathway00011';

const TEMPLATE_CHARACTER_ID = 'AkraLv0100000000';
const TEMPLATE_PRIEST_ID = 'PVD5wRdyO7iCJPs1';
const TEMPLATE_GUARD_ID = 'E9CvDPDg5dFEpVjS';

const ITEM_IDS = {
  claritySalts: 'f7e8cd83bdafe4b6',
  conductorLantern: 'ddff4b9a492be86e',
  ritualChalk: 'ef5fe145fd6c7ee3',
  saltTideRosary: '9f3c6aa1845b8a9a',
  silverRitualDagger: '1105230f11214924',
  spiritCompass: '3788199f6a00ad34',
  stormSealedGreatcoat: 'c45bc974afe9525d',
  stormglassHarpoon: '880ac81edba6f8ba',
  portableRitualBrazier: 'cffd8adaccf12060',
  spiritVisionSalve: 'ef7fa2c215f54a76'
};

const MONSTER_ITEM_KEYS = {
  chainShirt: '!actors.items!E9CvDPDg5dFEpVjS.2reHgwNJRFbhmxqA',
  dagger: '!actors.items!5ngbctIMeEnuC1p1.io78wguVwNy9VfZ4',
  lightCrossbow: '!actors.items!EMvcuOpu7ABCmBWi.rNQK7okIBNZ2zDvD',
  quarterstaff: '!actors.items!K15Yl8JmB5iPircc.KUP8WEfLxlcY7K2x',
  mace: '!actors.items!PVD5wRdyO7iCJPs1.B0jROhxuoqvfmz2B'
};

const SAILOR_ABILITIES = {
  9: ['lotmAbilityL9001', 'lotmAbilityL9002'],
  8: ['lotmAbilityL8001', 'lotmAbilityL8002'],
  7: ['lotmAbilityL7001', 'lotmAbilityL7002', 'lotmAbilityL7003'],
  6: ['lotmAbilityL6001', 'lotmAbilityL6002', 'lotmAbilityL6003'],
  5: ['lotmAbilityL5001', 'lotmAbilityL5002', 'lotmAbilityL5003'],
  4: ['lotmAbilityL4001', 'lotmAbilityL4002', 'lotmAbilityL4003', 'lotmAbilityL4004']
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
    name: 'Storm Church Dockside Deacon',
    role: 'church of storms dockside deacon',
    template: 'priest',
    img: 'systems/lotm/tokens/humanoid/Noble.webp',
    description: '<p>A shore priest who settles disputes between crews, handles storm relief, and keeps the harbor faithful loyal to the church. Useful as a social gatekeeper and local authority.</p>',
    alignment: 'Neutral',
    cr: 0.125,
    hp: 11,
    hpFormula: '2d8+2',
    abilities: { str: 10, dex: 10, con: 11, int: 10, wis: 13, cha: 13 },
    languages: { value: ['common'], custom: 'dock cant and sailor blessings' },
    items: ['conductorLantern', 'saltTideRosary', 'mace']
  },
  {
    kind: 'npc',
    name: 'Storm Church Lighthouse Keeper',
    role: 'church of storms lighthouse keeper',
    template: 'guard',
    img: 'systems/lotm/tokens/humanoid/Scout.webp',
    description: '<p>A practical sentry who watches reefs, smugglers, and unnatural fog from the church’s tower lights. Useful as a lookout, guide, and early warning contact.</p>',
    alignment: 'Lawful Neutral',
    cr: 0.5,
    hp: 18,
    hpFormula: '4d8',
    abilities: { str: 11, dex: 13, con: 12, int: 10, wis: 13, cha: 10 },
    languages: { value: ['common'], custom: 'signal lamps and reef marks' },
    items: ['conductorLantern', 'lightCrossbow', 'dagger']
  },
  {
    kind: 'npc',
    name: 'Storm Church Wharf Press-Ganger',
    role: 'church of storms wharf press-ganger',
    template: 'guard',
    img: 'systems/lotm/tokens/humanoid/Guard.webp',
    description: '<p>A rough harbor enforcer used to seize contraband, impress rowdy deckhands, and back the church’s will with a boarding pike and bad weather. Useful as a low-tier frontline nuisance.</p>',
    alignment: 'Lawful Neutral',
    cr: 0.5,
    hp: 20,
    hpFormula: '4d8+2',
    abilities: { str: 13, dex: 11, con: 12, int: 9, wis: 11, cha: 10 },
    languages: { value: ['common'], custom: 'wharf slang' },
    items: ['chainShirt', 'stormglassHarpoon', 'claritySalts']
  },
  {
    kind: 'character',
    name: 'Storm Church Tide-Rider Novice',
    img: 'systems/lotm/tokens/humanoid/ApprenticeWizard.webp',
    description: '<p>A newly advanced Sailor trusted with sea watches, storm vigils, and rough escort duty near the docks. Useful as a low-tier skirmisher with maritime flavor.</p>',
    alignment: 'Chaotic Neutral',
    pathway: SAILOR,
    sequence: 9,
    hp: 12,
    abilities: { str: 13, dex: 12, con: 12, int: 9, wis: 11, cha: 10 },
    languages: { value: ['common'], custom: 'deck curses and storm prayer refrains' },
    gear: ['stormglassHarpoon', 'claritySalts']
  },
  {
    kind: 'character',
    name: 'Storm Church Gale Acolyte',
    img: 'systems/lotm/tokens/humanoid/Acolyte.webp',
    description: '<p>A sequence-eight Sailor who leads shrine chants during foul weather and whips lesser believers into motion when rain and surf turn deadly. Best used as a mobile support threat.</p>',
    alignment: 'Chaotic Neutral',
    pathway: SAILOR,
    sequence: 8,
    hp: 16,
    abilities: { str: 14, dex: 12, con: 13, int: 9, wis: 11, cha: 10 },
    languages: { value: ['common'], custom: 'storm liturgy and deck-signals' },
    gear: ['stormglassHarpoon', 'conductorLantern']
  },
  {
    kind: 'character',
    name: 'Storm Church Squall Pursuer',
    img: 'systems/lotm/tokens/humanoid/Scout.webp',
    description: '<p>A field Sailor sent after smugglers, sea cults, and raiders who think rough water guarantees escape. Built as a fast pursuit unit and weather-pressure skirmisher.</p>',
    alignment: 'Chaotic Neutral',
    pathway: SAILOR,
    sequence: 7,
    hp: 30,
    abilities: { str: 15, dex: 13, con: 13, int: 9, wis: 12, cha: 10 },
    languages: { value: ['common'], custom: 'shore patrol whistles and chase signals' },
    gear: ['stormglassHarpoon', 'stormSealedGreatcoat', 'claritySalts']
  },
  {
    kind: 'character',
    name: 'Storm Church Wake Examiner',
    img: 'systems/lotm/tokens/humanoid/Mage.webp',
    description: '<p>A storm priest tasked with reading the residue left by wrecks, unnatural currents, and sea-borne ritual disturbances. Functions as an investigator, omen-reader, and occult support piece.</p>',
    alignment: 'Neutral',
    pathway: SAILOR,
    sequence: 7,
    hp: 29,
    abilities: { str: 13, dex: 12, con: 13, int: 10, wis: 13, cha: 10 },
    languages: { value: ['common'], custom: 'tidemark notation and omen chants' },
    gear: ['spiritCompass', 'ritualChalk', 'silverRitualDagger']
  },
  {
    kind: 'character',
    name: 'Storm Church Tempest Chaplain',
    img: 'systems/lotm/tokens/humanoid/MageOrb.webp',
    description: '<p>A veteran sea-priest who leads boarding prayers, storm exorcisms, and violent morale surges during naval action. Useful as a commander, support caster, and encounter anchor.</p>',
    alignment: 'Chaotic Neutral',
    pathway: SAILOR,
    sequence: 6,
    hp: 38,
    abilities: { str: 15, dex: 12, con: 14, int: 10, wis: 13, cha: 12 },
    languages: { value: ['common'], custom: 'battle hymns and shipboard calls' },
    gear: ['stormSealedGreatcoat', 'saltTideRosary', 'mace']
  },
  {
    kind: 'character',
    name: 'Storm Church Leviathan Warden',
    img: 'systems/lotm/tokens/humanoid/Priest.webp',
    description: '<p>A senior enforcer trusted with coastal shrines, prison hulks, and the suppression of sea monsters or heretical crews. Strong as a durable frontline Beyonder.</p>',
    alignment: 'Chaotic Neutral',
    pathway: SAILOR,
    sequence: 6,
    hp: 40,
    abilities: { str: 16, dex: 11, con: 14, int: 9, wis: 12, cha: 11 },
    languages: { value: ['common'], custom: 'coastal watch-codes' },
    gear: ['stormglassHarpoon', 'stormSealedGreatcoat', 'claritySalts']
  },
  {
    kind: 'character',
    name: 'Storm Church Sea Rite Canon',
    img: 'systems/lotm/tokens/humanoid/Veteran.webp',
    description: '<p>An elite storm canon who directs regional sea rites, punitive weather processions, and sacred naval hunts. Works as an encounter controller, ritualist, and social heavyweight.</p>',
    alignment: 'Chaotic Neutral',
    pathway: SAILOR,
    sequence: 5,
    hp: 54,
    abilities: { str: 16, dex: 12, con: 14, int: 10, wis: 14, cha: 12 },
    languages: { value: ['common'], custom: 'high storm liturgy and harbor law' },
    gear: ['stormSealedGreatcoat', 'saltTideRosary', 'portableRitualBrazier', 'ritualChalk']
  },
  {
    kind: 'character',
    name: 'Storm Church Hurricane Bishop',
    img: 'systems/lotm/tokens/humanoid/Archmage.webp',
    description: '<p>A saint-grade storm prelate entrusted with fleet blessings, catastrophe rites, and the church’s answer to rebellious seas. This is the folder’s leader-grade weather tyrant and capstone threat.</p>',
    alignment: 'Chaotic Neutral',
    pathway: SAILOR,
    sequence: 4,
    hp: 92,
    abilities: { str: 17, dex: 12, con: 15, int: 10, wis: 15, cha: 13 },
    languages: { value: ['common'], custom: 'saint-tier storm formulae and naval decrees' },
    gear: ['stormSealedGreatcoat', 'stormglassHarpoon', 'saltTideRosary', 'portableRitualBrazier', 'ritualChalk']
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
    for (const id of [SAILOR, APPRENTICE, WARRIOR]) {
      docs[id] = await scanKey(pathwaysDb, `!items!${id}`);
    }

    const abilityIds = new Set([
      ...Object.values(SAILOR_ABILITIES).flat()
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
  if (pathway === SAILOR) return cumulativeAbilityIds(SAILOR_ABILITIES, sequence);
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
