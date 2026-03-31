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

const FOLDER_ID = 'r47E4ZSqiGSCAAWP';
const FACTION = 'Secret Order';
const FAITH = 'Antigonus Legacy';

const SEER = 'lotmPathway00001';
const TEMPLATE_CHARACTER_ID = 'AkraLv0100000000';
const TEMPLATE_PRIEST_ID = 'PVD5wRdyO7iCJPs1';
const TEMPLATE_GUARD_ID = 'E9CvDPDg5dFEpVjS';

const ITEM_IDS = {
  concealedSleeveDagger: 'cafcf82b703ecb7e',
  conductorLantern: 'ddff4b9a492be86e',
  mirrorShardHex: '278a45cf52298a57',
  mirrorSilkVestments: 'cebb1feb09ef8e3b',
  moonPaperCharm: '69cbd5bd6c4dffc2',
  omenThreadReel: '2efbb5ce6bc4f900',
  ritualChalk: 'ef5fe145fd6c7ee3',
  marionetteThreadSpool: 'bb61c48989b2e9d9',
  maskOfBorrowedFate: '73ddf79c86228bc6',
  mirrorFugueCompact: '5389c7c5b8ca8897',
  pilgrimsChalkDoor: 'ed621fee982f76cd',
  narrowDoorKey: '46f0294c32210637',
  mirrorBackedCoin: '0a7f0c8f46bcdb11',
  whisperingThreadThimble: 'd5f868c5325d6e4e',
  silverRitualDagger: '1105230f11214924',
  travelersChalkReel: '6b77c6f8bcbfc073',
  whisperThreadTripline: '6b273ca2c403868f'
};

const MONSTER_ITEM_KEYS = {
  chainShirt: '!actors.items!E9CvDPDg5dFEpVjS.2reHgwNJRFbhmxqA',
  shield: '!actors.items!E9CvDPDg5dFEpVjS.sSs3hSzkKBMNBgTs',
  lightCrossbow: '!actors.items!EMvcuOpu7ABCmBWi.rNQK7okIBNZ2zDvD',
  quarterstaff: '!actors.items!K15Yl8JmB5iPircc.KUP8WEfLxlcY7K2x',
  mace: '!actors.items!PVD5wRdyO7iCJPs1.B0jROhxuoqvfmz2B'
};

const SEER_ABILITIES = {
  9: ['lotmAbilityS9001', 'lotmAbilityS9002'],
  8: ['lotmAbilityS8001', 'lotmAbilityS8002'],
  7: ['lotmAbilityS7001', 'lotmAbilityS7002', 'lotmAbilityS7003'],
  6: ['lotmAbilityS6001', 'lotmAbilityS6002', 'lotmAbilityS6003'],
  5: ['lotmAbilityS5001', 'lotmAbilityS5002', 'lotmAbilityS5003'],
  4: ['lotmAbilityS4001', 'lotmAbilityS4002', 'lotmAbilityS4003', 'lotmAbilityS4004']
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
    name: 'Secret Order Quiet Informant',
    role: 'secret order quiet informant',
    template: 'priest',
    img: 'systems/lotm/tokens/humanoid/Noble.webp',
    description: '<p>A bookish intermediary who passes rumors, safehouse locations, and coded introductions without ever looking important. Useful as a clue source, handler, or false ally.</p>',
    alignment: 'Neutral',
    cr: 0.125,
    hp: 11,
    hpFormula: '2d8+2',
    abilities: { str: 8, dex: 10, con: 11, int: 12, wis: 12, cha: 12 },
    languages: { value: ['common'], custom: 'cipher slips and salon etiquette' },
    items: ['omenThreadReel', 'travelersChalkReel', 'concealedSleeveDagger']
  },
  {
    kind: 'npc',
    name: 'Secret Order Stage Medium',
    role: 'secret order stage medium',
    template: 'priest',
    img: 'systems/lotm/tokens/humanoid/Mage.webp',
    description: '<p>A fortune-teller and parlor performer who hides genuine occult perception behind cheap theatrics. Useful for social encounters, recruitment scenes, and deceptive exposition.</p>',
    alignment: 'Neutral Evil',
    cr: 0.5,
    hp: 18,
    hpFormula: '4d8',
    abilities: { str: 8, dex: 11, con: 11, int: 12, wis: 13, cha: 14 },
    languages: { value: ['common'], custom: 'stage cues and symbol patter' },
    items: ['conductorLantern', 'moonPaperCharm', 'ritualChalk']
  },
  {
    kind: 'npc',
    name: 'Secret Order Safehouse Watcher',
    role: 'secret order safehouse watcher',
    template: 'guard',
    img: 'systems/lotm/tokens/humanoid/Scout.webp',
    description: '<p>A low-profile sentry trained to notice tails, mark escape routes, and vanish before a raid becomes a fight. Useful as a scout, courier screen, or early-warning obstacle.</p>',
    alignment: 'Neutral',
    cr: 0.5,
    hp: 20,
    hpFormula: '4d8+2',
    abilities: { str: 10, dex: 14, con: 12, int: 10, wis: 12, cha: 10 },
    languages: { value: ['common'], custom: 'route marks and knock codes' },
    items: ['lightCrossbow', 'whisperThreadTripline', 'conductorLantern']
  },
  {
    kind: 'npc',
    name: 'Secret Order Blackmail Steward',
    role: 'secret order blackmail steward',
    template: 'guard',
    img: 'systems/lotm/tokens/humanoid/Spy.webp',
    description: '<p>A collector of letters, masks, debt records, and personal leverage used to keep the order’s outer ring obedient. Useful as a broker of secrets rather than a direct fighter.</p>',
    alignment: 'Lawful Evil',
    cr: 0.5,
    hp: 18,
    hpFormula: '4d8',
    abilities: { str: 9, dex: 12, con: 11, int: 13, wis: 11, cha: 13 },
    languages: { value: ['common'], custom: 'blackmail shorthand and private seals' },
    items: ['maskOfBorrowedFate', 'concealedSleeveDagger', 'travelersChalkReel']
  },
  {
    kind: 'character',
    name: 'Secret Order Seer Novice',
    img: 'systems/lotm/tokens/humanoid/ApprenticeWizard.webp',
    description: '<p>A newly advanced diviner taught to notice threads and omens before others realize a scene has already shifted. Useful as a low-tier scout, lookout, or introductory Beyonder threat.</p>',
    alignment: 'Neutral',
    pathway: SEER,
    sequence: 9,
    hp: 12,
    abilities: { str: 8, dex: 12, con: 11, int: 15, wis: 12, cha: 11 },
    languages: { value: ['common'], custom: 'omen notation and hidden-sign jargon' },
    gear: ['omenThreadReel', 'silverRitualDagger']
  },
  {
    kind: 'character',
    name: 'Secret Order Clown Adept',
    img: 'systems/lotm/tokens/humanoid/Assassin.webp',
    description: '<p>A sequence-eight trickster who turns mockery and impossible footwork into real battlefield advantage. Useful as an evasive nuisance and tempo disruptor.</p>',
    alignment: 'Chaotic Neutral',
    pathway: SEER,
    sequence: 8,
    hp: 16,
    abilities: { str: 9, dex: 14, con: 11, int: 15, wis: 12, cha: 12 },
    languages: { value: ['common'], custom: 'performance cues and escape signs' },
    gear: ['moonPaperCharm', 'concealedSleeveDagger']
  },
  {
    kind: 'character',
    name: 'Secret Order Magician Operative',
    img: 'systems/lotm/tokens/humanoid/Mage.webp',
    description: '<p>A field agent built around short-range displacement, force tricks, and survival through substitution rather than toughness. Useful as an infiltrator, assassin, or recurring escape artist.</p>',
    alignment: 'Neutral Evil',
    pathway: SEER,
    sequence: 7,
    hp: 29,
    abilities: { str: 8, dex: 15, con: 12, int: 16, wis: 12, cha: 11 },
    languages: { value: ['common'], custom: 'stage magic jargon and route code' },
    gear: ['moonPaperCharm', 'whisperThreadTripline', 'silverRitualDagger']
  },
  {
    kind: 'character',
    name: 'Secret Order Faceless Infiltrator',
    img: 'systems/lotm/tokens/humanoid/Spy.webp',
    description: '<p>A sequence-six operative who wears roles like clothes and uses temperament theft as a weapon. Useful as a deep-cover antagonist and social horror piece.</p>',
    alignment: 'Lawful Evil',
    pathway: SEER,
    sequence: 6,
    hp: 39,
    abilities: { str: 8, dex: 13, con: 12, int: 17, wis: 13, cha: 13 },
    languages: { value: ['common'], custom: 'persona files and infiltration shorthand' },
    gear: ['mirrorSilkVestments', 'mirrorBackedCoin', 'concealedSleeveDagger']
  },
  {
    kind: 'character',
    name: 'Secret Order Marionette Broker',
    img: 'systems/lotm/tokens/humanoid/Witch.webp',
    description: '<p>An elite puppeteer who turns compromised associates and restrained enemies into extensions of a private conspiracy. Useful as a controller, fixer, and encounter brain.</p>',
    alignment: 'Neutral Evil',
    pathway: SEER,
    sequence: 5,
    hp: 54,
    abilities: { str: 8, dex: 13, con: 12, int: 18, wis: 13, cha: 13 },
    languages: { value: ['common'], custom: 'thread diagrams and marionette cues' },
    gear: ['marionetteThreadSpool', 'whisperingThreadThimble', 'ritualChalk', 'silverRitualDagger']
  },
  {
    kind: 'character',
    name: 'Secret Order Bizarro Conspirator',
    img: 'systems/lotm/tokens/humanoid/MageOrb.webp',
    description: '<p>A bizarre high-end operator who breaks scene logic with divinations, worm-like extensions, and exchanges of position through prepared puppets. Useful as a leader-grade battlefield manipulator.</p>',
    alignment: 'Neutral Evil',
    pathway: SEER,
    sequence: 4,
    hp: 92,
    abilities: { str: 8, dex: 13, con: 13, int: 19, wis: 14, cha: 13 },
    languages: { value: ['common'], custom: 'worm sigils and false-history notation' },
    gear: ['mirrorFugueCompact', 'marionetteThreadSpool', 'ritualChalk', 'pilgrimsChalkDoor', 'silverRitualDagger']
  },
  {
    kind: 'character',
    name: 'Secret Order Historical Archivist',
    img: 'systems/lotm/tokens/humanoid/Archmage.webp',
    description: '<p>A secret-order elder who treats history as a storehouse of usable masks, moments, and borrowed truths. This is the folder’s capstone strategist and occult mastermind.</p>',
    alignment: 'Neutral Evil',
    pathway: SEER,
    sequence: 4,
    hp: 90,
    abilities: { str: 8, dex: 12, con: 13, int: 19, wis: 15, cha: 13 },
    languages: { value: ['common'], custom: 'archival ciphers and hidden era references' },
    gear: ['narrowDoorKey', 'mirrorBackedCoin', 'omenThreadReel', 'ritualChalk', 'silverRitualDagger']
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
    docs[SEER] = await scanKey(pathwaysDb, `!items!${SEER}`);

    const abilityIds = new Set(Object.values(SEER_ABILITIES).flat());
    for (const id of abilityIds) docs[id] = await scanKey(abilitiesDb, `!items!${id}`);

    for (const [name, id] of Object.entries(ITEM_IDS)) docs[name] = await scanKey(itemsDb, `!items!${id}`);
    for (const [name, key] of Object.entries(MONSTER_ITEM_KEYS)) docs[name] = await scanKey(monstersDb, key);

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

function pathwayAbilities(sequence) {
  return cumulativeAbilityIds(SEER_ABILITIES, sequence);
}

function buildActorAndItems(spec, templates, docs) {
  const actor = spec.kind === 'character'
    ? baseCharacter(templates.characterTemplate, spec)
    : baseNpc(spec.template === 'guard' ? templates.guardTemplate : templates.priestTemplate, spec);

  const embedded = [];

  if (spec.kind === 'character') {
    const classItem = prepareEmbedded(docs[SEER]);
    classItem.system = classItem.system || {};
    classItem.system.levels = seqToClassLevel(spec.sequence);
    embedded.push(classItem);
    actor.system.details.originalClass = classItem._id;

    for (const abilityId of pathwayAbilities(spec.sequence)) embedded.push(prepareEmbedded(docs[abilityId]));
    for (const gearName of spec.gear) embedded.push(prepareEmbedded(docs[gearName]));
  } else {
    actor.system.details.originalClass = null;
    for (const gearName of spec.items) embedded.push(prepareEmbedded(docs[gearName]));
  }

  actor.items = embedded.map(item => item._id);
  return { actor, embedded };
}

async function main() {
  const sources = await loadSources();
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
      for await (const [key] of actorDb.iterator({ gte: `!actors.items!${actorId}.`, lte: `!actors.items!${actorId}.~` })) {
        ops.push({ type: 'del', key });
      }
    }

    for (const spec of ACTORS) {
      const { actor, embedded } = buildActorAndItems(spec, sources, sources.docs);
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
