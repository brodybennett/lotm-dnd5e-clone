const { ClassicLevel } = require('./node-tools/node_modules/classic-level');

const CORE_VERSION = '13.351';
const SYSTEM_ID = 'lotm';
const SYSTEM_VERSION = '5.2.6';
const MODIFIER = '0000000000000000';

const PATHWAY_NAME = 'Savant';
const PATHWAY_IDENTIFIER = 'lotm-savant';
const DEFAULT_PATHWAY_ID = 'lotmPathway00015';
const FOLDER_ID = 'UYUzB1Ws2OvdbFzG';

const LEGACY_A_ID = 'lotmAbilityT5003';
const LEGACY_B_ID = 'lotmAbilityT6003';

const ABILITY_1_ID = 'lotmAbilityT4001';
const ABILITY_2_ID = 'lotmAbilityT4002';
const ABILITY_3_ID = 'lotmAbilityT4003';
const ABILITY_4_ID = 'lotmAbilityT4004';

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
      level: 5,
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
        grantedSequence: 4
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
    if (!pathway) throw new Error(`Savant pathway (${pathwayKey}) not found.`);

    pathway.system = pathway.system ?? {};
    pathway.system.description = pathway.system.description ?? { value: '', chat: '' };
    pathway.system.description.value =
      '<p><strong>Pathway Vector:</strong> engineered problem-solving through technical literacy, memory discipline, and precise process control under pressure.</p>' +
      '<p><strong>Sequence 9 Package (Total Budget 2):</strong> Mechanics Comprehension, Precision Recall.</p>' +
      '<p><strong>Sequence 8 Package (Gain Budget +3):</strong> Adaption, Strata Appraisal, plus one legacy potency upgrade to Precision Recall.</p>' +
      '<p><strong>Sequence 7 Package (Gain Budget +13):</strong> Strengthened Knowledge, Ruin Route Solver, Memory Indexing, plus two legacy upgrades (Adaption and Strata Appraisal).</p>' +
      '<p><strong>Sequence 6 Package (Gain Budget +9):</strong> Manufacturing, Artifact Calibration, Ritual Fixture Integration, plus two legacy upgrades (Ruin Route Solver and Adaption).</p>' +
      '<p><strong>Sequence 5 Package (Gain Budget +13):</strong> Astronomy, False Constellations, Star of Curses, Blessing of Stars, plus two legacy upgrades (Memory Indexing and Manufacturing).</p>' +
      '<p><strong>Sequence 4 Package (Gain Budget +33):</strong> Alchemy, Soul Infusion, Rapid Fabrication, Mechanical Body Retrofit, plus two legacy upgrades (Star of Curses and Ritual Fixture Integration).</p>' +
      '<p><strong>Sequence 3-0 Status:</strong> Pending authoring in later sequence-focused runs.</p>' +
      '<p><strong>Continuity Anchor:</strong> At Sequence 4 (Alchemist), Savant transitions from celestial battlefield modeling to demigod-grade engineered life creation and large-scale fabrication control.</p>';
    pathway._stats = buildStats(now, pathway._stats);
    await pathwaysDb.put(pathwayKey, JSON.stringify(pathway));

    const folderKey = `!folders!${FOLDER_ID}`;
    const folder = await getOptionalJson(abilitiesDb, folderKey);
    if (!folder) throw new Error(`Savant folder (${FOLDER_ID}) not found.`);

    folder.name = PATHWAY_NAME;
    folder.description = 'Sequence abilities for the Savant pathway (authored through Sequence 4).';
    folder.flags = folder.flags ?? {};
    folder.flags.lotm = {
      ...(folder.flags.lotm ?? {}),
      pathwayIdentifier: PATHWAY_IDENTIFIER,
      latestAuthoredSequence: 4
    };
    folder._stats = buildStats(now + 1, folder._stats);
    await abilitiesDb.put(folderKey, JSON.stringify(folder));

    const legacyAKey = `!items!${LEGACY_A_ID}`;
    const legacyBKey = `!items!${LEGACY_B_ID}`;
    const legacyA = await getOptionalJson(abilitiesDb, legacyAKey);
    const legacyB = await getOptionalJson(abilitiesDb, legacyBKey);
    if (!legacyA) throw new Error(`Legacy target ${LEGACY_A_ID} not found.`);
    if (!legacyB) throw new Error(`Legacy target ${LEGACY_B_ID} not found.`);

    const legacyAHeader = '<h3>Legacy Upgrade (Sequence 4 - Potency)</h3>';
    const legacyAText =
      '<p>At Sequence 4, Star of Curses is refined into a calibrated demigod curse lattice. ' +
      'When a marked target fails its end-of-turn save, it takes additional force damage equal to <strong>Potency</strong> and cannot regain reactions until the start of its next turn. ' +
      'If Star of Curses was cast with <strong>+2 Spirituality</strong> or more, one active fault condition intensifies by one step (numeric penalties scale by +Potency once per round).</p>';
    const legacyADescription = String(legacyA.system?.description?.value ?? '');
    if (!legacyADescription.includes(legacyAHeader)) {
      legacyA.system.description.value = `${legacyADescription}${legacyAHeader}${legacyAText}`;
    }
    legacyA._stats = buildStats(now + 2, legacyA._stats);
    await abilitiesDb.put(legacyAKey, JSON.stringify(legacyA));

    const legacyBHeader = '<h3>Legacy Upgrade (Sequence 4 - Scope)</h3>';
    const legacyBText =
      '<p>At Sequence 4, Ritual Fixture Integration scales into an alchemical relay grid. ' +
      'Anchor Port and Trigger Port effects may now be chained across up to three prepared fixtures within 300 feet. ' +
      'When cast with <strong>+2 Spirituality</strong> or more, one linked fixture can host a temporary alchemical doll interface that executes one integrated trigger as if you were present.</p>';
    const legacyBDescription = String(legacyB.system?.description?.value ?? '');
    if (!legacyBDescription.includes(legacyBHeader)) {
      legacyB.system.description.value = `${legacyBDescription}${legacyBHeader}${legacyBText}`;
    }
    legacyB._stats = buildStats(now + 3, legacyB._stats);
    await abilitiesDb.put(legacyBKey, JSON.stringify(legacyB));

    const existingAbility1 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_1_ID}`);
    const existingAbility2 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_2_ID}`);
    const existingAbility3 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_3_ID}`);
    const existingAbility4 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_4_ID}`);

    const ability1 = buildAbilityDoc({
      id: ABILITY_1_ID,
      name: 'Alchemy',
      description:
        '<p><strong>Baseline (1 Spirituality):</strong> Action. Execute an alchemical build cycle on one prepared object or fixture within 30 feet. Choose one result for 10 minutes:</p><ul><li><strong>Animated Tool:</strong> object gains a simple action profile (carry, pull lever, hold line, or deliver an item) under your commands.</li><li><strong>Reactive Shield Node:</strong> object grants +1 AC to one adjacent ally and can absorb damage equal to Potency once per round.</li><li><strong>Hazard Processor:</strong> object converts one environmental hazard in 10 feet into difficult terrain for enemies only.</li></ul><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> run one additional alchemical result on the same target.</li><li><strong>+2 Spirituality:</strong> duration becomes 1 hour and all numeric +1 bonuses become <strong>+Potency</strong>.</li><li><strong>+4 Spirituality:</strong> create a demigod-grade temporary alchemical construct that can execute one bonus action command each round for 1 minute.</li></ul><p><em>Counterplay:</em> anti-life wards, purity-null fields, and material mismatch can degrade animated outputs.</p><p><em>Corruption Hook:</em> if you drain life from protected civilians to power alchemical cycles, gain 1 Corruption.</p>',
      img: 'icons/skills/trades/smithing-anvil-silver-red.webp',
      activationType: 'action',
      durationValue: '10',
      durationUnits: 'minute',
      targetType: 'object',
      targetCount: '1',
      targetSpecial: 'prepared object or fixture for alchemical infusion',
      rangeUnits: 'ft',
      rangeValue: '30',
      rangeSpecial: '',
      school: 'trs',
      properties: ['vocal', 'somatic', 'material'],
      materials: 'an alchemical catalyst vial and one soul-safe tuning plate',
      identifier: 'lotm-savant-alchemy',
      activityId: 'savantSeq4AlcAct01',
      now: now + 4,
      existing: existingAbility1,
      sort: 1200500
    });

    const ability2 = buildAbilityDoc({
      id: ABILITY_2_ID,
      name: 'Soul Infusion',
      description:
        '<p><strong>Baseline (1 Spirituality):</strong> Action. Bind a remnant soul fragment to one alchemical shell, doll, or machine frame within 30 feet for 1 minute. The infused unit gains mobility, can understand one-step instructions, and can take one of these commands each round: assist, intercept, or relay.</p><ul><li><strong>Assist:</strong> grant +1 on one allied check tied to tools, mechanisms, or ritual handling.</li><li><strong>Intercept:</strong> impose -1 on one attack against an ally within 10 feet of the unit.</li><li><strong>Relay:</strong> transmit one bounded phrase or signal through linked fixtures.</li></ul><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> issue two command types each round instead of one.</li><li><strong>+2 Spirituality:</strong> numeric +1/-1 values become <strong>+Potency/-Potency</strong>, and command range from unit becomes 30 feet.</li><li><strong>+4 Spirituality:</strong> sustain infusion for 10 minutes; if the infused unit is destroyed, release a controlled burst that either pushes enemies 10 feet or restores Spirituality equal to Potency to one ally in 10 feet.</li></ul><p><em>Counterplay:</em> soul severance effects, possession interdiction, and high-grade sanctified zones disrupt the bind.</p><p><em>Corruption Hook:</em> if you bind unwilling or stolen soul fragments, gain 1 Corruption.</p>',
      img: 'icons/magic/death/undead-skeleton-fire-green.webp',
      activationType: 'action',
      durationValue: '1',
      durationUnits: 'minute',
      targetType: 'object',
      targetCount: '1',
      targetSpecial: 'alchemical shell, doll, or machine frame',
      rangeUnits: 'ft',
      rangeValue: '30',
      rangeSpecial: '',
      school: 'nec',
      properties: ['vocal', 'somatic', 'material'],
      materials: 'a sealed spirit ampoule and engraved copper thread',
      identifier: 'lotm-savant-soul-infusion',
      activityId: 'savantSeq4SouAct02',
      now: now + 5,
      existing: existingAbility2,
      sort: 1200501
    });

    const ability3 = buildAbilityDoc({
      id: ABILITY_3_ID,
      name: 'Rapid Fabrication',
      description:
        '<p><strong>Baseline (0 Spirituality):</strong> Bonus action. Convert nearby raw materials into temporary dolls or objects for 10 minutes. Choose one output package:</p><ul><li><strong>Utility Package:</strong> create two small helper dolls that can carry gear, place anchors, or trigger prepared levers.</li><li><strong>Barrier Package:</strong> create three waist-high panels that provide half cover and can be rearranged as a bonus action.</li><li><strong>Disruption Package:</strong> create one jammer object in a 10-foot zone, causing -1 on hostile lock-on, perception, or concentration checks tied to machinery.</li></ul><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> select one additional output package.</li><li><strong>+2 Spirituality:</strong> temporary objects become reinforced; they gain HP equal to Potency x 3 and numeric -1 penalties become <strong>-Potency</strong>.</li><li><strong>+4 Spirituality:</strong> fabricate a major doll chassis for 1 minute that can body-block one medium creature lane and execute one shove, grapple, or item-use action each round.</li></ul><p><em>Counterplay:</em> material starvation, corrosive zones, and structure-collapse effects can prematurely dismantle fabricated assets.</p><p><em>Corruption Hook:</em> if you secretly embed surveillance channels in all rapid-fabricated tools used by allies, gain 1 Corruption.</p>',
      img: 'icons/commodities/tech/cog-brass.webp',
      activationType: 'bonus',
      durationValue: '10',
      durationUnits: 'minute',
      targetType: 'space',
      targetCount: '1',
      targetSpecial: 'work area with available raw materials',
      rangeUnits: 'ft',
      rangeValue: '30',
      rangeSpecial: '',
      school: 'con',
      properties: ['somatic', 'material'],
      materials: 'scrap metal, resin powder, and keyed assembly tags',
      identifier: 'lotm-savant-rapid-fabrication',
      activityId: 'savantSeq4RapAct03',
      now: now + 6,
      existing: existingAbility3,
      sort: 1200502
    });

    const ability4 = buildAbilityDoc({
      id: ABILITY_4_ID,
      name: 'Mechanical Body Retrofit',
      description:
        '<p><strong>Baseline (1 Spirituality):</strong> Action. Retrofit yourself or one willing ally within 10 feet with a temporary mechanical body module for 1 minute. Choose one module:</p><ul><li><strong>Cannon Module:</strong> gain a ranged attack (60 ft) dealing force damage equal to Potency + proficiency bonus once per round.</li><li><strong>Flight Module:</strong> gain flying speed equal to walking speed, but must end movement on stable ground or a prepared platform.</li><li><strong>Tool Armature Module:</strong> gain advantage on one tool check per round and +1 AC against traps/construct attacks.</li></ul><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> install a second module on the same target.</li><li><strong>+2 Spirituality:</strong> duration becomes 10 minutes, and numeric +1 values become <strong>+Potency</strong>.</li><li><strong>+4 Spirituality:</strong> install one synchronized overflow module; once per round the target may either make one extra cannon shot at reduced damage (Potency only) or perform one additional 10-foot flight vector after taking an action.</li></ul><p><em>Counterplay:</em> electromagnetic disruption, anti-construct pulses, and overload baiting can disable retrofit modules early.</p><p><em>Corruption Hook:</em> if you coerce unwilling subjects into retrofit trials, gain 1 Corruption.</p>',
      img: 'icons/magic/control/debuff-chains-ropes-blue.webp',
      activationType: 'action',
      durationValue: '1',
      durationUnits: 'minute',
      targetType: 'ally',
      targetCount: '1',
      targetSpecial: 'you or one willing ally for module retrofit',
      rangeUnits: 'ft',
      rangeValue: '10',
      rangeSpecial: '',
      school: 'abj',
      properties: ['vocal', 'somatic', 'material'],
      materials: 'modular braces, flux wire, and one calibrated core',
      identifier: 'lotm-savant-mechanical-body-retrofit',
      activityId: 'savantSeq4MecAct04',
      now: now + 7,
      existing: existingAbility4,
      sort: 1200503
    });

    await abilitiesDb.put(`!items!${ABILITY_1_ID}`, JSON.stringify(ability1));
    await abilitiesDb.put(`!items!${ABILITY_2_ID}`, JSON.stringify(ability2));
    await abilitiesDb.put(`!items!${ABILITY_3_ID}`, JSON.stringify(ability3));
    await abilitiesDb.put(`!items!${ABILITY_4_ID}`, JSON.stringify(ability4));

    const verifyPathway = await getOptionalJson(pathwaysDb, pathwayKey);
    const verifyFolder = await getOptionalJson(abilitiesDb, folderKey);
    const verifyLegacyA = await getOptionalJson(abilitiesDb, legacyAKey);
    const verifyLegacyB = await getOptionalJson(abilitiesDb, legacyBKey);
    const verifyAbility1 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_1_ID}`);
    const verifyAbility2 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_2_ID}`);
    const verifyAbility3 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_3_ID}`);
    const verifyAbility4 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_4_ID}`);

    const legacyAApplied = String(verifyLegacyA?.system?.description?.value ?? '').includes(legacyAHeader);
    const legacyBApplied = String(verifyLegacyB?.system?.description?.value ?? '').includes(legacyBHeader);

    console.log(
      JSON.stringify(
        {
          pathwayKey,
          pathwayId: verifyPathway?._id,
          pathwayIdentifier: verifyPathway?.system?.identifier,
          folderKey,
          folderId: verifyFolder?._id,
          folderFlags: verifyFolder?.flags?.lotm,
          legacyUpdated: [
            { key: legacyAKey, applied: legacyAApplied },
            { key: legacyBKey, applied: legacyBApplied }
          ],
          abilityKeys: [
            `!items!${ABILITY_1_ID}`,
            `!items!${ABILITY_2_ID}`,
            `!items!${ABILITY_3_ID}`,
            `!items!${ABILITY_4_ID}`
          ],
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
            },
            {
              _id: verifyAbility4?._id,
              name: verifyAbility4?.name,
              folder: verifyAbility4?.folder,
              sourceClass: verifyAbility4?.system?.sourceClass,
              grantedSequence: verifyAbility4?.flags?.lotm?.grantedSequence,
              level: verifyAbility4?.system?.level
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
