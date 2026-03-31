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

const FOLDER_ID = 'moFpZXBXD4O12Lkq';
const FACTION = 'Moses Ascetic Order';
const FAITH = 'Hidden Sage';

const MYSTERY_PRYER = 'lotmPathway00014';
const TEMPLATE_CHARACTER_ID = 'AkraLv0100000000';
const TEMPLATE_PRIEST_ID = 'PVD5wRdyO7iCJPs1';
const TEMPLATE_GUARD_ID = 'E9CvDPDg5dFEpVjS';

const ITEM_IDS = {
  concealedSleeveDagger: 'cafcf82b703ecb7e',
  conductorLantern: 'ddff4b9a492be86e',
  forgersPlateKit: '592bfffa1f5c003f',
  mirrorShardHex: '278a45cf52298a57',
  mirrorSilkVestments: 'cebb1feb09ef8e3b',
  occultForensicsKit: '8e19a8fe8cacd89e',
  portableRitualBrazier: 'cffd8adaccf12060',
  ritualChalk: 'ef5fe145fd6c7ee3',
  mirrorFugueCompact: '5389c7c5b8ca8897',
  mirrorBackedCoin: '0a7f0c8f46bcdb11',
  silverRitualDagger: '1105230f11214924',
  spiritCompass: '3788199f6a00ad34',
  spiritVisionSalve: 'ef7fa2c215f54a76',
  travelersChalkReel: '6b77c6f8bcbfc073'
};

const MONSTER_ITEM_KEYS = {
  chainShirt: '!actors.items!E9CvDPDg5dFEpVjS.2reHgwNJRFbhmxqA',
  shield: '!actors.items!E9CvDPDg5dFEpVjS.sSs3hSzkKBMNBgTs',
  lightCrossbow: '!actors.items!EMvcuOpu7ABCmBWi.rNQK7okIBNZ2zDvD',
  quarterstaff: '!actors.items!K15Yl8JmB5iPircc.KUP8WEfLxlcY7K2x',
  mace: '!actors.items!PVD5wRdyO7iCJPs1.B0jROhxuoqvfmz2B'
};

const PRYER_ABILITIES = {
  9: ['lotmAbilityP9001', 'lotmAbilityP9002'],
  8: ['lotmAbilityP8001', 'lotmAbilityP8002'],
  7: ['lotmAbilityP7001', 'lotmAbilityP7002', 'lotmAbilityP7003'],
  6: ['lotmAbilityP6001', 'lotmAbilityP6002', 'lotmAbilityP6003'],
  5: ['lotmAbilityP5001', 'lotmAbilityP5002', 'lotmAbilityP5003'],
  4: ['lotmAbilityP4001', 'lotmAbilityP4002', 'lotmAbilityP4003', 'lotmAbilityP4004']
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
    name: 'Moses Ascetic Itinerant Copyist',
    role: 'moses ascetic order itinerant copyist',
    template: 'priest',
    img: 'systems/lotm/tokens/humanoid/Noble.webp',
    description: '<p>A wandering scribe who recopies notes, symbols, and ritual scraps for remote cells of the order. Useful as a courier, clue-holder, and discreet knowledge broker.</p>',
    alignment: 'Neutral',
    cr: 0.125,
    hp: 11,
    hpFormula: '2d8+2',
    abilities: { str: 8, dex: 10, con: 11, int: 13, wis: 12, cha: 11 },
    languages: { value: ['common'], custom: 'cipher script and occult shorthand' },
    items: ['forgersPlateKit', 'travelersChalkReel', 'quarterstaff']
  },
  {
    kind: 'npc',
    name: 'Moses Ascetic Veiled Broker',
    role: 'moses ascetic order veiled broker',
    template: 'priest',
    img: 'systems/lotm/tokens/humanoid/Spy.webp',
    description: '<p>A middleman for forbidden books, sequence clues, and dubious relic fragments. Useful in negotiations, illicit auctions, and scenes where knowledge itself is contraband.</p>',
    alignment: 'Neutral Evil',
    cr: 0.5,
    hp: 18,
    hpFormula: '4d8',
    abilities: { str: 9, dex: 11, con: 11, int: 13, wis: 12, cha: 14 },
    languages: { value: ['common'], custom: 'black-market cant and code phrases' },
    items: ['spiritCompass', 'mirrorShardHex', 'concealedSleeveDagger']
  },
  {
    kind: 'npc',
    name: 'Moses Ascetic Scroll Courier',
    role: 'moses ascetic order scroll courier',
    template: 'guard',
    img: 'systems/lotm/tokens/humanoid/Scout.webp',
    description: '<p>A fast field operative trusted to move copied formulae and warnings between hidden cells before rival churches can intercept them. Useful as a scout, tail target, or escape specialist.</p>',
    alignment: 'Neutral',
    cr: 0.5,
    hp: 20,
    hpFormula: '4d8+2',
    abilities: { str: 10, dex: 14, con: 12, int: 11, wis: 12, cha: 10 },
    languages: { value: ['common'], custom: 'route marks and emergency ciphers' },
    items: ['lightCrossbow', 'concealedSleeveDagger', 'conductorLantern']
  },
  {
    kind: 'npc',
    name: 'Moses Ascetic Occult Procurer',
    role: 'moses ascetic order occult procurer',
    template: 'guard',
    img: 'systems/lotm/tokens/humanoid/Guard.webp',
    description: '<p>A graveyard thief, ruin-searcher, and dirty-hands retriever for materials the order would rather not acquire legally. Useful as mundane support in relic or body-horror scenes.</p>',
    alignment: 'Neutral Evil',
    cr: 0.5,
    hp: 19,
    hpFormula: '4d8+1',
    abilities: { str: 11, dex: 12, con: 12, int: 10, wis: 12, cha: 9 },
    languages: { value: ['common'], custom: 'graveyard and undercity slang' },
    items: ['occultForensicsKit', 'silverRitualDagger', 'chainShirt']
  },
  {
    kind: 'character',
    name: 'Moses Ascetic Mystery Pryer Neophyte',
    img: 'systems/lotm/tokens/humanoid/ApprenticeWizard.webp',
    description: '<p>A freshly advanced pryer who has learned to ask the wrong questions in precisely the right way. Useful as a low-tier diviner, handler, or cautious ritual initiate.</p>',
    alignment: 'Neutral',
    pathway: MYSTERY_PRYER,
    sequence: 9,
    hp: 12,
    abilities: { str: 8, dex: 11, con: 11, int: 15, wis: 13, cha: 11 },
    languages: { value: ['common'], custom: 'marginal notation and prayer-signs' },
    gear: ['forgersPlateKit', 'silverRitualDagger']
  },
  {
    kind: 'character',
    name: 'Moses Ascetic Arcane Marginist',
    img: 'systems/lotm/tokens/humanoid/Priest.webp',
    description: '<p>A sequence-eight scholar who annotates rituals in real time and opens tiny slits into deeper occult context. Best used as a support investigator and symbol-reading specialist.</p>',
    alignment: 'Neutral',
    pathway: MYSTERY_PRYER,
    sequence: 8,
    hp: 16,
    abilities: { str: 8, dex: 11, con: 11, int: 16, wis: 14, cha: 11 },
    languages: { value: ['common'], custom: 'annotated sigils and spirit-world shorthand' },
    gear: ['ritualChalk', 'spiritVisionSalve', 'conductorLantern']
  },
  {
    kind: 'character',
    name: 'Moses Ascetic Formula Warlock',
    img: 'systems/lotm/tokens/humanoid/Mage.webp',
    description: '<p>A field scholar who turns occult theory into repeatable curse-work and predictive pressure. Useful as a mid-tier ritualist, controller, and hidden-cell troubleshooter.</p>',
    alignment: 'Neutral Evil',
    pathway: MYSTERY_PRYER,
    sequence: 7,
    hp: 29,
    abilities: { str: 8, dex: 11, con: 12, int: 16, wis: 15, cha: 12 },
    languages: { value: ['common'], custom: 'formula chains and counter-ritual terms' },
    gear: ['spiritCompass', 'portableRitualBrazier', 'silverRitualDagger']
  },
  {
    kind: 'character',
    name: 'Moses Ascetic Backtrace Inquisitor',
    img: 'systems/lotm/tokens/humanoid/Spy.webp',
    description: '<p>A ruthless investigator who follows mystical residue backward through lies, false scenes, and half-buried symbols. Useful as a pursuit piece, interrogator, and anti-conspiracy specialist.</p>',
    alignment: 'Neutral Evil',
    pathway: MYSTERY_PRYER,
    sequence: 7,
    hp: 30,
    abilities: { str: 9, dex: 12, con: 12, int: 16, wis: 14, cha: 11 },
    languages: { value: ['common'], custom: 'interrogation signs and forensic notation' },
    gear: ['occultForensicsKit', 'concealedSleeveDagger', 'conductorLantern']
  },
  {
    kind: 'character',
    name: 'Moses Ascetic Scroll Binder',
    img: 'systems/lotm/tokens/humanoid/Witch.webp',
    description: '<p>A sequence-six specialist who stockpiles dangerous formulae into portable scripts, relay messages, and element-tagged scrolls. Useful as logistical support or a prepared ambush caster.</p>',
    alignment: 'Neutral',
    pathway: MYSTERY_PRYER,
    sequence: 6,
    hp: 39,
    abilities: { str: 8, dex: 11, con: 12, int: 17, wis: 15, cha: 12 },
    languages: { value: ['common'], custom: 'scroll code and ritual inventory marks' },
    gear: ['mirrorSilkVestments', 'ritualChalk', 'spiritVisionSalve', 'silverRitualDagger']
  },
  {
    kind: 'character',
    name: 'Moses Ascetic Starlight Penitent',
    img: 'systems/lotm/tokens/humanoid/MageOrb.webp',
    description: '<p>An elite practitioner who cloaks knowledge behind stellar symbols, cages foes in prying light, and walks through scenes as a chosen vessel of forbidden insight. Useful as a leader-grade occult enforcer.</p>',
    alignment: 'Neutral Evil',
    pathway: MYSTERY_PRYER,
    sequence: 5,
    hp: 54,
    abilities: { str: 8, dex: 12, con: 12, int: 18, wis: 16, cha: 13 },
    languages: { value: ['common'], custom: 'star charts and hidden-sage liturgy' },
    gear: ['mirrorBackedCoin', 'spiritCompass', 'portableRitualBrazier', 'ritualChalk']
  },
  {
    kind: 'character',
    name: 'Moses Ascetic Hidden Sage Interlocutor',
    img: 'systems/lotm/tokens/humanoid/Archmage.webp',
    description: '<p>A terrifying elder mysticologist who reenacts buried truths, plants observing eyes across a region, and treats reality like an editable commentary. This is the folder’s capstone scholar-leader and occult mastermind.</p>',
    alignment: 'Neutral Evil',
    pathway: MYSTERY_PRYER,
    sequence: 4,
    hp: 92,
    abilities: { str: 8, dex: 12, con: 13, int: 19, wis: 17, cha: 14 },
    languages: { value: ['common'], custom: 'forbidden doctrine and apocryphal indexing' },
    gear: ['mirrorFugueCompact', 'mirrorSilkVestments', 'portableRitualBrazier', 'ritualChalk', 'silverRitualDagger']
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
    docs[MYSTERY_PRYER] = await scanKey(pathwaysDb, `!items!${MYSTERY_PRYER}`);

    const abilityIds = new Set(Object.values(PRYER_ABILITIES).flat());
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
  return cumulativeAbilityIds(PRYER_ABILITIES, sequence);
}

function buildActorAndItems(spec, templates, docs) {
  const actor = spec.kind === 'character'
    ? baseCharacter(templates.characterTemplate, spec)
    : baseNpc(spec.template === 'guard' ? templates.guardTemplate : templates.priestTemplate, spec);

  const embedded = [];

  if (spec.kind === 'character') {
    const classItem = prepareEmbedded(docs[MYSTERY_PRYER]);
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
