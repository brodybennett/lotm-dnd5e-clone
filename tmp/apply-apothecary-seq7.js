const { ClassicLevel } = require('./node-tools/node_modules/classic-level');

const CORE_VERSION = '13.351';
const SYSTEM_ID = 'lotm';
const SYSTEM_VERSION = '5.2.6';
const MODIFIER = '0000000000000000';

const PATHWAY_KEY = '!items!lotmPathway00018';
const FOLDER_KEY = '!folders!y19Aib8B9WnjpCGl';
const PATHWAY_IDENTIFIER = 'lotm-apothecary';
const FOLDER_ID = 'y19Aib8B9WnjpCGl';

const LEGACY_A_KEY = '!items!lotmAbilityY9002';
const LEGACY_B_KEY = '!items!lotmAbilityY8001';

const ABILITY_1_KEY = '!items!lotmAbilityY7001';
const ABILITY_2_KEY = '!items!lotmAbilityY7002';
const ABILITY_3_KEY = '!items!lotmAbilityY7003';

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
      level: 2,
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
        grantedSequence: 7
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
    if (!pathway) throw new Error('Apothecary pathway (lotmPathway00018) not found.');

    pathway.system = pathway.system ?? {};
    pathway.system.description = pathway.system.description ?? { value: '', chat: '' };
    pathway.system.description.value =
      '<p><strong>Pathway Vector:</strong> serene moonlit alchemy through diagnosis, gentle stabilization, and quiet control of medicinal flora.</p>' +
      '<p><strong>Sequence 9 Package (Total Budget 2):</strong> Moonlit Distillation, Vital Herb Sight.</p>' +
      '<p><strong>Sequence 8 Package (Gain Budget +3):</strong> Beast Communion, Tranquil Menagerie, plus one legacy scope upgrade to Vital Herb Sight.</p>' +
      '<p><strong>Sequence 7 Package (Gain Budget +13):</strong> Wings of Darkness, Corrosive Claw, Abyss Shackles, plus two legacy upgrades (Vital Herb Sight and Beast Communion).</p>' +
      '<p><strong>Sequence 6-0 Status:</strong> Pending authoring in later sequence-focused runs.</p>' +
      '<p><strong>Continuity Anchor:</strong> At Sequence 7 (Vampire), Apothecary steps into moon-shadow vitality control: regenerative bloodcraft, nocturnal mobility, and restrained predatory command while retaining diagnostic and beast-bond foundations.</p>';
    pathway._stats = buildStats(now, pathway._stats);
    await pathwaysDb.put(PATHWAY_KEY, JSON.stringify(pathway));

    const folder = await getOptionalJson(abilitiesDb, FOLDER_KEY);
    if (!folder) throw new Error('Apothecary folder (y19Aib8B9WnjpCGl) not found.');

    folder.name = 'Apothecary';
    folder.description = 'Sequence abilities for the Apothecary pathway (authored through Sequence 7).';
    folder.flags = folder.flags ?? {};
    folder.flags.lotm = {
      ...(folder.flags.lotm ?? {}),
      pathwayIdentifier: PATHWAY_IDENTIFIER,
      latestAuthoredSequence: 7
    };
    folder._stats = buildStats(now + 1, folder._stats);
    await abilitiesDb.put(FOLDER_KEY, JSON.stringify(folder));

    const legacyA = await getOptionalJson(abilitiesDb, LEGACY_A_KEY);
    const legacyB = await getOptionalJson(abilitiesDb, LEGACY_B_KEY);
    if (!legacyA) throw new Error('Legacy target lotmAbilityY9002 not found.');
    if (!legacyB) throw new Error('Legacy target lotmAbilityY8001 not found.');

    const legacyAHeader = '<h3>Legacy Upgrade (Sequence 7 - Scope)</h3>';
    const legacyAText =
      '<p>At Sequence 7, your diagnostic sight rides crimson circulation traces through darkness. ' +
      'When you cast <strong>Vital Herb Sight</strong>, you may chain the read to one additional creature within 15 feet of the primary target if both are in dim light or darkness. ' +
      'If you spend at least <strong>+2 Spirituality</strong>, both targets can benefit from the chosen support rider instead of only one.</p>';
    const legacyADesc = String(legacyA.system?.description?.value ?? '');
    if (!legacyADesc.includes(legacyAHeader)) {
      legacyA.system.description.value = `${legacyADesc}${legacyAHeader}${legacyAText}`;
    }
    legacyA._stats = buildStats(now + 2, legacyA._stats);
    await abilitiesDb.put(LEGACY_A_KEY, JSON.stringify(legacyA));

    const legacyBHeader = '<h3>Legacy Upgrade (Sequence 7 - Efficiency)</h3>';
    const legacyBText =
      '<p>At Sequence 7, moon-calm beast bonds settle into instinctive cadence. ' +
      'With <strong>Beast Communion</strong>, maintaining one existing bonded Beast no longer requires your action economy each round. ' +
      'In dim light or darkness, the first <strong>+1 Spirituality</strong> surcharge you apply to Beast Communion each turn is reduced by 1 (minimum 0).</p>';
    const legacyBDesc = String(legacyB.system?.description?.value ?? '');
    if (!legacyBDesc.includes(legacyBHeader)) {
      legacyB.system.description.value = `${legacyBDesc}${legacyBHeader}${legacyBText}`;
    }
    legacyB._stats = buildStats(now + 3, legacyB._stats);
    await abilitiesDb.put(LEGACY_B_KEY, JSON.stringify(legacyB));

    const ability1Existing = await getOptionalJson(abilitiesDb, ABILITY_1_KEY);
    const ability2Existing = await getOptionalJson(abilitiesDb, ABILITY_2_KEY);
    const ability3Existing = await getOptionalJson(abilitiesDb, ABILITY_3_KEY);

    const ability1 = buildAbilityDoc({
      id: 'lotmAbilityY7001',
      name: 'Wings of Darkness',
      description:
        '<p><strong>Baseline (1 Spirituality):</strong> Bonus action. Condense nearby darkness into illusory bat-wings for 1 minute. You gain +10 feet movement speed, and while in dim light or darkness you may move through allied spaces without extra movement cost. Once per round after you move at least 10 feet, choose one: gain advantage on your next Medicine or Animal Handling check before end of turn, or gain temporary HP equal to <strong>Potency</strong>.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Gain a 20-foot flight speed while in dim light or darkness (descend safely at end of turn).</li><li><strong>+2 Spirituality:</strong> When you move, leave a 10-foot trail of drifting black mist until start of your next turn; enemies entering it have disadvantage on opportunity attacks.</li><li><strong>+4 Spirituality:</strong> For 1 minute, once per round you may dissolve into a swarm-like blur at movement start: move through hostile spaces and nonmagical bars narrower than 1 foot without provoking opportunity attacks.</li></ul><p><em>Counterplay:</em> bright sunlight, radiance wards, and forced illumination weaken these wings and remove flight riders.</p><p><em>Corruption Hook:</em> If you use this gift to stalk the helpless for amusement, gain 1 Corruption.</p>',
      img: 'icons/creatures/mammals/bats-moonlit-cluster.webp',
      activationType: 'bonus',
      durationValue: '1',
      durationUnits: 'minute',
      targetType: 'self',
      targetCount: '1',
      targetSpecial: '',
      rangeUnits: 'self',
      rangeValue: null,
      rangeSpecial: '',
      school: 'nec',
      properties: ['somatic'],
      materials: 'a bat-wing pattern drawn in soot on your glove',
      identifier: 'lotm-apothecary-wings-of-darkness',
      activityId: 'apothSeq7WingAct01',
      now: now + 4,
      existing: ability1Existing,
      sort: 1800200
    });

    const ability2 = buildAbilityDoc({
      id: 'lotmAbilityY7002',
      name: 'Corrosive Claw',
      description:
        '<p><strong>Baseline (1 Spirituality):</strong> Action. Your nails lengthen into moon-etched claws for 1 minute. Your unarmed strikes become finesse natural weapons that deal slashing damage equal to <strong>Potency</strong> and acid damage equal to <strong>Potency</strong>. On hit, choose one rider once per turn: reduce target armor effectiveness by 1 AC until start of your next turn (minimum AC 10), or prevent it from regaining HP until start of your next turn.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Reach with these claws becomes 10 feet and bonus acid damage increases by <strong>Potency</strong>.</li><li><strong>+2 Spirituality:</strong> On hit, target makes a Constitution save; on failure it has disadvantage on concentration checks and checks relying on grip/fine manipulation until end of its next turn.</li><li><strong>+4 Spirituality:</strong> For the duration, your claws ignore nonmagical resistance to slashing and acid damage, and once per round you may corrode a nonmagical object or barrier section (up to a 1-foot cube).</li></ul><p><em>Counterplay:</em> heavy purification effects, force barriers, and ranged pressure limit claw uptime and access.</p><p><em>Corruption Hook:</em> If you intentionally mutilate a surrendered target, gain 1 Corruption.</p>',
      img: 'icons/skills/melee/claws-protruding-glowing.webp',
      activationType: 'action',
      durationValue: '1',
      durationUnits: 'minute',
      targetType: 'self',
      targetCount: '1',
      targetSpecial: '',
      rangeUnits: 'self',
      rangeValue: null,
      rangeSpecial: '',
      school: 'nec',
      properties: ['somatic', 'material'],
      materials: 'a drop of preserved beast blood mixed with alkali',
      identifier: 'lotm-apothecary-corrosive-claw',
      activityId: 'apothSeq7ClawAct02',
      now: now + 5,
      existing: ability2Existing,
      sort: 1800201
    });

    const ability3 = buildAbilityDoc({
      id: 'lotmAbilityY7003',
      name: 'Abyss Shackles',
      description:
        '<p><strong>Baseline (1 Spirituality):</strong> Action. Condense darkness into silent shackles around one creature within 60 feet. The target makes a Strength save. On a failure, its speed becomes 0 and it cannot take reactions until the start of your next turn. If the target was in dim light or darkness, it also has disadvantage on its next attack roll.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Target one additional creature within 15 feet of the first (separate save), or extend range to 90 feet.</li><li><strong>+2 Spirituality:</strong> Duration becomes 1 minute. An affected target repeats the save at end of each turn, ending on success.</li><li><strong>+4 Spirituality:</strong> While shackled, the target cannot turn invisible or teleport, and at the start of each of its turns it takes psychic damage equal to <strong>Potency</strong> if it remains in dim light or darkness.</li></ul><p><em>Counterplay:</em> strong illumination, teleportation wards already in place, and raw Strength can break early restraint.</p><p><em>Corruption Hook:</em> If you bind a harmless creature only to feed on fear, gain 1 Corruption.</p>',
      img: 'icons/magic/control/debuff-chains-shackles-movement.webp',
      activationType: 'action',
      durationValue: '',
      durationUnits: 'inst',
      targetType: 'creature',
      targetCount: '1',
      targetSpecial: '',
      rangeUnits: 'ft',
      rangeValue: '60',
      rangeSpecial: '',
      school: 'nec',
      properties: ['vocal', 'somatic'],
      materials: 'a black chain link soaked in herb tincture',
      identifier: 'lotm-apothecary-abyss-shackles',
      activityId: 'apothSeq7ShackleAct03',
      now: now + 6,
      existing: ability3Existing,
      sort: 1800202
    });

    await abilitiesDb.put(ABILITY_1_KEY, JSON.stringify(ability1));
    await abilitiesDb.put(ABILITY_2_KEY, JSON.stringify(ability2));
    await abilitiesDb.put(ABILITY_3_KEY, JSON.stringify(ability3));

    const verifyPathway = await getOptionalJson(pathwaysDb, PATHWAY_KEY);
    const verifyFolder = await getOptionalJson(abilitiesDb, FOLDER_KEY);
    const verifyLegacyA = await getOptionalJson(abilitiesDb, LEGACY_A_KEY);
    const verifyLegacyB = await getOptionalJson(abilitiesDb, LEGACY_B_KEY);
    const verifyAbility1 = await getOptionalJson(abilitiesDb, ABILITY_1_KEY);
    const verifyAbility2 = await getOptionalJson(abilitiesDb, ABILITY_2_KEY);
    const verifyAbility3 = await getOptionalJson(abilitiesDb, ABILITY_3_KEY);

    console.log(
      JSON.stringify(
        {
          pathwayKey: PATHWAY_KEY,
          pathwayId: verifyPathway?._id,
          pathwayIdentifier: verifyPathway?.system?.identifier,
          folderKey: FOLDER_KEY,
          folderId: verifyFolder?._id,
          folderName: verifyFolder?.name,
          legacyUpdated: [
            {
              key: LEGACY_A_KEY,
              id: verifyLegacyA?._id,
              name: verifyLegacyA?.name,
              hasLegacyHeader: String(verifyLegacyA?.system?.description?.value ?? '').includes(
                legacyAHeader
              ),
              grantedSequence: verifyLegacyA?.flags?.lotm?.grantedSequence,
              level: verifyLegacyA?.system?.level
            },
            {
              key: LEGACY_B_KEY,
              id: verifyLegacyB?._id,
              name: verifyLegacyB?.name,
              hasLegacyHeader: String(verifyLegacyB?.system?.description?.value ?? '').includes(
                legacyBHeader
              ),
              grantedSequence: verifyLegacyB?.flags?.lotm?.grantedSequence,
              level: verifyLegacyB?.system?.level
            }
          ],
          abilityKeys: [ABILITY_1_KEY, ABILITY_2_KEY, ABILITY_3_KEY],
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
