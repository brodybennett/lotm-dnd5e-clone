import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { ClassicLevel } = require("../tmp/node-tools/node_modules/classic-level");

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ABILITIES_DB_PATH = path.join(ROOT, "packs", "lotm_abilities");
const REPORT_PATH = path.join(ROOT, "docs", "LoTM_Sequence9_Spirituality_Audit.md");

const NORMALIZED_ITEMS = Object.freeze({
  lotmAbilityB9001: Object.freeze({
    name: "Sunrise Chorus",
    replacements: Object.freeze([
      ["<li><strong>+2 Spirituality:</strong> Target up to 4 allies and grant temporary HP equal to your Potency.</li>",
        "<li><strong>+1 Spirituality:</strong> Target up to 4 allies and grant temporary HP equal to your Potency.</li>"],
      ["<li><strong>+4 Spirituality:</strong> Duration becomes 1 minute (concentration); affected allies gain advantage on fear saves while they can hear your song.</li>",
        "<li><strong>+2 Spirituality:</strong> Duration becomes 1 minute (concentration); affected allies gain advantage on fear saves while they can hear your song.</li>"],
      ["<li><strong>+6 Spirituality:</strong> Once during duration, each affected ally can add your Potency to one failed save against fear or charm, potentially turning it into a success.</li>",
        "<li><strong>+4 Spirituality:</strong> Once during duration, each affected ally can add your Potency to one failed save against fear or charm, potentially turning it into a success.</li>"]
    ])
  }),
  lotmAbilityB9002: Object.freeze({
    name: "Radiant Footwork",
    replacements: Object.freeze([
      ["<li><strong>+2 Spirituality:</strong> Movement bonus becomes +10 feet and the radiant damage rider becomes +Potency.</li>",
        "<li><strong>+1 Spirituality:</strong> Movement bonus becomes +10 feet and the radiant damage rider becomes +Potency.</li>"],
      ["<li><strong>+4 Spirituality:</strong> Choose one ally within 30 feet when you activate; that ally gains half your movement bonus for the duration.</li>",
        "<li><strong>+2 Spirituality:</strong> Choose one ally within 30 feet when you activate; that ally gains half your movement bonus for the duration.</li>"],
      ["<li><strong>+6 Spirituality:</strong> You emit bright light in 10 feet (dim 10 feet beyond). While lit, difficult terrain caused by darkness or fear effects does not reduce your movement.</li>",
        "<li><strong>+4 Spirituality:</strong> You emit bright light in 10 feet (dim 10 feet beyond). While lit, difficult terrain caused by darkness or fear effects does not reduce your movement.</li>"]
    ])
  })
});

const METADATA_FIX_IDS = new Set([
  "lotmAbilityS9001",
  "lotmAbilityS9002",
  "lotmAbilityV9001",
  "lotmAbilityV9002"
]);

const COMPRESSED_UTILITY_PATHWAYS = new Set([
  "lotm-apprentice",
  "lotm-spectator"
]);

function decodeHtml(html) {
  return String(html ?? "")
    .replace(/&nbsp;/g, " ")
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, "\"")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function pathwayName(identifier) {
  return String(identifier ?? "")
    .replace(/^lotm-/, "")
    .split("-")
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function extractUpcastTiers(html) {
  const segment = html.match(/<p><strong>Higher Spend \(upcast\):<\/strong><\/p><ul>([\s\S]*?)<\/ul>/i)?.[1] ?? "";
  return [...segment.matchAll(/\+(\d+) Spirituality/gi)].map(match => Number(match[1]));
}

function inferSequence9(item) {
  if ( item?.flags?.lotm?.grantedSequence === 9 ) return true;
  return Number(item?.system?.level) === 0;
}

function applyDescriptionReplacements(item, record) {
  let description = String(item.system?.description?.value ?? "");
  let changed = false;
  for ( const [from, to] of record.replacements ) {
    if ( description.includes(from) ) {
      description = description.replace(from, to);
      changed = true;
      continue;
    }
    if ( description.includes(to) ) continue;
    if ( !description.includes(from) ) {
      throw new Error(`Expected text not found while normalizing ${record.name}`);
    }
  }
  if ( changed ) item.system.description.value = description;
  return changed;
}

function classifyLadder(item) {
  const tiers = extractUpcastTiers(decodeHtml(item.system?.description?.value));
  const serialized = tiers.join("/");
  if ( serialized === "1/2/4" ) return "standard";
  if ( serialized === "1/2/3" ) return "compressed";
  return serialized || "unparsed";
}

function buildReport(items, mutations) {
  const pathwayRows = items.map(item => {
    const identifier = item.system?.sourceClass;
    const html = decodeHtml(item.system?.description?.value);
    const baseline = html.match(/Baseline \((\d+) Spirituality\)/i)?.[1] ?? "?";
    const tiers = extractUpcastTiers(html).join(" / ");
    const ladderType = classifyLadder(item);
    const note = identifier === "lotm-bard"
      ? "Normalized to standard ladder."
      : COMPRESSED_UTILITY_PATHWAYS.has(identifier)
        ? "Compressed utility ladder retained."
        : METADATA_FIX_IDS.has(item._id)
          ? "Sequence tag repaired."
          : "";
    return `| ${pathwayName(identifier)} | ${item.name} | ${baseline} | ${tiers} | ${ladderType} | ${note} |`;
  }).join("\n");

  const summary = [
    "# LoTM Sequence 9 Spirituality Audit",
    "",
    "This report audits live Sequence 9 pathway abilities in `packs/lotm_abilities` and normalizes only spirituality pricing or supporting sequence metadata.",
    "",
    "## Sequence 9 Cost Logic",
    "",
    "- Base cast at Sequence 9 should remain `0 Spirituality`; it is the entry-sequence baseline and the live system already derives that from item level `0`.",
    "- Standard Sequence 9 upcast ladder is `+1 / +2 / +4`.",
    "- `+1` is for scope/range expansion or a light reliability/numerical bump.",
    "- `+2` is for a second meaningful rider, ally-sharing, moderate action pressure, or a stronger tactical swing.",
    "- `+4` is for sustained control, multi-target swing, repeatable scene leverage, or a clearly encounter-shaping upgrade.",
    "- A compressed `+1 / +2 / +3` ladder is acceptable only for narrow non-damaging utility or information abilities whose top spend still does not create a full encounter swing.",
    "",
    "## Findings",
    "",
    "- `18` pathways were already on the standard `+1 / +2 / +4` ladder.",
    "- `2` pathways, Apprentice and Spectator, were on a justified compressed utility ladder; these were retained.",
    "- `1` pathway, Bard, was materially overpriced at `+2 / +4 / +6` despite effects comparable to other Sequence 9 support and tempo abilities. Both Bard abilities were normalized to `+1 / +2 / +4`.",
    "- `2` pathways, Seer and Spectator, had live Sequence 9 abilities missing `flags.lotm.grantedSequence = 9`. Those tags were repaired so later sequence-grouped audits can include them cleanly.",
    "",
    "## Live Sequence 9 Table",
    "",
    "| Pathway | Ability | Base | Upcast Ladder | Ladder Type | Notes |",
    "|---|---|---:|---|---|---|",
    pathwayRows,
    "",
    "## Applied Changes",
    "",
    ...mutations.map(message => `- ${message}`),
    "",
    "## Normalization Notes",
    "",
    "- Bard now pays standard Sequence 9 prices for early-party support instead of Sequence 7-6 style surcharges.",
    "- Apprentice retains cheaper top-end spends because both abilities stay narrow, positional, and non-damaging even at maximum upcast.",
    "- Spectator retains cheaper top-end spends because its Sequence 9 reads remain bounded by uncertainty, target readability, and low direct combat swing.",
    ""
  ];

  return summary.join("\n");
}

async function main() {
  const db = new ClassicLevel(ABILITIES_DB_PATH, { valueEncoding: "utf8" });
  await db.open();

  const items = [];
  const mutations = [];
  try {
    for await ( const [key, value] of db.iterator() ) {
      if ( !key.startsWith("!items!") ) continue;
      const item = JSON.parse(value);
      if ( item.type !== "spell" ) continue;
      if ( !item.system?.sourceClass ) continue;
      if ( !inferSequence9(item) ) continue;

      let changed = false;
      const normalization = NORMALIZED_ITEMS[item._id];
      if ( normalization ) {
        changed = applyDescriptionReplacements(item, normalization) || changed;
        if ( changed ) mutations.push(`Normalized ${normalization.name} from \`+2 / +4 / +6\` to \`+1 / +2 / +4\`.`);
      }

      if ( METADATA_FIX_IDS.has(item._id) && (item.flags?.lotm?.grantedSequence !== 9) ) {
        item.flags ??= {};
        item.flags.lotm ??= {};
        item.flags.lotm.grantedSequence = 9;
        changed = true;
        mutations.push(`Set \`${item.name}\` sequence metadata to \`flags.lotm.grantedSequence = 9\`.`);
      }

      if ( changed ) await db.put(key, JSON.stringify(item));
      items.push(item);
    }
  } finally {
    await db.close();
  }

  items.sort((a, b) => {
    return String(a.system?.sourceClass).localeCompare(String(b.system?.sourceClass))
      || String(a.name).localeCompare(String(b.name));
  });

  const report = buildReport(items, mutations);
  fs.writeFileSync(REPORT_PATH, report, "utf8");
  console.log(`Wrote ${REPORT_PATH}`);
  for ( const message of mutations ) console.log(message);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
