import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  getLotmPathwayAbilityCap,
  LOTM_PATHWAY_SCALING_PROFILES,
  getLotmPathwayAttributeBonuses,
  getLotmPathwayCumulativeAttributePoints,
  getLotmPathwayResourceShift,
  getLotmPathwayScalingProfile,
  lotmPathwayTierFromSequence
} from "../pathway-scaling.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const REPORT_PATH = path.join(ROOT, "docs", "LoTM_Pathway_Sequence_Test_Report.md");
const SEQUENCES = [9, 8, 7, 6, 5, 4, 3, 2, 1, 0];
const ABILITIES = ["str", "dex", "con", "int", "wis", "cha"];
const BASELINE_ABILITY = 10;
const SEQUENCE_BUDGETS = Object.freeze({
  9: 2,
  8: 5,
  7: 18,
  6: 27,
  5: 40,
  4: 73,
  3: 93,
  2: 143,
  1: 217,
  0: 331
});

function pathwayNameFromIdentifier(identifier) {
  return identifier.replace(/^lotm-/, "").split("-")
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function abilityCode(ability) {
  return ability === "wis" ? "SPI" : ability.toUpperCase();
}

function baseHp(sequence) {
  return Math.round(10 + (1.2 * SEQUENCE_BUDGETS[sequence]));
}

function baseSpirituality(sequence) {
  return Math.round(6 + SEQUENCE_BUDGETS[sequence]);
}

function computeRow(identifier, sequence) {
  const profile = getLotmPathwayScalingProfile(identifier);
  const shift = getLotmPathwayResourceShift(profile, sequence);
  const hpBase = baseHp(sequence);
  const spBase = baseSpirituality(sequence);
  const hp = Math.max(Math.round(hpBase * (1 + shift)), 0);
  const spiritualityBase = Math.max(Math.round(spBase * (1 - shift)), 0);
  const bonuses = getLotmPathwayAttributeBonuses(sequence, profile);
  const points = Object.values(bonuses).reduce((total, value) => total + value, 0);
  const resourceBalance = (hp / hpBase) + (spiritualityBase / spBase);
  const attributes = Object.fromEntries(ABILITIES.map(ability => [ability, BASELINE_ABILITY + (bonuses[ability] || 0)]));
  const spiritAbility = profile.spiritAbility;
  const spiritScale = 2 + lotmPathwayTierFromSequence(sequence);
  const spiritModifier = Math.floor(((attributes[spiritAbility] || BASELINE_ABILITY) - 10) / 2);
  const spiritualityMax = Math.max(spiritualityBase + (spiritModifier * spiritScale), 0);
  return {
    identifier,
    name: pathwayNameFromIdentifier(identifier),
    profile,
    sequence,
    shift,
    hp,
    spiritualityBase,
    spiritualityMax,
    spiritAbility,
    spiritScale,
    spiritModifier,
    bonuses,
    points,
    attributes,
    resourceBalance
  };
}

function assert(condition, message) {
  if ( !condition ) throw new Error(message);
}

function runTests(rows) {
  const bySequence = new Map(SEQUENCES.map(sequence => [sequence, rows.filter(row => row.sequence === sequence)]));
  const messages = [];

  for ( const sequence of SEQUENCES ) {
    const sequenceRows = bySequence.get(sequence);
    const expectedPoints = getLotmPathwayCumulativeAttributePoints(sequence);
    const pointSet = new Set(sequenceRows.map(row => row.points));
    assert(pointSet.size === 1 && pointSet.has(expectedPoints),
      `Sequence ${sequence} attribute point budgets diverged: ${[...pointSet].join(", ")}`);

    const maxDrift = Math.max(...sequenceRows.map(row => Math.abs(row.resourceBalance - 2)));
    const driftTolerance = sequence >= 8 ? 0.10 : 0.06;
    assert(maxDrift <= driftTolerance,
      `Sequence ${sequence} resource balance drift exceeded tolerance ${driftTolerance.toFixed(2)}: ${maxDrift.toFixed(4)}`);

    for ( const row of sequenceRows ) {
      const profile = row.profile;
      for ( const ability of ABILITIES ) {
        const cap = getLotmPathwayAbilityCap(sequence, profile, ability);
        assert(row.attributes[ability] <= cap,
          `${row.name} exceeded its lane cap at Sequence ${sequence}: ${ability} ${row.attributes[ability]} > ${cap}`);
      }
    }

    messages.push(`Sequence ${sequence}: points=${expectedPoints}, max resource drift=${maxDrift.toFixed(4)}`);
  }

  return messages;
}

function buildReport(rows, testMessages) {
  const bySequence = new Map(SEQUENCES.map(sequence => [sequence, rows.filter(row => row.sequence === sequence)]));
  const profileTable = Object.keys(LOTM_PATHWAY_SCALING_PROFILES).sort().map(identifier => {
    const profile = getLotmPathwayScalingProfile(identifier);
    return `| ${pathwayNameFromIdentifier(identifier)} | ${abilityCode(profile.spiritAbility)} | ${abilityCode(profile.lanes.primary)} / ${abilityCode(profile.lanes.anchor)} / ${abilityCode(profile.lanes.tertiary)} / ${abilityCode(profile.lanes.quirk)} | ${profile.cadence} | ${profile.resourceProfile.join(", ")} |`;
  }).join("\n");

  const sequenceTable = SEQUENCES.map(sequence => {
    const sequenceRows = bySequence.get(sequence);
    const hpValues = sequenceRows.map(row => row.hp);
    const spBaseValues = sequenceRows.map(row => row.spiritualityBase);
    const spMaxValues = sequenceRows.map(row => row.spiritualityMax);
    const mostDurable = [...sequenceRows].sort((a, b) => b.hp - a.hp)[0];
    const deepestReserve = [...sequenceRows].sort((a, b) => b.spiritualityMax - a.spiritualityMax)[0];
    const balanceDrift = Math.max(...sequenceRows.map(row => Math.abs(row.resourceBalance - 2)));
    return `| ${sequence} | ${baseHp(sequence)} | ${baseSpirituality(sequence)} | ${getLotmPathwayCumulativeAttributePoints(sequence)} | ${Math.min(...hpValues)}-${Math.max(...hpValues)} | ${Math.min(...spBaseValues)}-${Math.max(...spBaseValues)} | ${Math.min(...spMaxValues)}-${Math.max(...spMaxValues)} | ${mostDurable.name} | ${deepestReserve.name} | ${balanceDrift.toFixed(4)} |`;
  }).join("\n");

  const spotlightSequences = [7, 5, 2, 0];
  const spotlightNames = ["lotm-warrior", "lotm-spectator", "lotm-sailor", "lotm-apothecary"];
  const spotlightTable = spotlightSequences.flatMap(sequence => {
    return spotlightNames.map(identifier => {
      const row = rows.find(entry => (entry.sequence === sequence) && (entry.identifier === identifier));
      const abilitySpread = ABILITIES.map(ability => `${abilityCode(ability)} ${row.attributes[ability]}`).join(", ");
      return `| ${sequence} | ${row.name} | ${row.hp} | ${row.spiritualityBase} | ${row.spiritualityMax} | ${abilitySpread} |`;
    });
  }).join("\n");

  return [
    "# LoTM Pathway Sequence Test Report",
    "",
    "This report was generated by `tools/lotm-sequence-tests.mjs` against the implemented pathway scaling framework.",
    "",
    "## Validation Summary",
    "",
    ...testMessages.map(message => `- ${message}`),
    "",
    "All pathway profiles passed the shared sequence checks below:",
    "",
    "- every pathway receives the same cumulative pathway-attribute point budget at a given sequence",
    "- HP/SPI resource shifts remain zero-sum within a tight rounding tolerance",
    "- canonical pathway-only attributes (baseline 10 + pathway growth) stay within lane caps at every sequence",
    "- runtime spirituality max remains readable from the same pathway profiles by applying each pathway's spirit anchor and tier scale",
    "",
    "## Pathway Profiles",
    "",
    "| Pathway | Spirit Anchor | Lanes | Cadence | Resource Profile (Low, Developed, Saint, Angel, God) |",
    "|---|---|---|---|---|",
    profileTable,
    "",
    "## Sequence Economy Ranges",
    "",
    "SPI Base Range reflects the zero-sum resource shift only. Runtime SPI Max Range applies the live formula `spiritualityBase + spiritAbility.mod * (2 + tier)`.",
    "",
    "| Sequence | Base HP | Base SPI | Pathway Attribute Points | HP Range | SPI Base Range | Runtime SPI Max Range | Highest HP | Highest SPI Max | Max Resource Drift |",
    "|---|---:|---:|---:|---:|---:|---:|---|---|---:|",
    sequenceTable,
    "",
    "## Representative Chassis Snapshots",
    "",
    "Attributes shown below are the canonical pathway-only totals using a flat baseline of 10 in every ability, so the table isolates pathway growth rather than character build choices.",
    "",
    "| Sequence | Pathway | HP | SPI Base | SPI Max | Attributes |",
    "|---|---|---:|---:|---:|---|",
    spotlightTable,
    ""
  ].join("\n");
}

const rows = SEQUENCES.flatMap(sequence => {
  return Object.keys(LOTM_PATHWAY_SCALING_PROFILES).sort().map(identifier => computeRow(identifier, sequence));
});

const testMessages = runTests(rows);
const report = buildReport(rows, testMessages);
fs.writeFileSync(REPORT_PATH, report, "utf8");
console.log(`Wrote ${REPORT_PATH}`);
console.log(testMessages.join("\n"));
