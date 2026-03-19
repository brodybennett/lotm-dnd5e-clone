import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { ClassicLevel } = require("../tmp/node-tools/node_modules/classic-level");

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ABILITIES_DB_PATH = path.join(ROOT, "packs", "lotm_abilities");
const REPORT_PATH = path.join(ROOT, "docs", "LoTM_Sequence0_Spirituality_Audit.md");

const TARGET_BASELINE = 9;

const LADDER_NORMALIZATIONS = Object.freeze({
  lotmAbilityA0001: Object.freeze({ name: "Threshold Sovereignty", from: [3, 6, 10], to: [4, 8, 12] }),
  lotmAbilityA0002: Object.freeze({ name: "Anyspace Arrival", from: [2, 5, 8], to: [2, 4, 8] }),
  lotmAbilityA0003: Object.freeze({ name: "Veiled Interstice", from: [2, 4, 7], to: [2, 4, 8] }),
  lotmAbilityZ0001: Object.freeze({ name: "Underlying Edict", from: [2, 5, 10], to: [2, 4, 8] }),
  lotmAbilityZ0002: Object.freeze({ name: "World Verdict", from: [2, 5, 10], to: [2, 4, 8] }),
  lotmAbilityZ0003: Object.freeze({ name: "Disorder Arbitration", from: [2, 5, 10], to: [2, 4, 8] }),
  lotmAbilityZ0004: Object.freeze({ name: "Abstract Equilibrium", from: [2, 5, 10], to: [2, 4, 8] }),
  lotmAbilityI0001: Object.freeze({ name: "Worldfall Mandate", from: [3, 6, 10], to: [4, 8, 12] }),
  lotmAbilityI0002: Object.freeze({ name: "Mirror World Sovereignty", from: [3, 6, 10], to: [4, 8, 12] }),
  lotmAbilityI0003: Object.freeze({ name: "Venomous Prophecy", from: [3, 6, 10], to: [4, 8, 12] }),
  lotmAbilityI0004: Object.freeze({ name: "Coronation of Chaos", from: [3, 6, 10], to: [4, 8, 12] }),
  lotmAbilityB0001: Object.freeze({ name: "Inextinguishable Light", from: [10, 18, 26], to: [6, 12, 18] }),
  lotmAbilityB0002: Object.freeze({ name: "Omnipresent Light", from: [8, 14, 20], to: [6, 12, 18] }),
  lotmAbilityB0003: Object.freeze({ name: "Order Absolute", from: [8, 14, 21], to: [6, 12, 18] }),
  lotmAbilityB0004: Object.freeze({ name: "Contract Dominion", from: [7, 12, 17], to: [6, 12, 18] }),
  lotmAbilityB0005: Object.freeze({ name: "Sacred Sun", from: [12, 20, 30], to: [6, 12, 18] }),
  lotmAbilityC0001: Object.freeze({ name: "Conceptual Extinction", from: [5, 10, 15], to: [6, 12, 18] }),
  lotmAbilityC0002: Object.freeze({ name: "Endpoint Dominion", from: [5, 10, 15], to: [6, 12, 18] }),
  lotmAbilityC0003: Object.freeze({ name: "Pallor of Eternal Rest", from: [5, 10, 15], to: [6, 12, 18] }),
  lotmAbilityC0004: Object.freeze({ name: "Throne of the Dead", from: [5, 10, 15], to: [6, 12, 18] }),
  lotmAbilityF0001: Object.freeze({ name: "Mother's Authority", from: [2, 3, 5], to: [2, 4, 6] }),
  lotmAbilityF0002: Object.freeze({ name: "Bountiful Earth", from: [2, 3, 6], to: [2, 4, 6] }),
  lotmAbilityF0003: Object.freeze({ name: "Universal Return", from: [2, 3, 6], to: [2, 4, 6] }),
  lotmAbilityF0004: Object.freeze({ name: "Genesis Transmutation", from: [2, 3, 5], to: [2, 4, 6] }),
  lotmAbilityR0001: Object.freeze({ name: "White Tower Omniscience", from: [3, 6, 12], to: [4, 8, 12] }),
  lotmAbilityR0002: Object.freeze({ name: "Universal Non-Authority Imitation", from: [3, 6, 12], to: [4, 8, 12] }),
  lotmAbilityR0003: Object.freeze({ name: "Concept Aperture", from: [3, 6, 12], to: [4, 8, 12] }),
  lotmAbilityR0004: Object.freeze({ name: "Disaster Thesis", from: [3, 6, 12], to: [4, 8, 12] }),
  lotmAbilityS0001: Object.freeze({ name: "Fool Fate", from: [5, 10, 15], to: [6, 12, 18] }),
  lotmAbilityS0003: Object.freeze({ name: "Blind Stupidity", from: [5, 10, 15], to: [6, 12, 18] }),
  lotmAbilityS0004: Object.freeze({ name: "Miracle Maze", from: [6, 12, 20], to: [6, 12, 18] }),
  lotmAbilityV0001: Object.freeze({ name: "Envisioning Authority", from: [6, 12, 18], to: [6, 12, 18] }),
  lotmAbilityV0002: Object.freeze({ name: "Psyche Rewrite", from: [6, 12, 18], to: [6, 12, 18] }),
  lotmAbilityV0003: Object.freeze({ name: "Discernment Horizon", from: [6, 12, 18], to: [6, 12, 18] }),
  lotmAbilityV0004: Object.freeze({ name: "Dream Dominion", from: [6, 12, 18], to: [6, 12, 18] }),
  lotmAbilityV0005: Object.freeze({ name: "Loss of Control", from: [6, 12, 18], to: [6, 12, 18] })
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

function inferSequence0(item) {
  return Number(item?.system?.level) === 9;
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
  if ( serialized === "4/8/12" ) return "sovereign-premium";
  if ( serialized === "6/12/18" ) return "absolute-premium";
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
  if ( identifier === "lotm-bard" || identifier === "lotm-corpse-collector" ) {
    return "Normalized to absolute-premium ladder.";
  }
  if ( identifier === "lotm-seer" || identifier === "lotm-spectator" ) {
    return "Absolute-premium ladder retained.";
  }
  if ( identifier === "lotm-reader" ) return "Normalized to sovereign-premium ladder.";
  if ( identifier === "lotm-assassin" ) return "Normalized to sovereign-premium ladder.";
  if ( identifier === "lotm-arbiter" ) return "Normalized to authority-premium ladder.";
  if ( identifier === "lotm-planter" ) return "Normalized to focused-premium ladder.";
  if ( id === "lotmAbilityA0001" ) return "Normalized to sovereign-premium ladder.";
  if ( id === "lotmAbilityA0002" || id === "lotmAbilityA0003" ) return "Normalized to authority-premium ladder.";
  if ( identifier === "lotm-sleepless" ) return "Sequence tag repaired.";
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
    "# LoTM Sequence 0 Spirituality Audit",
    "",
    "This report audits live Sequence 0 pathway abilities in `packs/lotm_abilities` and normalizes spirituality pricing text plus sequence metadata on the actual level-9 ability set.",
    "",
    "## Sequence 0 Cost Logic",
    "",
    "- Base cast at Sequence 0 should be `9 Spirituality`; live level-9 abilities already derive that cost automatically from item level.",
    "- Sequence 0 uses five valid pricing families because god-tier reserve pools are enormous and top-end spends need clear differentiation to remain meaningful:",
    "- `+1 / +2 / +4` for bounded or primarily tactical god-tier abilities.",
    "- `+2 / +4 / +6` for precise but still premium god-tier control or support authorities.",
    "- `+2 / +4 / +8` for broad authority, domain, command, or sovereign mobility effects.",
    "- `+4 / +8 / +12` for large-scale sovereign battlefield or conceptual dominion effects.",
    "- `+6 / +12 / +18` for absolute reality, fate, psyche, death, or sun-authority effects where the top spend should still feel materially premium even at god-tier reserves.",
    "",
    "## Findings",
    "",
    "- Sequence 0 showed extreme authored-text drift beneath the live level-9 cost; many abilities still advertised `0-8` spirituality baselines while the real system baseline is already `9`.",
    "- Bard remained the largest outlier in the full audit, with baselines up to `30` and surcharges as high as `+12 / +20 / +30`.",
    "- Corpse Collector and Spectator were still authored with enormous premium ladders, while Seer mixed `+5 / +10 / +15`, `+6 / +12 / +18`, and `+6 / +12 / +20` inside the same package.",
    "- Apprentice, Arbiter, Assassin, Planter, and Reader each had near-miss or bespoke god-tier ladders that did not resolve into a small consistent set of families.",
    "- Actual level-9 Seer and Spectator abilities were missing `grantedSequence = 0`, and actual level-9 Sleepless abilities were still incorrectly tagged as Sequence 3. Those metadata errors were repaired.",
    "",
    "## Live Sequence 0 Table",
    "",
    "| Pathway | Ability | Base | Upcast Ladder | Ladder Type | Notes |",
    "|---|---|---:|---|---|---|",
    rows,
    "",
    "## Normalization Summary",
    "",
    "- All live level-9 abilities now present `Baseline (9 Spirituality)` to match the actual system cost.",
    "- Bard and Corpse Collector now use the shared absolute-premium `9 / +6 / +12 / +18` family instead of bespoke extreme surcharges.",
    "- Seer and Spectator retain absolute-premium god-tier ladders once baseline drift is corrected.",
    "- Reader and Assassin now sit on the sovereign-premium `9 / +4 / +8 / +12` family; Arbiter sits on the authority-premium `9 / +2 / +4 / +8` family; Planter sits on the focused-premium `9 / +2 / +4 / +6` family.",
    "- All actual Sequence 0 level-9 items now carry `flags.lotm.grantedSequence = 0`.",
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
      if ( !inferSequence0(item) ) continue;

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

      if ( item.flags?.lotm?.grantedSequence !== 0 ) {
        item.flags ??= {};
        item.flags.lotm ??= {};
        item.flags.lotm.grantedSequence = 0;
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
      if ( !inferSequence0(item) ) continue;
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
