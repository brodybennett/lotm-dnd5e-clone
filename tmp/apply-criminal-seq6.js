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
const LEGACY_B_KEY = '!items!lotmAbilityK7002'; // Malice Interference

const ABILITY_1_ID = 'lotmAbilityK6001';
const ABILITY_2_ID = 'lotmAbilityK6002';
const ABILITY_3_ID = 'lotmAbilityK6003';

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
      level: 3,
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
        grantedSequence: 6
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
      '<p><strong>Sequence 7 Package (Gain Budget +13):</strong> Killing Spree Script, Malice Interference, Devil Projection Rite, plus two legacy upgrades.</p>' +
      '<p><strong>Sequence 6 Package (Gain Budget +9):</strong> Malice Premonition, Language of Foulness, Sulfur Fireball, plus two legacy upgrades (Demonic Attribute and Malice Interference).</p>' +
      '<p><strong>Continuity Anchor:</strong> At Sequence 6 (Devil), Serial Killer ritual brutality consolidates into battlefield foresight, foul demonic speech, and volatile sulfur-fire pressure while retaining the pathway&apos;s predatory coercion identity.</p>' +
      '<p><strong>Authoring Status:</strong> Sequence 6 authored in this run; remaining sequences continue in sequence-focused runs.</p>';
    pathway._stats = buildStats(now, pathway._stats);
    await pathwaysDb.put(PATHWAY_KEY, JSON.stringify(pathway));

    const folder = await getOptionalJson(abilitiesDb, FOLDER_KEY);
    if (!folder) throw new Error('Criminal folder (tYIG59nsaRs7qkLm) not found.');

    folder.name = 'Criminal';
    folder.description = 'Sequence abilities for the Criminal pathway (authored through Sequence 6).';
    folder.flags = folder.flags ?? {};
    folder.flags.lotm = {
      ...(folder.flags.lotm ?? {}),
      pathwayIdentifier: PATHWAY_IDENTIFIER,
      latestAuthoredSequence: 6
    };
    folder._stats = buildStats(now + 1, folder._stats);
    await abilitiesDb.put(FOLDER_KEY, JSON.stringify(folder));

    const legacyA = await getOptionalJson(abilitiesDb, LEGACY_A_KEY);
    const legacyB = await getOptionalJson(abilitiesDb, LEGACY_B_KEY);
    if (!legacyA) throw new Error('Legacy target lotmAbilityK8001 not found.');
    if (!legacyB) throw new Error('Legacy target lotmAbilityK7002 not found.');

    const legacyAHeader = '<h3>Legacy Upgrade (Sequence 6 - Potency)</h3>';
    const legacyAText =
      '<p>At Sequence 6, <strong>Demonic Attribute</strong> evolves toward full devil-state brutality. ' +
      'When Demonic Attribute is active, your first hit each round deals additional damage equal to <strong>Potency</strong>. ' +
      'If that hit lands on a target below half HP, it must pass a Constitution save or suffer disadvantage on its next concentration check and cannot regain HP until the start of your next turn.</p>';
    const legacyADescription = String(legacyA.system?.description?.value ?? '');
    if (!legacyADescription.includes(legacyAHeader)) {
      legacyA.system.description.value = `${legacyADescription}${legacyAHeader}${legacyAText}`;
    }
    legacyA._stats = buildStats(now + 2, legacyA._stats);
    await abilitiesDb.put(LEGACY_A_KEY, JSON.stringify(legacyA));

    const legacyBHeader = '<h3>Legacy Upgrade (Sequence 6 - Scope)</h3>';
    const legacyBText =
      '<p>At Sequence 6, <strong>Malice Interference</strong> projects further into occult scenes. ' +
      'When you use Malice Interference, choose one additional creature within 10 feet of the original target. ' +
      'That creature takes a penalty equal to half <strong>Potency</strong> (minimum 1) on its next divination, spirit-channeling, Insight, Investigation, or Perception check before end of its next turn.</p>';
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
      name: 'Malice Premonition',
      description:
        '<p><strong>Baseline (0 Spirituality):</strong> Reaction when a hostile creature within 120 feet declares an attack or harmful action against you or an ally you can see. You immediately sense threat origin and intent. Gain <strong>+Potency</strong> to AC against the triggering attack or to one saving throw against the triggering effect.</p>' +
        '<p><strong>Higher Spend (upcast):</strong></p><ul>' +
        '<li><strong>+1 Spirituality:</strong> extend sensing horizon to 300 feet and include unseen attackers if line of effect exists.</li>' +
        '<li><strong>+2 Spirituality:</strong> after resolving the trigger, you may move up to 10 feet without provoking opportunity attacks from the triggering creature, and one ally within 30 feet gains the same defensive bonus.</li>' +
        '<li><strong>+4 Spirituality:</strong> if the triggering attack/effect misses or fails, the attacker takes psychic damage equal to <strong>Potency</strong> and has disadvantage on its next attack roll before the end of its next turn.</li>' +
        '</ul><p><em>Counterplay:</em> hidden long-range setup, non-hostile traps, and effects that deny reactions reduce this ability.</p>' +
        '<p><em>Corruption Hook:</em> if you exploit premonition to execute preemptive violence against uncertain threats, gain 1 Corruption.</p>',
      img: 'icons/magic/perception/eye-ringed-green.webp',
      activationType: 'reaction',
      durationValue: '',
      durationUnits: 'inst',
      targetType: 'self',
      targetCount: '1',
      targetSpecial: 'self or one visible ally affected by hostile action',
      rangeUnits: 'self',
      rangeValue: null,
      rangeSpecial: 'threat origin up to 120 feet',
      school: 'div',
      properties: ['somatic'],
      materials: 'a splinter of black horn wrapped in wire',
      identifier: 'lotm-criminal-malice-premonition',
      activityId: 'criminalSeq6Premonition01',
      now: now + 4,
      existing: existing1,
      sort: 1900300
    });

    const ability2 = buildAbilityDoc({
      id: ABILITY_2_ID,
      name: 'Language of Foulness',
      description:
        '<p><strong>Baseline (1 Spirituality):</strong> Action. Speak one abyssal word at a creature within 60 feet. It makes a Charisma save. On failure, choose one effect: <strong>Slow</strong> (speed halved and no reactions until start of your next turn), <strong>Death-Rust</strong> (takes necrotic damage equal to <strong>Potency</strong> and cannot regain HP until start of your next turn), or <strong>Corruption Sputter</strong> (disadvantage on next Wisdom save/check before end of next turn).</p>' +
        '<p><strong>Higher Spend (upcast):</strong></p><ul>' +
        '<li><strong>+1 Spirituality:</strong> target one additional creature within 15 feet of the first (separate saves).</li>' +
        '<li><strong>+2 Spirituality:</strong> convert to a 10-foot-radius utterance zone at a point within range; choose one foul word mode for all affected creatures.</li>' +
        '<li><strong>+4 Spirituality:</strong> when a creature fails the save, it also takes ongoing corruption damage equal to <strong>Potency</strong> at the start of its next turn and must repeat the save to end this rider.</li>' +
        '</ul><p><em>Counterplay:</em> silence, language immunity, and sanctified anti-curse effects blunt the utterance.</p>' +
        '<p><em>Corruption Hook:</em> if you weaponize this against captives for entertainment, gain 1 Corruption.</p>',
      img: 'icons/magic/death/projectile-skull-flame-teal.webp',
      activationType: 'action',
      durationValue: '',
      durationUnits: 'inst',
      targetType: 'creature',
      targetCount: '1',
      targetSpecial: 'creature that can hear your utterance',
      rangeUnits: 'ft',
      rangeValue: '60',
      rangeSpecial: '',
      school: 'enc',
      properties: ['vocal', 'somatic', 'material'],
      materials: 'a shard of rusted iron dipped in black ink',
      identifier: 'lotm-criminal-language-of-foulness',
      activityId: 'criminalSeq6Foulness02',
      now: now + 5,
      existing: existing2,
      sort: 1900301
    });

    const ability3 = buildAbilityDoc({
      id: ABILITY_3_ID,
      name: 'Sulfur Fireball',
      description:
        '<p><strong>Baseline (1 Spirituality):</strong> Action. Hurl a pale-blue sulfur fireball at a point within 90 feet. Creatures in a 10-foot-radius sphere make a Dexterity save. On failure, they take fire and poison damage equal to <strong>Potency + Potency</strong>; on success, half damage. The area burns with toxic embers until the start of your next turn, becoming difficult terrain.</p>' +
        '<p><strong>Higher Spend (upcast):</strong></p><ul>' +
        '<li><strong>+1 Spirituality:</strong> radius becomes 15 feet or range becomes 120 feet.</li>' +
        '<li><strong>+2 Spirituality:</strong> launch a second smaller fireball (5-foot radius) at a different point within 30 feet of the first.</li>' +
        '<li><strong>+4 Spirituality:</strong> targets that fail the save also suffer sulfur poisoning: they take damage equal to <strong>Potency</strong> at the start of their next turn and have disadvantage on concentration checks until then.</li>' +
        '</ul><p><em>Counterplay:</em> poison resistance/immunity, fire wards, and spread formations reduce effectiveness.</p>' +
        '<p><em>Corruption Hook:</em> if you burn civilians to create panic terrain, gain 1 Corruption.</p>',
      img: 'icons/magic/fire/projectile-fireball-smoke-blue.webp',
      activationType: 'action',
      durationValue: '',
      durationUnits: 'inst',
      targetType: 'sphere',
      targetCount: '1',
      targetSpecial: '10-foot-radius sphere at chosen point',
      rangeUnits: 'ft',
      rangeValue: '90',
      rangeSpecial: '',
      school: 'evc',
      properties: ['vocal', 'somatic', 'material'],
      materials: 'sulfur dust and a cinder-black pebble',
      identifier: 'lotm-criminal-sulfur-fireball',
      activityId: 'criminalSeq6Sulfur03',
      now: now + 6,
      existing: existing3,
      sort: 1900302
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
