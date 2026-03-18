const { ClassicLevel } = require('./node-tools/node_modules/classic-level');

const CORE_VERSION = '13.351';
const SYSTEM_ID = 'lotm';
const SYSTEM_VERSION = '5.2.6';
const MODIFIER = '0000000000000000';

const PATHWAY_NAME = 'Prisoner';
const PATHWAY_IDENTIFIER = 'lotm-prisoner';
const DEFAULT_PATHWAY_ID = 'lotmPathway00020';
const PATHWAY_SORT = 2000000;

const FOLDER_ID = 'WbvFQVEO6JXQDyHF';
const FOLDER_KEY = `!folders!${FOLDER_ID}`;

const ABILITY_1_ID = 'lotmAbilityU9001';
const ABILITY_2_ID = 'lotmAbilityU9002';

const SEQ9_PACKAGE_LINE =
  '<p><strong>Sequence 9 Package (Total Budget 2):</strong> Shacklecraft, Contained Burst.</p>';
const SEQ9_ANCHOR_LINE =
  '<p><strong>Continuity Anchor:</strong> Sequence 9 (Prisoner) establishes restrained violence, confinement craft, and pressure-to-burst release; advancement points toward Sequence 8 (Lunatic), where restraint is weaponized into controlled loss-of-control.</p>';
const PATHWAY_VECTOR_LINE =
  '<p><strong>Pathway Vector:</strong> restrained, tense, defiant control through confinement techniques, suppressed force, and tightly timed bursts of violence.</p>';
const SEQ_STATUS_LINE =
  '<p><strong>Sequence 8-0 Status:</strong> Pending authoring in later sequence-focused runs.</p>';

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

async function findPathway(pathwaysDb) {
  for await (const [key, value] of pathwaysDb.iterator()) {
    if (!key.startsWith('!items!')) continue;
    let doc;
    try {
      doc = JSON.parse(value);
    } catch {
      continue;
    }

    const identifier = String(doc?.system?.identifier ?? '');
    const name = String(doc?.name ?? '');
    if (identifier === PATHWAY_IDENTIFIER || name === PATHWAY_NAME) {
      return { key, doc };
    }
  }
  return null;
}

function nextPathwayDescription(existingDescription) {
  const parts = [
    PATHWAY_VECTOR_LINE,
    SEQ9_PACKAGE_LINE,
    SEQ_STATUS_LINE,
    SEQ9_ANCHOR_LINE
  ];

  if (!existingDescription || existingDescription.trim() === '') {
    return parts.join('');
  }

  let out = existingDescription;
  for (const part of parts) {
    if (!out.includes(part)) out = `${part}${out}`;
  }
  return out;
}

function buildPathwayDoc({ pathwayId, existing, now }) {
  const existingDescription = String(existing?.system?.description?.value ?? '');

  return {
    ...(existing ?? {}),
    _id: pathwayId,
    name: PATHWAY_NAME,
    type: 'class',
    img: 'icons/sundries/survival/cuffs-shackles-steel.webp',
    system: {
      ...(existing?.system ?? {}),
      description: {
        value: nextPathwayDescription(existingDescription),
        chat: existing?.system?.description?.chat ?? ''
      },
      source: {
        custom: '',
        rules: '2024',
        revision: 1,
        license: '',
        book: 'LoTM Core'
      },
      startingEquipment: existing?.system?.startingEquipment ?? [],
      identifier: PATHWAY_IDENTIFIER,
      levels: existing?.system?.levels ?? 1,
      advancement: existing?.system?.advancement ?? [],
      spellcasting: {
        progression: 'full',
        ability: 'wis',
        preparation: {
          formula: ''
        }
      },
      wealth: existing?.system?.wealth ?? '4d4*10',
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
    effects: existing?.effects ?? [],
    folder: existing?.folder ?? null,
    flags: {
      ...(existing?.flags ?? {}),
      lotm: {
        ...(existing?.flags?.lotm ?? {}),
        sourceBook: 'LoTM Core'
      }
    },
    _stats: buildStats(now, existing?._stats),
    sort: existing?.sort ?? PATHWAY_SORT,
    ownership: existing?.ownership ?? { default: 0 }
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
    ...(existing ?? {}),
    _id: id,
    name,
    type: 'spell',
    img,
    system: {
      ...(existing?.system ?? {}),
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
    effects: existing?.effects ?? [],
    folder: FOLDER_ID,
    flags: {
      ...(existing?.flags ?? {}),
      dnd5e: {
        riders: {
          activity: [],
          effect: []
        }
      },
      lotm: {
        ...(existing?.flags?.lotm ?? {}),
        sourceBook: 'LoTM Core',
        grantedSequence: 9
      }
    },
    _stats: buildStats(now, existing?._stats),
    sort,
    ownership: existing?.ownership ?? { default: 0 }
  };
}

(async () => {
  const now = Date.now();

  const pathwaysDb = new ClassicLevel('packs/lotm_pathways', { valueEncoding: 'utf8' });
  const abilitiesDb = new ClassicLevel('packs/lotm_abilities', { valueEncoding: 'utf8' });

  await pathwaysDb.open();
  await abilitiesDb.open();

  try {
    const existingPathwayMatch = await findPathway(pathwaysDb);
    const pathwayId = existingPathwayMatch?.doc?._id ?? DEFAULT_PATHWAY_ID;
    const pathwayKey = existingPathwayMatch?.key ?? `!items!${pathwayId}`;
    const existingPathway = existingPathwayMatch?.doc ?? (await getOptionalJson(pathwaysDb, pathwayKey));

    const pathwayDoc = buildPathwayDoc({
      pathwayId,
      existing: existingPathway,
      now
    });
    await pathwaysDb.put(pathwayKey, JSON.stringify(pathwayDoc));

    const existingFolder = await getOptionalJson(abilitiesDb, FOLDER_KEY);
    const currentLatest = Number(existingFolder?.flags?.lotm?.latestAuthoredSequence ?? 9);
    const folderDoc = {
      ...(existingFolder ?? {
        name: PATHWAY_NAME,
        type: 'Item',
        folder: null,
        sorting: 'a',
        sort: 2100000,
        _id: FOLDER_ID,
        description: '',
        color: null,
        flags: {}
      }),
      name: PATHWAY_NAME,
      description: 'Sequence abilities for the Prisoner pathway (currently authored at Sequence 9).',
      flags: {
        ...(existingFolder?.flags ?? {}),
        lotm: {
          ...(existingFolder?.flags?.lotm ?? {}),
          pathwayIdentifier: PATHWAY_IDENTIFIER,
          latestAuthoredSequence: Math.min(currentLatest, 9)
        }
      },
      _stats: buildStats(now + 1, existingFolder?._stats)
    };

    await abilitiesDb.put(FOLDER_KEY, JSON.stringify(folderDoc));

    const existingAbility1 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_1_ID}`);
    const existingAbility2 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_2_ID}`);

    const ability1 = buildAbilityDoc({
      id: ABILITY_1_ID,
      name: 'Shacklecraft',
      description:
        '<p><strong>Baseline (0 Spirituality):</strong> As an action, apply confinement technique to one creature within 5 feet using chain, rope, wire, belt, or similar gear. The target makes a Strength or Dexterity save (target chooses). On a failure, its speed is reduced by 10 feet and it cannot take the Dash action until the start of your next turn. Once per turn, when you hit a creature that is grappled or restrained, deal extra damage equal to <strong>Potency</strong> (minimum 1).</p>' +
        '<p><strong>Higher Spend (upcast):</strong></p><ul>' +
        '<li><strong>+1 Spirituality:</strong> Range becomes 10 feet; on a failed save, the target also loses reactions until the start of its next turn.</li>' +
        '<li><strong>+2 Spirituality:</strong> On a failed save, the target is <strong>Restrained</strong> until the end of your next turn (it may attempt an escape check against your feature DC at the end of its turn).</li>' +
        '<li><strong>+4 Spirituality:</strong> If the target is already grappled or restrained, immediately deal additional damage equal to <strong>Potency</strong> and either pull it 10 feet or knock it prone.</li>' +
        '</ul><p><em>Counterplay:</em> teleportation, mist-form movement, and anti-restraint effects bypass or shorten this bind.</p>' +
        '<p><em>Corruption Hook:</em> If you prolong a captive\'s suffering after combat is already decided, gain 1 Corruption.</p>',
      img: 'icons/sundries/survival/cuffs-shackles-steel.webp',
      activationType: 'action',
      durationValue: '',
      durationUnits: 'inst',
      targetType: 'creature',
      targetCount: '1',
      targetSpecial: 'one creature you can bind with physical restraint',
      rangeUnits: 'ft',
      rangeValue: '5',
      rangeSpecial: '',
      school: 'trs',
      properties: ['somatic', 'material'],
      materials: 'a loop of chain, rope knot, or twisted wire',
      identifier: 'lotm-prisoner-shacklecraft',
      activityId: 'prisonerSeq9Act001',
      now: now + 2,
      existing: existingAbility1,
      sort: 2000000
    });

    const ability2 = buildAbilityDoc({
      id: ABILITY_2_ID,
      name: 'Contained Burst',
      description:
        '<p><strong>Baseline (0 Spirituality):</strong> Bonus action. For 1 minute, you maintain hard internal restraint. You gain advantage on saves against being Charmed or Frightened and on checks/saves to resist being grappled, shoved, or knocked prone. Once per round when a hostile creature within 5 feet hits you or an ally within 10 feet, you may use your reaction to release a controlled burst: the attacker makes a Strength save. On a failure, it takes bludgeoning damage equal to <strong>Potency</strong>, is pushed 5 feet, and its speed becomes 0 until the end of the current turn.</p>' +
        '<p><strong>Higher Spend (upcast):</strong></p><ul>' +
        '<li><strong>+1 Spirituality:</strong> You gain temporary hit points equal to <strong>Potency</strong>, and the trigger range for the burst becomes 10 feet.</li>' +
        '<li><strong>+2 Spirituality:</strong> Burst damage becomes <strong>2 x Potency</strong>, and a failed save also causes the target to lose reactions until the start of its next turn.</li>' +
        '<li><strong>+4 Spirituality:</strong> Once during the duration, when you trigger the burst, you may affect up to two additional hostile creatures within 10 feet of the original target (separate saves for each).</li>' +
        '</ul><p><em>Counterplay:</em> ranged harassment, forced repositioning, and silence/stun effects can prevent burst timing.</p>' +
        '<p><em>Corruption Hook:</em> If you deliberately vent this burst on subdued or non-hostile targets, gain 1 Corruption.</p>',
      img: 'icons/magic/control/debuff-chains-shadow.webp',
      activationType: 'bonus',
      durationValue: '1',
      durationUnits: 'minute',
      targetType: 'self',
      targetCount: '1',
      targetSpecial: 'self',
      rangeUnits: 'self',
      rangeValue: null,
      rangeSpecial: '',
      school: 'abj',
      properties: ['vocal', 'somatic'],
      materials: 'a wrapped wrist-cloth or clenched chain knot',
      identifier: 'lotm-prisoner-contained-burst',
      activityId: 'prisonerSeq9Act002',
      now: now + 3,
      existing: existingAbility2,
      sort: 2000001
    });

    await abilitiesDb.put(`!items!${ABILITY_1_ID}`, JSON.stringify(ability1));
    await abilitiesDb.put(`!items!${ABILITY_2_ID}`, JSON.stringify(ability2));

    const verifyPathway = await getOptionalJson(pathwaysDb, pathwayKey);
    const verifyFolder = await getOptionalJson(abilitiesDb, FOLDER_KEY);
    const verifyAbility1 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_1_ID}`);
    const verifyAbility2 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_2_ID}`);

    console.log(
      JSON.stringify(
        {
          pathwayKey,
          pathwayId: verifyPathway?._id,
          pathwayName: verifyPathway?.name,
          pathwayIdentifier: verifyPathway?.system?.identifier,
          hasSeq9PackageLine: String(verifyPathway?.system?.description?.value ?? '').includes(
            'Sequence 9 Package (Total Budget 2):'
          ),
          folderKey: FOLDER_KEY,
          folderId: verifyFolder?._id,
          folderName: verifyFolder?.name,
          folderPathwayIdentifier: verifyFolder?.flags?.lotm?.pathwayIdentifier,
          folderLatestSequence: verifyFolder?.flags?.lotm?.latestAuthoredSequence,
          abilityKeys: [`!items!${ABILITY_1_ID}`, `!items!${ABILITY_2_ID}`],
          abilityReadBack: [
            {
              id: verifyAbility1?._id,
              name: verifyAbility1?.name,
              sourceClass: verifyAbility1?.system?.sourceClass,
              identifier: verifyAbility1?.system?.identifier,
              grantedSequence: verifyAbility1?.flags?.lotm?.grantedSequence,
              level: verifyAbility1?.system?.level,
              folder: verifyAbility1?.folder
            },
            {
              id: verifyAbility2?._id,
              name: verifyAbility2?.name,
              sourceClass: verifyAbility2?.system?.sourceClass,
              identifier: verifyAbility2?.system?.identifier,
              grantedSequence: verifyAbility2?.flags?.lotm?.grantedSequence,
              level: verifyAbility2?.system?.level,
              folder: verifyAbility2?.folder
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
