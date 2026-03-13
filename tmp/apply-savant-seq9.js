const { ClassicLevel } = require('./node-tools/node_modules/classic-level');

const CORE_VERSION = '13.351';
const SYSTEM_ID = 'lotm';
const SYSTEM_VERSION = '5.2.6';
const MODIFIER = '0000000000000000';

const PATHWAY_NAME = 'Savant';
const PATHWAY_IDENTIFIER = 'lotm-savant';
const DEFAULT_PATHWAY_ID = 'lotmPathway00015';
const FOLDER_ID = 'UYUzB1Ws2OvdbFzG';
const ABILITY_1_ID = 'lotmAbilityT9001';
const ABILITY_2_ID = 'lotmAbilityT9002';

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

function buildPathwayDoc({ pathwayId, existing, now }) {
  return {
    _id: pathwayId,
    name: PATHWAY_NAME,
    type: 'class',
    img: 'icons/skills/trades/smithing-anvil-silver-red.webp',
    system: {
      description: {
        value: '<p><strong>Pathway Vector:</strong> engineered problem-solving through technical literacy, memory discipline, and precise process control under pressure.</p><p><strong>Sequence 9 Package (Total Budget 2):</strong> Mechanics Comprehension, Precision Recall.</p><p><strong>Sequence 8-0 Status:</strong> Pending authoring in later sequence-focused runs.</p><p><strong>Continuity Anchor:</strong> Sequence 9 (Savant) establishes a baseline of structured analysis and reproducible craft that scales toward Sequence 8 (Archaeologist) through broader systems insight.</p>',
        chat: ''
      },
      source: {
        custom: '',
        rules: '2024',
        revision: 1,
        license: '',
        book: 'LoTM Core'
      },
      startingEquipment: [],
      identifier: PATHWAY_IDENTIFIER,
      levels: 1,
      advancement: [],
      spellcasting: {
        progression: 'full',
        ability: 'int',
        preparation: {
          formula: ''
        }
      },
      wealth: '4d4*10',
      primaryAbility: {
        value: ['int'],
        all: false
      },
      hd: {
        denomination: 'd8',
        spent: 0,
        additional: ''
      }
    },
    effects: [],
    folder: null,
    flags: {
      lotm: {
        sourceBook: 'LoTM Core'
      }
    },
    _stats: buildStats(now, existing?._stats),
    sort: 1500000,
    ownership: {
      default: 0
    }
  };
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
      level: 0,
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
        grantedSequence: 9
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
    const existingByIdentifier = await findPathwayByIdentifier(pathwaysDb, PATHWAY_IDENTIFIER);
    const pathwayId = existingByIdentifier?.doc?._id ?? DEFAULT_PATHWAY_ID;
    const pathwayKey = existingByIdentifier?.key ?? `!items!${pathwayId}`;
    const existingPathway =
      existingByIdentifier?.doc ?? (await getOptionalJson(pathwaysDb, pathwayKey));

    const pathwayDoc = buildPathwayDoc({ pathwayId, existing: existingPathway, now });
    await pathwaysDb.put(pathwayKey, JSON.stringify(pathwayDoc));

    const folderKey = `!folders!${FOLDER_ID}`;
    const existingFolder = await getOptionalJson(abilitiesDb, folderKey);
    const folderDoc = {
      ...(existingFolder ?? {
        name: PATHWAY_NAME,
        type: 'Item',
        folder: null,
        sorting: 'a',
        sort: 1200000,
        _id: FOLDER_ID,
        description: '',
        color: null,
        flags: {}
      }),
      name: PATHWAY_NAME,
      description: 'Sequence abilities for the Savant pathway.',
      flags: {
        ...(existingFolder?.flags ?? {}),
        lotm: {
          ...(existingFolder?.flags?.lotm ?? {}),
          pathwayIdentifier: PATHWAY_IDENTIFIER,
          latestAuthoredSequence: 9
        }
      },
      _stats: buildStats(now + 1, existingFolder?._stats)
    };
    await abilitiesDb.put(folderKey, JSON.stringify(folderDoc));

    const existingAbility1 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_1_ID}`);
    const existingAbility2 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_2_ID}`);

    const ability1 = buildAbilityDoc({
      id: ABILITY_1_ID,
      name: 'Mechanics Comprehension',
      description:
        '<p><strong>Baseline (0 Spirituality):</strong> Action. Execute a 3-step diagnostic on one machine, trap, construct, ritual array, or sealed artifact within 30 feet.</p><ol><li><strong>Probe:</strong> ask one bounded technical question (trigger condition, power source, failure point, or maintenance path); the GM provides one precise answer.</li><li><strong>Model:</strong> choose yourself or one ally; that creature gains +1d4 on its next Arcana, Investigation, Tinker\'s Tools, or relevant tool check against the analyzed target within 10 minutes.</li><li><strong>Apply:</strong> if that check succeeds, the same creature gains +1 on the next opposed check or save DC it applies through that target\'s subsystem before the end of its next turn.</li></ol><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> range increases to 60 feet, and the Model bonus becomes +Potency instead of +1d4.</li><li><strong>+2 Spirituality:</strong> ask one additional bounded technical question and ignore one source of disadvantage on the enabled check (poor visibility, cramped access, or unstable footing).</li><li><strong>+4 Spirituality:</strong> maintain a live blueprint for 1 minute; once per round, you or one ally can reroll one failed analyze/disable/operate check on that same target.</li></ul><p><em>Counterplay:</em> deliberately randomized mechanisms, layered false components, and anti-analysis wards can output misleading or partial diagnostics.</p><p><em>Corruption Hook:</em> if you knowingly sabotage civilian safety systems for convenience, gain 1 Corruption.</p>',
      img: 'icons/sundries/gaming/playing-cards-blue.webp',
      activationType: 'action',
      durationValue: '10',
      durationUnits: 'minute',
      targetType: 'object',
      targetCount: '1',
      targetSpecial: 'machine, trap, construct, ritual array, or sealed artifact under analysis',
      rangeUnits: 'ft',
      rangeValue: '30',
      rangeSpecial: '',
      school: 'div',
      properties: ['vocal', 'somatic', 'material'],
      materials: 'a folded calibration slate and a graphite stylus',
      identifier: 'lotm-savant-mechanics-comprehension',
      activityId: 'savantSeq9DiagAct01',
      now: now + 2,
      existing: existingAbility1,
      sort: 1200000
    });

    const ability2 = buildAbilityDoc({
      id: ABILITY_2_ID,
      name: 'Precision Recall',
      description:
        '<p><strong>Baseline (0 Spirituality):</strong> Bonus action. Allocate cognitive registers for 10 minutes.</p><ul><li><strong>Capture:</strong> record one observed procedure, conversation, symbol chain, or movement pattern from the current scene.</li><li><strong>Recall:</strong> replay one captured record with exact wording, geometry, and timing; gain advantage on one Intelligence check or tool check that uses the replayed data before the end of your next turn.</li><li><strong>Reconstruct:</strong> after you observe a creature or mechanism for at least 1 round, gain +1 on your next attack roll, save DC, or contested check against its repeated pattern.</li></ul><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> maintain two captures at once and extend duration to 1 hour.</li><li><strong>+2 Spirituality:</strong> when you brief allies using a captured record, up to your proficiency bonus allies gain +1d4 on their first relevant check or attack in the next minute.</li><li><strong>+4 Spirituality:</strong> run predictive iteration for 1 minute; once per round after a studied target acts, use your reaction to either move up to 10 feet without provoking opportunity attacks from that target or impose -Potency on that target\'s next attack roll or contested check against you.</li></ul><p><em>Counterplay:</em> sensory overload, chaotic multi-source noise, and deliberate pattern randomization reduce replay fidelity.</p><p><em>Corruption Hook:</em> if you knowingly falsify recalled evidence to frame another person, gain 1 Corruption.</p>',
      img: 'icons/sundries/documents/document-symbol-eye.webp',
      activationType: 'bonus',
      durationValue: '10',
      durationUnits: 'minute',
      targetType: 'self',
      targetCount: '1',
      targetSpecial: 'self memory architecture and one captured procedure at a time',
      rangeUnits: 'self',
      rangeValue: null,
      rangeSpecial: '',
      school: 'trs',
      properties: ['somatic', 'material'],
      materials: 'an indexed notebook tab or etched mnemonic token',
      identifier: 'lotm-savant-precision-recall',
      activityId: 'savantSeq9MemAct02',
      now: now + 3,
      existing: existingAbility2,
      sort: 1200001
    });

    await abilitiesDb.put(`!items!${ABILITY_1_ID}`, JSON.stringify(ability1));
    await abilitiesDb.put(`!items!${ABILITY_2_ID}`, JSON.stringify(ability2));

    const verifyPathway = await getOptionalJson(pathwaysDb, pathwayKey);
    const verifyFolder = await getOptionalJson(abilitiesDb, folderKey);
    const verifyAbility1 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_1_ID}`);
    const verifyAbility2 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_2_ID}`);

    console.log(
      JSON.stringify(
        {
          pathwayKey,
          pathwayId: verifyPathway?._id,
          pathwayIdentifier: verifyPathway?.system?.identifier,
          folderKey,
          folderId: verifyFolder?._id,
          folderName: verifyFolder?.name,
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
})();
