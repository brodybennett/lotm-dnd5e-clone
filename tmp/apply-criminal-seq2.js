const { ClassicLevel } = require('./node-tools/node_modules/classic-level');

const CORE_VERSION = '13.351';
const SYSTEM_ID = 'lotm';
const SYSTEM_VERSION = '5.2.6';
const MODIFIER = '0000000000000000';

const PATHWAY_KEY = '!items!lotmPathway00019';
const FOLDER_KEY = '!folders!tYIG59nsaRs7qkLm';
const PATHWAY_IDENTIFIER = 'lotm-criminal';
const FOLDER_ID = 'tYIG59nsaRs7qkLm';

const LEGACY_A_KEY = '!items!lotmAbilityK4001'; // Demon of the Mind
const LEGACY_B_KEY = '!items!lotmAbilityK5001'; // Desire Control

const ABILITY_1_ID = 'lotmAbilityK2001';
const ABILITY_2_ID = 'lotmAbilityK2002';
const ABILITY_3_ID = 'lotmAbilityK2003';
const ABILITY_4_ID = 'lotmAbilityK2004';

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
      level: 7,
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
        grantedSequence: 2
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
      '<p><strong>Sequence 4 Package (Gain Budget +33):</strong> Demon of the Mind, Demon of the Body, Filthy Language, Hellfire Projection, plus two legacy upgrades.</p>' +
      '<p><strong>Sequence 3 Package (Gain Budget +20):</strong> Corruption Cant, Mind-Spirit Hex, Distant Blather, Prayer Interception, plus two legacy upgrades.</p>' +
      '<p><strong>Sequence 2 Package (Gain Budget +50):</strong> Seed of Malice, Blood Sovereign, Abyssal Dread Mandate, Coagulated Rebirth, plus two legacy upgrades (Demon of the Mind and Desire Control).</p>' +
      '<p><strong>Continuity Anchor:</strong> At Sequence 2 (Bloody Archduke), Blatherer-level distant corruption becomes Angel-level authority over malice and body: planted malice can host resurrection vectors, blood and bodily fluids become command media, and instinctive terror can blank hostile thought at scale.</p>' +
      '<p><strong>Authoring Status:</strong> Sequence 2 authored in this run; remaining sequences continue in sequence-focused runs.</p>';
    pathway._stats = buildStats(now, pathway._stats);
    await pathwaysDb.put(PATHWAY_KEY, JSON.stringify(pathway));

    const folder = await getOptionalJson(abilitiesDb, FOLDER_KEY);
    if (!folder) throw new Error('Criminal folder (tYIG59nsaRs7qkLm) not found.');

    folder.name = 'Criminal';
    folder.description = 'Sequence abilities for the Criminal pathway (authored through Sequence 2).';
    folder.flags = folder.flags ?? {};
    folder.flags.lotm = {
      ...(folder.flags.lotm ?? {}),
      pathwayIdentifier: PATHWAY_IDENTIFIER,
      latestAuthoredSequence: 2
    };
    folder._stats = buildStats(now + 1, folder._stats);
    await abilitiesDb.put(FOLDER_KEY, JSON.stringify(folder));

    const legacyA = await getOptionalJson(abilitiesDb, LEGACY_A_KEY);
    const legacyB = await getOptionalJson(abilitiesDb, LEGACY_B_KEY);
    if (!legacyA) throw new Error('Legacy target lotmAbilityK4001 not found.');
    if (!legacyB) throw new Error('Legacy target lotmAbilityK5001 not found.');

    const legacyAHeader = '<h3>Legacy Upgrade (Sequence 2 - Potency)</h3>';
    const legacyAText =
      '<p>At Sequence 2, <strong>Demon of the Mind</strong> carries Archduke-level crushing malice. ' +
      'When Demon of the Mind is cast with at least <strong>+2 Spirituality</strong>, failed targets take immediate psychic damage equal to <strong>Potency + pathway tier</strong>, and their first successful save against the effect only downgrades the condition instead of ending it. ' +
      'If a failed target is already affected by your Seed of Malice, it also suffers disadvantage on its next mental saving throw before the end of your next turn.</p>';
    const legacyADescription = String(legacyA.system?.description?.value ?? '');
    if (!legacyADescription.includes(legacyAHeader)) {
      legacyA.system.description.value = `${legacyADescription}${legacyAHeader}${legacyAText}`;
    }
    legacyA._stats = buildStats(now + 2, legacyA._stats);
    await abilitiesDb.put(LEGACY_A_KEY, JSON.stringify(legacyA));

    const legacyBHeader = '<h3>Legacy Upgrade (Sequence 2 - Efficiency)</h3>';
    const legacyBText =
      '<p>At Sequence 2, <strong>Desire Control</strong> becomes an economical opener for broader blood-malice chains. ' +
      'Once per round, if Desire Control successfully affects at least one target, reduce the spirituality cost of your next Criminal ability this turn by <strong>1</strong> (minimum 0). ' +
      'If that discounted ability is Seed of Malice, you may ignore line of sight for one marked target within range as long as you have a prior sympathetic link.</p>';
    const legacyBDescription = String(legacyB.system?.description?.value ?? '');
    if (!legacyBDescription.includes(legacyBHeader)) {
      legacyB.system.description.value = `${legacyBDescription}${legacyBHeader}${legacyBText}`;
    }
    legacyB._stats = buildStats(now + 3, legacyB._stats);
    await abilitiesDb.put(LEGACY_B_KEY, JSON.stringify(legacyB));

    const existing1 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_1_ID}`);
    const existing2 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_2_ID}`);
    const existing3 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_3_ID}`);
    const existing4 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_4_ID}`);

    const ability1 = buildAbilityDoc({
      id: ABILITY_1_ID,
      name: 'Seed of Malice',
      description:
        '<p><strong>Baseline (4 Spirituality):</strong> Action. Implant one Seed of Malice into a creature within 120 feet (Wisdom save). On failure, the seed persists for 24 hours. While seeded, the target takes psychic damage equal to <strong>Potency</strong> whenever it fails a save, and has disadvantage on checks to resist coercion, fear, or desire manipulation.</p>' +
        '<p><strong>Archduke Rebirth Clause:</strong> Once per long rest, if your body is reduced to 0 HP while a seed is active on the same plane, you may consume one seed to reconstitute within 5 feet of that target with HP equal to <strong>3 x Potency</strong>; that target takes necrotic+psychic damage equal to <strong>2 x Potency</strong> and must pass a Constitution save or become Stunned until the end of its next turn.</p>' +
        '<p><strong>Higher Spend (upcast):</strong></p><ul>' +
        '<li><strong>+2 Spirituality:</strong> implant one additional seed in a different creature within range.</li>' +
        '<li><strong>+4 Spirituality:</strong> if a seeded target commits a malicious act before the seed ends, trigger a malice eruption: it repeats the save with disadvantage or takes <strong>2 x Potency</strong> psychic damage and is Frightened of you until end of next turn.</li>' +
        '<li><strong>+8 Spirituality:</strong> if a seeded target has connected psyche constructs (GM-recognized linked selves), one linked construct is also affected by baseline seed penalties for 1 minute on failed save.</li>' +
        '</ul><p><em>Counterplay:</em> sanctified exorcism, mind-shield barriers, and severing sympathetic links can suppress or remove seeds.</p>' +
        '<p><em>Corruption Hook:</em> if you plant seeds in noncombatants solely as future revival stock, gain 1 Corruption per victimized scene.</p>',
      img: 'icons/magic/control/debuff-brainwash-pink.webp',
      activationType: 'action',
      durationValue: '24',
      durationUnits: 'hour',
      targetType: 'creature',
      targetCount: '1',
      targetSpecial: 'creature you can perceive',
      rangeUnits: 'ft',
      rangeValue: '120',
      rangeSpecial: '',
      school: 'enc',
      properties: ['vocal', 'somatic', 'material'],
      materials: 'a clot of your blood mixed with sulfur ink',
      identifier: 'lotm-criminal-seed-of-malice',
      activityId: 'criminalSeq2Seed01',
      now: now + 4,
      existing: existing1,
      sort: 1900800
    });

    const ability2 = buildAbilityDoc({
      id: ABILITY_2_ID,
      name: 'Blood Sovereign',
      description:
        '<p><strong>Baseline (3 Spirituality):</strong> Action. Command blood and bodily fluids of up to three creatures within 90 feet (Constitution save each). Failed targets take necrotic+poison damage equal to <strong>2 x Potency</strong>, have speed reduced by 15 feet, and cannot regain HP until the start of your next turn.</p>' +
        '<p><strong>Body Authority Clause:</strong> while at least one target fails, you gain resistance to bludgeoning, piercing, and slashing damage until start of your next turn as your blood hardens into layered demonic armor.</p>' +
        '<p><strong>Higher Spend (upcast):</strong></p><ul>' +
        '<li><strong>+2 Spirituality:</strong> affect two additional creatures.</li>' +
        '<li><strong>+4 Spirituality:</strong> duration becomes 1 minute; failed targets repeat Con save at end of each turn to end movement and anti-heal riders.</li>' +
        '<li><strong>+8 Spirituality:</strong> failed targets also bleed through orifices, taking <strong>Potency</strong> necrotic damage at start of each turn and suffering disadvantage on concentration checks while affected.</li>' +
        '</ul><p><em>Counterplay:</em> poison immunity, bloodless constructs, and rapid cleanse magic reduce effect value.</p>' +
        '<p><em>Corruption Hook:</em> if used to slowly execute helpless captives, gain 1 Corruption.</p>',
      img: 'icons/magic/death/blood-corruption-vomit-red.webp',
      activationType: 'action',
      durationValue: '',
      durationUnits: 'inst',
      targetType: 'creature',
      targetCount: '3',
      targetSpecial: 'creatures with blood or bodily fluid systems',
      rangeUnits: 'ft',
      rangeValue: '90',
      rangeSpecial: '',
      school: 'nec',
      properties: ['vocal', 'somatic', 'material'],
      materials: 'a silver lancet and a bowl of stale blood',
      identifier: 'lotm-criminal-blood-sovereign',
      activityId: 'criminalSeq2Blood02',
      now: now + 5,
      existing: existing2,
      sort: 1900801
    });

    const ability3 = buildAbilityDoc({
      id: ABILITY_3_ID,
      name: 'Abyssal Dread Mandate',
      description:
        '<p><strong>Baseline (3 Spirituality):</strong> Action. Exude pure instinctive fear in a 30-foot radius centered on you for 1 minute (Wisdom save on entry/start of turn). On failure, a creature is Frightened of you, cannot take reactions, and takes a <strong>-Potency</strong> penalty to Intelligence/Wisdom checks until start of its next turn.</p>' +
        '<p><strong>Malice Clause:</strong> creatures currently charmed or mentally controlled by others have disadvantage on this save; on failure, ongoing external charm/control effects on them are suppressed until start of their next turn.</p>' +
        '<p><strong>Higher Spend (upcast):</strong></p><ul>' +
        '<li><strong>+2 Spirituality:</strong> radius increases to 45 feet.</li>' +
        '<li><strong>+4 Spirituality:</strong> failed targets also drop concentration and cannot take bonus actions until start of their next turn.</li>' +
        '<li><strong>+8 Spirituality:</strong> once during duration, trigger a dread pulse: each failed target repeats Wisdom save or becomes incapacitated by blank-minded terror until the end of its current turn.</li>' +
        '</ul><p><em>Counterplay:</em> fear immunity, aura resistance, and high-discipline formations mitigate collapse risk.</p>' +
        '<p><em>Corruption Hook:</em> if you intentionally induce mass panic in civilians, gain 1 Corruption.</p>',
      img: 'icons/magic/control/fear-fright-monster-grin-red-orange.webp',
      activationType: 'action',
      durationValue: '1',
      durationUnits: 'minute',
      targetType: 'sphere',
      targetCount: '1',
      targetSpecial: '30-foot radius centered on self',
      rangeUnits: 'self',
      rangeValue: null,
      rangeSpecial: '',
      school: 'enc',
      properties: ['vocal', 'somatic'],
      materials: 'a cracked black idol stained with blood',
      identifier: 'lotm-criminal-abyssal-dread-mandate',
      activityId: 'criminalSeq2Dread03',
      now: now + 6,
      existing: existing3,
      sort: 1900802
    });

    const ability4 = buildAbilityDoc({
      id: ABILITY_4_ID,
      name: 'Coagulated Rebirth',
      description:
        '<p><strong>Baseline (2 Spirituality):</strong> Bonus action. Assume a congealed-blood body for 1 minute: you can liquefy to pass through openings as narrow as 1 inch, gain resistance to nonmagical weapon damage, and gain temporary HP equal to <strong>2 x Potency</strong>. If you take damage, you may use reaction to split into blood-mist and move 10 feet without provoking opportunity attacks.</p>' +
        '<p><strong>Reconstitution Clause:</strong> if reduced to 0 HP during this effect, leave a blood remnant in your space. At the start of your next turn, if remnant persists, reform with HP equal to <strong>Potency</strong> and end this effect (once per long rest).</p>' +
        '<p><strong>Higher Spend (upcast):</strong></p><ul>' +
        '<li><strong>+2 Spirituality:</strong> duration becomes 10 minutes and movement speed increases by 15 feet.</li>' +
        '<li><strong>+4 Spirituality:</strong> while transformed, melee attackers who hit you take corrosive damage equal to <strong>Potency</strong>.</li>' +
        '<li><strong>+8 Spirituality:</strong> your movement leaves a 10-foot trail of corrosive blood fog until start of your next turn; hostile creatures entering the trail take <strong>Potency</strong> poison+necrotic damage (once per turn).</li>' +
        '</ul><p><em>Counterplay:</em> radiant purification, area denial on remnant location, and anti-shapeshift seals can stop recovery.</p>' +
        '<p><em>Corruption Hook:</em> if you abuse reconstitution to prolong cruelty instead of ending combat, gain 1 Corruption.</p>',
      img: 'icons/magic/death/undead-ghost-scream-ombre.webp',
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
      properties: ['somatic', 'material'],
      materials: 'a vial of fresh blood and powdered sulfur glass',
      identifier: 'lotm-criminal-coagulated-rebirth',
      activityId: 'criminalSeq2Rebirth04',
      now: now + 7,
      existing: existing4,
      sort: 1900803
    });

    await abilitiesDb.put(`!items!${ABILITY_1_ID}`, JSON.stringify(ability1));
    await abilitiesDb.put(`!items!${ABILITY_2_ID}`, JSON.stringify(ability2));
    await abilitiesDb.put(`!items!${ABILITY_3_ID}`, JSON.stringify(ability3));
    await abilitiesDb.put(`!items!${ABILITY_4_ID}`, JSON.stringify(ability4));

    const verifyPathway = await getOptionalJson(pathwaysDb, PATHWAY_KEY);
    const verifyFolder = await getOptionalJson(abilitiesDb, FOLDER_KEY);
    const verifyLegacyA = await getOptionalJson(abilitiesDb, LEGACY_A_KEY);
    const verifyLegacyB = await getOptionalJson(abilitiesDb, LEGACY_B_KEY);
    const verify1 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_1_ID}`);
    const verify2 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_2_ID}`);
    const verify3 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_3_ID}`);
    const verify4 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_4_ID}`);

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
            `!items!${ABILITY_3_ID}`,
            `!items!${ABILITY_4_ID}`
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
            },
            {
              id: verify4?._id,
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
