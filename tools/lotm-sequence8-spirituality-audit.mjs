import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { ClassicLevel } = require("../tmp/node-tools/node_modules/classic-level");

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ABILITIES_DB_PATH = path.join(ROOT, "packs", "lotm_abilities");
const REPORT_PATH = path.join(ROOT, "docs", "LoTM_Sequence8_Spirituality_Audit.md");

const BARD_NORMALIZATIONS = Object.freeze({
  lotmAbilityB8001: Object.freeze({
    name: "Noonday Shine",
    replacements: Object.freeze([
      ["<p><strong>Baseline (3 Spirituality):</strong>",
        "<p><strong>Baseline (1 Spirituality):</strong>"],
      ["<li><strong>+3 Spirituality:</strong> Radius becomes 30 feet and radiant damage against undead/evil spirits increases by +Potency.</li>",
        "<li><strong>+1 Spirituality:</strong> Radius becomes 30 feet and radiant damage against undead/evil spirits increases by +Potency.</li>"],
      ["<li><strong>+6 Spirituality:</strong> Choose up to 3 allies in the area; they gain Night Vision (60 feet) and ignore nonmagical darkness penalties for the duration.</li>",
        "<li><strong>+2 Spirituality:</strong> Choose up to 3 allies in the area; they gain Night Vision (60 feet) and ignore nonmagical darkness penalties for the duration.</li>"],
      ["<li><strong>+9 Spirituality:</strong> Once during duration, trigger a solar flare. Chosen hostiles in the area must make a Constitution save or be blinded until end of their next turn; undead and evil spirits make this save with disadvantage.</li>",
        "<li><strong>+4 Spirituality:</strong> Once during duration, trigger a solar flare. Chosen hostiles in the area must make a Constitution save or be blinded until end of their next turn; undead and evil spirits make this save with disadvantage.</li>"]
    ])
  }),
  lotmAbilityB8002: Object.freeze({
    name: "Sunlit Benediction",
    replacements: Object.freeze([
      ["<p><strong>Baseline (2 Spirituality):</strong>",
        "<p><strong>Baseline (1 Spirituality):</strong>"],
      ["<li><strong>+2 Spirituality:</strong> Target count increases to 5 allies.</li>",
        "<li><strong>+1 Spirituality:</strong> Target count increases to 5 allies.</li>"],
      ["<li><strong>+4 Spirituality:</strong> Duration becomes 10 minutes for anti-fear/cold/darkness/death protections (radiant damage rider remains 1 minute).</li>",
        "<li><strong>+2 Spirituality:</strong> Duration becomes 10 minutes for anti-fear/cold/darkness/death protections (radiant damage rider remains 1 minute).</li>"],
      ["<li><strong>+6 Spirituality:</strong> Once during duration, each affected ally can automatically pass one save against Fear or charm.</li>",
        "<li><strong>+4 Spirituality:</strong> Once during duration, each affected ally can automatically pass one save against Fear or charm.</li>"]
    ])
  })
});

const REPAIRED_SEQUENCE_TAG_IDS = new Set([
  "lotmAbilityS8001",
  "lotmAbilityS8002",
  "lotmAbilityV8001",
  "lotmAbilityV8002"
]);

const COMPRESSED_UTILITY_PATHWAYS = new Set([
  "lotm-apprentice",
  "lotm-spectator"
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

function inferSequence8(item) {
  if ( item?.flags?.lotm?.grantedSequence === 8 ) return true;
  return Number(item?.system?.level) === 1;
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
      ? "Normalized to shared Sequence 8 ladder."
      : COMPRESSED_UTILITY_PATHWAYS.has(identifier)
        ? "Compressed utility ladder retained."
        : REPAIRED_SEQUENCE_TAG_IDS.has(item._id)
          ? "Sequence tag repaired."
          : "";
    return `| ${pathwayName(identifier)} | ${item.name} | ${baseline} | ${tiers} | ${ladderType} | ${note} |`;
  }).join("\n");

  return [
    "# LoTM Sequence 8 Spirituality Audit",
    "",
    "This report audits live Sequence 8 pathway abilities in `packs/lotm_abilities` and normalizes spirituality pricing text plus any missing sequence metadata.",
    "",
    "## Sequence 8 Cost Logic",
    "",
    "- Base cast at Sequence 8 should be `1 Spirituality`; live level-1 abilities already derive that cost automatically from item level.",
    "- Standard Sequence 8 upcast ladder is `+1 / +2 / +4` above the base cost.",
    "- `+1` is for a first meaningful scope, target-count, or reliability increase.",
    "- `+2` is for a second tactical rider, stronger control, or longer sustained value.",
    "- `+4` is for encounter-shaping duration, broader team influence, or a major extra rider.",
    "- A compressed `+1 / +2 / +3` ladder is still acceptable for narrow utility or information abilities that do not produce full encounter swing even at peak spend.",
    "",
    "## Findings",
    "",
    "- Sequence 8 mechanics were mostly sound in the live system; the main inconsistency was authored text lagging behind actual level-based spirituality pricing.",
    "- Multiple Sequence 8 abilities still claimed `Baseline (0 Spirituality)` even though the live system charges `1` by default at level `1`.",
    "- Bard remained the clearest true pricing outlier: both Sequence 8 abilities were authored far above the shared band and were normalized back to the common Sequence 8 ladder.",
    "- Seer and Spectator again had missing `flags.lotm.grantedSequence = 8` metadata on their Sequence 8 abilities; those tags were repaired for future grouped audits.",
    "",
    "## Live Sequence 8 Table",
    "",
    "| Pathway | Ability | Base | Upcast Ladder | Ladder Type | Notes |",
    "|---|---|---:|---|---|---|",
    rows,
    "",
    "## Normalization Summary",
    "",
    "- All live Sequence 8 abilities now present a `Baseline (1 Spirituality)` text line that matches the actual level-based system cost.",
    "- Bard `Noonday Shine` and `Sunlit Benediction` now use the shared Sequence 8 pricing spine instead of inflated bespoke costs.",
    "- Apprentice and Spectator retain compressed top-end ladders because their Sequence 8 effects remain narrow utility, information, or positioning tools rather than broad encounter-swing packages.",
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
      if ( !inferSequence8(item) ) continue;

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
          "<p><strong>Baseline (1 Spirituality):</strong>"
        );
        changed = true;
      } else if ( !description.includes("<p><strong>Baseline (1 Spirituality):</strong>") ) {
        throw new Error(`Unexpected Sequence 8 baseline text on ${item.name}`);
      }

      if ( changed ) item.system.description.value = description;

      if ( REPAIRED_SEQUENCE_TAG_IDS.has(item._id) && (item.flags?.lotm?.grantedSequence !== 8) ) {
        item.flags ??= {};
        item.flags.lotm ??= {};
        item.flags.lotm.grantedSequence = 8;
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
      if ( !inferSequence8(item) ) continue;
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
