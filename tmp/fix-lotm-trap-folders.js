const path = require("path");
const { ClassicLevel } = require("./node-tools/node_modules/classic-level");

const ROOT = path.join(__dirname, "..");
const PACK = path.join(ROOT, "packs", "lotm_items");
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

(async () => {
  const db = new ClassicLevel(PACK, { valueEncoding: "utf8" });
  await db.open();
  const ops = [];
  for await (const [key, value] of db.iterator()) {
    if (!key.startsWith("!items!")) continue;
    const doc = JSON.parse(value);
    if (!TRAP_NAMES.has(doc.name)) continue;
    doc.folder = TRAP_FOLDER;
    if (doc._stats) doc._stats.modifiedTime = Date.now();
    ops.push({ type: "put", key, value: JSON.stringify(doc) });
  }
  await db.batch(ops);
  await db.close();
  console.log(`updated=${ops.length}`);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
