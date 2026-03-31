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

const FOLDER_ID = 'H39fR4badhZsz3OT';
const FACTION = 'Rose School of Thought';
const FAITH = 'Mother Tree of Desire';

const PRISONER = 'lotmPathway00020';
const TEMPLATE_CHARACTER_ID = 'AkraLv0100000000';
const TEMPLATE_PRIEST_ID = 'PVD5wRdyO7iCJPs1';
const TEMPLATE_GUARD_ID = 'E9CvDPDg5dFEpVjS';

const ITEM_IDS = {
  concealedSleeveDagger: 'cafcf82b703ecb7e',
  conductorLantern: 'ddff4b9a492be86e',
  graveBell: '90229ca0c7c7e4bb',
  graveSaltWard: '67bfff87afd4bf76',
  mirrorShardHex: '278a45cf52298a57',
  mirrorSilkVestments: 'cebb1feb09ef8e3b',
  ritualChalk: 'ef5fe145fd6c7ee3',
  mirrorFugueCompact: '5389c7c5b8ca8897',
  blackMireSealNail: 'effe36cc5d1afc75',
  mirrorBackedCoin: '0a7f0c8f46bcdb11',
  whisperingThreadThimble: 'd5f868c5325d6e4e',
  silverRitualDagger: '1105230f11214924',
  travelersChalkReel: '6b77c6f8bcbfc073'
};

const MONSTER_ITEM_KEYS = {
  chainShirt: '!actors.items!E9CvDPDg5dFEpVjS.2reHgwNJRFbhmxqA',
  shield: '!actors.items!E9CvDPDg5dFEpVjS.sSs3hSzkKBMNBgTs',
  lightCrossbow: '!actors.items!EMvcuOpu7ABCmBWi.rNQK7okIBNZ2zDvD',
  quarterstaff: '!actors.items!K15Yl8JmB5iPircc.KUP8WEfLxlcY7K2x',
  mace: '!actors.items!PVD5wRdyO7iCJPs1.B0jROhxuoqvfmz2B'
};

const PRISONER_ABILITIES = {
  9: ['lotmAbilityU9001', 'lotmAbilityU9002'],
  8: ['lotmAbilityU8001', 'lotmAbilityU8002'],
  7: ['lotmAbilityU7001', 'lotmAbilityU7002', 'lotmAbilityU7003'],
  6: ['lotmAbilityU6001', 'lotmAbilityU6002', 'lotmAbilityU6003'],
  5: ['lotmAbilityU5001', 'lotmAbilityU5002', 'lotmAbilityU5003'],
  4: ['lotmAbilityU4001', 'lotmAbilityU4002', 'lotmAbilityU4003', 'lotmAbilityU4004']
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
    name: 'Rose School Street Tempter',
    role: 'rose school street tempter',
    template: 'priest',
    img: 'systems/lotm/tokens/humanoid/Noble.webp',
    description: '<p>A velvet-voiced recruiter who finds the lonely, the addicted, and the curious before guiding them toward the order’s hidden salons. Useful in social scenes, corruption arcs, and urban infiltration.</p>',
    alignment: 'Chaotic Evil',
    cr: 0.125,
    hp: 11,
    hpFormula: '2d8+2',
    abilities: { str: 8, dex: 10, con: 11, int: 11, wis: 11, cha: 14 },
    languages: { value: ['common'], custom: 'street cant and whispered catechisms' },
    items: ['concealedSleeveDagger', 'conductorLantern', 'travelersChalkReel']
  },
  {
    kind: 'npc',
    name: 'Rose School Flesh Procurer',
    role: 'rose school flesh procurer',
    template: 'guard',
    img: 'systems/lotm/tokens/humanoid/Thug.webp',
    description: '<p>A brutal collector of cadavers, reagents, and unwilling test subjects for the order’s darker experiments. Useful as mundane muscle with an immediate horror cue.</p>',
    alignment: 'Chaotic Evil',
    cr: 0.5,
    hp: 20,
    hpFormula: '4d8+2',
    abilities: { str: 12, dex: 11, con: 12, int: 9, wis: 11, cha: 9 },
    languages: { value: ['common'], custom: 'graveyard and smuggler slang' },
    items: ['chainShirt', 'mace', 'graveBell']
  },
  {
    kind: 'npc',
    name: 'Rose School Cage Escort',
    role: 'rose school cage escort',
    template: 'guard',
    img: 'systems/lotm/tokens/humanoid/Guard.webp',
    description: '<p>A handler trusted to move chained deviants, cursed objects, and half-stable prisoners between safehouses. Useful as a disciplined guard with sinister logistics value.</p>',
    alignment: 'Lawful Evil',
    cr: 0.5,
    hp: 20,
    hpFormula: '4d8+2',
    abilities: { str: 12, dex: 11, con: 12, int: 10, wis: 11, cha: 10 },
    languages: { value: ['common'], custom: 'escort signals and control phrases' },
    items: ['chainShirt', 'shield', 'lightCrossbow']
  },
  {
    kind: 'npc',
    name: 'Rose School Vice Broker',
    role: 'rose school vice broker',
    template: 'priest',
    img: 'systems/lotm/tokens/humanoid/Spy.webp',
    description: '<p>A black-market organizer who launders indulgence, curse-components, and compromised clients into the order’s hands. Useful as a broker, fixer, and leverage-heavy antagonist.</p>',
    alignment: 'Neutral Evil',
    cr: 0.5,
    hp: 18,
    hpFormula: '4d8',
    abilities: { str: 9, dex: 11, con: 11, int: 12, wis: 12, cha: 14 },
    languages: { value: ['common'], custom: 'vice-house cant and collector codes' },
    items: ['mirrorShardHex', 'concealedSleeveDagger', 'conductorLantern']
  },
  {
    kind: 'character',
    name: 'Rose School Prisoner Initiate',
    img: 'systems/lotm/tokens/humanoid/ApprenticeWizard.webp',
    description: '<p>A newly advanced initiate learning how to restrain violence until it becomes useful. Works as a low-tier occult thug with visible instability.</p>',
    alignment: 'Chaotic Evil',
    pathway: PRISONER,
    sequence: 9,
    hp: 12,
    abilities: { str: 11, dex: 11, con: 12, int: 9, wis: 14, cha: 10 },
    languages: { value: ['common'], custom: 'punishment cant and control mantras' },
    gear: ['silverRitualDagger', 'concealedSleeveDagger']
  },
  {
    kind: 'character',
    name: 'Rose School Bound Shadow Adept',
    img: 'systems/lotm/tokens/humanoid/CultFanatic.webp',
    description: '<p>A sequence-eight fanatic who binds darkness close to the body and rides the edge of a controlled frenzy. Useful as a harasser, ambusher, and unstable guard captain.</p>',
    alignment: 'Chaotic Evil',
    pathway: PRISONER,
    sequence: 8,
    hp: 16,
    abilities: { str: 12, dex: 11, con: 12, int: 9, wis: 15, cha: 10 },
    languages: { value: ['common'], custom: 'shadow invocations and chain-cants' },
    gear: ['mirrorSilkVestments', 'conductorLantern']
  },
  {
    kind: 'character',
    name: 'Rose School Werewolf Enforcer',
    img: 'systems/lotm/tokens/humanoid/WerewolfBloody.webp',
    description: '<p>A sequence-seven field enforcer bred for sudden bestial release and terror. Useful as a chase predator, bodyguard, or frontline shock piece.</p>',
    alignment: 'Chaotic Evil',
    pathway: PRISONER,
    sequence: 7,
    hp: 30,
    abilities: { str: 15, dex: 12, con: 13, int: 9, wis: 14, cha: 10 },
    languages: { value: ['common'], custom: 'pack howls and handler signals' },
    gear: ['graveSaltWard', 'mirrorShardHex']
  },
  {
    kind: 'character',
    name: 'Rose School Dark Horror Handler',
    img: 'systems/lotm/tokens/humanoid/Assassin.webp',
    description: '<p>A prisoner-pathway operative who weaponizes fear, darkness, and light-aversion to collapse a scene before open battle starts. Useful as a hunter of witnesses and a mid-tier controller.</p>',
    alignment: 'Neutral Evil',
    pathway: PRISONER,
    sequence: 7,
    hp: 29,
    abilities: { str: 11, dex: 13, con: 12, int: 10, wis: 15, cha: 11 },
    languages: { value: ['common'], custom: 'terror-cues and hidden-room signals' },
    gear: ['conductorLantern', 'mirrorShardHex', 'concealedSleeveDagger']
  },
  {
    kind: 'character',
    name: 'Rose School Corpse-String Hexer',
    img: 'systems/lotm/tokens/humanoid/Witch.webp',
    description: '<p>A sequence-six curse-worker who drags bodies, sickness, and puppet-like control into the same toolkit. Useful as a support necromancer and curse specialist.</p>',
    alignment: 'Neutral Evil',
    pathway: PRISONER,
    sequence: 6,
    hp: 39,
    abilities: { str: 10, dex: 11, con: 12, int: 10, wis: 17, cha: 12 },
    languages: { value: ['common'], custom: 'funerary curses and corpse-script' },
    gear: ['ritualChalk', 'silverRitualDagger', 'whisperingThreadThimble']
  },
  {
    kind: 'character',
    name: 'Rose School Mirror Wraith',
    img: 'systems/lotm/tokens/humanoid/MageOrb.webp',
    description: '<p>An elite prisoner-pathway operator who slips through mirrors, rides wraith-state, and uses possession as an opening move. Useful as a leader-grade infiltrator and skirmisher.</p>',
    alignment: 'Chaotic Evil',
    pathway: PRISONER,
    sequence: 5,
    hp: 54,
    abilities: { str: 11, dex: 12, con: 13, int: 10, wis: 18, cha: 12 },
    languages: { value: ['common'], custom: 'mirror rites and possession signals' },
    gear: ['mirrorBackedCoin', 'mirrorSilkVestments', 'conductorLantern', 'silverRitualDagger']
  },
  {
    kind: 'character',
    name: 'Rose School Curse Vessel Matriarch',
    img: 'systems/lotm/tokens/humanoid/Archmage.webp',
    description: '<p>A terrifying high-ranking curse architect who turns bodies, objects, and entire rooms into extensions of her binding domain. This is the folder’s capstone occult tyrant and faction leader.</p>',
    alignment: 'Chaotic Evil',
    pathway: PRISONER,
    sequence: 4,
    hp: 92,
    abilities: { str: 11, dex: 12, con: 13, int: 11, wis: 19, cha: 13 },
    languages: { value: ['common'], custom: 'black rites and vessel doctrine' },
    gear: ['blackMireSealNail', 'mirrorFugueCompact', 'ritualChalk', 'silverRitualDagger', 'mirrorSilkVestments']
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
    docs[PRISONER] = await scanKey(pathwaysDb, `!items!${PRISONER}`);

    const abilityIds = new Set(Object.values(PRISONER_ABILITIES).flat());
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
  return cumulativeAbilityIds(PRISONER_ABILITIES, sequence);
}

function buildActorAndItems(spec, templates, docs) {
  const actor = spec.kind === 'character'
    ? baseCharacter(templates.characterTemplate, spec)
    : baseNpc(spec.template === 'guard' ? templates.guardTemplate : templates.priestTemplate, spec);

  const embedded = [];

  if (spec.kind === 'character') {
    const classItem = prepareEmbedded(docs[PRISONER]);
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
