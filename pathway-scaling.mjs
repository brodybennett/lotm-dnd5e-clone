const ABILITIES = ["str", "dex", "con", "int", "wis", "cha"];

export const LOTM_PATHWAY_ATTRIBUTE_POINT_SCHEDULE = Object.freeze({
  9: 0,
  8: 1,
  7: 2,
  6: 3,
  5: 4,
  4: 6,
  3: 7,
  2: 9,
  1: 11,
  0: 14
});

export const LOTM_PATHWAY_LANE_CAPS_BY_TIER = Object.freeze([
  Object.freeze({ primary: 20, anchor: 20, tertiary: 20, quirk: 20, offLane: 20 }),
  Object.freeze({ primary: 22, anchor: 22, tertiary: 20, quirk: 20, offLane: 20 }),
  Object.freeze({ primary: 24, anchor: 22, tertiary: 20, quirk: 20, offLane: 20 }),
  Object.freeze({ primary: 26, anchor: 24, tertiary: 22, quirk: 20, offLane: 20 }),
  Object.freeze({ primary: 30, anchor: 26, tertiary: 24, quirk: 22, offLane: 20 })
]);

export const LOTM_PATHWAY_CADENCE_PATTERNS = Object.freeze({
  frontloaded: Object.freeze([
    "primary", "anchor", "primary", "tertiary",
    "anchor", "primary", "quirk", "anchor",
    "primary", "tertiary", "primary", "anchor",
    "quirk", "tertiary"
  ]),
  even: Object.freeze([
    "primary", "anchor", "tertiary", "primary",
    "anchor", "quirk", "primary", "tertiary",
    "anchor", "primary", "tertiary", "anchor",
    "quirk", "primary"
  ]),
  saintSpike: Object.freeze([
    "primary", "tertiary", "anchor", "primary",
    "primary", "anchor", "quirk", "primary",
    "tertiary", "anchor", "primary", "anchor",
    "quirk", "tertiary"
  ]),
  backloaded: Object.freeze([
    "anchor", "tertiary", "primary", "anchor",
    "quirk", "primary", "tertiary", "anchor",
    "primary", "quirk", "tertiary", "anchor",
    "primary", "primary"
  ])
});

export const LOTM_PATHWAY_SCALING_PROFILES = Object.freeze({
  "lotm-apothecary": Object.freeze({
    spiritAbility: "wis",
    resourceProfile: Object.freeze([-6, -4, 0, 4, 6]),
    lanes: Object.freeze({ primary: "wis", anchor: "wis", tertiary: "int", quirk: "con" }),
    cadence: "even"
  }),
  "lotm-apprentice": Object.freeze({
    spiritAbility: "int",
    resourceProfile: Object.freeze([-10, -8, -6, -4, -2]),
    lanes: Object.freeze({ primary: "int", anchor: "dex", tertiary: "wis", quirk: "cha" }),
    cadence: "frontloaded"
  }),
  "lotm-arbiter": Object.freeze({
    spiritAbility: "cha",
    resourceProfile: Object.freeze([2, 0, 2, 2, 0]),
    lanes: Object.freeze({ primary: "cha", anchor: "wis", tertiary: "con", quirk: "int" }),
    cadence: "saintSpike"
  }),
  "lotm-assassin": Object.freeze({
    spiritAbility: "cha",
    resourceProfile: Object.freeze([-8, -6, -4, -2, 0]),
    lanes: Object.freeze({ primary: "cha", anchor: "dex", tertiary: "con", quirk: "wis" }),
    cadence: "frontloaded"
  }),
  "lotm-bard": Object.freeze({
    spiritAbility: "cha",
    resourceProfile: Object.freeze([-4, -6, -6, -4, -2]),
    lanes: Object.freeze({ primary: "cha", anchor: "wis", tertiary: "int", quirk: "con" }),
    cadence: "even"
  }),
  "lotm-corpse-collector": Object.freeze({
    spiritAbility: "wis",
    resourceProfile: Object.freeze([2, 4, 6, 4, 2]),
    lanes: Object.freeze({ primary: "wis", anchor: "con", tertiary: "int", quirk: "cha" }),
    cadence: "saintSpike"
  }),
  "lotm-criminal": Object.freeze({
    spiritAbility: "cha",
    resourceProfile: Object.freeze([8, 10, 8, 4, 0]),
    lanes: Object.freeze({ primary: "cha", anchor: "str", tertiary: "con", quirk: "wis" }),
    cadence: "frontloaded"
  }),
  "lotm-hunter": Object.freeze({
    spiritAbility: "dex",
    resourceProfile: Object.freeze([6, 6, 4, 2, 0]),
    lanes: Object.freeze({ primary: "dex", anchor: "wis", tertiary: "con", quirk: "str" }),
    cadence: "frontloaded"
  }),
  "lotm-lawyer": Object.freeze({
    spiritAbility: "cha",
    resourceProfile: Object.freeze([-4, -6, -4, -2, 0]),
    lanes: Object.freeze({ primary: "cha", anchor: "int", tertiary: "wis", quirk: "con" }),
    cadence: "backloaded"
  }),
  "lotm-marauder": Object.freeze({
    spiritAbility: "int",
    resourceProfile: Object.freeze([-6, -8, -6, -4, -2]),
    lanes: Object.freeze({ primary: "int", anchor: "cha", tertiary: "dex", quirk: "wis" }),
    cadence: "backloaded"
  }),
  "lotm-monster": Object.freeze({
    spiritAbility: "wis",
    resourceProfile: Object.freeze([-4, -4, -2, 0, 0]),
    lanes: Object.freeze({ primary: "wis", anchor: "cha", tertiary: "dex", quirk: "con" }),
    cadence: "even"
  }),
  "lotm-mystery-pryer": Object.freeze({
    spiritAbility: "int",
    resourceProfile: Object.freeze([-10, -10, -8, -6, -4]),
    lanes: Object.freeze({ primary: "int", anchor: "wis", tertiary: "cha", quirk: "con" }),
    cadence: "backloaded"
  }),
  "lotm-planter": Object.freeze({
    spiritAbility: "wis",
    resourceProfile: Object.freeze([-4, -2, 0, 4, 6]),
    lanes: Object.freeze({ primary: "wis", anchor: "con", tertiary: "int", quirk: "cha" }),
    cadence: "saintSpike"
  }),
  "lotm-prisoner": Object.freeze({
    spiritAbility: "wis",
    resourceProfile: Object.freeze([2, 4, 6, 4, 2]),
    lanes: Object.freeze({ primary: "wis", anchor: "con", tertiary: "str", quirk: "cha" }),
    cadence: "saintSpike"
  }),
  "lotm-reader": Object.freeze({
    spiritAbility: "int",
    resourceProfile: Object.freeze([-6, -8, -6, -4, -2]),
    lanes: Object.freeze({ primary: "int", anchor: "wis", tertiary: "dex", quirk: "cha" }),
    cadence: "backloaded"
  }),
  "lotm-sailor": Object.freeze({
    spiritAbility: "cha",
    resourceProfile: Object.freeze([8, 4, 0, -4, -8]),
    lanes: Object.freeze({ primary: "cha", anchor: "con", tertiary: "str", quirk: "dex" }),
    cadence: "saintSpike"
  }),
  "lotm-savant": Object.freeze({
    spiritAbility: "int",
    resourceProfile: Object.freeze([-8, -10, -8, -6, -4]),
    lanes: Object.freeze({ primary: "int", anchor: "dex", tertiary: "wis", quirk: "con" }),
    cadence: "backloaded"
  }),
  "lotm-secrets-suppliant": Object.freeze({
    spiritAbility: "int",
    resourceProfile: Object.freeze([-10, -8, -6, -4, -2]),
    lanes: Object.freeze({ primary: "int", anchor: "cha", tertiary: "con", quirk: "wis" }),
    cadence: "saintSpike"
  }),
  "lotm-seer": Object.freeze({
    spiritAbility: "int",
    resourceProfile: Object.freeze([-8, -10, -8, -6, -4]),
    lanes: Object.freeze({ primary: "int", anchor: "dex", tertiary: "cha", quirk: "wis" }),
    cadence: "backloaded"
  }),
  "lotm-sleepless": Object.freeze({
    spiritAbility: "wis",
    resourceProfile: Object.freeze([-6, -6, -4, -2, 0]),
    lanes: Object.freeze({ primary: "wis", anchor: "int", tertiary: "dex", quirk: "cha" }),
    cadence: "backloaded"
  }),
  "lotm-spectator": Object.freeze({
    spiritAbility: "int",
    resourceProfile: Object.freeze([-12, -10, -8, -4, 0]),
    lanes: Object.freeze({ primary: "int", anchor: "int", tertiary: "cha", quirk: "wis" }),
    cadence: "backloaded"
  }),
  "lotm-warrior": Object.freeze({
    spiritAbility: "con",
    resourceProfile: Object.freeze([12, 8, 6, 2, 0]),
    lanes: Object.freeze({ primary: "str", anchor: "con", tertiary: "wis", quirk: "dex" }),
    cadence: "frontloaded"
  })
});

function normalizeSequence(sequence) {
  const numeric = Number(sequence);
  if ( !Number.isFinite(numeric) ) return 9;
  return Math.max(Math.min(Math.floor(numeric), 9), 0);
}

export function lotmPathwayTierFromSequence(sequence) {
  const normalized = normalizeSequence(sequence);
  if ( normalized >= 7 ) return 0;
  if ( normalized >= 5 ) return 1;
  if ( normalized >= 3 ) return 2;
  if ( normalized >= 1 ) return 3;
  return 4;
}

export function getLotmPathwayCumulativeAttributePoints(sequence) {
  const normalized = normalizeSequence(sequence);
  return LOTM_PATHWAY_ATTRIBUTE_POINT_SCHEDULE[normalized] ?? 0;
}

export function getLotmPathwayScalingProfile(identifier, fallback={}) {
  const profile = LOTM_PATHWAY_SCALING_PROFILES[identifier] ?? {};
  const spellcastingAbility = fallback.spellcastingAbility ?? "wis";
  const primaryAbility = fallback.primaryAbility ?? spellcastingAbility;
  const lanes = profile.lanes ?? {};
  return {
    identifier: identifier ?? "",
    spiritAbility: profile.spiritAbility ?? fallback.spiritAbility ?? spellcastingAbility,
    resourceProfile: [...(profile.resourceProfile ?? [0, 0, 0, 0, 0])],
    lanes: {
      primary: lanes.primary ?? primaryAbility,
      anchor: lanes.anchor ?? spellcastingAbility,
      tertiary: lanes.tertiary ?? "con",
      quirk: lanes.quirk ?? "cha"
    },
    cadence: profile.cadence ?? "even"
  };
}

export function getLotmPathwayCadencePattern(profile) {
  return LOTM_PATHWAY_CADENCE_PATTERNS[profile?.cadence] ?? LOTM_PATHWAY_CADENCE_PATTERNS.even;
}

export function getLotmPathwayResourceShift(profile, sequenceOrTier) {
  const tierIndex = lotmPathwayTierFromSequence(sequenceOrTier);
  const pct = Number(profile?.resourceProfile?.[tierIndex]) || 0;
  return pct / 100;
}

export function getLotmPathwayLane(profile, abilityId) {
  const lanes = profile?.lanes ?? {};
  if ( lanes.primary === abilityId ) return "primary";
  if ( lanes.anchor === abilityId ) return "anchor";
  if ( lanes.tertiary === abilityId ) return "tertiary";
  if ( lanes.quirk === abilityId ) return "quirk";
  return "offLane";
}

export function getLotmPathwayAbilityCap(sequence, profile, abilityId) {
  const tier = lotmPathwayTierFromSequence(sequence);
  const lane = getLotmPathwayLane(profile, abilityId);
  return LOTM_PATHWAY_LANE_CAPS_BY_TIER[tier]?.[lane] ?? LOTM_PATHWAY_LANE_CAPS_BY_TIER[tier]?.offLane ?? 20;
}

export function getLotmPathwayAttributeBonuses(sequence, profile) {
  const steps = getLotmPathwayCumulativeAttributePoints(sequence);
  const bonuses = Object.fromEntries(ABILITIES.map(ability => [ability, 0]));
  const pattern = getLotmPathwayCadencePattern(profile);
  const lanes = profile?.lanes ?? {};
  for ( let i = 0; i < steps; i += 1 ) {
    const lane = pattern[i];
    const ability = lanes[lane];
    if ( ability in bonuses ) bonuses[ability] += 1;
  }
  return bonuses;
}

export function getLotmPathwayAbilityCaps(sequence, profile) {
  return Object.fromEntries(ABILITIES.map(ability => [ability, getLotmPathwayAbilityCap(sequence, profile, ability)]));
}

export function getLotmPathwayIdentifiers() {
  return Object.keys(LOTM_PATHWAY_SCALING_PROFILES);
}
