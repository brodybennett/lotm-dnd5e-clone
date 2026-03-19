import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { ClassicLevel } = require("../tmp/node-tools/node_modules/classic-level");

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ABILITIES_DB_PATH = path.join(ROOT, "packs", "lotm_abilities");
const REPORT_PATH = path.join(ROOT, "docs", "LoTM_Sequence6_Spirituality_Audit.md");

const BARD_NORMALIZATIONS = Object.freeze({
  lotmAbilityB6001: Object.freeze({
    name: "Authentication",
    replacements: Object.freeze([
      ["<li><strong>+2 Spirituality:</strong> Contract duration becomes 1 hour and includes up to 4 willing signatories.</li>",
        "<li><strong>+1 Spirituality:</strong> Contract duration becomes 1 hour and includes up to 4 willing signatories.</li>"],
      ["<li><strong>+4 Spirituality:</strong> Contract backlash also suppresses one active buff on the violator of equal or lower sequence.</li>",
        "<li><strong>+2 Spirituality:</strong> Contract backlash also suppresses one active buff on the violator of equal or lower sequence.</li>"],
      ["<li><strong>+6 Spirituality:</strong> You can notarize one hostile verbal command effect and force an immediate validity check; invalid command effects end.</li>",
        "<li><strong>+4 Spirituality:</strong> You can notarize one hostile verbal command effect and force an immediate validity check; invalid command effects end.</li>"]
    ])
  }),
  lotmAbilityB6002: Object.freeze({
    name: "Amplification",
    replacements: Object.freeze([
      ["<p><strong>Baseline (2 Spirituality):</strong>", "<p><strong>Baseline (3 Spirituality):</strong>"],
      ["<li><strong>+2 Spirituality:</strong> Affect up to 2 allied abilities triggered in the same round.</li>",
        "<li><strong>+1 Spirituality:</strong> Affect up to 2 allied abilities triggered in the same round.</li>"],
      ["<li><strong>+4 Spirituality:</strong> Enhanced value doubles against undead or evil spirits.</li>",
        "<li><strong>+2 Spirituality:</strong> Enhanced value doubles against undead or evil spirits.</li>"],
      ["<li><strong>+6 Spirituality:</strong> The amplified ability also gains one-step resistance to nullification from equal or lower sequence effects.</li>",
        "<li><strong>+4 Spirituality:</strong> The amplified ability also gains one-step resistance to nullification from equal or lower sequence effects.</li>"]
    ])
  }),
  lotmAbilityB6003: Object.freeze({
    name: "Nullification",
    replacements: Object.freeze([
      ["<p><strong>Baseline (4 Spirituality):</strong>", "<p><strong>Baseline (3 Spirituality):</strong>"],
      ["<li><strong>+2 Spirituality:</strong> Attempt nullification on up to 2 linked effects from the same source.</li>",
        "<li><strong>+1 Spirituality:</strong> Attempt nullification on up to 2 linked effects from the same source.</li>"],
      ["<li><strong>+4 Spirituality:</strong> On a successful nullification, the source takes backlash radiant damage equal to your Potency.</li>",
        "<li><strong>+2 Spirituality:</strong> On a successful nullification, the source takes backlash radiant damage equal to your Potency.</li>"],
      ["<li><strong>+6 Spirituality:</strong> For 1 round, the source cannot reapply an effect with the same identifier/tag.</li>",
        "<li><strong>+4 Spirituality:</strong> For 1 round, the source cannot reapply an effect with the same identifier/tag.</li>"]
    ])
  })
});

const REPAIRED_SEQUENCE_TAG_IDS = new Set([
  "lotmAbilityS6001",
  "lotmAbilityS6002",
  "lotmAbilityS6003",
  "lotmAbilityV6001",
  "lotmAbilityV6002",
  "lotmAbilityV6003"
]);

const COMPRESSED_UTILITY_ABILITY_IDS = new Set([
  "lotmAbilityV6002",
  "lotmAbilityV6003"
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

function inferSequence6(item) {
  if ( item?.flags?.lotm?.grantedSequence === 6 ) return true;
  return Number(item?.system?.level) === 3;
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
  return serialized || "unparsed";
}

function applyReplacements(description, replacements, label) {
  let next = description;
  let changed = false;
  for ( const [from, to] of replacements ) {
    if ( next.includes(from) ) {
      next = next.replace(from, to);
      changed = true;
      continue;
    }
    if ( next.includes(to) ) continue;
    throw new Error(`Expected text not found while normalizing ${label}`);
  }
  return { description: next, changed };
}

function buildReport(items) {
  const rows = items.map(item => {
    const identifier = item.system?.sourceClass;
    const html = decodeHtml(item.system?.description?.value);
    const baseline = html.match(/Baseline \((\d+) Spirituality\)/i)?.[1] ?? "?";
    const tiers = extractUpcastTiers(html).join(" / ");
    const ladderType = classifyLadder(item);
    const note = identifier === "lotm-bard"
      ? "Normalized to shared Sequence 6 ladder."
      : COMPRESSED_UTILITY_ABILITY_IDS.has(item._id)
        ? "Compressed utility ladder retained."
        : REPAIRED_SEQUENCE_TAG_IDS.has(item._id)
          ? "Sequence tag repaired."
          : "";
    return `| ${pathwayName(identifier)} | ${item.name} | ${baseline} | ${tiers} | ${ladderType} | ${note} |`;
  }).join("\n");

  return [
    "# LoTM Sequence 6 Spirituality Audit",
    "",
    "This report audits live Sequence 6 pathway abilities in `packs/lotm_abilities` and normalizes spirituality pricing text plus any missing sequence metadata.",
    "",
    "## Sequence 6 Cost Logic",
    "",
    "- Base cast at Sequence 6 should be `3 Spirituality`; live level-3 abilities already derive that cost automatically from item level.",
    "- Standard Sequence 6 upcast ladder is `+1 / +2 / +4` above the base cost.",
    "- `+1` is for the first meaningful scope, rider, reliability, or target expansion.",
    "- `+2` is for stronger sustained pressure, better control, or a second major tactical rider.",
    "- `+4` is for encounter-shaping extension, major denial, or clear advantage over peer Sequence 6 casts.",
    "- A compressed `+1 / +2 / +3` ladder remains acceptable only for bounded soft-control or defensive utility that still stops short of a full encounter swing.",
    "",
    "## Findings",
    "",
    "- Sequence 6 had a large authored-text drift problem: most abilities were still labelled `0`, `1`, or `2` despite the live level-3 system charging `3` spirituality.",
    "- Bard again sat clearly above the shared band. Its Sequence 6 kit now matches the common baseline and surcharge structure instead of using inflated bespoke pricing.",
    "- Spectator keeps compressed pricing only on `Hypnosis` and `Dragon Scales`, which stay narrower than full encounter-swing standard-ladder effects at this band. `Psychological Invisibility` remains on the standard ladder.",
    "- Seer and Spectator Sequence 6 abilities were missing `flags.lotm.grantedSequence = 6`; those tags were repaired for future grouped audits.",
    "",
    "## Live Sequence 6 Table",
    "",
    "| Pathway | Ability | Base | Upcast Ladder | Ladder Type | Notes |",
    "|---|---|---:|---|---|---|",
    rows,
    "",
    "## Normalization Summary",
    "",
    "- All live Sequence 6 abilities now present a `Baseline (3 Spirituality)` text line that matches the actual level-based system cost.",
    "- Bard `Authentication`, `Amplification`, and `Nullification` now use the shared Sequence 6 pricing spine.",
    "- Spectator keeps compressed pricing only on bounded `Hypnosis` and `Dragon Scales`; `Psychological Invisibility` stays on the standard ladder.",
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
      if ( !inferSequence6(item) ) continue;

      let changed = false;
      let description = String(item.system?.description?.value ?? "");

      const bardRules = BARD_NORMALIZATIONS[item._id];
      if ( bardRules ) {
        const result = applyReplacements(description, bardRules.replacements, bardRules.name);
        description = result.description;
        changed = result.changed || changed;
      } else if ( description.includes("<p><strong>Baseline (0 Spirituality):</strong>") ) {
        description = description.replace(
          "<p><strong>Baseline (0 Spirituality):</strong>",
          "<p><strong>Baseline (3 Spirituality):</strong>"
        );
        changed = true;
      } else if ( description.includes("<p><strong>Baseline (1 Spirituality):</strong>") ) {
        description = description.replace(
          "<p><strong>Baseline (1 Spirituality):</strong>",
          "<p><strong>Baseline (3 Spirituality):</strong>"
        );
        changed = true;
      } else if ( description.includes("<p><strong>Baseline (2 Spirituality):</strong>") ) {
        description = description.replace(
          "<p><strong>Baseline (2 Spirituality):</strong>",
          "<p><strong>Baseline (3 Spirituality):</strong>"
        );
        changed = true;
      } else if ( !description.includes("<p><strong>Baseline (3 Spirituality):</strong>") ) {
        throw new Error(`Unexpected Sequence 6 baseline text on ${item.name}`);
      }

      if ( changed ) item.system.description.value = description;

      if ( REPAIRED_SEQUENCE_TAG_IDS.has(item._id) && (item.flags?.lotm?.grantedSequence !== 6) ) {
        item.flags ??= {};
        item.flags.lotm ??= {};
        item.flags.lotm.grantedSequence = 6;
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
      if ( !inferSequence6(item) ) continue;
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
