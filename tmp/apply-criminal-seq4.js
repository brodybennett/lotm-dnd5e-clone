const { ClassicLevel } = require('./node-tools/node_modules/classic-level');

const CORE_VERSION = '13.351';
const SYSTEM_ID = 'lotm';
const SYSTEM_VERSION = '5.2.6';
const MODIFIER = '0000000000000000';

const PATHWAY_KEY = '!items!lotmPathway00019';
const FOLDER_KEY = '!folders!tYIG59nsaRs7qkLm';
const PATHWAY_IDENTIFIER = 'lotm-criminal';
const FOLDER_ID = 'tYIG59nsaRs7qkLm';

const LEGACY_A_KEY = '!items!lotmAbilityK5001'; // Desire Control
const LEGACY_B_KEY = '!items!lotmAbilityK6001'; // Malice Premonition

const ABILITY_1_ID = 'lotmAbilityK4001';
const ABILITY_2_ID = 'lotmAbilityK4002';
const ABILITY_3_ID = 'lotmAbilityK4003';
const ABILITY_4_ID = 'lotmAbilityK4004';

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
    const pathway = await getOptionalJson(pathwaysDb, PATHWAY_KEY);
    if (!pathway) throw new Error('Criminal pathway (lotmPathway00019) not found.');

    pathway.system = pathway.system ?? {};
    pathway.system.description = pathway.system.description ?? { value: '', chat: '' };
    pathway.system.description.value =
      '<p><strong>Pathway Vector:</strong> ruthless predation through cold intent, blood-soaked intimidation, and domination of weakness and desire.</p>' +
      '<p><strong>Sequence 5 Package (Gain Budget +13):</strong> Desire Control, Defiling Seed, Desire Incarnation, plus two legacy upgrades.</p>' +
      '<p><strong>Sequence 4 Package (Gain Budget +33):</strong> Demon of the Mind, Demon of the Body, Filthy Language, Hellfire Projection, plus two legacy upgrades (Desire Control and Malice Premonition).</p>' +
      '<p><strong>Continuity Anchor:</strong> At Sequence 4 (Demon), desire apostleship matures into demigod-level body-mind oppression: direct desire manipulation, durable demonic physique, enhanced foul speech, and large-area hellfire/corrosion pressure.</p>' +
      '<p><strong>Authoring Status:</strong> Sequence 4 authored in this run; remaining sequences continue in sequence-focused runs.</p>';
    pathway._stats = buildStats(now, pathway._stats);
    await pathwaysDb.put(PATHWAY_KEY, JSON.stringify(pathway));

    const folder = await getOptionalJson(abilitiesDb, FOLDER_KEY);
    if (!folder) throw new Error('Criminal folder (tYIG59nsaRs7qkLm) not found.');

    folder.name = 'Criminal';
    folder.description = 'Sequence abilities for the Criminal pathway (authored through Sequence 4).';
    folder.flags = folder.flags ?? {};
    folder.flags.lotm = {
      ...(folder.flags.lotm ?? {}),
      pathwayIdentifier: PATHWAY_IDENTIFIER,
      latestAuthoredSequence: 4
    };
    folder._stats = buildStats(now + 1, folder._stats);
    await abilitiesDb.put(FOLDER_KEY, JSON.stringify(folder));

    const legacyA = await getOptionalJson(abilitiesDb, LEGACY_A_KEY);
    const legacyB = await getOptionalJson(abilitiesDb, LEGACY_B_KEY);
    if (!legacyA) throw new Error('Legacy target lotmAbilityK5001 not found.');
    if (!legacyB) throw new Error('Legacy target lotmAbilityK6001 not found.');

    const legacyAHeader = '<h3>Legacy Upgrade (Sequence 4 - Potency)</h3>';
    const legacyAText =
      '<p>At Sequence 4, <strong>Desire Control</strong> no longer needs obvious emotional openings. ' +
      'When you cast Desire Control, failed targets immediately suffer psychic damage equal to <strong>Potency</strong>. ' +
      'Additionally, one affected target of your choice cannot take the Help action and has disadvantage on concentration checks until the end of your next turn.</p>';
    const legacyADescription = String(legacyA.system?.description?.value ?? '');
    if (!legacyADescription.includes(legacyAHeader)) {
      legacyA.system.description.value = `${legacyADescription}${legacyAHeader}${legacyAText}`;
    }
    legacyA._stats = buildStats(now + 2, legacyA._stats);
    await abilitiesDb.put(LEGACY_A_KEY, JSON.stringify(legacyA));

    const legacyBHeader = '<h3>Legacy Upgrade (Sequence 4 - Scope)</h3>';
    const legacyBText =
      '<p>At Sequence 4, <strong>Malice Premonition</strong> extends to strategic forewarning. ' +
      'Once per short rest, when initiative is rolled or when entering an overtly hostile zone, you may designate up to <strong>Potency</strong> allies within 30 feet. ' +
      'Each designated ally gains advantage on one saving throw against fear, charm, or ambush effects before the end of the scene.</p>';
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
      name: 'Demon of the Mind',
      description:
        '<p><strong>Baseline (2 Spirituality):</strong> Action. Choose up to two creatures within 60 feet. Each makes a Wisdom save. On failure, a target enters demonic delusion until the end of its next turn: it has disadvantage on Intelligence, Wisdom, and Charisma checks, and cannot benefit from the Help action. If it attempts concentration, it takes psychic damage equal to <strong>Potency</strong>.</p>' +
        '<p><strong>Higher Spend (upcast):</strong></p><ul>' +
        '<li><strong>+1 Spirituality:</strong> affect one additional creature.</li>' +
        '<li><strong>+2 Spirituality:</strong> duration becomes 1 minute (save ends at end of each turn).</li>' +
        '<li><strong>+4 Spirituality:</strong> failed targets also treat allies as difficult emotional signals, taking <strong>-Potency</strong> on the next attack roll or save they make before the end of their next turn.</li>' +
        '<li><strong>+6 Spirituality:</strong> once per round while this effect persists, choose one affected target that failed its save; it cannot take reactions until the start of its next turn.</li>' +
        '</ul><p><em>Counterplay:</em> mind-ward magic, fear/charm immunity, and cleanse effects reduce suppression uptime.</p>' +
        '<p><em>Corruption Hook:</em> if you shatter noncombatant sanity to make an example, gain 1 Corruption.</p>',
      img: 'icons/magic/control/debuff-brainwashing-mesmerism.webp',
      activationType: 'action',
      durationValue: '',
      durationUnits: 'inst',
      targetType: 'creature',
      targetCount: '2',
      targetSpecial: 'creatures you can see',
      rangeUnits: 'ft',
      rangeValue: '60',
      rangeSpecial: '',
      school: 'enc',
      properties: ['vocal', 'somatic'],
      materials: 'a sliver of cracked mirror blackened by soot',
      identifier: 'lotm-criminal-demon-of-the-mind',
      activityId: 'criminalSeq4Mind01',
      now: now + 4,
      existing: existing1,
      sort: 1900600
    });

    const ability2 = buildAbilityDoc({
      id: ABILITY_2_ID,
      name: 'Demon of the Body',
      description:
        '<p><strong>Baseline (2 Spirituality):</strong> Bonus action. Partially manifest demonized physique for 1 minute: your size can become Large (if space allows), melee reach increases by 5 feet, and you gain resistance to poison, curse-tagged damage, and nonmagical weapon damage. Your unarmed or weapon hits deal extra damage equal to <strong>Potency</strong>.</p>' +
        '<p><strong>Higher Spend (upcast):</strong></p><ul>' +
        '<li><strong>+1 Spirituality:</strong> movement speed +10 feet and advantage on Strength checks/saves.</li>' +
        '<li><strong>+2 Spirituality:</strong> once per turn when you hit, target must pass a Constitution save or be unable to regain HP until start of your next turn.</li>' +
        '<li><strong>+4 Spirituality:</strong> you gain temporary HP equal to <strong>2 x Potency</strong> at start of each of your turns while transformed (does not stack; refreshes).</li>' +
        '<li><strong>+6 Spirituality:</strong> you can throw up to two sulfur fire bolts as part of your attack action (30 ft, each dealing fire+poison damage equal to <strong>Potency</strong> on hit).</li>' +
        '</ul><p><em>Counterplay:</em> force barriers, control effects that ignore physical toughness, and anti-transformation fields.</p>' +
        '<p><em>Corruption Hook:</em> if you revel in mutilation while transformed, gain 1 Corruption.</p>',
      img: 'icons/creatures/magical/demon-horned-wings-brown.webp',
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
      materials: 'a horn fragment soaked in sulfur and blood',
      identifier: 'lotm-criminal-demon-of-the-body',
      activityId: 'criminalSeq4Body02',
      now: now + 5,
      existing: existing2,
      sort: 1900601
    });

    const ability3 = buildAbilityDoc({
      id: ABILITY_3_ID,
      name: 'Filthy Language',
      description:
        '<p><strong>Baseline (2 Spirituality):</strong> Action. Utter one completed foul word at a creature within 90 feet (Charisma save): choose <strong>Confusion</strong> (target has disadvantage on attacks/checks requiring judgment until end of next turn), <strong>Sloth</strong> (target speed becomes 0 until start of your next turn), or <strong>Blasphemy</strong> (target takes psychic+necrotic damage equal to <strong>Potency + Potency</strong> and cannot benefit from inspiration-like bonuses until end of next turn).</p>' +
        '<p><strong>Higher Spend (upcast):</strong></p><ul>' +
        '<li><strong>+1 Spirituality:</strong> target one additional creature within 20 feet of the first (separate save).</li>' +
        '<li><strong>+2 Spirituality:</strong> convert to a 15-foot-radius zone at a visible point within 90 feet; all creatures in zone save against the same chosen word.</li>' +
        '<li><strong>+4 Spirituality:</strong> failed targets also lose reactions until the start of your next turn.</li>' +
        '<li><strong>+6 Spirituality:</strong> Blasphemy mode additionally suppresses one magical buff on each failed target until the end of your next turn (GM adjudication for highest-value removable effect).</li>' +
        '</ul><p><em>Counterplay:</em> silence, language immunity, and sanctified anti-curse rites mitigate outcomes.</p>' +
        '<p><em>Corruption Hook:</em> if you weaponize blasphemous speech against bound captives for sport, gain 1 Corruption.</p>',
      img: 'icons/magic/unholy/silhouette-evil-horns.webp',
      activationType: 'action',
      durationValue: '',
      durationUnits: 'inst',
      targetType: 'creature',
      targetCount: '1',
      targetSpecial: 'creature that can hear you',
      rangeUnits: 'ft',
      rangeValue: '90',
      rangeSpecial: '',
      school: 'nec',
      properties: ['vocal', 'somatic', 'material'],
      materials: 'a strip of scorched scripture and rust flakes',
      identifier: 'lotm-criminal-filthy-language',
      activityId: 'criminalSeq4Filthy03',
      now: now + 6,
      existing: existing3,
      sort: 1900602
    });

    const ability4 = buildAbilityDoc({
      id: ABILITY_4_ID,
      name: 'Hellfire Projection',
      description:
        '<p><strong>Baseline (2 Spirituality):</strong> Action. Summon a demonic projection at a point within 60 feet and erupt hellfire in a 15-foot radius. Creatures in the area make a Dexterity save. On failure they take fire+poison damage equal to <strong>2 x Potency</strong> and the area becomes corrosive ground (difficult terrain) until end of your next turn. On success they take half damage and no terrain penalty.</p>' +
        '<p><strong>Higher Spend (upcast):</strong></p><ul>' +
        '<li><strong>+1 Spirituality:</strong> radius becomes 20 feet or range becomes 90 feet.</li>' +
        '<li><strong>+2 Spirituality:</strong> projection persists 1 minute; once per round you can move it up to 20 feet and trigger a 5-foot flare dealing damage equal to <strong>Potency</strong> (Dex save half).</li>' +
        '<li><strong>+4 Spirituality:</strong> failed targets also suffer sulfur corrosion: disadvantage on concentration checks and one weapon attack roll before end of next turn.</li>' +
        '<li><strong>+6 Spirituality:</strong> at projection end, trigger a final collapse burst in 10 feet; failed creatures are Frightened of you until end of their next turn.</li>' +
        '</ul><p><em>Counterplay:</em> fire/poison resistance, spread formation, and projection banishment effects.</p>' +
        '<p><em>Corruption Hook:</em> if you use hellfire to massacre powerless bystanders, gain 1 Corruption.</p>',
      img: 'icons/magic/fire/projectile-fireball-big-orange.webp',
      activationType: 'action',
      durationValue: '',
      durationUnits: 'inst',
      targetType: 'sphere',
      targetCount: '1',
      targetSpecial: '15-foot radius at chosen point',
      rangeUnits: 'ft',
      rangeValue: '60',
      rangeSpecial: '',
      school: 'evc',
      properties: ['vocal', 'somatic', 'material'],
      materials: 'sulfur crystal and demon-blood ash',
      identifier: 'lotm-criminal-hellfire-projection',
      activityId: 'criminalSeq4Hellfire04',
      now: now + 7,
      existing: existing4,
      sort: 1900603
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
