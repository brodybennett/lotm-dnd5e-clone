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

const F = {
  armor: "LOxFBqesgQ1OfPjh",
  consumables: "LOhzzA6eM70QAVL6",
  equipment: "4eIdvJQzTs7c0taj",
  tools: "wsNh2lLy1muOc97X",
  traps: "OZfOaplmVF7VV7ta",
  weapons: "s2wvLeCz92BaGi24",
  artifacts: "vR6wEqLYW8TuAP2r"
};

const LOCAL = {
  armor: "systems/lotm/icons/svg/checked-shield.svg",
  consumables: "systems/lotm/icons/svg/items/consumable.svg",
  equipment: "systems/lotm/icons/svg/items/equipment.svg",
  tools: "systems/lotm/icons/svg/items/tool.svg",
  traps: "systems/lotm/icons/svg/statuses/restrained.svg",
  weapons: "systems/lotm/icons/svg/items/weapon.svg",
  artifacts: "systems/lotm/icons/svg/properties/magical.svg",
  fallback: "systems/lotm/icons/svg/documents/item.svg"
};

function folderToImg(folder, packName) {
  if (packName === "lotm_items_armor" || folder === F.armor) return LOCAL.armor;
  if (packName === "lotm_items_consumables" || folder === F.consumables) return LOCAL.consumables;
  if (packName === "lotm_items_equipment" || folder === F.equipment) return LOCAL.equipment;
  if (packName === "lotm_items_tools" || folder === F.tools) return LOCAL.tools;
  if (packName === "lotm_items_traps" || folder === F.traps) return LOCAL.traps;
  if (packName === "lotm_items_weapons" || folder === F.weapons) return LOCAL.weapons;
  if (packName === "lotm_items_sealed_artifacts" || folder === F.artifacts) return LOCAL.artifacts;
  return LOCAL.fallback;
}

async function rewritePack(packName) {
  const db = new ClassicLevel(path.join(ROOT, "packs", packName), { valueEncoding: "utf8" });
  await db.open();
  const docs = [];
  for await (const [key, value] of db.iterator()) {
    docs.push([key, JSON.parse(value)]);
  }

  const ops = [];
  for (const [key, doc] of docs) {
    if (key.startsWith("!items!")) {
      doc.img = folderToImg(doc.folder, packName);
      if (doc._stats) doc._stats.modifiedTime = Date.now();
      ops.push({ type: "put", key, value: JSON.stringify(doc) });
    }
  }

  await db.batch(ops);
  await db.close();
  return ops.length;
}

(async () => {
  for (const pack of PACKS) {
    const count = await rewritePack(pack);
    console.log(`${pack}: ${count}`);
  }
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
