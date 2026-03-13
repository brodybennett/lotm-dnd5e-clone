const { ClassicLevel } = require('./node-tools/node_modules/classic-level');

const CORE_VERSION = '13.351';
const SYSTEM_ID = 'lotm';
const SYSTEM_VERSION = '5.2.6';
const MODIFIER = '0000000000000000';

const PATHWAY_KEY = '!items!lotmPathway00016';
const FOLDER_KEY = '!folders!FCnegTZeThIPZUlC';
const PATHWAY_IDENTIFIER = 'lotm-monster';

const LEGACY_A_KEY = '!items!lotmAbilityO3003'; // Predestination Fracture (Sequence 3)
const LEGACY_B_KEY = '!items!lotmAbilityO9002'; // Fickle Coin (Sequence 9)

const ABILITY_1_ID = 'lotmAbilityO0001';
const ABILITY_2_ID = 'lotmAbilityO0002';
const ABILITY_3_ID = 'lotmAbilityO0003';
const ABILITY_4_ID = 'lotmAbilityO0004';

function buildStats(now, existing = null) {
  const createdTime = existing?.createdTime ?? now;
  return {
    duplicateSource: existing?.duplicateSource ?? null,
    coreVersion: CORE_VERSION,
    systemId: SYSTEM_ID,
    systemVersion: SYSTEM_VERSION,
    createdTime,
    modifiedTime: now,
    lastModifiedBy: MODIFIER,
    exportSource: existing?.exportSource ?? null
  };
}

function buildActivity({ id, activationType, durationUnits, targetUnits = 'ft' }) {
  return {
    type: 'utility',
    _id: id,
    sort: 0,
    activation: {
      type: activationType,
      value: null,
      override: false
    },
    consumption: {
      scaling: {
        allowed: false
      },
      spellSlot: true,
      targets: []
    },
    description: {
      chatFlavor: ''
    },
    duration: {
      units: durationUnits,
      concentration: false,
      override: false
    },
    effects: [],
    range: {
      override: false
    },
    target: {
      template: {
        contiguous: false,
        units: targetUnits
      },
      affects: {
        choice: false
      },
      override: false,
      prompt: true
    },
    uses: {
      spent: 0,
      recovery: [],
      max: ''
    },
    roll: {
      prompt: false,
      visible: false,
      name: '',
      formula: ''
    },
    name: '',
    img: '',
    appliedEffects: []
  };
}

async function getOptionalJson(db, key) {
  try {
    const raw = await db.get(key);
    if (raw === undefined || raw === null || raw === '') return null;
    return JSON.parse(raw);
  } catch (err) {
    if (err?.code === 'LEVEL_NOT_FOUND') return null;
    throw err;
  }
}

function buildAbilityDoc({
  id,
  name,
  description,
  img,
  activationType,
  durationValue,
  durationUnits,
  targetType,
  targetCount,
  targetSpecial,
  rangeUnits,
  rangeValue,
  rangeSpecial,
  school,
  properties,
  materials,
  identifier,
  activityId,
  now,
  existing,
  sort
}) {
  return {
    _id: id,
    name,
    type: 'spell',
    img,
    system: {
      description: {
        value: description,
        chat: ''
      },
      source: {
        custom: '',
        rules: '2024',
        revision: 1,
        license: '',
        book: 'LoTM Core'
      },
      activation: {
        type: activationType,
        condition: '',
        value: null
      },
      duration: {
        value: durationValue,
        units: durationUnits
      },
      target: {
        affects: {
          choice: false,
          count: targetCount,
          type: targetType,
          special: targetSpecial
        },
        template: {
          units: '',
          contiguous: false,
          type: ''
        }
      },
      range: {
        units: rangeUnits,
        value: rangeValue,
        special: rangeSpecial
      },
      uses: {
        max: '',
        spent: 0,
        recovery: []
      },
      level: 9,
      school,
      properties,
      materials: {
        value: materials,
        consumed: false,
        cost: 0,
        supply: 0
      },
      preparation: {
        mode: 'always',
        prepared: false
      },
      activities: {
        [activityId]: buildActivity({
          id: activityId,
          activationType,
          durationUnits
        })
      },
      identifier,
      method: 'spell',
      prepared: 1,
      spiritualityCost: null,
      sourceClass: PATHWAY_IDENTIFIER
    },
    effects: [],
    folder: 'FCnegTZeThIPZUlC',
    flags: {
      dnd5e: {
        riders: {
          activity: [],
          effect: []
        }
      },
      lotm: {
        sourceBook: 'LoTM Core',
        grantedSequence: 0
      }
    },
    _stats: buildStats(now, existing?._stats),
    sort,
    ownership: {
      default: 0
    }
  };
}

(async () => {
  const now = Date.now();

  const pathwaysDb = new ClassicLevel('packs/lotm_pathways', { valueEncoding: 'utf8' });
  const abilitiesDb = new ClassicLevel('packs/lotm_abilities', { valueEncoding: 'utf8' });

  await pathwaysDb.open();
  await abilitiesDb.open();

  try {
    const pathway = await getOptionalJson(pathwaysDb, PATHWAY_KEY);
    if (!pathway) throw new Error('Monster pathway not found.');

    pathway.system = pathway.system ?? {};
    pathway.system.description = pathway.system.description ?? { value: '', chat: '' };
    pathway.system.description.value =
      '<p><strong>Pathway Vector:</strong> whimsical fate-walking through lucky accidents, uncanny danger sense, and sudden reversals that resist rigid planning.</p>' +
      '<p><strong>Sequence 9 Package (Total Budget 2):</strong> Calamity Instinct, Fickle Coin.</p>' +
      '<p><strong>Sequence 8 Package (Gain Budget +3):</strong> Weighted Outcome, Fortune Drift, plus one legacy scope upgrade to Fickle Coin.</p>' +
      '<p><strong>Sequence 7 Package (Gain Budget +13):</strong> Lucky Pulse, Jinx Bloom, Sudden Reversal, plus two legacy upgrades (Calamity Instinct and Weighted Outcome).</p>' +
      '<p><strong>Sequence 6 Package (Gain Budget +9):</strong> Calamity Attraction, Psyche Storm, Disaster Skim, plus two legacy upgrades (Fickle Coin and Sudden Reversal).</p>' +
      '<p><strong>Sequence 5 Package (Gain Budget +13):</strong> Curse of Misfortune, Banked Luck, Winner\'s Premonition, plus two legacy upgrades (Fickle Coin and Lucky Pulse).</p>' +
      '<p><strong>Sequence 4 Package (Gain Budget +33):</strong> Misfortune Field, Group Blessing, Absolute Foresight, Mercury Body, plus two legacy upgrades (Psyche Storm and Curse of Misfortune).</p>' +
      '<p><strong>Sequence 3 Package (Gain Budget +20):</strong> Keeper of Chaos, Spiritual Baptism, Predestination Fracture, Prayer Resonance, plus two legacy upgrades (Misfortune Field and Banked Luck).</p>' +
      '<p><strong>Sequence 2 Package (Gain Budget +50):</strong> Spoken Prophecy, Revelation of Fate, Words of Fortune, Inevitable Node, plus two legacy upgrades (Misfortune Field and Fickle Coin).</p>' +
      '<p><strong>Sequence 1 Package (Gain Budget +74):</strong> Fated Connection, Cycle of Fate, Reboot, Dream Revelation, plus two legacy upgrades (Spoken Prophecy and Fickle Coin).</p>' +
      '<p><strong>Sequence 0 Package (Gain Budget +114):</strong> Embodiment of Fate, Probability Dominion, Tunnel Effect, River Roaming, plus two legacy upgrades (Predestination Fracture and Fickle Coin).</p>' +
      '<p><strong>Pathway Status:</strong> Authored through Sequence 0 in compendium form.</p>' +
      '<p><strong>Continuity Anchor:</strong> At Sequence 0 (Wheel of Fortune), the pathway becomes direct fate/probability embodiment. Outcomes can be strongly biased or rebooted, but the design keeps uncertainty and recoil so no actor has absolute deterministic control in normal play.</p>';
    pathway._stats = buildStats(now, pathway._stats);
    await pathwaysDb.put(PATHWAY_KEY, JSON.stringify(pathway));

    const folder = await getOptionalJson(abilitiesDb, FOLDER_KEY);
    if (!folder) throw new Error('Monster folder not found.');

    folder.description = 'Sequence abilities for the Monster pathway (authored through Sequence 0).';
    folder.flags = folder.flags ?? {};
    folder.flags.lotm = {
      ...(folder.flags.lotm ?? {}),
      pathwayIdentifier: PATHWAY_IDENTIFIER,
      latestAuthoredSequence: 0
    };
    folder._stats = buildStats(now + 1, folder._stats);
    await abilitiesDb.put(FOLDER_KEY, JSON.stringify(folder));

    const legacyA = await getOptionalJson(abilitiesDb, LEGACY_A_KEY);
    const legacyB = await getOptionalJson(abilitiesDb, LEGACY_B_KEY);
    if (!legacyA) throw new Error('Legacy target lotmAbilityO3003 not found.');
    if (!legacyB) throw new Error('Legacy target lotmAbilityO9002 not found.');

    const legacyAHeader = '<h3>Legacy Upgrade (Sequence 0 - Scope)</h3>';
    const legacyAText =
      '<p>At Sequence 0, Predestination Fracture can bite into broader fate structures. ' +
      'When you successfully fracture a fixed outcome, choose one additional eligible fixed-result effect within 30 feet of the original trigger. ' +
      'Resolve a second fracture contest against that effect with the same chaos die roll. ' +
      'If your original cast used +2 or higher upcast, both fracture results may apply opposite signs (+/-Potency) to their replacement rolls.</p>';
    const legacyADescription = String(legacyA.system?.description?.value ?? '');
    if (!legacyADescription.includes(legacyAHeader)) {
      legacyA.system.description.value = `${legacyADescription}${legacyAHeader}${legacyAText}`;
    }
    legacyA._stats = buildStats(now + 2, legacyA._stats);
    await abilitiesDb.put(LEGACY_A_KEY, JSON.stringify(legacyA));

    const legacyBHeader = '<h3>Legacy Upgrade (Sequence 0 - Efficiency)</h3>';
    const legacyBText =
      '<p>At Sequence 0, Fickle Coin rides global probability ripples without slowing your turn flow. ' +
      'Once per round, you may trigger Fickle Coin as a free rider after any Monster ability you cast (including zero-cost abilities). ' +
      'If this rider changes an outcome, generate one <strong>Wheel Echo</strong>; spend Wheel Echo before end of your next turn to waive one +1 upcast surcharge or to reroll one Fickle Coin face and keep either result.</p>';
    const legacyBDescription = String(legacyB.system?.description?.value ?? '');
    if (!legacyBDescription.includes(legacyBHeader)) {
      legacyB.system.description.value = `${legacyBDescription}${legacyBHeader}${legacyBText}`;
    }
    legacyB._stats = buildStats(now + 3, legacyB._stats);
    await abilitiesDb.put(LEGACY_B_KEY, JSON.stringify(legacyB));

    const existing1 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_1_ID}`);
    const existing2 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_2_ID}`);
    const existing3 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_3_ID}`);
    const existing4 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_4_ID}`);

    const ability1 = buildAbilityDoc({
      id: ABILITY_1_ID,
      name: 'Embodiment of Fate',
      description:
        '<p><strong>Baseline (5 Spirituality):</strong> Action. For 1 minute, you embody short-term fate around you (60-foot aura). Each round, when any creature in aura makes its first d20 test, roll 1d8 and choose one of two applications:</p><ul><li><strong>Fortune Tilt:</strong> on 1-2 +1, 3-6 +Potency, 7-8 reroll keep higher.</li><li><strong>Misfortune Tilt:</strong> on 1-2 -1, 3-6 -Potency, 7-8 reroll keep lower.</li></ul><p>You choose tilt per trigger, but on a 1 result you also take psychic recoil equal to Potency.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> roll 2d8 per trigger and choose result band.</li><li><strong>+2 Spirituality:</strong> aura radius becomes 90 feet and ignores nonmagical cover for trigger detection.</li><li><strong>+4 Spirituality:</strong> once per round, after any trigger resolves, flip one secondary d20 result within 15 feet of that trigger by +/-Potency (your choice).</li></ul><p><em>Counterplay:</em> anti-fate wards, reroll immunity, and forced separation from aura center.</p><p><em>Corruption Hook:</em> if you bias fate to create spectacle from avoidable civilian suffering, gain 1 Corruption.</p>',
      img: 'icons/magic/control/debuff-energy-hold-purple-pink.webp',
      activationType: 'action',
      durationValue: '1',
      durationUnits: 'minute',
      targetType: 'creature',
      targetCount: '',
      targetSpecial: 'creatures in a 60-foot aura',
      rangeUnits: 'self',
      rangeValue: null,
      rangeSpecial: '',
      school: 'div',
      properties: ['vocal', 'somatic', 'material'],
      materials: 'a closed silver wheel etched with mirrored runes',
      identifier: 'lotm-monster-embodiment-of-fate',
      activityId: 'monsterSeq0Emb01',
      now: now + 4,
      existing: existing1,
      sort: 2201000
    });

    const ability2 = buildAbilityDoc({
      id: ABILITY_2_ID,
      name: 'Probability Dominion',
      description:
        '<p><strong>Baseline (4 Spirituality):</strong> Action. Select up to <strong>Potency</strong> creatures you can see within 300 feet for 1 minute. Each target receives a probability profile each round at the start of your turn (roll 1d6 per target):</p><ul><li><strong>1-2 Collapse:</strong> target subtracts Potency from its first d20 test that round.</li><li><strong>3-4 Flux:</strong> no d20 modifier, but target cannot gain advantage on its first d20 test that round.</li><li><strong>5-6 Surge:</strong> target adds Potency to its first d20 test that round.</li></ul><p>You may invert one target\'s profile each round (Collapse <-> Surge).</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> double target count.</li><li><strong>+2 Spirituality:</strong> roll 2d6 per target and choose profile each round.</li><li><strong>+4 Spirituality:</strong> when a profile changes an outcome, you may immediately force one adjacent creature (within 10 feet) to take a half-strength echo (+/-Potency, round down, minimum 1) on its next d20 test.</li></ul><p><em>Counterplay:</em> target dispersion, anti-divination effects, and fixed-result authority higher than yours.</p><p><em>Corruption Hook:</em> if you collapse probability around noncombatants for amusement, gain 1 Corruption.</p>',
      img: 'icons/magic/symbols/runes-star-blue.webp',
      activationType: 'action',
      durationValue: '1',
      durationUnits: 'minute',
      targetType: 'creature',
      targetCount: '',
      targetSpecial: 'up to Potency creatures',
      rangeUnits: 'ft',
      rangeValue: '300',
      rangeSpecial: '',
      school: 'enc',
      properties: ['vocal', 'somatic'],
      materials: 'three dice of unequal weight',
      identifier: 'lotm-monster-probability-dominion',
      activityId: 'monsterSeq0Pro02',
      now: now + 5,
      existing: existing2,
      sort: 2201001
    });

    const ability3 = buildAbilityDoc({
      id: ABILITY_3_ID,
      name: 'Tunnel Effect',
      description:
        '<p><strong>Baseline (0 Spirituality):</strong> Reaction when you are hit by an attack or fail a Dexterity/Constitution save. Roll 1d6:</p><ul><li><strong>1-2 Misalign:</strong> no mitigation.</li><li><strong>3-4 Slip:</strong> reduce triggering damage by <strong>Potency</strong>.</li><li><strong>5-6 Phase:</strong> negate the triggering attack/effect damage, then move 10 feet without provoking opportunity attacks from the source.</li></ul><p>When Phase triggers, lose 1 temporary Luck charge (GM tracker) until end of your next turn; if none available, take psychic recoil equal to Potency.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> roll 2d6 and choose result.</li><li><strong>+2 Spirituality:</strong> protect one ally within 30 feet with the same chosen result.</li><li><strong>+4 Spirituality:</strong> when Phase triggers, one enemy within 30 feet suffers -Potency on its next d20 test before end of its next turn.</li></ul><p><em>Counterplay:</em> reaction denial, anti-phase fields, and effects that bypass hit/save steps.</p><p><em>Corruption Hook:</em> if you hoard phase triggers while allies die in your reach, gain 1 Corruption.</p>',
      img: 'icons/magic/time/arrows-circling-green.webp',
      activationType: 'reaction',
      durationValue: '',
      durationUnits: 'inst',
      targetType: 'self',
      targetCount: '1',
      targetSpecial: 'self (or one ally on upcast)',
      rangeUnits: 'self',
      rangeValue: null,
      rangeSpecial: '',
      school: 'abj',
      properties: ['somatic'],
      materials: 'a thin foil strip cut into a spiral',
      identifier: 'lotm-monster-tunnel-effect',
      activityId: 'monsterSeq0Tun03',
      now: now + 6,
      existing: existing3,
      sort: 2201002
    });

    const ability4 = buildAbilityDoc({
      id: ABILITY_4_ID,
      name: 'River Roaming',
      description:
        '<p><strong>Baseline (3 Spirituality):</strong> Bonus action. For 1 minute, partially roam the River of Fate. Once per round, choose one:</p><ul><li><strong>Tributary Step:</strong> teleport up to 30 feet to a visible point.</li><li><strong>Anchor Glimpse:</strong> ask the GM for one immediate short-term danger signal (truthful, concise, non-exhaustive).</li><li><strong>Fate Swap:</strong> after seeing a creature within 60 feet roll a d20, force a reroll and keep the new result.</li></ul><p>Each time you use Fate Swap in the same minute after the first, roll 1d6. On 1-2, you take psychic recoil equal to Potency.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> teleport distance becomes 60 feet and Fate Swap range becomes 120 feet.</li><li><strong>+2 Spirituality:</strong> use two different options each round instead of one.</li><li><strong>+4 Spirituality:</strong> once during duration, declare one micro-prophecy (single immediate event in next round). If fulfilled, recover 2 Spirituality; if not fulfilled, suffer psychic recoil equal to 2 x Potency.</li></ul><p><em>Counterplay:</em> anti-teleport zones, reroll immunity, obscured line of sight, and anti-divination barriers.</p><p><em>Corruption Hook:</em> if you alter allies\' fates repeatedly without consent, gain 1 Corruption.</p>',
      img: 'icons/magic/water/waves-swirl-blue.webp',
      activationType: 'bonus',
      durationValue: '1',
      durationUnits: 'minute',
      targetType: 'self',
      targetCount: '1',
      targetSpecial: 'self',
      rangeUnits: 'self',
      rangeValue: null,
      rangeSpecial: '',
      school: 'div',
      properties: ['vocal', 'somatic', 'material'],
      materials: 'a vial with a single drop of still water',
      identifier: 'lotm-monster-river-roaming',
      activityId: 'monsterSeq0Riv04',
      now: now + 7,
      existing: existing4,
      sort: 2201003
    });

    await abilitiesDb.put(`!items!${ABILITY_1_ID}`, JSON.stringify(ability1));
    await abilitiesDb.put(`!items!${ABILITY_2_ID}`, JSON.stringify(ability2));
    await abilitiesDb.put(`!items!${ABILITY_3_ID}`, JSON.stringify(ability3));
    await abilitiesDb.put(`!items!${ABILITY_4_ID}`, JSON.stringify(ability4));

    const verifyPathway = await getOptionalJson(pathwaysDb, PATHWAY_KEY);
    const verifyFolder = await getOptionalJson(abilitiesDb, FOLDER_KEY);
    const verifyLegacyA = await getOptionalJson(abilitiesDb, LEGACY_A_KEY);
    const verifyLegacyB = await getOptionalJson(abilitiesDb, LEGACY_B_KEY);
    const verify1 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_1_ID}`);
    const verify2 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_2_ID}`);
    const verify3 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_3_ID}`);
    const verify4 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_4_ID}`);

    console.log(JSON.stringify({
      pathwayKey: PATHWAY_KEY,
      pathwayIdentifier: verifyPathway?.system?.identifier,
      folderKey: FOLDER_KEY,
      folderFlags: verifyFolder?.flags?.lotm,
      legacyUpdated: [
        { key: LEGACY_A_KEY, applied: String(verifyLegacyA?.system?.description?.value ?? '').includes(legacyAHeader) },
        { key: LEGACY_B_KEY, applied: String(verifyLegacyB?.system?.description?.value ?? '').includes(legacyBHeader) }
      ],
      abilitiesWritten: [`!items!${ABILITY_1_ID}`, `!items!${ABILITY_2_ID}`, `!items!${ABILITY_3_ID}`, `!items!${ABILITY_4_ID}`],
      abilityReadBack: [
        { id: verify1?._id, name: verify1?.name, sourceClass: verify1?.system?.sourceClass, identifier: verify1?.system?.identifier, grantedSequence: verify1?.flags?.lotm?.grantedSequence, level: verify1?.system?.level, folder: verify1?.folder },
        { id: verify2?._id, name: verify2?.name, sourceClass: verify2?.system?.sourceClass, identifier: verify2?.system?.identifier, grantedSequence: verify2?.flags?.lotm?.grantedSequence, level: verify2?.system?.level, folder: verify2?.folder },
        { id: verify3?._id, name: verify3?.name, sourceClass: verify3?.system?.sourceClass, identifier: verify3?.system?.identifier, grantedSequence: verify3?.flags?.lotm?.grantedSequence, level: verify3?.system?.level, folder: verify3?.folder },
        { id: verify4?._id, name: verify4?.name, sourceClass: verify4?.system?.sourceClass, identifier: verify4?.system?.identifier, grantedSequence: verify4?.flags?.lotm?.grantedSequence, level: verify4?.system?.level, folder: verify4?.folder }
      ]
    }, null, 2));
  } finally {
    await pathwaysDb.close();
    await abilitiesDb.close();
  }
})();
