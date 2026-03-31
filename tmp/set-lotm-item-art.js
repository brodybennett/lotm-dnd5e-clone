const fs = require("fs");
const path = require("path");
const { ClassicLevel } = require("./node-tools/node_modules/classic-level");

const ROOT = path.join(__dirname, "..");
const PACKS = [
  "lotm_items",
  "lotm_items_armor",
  "lotm_items_consumables",
  "lotm_items_equipment",
  "lotm_items_tools",
  "lotm_items_traps",
  "lotm_items_weapons",
  "lotm_items_sealed_artifacts"
];
const PUBLIC_ICONS = "C:/Program Files/Foundry Virtual Tabletop/resources/app/public";

function parseOriginalImages() {
  const src = fs.readFileSync(path.join(ROOT, "tmp", "populate-lotm-items.js"), "utf8");
  const re = /name: "([^"]+)",[\s\S]*?img: "([^"]+)"/g;
  const map = {};
  let m;
  while ((m = re.exec(src))) map[m[1]] = m[2];
  return map;
}

const overrides = {
  "Clerk's Padded Coat": "icons/equipment/chest/breastplate-quilted-brown.webp",
  "Oilcloth Investigator's Coat": "icons/equipment/chest/coat-leather-blue.webp",
  "Nightwatch Cloak": "icons/equipment/back/cloak-collared-grey-gold.webp",
  "Storm-Sealed Greatcoat": "icons/equipment/back/cloak-collared-blue-gold.webp",
  "Mirror-Silk Vestments": "icons/equipment/chest/robe-layered-white.webp",
  "Red Mercury Stimulant": "icons/consumables/potions/bottle-bulb-corked-glowing-red.webp",
  "Corpse-Salt Packet": "icons/consumables/food/salt-seasoning-spice-pink.webp",
  "Dreamless Incense Stick": "icons/sundries/lights/candle-unlit-tan.webp",
  "Sedative Toxin Ampoule": "icons/consumables/potions/bottle-conical-corked-labeled-skull-poison-green.webp",
  "Scorchline Capsule": "icons/tools/laboratory/powder-red.webp",
  "Moon Paper Charm": "icons/sundries/documents/document-symbol-rune-tan.webp",
  "Ritual Chalk Case": "icons/tools/scribal/pen-stylus-pencil.webp",
  "Traveler's Chalk Reel": "icons/tools/navigation/map-marked-white-red.webp",
  "Grave Bell": "icons/tools/instruments/bell-brass.webp",
  "Concealment Veil": "icons/equipment/head/hood-cowl-mask-purple.webp",
  "Contract Ledger": "icons/sundries/books/book-embossed-gold-red.webp",
  "Omen Thread Reel": "icons/commodities/cloth/thread-spindle-red.webp",
  "Portable Ritual Brazier": "icons/tools/laboratory/cauldron-filled-gold.webp",
  "Cipher Wheel": "icons/sundries/gaming/rune-card.webp",
  "Ritual Engraver Set": "icons/tools/hand/chisel-steel-brown.webp",
  "Razor Spring Snare": "icons/magic/control/debuff-energy-snare-brown.webp",
  "Grave-Salt Ward": "icons/magic/symbols/runes-star-orange.webp",
  "Whisper Thread Tripline": "icons/magic/control/debuff-chains-ropes-net-white.webp",
  "Sleep Pollen Charge": "icons/tools/laboratory/mortar-powder-green.webp",
  "Mirror-Shard Hex": "icons/magic/symbols/rune-sigil-horned-blue.webp",
  "Concealed Sleeve Dagger": "icons/weapons/daggers/dagger-curved-blue.webp",
  "Hooked Chain Knife": "icons/weapons/daggers/dagger-curved-guard-black.webp",
  "Bone-Saw Hatchet": "icons/weapons/axes/axe-broad-grey.webp",
  "Bayonet Carbine": "icons/weapons/guns/rifle-bayonet.webp",
  "Air Bullet Pistol": "icons/weapons/guns/gun-pistol-flintlock-metal.webp",
  "Black Flame Dirk": "icons/magic/fire/dagger-rune-enchant-flame-red.webp",
  "Verdict Rod": "icons/weapons/staves/staff-ornate-cross.webp",
  "Sealed Artifact 2-003: Midnight Veil": "icons/equipment/back/cloak-heavy-black-red.webp",
  "Sealed Artifact 2-027: Lantern of Unshadowing": "icons/sundries/lights/lantern-bullseye-signal-copper.webp",
  "Sealed Artifact 2-041: Door-Splinter Ring": "icons/equipment/finger/ring-band-engraved-lines-bronze.webp",
  "Sealed Artifact 2-066: Undertaker's Bell": "icons/magic/sonic/bell-alarm-red-purple.webp",
  "Sealed Artifact 2-079: Marionette Thread Spool": "icons/magic/control/control-influence-puppet.webp",
  "Sealed Artifact 2-088: Stormglass Crown Shard": "icons/equipment/head/crown-gold-blue.webp",
  "Sealed Artifact 2-101: Mask of Borrowed Fate": "icons/equipment/head/mask-carved-wood-white.webp",
  "Sealed Artifact 0-005: Crown of the False Sun": "icons/commodities/treasure/crown-gold-laurel-wreath.webp",
  "Sealed Artifact 1-014: Tribunal Noose": "icons/sundries/survival/rope-noose-brown.webp",
  "Sealed Artifact 1-031: Funeral March Scepter": "icons/weapons/staves/staff-animal-skull.webp",
  "Sealed Artifact 2-118: Coffin Lid Gavel": "icons/tools/hand/hammer-mallet-brown.webp",
  "Sealed Artifact 2-133: Mirror Fugue Compact": "icons/magic/defensive/illusion-evasion-echo-purple.webp",
  "Sealed Artifact 2-147: Pilgrim's Chalk Door": "icons/sundries/documents/blueprint-magical-brown.webp",
  "Sealed Artifact 3-011: Candle of Dreamless Crossing": "icons/sundries/lights/candle-lit-angelic.webp",
  "Sealed Artifact 3-024: Ashen Clause Pen": "icons/tools/scribal/ink-quill-red.webp",
  "Sealed Artifact 3-039: Narrow Door Key": "icons/sundries/misc/key-short-glowing.webp",
  "Sealed Artifact 3-057: Black Mire Seal Nail": "icons/tools/hand/hammer-and-nail.webp",
  "Sealed Artifact 3-072: Mirror-Backed Coin": "icons/commodities/currency/coin-embossed-crown-gold.webp",
  "Sealed Artifact 3-083: Salt-Tide Rosary": "icons/equipment/neck/necklace-astrology-sun-gold.webp",
  "Sealed Artifact 3-095: Whispering Thread Thimble": "icons/commodities/cloth/thread-and-needle.webp",
  "Puppeteer Wire Kit": "icons/commodities/tech/wire-spool-thin.webp",
  "Surveyor's Transit": "icons/tools/navigation/sextant-complex-brown.webp",
  "Forger's Plate Kit": "icons/tools/smithing/plate-steel-grey.webp",
  "Soot Flask Alarm": "icons/skills/ranged/bomb-grenade-thrown-gray.webp",
  "Scorchline Sigil": "icons/magic/symbols/runes-star-orange-purple.webp",
  "Truncheon Cane": "icons/weapons/staves/staff-engraved-wood.webp"
};

async function rewritePack(packName, images) {
  const db = new ClassicLevel(path.join(ROOT, "packs", packName), { valueEncoding: "utf8" });
  await db.open();
  const ops = [];
  for await (const [key, value] of db.iterator()) {
    if (!key.startsWith("!items!")) continue;
    const doc = JSON.parse(value);
    if (!images[doc.name]) continue;
    doc.img = images[doc.name];
    if (doc._stats) doc._stats.modifiedTime = Date.now();
    ops.push({ type: "put", key, value: JSON.stringify(doc) });
  }
  await db.batch(ops);
  await db.close();
  return ops.length;
}

(async () => {
  const base = parseOriginalImages();
  const images = { ...base, ...overrides };

  const pack = new ClassicLevel(path.join(ROOT, "packs", "lotm_items"), { valueEncoding: "utf8" });
  await pack.open();
  const names = [];
  for await (const [key, value] of pack.iterator()) {
    if (!key.startsWith("!items!")) continue;
    names.push(JSON.parse(value).name);
  }
  await pack.close();

  const unmapped = names.filter((name) => !images[name]);
  if (unmapped.length) throw new Error(`Unmapped items:\n${unmapped.join("\n")}`);

  const missingFiles = names
    .map((name) => ({ name, img: images[name] }))
    .filter((row) => !fs.existsSync(path.join(PUBLIC_ICONS, row.img)));
  if (missingFiles.length) {
    throw new Error(`Missing icon files:\n${missingFiles.map((row) => `${row.name} :: ${row.img}`).join("\n")}`);
  }

  for (const packName of PACKS) {
    const count = await rewritePack(packName, images);
    console.log(`${packName}: ${count}`);
  }
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
