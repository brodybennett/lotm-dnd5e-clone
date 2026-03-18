const { ClassicLevel } = require('./node-tools/node_modules/classic-level');

const CORE_VERSION = '13.351';
const SYSTEM_ID = 'lotm';
const SYSTEM_VERSION = '5.2.6';
const MODIFIER = '0000000000000000';

const PATHWAY_NAME = 'Apothecary';
const PATHWAY_IDENTIFIER = 'lotm-apothecary';
const DEFAULT_PATHWAY_ID = 'lotmPathway00018';
const FOLDER_ID = 'y19Aib8B9WnjpCGl';
const ABILITY_1_ID = 'lotmAbilityY9001';
const ABILITY_2_ID = 'lotmAbilityY9002';

function buildStats(now, existing = null) {
  const createdTime = existing?.createdTime ?? now;
  return {
    ...(existing ?? {}),
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
    img: 'icons/consumables/potions/bottle-round-corked-empty.webp',
    system: {
      description: {
        value: '<p><strong>Pathway Vector:</strong> serene moonlit alchemy through diagnosis, gentle stabilization, and quiet control of medicinal flora.</p><p><strong>Sequence 9 Package (Total Budget 2):</strong> Moonlit Distillation, Vital Herb Sight.</p><p><strong>Sequence 8-0 Status:</strong> Pending authoring in later sequence-focused runs.</p><p><strong>Continuity Anchor:</strong> Sequence 9 (Apothecary) starts with bedside treatment, toxin discernment, and calm herbwork that can later grow into Sequence 8 beast-and-vitality stewardship.</p>',
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
        ability: 'wis',
        preparation: {
          formula: ''
        }
      },
      wealth: '4d4*10',
      primaryAbility: {
        value: ['wis'],
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
    sort: 1800000,
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
        sort: 1800000,
        _id: FOLDER_ID,
        description: '',
        color: null,
        flags: {}
      }),
      name: PATHWAY_NAME,
      description: 'Sequence abilities for the Apothecary pathway.',
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
      name: 'Moonlit Distillation',
      description:
        '<p><strong>Baseline (0 Spirituality):</strong> Action. Distill and administer a gentle alchemical draft to one creature you can touch. Choose one mode:</p><ul><li><strong>Restorative Draft:</strong> The target gains advantage on its next Constitution save against poison or disease within 1 hour, then may immediately repeat one ongoing save against poison or disease with <strong>+Potency</strong>.</li><li><strong>Sedative Draft:</strong> The target can immediately end the Frightened condition on itself and has advantage on its next save against fear before the end of your next turn.</li><li><strong>Coagulant Draft:</strong> If the target is at 0 hit points, it becomes stable and gains temporary HP equal to <strong>Potency</strong>.</li></ul><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Prepare two doses instead of one, or deliver the draft to a willing creature within 30 feet.</li><li><strong>+2 Spirituality:</strong> Restorative Draft also grants resistance to poison damage until the end of the target&apos;s next turn; Sedative Draft also grants advantage on saves against charm for the same duration; Coagulant Draft also restores HP equal to <strong>Potency</strong>.</li><li><strong>+4 Spirituality:</strong> Create a 15-foot-radius moon-mist clinic for 1 minute. Up to <strong>Potency</strong> allies in the area can each once gain temporary HP equal to <strong>Potency</strong> and immediately repeat one poison/disease save with advantage.</li></ul><p><em>Counterplay:</em> anti-healing effects, tainted reagents, and disrupted components can suppress or spoil the draft.</p><p><em>Corruption Hook:</em> If you intentionally foster dependency by withholding treatment for leverage, gain 1 Corruption.</p>',
      img: 'icons/consumables/potions/bottle-round-corked-blue.webp',
      activationType: 'action',
      durationValue: '1',
      durationUnits: 'hour',
      targetType: 'creature',
      targetCount: '1',
      targetSpecial: 'creature receiving an alchemical draft',
      rangeUnits: 'touch',
      rangeValue: null,
      rangeSpecial: '',
      school: 'trs',
      properties: ['somatic', 'material'],
      materials: 'a glass vial, clean water, and a pinch of nocturnal herb powder',
      identifier: 'lotm-apothecary-moonlit-distillation',
      activityId: 'apothSeq9DistillAct01',
      now: now + 2,
      existing: existingAbility1,
      sort: 1800000
    });

    const ability2 = buildAbilityDoc({
      id: ABILITY_2_ID,
      name: 'Vital Herb Sight',
      description:
        '<p><strong>Baseline (0 Spirituality):</strong> Action. Focus on one creature, plant specimen, or consumable within 60 feet for 1 minute. Learn two details from this list: current injury severity, presence of poison/disease, strongest emotional agitation, whether a plant is medicinal or toxic, or the safest method to process that specimen. Before the effect ends, you gain advantage on one Medicine, Nature, or Insight check related to that target.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Target one additional valid target, or increase range to 120 feet.</li><li><strong>+2 Spirituality:</strong> Creature readings also detect one foreign spiritual contamination (curse, charm, or parasitic influence). Plant readings can coax nearby growth into a calm 10-foot lane; allies crossing it ignore difficult terrain until the start of your next turn.</li><li><strong>+4 Spirituality:</strong> Extend one target&apos;s reading to 10 minutes. Once per round during the effect, when that target fails a Constitution or Wisdom save against poison, disease, fear, or charm, you can use your reaction to let it reroll with <strong>+Potency</strong>.</li></ul><p><em>Counterplay:</em> sealed containers, anti-divination wards, and magically disguised toxins can obscure the diagnosis.</p><p><em>Corruption Hook:</em> If you falsify a diagnosis to manipulate trust, gain 1 Corruption.</p>',
      img: 'icons/magic/perception/eye-ringed-green.webp',
      activationType: 'action',
      durationValue: '1',
      durationUnits: 'minute',
      targetType: 'creature',
      targetCount: '1',
      targetSpecial: 'creature, plant specimen, or consumable under diagnosis',
      rangeUnits: 'ft',
      rangeValue: '60',
      rangeSpecial: '',
      school: 'div',
      properties: ['vocal', 'somatic'],
      materials: 'a pressed moonflower petal',
      identifier: 'lotm-apothecary-vital-herb-sight',
      activityId: 'apothSeq9SightAct02',
      now: now + 3,
      existing: existingAbility2,
      sort: 1800001
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
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
