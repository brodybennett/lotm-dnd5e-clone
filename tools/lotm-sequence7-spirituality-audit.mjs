import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { ClassicLevel } = require("../tmp/node-tools/node_modules/classic-level");

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ABILITIES_DB_PATH = path.join(ROOT, "packs", "lotm_abilities");
const REPORT_PATH = path.join(ROOT, "docs", "LoTM_Sequence7_Spirituality_Audit.md");

const BARD_NORMALIZATIONS = Object.freeze({
  lotmAbilityB7001: Object.freeze({
    name: "Sun Halo",
    replacements: Object.freeze([
      ["<p><strong>Baseline (4 Spirituality):</strong>", "<p><strong>Baseline (2 Spirituality):</strong>"],
      ["<li><strong>+3 Spirituality:</strong> Aura radius increases to 30 feet.</li>",
        "<li><strong>+1 Spirituality:</strong> Aura radius increases to 30 feet.</li>"],
      ["<li><strong>+6 Spirituality:</strong> Allies in aura gain resistance to cold damage.</li>",
        "<li><strong>+2 Spirituality:</strong> Allies in aura gain resistance to cold damage.</li>"],
      ["<li><strong>+9 Spirituality:</strong> Once during duration, purge one possession-like or parasitization-like ongoing effect on an ally of equal or lower sequence (GM adjudication).</li>",
        "<li><strong>+4 Spirituality:</strong> Once during duration, purge one possession-like or parasitization-like ongoing effect on an ally of equal or lower sequence (GM adjudication).</li>"]
    ])
  }),
  lotmAbilityB7002: Object.freeze({
    name: "Holy Light Summoning",
    replacements: Object.freeze([
      ["<p><strong>Baseline (5 Spirituality):</strong>", "<p><strong>Baseline (2 Spirituality):</strong>"],
      ["<li><strong>+3 Spirituality:</strong> Column radius becomes 15 feet.</li>",
        "<li><strong>+1 Spirituality:</strong> Column radius becomes 15 feet.</li>"],
      ["<li><strong>+6 Spirituality:</strong> Targets that fail are also blinded until the start of your next turn.</li>",
        "<li><strong>+2 Spirituality:</strong> Targets that fail are also blinded until the start of your next turn.</li>"],
      ["<li><strong>+9 Spirituality:</strong> Create a second, separate beam within range that resolves at half base damage.</li>",
        "<li><strong>+4 Spirituality:</strong> Create a second, separate beam within range that resolves at half base damage.</li>"]
    ])
  }),
  lotmAbilityB7003: Object.freeze({
    name: "Sun Holy Water",
    replacements: Object.freeze([
      ["<p><strong>Baseline (4 Spirituality):</strong>", "<p><strong>Baseline (2 Spirituality):</strong>"],
      ["<li><strong>+2 Spirituality:</strong> Consecrate +2 additional flasks.</li>",
        "<li><strong>+1 Spirituality:</strong> Consecrate +2 additional flasks.</li>"],
      ["<li><strong>+4 Spirituality:</strong> Each flask anti-undead damage increases by +Potency.</li>",
        "<li><strong>+2 Spirituality:</strong> Each flask anti-undead damage increases by +Potency.</li>"],
      ["<li><strong>+6 Spirituality:</strong> A flask can instead create a 10-foot cleansing splash zone that dispels one low-tier evil miasma/hazard effect (GM adjudication).</li>",
        "<li><strong>+4 Spirituality:</strong> A flask can instead create a 10-foot cleansing splash zone that dispels one low-tier evil miasma/hazard effect (GM adjudication).</li>"]
    ])
  })
});

const REPAIRED_SEQUENCE_TAG_IDS = new Set([
  "lotmAbilityS7001",
  "lotmAbilityS7002",
  "lotmAbilityS7003",
  "lotmAbilityV7001",
  "lotmAbilityV7002",
  "lotmAbilityV7003",
  "lotmAbilityV7004"
]);

const COMPRESSED_UTILITY_ABILITY_IDS = new Set([
  "lotmAbilityV7002",
  "lotmAbilityV7003",
  "lotmAbilityV7004"
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

function inferSequence7(item) {
  if ( item?.flags?.lotm?.grantedSequence === 7 ) return true;
  return Number(item?.system?.level) === 2;
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
      ? "Normalized to shared Sequence 7 ladder."
      : COMPRESSED_UTILITY_ABILITY_IDS.has(item._id)
        ? "Compressed utility ladder retained."
        : REPAIRED_SEQUENCE_TAG_IDS.has(item._id)
          ? "Sequence tag repaired."
          : "";
    return `| ${pathwayName(identifier)} | ${item.name} | ${baseline} | ${tiers} | ${ladderType} | ${note} |`;
  }).join("\n");

  return [
    "# LoTM Sequence 7 Spirituality Audit",
    "",
    "This report audits live Sequence 7 pathway abilities in `packs/lotm_abilities` and normalizes spirituality pricing text plus any missing sequence metadata.",
    "",
    "## Sequence 7 Cost Logic",
    "",
    "- Base cast at Sequence 7 should be `2 Spirituality`; live level-2 abilities already derive that cost automatically from item level.",
    "- Standard Sequence 7 upcast ladder is `+1 / +2 / +4` above the base cost.",
    "- `+1` is for the first meaningful expansion in reach, scope, damage, or rider strength.",
    "- `+2` is for stronger control, added ally carry, longer utility, or a second real tactical rider.",
    "- `+4` is for clear encounter-swing upgrades, broader target coverage, or a major extra effect.",
    "- A compressed `+1 / +2 / +3` ladder remains acceptable only for bounded utility, soft control, or information abilities whose top-end output still does not match a full combat swing.",
    "",
    "## Findings",
    "",
    "- The dominant Sequence 7 issue was authored baseline text drifting below the live level-based system cost; many entries still displayed `0` or `1` despite actual cost `2`.",
    "- Bard remained far above the shared band across all three Sequence 7 abilities and was normalized back to the common Sequence 7 spine.",
    "- Spectator had one combat-swing ability (`Frenzy`) that already fit the standard `+1 / +2 / +4` ladder, while its other three bounded utility/control abilities appropriately kept the compressed ladder.",
    "- Seer and Spectator Sequence 7 abilities were missing `flags.lotm.grantedSequence = 7`; those tags were repaired for future grouped audits.",
    "",
    "## Live Sequence 7 Table",
    "",
    "| Pathway | Ability | Base | Upcast Ladder | Ladder Type | Notes |",
    "|---|---|---:|---|---|---|",
    rows,
    "",
    "## Normalization Summary",
    "",
    "- All live Sequence 7 abilities now present a `Baseline (2 Spirituality)` text line that matches the actual level-based system cost.",
    "- Bard `Sun Halo`, `Holy Light Summoning`, and `Sun Holy Water` now use the shared Sequence 7 pricing spine.",
    "- Spectator keeps compressed pricing only on bounded non-burst tools (`Telepathy`, `Psychological Cue`, `Placate`); `Frenzy` remains on the standard ladder because it creates materially larger fight swing.",
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
      if ( !inferSequence7(item) ) continue;

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
          "<p><strong>Baseline (2 Spirituality):</strong>"
        );
        changed = true;
      } else if ( description.includes("<p><strong>Baseline (1 Spirituality):</strong>") ) {
        description = description.replace(
          "<p><strong>Baseline (1 Spirituality):</strong>",
          "<p><strong>Baseline (2 Spirituality):</strong>"
        );
        changed = true;
      } else if ( !description.includes("<p><strong>Baseline (2 Spirituality):</strong>") ) {
        throw new Error(`Unexpected Sequence 7 baseline text on ${item.name}`);
      }

      if ( changed ) item.system.description.value = description;

      if ( REPAIRED_SEQUENCE_TAG_IDS.has(item._id) && (item.flags?.lotm?.grantedSequence !== 7) ) {
        item.flags ??= {};
        item.flags.lotm ??= {};
        item.flags.lotm.grantedSequence = 7;
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
      if ( !inferSequence7(item) ) continue;
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
