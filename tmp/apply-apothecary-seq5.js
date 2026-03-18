const { ClassicLevel } = require('./node-tools/node_modules/classic-level');

const CORE_VERSION = '13.351';
const SYSTEM_ID = 'lotm';
const SYSTEM_VERSION = '5.2.6';
const MODIFIER = '0000000000000000';

const PATHWAY_KEY = '!items!lotmPathway00018';
const FOLDER_KEY = '!folders!y19Aib8B9WnjpCGl';
const PATHWAY_IDENTIFIER = 'lotm-apothecary';
const FOLDER_ID = 'y19Aib8B9WnjpCGl';

const LEGACY_A_KEY = '!items!lotmAbilityY7001';
const LEGACY_B_KEY = '!items!lotmAbilityY8001';

const ABILITY_1_KEY = '!items!lotmAbilityY5001';
const ABILITY_2_KEY = '!items!lotmAbilityY5002';
const ABILITY_3_KEY = '!items!lotmAbilityY5003';

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
    if (!pathway) throw new Error('Apothecary pathway (lotmPathway00018) not found.');

    pathway.system = pathway.system ?? {};
    pathway.system.description = pathway.system.description ?? { value: '', chat: '' };
    pathway.system.description.value =
      '<p><strong>Pathway Vector:</strong> serene moonlit alchemy through diagnosis, gentle stabilization, and quiet control of medicinal flora.</p>' +
      '<p><strong>Sequence 9 Package (Total Budget 2):</strong> Moonlit Distillation, Vital Herb Sight.</p>' +
      '<p><strong>Sequence 8 Package (Gain Budget +3):</strong> Beast Communion, Tranquil Menagerie, plus one legacy scope upgrade to Vital Herb Sight.</p>' +
      '<p><strong>Sequence 7 Package (Gain Budget +13):</strong> Wings of Darkness, Corrosive Claw, Abyss Shackles, plus two legacy upgrades (Vital Herb Sight and Beast Communion).</p>' +
      '<p><strong>Sequence 6 Package (Gain Budget +9):</strong> Discerning Spiritual Materials, Potion and Perfume Crafting, Crimson Pulse Reading, plus two legacy upgrades (Moonlit Distillation and Beast Communion).</p>' +
      '<p><strong>Sequence 5 Package (Gain Budget +13):</strong> Full Moon, Moonlight Transformation, Flash, plus two legacy upgrades (Wings of Darkness and Beast Communion).</p>' +
      '<p><strong>Sequence 4-0 Status:</strong> Pending authoring in later sequence-focused runs.</p>' +
      '<p><strong>Continuity Anchor:</strong> At Sequence 5 (Scarlet Scholar), Potions Professor technique blooms into moon-domain combat scholarship: controlled full-moon pressure, body-state transformation, and short-burst repositioning under calm tactical cadence.</p>';
    pathway._stats = buildStats(now, pathway._stats);
    await pathwaysDb.put(PATHWAY_KEY, JSON.stringify(pathway));

    const folder = await getOptionalJson(abilitiesDb, FOLDER_KEY);
    if (!folder) throw new Error('Apothecary folder (y19Aib8B9WnjpCGl) not found.');

    folder.name = 'Apothecary';
    folder.description = 'Sequence abilities for the Apothecary pathway (authored through Sequence 5).';
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
    if (!legacyA) throw new Error('Legacy target lotmAbilityY7001 not found.');
    if (!legacyB) throw new Error('Legacy target lotmAbilityY8001 not found.');

    const legacyAHeader = '<h3>Legacy Upgrade (Sequence 5 - Potency)</h3>';
    const legacyAText =
      '<p>At Sequence 5, <strong>Wings of Darkness</strong> can carry scarlet moonlight pressure. ' +
      'When you move at least 10 feet while Wings of Darkness is active, you may choose one hostile creature you can see within 20 feet. ' +
      'That creature makes a Wisdom save or suffers <strong>-Potency</strong> on its next attack roll before the end of its next turn. ' +
      'If you spend at least <strong>+2 Spirituality</strong> on Wings of Darkness, you can apply this rider to two creatures instead of one (once per round).</p>';
    const legacyADesc = String(legacyA.system?.description?.value ?? '');
    if (!legacyADesc.includes(legacyAHeader)) {
      legacyA.system.description.value = `${legacyADesc}${legacyAHeader}${legacyAText}`;
    }
    legacyA._stats = buildStats(now + 2, legacyA._stats);
    await abilitiesDb.put(LEGACY_A_KEY, JSON.stringify(legacyA));

    const legacyBHeader = '<h3>Legacy Upgrade (Sequence 5 - Efficiency)</h3>';
    const legacyBText =
      '<p>At Sequence 5, <strong>Beast Communion</strong> can be sustained by scarlet-thought rhythm instead of repeated commands. ' +
      'Once per short rest, one bonded Beast can maintain your last non-suicidal command for 1 minute without additional action economy from you. ' +
      'While in dim light, darkness, or under moonlight, the first <strong>+1 Spirituality</strong> surcharge you pay on Beast Communion each turn is reduced by 1 (minimum 0).</p>';
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
      id: 'lotmAbilityY5001',
      name: 'Full Moon',
      description:
        '<p><strong>Baseline (1 Spirituality):</strong> Action. Raise a restrained moon-domain in a 20-foot radius within 60 feet for 1 minute. Hostile creatures in the area treat it as difficult terrain and make a Wisdom save when entering or starting their turn there. On failure, they take psychic damage equal to <strong>Potency</strong> and cannot take reactions until the start of their next turn.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Radius increases to 30 feet, or include one additional 15-foot satellite zone linked to the main domain.</li><li><strong>+2 Spirituality:</strong> Failed targets also have disadvantage on concentration checks and Insight checks until end of turn.</li><li><strong>+4 Spirituality:</strong> Domain duration becomes 10 minutes. Once per round, when an ally in the domain fails a save against fear, charm, poison, or disease, you may let it reroll with <strong>+Potency</strong>.</li></ul><p><em>Counterplay:</em> bright-sunlight flood, anti-domain wards, and forced repositioning out of the area reduce moon control value.</p><p><em>Corruption Hook:</em> If you imprison harmless targets in the domain for ritualized humiliation, gain 1 Corruption.</p>',
      img: 'icons/magic/light/orb-moon-silhouette.webp',
      activationType: 'action',
      durationValue: '1',
      durationUnits: 'minute',
      targetType: 'space',
      targetCount: '1',
      targetSpecial: 'moon-domain zone',
      rangeUnits: 'ft',
      rangeValue: '60',
      rangeSpecial: '',
      school: 'enc',
      properties: ['vocal', 'somatic', 'concentration'],
      materials: 'a silver disk etched with a crimson crescent',
      identifier: 'lotm-apothecary-full-moon',
      activityId: 'apothSeq5MoonAct01',
      now: now + 4,
      existing: ability1Existing,
      sort: 1800400
    });

    const ability2 = buildAbilityDoc({
      id: 'lotmAbilityY5002',
      name: 'Moonlight Transformation',
      description:
        '<p><strong>Baseline (1 Spirituality):</strong> Bonus action. Wrap yourself in controlled moonlight for 1 minute. Gain temporary HP equal to <strong>Potency</strong>, advantage on Acrobatics and Stealth checks in dim light/darkness, and resistance to one damage type of your choice between necrotic, poison, or psychic until the start of your next turn.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Extend chosen resistance for full duration, and your movement increases by 10 feet.</li><li><strong>+2 Spirituality:</strong> Once per round, when you take damage, reduce it by <strong>Potency</strong> and may move 5 feet without provoking opportunity attacks.</li><li><strong>+4 Spirituality:</strong> For 1 minute, you may choose one form stance at turn start: <em>Bat-Swarm</em> (ignore nonmagical difficult terrain and pass through allied spaces) or <em>Crimson Scholar</em> (gain <strong>+Potency</strong> to one Medicine, Arcana, or Insight check each turn and advantage on concentration checks).</li></ul><p><em>Counterplay:</em> radiant suppression, anti-shapeshift effects, and continuous forced illumination can strip stance value.</p><p><em>Corruption Hook:</em> If you indulge predatory urges during this form against non-threats, gain 1 Corruption.</p>',
      img: 'icons/magic/light/beam-rays-blue-small.webp',
      activationType: 'bonus',
      durationValue: '1',
      durationUnits: 'minute',
      targetType: 'self',
      targetCount: '1',
      targetSpecial: '',
      rangeUnits: 'self',
      rangeValue: null,
      rangeSpecial: '',
      school: 'trs',
      properties: ['somatic'],
      materials: 'a strand of moon-silver thread',
      identifier: 'lotm-apothecary-moonlight-transformation',
      activityId: 'apothSeq5TransAct02',
      now: now + 5,
      existing: ability2Existing,
      sort: 1800401
    });

    const ability3 = buildAbilityDoc({
      id: 'lotmAbilityY5003',
      name: 'Flash',
      description:
        '<p><strong>Baseline (1 Spirituality):</strong> Action. Blink through moonlit space up to 30 feet to an unoccupied point you can see. Choose one rider: (a) leave a fading afterimage that gives disadvantage to the next attack against you before start of your next turn, or (b) on arrival, one adjacent creature makes a Constitution save or takes radiant damage equal to <strong>Potency</strong>.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Range increases to 60 feet, and you may carry one willing creature of your size or smaller within 5 feet.</li><li><strong>+2 Spirituality:</strong> You may split the blink into two 30-foot segments with a valid midpoint, and one ally you pass within 10 feet may immediately move 10 feet without provoking opportunity attacks.</li><li><strong>+4 Spirituality:</strong> After arrival, create a 15-foot radius flash zone until start of your next turn; hostile creatures in the zone make a Wisdom save or are unable to take reactions and have disadvantage on Perception checks relying on sight.</li></ul><p><em>Counterplay:</em> no-line-of-sight conditions, anti-teleport fields, and reaction-ready interception can limit flash routing.</p><p><em>Corruption Hook:</em> If you use Flash only to terrorize and toy with powerless targets, gain 1 Corruption.</p>',
      img: 'icons/magic/light/explosion-star-glow-blue.webp',
      activationType: 'action',
      durationValue: '',
      durationUnits: 'inst',
      targetType: 'self',
      targetCount: '1',
      targetSpecial: 'self; optional carried ally on upcast',
      rangeUnits: 'self',
      rangeValue: null,
      rangeSpecial: 'teleport up to listed distance',
      school: 'con',
      properties: ['somatic'],
      materials: 'a polished mirror shard and a trace of silver powder',
      identifier: 'lotm-apothecary-flash',
      activityId: 'apothSeq5FlashAct03',
      now: now + 6,
      existing: ability3Existing,
      sort: 1800402
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
