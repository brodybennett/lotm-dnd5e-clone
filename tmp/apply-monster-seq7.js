const { ClassicLevel } = require('./node-tools/node_modules/classic-level');

const CORE_VERSION = '13.351';
const SYSTEM_ID = 'lotm';
const SYSTEM_VERSION = '5.2.6';
const MODIFIER = '0000000000000000';

const PATHWAY_KEY = '!items!lotmPathway00016';
const FOLDER_KEY = '!folders!FCnegTZeThIPZUlC';
const PATHWAY_IDENTIFIER = 'lotm-monster';

const LEGACY_A_KEY = '!items!lotmAbilityO9001'; // Calamity Instinct
const LEGACY_B_KEY = '!items!lotmAbilityO8001'; // Weighted Outcome

const ABILITY_1_ID = 'lotmAbilityO7001';
const ABILITY_2_ID = 'lotmAbilityO7002';
const ABILITY_3_ID = 'lotmAbilityO7003';

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
      level: 2,
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
        grantedSequence: 7
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
      '<p><strong>Sequence 6-0 Status:</strong> Pending authoring in later sequence-focused runs.</p>' +
      '<p><strong>Continuity Anchor:</strong> At Sequence 7 (Lucky One), Robot-grade probability handling matures into active luck-cycling and calamity attraction, allowing abrupt momentum flips without granting full certainty or deterministic control.</p>';
    pathway._stats = buildStats(now, pathway._stats);
    await pathwaysDb.put(PATHWAY_KEY, JSON.stringify(pathway));

    const folder = await getOptionalJson(abilitiesDb, FOLDER_KEY);
    if (!folder) throw new Error('Monster folder not found.');

    folder.description = 'Sequence abilities for the Monster pathway (authored through Sequence 7).';
    folder.flags = folder.flags ?? {};
    folder.flags.lotm = {
      ...(folder.flags.lotm ?? {}),
      pathwayIdentifier: PATHWAY_IDENTIFIER,
      latestAuthoredSequence: 7
    };
    folder._stats = buildStats(now + 1, folder._stats);
    await abilitiesDb.put(FOLDER_KEY, JSON.stringify(folder));

    const legacyA = await getOptionalJson(abilitiesDb, LEGACY_A_KEY);
    const legacyB = await getOptionalJson(abilitiesDb, LEGACY_B_KEY);
    if (!legacyA) throw new Error('Legacy target lotmAbilityO9001 not found.');
    if (!legacyB) throw new Error('Legacy target lotmAbilityO8001 not found.');

    const legacyAHeader = '<h3>Legacy Upgrade (Sequence 7 - Potency)</h3>';
    const legacyAText =
      '<p>At Sequence 7, Calamity Instinct can snap harder when disaster is narrowly avoided. ' +
      'If your reaction changes the triggering outcome, choose one creature involved in the trigger; it takes psychic damage equal to <strong>Potency</strong> and cannot gain advantage on its next d20 test before the end of its next turn. ' +
      'This rider can trigger once per round.</p>';
    const legacyADescription = String(legacyA.system?.description?.value ?? '');
    if (!legacyADescription.includes(legacyAHeader)) {
      legacyA.system.description.value = `${legacyADescription}${legacyAHeader}${legacyAText}`;
    }
    legacyA._stats = buildStats(now + 2, legacyA._stats);
    await abilitiesDb.put(LEGACY_A_KEY, JSON.stringify(legacyA));

    const legacyBHeader = '<h3>Legacy Upgrade (Sequence 7 - Efficiency)</h3>';
    const legacyBText =
      '<p>At Sequence 7, Weighted Outcome loops more smoothly into active play. ' +
      'When a Weighted Outcome rider resolves on any creature, you may immediately move 5 feet without provoking opportunity attacks from that creature. ' +
      'If the rider was a favorable result for your side, reduce the next +1 upcast surcharge you pay on a Monster ability this round by 1 (minimum 0).</p>';
    const legacyBDescription = String(legacyB.system?.description?.value ?? '');
    if (!legacyBDescription.includes(legacyBHeader)) {
      legacyB.system.description.value = `${legacyBDescription}${legacyBHeader}${legacyBText}`;
    }
    legacyB._stats = buildStats(now + 3, legacyB._stats);
    await abilitiesDb.put(LEGACY_B_KEY, JSON.stringify(legacyB));

    const existing1 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_1_ID}`);
    const existing2 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_2_ID}`);
    const existing3 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_3_ID}`);

    const ability1 = buildAbilityDoc({
      id: ABILITY_1_ID,
      name: 'Lucky Pulse',
      description:
        '<p><strong>Baseline (0 Spirituality):</strong> Bonus action. Enter a 1-minute luck cycle. At the start of each of your turns, roll 1d6 to generate a pulse:</p><ul><li><strong>1-2 Dim Pulse:</strong> your first d20 test this turn takes <strong>-1</strong>, then choose one ally within 30 feet to gain <strong>+1</strong> on their next d20 test before your next turn.</li><li><strong>3-4 Even Pulse:</strong> your speed increases by 5 feet this turn and your first d20 test is unchanged.</li><li><strong>5-6 Bright Pulse:</strong> your first d20 test this turn gains <strong>+1d4</strong>.</li></ul><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> roll 2d6 and choose the pulse result each turn.</li><li><strong>+2 Spirituality:</strong> Bright Pulse bonus becomes <strong>+Potency</strong> and Dim Pulse penalty cannot reduce a roll below 1.</li><li><strong>+4 Spirituality:</strong> once per round when you roll Bright Pulse, one ally within 30 feet can immediately move 10 feet without provoking opportunity attacks.</li></ul><p><em>Counterplay:</em> anti-magic silence, restrained movement, and effects that replace d20 rolls reduce pulse value.</p><p><em>Corruption Hook:</em> if you repeatedly feed allies bad pulse turns while hoarding bright turns for vanity, gain 1 Corruption.</p>',
      img: 'icons/magic/time/clock-stopwatch-white-blue.webp',
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
      properties: ['somatic'],
      materials: {
        value: 'a coin scored with six notches',
        consumed: false,
        cost: 0,
        supply: 0
      }.value,
      identifier: 'lotm-monster-lucky-pulse',
      activityId: 'monsterSeq7Pulse01',
      now: now + 4,
      existing: existing1,
      sort: 2200200
    });

    const ability2 = buildAbilityDoc({
      id: ABILITY_2_ID,
      name: 'Jinx Bloom',
      description:
        '<p><strong>Baseline (1 Spirituality):</strong> Action. Choose one creature within 60 feet. It makes a Wisdom save. On failure, it gains a blooming jinx for 1 minute (save ends at end of each of its turns). While jinxed, the first time each round it rolls a d20, roll 1d4: on 1-3, it subtracts <strong>1d4</strong>; on 4, it instead gains <strong>+1</strong> (fickle backlash).</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> target one additional creature in range (separate saves).</li><li><strong>+2 Spirituality:</strong> when jinx subtracts from a roll, your next Monster ability this round gains <strong>+Potency</strong> on one numeric rider.</li><li><strong>+4 Spirituality:</strong> whenever a jinxed creature rolls the 4 backlash result, you may force a reroll of that 1d4 once (must use new result).</li></ul><p><em>Counterplay:</em> luck-anchoring rituals, charm resistance/immunity, and line-of-sight breaks can suppress jinx spread.</p><p><em>Corruption Hook:</em> if you jinx harmless bystanders to entertain yourself, gain 1 Corruption.</p>',
      img: 'icons/magic/death/projectile-skull-flame-teal.webp',
      activationType: 'action',
      durationValue: '1',
      durationUnits: 'minute',
      targetType: 'creature',
      targetCount: '1',
      targetSpecial: '',
      rangeUnits: 'ft',
      rangeValue: '60',
      rangeSpecial: '',
      school: 'enc',
      properties: ['vocal', 'somatic'],
      materials: 'a withered clover petal',
      identifier: 'lotm-monster-jinx-bloom',
      activityId: 'monsterSeq7Jinx02',
      now: now + 5,
      existing: existing2,
      sort: 2200201
    });

    const ability3 = buildAbilityDoc({
      id: ABILITY_3_ID,
      name: 'Sudden Reversal',
      description:
        '<p><strong>Baseline (1 Spirituality):</strong> Reaction when a creature you can see within 60 feet succeeds on an attack roll, ability check, or saving throw. Roll 1d6 fate die. On 1-3, no change. On 4-6, force that creature to reroll and use the lower result. If the reroll fails, one ally you can see within 30 feet gains <strong>+1d4</strong> on its next d20 test before end of your next turn.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> the fate die becomes 1d8 (reversal on 4-8).</li><li><strong>+2 Spirituality:</strong> if reversal occurs, choose one creature affected by the original action; it may move 10 feet without provoking opportunity attacks from the triggering creature.</li><li><strong>+4 Spirituality:</strong> if reversal occurs, the triggering creature cannot take reactions until the start of its next turn.</li></ul><p><em>Counterplay:</em> effects that ignore rerolls, legendary resistance-style overrides, and hidden triggers outside line of sight reduce reversal reliability.</p><p><em>Corruption Hook:</em> if you trigger reversals in social scenes purely to humiliate innocents, gain 1 Corruption.</p>',
      img: 'icons/magic/time/arrows-circling-green.webp',
      activationType: 'reaction',
      durationValue: '',
      durationUnits: 'inst',
      targetType: 'creature',
      targetCount: '1',
      targetSpecial: 'creature you can see that just succeeded on a d20 test',
      rangeUnits: 'ft',
      rangeValue: '60',
      rangeSpecial: '',
      school: 'div',
      properties: ['somatic'],
      materials: 'two knucklebones tied by red thread',
      identifier: 'lotm-monster-sudden-reversal',
      activityId: 'monsterSeq7Rev03',
      now: now + 6,
      existing: existing3,
      sort: 2200202
    });

    await abilitiesDb.put(`!items!${ABILITY_1_ID}`, JSON.stringify(ability1));
    await abilitiesDb.put(`!items!${ABILITY_2_ID}`, JSON.stringify(ability2));
    await abilitiesDb.put(`!items!${ABILITY_3_ID}`, JSON.stringify(ability3));

    const verifyPathway = await getOptionalJson(pathwaysDb, PATHWAY_KEY);
    const verifyFolder = await getOptionalJson(abilitiesDb, FOLDER_KEY);
    const verifyLegacyA = await getOptionalJson(abilitiesDb, LEGACY_A_KEY);
    const verifyLegacyB = await getOptionalJson(abilitiesDb, LEGACY_B_KEY);
    const verify1 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_1_ID}`);
    const verify2 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_2_ID}`);
    const verify3 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_3_ID}`);

    console.log(JSON.stringify({
      pathwayKey: PATHWAY_KEY,
      pathwayIdentifier: verifyPathway?.system?.identifier,
      folderKey: FOLDER_KEY,
      folderFlags: verifyFolder?.flags?.lotm,
      legacyUpdated: [
        { key: LEGACY_A_KEY, applied: String(verifyLegacyA?.system?.description?.value ?? '').includes(legacyAHeader) },
        { key: LEGACY_B_KEY, applied: String(verifyLegacyB?.system?.description?.value ?? '').includes(legacyBHeader) }
      ],
      abilitiesWritten: [`!items!${ABILITY_1_ID}`, `!items!${ABILITY_2_ID}`, `!items!${ABILITY_3_ID}`],
      abilityReadBack: [
        { id: verify1?._id, name: verify1?.name, sourceClass: verify1?.system?.sourceClass, identifier: verify1?.system?.identifier, grantedSequence: verify1?.flags?.lotm?.grantedSequence, level: verify1?.system?.level, folder: verify1?.folder },
        { id: verify2?._id, name: verify2?.name, sourceClass: verify2?.system?.sourceClass, identifier: verify2?.system?.identifier, grantedSequence: verify2?.flags?.lotm?.grantedSequence, level: verify2?.system?.level, folder: verify2?.folder },
        { id: verify3?._id, name: verify3?.name, sourceClass: verify3?.system?.sourceClass, identifier: verify3?.system?.identifier, grantedSequence: verify3?.flags?.lotm?.grantedSequence, level: verify3?.system?.level, folder: verify3?.folder }
      ]
    }, null, 2));
  } finally {
    await pathwaysDb.close();
    await abilitiesDb.close();
  }
})();