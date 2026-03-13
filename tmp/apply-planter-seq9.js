const { ClassicLevel } = require('./node-tools/node_modules/classic-level');

const CORE_VERSION = '13.351';
const SYSTEM_ID = 'lotm';
const SYSTEM_VERSION = '5.2.6';
const MODIFIER = '0000000000000000';

const PATHWAY_NAME = 'Planter';
const PATHWAY_IDENTIFIER = 'lotm-planter';
const DEFAULT_PATHWAY_ID = 'lotmPathway00017';
const FOLDER_ID = 'ukRXXDOSR2TXowMz';
const ABILITY_1_ID = 'lotmAbilityF9001';
const ABILITY_2_ID = 'lotmAbilityF9002';

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
    img: 'icons/magic/nature/root-vine-caduceus-healing.webp',
    system: {
      description: {
        value: '<p><strong>Pathway Vector:</strong> nurturing cultivation through patient labor, life-giving guidance, and cyclical awareness of weather and growth.</p><p><strong>Sequence 9 Package (Total Budget 2):</strong> Cultivator\'s Hands, Season Reading.</p><p><strong>Sequence 8-0 Status:</strong> Pending authoring in later sequence-focused runs.</p><p><strong>Continuity Anchor:</strong> Sequence 9 (Planter) starts with practical plant stewardship and environmental sense, preparing the pathway\'s transition into Sequence 8 (Doctor) healing mastery.</p>',
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
    sort: 1700000,
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
        sort: 1500000,
        _id: FOLDER_ID,
        description: '',
        color: null,
        flags: {}
      }),
      name: PATHWAY_NAME,
      description: 'Sequence abilities for the Planter pathway.',
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
      name: "Cultivator's Hands",
      description:
        '<p><strong>Baseline (0 Spirituality):</strong> Action. Touch one seed bundle, crop row, potted plant, or 5-foot square of natural soil and guide its vitality for 10 minutes. Choose one result:</p><ul><li><strong>Nurture:</strong> The next allied Nature, Survival, Herbalism Kit, or Medicine check tied to that target is made with advantage.</li><li><strong>Forage Yield:</strong> In viable terrain, produce one safe ration of edible sprouts, roots, or fruit.</li><li><strong>Guiding Furrow:</strong> The first ally to move through the tended square before the end of your next turn ignores difficult terrain there and gains +5 feet of movement that turn.</li></ul><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Affect two separate targets/squares instead of one.</li><li><strong>+2 Spirituality:</strong> Nurture also grants <strong>+Potency</strong> to the check; Forage Yield creates two rations; Guiding Furrow can benefit up to <strong>Potency</strong> allies before expiring.</li><li><strong>+4 Spirituality:</strong> Create a 10-foot-radius tended zone for 1 minute. Allies in the zone gain advantage on checks against natural hazards (exhaustion from weather, unsafe forage, or poor footing), and one ally in the zone gains temporary HP equal to <strong>Potency</strong>.</li></ul><p><em>Counterplay:</em> Sterile stone, scorched ground, blight, salt, or active anti-life effects can block or weaken this ability.</p><p><em>Corruption Hook:</em> If you drain healthy land purely for greed or sabotage, gain 1 Corruption.</p>',
      img: 'icons/environment/wilderness/wall-vine-thorny.webp',
      activationType: 'action',
      durationValue: '10',
      durationUnits: 'minute',
      targetType: 'object',
      targetCount: '1',
      targetSpecial: 'seed bundle, crop row, potted plant, or natural soil square',
      rangeUnits: 'touch',
      rangeValue: null,
      rangeSpecial: '',
      school: 'trs',
      properties: ['somatic', 'material'],
      materials: 'a pinch of clean soil and a drop of water',
      identifier: 'lotm-planter-cultivators-hands',
      activityId: 'planterSeq9CultAct01',
      now: now + 2,
      existing: existingAbility1,
      sort: 1500000
    });

    const ability2 = buildAbilityDoc({
      id: ABILITY_2_ID,
      name: 'Season Reading',
      description:
        '<p><strong>Baseline (0 Spirituality):</strong> Action. Spend 1 minute reading cloud lines, wind shift, soil scent, and moisture. You forecast natural weather and travel hazards within 1 mile for the next 6 hours. Choose one creature (including yourself) who hears your guidance; before your next short rest, that creature gains +1d4 to one Survival, Nature, or Perception check, or one saving throw against a natural environmental hazard.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Forecast window extends to 24 hours, range expands to 5 miles, and you may guide one additional creature.</li><li><strong>+2 Spirituality:</strong> Up to <strong>Potency</strong> guided creatures ignore the first movement penalty caused by rain, mud, wind, or heat/cold stress each round for 1 hour.</li><li><strong>+4 Spirituality:</strong> For 10 minutes in a 30-foot radius, softly shift local weather: either calm wind/light rain, or thicken mist to create a lightly obscured area and extinguish unprotected flames.</li></ul><p><em>Counterplay:</em> Sealed interiors, magical weather distortion, sudden supernatural events, and misleading omens reduce reliability.</p><p><em>Corruption Hook:</em> If you knowingly falsify an omen to lead innocents into danger, gain 1 Corruption.</p>',
      img: 'icons/environment/wilderness/island.webp',
      activationType: 'action',
      durationValue: '6',
      durationUnits: 'hour',
      targetType: 'self',
      targetCount: '1',
      targetSpecial: 'self and one guided creature that can hear your forecast',
      rangeUnits: 'self',
      rangeValue: null,
      rangeSpecial: '',
      school: 'div',
      properties: ['vocal', 'somatic'],
      materials: '',
      identifier: 'lotm-planter-season-reading',
      activityId: 'planterSeq9SeasonAct02',
      now: now + 3,
      existing: existingAbility2,
      sort: 1500001
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
