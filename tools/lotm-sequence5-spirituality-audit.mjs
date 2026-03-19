import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { ClassicLevel } = require("../tmp/node-tools/node_modules/classic-level");

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ABILITIES_DB_PATH = path.join(ROOT, "packs", "lotm_abilities");
const REPORT_PATH = path.join(ROOT, "docs", "LoTM_Sequence5_Spirituality_Audit.md");

const NORMALIZATIONS = Object.freeze({
  lotmAbilityB5001: Object.freeze({
    name: "Light of Holiness",
    replacements: Object.freeze([
      ["<p><strong>Baseline (6 Spirituality):</strong>", "<p><strong>Baseline (4 Spirituality):</strong>"],
      ["<li><strong>+3 Spirituality:</strong> Radius becomes 20 feet and the afterglow lasts 2 rounds.</li>",
        "<li><strong>+1 Spirituality:</strong> Radius becomes 20 feet and the afterglow lasts 2 rounds.</li>"],
      ["<li><strong>+6 Spirituality:</strong> Targets that fail are also blinded until the start of your next turn.</li>",
        "<li><strong>+2 Spirituality:</strong> Targets that fail are also blinded until the start of your next turn.</li>"],
      ["<li><strong>+9 Spirituality:</strong> A second weaker pillar strikes another point within 60 feet of the first.</li>",
        "<li><strong>+4 Spirituality:</strong> A second weaker pillar strikes another point within 60 feet of the first.</li>"]
    ])
  }),
  lotmAbilityB5002: Object.freeze({
    name: "Purification Halo",
    replacements: Object.freeze([
      ["<p><strong>Baseline (5 Spirituality):</strong>", "<p><strong>Baseline (4 Spirituality):</strong>"],
      ["<li><strong>+3 Spirituality:</strong> Radius increases to 40 feet.</li>",
        "<li><strong>+1 Spirituality:</strong> Radius increases to 40 feet.</li>"],
      ["<li><strong>+6 Spirituality:</strong> Allies in aura gain resistance to necrotic and cold damage.</li>",
        "<li><strong>+2 Spirituality:</strong> Allies in aura gain resistance to necrotic and cold damage.</li>"],
      ["<li><strong>+9 Spirituality:</strong> Once during duration, instantly expel one equal-or-lower-sequence parasitization or curse tether on an ally.</li>",
        "<li><strong>+4 Spirituality:</strong> Once during duration, instantly expel one equal-or-lower-sequence parasitization or curse tether on an ally.</li>"]
    ])
  }),
  lotmAbilityB5003: Object.freeze({
    name: "Sanctified Verdict",
    replacements: Object.freeze([
      ["<li><strong>+2 Spirituality:</strong> Attempt this against up to 2 linked hostile effects from the same source.</li>",
        "<li><strong>+1 Spirituality:</strong> Attempt this against up to 2 linked hostile effects from the same source.</li>"],
      ["<li><strong>+4 Spirituality:</strong> On success, the source suffers backlash radiant damage equal to your Potency.</li>",
        "<li><strong>+2 Spirituality:</strong> On success, the source suffers backlash radiant damage equal to your Potency.</li>"],
      ["<li><strong>+6 Spirituality:</strong> For 1 round, the source cannot reuse the same hostile effect tag.</li>",
        "<li><strong>+4 Spirituality:</strong> For 1 round, the source cannot reuse the same hostile effect tag.</li>"]
    ])
  }),
  lotmAbilityC5001: Object.freeze({
    name: "Door to the Underworld",
    replacements: Object.freeze([
      ["<p><strong>Baseline (0 Spirituality):</strong>", "<p><strong>Baseline (4 Spirituality):</strong>"],
      ["<li><strong>+2 Spirituality:</strong> Door radius increases to 15 feet, pull increases to 25 feet, and you may affect up to two targets.</li>",
        "<li><strong>+1 Spirituality:</strong> Door radius increases to 15 feet, pull increases to 25 feet, and you may affect up to two targets.</li>"],
      ["<li><strong>+4 Spirituality:</strong> Door persists for 1 minute (concentration). Once per round, choose one target in the aura to repeat the pull/save sequence.</li>",
        "<li><strong>+2 Spirituality:</strong> Door persists for 1 minute (concentration). Once per round, choose one target in the aura to repeat the pull/save sequence.</li>"],
      ["<li><strong>+6 Spirituality:</strong> On a failed save by 5 or more, the primary target is dragged behind the threshold until the start of your next turn (banished to a hostile underworld edge-state and returns prone in nearest unoccupied space).</li>",
        "<li><strong>+4 Spirituality:</strong> On a failed save by 5 or more, the primary target is dragged behind the threshold until the start of your next turn (banished to a hostile underworld edge-state and returns prone in nearest unoccupied space).</li>"]
    ])
  }),
  lotmAbilityC5002: Object.freeze({
    name: "Internal Underworld",
    replacements: Object.freeze([
      ["<p><strong>Baseline (0 Spirituality):</strong>", "<p><strong>Baseline (4 Spirituality):</strong>"],
      ["<li><strong>+2 Spirituality:</strong> Increase housed roster capacity to 5 for this cast and command two spirits per round.</li>",
        "<li><strong>+1 Spirituality:</strong> Increase housed roster capacity to 5 for this cast and command two spirits per round.</li>"],
      ["<li><strong>+4 Spirituality:</strong> Duration becomes 1 hour. Once during duration, deploy a housed spirit as a temporary helper with HP equal to your Potency for 3 rounds.</li>",
        "<li><strong>+2 Spirituality:</strong> Duration becomes 1 hour. Once during duration, deploy a housed spirit as a temporary helper with HP equal to your Potency for 3 rounds.</li>"],
      ["<li><strong>+6 Spirituality:</strong> For 1 minute, all commands from this ability gain enhanced precision: scouting ignores mundane darkness, harry applies to saving throws, and shield can protect up to two allies within 30 feet.</li>",
        "<li><strong>+4 Spirituality:</strong> For 1 minute, all commands from this ability gain enhanced precision: scouting ignores mundane darkness, harry applies to saving throws, and shield can protect up to two allies within 30 feet.</li>"]
    ])
  }),
  lotmAbilityC5003: Object.freeze({
    name: "Death Envoy",
    replacements: Object.freeze([
      ["<p><strong>Baseline (0 Spirituality):</strong>", "<p><strong>Baseline (4 Spirituality):</strong>"],
      ["<li><strong>+2 Spirituality:</strong> Affect up to two creatures in a 10-foot radius around the envoy.</li>",
        "<li><strong>+1 Spirituality:</strong> Affect up to two creatures in a 10-foot radius around the envoy.</li>"],
      ["<li><strong>+4 Spirituality:</strong> Duration becomes 1 minute (concentration). Once per round, you may force one target in range to repeat the save against numbness.</li>",
        "<li><strong>+2 Spirituality:</strong> Duration becomes 1 minute (concentration). Once per round, you may force one target in range to repeat the save against numbness.</li>"],
      ["<li><strong>+6 Spirituality:</strong> On a failed save by 5 or more, the target additionally takes necrotic damage equal to your Potency at the start of its next turn (once per cast per target).</li>",
        "<li><strong>+4 Spirituality:</strong> On a failed save by 5 or more, the target additionally takes necrotic damage equal to your Potency at the start of its next turn (once per cast per target).</li>"]
    ])
  })
});

const REPAIRED_SEQUENCE_TAG_IDS = new Set([
  "lotmAbilityS5001",
  "lotmAbilityS5002",
  "lotmAbilityS5003",
  "lotmAbilityV5001",
  "lotmAbilityV5002",
  "lotmAbilityV5003"
]);

const COMPRESSED_UTILITY_ABILITY_IDS = new Set([
  "lotmAbilityV5002"
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

function inferSequence5(item) {
  if ( item?.flags?.lotm?.grantedSequence === 5 ) return true;
  return Number(item?.system?.level) === 4;
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
    let note = "";
    if ( String(identifier) === "lotm-bard" ) note = "Normalized to shared Sequence 5 ladder.";
    else if ( String(identifier) === "lotm-corpse-collector" ) note = "Normalized to shared Sequence 5 ladder.";
    else if ( COMPRESSED_UTILITY_ABILITY_IDS.has(item._id) ) note = "Compressed utility ladder retained.";
    else if ( REPAIRED_SEQUENCE_TAG_IDS.has(item._id) ) note = "Sequence tag repaired.";
    return `| ${pathwayName(identifier)} | ${item.name} | ${baseline} | ${tiers} | ${ladderType} | ${note} |`;
  }).join("\n");

  return [
    "# LoTM Sequence 5 Spirituality Audit",
    "",
    "This report audits live Sequence 5 pathway abilities in `packs/lotm_abilities` and normalizes spirituality pricing text plus any missing sequence metadata.",
    "",
    "## Sequence 5 Cost Logic",
    "",
    "- Base cast at Sequence 5 should be `4 Spirituality`; live level-4 abilities already derive that cost automatically from item level.",
    "- Standard Sequence 5 upcast ladder is `+1 / +2 / +4` above the base cost.",
    "- `+1` is for the first meaningful expansion in scope, target count, rider strength, or duration.",
    "- `+2` is for major sustained value, stronger control, or a second large tactical rider.",
    "- `+4` is for clear encounter-shaping improvement, layered authority, or a qualitatively stronger end-state.",
    "- A compressed `+1 / +2 / +3` ladder remains acceptable only for bounded support or information abilities whose top-end output still sits below full encounter-swing tools.",
    "",
    "## Findings",
    "",
    "- Sequence 5 again showed broad authored-text drift below the live system cost; many abilities were still labelled `0`, `1`, `2`, or `3` despite actual level-based cost `4`.",
    "- Bard remained materially overpriced across its Sequence 5 package and was normalized back to the shared Sequence 5 pricing spine.",
    "- Corpse Collector's Sequence 5 package was also over-surcharged at `+2 / +4 / +6` relative to comparable authority-grade Sequence 5 tools and was normalized to the standard ladder.",
    "- Spectator keeps compressed pricing only on `Guidance`, which remains bounded support rather than a full authority or battlefield swing.",
    "- Seer and Spectator Sequence 5 abilities were missing `flags.lotm.grantedSequence = 5`; those tags were repaired for future grouped audits.",
    "",
    "## Live Sequence 5 Table",
    "",
    "| Pathway | Ability | Base | Upcast Ladder | Ladder Type | Notes |",
    "|---|---|---:|---|---|---|",
    rows,
    "",
    "## Normalization Summary",
    "",
    "- All live Sequence 5 abilities now present a `Baseline (4 Spirituality)` text line that matches the actual level-based system cost.",
    "- Bard and Corpse Collector now use the shared Sequence 5 pricing spine instead of bespoke premium surcharges.",
    "- Spectator keeps compressed pricing only on bounded `Guidance`; `Alteration` and `Dream Traversal` remain on the standard ladder.",
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
      if ( !inferSequence5(item) ) continue;

      let changed = false;
      let description = String(item.system?.description?.value ?? "");

      const rules = NORMALIZATIONS[item._id];
      if ( rules ) {
        const result = applyReplacements(description, rules.replacements, rules.name);
        description = result.description;
        changed = result.changed || changed;
      } else if ( description.includes("<p><strong>Baseline (0 Spirituality):</strong>") ) {
        description = description.replace(
          "<p><strong>Baseline (0 Spirituality):</strong>",
          "<p><strong>Baseline (4 Spirituality):</strong>"
        );
        changed = true;
      } else if ( description.includes("<p><strong>Baseline (1 Spirituality):</strong>") ) {
        description = description.replace(
          "<p><strong>Baseline (1 Spirituality):</strong>",
          "<p><strong>Baseline (4 Spirituality):</strong>"
        );
        changed = true;
      } else if ( description.includes("<p><strong>Baseline (2 Spirituality):</strong>") ) {
        description = description.replace(
          "<p><strong>Baseline (2 Spirituality):</strong>",
          "<p><strong>Baseline (4 Spirituality):</strong>"
        );
        changed = true;
      } else if ( description.includes("<p><strong>Baseline (3 Spirituality):</strong>") ) {
        description = description.replace(
          "<p><strong>Baseline (3 Spirituality):</strong>",
          "<p><strong>Baseline (4 Spirituality):</strong>"
        );
        changed = true;
      } else if ( !description.includes("<p><strong>Baseline (4 Spirituality):</strong>") ) {
        throw new Error(`Unexpected Sequence 5 baseline text on ${item.name}`);
      }

      if ( changed ) item.system.description.value = description;

      if ( REPAIRED_SEQUENCE_TAG_IDS.has(item._id) && (item.flags?.lotm?.grantedSequence !== 5) ) {
        item.flags ??= {};
        item.flags.lotm ??= {};
        item.flags.lotm.grantedSequence = 5;
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
      if ( !inferSequence5(item) ) continue;
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
