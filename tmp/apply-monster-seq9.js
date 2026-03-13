const { ClassicLevel } = require('./node-tools/node_modules/classic-level');

const CORE_VERSION = '13.351';
const SYSTEM_ID = 'lotm';
const SYSTEM_VERSION = '5.2.6';
const MODIFIER = '0000000000000000';

const PATHWAY_NAME = 'Monster';
const PATHWAY_IDENTIFIER = 'lotm-monster';
const DEFAULT_PATHWAY_ID = 'lotmPathway00016';
const FOLDER_ID = 'FCnegTZeThIPZUlC';
const ABILITY_1_ID = 'lotmAbilityO9001';
const ABILITY_2_ID = 'lotmAbilityO9002';

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
    img: 'icons/sundries/gaming/dice-runed-brown.webp',
    system: {
      description: {
        value: '<p><strong>Pathway Vector:</strong> whimsical fate-walking through lucky accidents, uncanny danger sense, and sudden reversals that resist rigid planning.</p><p><strong>Sequence 9 Package (Total Budget 2):</strong> Calamity Instinct, Fickle Coin.</p><p><strong>Sequence 8-0 Status:</strong> Pending authoring in later sequence-focused runs.</p><p><strong>Continuity Anchor:</strong> Sequence 9 (Monster) begins as unstable luck attunement and omen reflexes, building toward Sequence 8 (Robot) where probability influence becomes more deliberate and physically disciplined.</p>',
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
    sort: 1600000,
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
    const existingPathway = existingByIdentifier?.doc ?? (await getOptionalJson(pathwaysDb, pathwayKey));

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
        sort: 2200000,
        _id: FOLDER_ID,
        description: '',
        color: null,
        flags: {}
      }),
      name: PATHWAY_NAME,
      description: 'Sequence abilities for the Monster pathway.',
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
      name: 'Calamity Instinct',
      description:
        '<p><strong>Baseline (0 Spirituality):</strong> Reaction when you or one creature you can see within 30 feet would be hit by an attack or fail a Dexterity, Constitution, or Wisdom saving throw. Roll <strong>1d4</strong> and add it to the target\'s AC against that attack or to the saving throw. If this changes the outcome, the target can move 5 feet without provoking opportunity attacks from the triggering creature. While conscious, you also gain advantage on checks to notice immediate danger such as hidden ambushes, unstable footing, or spring-loaded traps.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Replace the 1d4 with <strong>Potency</strong> (minimum +2).</li><li><strong>+2 Spirituality:</strong> If the outcome changes, the triggering attacker has disadvantage on its next attack roll before the end of its next turn.</li><li><strong>+4 Spirituality:</strong> If the outcome changes, impose <strong>-Potency</strong> on the triggering creature\'s next saving throw or ability check before the end of its next turn.</li></ul><p><em>Counterplay:</em> hidden long-delay hazards, effects that do not use attack rolls or listed saves, and overwhelming area saturation reduce this instinct\'s impact.</p><p><em>Corruption Hook:</em> if you intentionally chase lethal danger just to feel fate\'s thrill, gain 1 Corruption.</p>',
      img: 'icons/magic/perception/eye-ringed-green.webp',
      activationType: 'reaction',
      durationValue: '',
      durationUnits: 'inst',
      targetType: 'creature',
      targetCount: '1',
      targetSpecial: 'self or one creature you can see',
      rangeUnits: 'ft',
      rangeValue: '30',
      rangeSpecial: '',
      school: 'div',
      properties: ['somatic'],
      materials: 'a bent copper pin carried for luck',
      identifier: 'lotm-monster-calamity-instinct',
      activityId: 'monsterSeq9Instinct01',
      now: now + 2,
      existing: existingAbility1,
      sort: 2200000
    });

    const ability2 = buildAbilityDoc({
      id: ABILITY_2_ID,
      name: 'Fickle Coin',
      description:
        '<p><strong>Baseline (0 Spirituality):</strong> Bonus action. Choose one creature you can see within 30 feet (including yourself) and flip an uncanny coin; the effect lasts up to 1 minute or until consumed by the target\'s next d20 test.</p><ul><li><strong>1-2 Misstep:</strong> target subtracts <strong>1d4</strong> from its next attack roll, ability check, or saving throw.</li><li><strong>3-4 Sidestep:</strong> no roll modifier; target immediately moves 5 feet without provoking opportunity attacks.</li><li><strong>5-6 Windfall:</strong> target adds <strong>1d4</strong> to its next attack roll, ability check, or saving throw.</li></ul><p>The target does not choose the result.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Roll two d6 and queue both results on the same target (resolved on its next two eligible d20 tests).</li><li><strong>+2 Spirituality:</strong> Target one additional creature and roll separately for each creature.</li><li><strong>+4 Spirituality:</strong> Misstep/Windfall become <strong>1d6</strong>, and Sidestep movement becomes 10 feet.</li></ul><p><em>Counterplay:</em> fate-stabilizing wards, forced rerolls from stronger sources, and anti-luck rituals can cancel queued coin effects.</p><p><em>Corruption Hook:</em> if you repeatedly inflict bad luck on bystanders for amusement, gain 1 Corruption.</p>',
      img: 'icons/sundries/gaming/dice-pair-white-green.webp',
      activationType: 'bonus',
      durationValue: '1',
      durationUnits: 'minute',
      targetType: 'creature',
      targetCount: '1',
      targetSpecial: 'one creature you can see (including self)',
      rangeUnits: 'ft',
      rangeValue: '30',
      rangeSpecial: '',
      school: 'enc',
      properties: ['vocal', 'somatic', 'material'],
      materials: 'a coin, chip, or carved knucklebone',
      identifier: 'lotm-monster-fickle-coin',
      activityId: 'monsterSeq9Coin02',
      now: now + 3,
      existing: existingAbility2,
      sort: 2200001
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
              level: verifyAbility1?.system?.level,
              identifier: verifyAbility1?.system?.identifier
            },
            {
              _id: verifyAbility2?._id,
              name: verifyAbility2?.name,
              folder: verifyAbility2?.folder,
              sourceClass: verifyAbility2?.system?.sourceClass,
              grantedSequence: verifyAbility2?.flags?.lotm?.grantedSequence,
              level: verifyAbility2?.system?.level,
              identifier: verifyAbility2?.system?.identifier
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