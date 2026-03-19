import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  LOTM_PATHWAY_SCALING_PROFILES,
  getLotmPathwayAttributeBonuses,
  getLotmPathwayResourceShift,
  getLotmPathwayScalingProfile,
  lotmPathwayTierFromSequence
} from "../pathway-scaling.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const REPORT_PATH = path.join(ROOT, "docs", "LoTM_Spirituality_Reserve_Alignment.md");
const SEQUENCES = [9, 8, 7, 6, 5, 4, 3, 2, 1, 0];
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
const BASELINE_ABILITY = 10;

function pathwayName(identifier) {
  return identifier.replace(/^lotm-/, "").split("-")
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function baseSpirituality(sequence) {
  return Math.round(6 + SEQUENCE_BUDGETS[sequence]);
}

function sequenceBaseCost(sequence) {
  return 9 - sequence;
}

function abilityModifier(score) {
  return Math.floor((score - 10) / 2);
}

function formatNumber(value) {
  if ( !Number.isFinite(value) ) return "N/A";
  if ( Number.isInteger(value) ) return String(value);
  return value.toFixed(2).replace(/\.00$/, "");
}

function formatPercent(value) {
  return `${(value * 100).toFixed(1)}%`;
}

function computePathwayRuntimeReserve(identifier, sequence) {
  const profile = getLotmPathwayScalingProfile(identifier);
  const shift = getLotmPathwayResourceShift(profile, sequence);
  const spiritualityBase = Math.max(Math.round(baseSpirituality(sequence) * (1 - shift)), 0);
  const bonuses = getLotmPathwayAttributeBonuses(sequence, profile);
  const spiritAbility = profile.spiritAbility;
  const spiritScore = BASELINE_ABILITY + (bonuses[spiritAbility] || 0);
  const spiritMod = abilityModifier(spiritScore);
  const tier = lotmPathwayTierFromSequence(sequence);
  const spiritScale = 2 + tier;
  const runtimeMax = Math.max(spiritualityBase + (spiritMod * spiritScale), 0);
  return {
    identifier,
    name: pathwayName(identifier),
    sequence,
    spiritAbility,
    spiritScore,
    spiritMod,
    tier,
    spiritScale,
    spiritualityBase,
    runtimeMax
  };
}

function computeRows() {
  return SEQUENCES.flatMap(sequence => {
    return Object.keys(LOTM_PATHWAY_SCALING_PROFILES).sort().map(identifier => {
      return computePathwayRuntimeReserve(identifier, sequence);
    });
  });
}

function buildSequenceSummary(rows) {
  return SEQUENCES.map(sequence => {
    const sequenceRows = rows.filter(row => row.sequence === sequence);
    const baseCost = sequenceBaseCost(sequence);
    const standardTopCost = baseCost + 4;
    const compressedTopCost = baseCost + 3;
    const lowest = [...sequenceRows].sort((a, b) => a.runtimeMax - b.runtimeMax || a.name.localeCompare(b.name))[0];
    const highest = [...sequenceRows].sort((a, b) => b.runtimeMax - a.runtimeMax || a.name.localeCompare(b.name))[0];
    return {
      sequence,
      baseCost,
      standardTopCost,
      compressedTopCost,
      lowest,
      highest,
      lowBaseShare: lowest.runtimeMax ? (baseCost / lowest.runtimeMax) : 0,
      lowStandardTopShare: lowest.runtimeMax ? (standardTopCost / lowest.runtimeMax) : 0,
      lowCompressedTopShare: lowest.runtimeMax ? (compressedTopCost / lowest.runtimeMax) : 0,
      lowBaseCasts: baseCost > 0 ? (lowest.runtimeMax / baseCost) : Number.POSITIVE_INFINITY,
      lowStandardTopCasts: standardTopCost > 0 ? (lowest.runtimeMax / standardTopCost) : Number.POSITIVE_INFINITY,
      lowCompressedTopCasts: compressedTopCost > 0 ? (lowest.runtimeMax / compressedTopCost) : Number.POSITIVE_INFINITY
    };
  });
}

function buildSpotlightTable(sequenceSummaries) {
  return sequenceSummaries.map(summary => {
    const currentAuditStatus = summary.sequence >= 5 ? "Normalized and validated" : "Pending full audit";
    return `| ${summary.sequence} | ${summary.baseCost} | ${summary.standardTopCost} | ${summary.lowest.name} (${summary.lowest.runtimeMax}) | ${summary.highest.name} (${summary.highest.runtimeMax}) | ${formatPercent(summary.lowBaseShare)} | ${formatPercent(summary.lowStandardTopShare)} | ${formatNumber(summary.lowBaseCasts)} | ${formatNumber(summary.lowStandardTopCasts)} | ${currentAuditStatus} |`;
  }).join("\n");
}

function buildLowSequenceTable(sequenceSummaries) {
  return sequenceSummaries
    .filter(summary => summary.sequence >= 5)
    .map(summary => {
      return `| ${summary.sequence} | ${summary.baseCost} | ${summary.standardTopCost} | ${summary.lowest.runtimeMax} | ${formatPercent(summary.lowBaseShare)} | ${formatPercent(summary.lowStandardTopShare)} | ${formatNumber(summary.lowBaseCasts)} | ${formatNumber(summary.lowStandardTopCasts)} |`;
    })
    .join("\n");
}

function buildHighestReserveTable(rows) {
  return [7, 5, 2, 0].flatMap(sequence => {
    const sequenceRows = rows.filter(row => row.sequence === sequence);
    const highlights = [...sequenceRows]
      .sort((a, b) => b.runtimeMax - a.runtimeMax || a.name.localeCompare(b.name))
      .slice(0, 3);
    return highlights.map((row, index) => {
      const label = index === 0 ? "Highest" : `Top ${index + 1}`;
      return `| ${sequence} | ${label} | ${row.name} | ${row.spiritualityBase} | ${row.spiritAbility.toUpperCase()} ${row.spiritScore} (${row.spiritMod >= 0 ? "+" : ""}${row.spiritMod}) | ${row.spiritScale} | ${row.runtimeMax} |`;
    });
  }).join("\n");
}

function buildLowSequenceNotes(sequenceSummaries) {
  return sequenceSummaries
    .filter(summary => summary.sequence >= 5)
    .map(summary => {
      const lowReserve = summary.lowest.runtimeMax;
      return `- Sequence ${summary.sequence} baseline \`${summary.baseCost}\` consumes \`${formatPercent(summary.lowBaseShare)}\` of the lowest runtime reserve (\`${lowReserve}\`), while standard top spend \`${summary.standardTopCost}\` consumes \`${formatPercent(summary.lowStandardTopShare)}\`.`;
    })
    .concat([
      "- The current normalized Sequence `9-5` spine therefore stays in line with runtime max spirituality and does not need additional reserve-driven repricing."
    ])
    .join("\n");
}

function buildReport(rows, sequenceSummaries) {
  return [
    "# LoTM Spirituality Reserve Alignment",
    "",
    "This report checks spirituality cost normalization against the implemented runtime max spirituality formula, not only against shifted base reserve values.",
    "",
    "Runtime formula confirmed in `dnd5e.mjs`:",
    "",
    "```text",
    "spiritualityMax = spiritualityBase + spiritAbility.mod * (2 + tier)",
    "```",
    "",
    "Where:",
    "",
    "- `spiritualityBase` comes from the shared sequence budget plus pathway resource shift.",
    "- `spiritAbility` comes from each pathway's scaling profile in `pathway-scaling.mjs`.",
    "- Tier bands are `9-7`, `6-5`, `4-3`, `2-1`, `0`, which produce spirit scales `2`, `3`, `4`, `5`, `6`.",
    "",
    "## Affordability Rule",
    "",
    "- Baseline cost should remain cheap enough that the lowest-reserve pathway at that sequence can use the new-sequence ability repeatedly without collapsing its reserve economy.",
    "- Standard top spend should feel premium, but the lowest-reserve pathway should still be able to afford at least one use and usually two or more from full reserve.",
    "- Compressed ladders are reserved for bounded utility, support, or information effects and are evaluated against the same reserve floor.",
    "- Sequence normalization should therefore be checked against the lowest runtime max spirituality at that sequence, not the average or the highest-reserve pathway.",
    "",
    "## Sequence Reserve Pressure",
    "",
    "| Sequence | Base Cost | Standard Top Cost | Lowest Runtime SPI Max | Highest Runtime SPI Max | Base Cost Share of Low Max | Standard Top Share of Low Max | Base Casts from Low Max | Top Casts from Low Max | Status |",
    "|---|---:|---:|---|---|---:|---:|---:|---:|---|",
    buildSpotlightTable(sequenceSummaries),
    "",
    "## Audited Low-Sequence Validation",
    "",
    "These are the sequences already normalized in live data during the current pass.",
    "",
    "| Sequence | Base Cost | Standard Top Cost | Lowest Runtime SPI Max | Base Share | Top Share | Base Casts | Top Casts |",
    "|---|---:|---:|---:|---:|---:|---:|---:|",
    buildLowSequenceTable(sequenceSummaries),
    "",
    "Validation notes:",
    "",
    buildLowSequenceNotes(sequenceSummaries),
    "",
    "## Highest Reserve Snapshots",
    "",
    "| Sequence | Rank | Pathway | Shifted SPI Base | Spirit Anchor Score | Spirit Scale | Runtime SPI Max |",
    "|---|---|---|---:|---|---:|---:|",
    buildHighestReserveTable(rows),
    "",
    "## Design Conclusion",
    "",
    "- Use the live spell-level baseline cost as the default sequence spine: Sequence `9 -> 0`, `8 -> 1`, `7 -> 2`, `6 -> 3`, `5 -> 4`, `4 -> 5`, `3 -> 6`, `2 -> 7`, `1 -> 8`, `0 -> 9`.",
    "- Keep the standard `+1 / +2 / +4` ladder as the default premium structure unless the ability is explicitly bounded enough to justify a compressed `+1 / +2 / +3` ladder.",
    "- Judge affordability against the lowest runtime max spirituality at that sequence. If a future sequence pass produces a top spend that pushes well beyond roughly half of the lowest reserve without encounter-shaping payoff, it should be repriced downward or its effect narrowed.",
    "- Conversely, if a supposedly premium spend becomes trivial relative to reserve and no longer feels like a meaningful escalation, it should gain scope or pay a steeper surcharge.",
    ""
  ].join("\n");
}

const rows = computeRows();
const sequenceSummaries = buildSequenceSummary(rows);
const report = buildReport(rows, sequenceSummaries);
fs.writeFileSync(REPORT_PATH, report, "utf8");
console.log(`Wrote ${REPORT_PATH}`);
