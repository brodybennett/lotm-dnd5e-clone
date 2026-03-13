const { ClassicLevel } = require('./node-tools/node_modules/classic-level');

const CORE_VERSION = '13.351';
const SYSTEM_ID = 'lotm';
const SYSTEM_VERSION = '5.2.6';
const MODIFIER = '0000000000000000';

const PATHWAY_IDENTIFIER = 'lotm-mystery-pryer';
const DEFAULT_PATHWAY_ID = 'lotmPathway00014';
const FOLDER_ID = 'GEb0Z39c7pW51DAO';
const ABILITY_1_ID = 'lotmAbilityP9001';
const ABILITY_2_ID = 'lotmAbilityP9002';

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
    name: 'Mystery Pryer',
    type: 'class',
    img: 'icons/sundries/books/book-embossed-gold-blue.webp',
    system: {
      description: {
        value: '<p><strong>Pathway Vector:</strong> inquisitive occult scholarship through spirit sight, structured divination, and careful ritual inquiry that rewards layered interpretation over blunt certainty.</p><p><strong>Sequence 9 Package (Total Budget 2):</strong> Eyes of Mystery Prying, Quick Rituals.</p><p><strong>Sequence 8-0 Status:</strong> Pending authoring in later sequence-focused runs.</p><p><strong>Continuity Anchor:</strong> Sequence 9 establishes the baseline Hermit cadence: ask precise questions, read hidden meaning from residue and symbols, and accept knowledge-risk pressure when peering too deeply.</p>',
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
    sort: 1400000,
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
        name: 'Mystery Pryer',
        type: 'Item',
        folder: null,
        sorting: 'a',
        sort: 1100000,
        _id: FOLDER_ID,
        description: '',
        color: null,
        flags: {}
      }),
      name: 'Mystery Pryer',
      description: 'Sequence abilities for the Mystery Pryer pathway.',
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
      name: 'Eyes of Mystery Prying',
      description:
        '<p><strong>Baseline (0 Spirituality):</strong> Action. Choose one creature, object, sigil, or 10-foot scene fragment you can see within 60 feet. Ask one <em>probing question</em> from this list: (1) What hidden influence is acting here right now? (2) What immediate danger is most likely in the next minute? (3) What detail is being concealed by supernatural means? The GM gives one concise, truthful clue. You then gain advantage on your next Arcana, Investigation, or Insight check about that same target before the end of your next turn.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Ask one additional probing question, or extend range to 120 feet.</li><li><strong>+2 Spirituality:</strong> You also perceive occult residue (ritual traces, curse marks, or sequence aura) left within the last 24 hours on the target.</li><li><strong>+4 Spirituality:</strong> Establish a prying link for 10 minutes. Once per round, when the target takes an action you can see, ask, \"what is the deeper intent?\" and gain +Potency on one opposing check or save DC against that target before the end of your next turn.</li></ul><p><em>Counterplay:</em> layered misdirection, anti-divination wards, and prepared false trails can degrade or redirect clues.</p><p><em>Corruption Hook:</em> if you repeatedly pry into private thoughts or sacred material without cause, gain 1 Corruption after the scene.</p>',
      img: 'icons/magic/perception/eye-ringed-green.webp',
      activationType: 'action',
      durationValue: '1',
      durationUnits: 'round',
      targetType: 'creature',
      targetCount: '1',
      targetSpecial: 'creature, object, sigil, or scene fragment under scrutiny',
      rangeUnits: 'ft',
      rangeValue: '60',
      rangeSpecial: '',
      school: 'div',
      properties: ['vocal', 'somatic'],
      materials: 'an inked monocle or lens etched with arcane shorthand',
      identifier: 'lotm-mystery-pryer-eyes-of-mystery-prying',
      activityId: 'pryerSeq9EyeAct01',
      now: now + 2,
      existing: existingAbility1,
      sort: 1100000
    });

    const ability2 = buildAbilityDoc({
      id: ABILITY_2_ID,
      name: 'Quick Rituals',
      description:
        '<p><strong>Baseline (0 Spirituality):</strong> Action. Perform a compressed rite by tracing symbols in air, dust, or liquid medium. Choose one mode:</p><ul><li><strong>Arcane Intercept:</strong> Create an invisible 10-foot barrier line for 1 round. The first creature crossing it must succeed on a Dexterity save or stop at the line and lose 10 feet of movement.</li><li><strong>Residual Portrait:</strong> Read a layered afterimage from a touched object or a 5-foot spot. You witness a brief symbolic echo of the most significant event that occurred there within the last hour.</li></ul><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Arcane Intercept lasts 1 minute (once-per-round trigger). Residual Portrait can review events up to 24 hours old.</li><li><strong>+2 Spirituality:</strong> Arcane Intercept becomes a 20-foot line and imposes disadvantage on the trigger creature\'s next attack this turn on a failed save. Residual Portrait provides one concrete detail (face, spoken phrase, or held item) instead of only symbolism.</li><li><strong>+4 Spirituality:</strong> Run both modes with one action. Arcane Intercept can protect two adjacent 10-foot segments, and Residual Portrait can compare two separate echoes from the same location.</li></ul><p><em>Counterplay:</em> hasty symbols, turbulent terrain, and anti-ritual interference can break the rite before completion.</p><p><em>Corruption Hook:</em> if you forge false ritual evidence or tamper with truth-bearing echoes, gain 1 Corruption.</p>',
      img: 'icons/magic/symbols/runes-etched-steel-blade.webp',
      activationType: 'action',
      durationValue: '1',
      durationUnits: 'round',
      targetType: 'space',
      targetCount: '1',
      targetSpecial: 'ritual line, object, or scene point',
      rangeUnits: 'ft',
      rangeValue: '30',
      rangeSpecial: '',
      school: 'abj',
      properties: ['vocal', 'somatic', 'material'],
      materials: 'chalk dust, oil soot, or any medium that can hold a sigil for a moment',
      identifier: 'lotm-mystery-pryer-quick-rituals',
      activityId: 'pryerSeq9RitAct02',
      now: now + 3,
      existing: existingAbility2,
      sort: 1100001
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
