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

const FOLDER_ID = 'SQRFApYwi2ODde0X';
const FACTION = 'Temperance Faction';
const FAITH = 'Temperance Creed';

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
    name: 'Temperance Refuge Keeper',
    role: 'temperance refuge keeper',
    template: 'priest',
    img: 'systems/lotm/tokens/humanoid/Noble.webp',
    description: '<p>A quiet organizer who shelters the faction’s contacts, tends exhausted operatives, and keeps compromised allies away from old habits. Useful as a handler, safehouse host, and social support figure.</p>',
    alignment: 'Lawful Neutral',
    cr: 0.125,
    hp: 11,
    hpFormula: '2d8+2',
    abilities: { str: 8, dex: 10, con: 11, int: 11, wis: 13, cha: 12 },
    languages: { value: ['common'], custom: 'safehouse codes and recovery routines' },
    items: ['conductorLantern', 'travelersChalkReel', 'quarterstaff']
  },
  {
    kind: 'npc',
    name: 'Temperance Cell Tracker',
    role: 'temperance cell tracker',
    template: 'guard',
    img: 'systems/lotm/tokens/humanoid/Scout.webp',
    description: '<p>A field scout trained to trace deviant outbreaks, abandoned ritual sites, and Rose School movement without drawing attention. Useful in pursuit, wilderness work, and protective surveillance.</p>',
    alignment: 'Neutral',
    cr: 0.5,
    hp: 20,
    hpFormula: '4d8+2',
    abilities: { str: 10, dex: 14, con: 12, int: 10, wis: 13, cha: 10 },
    languages: { value: ['common'], custom: 'trail marks and hunter signs' },
    items: ['lightCrossbow', 'graveSaltWard', 'conductorLantern']
  },
  {
    kind: 'npc',
    name: 'Temperance Chain Warden',
    role: 'temperance chain warden',
    template: 'guard',
    img: 'systems/lotm/tokens/humanoid/Guard.webp',
    description: '<p>A disciplined escort trusted to transport dangerous captives and cursed vessels without indulging cruelty. Useful as a practical frontline support unit and custody specialist.</p>',
    alignment: 'Lawful Neutral',
    cr: 0.5,
    hp: 20,
    hpFormula: '4d8+2',
    abilities: { str: 12, dex: 11, con: 12, int: 10, wis: 12, cha: 10 },
    languages: { value: ['common'], custom: 'escort signals and seal commands' },
    items: ['chainShirt', 'shield', 'mace']
  },
  {
    kind: 'npc',
    name: 'Temperance Vice Informer',
    role: 'temperance vice informer',
    template: 'priest',
    img: 'systems/lotm/tokens/humanoid/Spy.webp',
    description: '<p>A former den-broker or addict who now guides the faction toward indulgence nests, traffickers, and broken operatives before they become full monsters. Useful as a compromised ally or remorseful source.</p>',
    alignment: 'Neutral',
    cr: 0.5,
    hp: 18,
    hpFormula: '4d8',
    abilities: { str: 9, dex: 11, con: 11, int: 11, wis: 12, cha: 13 },
    languages: { value: ['common'], custom: 'vice-house cant and debt slang' },
    items: ['concealedSleeveDagger', 'graveBell', 'travelersChalkReel']
  },
  {
    kind: 'character',
    name: 'Temperance Prisoner Disciple',
    img: 'systems/lotm/tokens/humanoid/ApprenticeWizard.webp',
    description: '<p>A newly advanced prisoner-pathway operative taught to contain violent impulse instead of celebrating it. Useful as a low-tier occult sentry and faction baseline Beyonder.</p>',
    alignment: 'Lawful Neutral',
    pathway: PRISONER,
    sequence: 9,
    hp: 12,
    abilities: { str: 11, dex: 11, con: 12, int: 9, wis: 14, cha: 10 },
    languages: { value: ['common'], custom: 'discipline mantras and seal-cants' },
    gear: ['silverRitualDagger', 'graveSaltWard']
  },
  {
    kind: 'character',
    name: 'Temperance Bound-Will Adept',
    img: 'systems/lotm/tokens/humanoid/CultFanatic.webp',
    description: '<p>A sequence-eight operative who channels frenzy into focused action instead of collapse. Useful as a durable skirmisher who can hold a line without reading as another Rose School berserker.</p>',
    alignment: 'Lawful Neutral',
    pathway: PRISONER,
    sequence: 8,
    hp: 16,
    abilities: { str: 12, dex: 11, con: 12, int: 9, wis: 15, cha: 10 },
    languages: { value: ['common'], custom: 'control liturgy and strike cues' },
    gear: ['mirrorSilkVestments', 'conductorLantern']
  },
  {
    kind: 'character',
    name: 'Temperance Night Pursuer',
    img: 'systems/lotm/tokens/humanoid/Assassin.webp',
    description: '<p>A sequence-seven hunter who uses darkness and controlled monstrous pressure to corner deviants, cultists, and escapees. Useful as a pursuit specialist and anti-occult field piece.</p>',
    alignment: 'Neutral',
    pathway: PRISONER,
    sequence: 7,
    hp: 29,
    abilities: { str: 13, dex: 13, con: 12, int: 9, wis: 15, cha: 10 },
    languages: { value: ['common'], custom: 'night-signs and pursuit shorthand' },
    gear: ['graveSaltWard', 'mirrorShardHex', 'concealedSleeveDagger']
  },
  {
    kind: 'character',
    name: 'Temperance Beast-Chain Hunter',
    img: 'systems/lotm/tokens/humanoid/WerewolfBloody.webp',
    description: '<p>A werewolf-pathway hunter who accepts transformation as a tool under discipline, not indulgence. Useful as the faction’s frontline tracker and monster-capture specialist.</p>',
    alignment: 'Neutral',
    pathway: PRISONER,
    sequence: 7,
    hp: 30,
    abilities: { str: 15, dex: 12, con: 13, int: 9, wis: 14, cha: 10 },
    languages: { value: ['common'], custom: 'pack signs and restraint cues' },
    gear: ['graveBell', 'graveSaltWard']
  },
  {
    kind: 'character',
    name: 'Temperance Corpse-Bound Exorcist',
    img: 'systems/lotm/tokens/humanoid/Witch.webp',
    description: '<p>A sequence-six specialist who turns corpse strings, decay, and bound dead into exorcistic tools against runaway curses and polluted sites. Useful as support, cleanup, and post-battle control.</p>',
    alignment: 'Lawful Neutral',
    pathway: PRISONER,
    sequence: 6,
    hp: 39,
    abilities: { str: 10, dex: 11, con: 12, int: 10, wis: 17, cha: 11 },
    languages: { value: ['common'], custom: 'funerary rites and vessel terms' },
    gear: ['ritualChalk', 'whisperingThreadThimble', 'silverRitualDagger']
  },
  {
    kind: 'character',
    name: 'Temperance Mirror Sentinel',
    img: 'systems/lotm/tokens/humanoid/MageOrb.webp',
    description: '<p>An elite operative who uses mirror movement and wraith-state for interception, scouting, and controlled possession. Useful as a surgical defender and leader-grade field responder.</p>',
    alignment: 'Lawful Neutral',
    pathway: PRISONER,
    sequence: 5,
    hp: 54,
    abilities: { str: 11, dex: 12, con: 13, int: 10, wis: 18, cha: 11 },
    languages: { value: ['common'], custom: 'mirror-sign and emergency code' },
    gear: ['mirrorBackedCoin', 'mirrorSilkVestments', 'conductorLantern', 'silverRitualDagger']
  },
  {
    kind: 'character',
    name: 'Temperance Seal Magistrate',
    img: 'systems/lotm/tokens/humanoid/Archmage.webp',
    description: '<p>A high-ranking curse judge who establishes containment zones, sympathetic penalties, and disciplined spirit bindings against the faction’s enemies and its own excesses. This is the folder’s capstone commander and occult authority.</p>',
    alignment: 'Lawful Neutral',
    pathway: PRISONER,
    sequence: 4,
    hp: 92,
    abilities: { str: 11, dex: 11, con: 13, int: 11, wis: 19, cha: 12 },
    languages: { value: ['common'], custom: 'seal law and disciplinary doctrine' },
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
