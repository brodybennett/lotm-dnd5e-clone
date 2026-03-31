const path = require("path");
const { ClassicLevel } = require("./node-tools/node_modules/classic-level");

const ROOT = path.join(__dirname, "..");
const PACKS = ["lotm_items", "lotm_items_traps"];
const TRAP_FOLDER = "OZfOaplmVF7VV7ta";
const TRAP_NAMES = new Set([
  "Black Flame Lure",
  "Mirror-Shard Hex",
  "Soot Flask Alarm",
  "Razor Spring Snare",
  "Grave-Salt Ward",
  "Whisper Thread Tripline",
  "Scorchline Sigil",
  "Sleep Pollen Charge"
]);

async function patchPack(packName) {
  const db = new ClassicLevel(path.join(ROOT, "packs", packName), { valueEncoding: "utf8" });
  await db.open();
  const ops = [];
  for await (const [key, value] of db.iterator()) {
    if (!key.startsWith("!items!")) continue;
    const doc = JSON.parse(value);
    if (!TRAP_NAMES.has(doc.name)) continue;
    doc.system ??= {};
    doc.system.type ??= {};
    doc.system.type.value = "trap";
    if (packName === "lotm_items") doc.folder = TRAP_FOLDER;
    if (doc._stats) doc._stats.modifiedTime = Date.now();
    ops.push({ type: "put", key, value: JSON.stringify(doc) });
  }
  await db.batch(ops);
  await db.close();
  return ops.length;
}

(async () => {
  for (const pack of PACKS) {
    const count = await patchPack(pack);
    console.log(`${pack}: ${count}`);
  }
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
