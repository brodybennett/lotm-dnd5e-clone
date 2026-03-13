const { ClassicLevel } = require('./node-tools/node_modules/classic-level');

const CORE_VERSION = '13.351';
const SYSTEM_ID = 'lotm';
const SYSTEM_VERSION = '5.2.6';
const MODIFIER = '0000000000000000';

const PATHWAY_NAME = 'Savant';
const PATHWAY_IDENTIFIER = 'lotm-savant';
const DEFAULT_PATHWAY_ID = 'lotmPathway00015';
const FOLDER_ID = 'UYUzB1Ws2OvdbFzG';

const LEGACY_ABILITY_ID = 'lotmAbilityT9002';
const ABILITY_1_ID = 'lotmAbilityT8001';
const ABILITY_2_ID = 'lotmAbilityT8002';

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
      level: 1,
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
        grantedSequence: 8
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
    if (!pathway) {
      throw new Error(`Savant pathway (${pathwayKey}) not found. Author Sequence 9 first.`);
    }

    pathway.system = pathway.system ?? {};
    pathway.system.description = pathway.system.description ?? { value: '', chat: '' };
    pathway.system.description.value =
      '<p><strong>Pathway Vector:</strong> engineered problem-solving through technical literacy, memory discipline, and precise process control under pressure.</p>' +
      '<p><strong>Sequence 9 Package (Total Budget 2):</strong> Mechanics Comprehension, Precision Recall.</p>' +
      '<p><strong>Sequence 8 Package (Gain Budget +3):</strong> Adaption, Strata Appraisal, plus one legacy potency upgrade to Precision Recall.</p>' +
      '<p><strong>Sequence 7-0 Status:</strong> Pending authoring in later sequence-focused runs.</p>' +
      '<p><strong>Continuity Anchor:</strong> At Sequence 8 (Archaeologist), Savant broadens from workshop diagnostics into field adaptation and ruin-context inference while reinforcing disciplined memory use.</p>';
    pathway._stats = buildStats(now, pathway._stats);
    await pathwaysDb.put(pathwayKey, JSON.stringify(pathway));

    const folderKey = `!folders!${FOLDER_ID}`;
    const folder = await getOptionalJson(abilitiesDb, folderKey);
    if (!folder) throw new Error(`Savant folder (${FOLDER_ID}) not found.`);

    folder.name = PATHWAY_NAME;
    folder.description = 'Sequence abilities for the Savant pathway (authored through Sequence 8).';
    folder.flags = folder.flags ?? {};
    folder.flags.lotm = {
      ...(folder.flags.lotm ?? {}),
      pathwayIdentifier: PATHWAY_IDENTIFIER,
      latestAuthoredSequence: 8
    };
    folder._stats = buildStats(now + 1, folder._stats);
    await abilitiesDb.put(folderKey, JSON.stringify(folder));

    const legacyKey = `!items!${LEGACY_ABILITY_ID}`;
    const legacyAbility = await getOptionalJson(abilitiesDb, legacyKey);
    if (!legacyAbility) {
      throw new Error(`Legacy target ${LEGACY_ABILITY_ID} not found. Sequence 9 package is required first.`);
    }

    const legacyHeader = '<h3>Legacy Upgrade (Sequence 8 - Potency)</h3>';
    const legacyText =
      '<p>At Sequence 8, Precision Recall gains archaeological load-bearing strength. ' +
      'When you use <strong>Reconstruct</strong>, the rider increases from <strong>+1</strong> to <strong>+Potency</strong> ' +
      'for checks or contests tied to repeated movement patterns, maintenance cycles, or ruin-site procedures. ' +
      'Also, whenever Recall is used on a historical mechanism, survival trace, or mysticism inscription, ' +
      'you gain +1d4 on one related follow-up <strong>History</strong>, <strong>Survival</strong>, or <strong>Mysticism</strong> check before end of turn.</p>';
    const legacyDescription = String(legacyAbility.system?.description?.value ?? '');
    if (!legacyDescription.includes(legacyHeader)) {
      legacyAbility.system.description.value = `${legacyDescription}${legacyHeader}${legacyText}`;
    }
    legacyAbility._stats = buildStats(now + 2, legacyAbility._stats);
    await abilitiesDb.put(legacyKey, JSON.stringify(legacyAbility));

    const existingAbility1 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_1_ID}`);
    const existingAbility2 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_2_ID}`);

    const ability1 = buildAbilityDoc({
      id: ABILITY_1_ID,
      name: 'Adaption',
      description:
        '<p><strong>Baseline (0 Spirituality):</strong> Bonus action. Enter an engineered adaptation cycle for 1 minute and select one protocol:</p><ul><li><strong>Structural Protocol:</strong> advantage on checks/saves against collapse, falling debris, pressure plates, and unstable flooring.</li><li><strong>Climatic Protocol:</strong> ignore nonmagical difficult terrain caused by sand, mud, snow, or rubble, and reduce one environmental hazard damage instance each round by <strong>Potency</strong>.</li><li><strong>Procedural Protocol:</strong> when operating an unfamiliar mechanism or tool workflow, treat non-proficiency as half proficiency (rounded up), then add +1 to the first related check each round.</li></ul><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> extend one selected protocol to an ally within 30 feet for the same duration.</li><li><strong>+2 Spirituality:</strong> run two protocols simultaneously.</li><li><strong>+4 Spirituality:</strong> once per round when your active protocol prevents or reduces an adverse effect, move up to 10 feet without provoking opportunity attacks from hazards or constructs affected by that protocol.</li></ul><p><em>Counterplay:</em> rapidly changing mixed hazards, deliberate false signaling, and cursed terrain can force protocol mismatch and reduce coverage.</p><p><em>Corruption Hook:</em> if you intentionally force civilians through known unsafe routes to field-test adaptation limits, gain 1 Corruption.</p>',
      img: 'icons/magic/control/silhouette-hold-beam-blue.webp',
      activationType: 'bonus',
      durationValue: '1',
      durationUnits: 'minute',
      targetType: 'self',
      targetCount: '1',
      targetSpecial: '',
      rangeUnits: 'self',
      rangeValue: null,
      rangeSpecial: '',
      school: 'trs',
      properties: ['somatic', 'material'],
      materials: 'a brass caliper and folded hazard card',
      identifier: 'lotm-savant-adaption',
      activityId: 'savantSeq8AdpAct01',
      now: now + 3,
      existing: existingAbility1,
      sort: 1200100
    });

    const ability2 = buildAbilityDoc({
      id: ABILITY_2_ID,
      name: 'Strata Appraisal',
      description:
        '<p><strong>Baseline (0 Spirituality):</strong> Action. Run a three-layer appraisal on one ruin surface, artifact, or relic mechanism within 60 feet.</p><ol><li><strong>Layer Trace:</strong> determine approximate age band and most recent tamper window.</li><li><strong>Function Infer:</strong> identify one practical use case, failure mode, or maintenance sequence.</li><li><strong>Context Bridge:</strong> choose one creature (including yourself); it gains +1d4 on its next <strong>History</strong>, <strong>Survival</strong>, or <strong>Mysticism</strong> check tied to that target within 10 minutes.</li></ol><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> include one additional target within 20 feet of the first, or increase range to 120 feet.</li><li><strong>+2 Spirituality:</strong> ask one bounded technical question about hidden compartments, load paths, or trigger linkages; gain +Potency on one subsequent disable/open/route check against that same target.</li><li><strong>+4 Spirituality:</strong> compile a temporary site model for 10 minutes; allies who can hear your briefing gain +1 to AC and saving throws against traps or environmental hazards you have appraised in the modeled area.</li></ul><p><em>Counterplay:</em> fabricated relic layers, anti-divination coatings, and intentionally displaced strata can produce partial or incorrect context.</p><p><em>Corruption Hook:</em> if you suppress valid appraisal findings to monopolize ruin salvage and endanger allies, gain 1 Corruption.</p>',
      img: 'icons/skills/trades/academics-investigation-puzzles.webp',
      activationType: 'action',
      durationValue: '10',
      durationUnits: 'minute',
      targetType: 'object',
      targetCount: '1',
      targetSpecial: 'ruin surface, artifact, relic mechanism, or excavation trace',
      rangeUnits: 'ft',
      rangeValue: '60',
      rangeSpecial: '',
      school: 'div',
      properties: ['vocal', 'somatic', 'material'],
      materials: 'a survey string and graphite fragment',
      identifier: 'lotm-savant-strata-appraisal',
      activityId: 'savantSeq8StrAct02',
      now: now + 4,
      existing: existingAbility2,
      sort: 1200101
    });

    await abilitiesDb.put(`!items!${ABILITY_1_ID}`, JSON.stringify(ability1));
    await abilitiesDb.put(`!items!${ABILITY_2_ID}`, JSON.stringify(ability2));

    const verifyPathway = await getOptionalJson(pathwaysDb, pathwayKey);
    const verifyFolder = await getOptionalJson(abilitiesDb, folderKey);
    const verifyLegacy = await getOptionalJson(abilitiesDb, legacyKey);
    const verifyAbility1 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_1_ID}`);
    const verifyAbility2 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_2_ID}`);

    const legacyApplied = String(verifyLegacy?.system?.description?.value ?? '').includes(legacyHeader);

    console.log(
      JSON.stringify(
        {
          pathwayKey,
          pathwayId: verifyPathway?._id,
          pathwayIdentifier: verifyPathway?.system?.identifier,
          folderKey,
          folderId: verifyFolder?._id,
          folderFlags: verifyFolder?.flags?.lotm,
          legacyKey,
          legacyApplied,
          abilityKeys: [`!items!${ABILITY_1_ID}`, `!items!${ABILITY_2_ID}`],
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
