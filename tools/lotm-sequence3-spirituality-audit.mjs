import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { ClassicLevel } = require("../tmp/node-tools/node_modules/classic-level");

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ABILITIES_DB_PATH = path.join(ROOT, "packs", "lotm_abilities");
const REPORT_PATH = path.join(ROOT, "docs", "LoTM_Sequence3_Spirituality_Audit.md");

const TARGET_BASELINE = 6;

const LADDER_NORMALIZATIONS = Object.freeze({
  lotmAbilityB3001: Object.freeze({ name: "Justice Halo", from: [4, 8, 12], to: [1, 2, 4] }),
  lotmAbilityB3002: Object.freeze({ name: "Judgment of Justice", from: [3, 6, 9], to: [1, 2, 4] }),
  lotmAbilityB3003: Object.freeze({ name: "Holy Contract", from: [2, 4, 8], to: [1, 2, 4] }),
  lotmAbilityB3004: Object.freeze({ name: "Holy Equipment", from: [3, 6, 9], to: [1, 2, 4] }),
  lotmAbilityC3001: Object.freeze({ name: "Hands of Life and Death", from: [2, 4, 6], to: [1, 2, 4] }),
  lotmAbilityC3002: Object.freeze({ name: "Ferryman", from: [2, 4, 6], to: [1, 2, 4] }),
  lotmAbilityC3003: Object.freeze({ name: "Death Gaze", from: [2, 4, 6], to: [1, 2, 4] }),
  lotmAbilityC3004: Object.freeze({ name: "Styx Afloat", from: [2, 4, 6], to: [1, 2, 4] }),
  lotmAbilityL3001: Object.freeze({ name: "Sea King's Territory", from: [2, 4, 6], to: [1, 2, 4] }),
  lotmAbilityL3002: Object.freeze({ name: "Storm Regalia", from: [2, 4, 6], to: [1, 2, 4] }),
  lotmAbilityL3003: Object.freeze({ name: "Abyssal Tide Warrant", from: [2, 4, 6], to: [1, 2, 4] }),
  lotmAbilityL3004: Object.freeze({ name: "Thunderclap Mandate", from: [1, 3, 6], to: [1, 2, 4] }),
  lotmAbilityR3001: Object.freeze({ name: "Axiom Delineation", from: [2, 4, 6], to: [1, 2, 4] }),
  lotmAbilityR3004: Object.freeze({ name: "Proofreading Mandate", from: [2, 4, 6], to: [1, 2, 4] }),
  lotmAbilityS3001: Object.freeze({ name: "Historical Borrowing", from: [2, 4, 6], to: [1, 2, 4] }),
  lotmAbilityS3002: Object.freeze({ name: "Historical Projection", from: [2, 4, 6], to: [1, 2, 4] }),
  lotmAbilityS3003: Object.freeze({ name: "Historical Void Hiding", from: [2, 4, 6], to: [1, 2, 4] }),
  lotmAbilityV3001: Object.freeze({ name: "Dream Weaving", from: [2, 4, 6], to: [1, 2, 4] }),
  lotmAbilityV3002: Object.freeze({ name: "Plague Storm", from: [2, 4, 6], to: [1, 2, 4] }),
  lotmAbilityV3003: Object.freeze({ name: "Virtual Persona", from: [2, 4, 6], to: [1, 2, 4] }),
  lotmAbilityV3004: Object.freeze({ name: "Enhanced Mental Attributes", from: [2, 4, 6], to: [1, 2, 4] })
});

const REPAIRED_SEQUENCE_TAG_IDS = new Set([
  "lotmAbilityS3001",
  "lotmAbilityS3002",
  "lotmAbilityS3003",
  "lotmAbilityV3001",
  "lotmAbilityV3002",
  "lotmAbilityV3003",
  "lotmAbilityV3004"
]);

const NORMALIZED_PATHWAYS = new Set([
  "lotm-bard",
  "lotm-corpse-collector",
  "lotm-sailor",
  "lotm-spectator"
]);

const TARGETED_ITEM_IDS = new Set([
  "lotmAbilityR3001",
  "lotmAbilityR3004",
  "lotmAbilityS3001",
  "lotmAbilityS3002",
  "lotmAbilityS3003"
]);

function pathwayName(identifier) {
  return String(identifier ?? "")
    .replace(/^lotm-/, "")
    .split("-")
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function decodeHtml(html) {
  return String(html ?? "")
    .replace(/&nbsp;/g, " ")
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, "\"")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function inferSequence3(item) {
  return Number(item?.system?.level) === 6;
}

function extractUpcastTiers(html) {
  const segment = html.match(/<p><strong>Higher Spend \(upcast\):<\/strong><\/p><ul>([\s\S]*?)<\/ul>/i)?.[1] ?? "";
  return [...segment.matchAll(/\+(\d+) Spirituality/gi)].map(match => Number(match[1]));
}

function classifyLadder(item) {
  const tiers = extractUpcastTiers(decodeHtml(item.system?.description?.value));
  const serialized = tiers.join("/");
  if ( serialized === "1/2/4" ) return "standard";
  if ( serialized === "1/2/3" ) return "compressed";
  if ( serialized.startsWith("1/2/4/") ) return "standard+extra";
  return serialized || "unparsed";
}

function normalizeBaseline(description, label) {
  const match = description.match(/<p><strong>Baseline \((\d+) Spirituality\):<\/strong>/i);
  if ( !match ) throw new Error(`Missing baseline text on ${label}`);
  if ( Number(match[1]) === TARGET_BASELINE ) return { description, changed: false };
  return {
    description: description.replace(match[0], `<p><strong>Baseline (${TARGET_BASELINE} Spirituality):</strong>`),
    changed: true
  };
}

function normalizeUpcastLadder(description, rule) {
  const pattern = /(<p><strong>Higher Spend \(upcast\):<\/strong><\/p><ul>)([\s\S]*?)(<\/ul>)/i;
  const match = description.match(pattern);
  if ( !match ) throw new Error(`Missing Higher Spend block on ${rule.name}`);

  const currentTiers = [...match[2].matchAll(/<li><strong>\+(\d+) Spirituality:<\/strong>/gi)].map(entry => Number(entry[1]));
  const currentPrefix = currentTiers.slice(0, rule.from.length).join("/");
  const expectedPrefix = rule.from.join("/");
  const targetPrefix = rule.to.join("/");
  if ( currentPrefix === targetPrefix ) return { description, changed: false };
  if ( currentPrefix !== expectedPrefix ) {
    throw new Error(`Unexpected upcast ladder on ${rule.name}: found ${currentPrefix || "none"}, expected ${expectedPrefix}`);
  }

  let segment = match[2];
  for ( let i = 0; i < rule.from.length; i += 1 ) {
    const from = new RegExp(`(<li><strong>\\+)${rule.from[i]}( Spirituality:<\\/strong>)`, "i");
    if ( !from.test(segment) ) throw new Error(`Expected +${rule.from[i]} tier missing on ${rule.name}`);
    segment = segment.replace(from, `$1${rule.to[i]}$2`);
  }

  return {
    description: description.replace(pattern, `$1${segment}$3`),
    changed: true
  };
}

function buildReport(items) {
  const rows = items.map(item => {
    const identifier = item.system?.sourceClass;
    const html = decodeHtml(item.system?.description?.value);
    const baseline = html.match(/Baseline \((\d+) Spirituality\)/i)?.[1] ?? "?";
    const tiers = extractUpcastTiers(html).join(" / ");
    const ladderType = classifyLadder(item);
    let note = "";
    if ( NORMALIZED_PATHWAYS.has(String(identifier)) ) note = "Normalized to shared Sequence 3 spine.";
    else if ( TARGETED_ITEM_IDS.has(item._id) ) note = "Targeted repricing to remove surcharge.";
    else if ( REPAIRED_SEQUENCE_TAG_IDS.has(item._id) ) note = "Sequence tag repaired.";
    else if ( ladderType === "standard+extra" ) note = "Explicit fourth escalation retained.";
    return `| ${pathwayName(identifier)} | ${item.name} | ${baseline} | ${tiers} | ${ladderType} | ${note} |`;
  }).join("\n");

  return [
    "# LoTM Sequence 3 Spirituality Audit",
    "",
    "This report audits live Sequence 3 pathway abilities in `packs/lotm_abilities` and normalizes spirituality pricing text plus missing sequence metadata.",
    "",
    "## Sequence 3 Cost Logic",
    "",
    "- Base cast at Sequence 3 should be `6 Spirituality`; live level-6 abilities already derive that cost automatically from item level.",
    "- Standard Sequence 3 upcast ladder is `+1 / +2 / +4` above the base cost.",
    "- `+1` is for the first meaningful increase in scope, rider value, target count, or tactical reliability.",
    "- `+2` is for major sustained pressure, stronger control, or a second substantial rider.",
    "- `+4` is for clear saint-tier escalation, layered authority, or an encounter-shaping end-state.",
    "- Sequence 3 reserve pressure is extremely forgiving relative to runtime max spirituality, so normalization here is primarily about internal logic and cross-pathway fairness.",
    "",
    "## Findings",
    "",
    "- Sequence 3 again showed major authored-text drift under the live level-based cost; most abilities were still labelled between `0` and `5` even though the real baseline is already `6`.",
    "- Bard remained over-surcharged across the full package, including one `+4 / +8 / +12` ladder and two `+3 / +6 / +9` ladders.",
    "- Corpse Collector and Spectator were still using a synthetic `0 + 2 / 4 / 6` economy that no longer matches the actual Sequence 3 reserve band.",
    "- Sailor, Reader, and Seer each had premium `+2 / +4 / +6` ladders on abilities whose effect profile fits the shared saint-tier pricing spine.",
    "- Seer and Spectator Sequence 3 abilities were missing `flags.lotm.grantedSequence = 3`; those tags were repaired.",
    "- This pass scopes actual level-6 items only, because unrelated Sleepless legacy records are currently carrying stale `grantedSequence = 3` metadata despite belonging to higher item levels.",
    "",
    "## Live Sequence 3 Table",
    "",
    "| Pathway | Ability | Base | Upcast Ladder | Ladder Type | Notes |",
    "|---|---|---:|---|---|---|",
    rows,
    "",
    "## Normalization Summary",
    "",
    "- All live Sequence 3 abilities now present `Baseline (6 Spirituality)` to match the actual level-based system cost.",
    "- Bard, Corpse Collector, Sailor, and Spectator now follow the shared Sequence 3 `6 / +1 / +2 / +4` spine.",
    "- Reader's `Axiom Delineation` and `Proofreading Mandate`, plus Seer's historical suite, were normalized to remove bespoke surcharge ladders.",
    "- Explicit four-step ladders on Criminal remain intact where they represent an added premium escalation rather than a replacement for the standard three-step structure.",
    ""
  ].join("\n");
}

async function main() {
  const db = new ClassicLevel(ABILITIES_DB_PATH, { valueEncoding: "utf8" });
  await db.open();

  try {
    for await ( const [key, value] of db.iterator() ) {
      if ( !key.startsWith("!items!") ) continue;
      const item = JSON.parse(value);
      if ( item.type !== "spell" ) continue;
      if ( !item.system?.sourceClass ) continue;
      if ( !inferSequence3(item) ) continue;

      let changed = false;
      let description = String(item.system?.description?.value ?? "");

      const baselineResult = normalizeBaseline(description, item.name);
      description = baselineResult.description;
      changed = baselineResult.changed || changed;

      const rule = LADDER_NORMALIZATIONS[item._id];
      if ( rule ) {
        const ladderResult = normalizeUpcastLadder(description, rule);
        description = ladderResult.description;
        changed = ladderResult.changed || changed;
      }

      if ( changed ) item.system.description.value = description;

      if ( REPAIRED_SEQUENCE_TAG_IDS.has(item._id) && (item.flags?.lotm?.grantedSequence !== 3) ) {
        item.flags ??= {};
        item.flags.lotm ??= {};
        item.flags.lotm.grantedSequence = 3;
        changed = true;
      }

      if ( changed ) await db.put(key, JSON.stringify(item));
    }
  } finally {
    await db.close();
  }

  const verifyDb = new ClassicLevel(ABILITIES_DB_PATH, { valueEncoding: "utf8" });
  await verifyDb.open();
  const items = [];
  try {
    for await ( const [key, value] of verifyDb.iterator() ) {
      if ( !key.startsWith("!items!") ) continue;
      const item = JSON.parse(value);
      if ( item.type !== "spell" ) continue;
      if ( !item.system?.sourceClass ) continue;
      if ( !inferSequence3(item) ) continue;
      items.push(item);
    }
  } finally {
    await verifyDb.close();
  }

  items.sort((a, b) => {
    return String(a.system?.sourceClass).localeCompare(String(b.system?.sourceClass))
      || String(a.name).localeCompare(String(b.name));
  });

  fs.writeFileSync(REPORT_PATH, buildReport(items), "utf8");
  console.log(`Wrote ${REPORT_PATH}`);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
