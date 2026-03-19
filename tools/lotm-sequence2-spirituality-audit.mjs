import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { ClassicLevel } = require("../tmp/node-tools/node_modules/classic-level");

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ABILITIES_DB_PATH = path.join(ROOT, "packs", "lotm_abilities");
const REPORT_PATH = path.join(ROOT, "docs", "LoTM_Sequence2_Spirituality_Audit.md");

const TARGET_BASELINE = 7;

const LADDER_NORMALIZATIONS = Object.freeze({
  lotmAbilityA2002: Object.freeze({ name: "Coordinate Exile", from: [1, 3, 6], to: [1, 2, 4] }),
  lotmAbilityA2003: Object.freeze({ name: "Domain Stitch", from: [2, 4, 7], to: [2, 4, 8] }),
  lotmAbilityA2004: Object.freeze({ name: "Threshold Mandate", from: [1, 3, 6], to: [1, 2, 4] }),
  lotmAbilityI2001: Object.freeze({ name: "Cataclysm Waltz", from: [2, 4, 7], to: [2, 4, 6] }),
  lotmAbilityI2004: Object.freeze({ name: "Glacial Inferno", from: [1, 3, 5], to: [1, 2, 4] }),
  lotmAbilityB2001: Object.freeze({ name: "Solar Envoy", from: [6, 12, 18], to: [2, 4, 8] }),
  lotmAbilityB2002: Object.freeze({ name: "Spear of Light", from: [5, 10, 15], to: [2, 4, 8] }),
  lotmAbilityB2003: Object.freeze({ name: "Justice Trial", from: [5, 10, 15], to: [2, 4, 8] }),
  lotmAbilityB2004: Object.freeze({ name: "Praise the Sun", from: [6, 12, 18], to: [2, 4, 8] }),
  lotmAbilityC2001: Object.freeze({ name: "Nation of the Dead", from: [3, 6, 9], to: [2, 4, 8] }),
  lotmAbilityC2002: Object.freeze({ name: "King of the Dead", from: [3, 6, 9], to: [2, 4, 8] }),
  lotmAbilityC2003: Object.freeze({ name: "Death Consul's Decree", from: [3, 6, 9], to: [2, 4, 8] }),
  lotmAbilityC2004: Object.freeze({ name: "Soul Shepherding", from: [3, 6, 9], to: [2, 4, 8] }),
  lotmAbilityV2001: Object.freeze({ name: "Dream Maze", from: [3, 6, 9], to: [2, 4, 6] }),
  lotmAbilityV2002: Object.freeze({ name: "Discernment", from: [3, 6, 9], to: [2, 4, 6] }),
  lotmAbilityV2003: Object.freeze({ name: "Consciousness Trace", from: [3, 6, 9], to: [2, 4, 6] }),
  lotmAbilityV2004: Object.freeze({ name: "Idealized Projection", from: [3, 6, 9], to: [2, 4, 6] })
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

function inferSequence2(item) {
  return Number(item?.system?.level) === 7;
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
  if ( identifier === "lotm-bard" ) return "Normalized to authority-premium ladder.";
  if ( identifier === "lotm-corpse-collector" ) return "Normalized to authority-premium ladder.";
  if ( identifier === "lotm-spectator" ) return "Normalized to focused-premium ladder.";
  if ( id === "lotmAbilityA2002" || id === "lotmAbilityA2004" || id === "lotmAbilityI2004" ) return "Normalized to standard ladder.";
  if ( id === "lotmAbilityA2003" ) return "Normalized to authority-premium ladder.";
  if ( id === "lotmAbilityI2001" ) return "Normalized to focused-premium ladder.";
  if ( item.system?.sourceClass === "lotm-sleepless" || id.startsWith("lotmAbilityS200") || id.startsWith("lotmAbilityV200") ) {
    if ( item.flags?.lotm?.grantedSequence === 2 ) return "Sequence tag repaired.";
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
    "# LoTM Sequence 2 Spirituality Audit",
    "",
    "This report audits live Sequence 2 pathway abilities in `packs/lotm_abilities` and normalizes spirituality pricing text plus sequence metadata on the actual level-7 ability set.",
    "",
    "## Sequence 2 Cost Logic",
    "",
    "- Base cast at Sequence 2 should be `7 Spirituality`; live level-7 abilities already derive that cost automatically from item level.",
    "- Sequence 2 uses three valid pricing families based on impact and flexibility against the much larger runtime reserve pool:",
    "- `+1 / +2 / +4` for bounded, narrower, or primarily tactical abilities.",
    "- `+2 / +4 / +6` for strong flexible control, information, or multi-role premium abilities.",
    "- `+2 / +4 / +8` for broad authority, sovereign forms, mass command, or scene-shaping effects.",
    "- Sequence 2 reserve floors are large enough that a flat `+1 / +2 / +4` spine no longer makes every premium spend feel meaningful, so higher ladders are valid when the effect profile supports them.",
    "",
    "## Findings",
    "",
    "- Sequence 2 showed broad baseline text drift under the live level-7 cost; many abilities still advertised `0-6` spirituality baselines despite actual level-derived cost `7`.",
    "- Bard was still massively over-surcharged, with baselines as high as `10-14` and ladders at `+5 / +10 / +15` or `+6 / +12 / +18`.",
    "- Corpse Collector and Spectator were still authored on synthetic `+3 / +6 / +9` premium ladders that overshot the new Sequence 2 pricing families.",
    "- Apprentice and Assassin each had internal ladder drift inside the same package, with some abilities landing between standard and premium families without a clear power justification.",
    "- Actual level-7 Seer and Spectator abilities were missing `grantedSequence = 2`, and actual level-7 Sleepless abilities were still incorrectly tagged as Sequence 3. Those metadata errors were repaired.",
    "",
    "## Live Sequence 2 Table",
    "",
    "| Pathway | Ability | Base | Upcast Ladder | Ladder Type | Notes |",
    "|---|---|---:|---|---|---|",
    rows,
    "",
    "## Normalization Summary",
    "",
    "- All live level-7 abilities now present `Baseline (7 Spirituality)` to match the actual system cost.",
    "- Bard and Corpse Collector now sit on the shared authority-premium `7 / +2 / +4 / +8` family instead of bespoke extreme surcharges.",
    "- Spectator now sits on the focused-premium `7 / +2 / +4 / +6` family rather than `+3 / +6 / +9`.",
    "- Apprentice and Assassin near-miss ladders were normalized to the nearest consistent family instead of leaving ad hoc `+1 / +3 / +6`, `+1 / +3 / +5`, or `+2 / +4 / +7` progressions in place.",
    "- All actual Sequence 2 level-7 items now carry `flags.lotm.grantedSequence = 2`.",
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
      if ( !inferSequence2(item) ) continue;

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

      if ( item.flags?.lotm?.grantedSequence !== 2 ) {
        item.flags ??= {};
        item.flags.lotm ??= {};
        item.flags.lotm.grantedSequence = 2;
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
      if ( !inferSequence2(item) ) continue;
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
