const { ClassicLevel } = require('./node-tools/node_modules/classic-level');

const CORE_VERSION = '13.351';
const SYSTEM_ID = 'lotm';
const SYSTEM_VERSION = '5.2.6';
const MODIFIER = '0000000000000000';

const PATHWAY_NAME = 'Savant';
const PATHWAY_IDENTIFIER = 'lotm-savant';
const DEFAULT_PATHWAY_ID = 'lotmPathway00015';
const FOLDER_ID = 'UYUzB1Ws2OvdbFzG';

const LEGACY_A_ID = 'lotmAbilityT7002';
const LEGACY_B_ID = 'lotmAbilityT8001';

const ABILITY_1_ID = 'lotmAbilityT6001';
const ABILITY_2_ID = 'lotmAbilityT6002';
const ABILITY_3_ID = 'lotmAbilityT6003';

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

async function findPathwayByIdentifier(db, identifier) {
  for await (const [key, raw] of db.iterator({ gte: '!items!', lt: '!items!~' })) {
    const doc = JSON.parse(raw);
    if (doc?.system?.identifier === identifier) {
      return { key, doc };
    }
  }
  return null;
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
      level: 3,
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
          durationUnits,
          targetUnits: 'ft'
        })
      },
      identifier,
      method: 'spell',
      prepared: 1,
      spiritualityCost: null,
      sourceClass: PATHWAY_IDENTIFIER
    },
    effects: [],
    folder: FOLDER_ID,
    flags: {
      dnd5e: {
        riders: {
          activity: [],
          effect: []
        }
      },
      lotm: {
        sourceBook: 'LoTM Core',
        grantedSequence: 6
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
    const locatedPathway = await findPathwayByIdentifier(pathwaysDb, PATHWAY_IDENTIFIER);
    const pathwayId = locatedPathway?.doc?._id ?? DEFAULT_PATHWAY_ID;
    const pathwayKey = locatedPathway?.key ?? `!items!${pathwayId}`;
    const pathway = locatedPathway?.doc ?? (await getOptionalJson(pathwaysDb, pathwayKey));
    if (!pathway) throw new Error(`Savant pathway (${pathwayKey}) not found.`);

    pathway.system = pathway.system ?? {};
    pathway.system.description = pathway.system.description ?? { value: '', chat: '' };
    pathway.system.description.value =
      '<p><strong>Pathway Vector:</strong> engineered problem-solving through technical literacy, memory discipline, and precise process control under pressure.</p>' +
      '<p><strong>Sequence 9 Package (Total Budget 2):</strong> Mechanics Comprehension, Precision Recall.</p>' +
      '<p><strong>Sequence 8 Package (Gain Budget +3):</strong> Adaption, Strata Appraisal, plus one legacy potency upgrade to Precision Recall.</p>' +
      '<p><strong>Sequence 7 Package (Gain Budget +13):</strong> Strengthened Knowledge, Ruin Route Solver, Memory Indexing, plus two legacy upgrades (Adaption and Strata Appraisal).</p>' +
      '<p><strong>Sequence 6 Package (Gain Budget +9):</strong> Manufacturing, Artifact Calibration, Ritual Fixture Integration, plus two legacy upgrades (Ruin Route Solver and Adaption).</p>' +
      '<p><strong>Sequence 5-0 Status:</strong> Pending authoring in later sequence-focused runs.</p>' +
      '<p><strong>Continuity Anchor:</strong> At Sequence 6 (Artisan, Machinery Specialist), Savant shifts from appraisal execution to direct creation: engineered manufacturing, controlled artifact behavior, and itemized ritual deployment.</p>';
    pathway._stats = buildStats(now, pathway._stats);
    await pathwaysDb.put(pathwayKey, JSON.stringify(pathway));

    const folderKey = `!folders!${FOLDER_ID}`;
    const folder = await getOptionalJson(abilitiesDb, folderKey);
    if (!folder) throw new Error(`Savant folder (${FOLDER_ID}) not found.`);

    folder.name = PATHWAY_NAME;
    folder.description = 'Sequence abilities for the Savant pathway (authored through Sequence 6).';
    folder.flags = folder.flags ?? {};
    folder.flags.lotm = {
      ...(folder.flags.lotm ?? {}),
      pathwayIdentifier: PATHWAY_IDENTIFIER,
      latestAuthoredSequence: 6
    };
    folder._stats = buildStats(now + 1, folder._stats);
    await abilitiesDb.put(folderKey, JSON.stringify(folder));

    const legacyAKey = `!items!${LEGACY_A_ID}`;
    const legacyBKey = `!items!${LEGACY_B_ID}`;
    const legacyA = await getOptionalJson(abilitiesDb, legacyAKey);
    const legacyB = await getOptionalJson(abilitiesDb, legacyBKey);
    if (!legacyA) throw new Error(`Legacy target ${LEGACY_A_ID} not found.`);
    if (!legacyB) throw new Error(`Legacy target ${LEGACY_B_ID} not found.`);

    const legacyAHeader = '<h3>Legacy Upgrade (Sequence 6 - Potency)</h3>';
    const legacyAText =
      '<p>At Sequence 6, Ruin Route Solver can convert route certainty into suppression force. ' +
      'When a supported ally follows a solved segment, that ally\'s first anti-trap or anti-control save on the route gains <strong>+Potency</strong> instead of +1. ' +
      'Also, if the route prevents a trigger this round, the nearest hostile construct or mechanism within 20 feet suffers <strong>-Potency</strong> on its next attack or contest before end of turn.</p>';
    const legacyADescription = String(legacyA.system?.description?.value ?? '');
    if (!legacyADescription.includes(legacyAHeader)) {
      legacyA.system.description.value = `${legacyADescription}${legacyAHeader}${legacyAText}`;
    }
    legacyA._stats = buildStats(now + 2, legacyA._stats);
    await abilitiesDb.put(legacyAKey, JSON.stringify(legacyA));

    const legacyBHeader = '<h3>Legacy Upgrade (Sequence 6 - Efficiency)</h3>';
    const legacyBText =
      '<p>At Sequence 6, Adaption can be provisioned as prebuilt field modules. ' +
      'Once per short rest, you may apply Adaption to one ally within 30 feet without spending Spirituality if that ally is using an engineered tool, weapon, or mechanism you prepared this scene. ' +
      'When this free provision triggers, protocol duration is set to 1 minute and includes one immediate protocol swap at no action cost.</p>';
    const legacyBDescription = String(legacyB.system?.description?.value ?? '');
    if (!legacyBDescription.includes(legacyBHeader)) {
      legacyB.system.description.value = `${legacyBDescription}${legacyBHeader}${legacyBText}`;
    }
    legacyB._stats = buildStats(now + 3, legacyB._stats);
    await abilitiesDb.put(legacyBKey, JSON.stringify(legacyB));

    const existingAbility1 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_1_ID}`);
    const existingAbility2 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_2_ID}`);
    const existingAbility3 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_3_ID}`);

    const ability1 = buildAbilityDoc({
      id: ABILITY_1_ID,
      name: 'Manufacturing',
      description:
        '<p><strong>Baseline (1 Spirituality):</strong> Action. Execute a fast manufacturing cycle and choose one prototype that lasts 10 minutes:</p><ul><li><strong>Tool Prototype:</strong> holder gains +Potency on one tool check each round.</li><li><strong>Armament Prototype:</strong> one weapon, ammunition stack, or implement becomes mystical; first qualifying hit each round deals +1 force or lightning damage.</li><li><strong>Safeguard Prototype:</strong> one worn component grants +1 AC against trap, construct, or ritual fixture attacks.</li></ul><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> manufacture one additional prototype or assign a prototype to one ally within 30 feet.</li><li><strong>+2 Spirituality:</strong> duration becomes 1 hour, and all numeric prototype bonuses become +Potency.</li><li><strong>+4 Spirituality:</strong> create a short-lived semi-sealed artifact with 3 charges; each charge can trigger one manufactured prototype effect as a reaction.</li></ul><p><em>Counterplay:</em> anti-magic pulses, prototype tampering, and unstable materials can degrade outputs before duration ends.</p><p><em>Corruption Hook:</em> if you knowingly deploy untested prototypes in civilian zones for data harvesting, gain 1 Corruption.</p>',
      img: 'icons/skills/trades/smithing-anvil-silver-red.webp',
      activationType: 'action',
      durationValue: '10',
      durationUnits: 'minute',
      targetType: 'object',
      targetCount: '1',
      targetSpecial: 'prototype recipient, weapon system, or crafted component',
      rangeUnits: 'ft',
      rangeValue: '30',
      rangeSpecial: '',
      school: 'trs',
      properties: ['somatic', 'material'],
      materials: 'a gear blank, ignition wire, and one measured catalyst dose',
      identifier: 'lotm-savant-manufacturing',
      activityId: 'savantSeq6ManAct01',
      now: now + 4,
      existing: existingAbility1,
      sort: 1200300
    });

    const ability2 = buildAbilityDoc({
      id: ABILITY_2_ID,
      name: 'Artifact Calibration',
      description:
        '<p><strong>Baseline (0 Spirituality):</strong> Action. Calibrate one mystical item, sealed artifact, or engineered relic within 30 feet for 10 minutes. Choose one mode:</p><ul><li><strong>Stability Mode:</strong> reduce one backlash/negative rider severity by Potency (GM adjudicated, minimum minor consequence remains).</li><li><strong>Throughput Mode:</strong> increase one numeric output on first activation each round by +1 (damage, DC, or check bonus).</li><li><strong>Safety Mode:</strong> first failed activation check each round may be rerolled.</li></ul><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> apply a second mode to the same item.</li><li><strong>+2 Spirituality:</strong> mode values that use +1 become +Potency, and calibration range increases to 60 feet.</li><li><strong>+4 Spirituality:</strong> bind a controlled downside channel; when calibrated output exceeds safe threshold, redirect backlash into yourself as flat Spirituality drain (no HP damage) once per round.</li></ul><p><em>Counterplay:</em> uniqueness-class artifacts, hostile ownership seals, and status gaps can override or corrupt calibration assumptions.</p><p><em>Corruption Hook:</em> if you mask critical artifact hazards from your team to preserve control over access, gain 1 Corruption.</p>',
      img: 'icons/sundries/documents/document-seal-blue.webp',
      activationType: 'action',
      durationValue: '10',
      durationUnits: 'minute',
      targetType: 'object',
      targetCount: '1',
      targetSpecial: 'mystical item, sealed artifact, or engineered relic',
      rangeUnits: 'ft',
      rangeValue: '30',
      rangeSpecial: '',
      school: 'abj',
      properties: ['vocal', 'somatic', 'material'],
      materials: 'calibration lens, copper stylus, and one tuning sigil',
      identifier: 'lotm-savant-artifact-calibration',
      activityId: 'savantSeq6CalAct02',
      now: now + 5,
      existing: existingAbility2,
      sort: 1200301
    });

    const ability3 = buildAbilityDoc({
      id: ABILITY_3_ID,
      name: 'Ritual Fixture Integration',
      description:
        '<p><strong>Baseline (0 Spirituality):</strong> Action. Integrate one ritual subroutine into a handheld or mounted fixture for 1 hour. Choose one integration:</p><ul><li><strong>Messenger Port:</strong> fixture can send one bounded phrase to a known contact or bound spirit within ritual limits.</li><li><strong>Anchor Port:</strong> fixture marks a 10-foot zone; allies in zone gain +1 on checks against fear, confusion, or spiritual noise.</li><li><strong>Trigger Port:</strong> one Savant ability with activation time action may be primed; next use within 1 hour can be activated as bonus action.</li></ul><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> add one extra port on same fixture.</li><li><strong>+2 Spirituality:</strong> zone radius becomes 20 feet and numeric +1 bonuses become +Potency.</li><li><strong>+4 Spirituality:</strong> network two fixtures within 120 feet; when one port triggers, you may mirror a reduced effect at the second fixture once per round.</li></ul><p><em>Counterplay:</em> anti-ritual fields, line-break disruptions, and fixture destruction sever integrations immediately.</p><p><em>Corruption Hook:</em> if you covertly hardwire ritual fixtures to surveil allies without consent, gain 1 Corruption.</p>',
      img: 'icons/magic/symbols/runes-star-pentagon-orange-purple.webp',
      activationType: 'action',
      durationValue: '1',
      durationUnits: 'hour',
      targetType: 'object',
      targetCount: '1',
      targetSpecial: 'handheld or mounted fixture prepared for ritual ports',
      rangeUnits: 'ft',
      rangeValue: '30',
      rangeSpecial: '',
      school: 'enc',
      properties: ['vocal', 'somatic', 'material'],
      materials: 'etched relay plate, ritual ink, and a stable fastener',
      identifier: 'lotm-savant-ritual-fixture-integration',
      activityId: 'savantSeq6FixAct03',
      now: now + 6,
      existing: existingAbility3,
      sort: 1200302
    });

    await abilitiesDb.put(`!items!${ABILITY_1_ID}`, JSON.stringify(ability1));
    await abilitiesDb.put(`!items!${ABILITY_2_ID}`, JSON.stringify(ability2));
    await abilitiesDb.put(`!items!${ABILITY_3_ID}`, JSON.stringify(ability3));

    const verifyPathway = await getOptionalJson(pathwaysDb, pathwayKey);
    const verifyFolder = await getOptionalJson(abilitiesDb, folderKey);
    const verifyLegacyA = await getOptionalJson(abilitiesDb, legacyAKey);
    const verifyLegacyB = await getOptionalJson(abilitiesDb, legacyBKey);
    const verifyAbility1 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_1_ID}`);
    const verifyAbility2 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_2_ID}`);
    const verifyAbility3 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_3_ID}`);

    const legacyAApplied = String(verifyLegacyA?.system?.description?.value ?? '').includes(legacyAHeader);
    const legacyBApplied = String(verifyLegacyB?.system?.description?.value ?? '').includes(legacyBHeader);

    console.log(
      JSON.stringify(
        {
          pathwayKey,
          pathwayId: verifyPathway?._id,
          pathwayIdentifier: verifyPathway?.system?.identifier,
          folderKey,
          folderId: verifyFolder?._id,
          folderFlags: verifyFolder?.flags?.lotm,
          legacyUpdated: [
            { key: legacyAKey, applied: legacyAApplied },
            { key: legacyBKey, applied: legacyBApplied }
          ],
          abilityKeys: [`!items!${ABILITY_1_ID}`, `!items!${ABILITY_2_ID}`, `!items!${ABILITY_3_ID}`],
          abilityReadBack: [
            {
              _id: verifyAbility1?._id,
              name: verifyAbility1?.name,
              folder: verifyAbility1?.folder,
              sourceClass: verifyAbility1?.system?.sourceClass,
              grantedSequence: verifyAbility1?.flags?.lotm?.grantedSequence,
              level: verifyAbility1?.system?.level
            },
            {
              _id: verifyAbility2?._id,
              name: verifyAbility2?.name,
              folder: verifyAbility2?.folder,
              sourceClass: verifyAbility2?.system?.sourceClass,
              grantedSequence: verifyAbility2?.flags?.lotm?.grantedSequence,
              level: verifyAbility2?.system?.level
            },
            {
              _id: verifyAbility3?._id,
              name: verifyAbility3?.name,
              folder: verifyAbility3?.folder,
              sourceClass: verifyAbility3?.system?.sourceClass,
              grantedSequence: verifyAbility3?.flags?.lotm?.grantedSequence,
              level: verifyAbility3?.system?.level
            }
          ]
        },
        null,
        2
      )
    );
  } finally {
    await pathwaysDb.close();
    await abilitiesDb.close();
  }
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
