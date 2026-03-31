const path = require('path');
const { Level } = require('level');

const ROOT = process.cwd();
const PACKS = path.join(ROOT, 'packs');
const ACTOR_PACK = path.join(PACKS, 'lotm_actors');
const MONSTERS_PACK = path.join(PACKS, 'monsters');

const FOLDER_ID = 'oChbG0Uk4v6XhIc1';
const FACTION = 'Monsters';

const ACTORS = [
  {
    sourceId: 'NAISFPoNNgUCsEyW',
    name: 'Plague Cart Zombie',
    img: 'systems/lotm/tokens/undead/Zombie.webp',
    description: '<p>A shambling corpse hauled from alleys, plague pits, or failed rituals. Useful as disposable pressure in city streets, catacombs, and disaster scenes.</p>',
    customType: 'urban undead thrall'
  },
  {
    sourceId: 'OBujQLLPSmlJiZnL',
    name: 'Sewer Ghoul',
    img: 'systems/lotm/tokens/undead/Ghoul.webp',
    description: '<p>A corpse-eater nesting in drains, culverts, and forgotten tunnels. Built as a fast low-tier ambusher that punishes isolated targets.</p>',
    customType: 'sewer corpse-eater'
  },
  {
    sourceId: 'QGcQYZbVl4bWzi4E',
    name: 'Fogbound Shadow',
    img: 'systems/lotm/tokens/undead/Shadow.webp',
    description: '<p>A light-starved spirit that clings to lamp alleys, basements, and blackout districts. Useful for stealth horror, attrition, and environmental pressure.</p>',
    customType: 'light-draining haunt'
  },
  {
    sourceId: 'CqQ6pXQA5WXZNOm3',
    name: 'Bell-Tower Harpy',
    img: 'systems/lotm/tokens/monstrosity/Harpy.webp',
    description: '<p>A rooftop predator that lures listeners off parapets, piers, and cliff roads with false cries and ruined hymns. Useful in travel scenes and vertical terrain.</p>',
    customType: 'aerial lure predator'
  },
  {
    sourceId: 'hx240PG5r5qpRet3',
    name: 'Canal Mimic',
    img: 'systems/lotm/tokens/monstrosity/Mimic.webp',
    description: '<p>A lurking shapechanger that hides among crates, ferries, lockboxes, and dock cargo. Useful as a surprise hazard in warehouses and black-market scenes.</p>',
    customType: 'dockside shapechanger'
  },
  {
    sourceId: '0m8QyDN52qw9zzOM',
    name: 'Shrine Gargoyle',
    img: 'systems/lotm/tokens/elemental/Gargoyle.webp',
    description: '<p>A weathered stone sentinel perched over mausoleums, storm shrines, and abandoned plazas. Useful as a durable ambush defender with good terrain presence.</p>',
    customType: 'stone shrine sentinel'
  },
  {
    sourceId: 'mWbrPhcKOz6oLXMV',
    name: 'Borrowed-Face Impostor',
    img: 'systems/lotm/tokens/monstrosity/Doppelganger.webp',
    description: '<p>A social infiltrator that replaces clerks, servants, and minor officials long before violence starts. Useful for conspiracies, paranoia, and false allies.</p>',
    customType: 'human-replacing infiltrator'
  },
  {
    sourceId: '3fzQVYQhXxCXRa2o',
    name: 'Catacomb Slime Cube',
    img: 'systems/lotm/tokens/ooze/GelatinousCube.webp',
    description: '<p>A transparent dungeon-cleaner turned lethal in flooded crypts and service tunnels. Useful as a terrain monster and movement tax instead of a smart foe.</p>',
    customType: 'catacomb ooze hazard'
  },
  {
    sourceId: 'jcZblJ6lqtW0ePxe',
    name: 'Cesspit Devourer',
    img: 'systems/lotm/tokens/aberration/Otyugh.webp',
    description: '<p>A garbage-fed aberration living beneath slums, foundries, and prison drains. Useful as a foul brute, undercity boss, or disgusting clue source.</p>',
    customType: 'sewer aberration brute'
  },
  {
    sourceId: 'rbyp54px2D0ql4QK',
    name: 'Graveyard Wight Captain',
    img: 'systems/lotm/tokens/undead/Wight.webp',
    description: '<p>An intelligent undead commander that rallies lesser dead and turns a burial ground into an occupied zone. Useful as a tactical elite with minion support.</p>',
    customType: 'undead patrol captain'
  },
  {
    sourceId: 'ET4PEVEiNJLU4f7c',
    name: 'Drowned Wraith',
    img: 'systems/lotm/tokens/undead/Wraith.webp',
    description: '<p>A hateful spirit of flood, wreck, or execution by water that moves through piers and flooded chambers like a curse. This is the folder’s leader-grade haunting threat.</p>',
    customType: 'water-haunted wraith'
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
  try {
    const actors = {};
    const items = {};
    for (const spec of ACTORS) {
      actors[spec.sourceId] = await scanKey(monstersDb, `!actors!${spec.sourceId}`);
      items[spec.sourceId] = [];
      for await (const [key, value] of monstersDb.iterator({
        gte: `!actors.items!${spec.sourceId}.`,
        lte: `!actors.items!${spec.sourceId}.~`
      })) {
        items[spec.sourceId].push(value);
      }
    }
    return { actors, items };
  } finally {
    await monstersDb.close();
  }
}

function buildActor(spec, sourceActor, sourceItems) {
  const actor = clone(sourceActor);
  actor._id = randomId();
  actor.name = spec.name;
  actor.folder = FOLDER_ID;
  actor.img = spec.img;
  actor.items = [];
  actor.effects = clone(actor.effects || []);
  actor.flags = actor.flags || {};
  actor.flags.lotm = {
    sourceBook: 'LoTM Core',
    faction: FACTION,
    organization: FACTION
  };

  actor.prototypeToken = actor.prototypeToken || {};
  actor.prototypeToken.texture = actor.prototypeToken.texture || {};
  actor.prototypeToken.texture.src = spec.img;

  actor.system.details = actor.system.details || {};
  actor.system.details.biography = actor.system.details.biography || { value: '', public: '' };
  actor.system.details.biography.value = spec.description;
  actor.system.details.faction = FACTION;
  actor.system.details.organization = FACTION;
  actor.system.details.type = actor.system.details.type || {};
  actor.system.details.type.custom = spec.customType;

  const embedded = sourceItems.map(prepareEmbedded);
  actor.items = embedded.map(item => item._id);
  return { actor, embedded };
}

async function main() {
  const { actors, items } = await loadSources();
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
      const { actor, embedded } = buildActor(spec, actors[spec.sourceId], items[spec.sourceId]);
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
