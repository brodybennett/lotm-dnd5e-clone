const { ClassicLevel } = require('./node-tools/node_modules/classic-level');

const CORE_VERSION = '13.351';
const SYSTEM_ID = 'lotm';
const SYSTEM_VERSION = '5.2.6';
const MODIFIER = '0000000000000000';

const PATHWAY_KEY = '!items!lotmPathway00019';
const FOLDER_KEY = '!folders!tYIG59nsaRs7qkLm';
const PATHWAY_IDENTIFIER = 'lotm-criminal';
const FOLDER_ID = 'tYIG59nsaRs7qkLm';

const LEGACY_A_KEY = '!items!lotmAbilityK8001';
const LEGACY_B_KEY = '!items!lotmAbilityK8002';

const ABILITY_1_ID = 'lotmAbilityK7001';
const ABILITY_2_ID = 'lotmAbilityK7002';
const ABILITY_3_ID = 'lotmAbilityK7003';

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
    if (!pathway) throw new Error('Criminal pathway (lotmPathway00019) not found.');

    pathway.system = pathway.system ?? {};
    pathway.system.description = pathway.system.description ?? { value: '', chat: '' };
    pathway.system.description.value =
      '<p><strong>Pathway Vector:</strong> ruthless predation through cold intent, blood-soaked intimidation, and domination of weakness and desire.</p>' +
      '<p><strong>Sequence 8 Package (Gain Budget +3):</strong> Demonic Attribute, Crushing Slowness.</p>' +
      '<p><strong>Sequence 7 Package (Gain Budget +13):</strong> Killing Spree Script, Malice Interference, Devil Projection Rite, plus two legacy upgrades (Demonic Attribute and Crushing Slowness).</p>' +
      '<p><strong>Continuity Anchor:</strong> At Sequence 7 (Serial Killer), coldblooded brutality matures into ritualized cruelty: targeted slaughter patterns, anti-divination disruption, and transactional devil projection support.</p>' +
      '<p><strong>Authoring Status:</strong> Sequence 7 authored in this run; adjacent sequences continue in their own sequence-focused passes.</p>';
    pathway._stats = buildStats(now, pathway._stats);
    await pathwaysDb.put(PATHWAY_KEY, JSON.stringify(pathway));

    const folder = await getOptionalJson(abilitiesDb, FOLDER_KEY);
    if (!folder) throw new Error('Criminal folder (tYIG59nsaRs7qkLm) not found.');

    folder.name = 'Criminal';
    folder.description = 'Sequence abilities for the Criminal pathway (authored through Sequence 7).';
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
    if (!legacyA) throw new Error('Legacy target lotmAbilityK8001 not found.');
    if (!legacyB) throw new Error('Legacy target lotmAbilityK8002 not found.');

    const legacyAHeader = '<h3>Legacy Upgrade (Sequence 7 - Potency)</h3>';
    const legacyAText =
      '<p>At Sequence 7, your <strong>Demonic Attribute</strong> gains sharper lethal conversion. ' +
      'When you deal bonus damage from Demonic Attribute, add an additional <strong>+Potency</strong> once per turn against creatures below half HP. ' +
      'If you paid at least <strong>+2 Spirituality</strong> on Demonic Attribute this scene, the first creature you hit each turn must pass a Constitution save or be unable to regain HP until the start of your next turn.</p>';
    const legacyADesc = String(legacyA.system?.description?.value ?? '');
    if (!legacyADesc.includes(legacyAHeader)) {
      legacyA.system.description.value = `${legacyADesc}${legacyAHeader}${legacyAText}`;
    }
    legacyA._stats = buildStats(now + 2, legacyA._stats);
    await abilitiesDb.put(LEGACY_A_KEY, JSON.stringify(legacyA));

    const legacyBHeader = '<h3>Legacy Upgrade (Sequence 7 - Efficiency)</h3>';
    const legacyBText =
      '<p>At Sequence 7, <strong>Crushing Slowness</strong> settles into efficient blood-pressure control. ' +
      'Once per round, when Crushing Slowness affects at least one creature, reduce the next <strong>+1 Spirituality</strong> upcast surcharge you pay on a Criminal ability before the end of your turn by 1 (minimum 0). ' +
      'If a target fails its initial save, you may move 5 feet without provoking opportunity attacks from that target.</p>';
    const legacyBDesc = String(legacyB.system?.description?.value ?? '');
    if (!legacyBDesc.includes(legacyBHeader)) {
      legacyB.system.description.value = `${legacyBDesc}${legacyBHeader}${legacyBText}`;
    }
    legacyB._stats = buildStats(now + 3, legacyB._stats);
    await abilitiesDb.put(LEGACY_B_KEY, JSON.stringify(legacyB));

    const existing1 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_1_ID}`);
    const existing2 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_2_ID}`);
    const existing3 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_3_ID}`);

    const ability1 = buildAbilityDoc({
      id: ABILITY_1_ID,
      name: 'Killing Spree Script',
      description:
        '<p><strong>Baseline (1 Spirituality):</strong> Action. Mark one creature within 60 feet as scripted prey for 1 minute. Once per turn when you hit it with a weapon attack, deal extra necrotic or poison damage equal to <strong>Potency</strong>. If scripted prey drops to 0 HP, you may move up to 15 feet and gain temporary HP equal to <strong>Potency</strong>.</p>' +
        '<p><strong>Higher Spend (upcast):</strong></p><ul>' +
        '<li><strong>+1 Spirituality:</strong> Mark one additional creature, or increase range to 90 feet.</li>' +
        '<li><strong>+2 Spirituality:</strong> On hit, scripted prey makes a Constitution save. On failure, it cannot regain HP and takes <strong>Potency</strong> damage at the start of its next turn.</li>' +
        '<li><strong>+4 Spirituality:</strong> When scripted prey drops to 0 HP, one hostile creature within 30 feet must make a Wisdom save or become Frightened of you until the end of its next turn.</li>' +
        '</ul><p><em>Counterplay:</em> immunity to fear, cleanse effects, and line-of-sight denial reduce chain pressure.</p>' +
        '<p><em>Corruption Hook:</em> If you stage gratuitous cruelty to maximize this ability, gain 1 Corruption.</p>',
      img: 'icons/skills/wounds/blood-spurt-spray-red.webp',
      activationType: 'action',
      durationValue: '1',
      durationUnits: 'minute',
      targetType: 'creature',
      targetCount: '1',
      targetSpecial: 'hostile creature you can see',
      rangeUnits: 'ft',
      rangeValue: '60',
      rangeSpecial: '',
      school: 'nec',
      properties: ['somatic', 'material'],
      materials: 'a bloodstained strip of cloth and iron filings',
      identifier: 'lotm-criminal-killing-spree-script',
      activityId: 'criminalSeq7Spree01',
      now: now + 4,
      existing: existing1,
      sort: 1900200
    });

    const ability2 = buildAbilityDoc({
      id: ABILITY_2_ID,
      name: 'Malice Interference',
      description:
        '<p><strong>Baseline (0 Spirituality):</strong> Reaction when a creature within 60 feet attempts divination, spirit channeling, occult sensing, or an information-gathering check (Arcana/Insight/Perception/Investigation). It makes a Charisma save. On failure, it takes a penalty equal to <strong>Potency</strong> to the triggering roll or save, and cannot benefit from guidance-like bonuses until the start of its next turn.</p>' +
        '<p><strong>Higher Spend (upcast):</strong></p><ul>' +
        '<li><strong>+1 Spirituality:</strong> You may trigger this reaction one additional time before your next turn (different creature each time).</li>' +
        '<li><strong>+2 Spirituality:</strong> Create a 20-foot-radius interference zone centered on you for 1 minute. Creatures of your choice in the zone have disadvantage on checks to detect hidden creatures, magical traces, or disguised intent.</li>' +
        '<li><strong>+4 Spirituality:</strong> A creature that fails the initial save also takes psychic damage equal to <strong>Potency</strong>, and you may immediately Hide or move 10 feet without provoking opportunity attacks from it.</li>' +
        '</ul><p><em>Counterplay:</em> silence-proof rituals, anti-interference wards, and indirect intel methods bypass part of this disruption.</p>' +
        '<p><em>Corruption Hook:</em> If you sabotage allies&apos; critical reconnaissance out of spite, gain 1 Corruption.</p>',
      img: 'icons/magic/symbols/runes-star-pentagon-orange-purple.webp',
      activationType: 'reaction',
      durationValue: '',
      durationUnits: 'inst',
      targetType: 'creature',
      targetCount: '1',
      targetSpecial: 'creature performing occult or information-gathering action',
      rangeUnits: 'ft',
      rangeValue: '60',
      rangeSpecial: '',
      school: 'enc',
      properties: ['vocal', 'somatic'],
      materials: 'charred parchment etched with infernal script',
      identifier: 'lotm-criminal-malice-interference',
      activityId: 'criminalSeq7Interfere02',
      now: now + 5,
      existing: existing2,
      sort: 1900201
    });

    const ability3 = buildAbilityDoc({
      id: ABILITY_3_ID,
      name: 'Devil Projection Rite',
      description:
        '<p><strong>Baseline (1 Spirituality):</strong> Action. Invoke a transient devil projection at a point within 30 feet for 1 minute. Choose one creature within 10 feet of the projection; it makes a Wisdom save. On failure, it has disadvantage on its next attack roll and ability check before the end of its next turn. While the projection persists, you gain advantage on Intimidation checks and can issue one terse command each round to reposition the projection up to 20 feet.</p>' +
        '<p><strong>Higher Spend (upcast):</strong></p><ul>' +
        '<li><strong>+1 Spirituality:</strong> Projection command range increases to 60 feet, and you may retarget one additional creature per round (separate save).</li>' +
        '<li><strong>+2 Spirituality:</strong> Duration becomes 10 minutes. When a creature fails its save against the projection, it also suffers speed reduction of 10 feet until the start of your next turn.</li>' +
        '<li><strong>+4 Spirituality:</strong> The projection emits a 10-foot aura of oppressive malice; enemies in the aura have disadvantage on concentration checks and checks to resist fear or coercion from you.</li>' +
        '</ul><p><em>Counterplay:</em> holy ground, anti-summoning effects, and line-of-sight breaks can suppress projection pressure.</p>' +
        '<p><em>Corruption Hook:</em> If you invoke this rite solely to terrorize noncombatants, gain 1 Corruption.</p>',
      img: 'icons/magic/death/undead-shadow-imp-blue.webp',
      activationType: 'action',
      durationValue: '1',
      durationUnits: 'minute',
      targetType: 'space',
      targetCount: '1',
      targetSpecial: 'projection point and nearby creatures',
      rangeUnits: 'ft',
      rangeValue: '30',
      rangeSpecial: '',
      school: 'nec',
      properties: ['vocal', 'somatic', 'material'],
      materials: 'three drops of blood and a sulfur-black candle wick',
      identifier: 'lotm-criminal-devil-projection-rite',
      activityId: 'criminalSeq7Projection03',
      now: now + 6,
      existing: existing3,
      sort: 1900202
    });

    await abilitiesDb.put(`!items!${ABILITY_1_ID}`, JSON.stringify(ability1));
    await abilitiesDb.put(`!items!${ABILITY_2_ID}`, JSON.stringify(ability2));
    await abilitiesDb.put(`!items!${ABILITY_3_ID}`, JSON.stringify(ability3));

    const verifyPathway = await getOptionalJson(pathwaysDb, PATHWAY_KEY);
    const verifyFolder = await getOptionalJson(abilitiesDb, FOLDER_KEY);
    const verifyLegacyA = await getOptionalJson(abilitiesDb, LEGACY_A_KEY);
    const verifyLegacyB = await getOptionalJson(abilitiesDb, LEGACY_B_KEY);
    const verifyAbility1 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_1_ID}`);
    const verifyAbility2 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_2_ID}`);
    const verifyAbility3 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_3_ID}`);

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
              _id: verifyAbility1?._id,
              name: verifyAbility1?.name,
              folder: verifyAbility1?.folder,
              sourceClass: verifyAbility1?.system?.sourceClass,
              identifier: verifyAbility1?.system?.identifier,
              grantedSequence: verifyAbility1?.flags?.lotm?.grantedSequence,
              level: verifyAbility1?.system?.level
            },
            {
              _id: verifyAbility2?._id,
              name: verifyAbility2?.name,
              folder: verifyAbility2?.folder,
              sourceClass: verifyAbility2?.system?.sourceClass,
              identifier: verifyAbility2?.system?.identifier,
              grantedSequence: verifyAbility2?.flags?.lotm?.grantedSequence,
              level: verifyAbility2?.system?.level
            },
            {
              _id: verifyAbility3?._id,
              name: verifyAbility3?.name,
              folder: verifyAbility3?.folder,
              sourceClass: verifyAbility3?.system?.sourceClass,
              identifier: verifyAbility3?.system?.identifier,
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
