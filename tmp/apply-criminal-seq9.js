const { ClassicLevel } = require('./node-tools/node_modules/classic-level');

const CORE_VERSION = '13.351';
const SYSTEM_ID = 'lotm';
const SYSTEM_VERSION = '5.2.6';
const MODIFIER = '0000000000000000';

const PATHWAY_KEY = '!items!lotmPathway00019';
const FOLDER_KEY = '!folders!tYIG59nsaRs7qkLm';
const PATHWAY_IDENTIFIER = 'lotm-criminal';
const FOLDER_ID = 'tYIG59nsaRs7qkLm';

const ABILITY_1_ID = 'lotmAbilityK9001';
const ABILITY_2_ID = 'lotmAbilityK9002';

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
    const pathway = await getOptionalJson(pathwaysDb, PATHWAY_KEY);
    if (!pathway) throw new Error('Criminal pathway (lotmPathway00019) not found.');

    pathway.system = pathway.system ?? {};
    pathway.system.description = pathway.system.description ?? { value: '', chat: '' };
    const existingPathwayDesc = String(pathway.system.description.value ?? '');
    const seq9Line =
      '<p><strong>Sequence 9 Package (Total Budget 2):</strong> Criminal Proficiency, Predatory Physique.</p>';
    const seq9Anchor =
      '<p><strong>Sequence 9 Anchor:</strong> Criminal begins as an unconstrained killer with broad weapon lethality and hardened predatory instincts, establishing the ruthless foundation that later grows into demonic and abyssal authority.</p>';
    let nextPathwayDesc = existingPathwayDesc;
    if (!nextPathwayDesc.includes('Sequence 9 Package (Total Budget 2):')) {
      nextPathwayDesc = `${seq9Line}${seq9Anchor}${nextPathwayDesc}`;
    } else if (!nextPathwayDesc.includes('Sequence 9 Anchor:')) {
      nextPathwayDesc = `${seq9Anchor}${nextPathwayDesc}`;
    }
    pathway.system.description.value = nextPathwayDesc;
    pathway._stats = buildStats(now, pathway._stats);
    await pathwaysDb.put(PATHWAY_KEY, JSON.stringify(pathway));

    const folder = await getOptionalJson(abilitiesDb, FOLDER_KEY);
    if (!folder) throw new Error('Criminal folder (tYIG59nsaRs7qkLm) not found.');

    const currentLatest = Number(folder.flags?.lotm?.latestAuthoredSequence ?? 9);
    folder.name = 'Criminal';
    folder.description = 'Sequence abilities for the Criminal pathway (authored through Sequence 0; Sequence 9 refreshed).';
    folder.flags = folder.flags ?? {};
    folder.flags.lotm = {
      ...(folder.flags.lotm ?? {}),
      pathwayIdentifier: PATHWAY_IDENTIFIER,
      latestAuthoredSequence: Math.min(currentLatest, 9)
    };
    folder._stats = buildStats(now + 1, folder._stats);
    await abilitiesDb.put(FOLDER_KEY, JSON.stringify(folder));

    const existing1 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_1_ID}`);
    const existing2 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_2_ID}`);

    const ability1 = buildAbilityDoc({
      id: ABILITY_1_ID,
      name: 'Criminal Proficiency',
      description:
        '<p><strong>Baseline (0 Spirituality):</strong> Passive. You are proficient with all simple and martial weapons, improvised weapons, and concealed tools as weapons. Once per turn when you hit a creature with any weapon or improvised strike, add bonus damage equal to <strong>Potency</strong> (minimum 1) and you may choose one rider: <strong>Shove Open</strong> (move target 5 feet if size permits), <strong>Blood Threat</strong> (target has disadvantage on its next opportunity attack before your next turn), or <strong>Cold Read</strong> (gain advantage on your next Intimidation check against that target this scene).</p>' +
        '<p><strong>Higher Spend (upcast):</strong></p><ul>' +
        '<li><strong>+1 Spirituality:</strong> after a successful hit, make one additional quick off-hand/improvised attack against the same target or another target within 5 feet (once per round).</li>' +
        '<li><strong>+2 Spirituality:</strong> your chosen rider lasts until end of target&apos;s next turn and the bonus damage increases by <strong>Potency</strong>.</li>' +
        '<li><strong>+4 Spirituality:</strong> if this strike is part of a surprise, ambush, or opening round, the target must make a Wisdom save or become Frightened of you until end of its next turn.</li>' +
        '</ul><p><em>Counterplay:</em> disarm effects, fear immunity, and heavy battlefield control can reduce execution tempo.</p>' +
        '<p><em>Corruption Hook:</em> if you use this solely to brutalize helpless targets, gain 1 Corruption.</p>',
      img: 'icons/skills/melee/daggers-crossed-orange.webp',
      activationType: 'special',
      durationValue: '',
      durationUnits: 'inst',
      targetType: 'creature',
      targetCount: '1',
      targetSpecial: 'creature hit by weapon or improvised attack',
      rangeUnits: 'self',
      rangeValue: null,
      rangeSpecial: '',
      school: 'trs',
      properties: ['somatic'],
      materials: 'any wielded weapon or improvised killing tool',
      identifier: 'lotm-criminal-criminal-proficiency',
      activityId: 'criminalSeq9Prof01',
      now: now + 2,
      existing: existing1,
      sort: 1900000
    });

    const ability2 = buildAbilityDoc({
      id: ABILITY_2_ID,
      name: 'Predatory Physique',
      description:
        '<p><strong>Baseline (0 Spirituality):</strong> Passive. Your body is hardened for violence: gain advantage on checks against being grappled or knocked prone, +10 feet movement on your first turn in combat, and resistance to one source of minor poison/environmental harm per scene. When initiative is rolled, you may move 5 feet immediately without provoking opportunity attacks.</p>' +
        '<p><strong>Higher Spend (upcast):</strong></p><ul>' +
        '<li><strong>+1 Spirituality:</strong> as a bonus action, sharpen instincts for 1 minute: advantage on Perception/Insight checks to detect imminent hostility or hidden attackers.</li>' +
        '<li><strong>+2 Spirituality:</strong> while instincts are active, the first attack that hits you each round is reduced by <strong>Potency</strong> damage.</li>' +
        '<li><strong>+4 Spirituality:</strong> when a hostile creature misses you in melee, you may move up to 10 feet and make one immediate weapon or improvised attack against a creature in reach (once per round).</li>' +
        '</ul><p><em>Counterplay:</em> immobilization, forced confinement, and anti-mobility zones can neutralize this edge.</p>' +
        '<p><em>Corruption Hook:</em> if you exploit heightened instincts to hunt noncombatants, gain 1 Corruption.</p>',
      img: 'icons/skills/movement/arrow-upward-yellow.webp',
      activationType: 'special',
      durationValue: '',
      durationUnits: 'inst',
      targetType: 'self',
      targetCount: '1',
      targetSpecial: 'self',
      rangeUnits: 'self',
      rangeValue: null,
      rangeSpecial: '',
      school: 'trs',
      properties: ['somatic'],
      materials: 'none',
      identifier: 'lotm-criminal-predatory-physique',
      activityId: 'criminalSeq9Phys02',
      now: now + 3,
      existing: existing2,
      sort: 1900001
    });

    await abilitiesDb.put(`!items!${ABILITY_1_ID}`, JSON.stringify(ability1));
    await abilitiesDb.put(`!items!${ABILITY_2_ID}`, JSON.stringify(ability2));

    const verifyPathway = await getOptionalJson(pathwaysDb, PATHWAY_KEY);
    const verifyFolder = await getOptionalJson(abilitiesDb, FOLDER_KEY);
    const verify1 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_1_ID}`);
    const verify2 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_2_ID}`);

    console.log(
      JSON.stringify(
        {
          pathwayKey: PATHWAY_KEY,
          pathwayId: verifyPathway?._id,
          pathwayIdentifier: verifyPathway?.system?.identifier,
          hasSeq9PackageLine: String(verifyPathway?.system?.description?.value ?? '').includes(
            'Sequence 9 Package (Total Budget 2):'
          ),
          folderKey: FOLDER_KEY,
          folderId: verifyFolder?._id,
          folderName: verifyFolder?.name,
          folderLatestSequence: verifyFolder?.flags?.lotm?.latestAuthoredSequence,
          abilityKeys: [`!items!${ABILITY_1_ID}`, `!items!${ABILITY_2_ID}`],
          abilityReadBack: [
            {
              id: verify1?._id,
              name: verify1?.name,
              sourceClass: verify1?.system?.sourceClass,
              identifier: verify1?.system?.identifier,
              grantedSequence: verify1?.flags?.lotm?.grantedSequence,
              level: verify1?.system?.level,
              folder: verify1?.folder
            },
            {
              id: verify2?._id,
              name: verify2?.name,
              sourceClass: verify2?.system?.sourceClass,
              identifier: verify2?.system?.identifier,
              grantedSequence: verify2?.flags?.lotm?.grantedSequence,
              level: verify2?.system?.level,
              folder: verify2?.folder
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
