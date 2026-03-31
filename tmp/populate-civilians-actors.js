const path = require('path');
const { Level } = require('level');

const ROOT = process.cwd();
const PACKS = path.join(ROOT, 'packs');
const ACTOR_PACK = path.join(PACKS, 'lotm_actors');
const MONSTERS_PACK = path.join(PACKS, 'monsters');
const ITEMS_PACK = path.join(PACKS, 'lotm_items');

const FOLDER_ID = 'LJ5bvcUKFpLGv80C';
const FACTION = 'Civilians';

const TEMPLATE_IDS = {
  commoner: 'SqZRuJ8lt2KGJBbq',
  noble: 'GlaCGcgIP6YjBjGc',
  guard: 'E9CvDPDg5dFEpVjS',
  scout: 'O3ABqI55Ir1du1Xa',
  spy: '13K3XK2A3wwxVKLD',
  thug: 'Cy3A0rsNMPLZozam',
  priest: 'PVD5wRdyO7iCJPs1',
  veteran: 'J8xjoG4Dxb8WkHtV'
};

const ITEM_IDS = {
  claritySalts: 'f7e8cd83bdafe4b6',
  clerksCoat: '39c2b8e4472f1f66',
  concealedSleeveDagger: 'cafcf82b703ecb7e',
  conductorLantern: 'ddff4b9a492be86e',
  contractLedger: '49a73677ef427fa1',
  corpseSaltPacket: 'a8d64cc5c1afa6c3',
  forgersPlateKit: '592bfffa1f5c003f',
  graveBell: '90229ca0c7c7e4bb',
  graveShovel: '19dba194287141be',
  occultForensicsKit: '8e19a8fe8cacd89e',
  investigatorsCoat: 'e57c1c13d2389129',
  spiritCompass: '3788199f6a00ad34',
  spiritVisionSalve: 'ef7fa2c215f54a76',
  travelersChalkReel: '6b77c6f8bcbfc073'
};

const MONSTER_ITEM_KEYS = {
  chainShirt: '!actors.items!E9CvDPDg5dFEpVjS.2reHgwNJRFbhmxqA',
  shield: '!actors.items!E9CvDPDg5dFEpVjS.sSs3hSzkKBMNBgTs',
  lightCrossbow: '!actors.items!EMvcuOpu7ABCmBWi.rNQK7okIBNZ2zDvD',
  mace: '!actors.items!PVD5wRdyO7iCJPs1.B0jROhxuoqvfmz2B',
  quarterstaff: '!actors.items!K15Yl8JmB5iPircc.KUP8WEfLxlcY7K2x',
  shortsword: '!actors.items!J8xjoG4Dxb8WkHtV.cXf5q5xw30ICGxZg',
  handCrossbow: '!actors.items!13K3XK2A3wwxVKLD.q6pfCQyaPQSw2waZ'
};

const ACTORS = [
  {
    name: 'Civilian Dock Laborer',
    role: 'civilian dock laborer',
    template: 'commoner',
    img: 'systems/lotm/tokens/humanoid/Commoner.webp',
    description: '<p>A strong-backed worker used for crowds, cargo scenes, witness testimony, or desperate labor unrest. Basic but physically useful in urban and harbor encounters.</p>',
    alignment: 'Any',
    cr: 0.125,
    hp: 9,
    hpFormula: '2d8',
    abilities: { str: 12, dex: 10, con: 12, int: 9, wis: 10, cha: 9 },
    languages: { value: ['common'], custom: 'dock slang' },
    items: ['conductorLantern']
  },
  {
    name: 'Civilian Market Hawker',
    role: 'civilian market hawker',
    template: 'commoner',
    img: 'systems/lotm/tokens/humanoid/Commoner.webp',
    description: '<p>A noisy vendor with a good ear for neighborhood rumors, prices, and who passed through a market square. Useful as a gossip source, witness, or low-pressure social obstacle.</p>',
    alignment: 'Any',
    cr: 0.125,
    hp: 8,
    hpFormula: '2d8-1',
    abilities: { str: 9, dex: 11, con: 10, int: 10, wis: 12, cha: 13 },
    languages: { value: ['common'], custom: 'market cries and district slang' },
    items: ['contractLedger', 'concealedSleeveDagger']
  },
  {
    name: 'Civilian Workshop Clerk',
    role: 'civilian workshop clerk',
    template: 'noble',
    img: 'systems/lotm/tokens/humanoid/Noble.webp',
    description: '<p>A literate bookkeeper trusted with invoices, payroll, and production schedules. Useful as an administrative gatekeeper or pressure point in industrial stories.</p>',
    alignment: 'Lawful Neutral',
    cr: 0.25,
    hp: 11,
    hpFormula: '2d8+2',
    abilities: { str: 8, dex: 10, con: 11, int: 13, wis: 12, cha: 12 },
    languages: { value: ['common'], custom: 'clerical shorthand' },
    items: ['clerksCoat', 'contractLedger', 'forgersPlateKit']
  },
  {
    name: 'Civilian Parish Physician',
    role: 'civilian parish physician',
    template: 'priest',
    img: 'systems/lotm/tokens/humanoid/Priest.webp',
    description: '<p>A local doctor who handles fevers, injuries, births, and the first pass at strange symptoms before churches or Beyonders get involved. Strong as a support NPC and clue source.</p>',
    alignment: 'Neutral Good',
    cr: 0.5,
    hp: 16,
    hpFormula: '3d8+3',
    abilities: { str: 9, dex: 10, con: 12, int: 13, wis: 15, cha: 11 },
    languages: { value: ['common'], custom: 'bedside shorthand and apothecary terms' },
    items: ['claritySalts', 'spiritVisionSalve', 'quarterstaff']
  },
  {
    name: 'Civilian Undertaker',
    role: 'civilian undertaker',
    template: 'priest',
    img: 'systems/lotm/tokens/humanoid/Commoner.webp',
    description: '<p>A mortuary professional who knows graveyards, recent deaths, mourning customs, and which families are hiding something. Useful in mysteries, corpse scenes, and death logistics.</p>',
    alignment: 'Neutral',
    cr: 0.5,
    hp: 15,
    hpFormula: '3d8+2',
    abilities: { str: 11, dex: 10, con: 12, int: 11, wis: 13, cha: 10 },
    languages: { value: ['common'], custom: 'funerary etiquette' },
    items: ['graveBell', 'graveShovel', 'corpseSaltPacket']
  },
  {
    name: 'Civilian Caravan Guide',
    role: 'civilian caravan guide',
    template: 'scout',
    img: 'systems/lotm/tokens/humanoid/Scout.webp',
    description: '<p>A practical wilderness and road guide who knows routes, toll points, smugglers’ detours, and places worth avoiding after dark. Useful for travel scenes and overland escort work.</p>',
    alignment: 'Neutral',
    cr: 0.5,
    hp: 16,
    hpFormula: '3d8+3',
    abilities: { str: 11, dex: 14, con: 12, int: 10, wis: 13, cha: 10 },
    languages: { value: ['common'], custom: 'road signs and caravan cant' },
    items: ['lightCrossbow', 'conductorLantern', 'travelersChalkReel']
  },
  {
    name: 'Civilian Investigative Reporter',
    role: 'civilian investigative reporter',
    template: 'spy',
    img: 'systems/lotm/tokens/humanoid/Spy.webp',
    description: '<p>A tenacious newspaperman or pamphleteer who digs into scandals, disappearances, and official lies. Useful as an ally, nuisance, or independent investigator chasing the same truth.</p>',
    alignment: 'Neutral',
    cr: 0.5,
    hp: 17,
    hpFormula: '4d8-1',
    abilities: { str: 9, dex: 13, con: 10, int: 14, wis: 13, cha: 12 },
    languages: { value: ['common'], custom: 'printer slang and police contacts' },
    items: ['investigatorsCoat', 'occultForensicsKit', 'concealedSleeveDagger']
  },
  {
    name: 'Civilian Smuggler Runner',
    role: 'civilian smuggler runner',
    template: 'spy',
    img: 'systems/lotm/tokens/humanoid/Skulk.webp',
    description: '<p>A fast courier for contraband, bribes, and messages that should not exist on paper. Useful as a chase target, deniable contact, or minor underworld specialist.</p>',
    alignment: 'Chaotic Neutral',
    cr: 0.5,
    hp: 17,
    hpFormula: '4d8-1',
    abilities: { str: 10, dex: 15, con: 10, int: 11, wis: 11, cha: 12 },
    languages: { value: ['common'], custom: 'smuggler signs and alley whistles' },
    items: ['handCrossbow', 'concealedSleeveDagger', 'conductorLantern']
  },
  {
    name: 'Civilian Pawnbroker',
    role: 'civilian pawnbroker',
    template: 'noble',
    img: 'systems/lotm/tokens/humanoid/Noble.webp',
    description: '<p>A careful fence of valuables, keepsakes, and suspicious curios who knows who is desperate for cash. Useful as a broker, rumor node, and source of minor occult complications.</p>',
    alignment: 'Neutral',
    cr: 0.5,
    hp: 14,
    hpFormula: '3d8+1',
    abilities: { str: 9, dex: 11, con: 11, int: 13, wis: 12, cha: 14 },
    languages: { value: ['common'], custom: 'haggler patter and collector gossip' },
    items: ['contractLedger', 'spiritCompass', 'concealedSleeveDagger']
  },
  {
    name: 'Civilian Union Agitator',
    role: 'civilian union agitator',
    template: 'thug',
    img: 'systems/lotm/tokens/humanoid/Thug.webp',
    description: '<p>A charismatic organizer who can turn a crowd into a strike line, a demonstration, or a riot depending on pressure. Useful in labor politics and urban unrest.</p>',
    alignment: 'Chaotic Neutral',
    cr: 1,
    hp: 26,
    hpFormula: '4d8+8',
    abilities: { str: 13, dex: 11, con: 14, int: 11, wis: 11, cha: 14 },
    languages: { value: ['common'], custom: 'factory slang and strike chants' },
    items: ['mace', 'contractLedger', 'clerksCoat']
  },
  {
    name: 'Civilian Hired Bruiser',
    role: 'civilian hired bruiser',
    template: 'veteran',
    img: 'systems/lotm/tokens/humanoid/Veteran.webp',
    description: '<p>A reliable strong-arm employed by merchants, politicians, or criminal bosses when they need intimidation without church involvement. Useful as civilian muscle and mid-tier mundane opposition.</p>',
    alignment: 'Any',
    cr: 1,
    hp: 30,
    hpFormula: '4d8+12',
    abilities: { str: 15, dex: 11, con: 14, int: 10, wis: 11, cha: 10 },
    languages: { value: ['common'], custom: 'mercenary cant' },
    items: ['chainShirt', 'shield', 'shortsword', 'mace']
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

async function scanKey(db, key) {
  for await (const [entryKey, value] of db.iterator({ gte: key, lte: key })) {
    if (entryKey === key) return value;
  }
  throw new Error(`Missing doc: ${key}`);
}

function prepareEmbedded(doc) {
  const item = clone(doc);
  item._id = randomId();
  item.folder = null;
  item.sort = 0;
  return item;
}

async function loadSources() {
  const monstersDb = new Level(MONSTERS_PACK, { valueEncoding: 'json' });
  const itemsDb = new Level(ITEMS_PACK, { valueEncoding: 'json' });
  try {
    const templates = {};
    for (const [name, id] of Object.entries(TEMPLATE_IDS)) {
      templates[name] = await scanKey(monstersDb, `!actors!${id}`);
    }

    const docs = {};
    for (const [name, id] of Object.entries(ITEM_IDS)) {
      docs[name] = await scanKey(itemsDb, `!items!${id}`);
    }
    for (const [name, key] of Object.entries(MONSTER_ITEM_KEYS)) {
      docs[name] = await scanKey(monstersDb, key);
    }

    return { templates, docs };
  } finally {
    await Promise.allSettled([monstersDb.close(), itemsDb.close()]);
  }
}

function buildNpc(spec, templates, docs) {
  const actor = clone(templates[spec.template]);
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

  const embedded = spec.items.map(name => prepareEmbedded(docs[name]));
  actor.items = embedded.map(item => item._id);
  return { actor, embedded };
}

async function main() {
  const { templates, docs } = await loadSources();
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
      const { actor, embedded } = buildNpc(spec, templates, docs);
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
