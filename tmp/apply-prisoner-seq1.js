const { ClassicLevel } = require('./node-tools/node_modules/classic-level');

const CORE_VERSION = '13.351';
const SYSTEM_ID = 'lotm';
const SYSTEM_VERSION = '5.2.6';
const MODIFIER = '0000000000000000';

const PATHWAY_NAME = 'Prisoner';
const PATHWAY_IDENTIFIER = 'lotm-prisoner';
const DEFAULT_PATHWAY_ID = 'lotmPathway00020';
const FOLDER_ID = 'WbvFQVEO6JXQDyHF';

const ABILITY_1_ID = 'lotmAbilityU1001';
const ABILITY_2_ID = 'lotmAbilityU1002';
const ABILITY_3_ID = 'lotmAbilityU1003';
const ABILITY_4_ID = 'lotmAbilityU1004';

const LEGACY_A_ID = 'lotmAbilityU3002';
const LEGACY_B_ID = 'lotmAbilityU4001';

const LEGACY_A_HEADER = '<h3>Legacy Upgrade (Sequence 1 - Scope)</h3>';
const LEGACY_A_TEXT =
  '<p>At Sequence 1, <strong>Transfiguration Curse</strong> rises to abomination-grade spread. ' +
  'When a creature fails its save against Transfiguration Curse, choose one additional creature within 15 feet that shares a visible connection (touching, chained, mirrored, or spiritually linked). ' +
  'The second creature makes the same save against baseline effects. This propagation can occur once per cast.</p>';

const LEGACY_B_HEADER = '<h3>Legacy Upgrade (Sequence 1 - Efficiency)</h3>';
const LEGACY_B_TEXT =
  '<p>At Sequence 1, <strong>Source of Curses</strong> gains effortless vessel routing. ' +
  'If the target is inside your Black Mire Seal, Curse Vessel Domain, or Dwelling Space radius, reduce Source of Curses cost by <strong>1 Spirituality</strong> (minimum 1). ' +
  'Once per short rest, you may establish Source of Curses as a <strong>bonus action</strong> under those conditions.</p>';

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
    if (doc?.system?.identifier === identifier) return { key, doc };
  }
  return null;
}

function buildPathwayDoc({ pathwayId, existing, now }) {
  return {
    ...(existing ?? {}),
    _id: pathwayId,
    name: PATHWAY_NAME,
    type: 'class',
    img: 'icons/creatures/unholy/demon-horned-green.webp',
    system: {
      ...(existing?.system ?? {}),
      description: {
        value:
          '<p><strong>Pathway Vector:</strong> restrained, tense, defiant control through confinement techniques, suppressed force, and tightly timed bursts of violence.</p>' +
          '<p><strong>Sequence 9 Package (Total Budget 2):</strong> Shacklecraft, Contained Burst.</p>' +
          '<p><strong>Sequence 8 Package (Gain Budget +3):</strong> Leashed Frenzy, Bound Shadow, plus one legacy scope upgrade to Shacklecraft.</p>' +
          '<p><strong>Sequence 7 Package (Gain Budget +13):</strong> Werewolf Transformation, Dark Horror, Repel Light, plus two legacy upgrades (Shacklecraft and Leashed Frenzy).</p>' +
          '<p><strong>Sequence 6 Package (Gain Budget +9):</strong> Zombie Husk, Frostbound Decay, Corpse String, plus two legacy upgrades (Shacklecraft and Bound Shadow).</p>' +
          '<p><strong>Sequence 5 Package (Gain Budget +13):</strong> Wraith Transformation, Wraith Possession, Mirror Blink, plus two legacy upgrades (Bound Shadow and Dark Horror).</p>' +
          '<p><strong>Sequence 4 Package (Gain Budget +33):</strong> Source of Curses, Poltergeist, Sympathetic Effigy, Marionette Grip, plus two legacy upgrades (Wraith Possession and Frostbound Decay).</p>' +
          '<p><strong>Sequence 3 Package (Gain Budget +20):</strong> Silent Curse Brewing, Transfiguration Curse, Cursed Artifact Possession, plus two legacy upgrades (Source of Curses and Wraith Possession).</p>' +
          '<p><strong>Sequence 2 Package (Gain Budget +50):</strong> Dwelling Space, Bane Gaze, Spirit Siphon, Curse Vessel Domain, plus two legacy upgrades (Source of Curses and Wraith Possession).</p>' +
          '<p><strong>Sequence 1 Package (Gain Budget +74):</strong> Abomination Manifestation, Deviant Conversion, Black Mire Seal, Invisible Curse, plus two legacy upgrades (Transfiguration Curse and Source of Curses).</p>' +
          '<p><strong>Sequence 0 Status:</strong> Pending authoring in a later sequence-focused run.</p>' +
          '<p><strong>Continuity Anchor:</strong> At Sequence 1 (Abomination), restraint mutates into catastrophic curse sovereignty: deformed battle-form pressure, deviant conversion, environment sealing, and near-undetectable connection curses.</p>',
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
    sort: existing?.sort ?? 2000000,
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
      level: 8,
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
        grantedSequence: 1
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
    const foundPathway = await findPathwayByIdentifier(pathwaysDb, PATHWAY_IDENTIFIER);
    const pathwayId = foundPathway?.doc?._id ?? DEFAULT_PATHWAY_ID;
    const pathwayKey = foundPathway?.key ?? `!items!${pathwayId}`;
    const existingPathway = foundPathway?.doc ?? (await getOptionalJson(pathwaysDb, pathwayKey));

    const pathwayDoc = buildPathwayDoc({ pathwayId, existing: existingPathway, now });
    await pathwaysDb.put(pathwayKey, JSON.stringify(pathwayDoc));

    const folderKey = `!folders!${FOLDER_ID}`;
    const existingFolder = await getOptionalJson(abilitiesDb, folderKey);
    if (!existingFolder) throw new Error(`Expected ability folder ${FOLDER_ID} (${PATHWAY_NAME}) to exist.`);

    const currentLatest = Number(existingFolder?.flags?.lotm?.latestAuthoredSequence ?? 9);
    const folderDoc = {
      ...existingFolder,
      name: PATHWAY_NAME,
      description: 'Sequence abilities for the Prisoner pathway (authored through Sequence 1).',
      flags: {
        ...(existingFolder.flags ?? {}),
        lotm: {
          ...(existingFolder.flags?.lotm ?? {}),
          pathwayIdentifier: PATHWAY_IDENTIFIER,
          latestAuthoredSequence: Math.min(currentLatest, 1)
        }
      },
      _stats: buildStats(now + 1, existingFolder._stats)
    };
    await abilitiesDb.put(folderKey, JSON.stringify(folderDoc));

    const legacyAKey = `!items!${LEGACY_A_ID}`;
    const legacyBKey = `!items!${LEGACY_B_ID}`;
    const legacyA = await getOptionalJson(abilitiesDb, legacyAKey);
    const legacyB = await getOptionalJson(abilitiesDb, legacyBKey);
    if (!legacyA) throw new Error(`Legacy target ${LEGACY_A_ID} not found.`);
    if (!legacyB) throw new Error(`Legacy target ${LEGACY_B_ID} not found.`);

    const legacyADesc = String(legacyA.system?.description?.value ?? '');
    if (!legacyADesc.includes(LEGACY_A_HEADER)) {
      legacyA.system.description.value = `${legacyADesc}${LEGACY_A_HEADER}${LEGACY_A_TEXT}`;
    }
    legacyA._stats = buildStats(now + 2, legacyA._stats);
    await abilitiesDb.put(legacyAKey, JSON.stringify(legacyA));

    const legacyBDesc = String(legacyB.system?.description?.value ?? '');
    if (!legacyBDesc.includes(LEGACY_B_HEADER)) {
      legacyB.system.description.value = `${legacyBDesc}${LEGACY_B_HEADER}${LEGACY_B_TEXT}`;
    }
    legacyB._stats = buildStats(now + 3, legacyB._stats);
    await abilitiesDb.put(legacyBKey, JSON.stringify(legacyB));

    const existingAbility1 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_1_ID}`);
    const existingAbility2 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_2_ID}`);
    const existingAbility3 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_3_ID}`);
    const existingAbility4 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_4_ID}`);

    const ability1 = buildAbilityDoc({
      id: ABILITY_1_ID,
      name: 'Abomination Manifestation',
      description:
        '<p><strong>Baseline (3 Spirituality):</strong> Bonus action. Assume an abomination war-form for 1 minute. You gain +10 feet speed, advantage on Strength checks/saves, and your melee/unarmed attacks deal extra psychic damage equal to <strong>Potency</strong> once per turn. Enemies that start their turn within 10 feet make a Wisdom save or have disadvantage on their first attack roll that turn.</p>' +
        '<p><strong>Higher Spend (upcast):</strong></p>' +
        '<ul>' +
        '<li><strong>+1 Spirituality:</strong> Aura radius becomes 15 feet and you gain temporary HP equal to <strong>Potency</strong>.</li>' +
        '<li><strong>+2 Spirituality:</strong> Duration becomes 10 minutes and you ignore difficult terrain created by curse effects.</li>' +
        '<li><strong>+4 Spirituality:</strong> Once per cast, emit an aberrant roar (20-foot radius). Creatures in area make a Wisdom save or become frightened until end of their next turn and cannot take reactions.</li>' +
        '</ul>' +
        '<p><em>Counterplay:</em> calm/fear immunity effects, anti-transformation wards, and forced disengagement blunt this pressure.</p>' +
        '<p><em>Corruption Hook:</em> Remaining in war-form after combat to spread panic among civilians grants 1 Corruption.</p>',
      img: 'icons/creatures/unholy/demon-horned-green.webp',
      activationType: 'bonus',
      durationValue: '1',
      durationUnits: 'minute',
      targetType: 'self',
      targetCount: '1',
      targetSpecial: 'self',
      rangeUnits: 'self',
      rangeValue: null,
      rangeSpecial: '',
      school: 'trs',
      properties: ['vocal', 'somatic'],
      materials: 'a chain-wrapped bone shard',
      identifier: 'lotm-prisoner-abomination-manifestation',
      activityId: 'prisonerSeq1Act001',
      now: now + 4,
      existing: existingAbility1,
      sort: 2000800
    });

    const ability2 = buildAbilityDoc({
      id: ABILITY_2_ID,
      name: 'Deviant Conversion',
      description:
        '<p><strong>Baseline (3 Spirituality):</strong> Action. Target one creature within 60 feet; it makes a Wisdom save. On failure, force a temporary deviant form until the end of your next turn: <strong>Werewolf</strong> (must use movement to approach nearest visible creature), <strong>Zombie</strong> (speed 10, no reactions), or <strong>Puppet</strong> (restrained and cannot speak). On success, it takes psychic damage equal to <strong>Potency</strong>.</p>' +
        '<p><strong>Higher Spend (upcast):</strong></p>' +
        '<ul>' +
        '<li><strong>+1 Spirituality:</strong> Affect one additional target within 15 feet of the first (separate save).</li>' +
        '<li><strong>+2 Spirituality:</strong> Duration becomes 1 minute (save ends each turn).</li>' +
        '<li><strong>+4 Spirituality:</strong> On a failed save by 5 or more, you may force one immediate basic attack against a legal target as part of the conversion (once per cast).</li>' +
        '</ul>' +
        '<p><em>Counterplay:</em> shape-stability protections and strong mental wards reduce conversion reliability.</p>' +
        '<p><em>Corruption Hook:</em> Converting surrendered enemies for entertainment grants 1 Corruption.</p>',
      img: 'icons/magic/control/debuff-energy-hold-levitate-yellow.webp',
      activationType: 'action',
      durationValue: '',
      durationUnits: 'inst',
      targetType: 'creature',
      targetCount: '1',
      targetSpecial: 'one creature for forced deviant conversion',
      rangeUnits: 'ft',
      rangeValue: '60',
      rangeSpecial: '',
      school: 'enc',
      properties: ['vocal', 'somatic', 'material'],
      materials: 'three tiny figurines bound by black thread',
      identifier: 'lotm-prisoner-deviant-conversion',
      activityId: 'prisonerSeq1Act002',
      now: now + 5,
      existing: existingAbility2,
      sort: 2000801
    });

    const ability3 = buildAbilityDoc({
      id: ABILITY_3_ID,
      name: 'Black Mire Seal',
      description:
        '<p><strong>Baseline (2 Spirituality):</strong> Action. Spread viscous cursed mire in a 20-foot-radius zone centered on a point within 60 feet for 1 minute (concentration). Hostile creatures entering or starting turn there make a Strength save. On failure, they are restrained until end of turn and cannot teleport until start of their next turn. If already restrained by your pathway, they also take psychic damage equal to <strong>Potency</strong>.</p>' +
        '<p><strong>Higher Spend (upcast):</strong></p>' +
        '<ul>' +
        '<li><strong>+1 Spirituality:</strong> Radius becomes 30 feet.</li>' +
        '<li><strong>+2 Spirituality:</strong> Duration becomes 10 minutes.</li>' +
        '<li><strong>+4 Spirituality:</strong> Once per round, raise one 10-foot-by-10-foot mire wall segment in the zone until start of your next turn; it grants heavy obscurement and counts as difficult terrain to cross.</li>' +
        '</ul>' +
        '<p><em>Counterplay:</em> flight, forced repositioning, and sanctified terrain can break seal control.</p>' +
        '<p><em>Corruption Hook:</em> Casting this across civilian escape routes for punishment grants 1 Corruption.</p>',
      img: 'icons/magic/earth/strike-fall-spikes-crystal.webp',
      activationType: 'action',
      durationValue: '1',
      durationUnits: 'minute',
      targetType: 'sphere',
      targetCount: '1',
      targetSpecial: '20-foot-radius cursed mire zone',
      rangeUnits: 'ft',
      rangeValue: '60',
      rangeSpecial: '',
      school: 'nec',
      properties: ['vocal', 'somatic', 'material', 'concentration'],
      materials: 'a vial of congealed black residue',
      identifier: 'lotm-prisoner-black-mire-seal',
      activityId: 'prisonerSeq1Act003',
      now: now + 6,
      existing: existingAbility3,
      sort: 2000802
    });

    const ability4 = buildAbilityDoc({
      id: ABILITY_4_ID,
      name: 'Invisible Curse',
      description:
        '<p><strong>Baseline (2 Spirituality):</strong> Action. Mark one creature within 120 feet that you can identify by true name, blood trace, or long-carried possession. Target makes a Wisdom save. On failure, it gains an invisible curse for 1 minute (save ends each turn): at start of turn it takes psychic damage equal to <strong>Potency</strong> and has disadvantage on its first d20 test that turn. On success, target takes half psychic damage and no ongoing effect.</p>' +
        '<p><strong>Higher Spend (upcast):</strong></p>' +
        '<ul>' +
        '<li><strong>+1 Spirituality:</strong> Affect one additional valid target.</li>' +
        '<li><strong>+2 Spirituality:</strong> Duration becomes 10 minutes.</li>' +
        '<li><strong>+4 Spirituality:</strong> Ignore line of sight when curse media is valid; the first time each cursed target drops below half HP, it becomes frightened of you until end of its next turn.</li>' +
        '</ul>' +
        '<p><em>Counterplay:</em> severing sympathy links, cleansing rituals, and anti-curse wards can expose/remove this effect.</p>' +
        '<p><em>Corruption Hook:</em> Executing invisible curses for personal grudges outside mission necessity grants 1 Corruption.</p>',
      img: 'icons/magic/death/skull-horned-worn-fire-blue.webp',
      activationType: 'action',
      durationValue: '1',
      durationUnits: 'minute',
      targetType: 'creature',
      targetCount: '1',
      targetSpecial: 'one creature identified through valid curse media',
      rangeUnits: 'ft',
      rangeValue: '120',
      rangeSpecial: '',
      school: 'nec',
      properties: ['vocal', 'somatic', 'material'],
      materials: 'a stitched strip of parchment holding the target trace',
      identifier: 'lotm-prisoner-invisible-curse',
      activityId: 'prisonerSeq1Act004',
      now: now + 7,
      existing: existingAbility4,
      sort: 2000803
    });

    await abilitiesDb.put(`!items!${ABILITY_1_ID}`, JSON.stringify(ability1));
    await abilitiesDb.put(`!items!${ABILITY_2_ID}`, JSON.stringify(ability2));
    await abilitiesDb.put(`!items!${ABILITY_3_ID}`, JSON.stringify(ability3));
    await abilitiesDb.put(`!items!${ABILITY_4_ID}`, JSON.stringify(ability4));

    const verifyPathway = await getOptionalJson(pathwaysDb, pathwayKey);
    const verifyFolder = await getOptionalJson(abilitiesDb, folderKey);
    const verifyLegacyA = await getOptionalJson(abilitiesDb, legacyAKey);
    const verifyLegacyB = await getOptionalJson(abilitiesDb, legacyBKey);
    const verify1 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_1_ID}`);
    const verify2 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_2_ID}`);
    const verify3 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_3_ID}`);
    const verify4 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_4_ID}`);

    console.log(
      JSON.stringify(
        {
          pathwayKey,
          pathwayId: verifyPathway?._id,
          pathwayIdentifier: verifyPathway?.system?.identifier,
          folderKey,
          folderId: verifyFolder?._id,
          folderName: verifyFolder?.name,
          folderLatestSequence: verifyFolder?.flags?.lotm?.latestAuthoredSequence,
          legacy: [
            {
              key: legacyAKey,
              id: verifyLegacyA?._id,
              name: verifyLegacyA?.name,
              hasLegacyHeader: String(verifyLegacyA?.system?.description?.value ?? '').includes(LEGACY_A_HEADER),
              grantedSequence: verifyLegacyA?.flags?.lotm?.grantedSequence,
              level: verifyLegacyA?.system?.level
            },
            {
              key: legacyBKey,
              id: verifyLegacyB?._id,
              name: verifyLegacyB?.name,
              hasLegacyHeader: String(verifyLegacyB?.system?.description?.value ?? '').includes(LEGACY_B_HEADER),
              grantedSequence: verifyLegacyB?.flags?.lotm?.grantedSequence,
              level: verifyLegacyB?.system?.level
            }
          ],
          abilityKeys: [`!items!${ABILITY_1_ID}`, `!items!${ABILITY_2_ID}`, `!items!${ABILITY_3_ID}`, `!items!${ABILITY_4_ID}`],
          abilityReadBack: [
            {
              _id: verify1?._id,
              name: verify1?.name,
              sourceClass: verify1?.system?.sourceClass,
              identifier: verify1?.system?.identifier,
              grantedSequence: verify1?.flags?.lotm?.grantedSequence,
              level: verify1?.system?.level,
              folder: verify1?.folder
            },
            {
              _id: verify2?._id,
              name: verify2?.name,
              sourceClass: verify2?.system?.sourceClass,
              identifier: verify2?.system?.identifier,
              grantedSequence: verify2?.flags?.lotm?.grantedSequence,
              level: verify2?.system?.level,
              folder: verify2?.folder
            },
            {
              _id: verify3?._id,
              name: verify3?.name,
              sourceClass: verify3?.system?.sourceClass,
              identifier: verify3?.system?.identifier,
              grantedSequence: verify3?.flags?.lotm?.grantedSequence,
              level: verify3?.system?.level,
              folder: verify3?.folder
            },
            {
              _id: verify4?._id,
              name: verify4?.name,
              sourceClass: verify4?.system?.sourceClass,
              identifier: verify4?.system?.identifier,
              grantedSequence: verify4?.flags?.lotm?.grantedSequence,
              level: verify4?.system?.level,
              folder: verify4?.folder
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
