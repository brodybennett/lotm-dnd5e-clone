import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { ClassicLevel } = require("../tmp/node-tools/node_modules/classic-level");

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ABILITIES_DB_PATH = path.join(ROOT, "packs", "lotm_abilities");
const REPORT_PATH = path.join(ROOT, "docs", "LoTM_Sequence1_Spirituality_Audit.md");

const TARGET_BASELINE = 8;

const LADDER_NORMALIZATIONS = Object.freeze({
  lotmAbilityZ1002: Object.freeze({ name: "Statute Reformation", from: [1, 3, 6], to: [2, 4, 6] }),
  lotmAbilityZ1003: Object.freeze({ name: "Remote Judgment", from: [1, 3, 6], to: [2, 4, 6] }),
  lotmAbilityZ1004: Object.freeze({ name: "Anomaly Arbitration", from: [1, 3, 6], to: [2, 4, 6] }),
  lotmAbilityB1001: Object.freeze({ name: "Incarnation of Order", from: [8, 14, 20], to: [4, 8, 12] }),
  lotmAbilityB1002: Object.freeze({ name: "Holy Kingdom", from: [8, 14, 20], to: [4, 8, 12] }),
  lotmAbilityB1003: Object.freeze({ name: "Servant of Faith", from: [6, 12, 18], to: [4, 8, 12] }),
  lotmAbilityB1004: Object.freeze({ name: "Eternal Daytime", from: [8, 14, 20], to: [4, 8, 12] }),
  lotmAbilityF1003: Object.freeze({ name: "World Creation", from: [2, 3, 5], to: [2, 4, 6] })
});

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

function inferSequence1(item) {
  return Number(item?.system?.level) === 8;
}

function extractUpcastTiers(html) {
  const segment = html.match(/<p><strong>Higher Spend \(upcast\):<\/strong><\/p><ul>([\s\S]*?)<\/ul>/i)?.[1] ?? "";
  return [...segment.matchAll(/\+(\d+) Spirituality/gi)].map(match => Number(match[1]));
}

function classifyLadder(item) {
  const tiers = extractUpcastTiers(decodeHtml(item.system?.description?.value));
  const serialized = tiers.join("/");
  if ( serialized === "1/2/4" ) return "standard";
  if ( serialized === "2/4/6" ) return "focused-premium";
  if ( serialized === "2/4/8" ) return "authority-premium";
  if ( serialized === "4/8/12" ) return "apex-premium";
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

function buildNote(item) {
  const id = item._id;
  const identifier = String(item.system?.sourceClass ?? "");
  if ( identifier === "lotm-bard" ) return "Normalized to apex-premium ladder.";
  if ( id === "lotmAbilityZ1002" || id === "lotmAbilityZ1003" || id === "lotmAbilityZ1004" ) {
    return "Normalized to focused-premium ladder.";
  }
  if ( id === "lotmAbilityF1003" ) return "Normalized to focused-premium ladder.";
  if ( identifier === "lotm-corpse-collector" || identifier === "lotm-seer" || identifier === "lotm-spectator" ) {
    if ( classifyLadder(item) === "apex-premium" ) return item.flags?.lotm?.grantedSequence === 1 ? "Apex-premium ladder retained." : "";
  }
  if ( identifier === "lotm-sleepless" || identifier === "lotm-seer" || identifier === "lotm-spectator" ) {
    if ( item.flags?.lotm?.grantedSequence === 1 ) return "Sequence tag repaired.";
  }
  return "";
}

function buildReport(items) {
  const rows = items.map(item => {
    const identifier = item.system?.sourceClass;
    const html = decodeHtml(item.system?.description?.value);
    const baseline = html.match(/Baseline \((\d+) Spirituality\)/i)?.[1] ?? "?";
    const tiers = extractUpcastTiers(html).join(" / ");
    const ladderType = classifyLadder(item);
    const note = buildNote(item);
    return `| ${pathwayName(identifier)} | ${item.name} | ${baseline} | ${tiers} | ${ladderType} | ${note} |`;
  }).join("\n");

  return [
    "# LoTM Sequence 1 Spirituality Audit",
    "",
    "This report audits live Sequence 1 pathway abilities in `packs/lotm_abilities` and normalizes spirituality pricing text plus sequence metadata on the actual level-8 ability set.",
    "",
    "## Sequence 1 Cost Logic",
    "",
    "- Base cast at Sequence 1 should be `8 Spirituality`; live level-8 abilities already derive that cost automatically from item level.",
    "- Sequence 1 supports four valid pricing families because reserve floors are now large enough that premium spends need stronger differentiation:",
    "- `+1 / +2 / +4` for bounded or primarily tactical abilities.",
    "- `+2 / +4 / +6` for strong flexible control, rule-edit, or narrower high-tier premium abilities.",
    "- `+2 / +4 / +8` for broad authority, sovereign forms, battlefield domains, or mass command.",
    "- `+4 / +8 / +12` for apex reality-edit, spirit-sovereign, or scene-warping authorities whose spend should still feel meaningfully premium at Sequence 1 reserves.",
    "",
    "## Findings",
    "",
    "- Sequence 1 again showed major authored-text drift under the live level-8 cost; many abilities still advertised baselines between `0` and `12` even though the actual system baseline is already `8`.",
    "- Bard remained massively over-surcharged, with baselines between `16` and `20` and upcast ladders as high as `+8 / +14 / +20`.",
    "- Corpse Collector, Seer, and Spectator were already authored as apex-style packages conceptually, but their baseline text still lagged far below the real level-8 cost.",
    "- Arbiter's `+1 / +3 / +6` ladders and Planter's `+2 / +3 / +5` ladder did not match any coherent Sequence 1 pricing family and were normalized.",
    "- Actual level-8 Seer and Spectator abilities were missing `grantedSequence = 1`, and actual level-8 Sleepless abilities were still incorrectly tagged as Sequence 3. Those metadata errors were repaired.",
    "",
    "## Live Sequence 1 Table",
    "",
    "| Pathway | Ability | Base | Upcast Ladder | Ladder Type | Notes |",
    "|---|---|---:|---|---|---|",
    rows,
    "",
    "## Normalization Summary",
    "",
    "- All live level-8 abilities now present `Baseline (8 Spirituality)` to match the actual system cost.",
    "- Bard now uses the shared apex-premium `8 / +4 / +8 / +12` family instead of bespoke extreme surcharges.",
    "- Corpse Collector, Seer, and Spectator retain coherent apex-premium `8 / +4 / +8 / +12` ladders once baseline drift is corrected.",
    "- Arbiter and Planter outlier ladders were normalized into the focused-premium `8 / +2 / +4 / +6` family.",
    "- All actual Sequence 1 level-8 items now carry `flags.lotm.grantedSequence = 1`.",
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
      if ( !inferSequence1(item) ) continue;

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

      if ( item.flags?.lotm?.grantedSequence !== 1 ) {
        item.flags ??= {};
        item.flags.lotm ??= {};
        item.flags.lotm.grantedSequence = 1;
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
      if ( !inferSequence1(item) ) continue;
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
