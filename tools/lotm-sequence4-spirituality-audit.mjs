import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { ClassicLevel } = require("../tmp/node-tools/node_modules/classic-level");

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ABILITIES_DB_PATH = path.join(ROOT, "packs", "lotm_abilities");
const REPORT_PATH = path.join(ROOT, "docs", "LoTM_Sequence4_Spirituality_Audit.md");

const TARGET_BASELINE = 5;

const LADDER_NORMALIZATIONS = Object.freeze({
  lotmAbilityB4001: Object.freeze({ name: "Purification", from: [4, 8, 12], to: [1, 2, 4] }),
  lotmAbilityB4002: Object.freeze({ name: "Unshadowed Domain", from: [4, 8, 12], to: [1, 2, 4] }),
  lotmAbilityB4003: Object.freeze({ name: "Flaring Sun", from: [4, 8, 12], to: [1, 2, 4] }),
  lotmAbilityB4004: Object.freeze({ name: "Holy Eye", from: [3, 6, 9], to: [1, 2, 4] }),
  lotmAbilityC4001: Object.freeze({ name: "Reincarnation", from: [2, 4, 6], to: [1, 2, 4] }),
  lotmAbilityC4002: Object.freeze({ name: "Underworld Authority", from: [2, 4, 6], to: [1, 2, 4] }),
  lotmAbilityC4003: Object.freeze({ name: "Spirit World Traversal", from: [2, 4, 6], to: [1, 2, 4] }),
  lotmAbilityC4004: Object.freeze({ name: "Sealing Edict", from: [2, 4, 6], to: [1, 2, 4] }),
  lotmAbilityL4001: Object.freeze({ name: "Hurricane Dominion", from: [2, 4, 6], to: [1, 2, 4] }),
  lotmAbilityL4002: Object.freeze({ name: "Tsunami Judgment", from: [2, 4, 6], to: [1, 2, 4] }),
  lotmAbilityR4004: Object.freeze({ name: "Grand Synthesis Rite", from: [2, 4, 6], to: [1, 2, 4] }),
  lotmAbilityS4001: Object.freeze({ name: "Bizarro Tableau", from: [2, 4, 6], to: [1, 2, 4] }),
  lotmAbilityV4001: Object.freeze({ name: "Manipulation", from: [2, 4, 6], to: [1, 2, 4] }),
  lotmAbilityV4002: Object.freeze({ name: "Mental Plague", from: [2, 4, 6], to: [1, 2, 4] }),
  lotmAbilityV4003: Object.freeze({ name: "Mind Dragon Breath", from: [2, 4, 6], to: [1, 2, 4] }),
  lotmAbilityV4004: Object.freeze({ name: "Consciousness Stroll", from: [2, 4, 6], to: [1, 2, 4] })
});

const REPAIRED_SEQUENCE_TAG_IDS = new Set([
  "lotmAbilityS4001",
  "lotmAbilityS4002",
  "lotmAbilityS4003",
  "lotmAbilityS4004",
  "lotmAbilityV4001",
  "lotmAbilityV4002",
  "lotmAbilityV4003",
  "lotmAbilityV4004"
]);

const NORMALIZED_PATHWAYS = new Set([
  "lotm-bard",
  "lotm-corpse-collector",
  "lotm-sailor",
  "lotm-spectator"
]);

const NORMALIZED_ITEM_IDS = new Set([
  "lotmAbilityR4004",
  "lotmAbilityS4001"
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

function inferSequence4(item) {
  if ( item?.flags?.lotm?.grantedSequence === 4 ) return true;
  return Number(item?.system?.level) === 5;
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
    if ( NORMALIZED_PATHWAYS.has(String(identifier)) ) note = "Normalized to shared Sequence 4 spine.";
    else if ( NORMALIZED_ITEM_IDS.has(item._id) ) note = "Targeted repricing to remove surcharge.";
    else if ( REPAIRED_SEQUENCE_TAG_IDS.has(item._id) ) note = "Sequence tag repaired.";
    else if ( ladderType === "standard+extra" ) note = "Explicit fourth escalation retained.";
    return `| ${pathwayName(identifier)} | ${item.name} | ${baseline} | ${tiers} | ${ladderType} | ${note} |`;
  }).join("\n");

  return [
    "# LoTM Sequence 4 Spirituality Audit",
    "",
    "This report audits live Sequence 4 pathway abilities in `packs/lotm_abilities` and normalizes spirituality pricing text plus missing sequence metadata.",
    "",
    "## Sequence 4 Cost Logic",
    "",
    "- Base cast at Sequence 4 should be `5 Spirituality`; live level-5 abilities already derive that cost automatically from item level.",
    "- Standard Sequence 4 upcast ladder is `+1 / +2 / +4` above the base cost.",
    "- `+1` is for the first meaningful expansion in area, target count, rider strength, or tactical reliability.",
    "- `+2` is for major control, sustained value, or a second large rider.",
    "- `+4` is for clear encounter-shaping escalation, domain authority, or a qualitatively stronger end-state.",
    "- Sequence 4 reserve pressure is light relative to max spirituality, so fairness here is driven more by cross-pathway consistency than by raw affordability.",
    "",
    "## Findings",
    "",
    "- Sequence 4 showed the broadest authored-text drift so far. Many abilities still advertised `0-4` spirituality baselines even though the live system already charges `5` from item level.",
    "- Bard remained heavily over-surcharged across the full package, with baseline text as high as `8-10` and ladders at `+3 / +6 / +9` or `+4 / +8 / +12`.",
    "- Corpse Collector and Spectator were still authored on a synthetic `0 + 2 / 4 / 6` spine despite Sequence 4 now living on the level-5 economy.",
    "- Sailor's major authority tools, Reader's `Grand Synthesis Rite`, and Seer's `Bizarro Tableau` were also carrying unnecessary `+2 / +4 / +6` premiums relative to comparable Sequence 4 control tools.",
    "- Seer and Spectator Sequence 4 abilities were missing `flags.lotm.grantedSequence = 4`; those tags were repaired for future grouped audits.",
    "- Explicit four-step ladders were retained where they represent a genuine additional escalation tier rather than a surcharge replacing the standard three-step spine.",
    "",
    "## Live Sequence 4 Table",
    "",
    "| Pathway | Ability | Base | Upcast Ladder | Ladder Type | Notes |",
    "|---|---|---:|---|---|---|",
    rows,
    "",
    "## Normalization Summary",
    "",
    "- All live Sequence 4 abilities now present `Baseline (5 Spirituality)` to match the actual level-based system cost.",
    "- Bard, Corpse Collector, Sailor, and Spectator now follow the shared Sequence 4 `5 / +1 / +2 / +4` spine.",
    "- Reader's `Grand Synthesis Rite` and Seer's `Bizarro Tableau` were normalized to remove bespoke surcharge pricing.",
    "- Extended four-step ladders on explicit escalation abilities were left intact when they add an extra premium tier instead of replacing the standard one.",
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
      if ( !inferSequence4(item) ) continue;

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

      if ( REPAIRED_SEQUENCE_TAG_IDS.has(item._id) && (item.flags?.lotm?.grantedSequence !== 4) ) {
        item.flags ??= {};
        item.flags.lotm ??= {};
        item.flags.lotm.grantedSequence = 4;
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
      if ( !inferSequence4(item) ) continue;
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
