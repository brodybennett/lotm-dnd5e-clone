const { ClassicLevel } = require('./node-tools/node_modules/classic-level');

const CORE_VERSION = '13.351';
const SYSTEM_ID = 'lotm';
const SYSTEM_VERSION = '5.2.6';
const MODIFIER = '0000000000000000';

const PATHWAY_KEY = '!items!lotmPathway00019';
const FOLDER_KEY = '!folders!tYIG59nsaRs7qkLm';
const PATHWAY_IDENTIFIER = 'lotm-criminal';
const FOLDER_ID = 'tYIG59nsaRs7qkLm';

const LEGACY_A_KEY = '!items!lotmAbilityK8001'; // Demonic Attribute (2+ sequences below)
const LEGACY_B_KEY = '!items!lotmAbilityK6002'; // Language of Foulness

const ABILITY_1_ID = 'lotmAbilityK5001';
const ABILITY_2_ID = 'lotmAbilityK5002';
const ABILITY_3_ID = 'lotmAbilityK5003';

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
      level: 4,
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
        grantedSequence: 5
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
    pathway.system.description.value =
      '<p><strong>Pathway Vector:</strong> ruthless predation through cold intent, blood-soaked intimidation, and domination of weakness and desire.</p>' +
      '<p><strong>Sequence 6 Package (Gain Budget +9):</strong> Malice Premonition, Language of Foulness, Sulfur Fireball, plus two legacy upgrades.</p>' +
      '<p><strong>Sequence 5 Package (Gain Budget +13):</strong> Desire Control, Defiling Seed, Desire Incarnation, plus two legacy upgrades (Demonic Attribute and Language of Foulness).</p>' +
      '<p><strong>Continuity Anchor:</strong> At Sequence 5 (Desire Apostle), Devil-tier brutality advances into active desire governance: coercive emotional catalysis, seeded corruption, and semi-liquid incarnate survival pressure.</p>' +
      '<p><strong>Authoring Status:</strong> Sequence 5 authored in this run; remaining sequences continue in sequence-focused runs.</p>';
    pathway._stats = buildStats(now, pathway._stats);
    await pathwaysDb.put(PATHWAY_KEY, JSON.stringify(pathway));

    const folder = await getOptionalJson(abilitiesDb, FOLDER_KEY);
    if (!folder) throw new Error('Criminal folder (tYIG59nsaRs7qkLm) not found.');

    folder.name = 'Criminal';
    folder.description = 'Sequence abilities for the Criminal pathway (authored through Sequence 5).';
    folder.flags = folder.flags ?? {};
    folder.flags.lotm = {
      ...(folder.flags.lotm ?? {}),
      pathwayIdentifier: PATHWAY_IDENTIFIER,
      latestAuthoredSequence: 5
    };
    folder._stats = buildStats(now + 1, folder._stats);
    await abilitiesDb.put(FOLDER_KEY, JSON.stringify(folder));

    const legacyA = await getOptionalJson(abilitiesDb, LEGACY_A_KEY);
    const legacyB = await getOptionalJson(abilitiesDb, LEGACY_B_KEY);
    if (!legacyA) throw new Error('Legacy target lotmAbilityK8001 not found.');
    if (!legacyB) throw new Error('Legacy target lotmAbilityK6002 not found.');

    const legacyAHeader = '<h3>Legacy Upgrade (Sequence 5 - Scope)</h3>';
    const legacyAText =
      '<p>At Sequence 5, <strong>Demonic Attribute</strong> can impose desire pressure in an area. ' +
      'When Demonic Attribute is active and you spend at least <strong>+2 Spirituality</strong> on any Criminal ability, ' +
      'creatures of your choice within 10 feet of you that can see you must pass a Wisdom save or suffer disadvantage on their next check or save against fear, coercion, or charm effects before the end of their next turn.</p>';
    const legacyADescription = String(legacyA.system?.description?.value ?? '');
    if (!legacyADescription.includes(legacyAHeader)) {
      legacyA.system.description.value = `${legacyADescription}${legacyAHeader}${legacyAText}`;
    }
    legacyA._stats = buildStats(now + 2, legacyA._stats);
    await abilitiesDb.put(LEGACY_A_KEY, JSON.stringify(legacyA));

    const legacyBHeader = '<h3>Legacy Upgrade (Sequence 5 - Efficiency)</h3>';
    const legacyBText =
      '<p>At Sequence 5, <strong>Language of Foulness</strong> flows into chained coercion with less drain. ' +
      'Once per round, when Language of Foulness forces at least one failed save, reduce the next <strong>+1 Spirituality</strong> surcharge you pay on a Criminal ability before the end of your turn by 1 (minimum 0). ' +
      'If your next ability is Desire Control or Defiling Seed, also increase its range by 10 feet.</p>';
    const legacyBDescription = String(legacyB.system?.description?.value ?? '');
    if (!legacyBDescription.includes(legacyBHeader)) {
      legacyB.system.description.value = `${legacyBDescription}${legacyBHeader}${legacyBText}`;
    }
    legacyB._stats = buildStats(now + 3, legacyB._stats);
    await abilitiesDb.put(LEGACY_B_KEY, JSON.stringify(legacyB));

    const existing1 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_1_ID}`);
    const existing2 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_2_ID}`);
    const existing3 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_3_ID}`);

    const ability1 = buildAbilityDoc({
      id: ABILITY_1_ID,
      name: 'Desire Control',
      description:
        '<p><strong>Baseline (1 Spirituality):</strong> Action. Target one creature within 60 feet that can see or hear you. It makes a Wisdom save. On failure, choose one catalyzed desire until the end of its next turn: <strong>Fear</strong> (cannot willingly move closer to you and has disadvantage on attack rolls against you), <strong>Greed</strong> (must spend its first 10 feet of movement toward a chosen object/space and cannot take reactions), or <strong>Wrath</strong> (disadvantage on checks/saves to maintain concentration and on Wisdom checks).</p>' +
        '<p><strong>Higher Spend (upcast):</strong></p><ul>' +
        '<li><strong>+1 Spirituality:</strong> target one additional creature within 15 feet of the first (separate save).</li>' +
        '<li><strong>+2 Spirituality:</strong> duration becomes 1 minute (save ends at end of each affected turn).</li>' +
        '<li><strong>+4 Spirituality:</strong> when an affected target fails its save, you may immediately command one movement or object interaction (no self-harm orders); if it refuses due to immunity or restriction, it takes psychic damage equal to <strong>Potency</strong>.</li>' +
        '</ul><p><em>Counterplay:</em> charm/fear immunity, mind-shield effects, and obscured communication lines reduce control reliability.</p>' +
        '<p><em>Corruption Hook:</em> if you escalate private desires to break innocents for amusement, gain 1 Corruption.</p>',
      img: 'icons/magic/control/control-influence-rally-purple.webp',
      activationType: 'action',
      durationValue: '',
      durationUnits: 'inst',
      targetType: 'creature',
      targetCount: '1',
      targetSpecial: 'creature that can see or hear you',
      rangeUnits: 'ft',
      rangeValue: '60',
      rangeSpecial: '',
      school: 'enc',
      properties: ['vocal', 'somatic'],
      materials: 'a thorn wrapped in black silk',
      identifier: 'lotm-criminal-desire-control',
      activityId: 'criminalSeq5Desire01',
      now: now + 4,
      existing: existing1,
      sort: 1900400
    });

    const ability2 = buildAbilityDoc({
      id: ABILITY_2_ID,
      name: 'Defiling Seed',
      description:
        '<p><strong>Baseline (1 Spirituality):</strong> Action. Plant a hidden defiling seed in one creature within 60 feet (Charisma save negates). For 1 minute, whenever the seeded creature takes damage or fails a save, it suffers psychic damage equal to <strong>Potency</strong> and cannot benefit from advantage on its next d20 test before the end of its next turn.</p>' +
        '<p><strong>Higher Spend (upcast):</strong></p><ul>' +
        '<li><strong>+1 Spirituality:</strong> target one additional creature within range (separate save).</li>' +
        '<li><strong>+2 Spirituality:</strong> on seed trigger, choose to either reduce speed by 10 feet or impose disadvantage on the next Wisdom save before end of its next turn.</li>' +
        '<li><strong>+4 Spirituality:</strong> at the end of the effect or when the seeded target drops to 0 HP, the seed ruptures in a 10-foot radius; creatures in the burst make a Wisdom save or take psychic damage equal to <strong>Potency</strong> and become Frightened of you until the end of their next turn.</li>' +
        '</ul><p><em>Counterplay:</em> cleanse effects, strong Charisma defenses, and immunity to fear/psychic pressure blunt the seed.</p>' +
        '<p><em>Corruption Hook:</em> if you seed victims solely to prolong suffering after victory is secured, gain 1 Corruption.</p>',
      img: 'icons/magic/nature/root-vine-swirling-thorns.webp',
      activationType: 'action',
      durationValue: '1',
      durationUnits: 'minute',
      targetType: 'creature',
      targetCount: '1',
      targetSpecial: '',
      rangeUnits: 'ft',
      rangeValue: '60',
      rangeSpecial: '',
      school: 'nec',
      properties: ['vocal', 'somatic', 'material'],
      materials: 'a drop of blood and a scorched black seed husk',
      identifier: 'lotm-criminal-defiling-seed',
      activityId: 'criminalSeq5Seed02',
      now: now + 5,
      existing: existing2,
      sort: 1900401
    });

    const ability3 = buildAbilityDoc({
      id: ABILITY_3_ID,
      name: 'Desire Incarnation',
      description:
        '<p><strong>Baseline (1 Spirituality):</strong> Bonus action. Transform into a thick, shadowy-liquid incarnation of condensed desire for 1 minute. While transformed, you gain resistance to nonmagical bludgeoning/piercing/slashing damage, advantage on checks to escape grapple/restraint, and can move through openings as narrow as 1 inch. Your voice becomes layered and unsettling; you gain advantage on Intimidation checks.</p>' +
        '<p><strong>Higher Spend (upcast):</strong></p><ul>' +
        '<li><strong>+1 Spirituality:</strong> movement speed increases by 10 feet and you can move through hostile creature spaces (cannot end there).</li>' +
        '<li><strong>+2 Spirituality:</strong> enemies that start their turn within 5 feet must make a Wisdom save or take psychic damage equal to <strong>Potency</strong> and suffer disadvantage on their next save against fear/charm before end of turn.</li>' +
        '<li><strong>+4 Spirituality:</strong> once per round when you would take damage, reduce that damage by <strong>Potency + proficiency bonus</strong>; if reduced to 0, you may immediately move 10 feet without provoking opportunity attacks.</li>' +
        '</ul><p><em>Counterplay:</em> force effects, sanctified barriers, and anti-transformation fields restrict incarnation mobility.</p>' +
        '<p><em>Corruption Hook:</em> if you weaponize incarnation to terrorize defenseless civilians, gain 1 Corruption.</p>',
      img: 'icons/magic/death/undead-ghost-scream-teal.webp',
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
      materials: 'a strip of blackened skin parchment',
      identifier: 'lotm-criminal-desire-incarnation',
      activityId: 'criminalSeq5Incarnation03',
      now: now + 6,
      existing: existing3,
      sort: 1900402
    });

    await abilitiesDb.put(`!items!${ABILITY_1_ID}`, JSON.stringify(ability1));
    await abilitiesDb.put(`!items!${ABILITY_2_ID}`, JSON.stringify(ability2));
    await abilitiesDb.put(`!items!${ABILITY_3_ID}`, JSON.stringify(ability3));

    const verifyPathway = await getOptionalJson(pathwaysDb, PATHWAY_KEY);
    const verifyFolder = await getOptionalJson(abilitiesDb, FOLDER_KEY);
    const verifyLegacyA = await getOptionalJson(abilitiesDb, LEGACY_A_KEY);
    const verifyLegacyB = await getOptionalJson(abilitiesDb, LEGACY_B_KEY);
    const verify1 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_1_ID}`);
    const verify2 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_2_ID}`);
    const verify3 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_3_ID}`);

    console.log(
      JSON.stringify(
        {
          pathwayKey: PATHWAY_KEY,
          pathwayId: verifyPathway?._id,
          pathwayIdentifier: verifyPathway?.system?.identifier,
          folderKey: FOLDER_KEY,
          folderId: verifyFolder?._id,
          folderName: verifyFolder?.name,
          folderLatestSequence: verifyFolder?.flags?.lotm?.latestAuthoredSequence,
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
          abilityKeys: [
            `!items!${ABILITY_1_ID}`,
            `!items!${ABILITY_2_ID}`,
            `!items!${ABILITY_3_ID}`
          ],
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
            },
            {
              id: verify3?._id,
              name: verify3?.name,
              sourceClass: verify3?.system?.sourceClass,
              identifier: verify3?.system?.identifier,
              grantedSequence: verify3?.flags?.lotm?.grantedSequence,
              level: verify3?.system?.level,
              folder: verify3?.folder
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
