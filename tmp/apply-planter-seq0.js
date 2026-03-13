const { ClassicLevel } = require('./node-tools/node_modules/classic-level');

const CORE_VERSION = '13.351';
const SYSTEM_ID = 'lotm';
const SYSTEM_VERSION = '5.2.6';
const MODIFIER = '0000000000000000';

const PATHWAY_KEY = '!items!lotmPathway00017';
const FOLDER_KEY = '!folders!ukRXXDOSR2TXowMz';
const PATHWAY_IDENTIFIER = 'lotm-planter';
const FOLDER_ID = 'ukRXXDOSR2TXowMz';

const LEGACY_A_KEY = '!items!lotmAbilityF2001'; // Gift of the Land (Sequence 2)
const LEGACY_B_KEY = '!items!lotmAbilityF3003'; // Return to Earth (Sequence 3)

const ABILITY_1_KEY = '!items!lotmAbilityF0001';
const ABILITY_2_KEY = '!items!lotmAbilityF0002';
const ABILITY_3_KEY = '!items!lotmAbilityF0003';
const ABILITY_4_KEY = '!items!lotmAbilityF0004';

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
      level: 9,
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
        grantedSequence: 0
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
    if (!pathway) throw new Error('Planter pathway (lotmPathway00017) not found.');

    pathway.system = pathway.system ?? {};
    pathway.system.description = pathway.system.description ?? { value: '', chat: '' };
    pathway.system.description.value =
      '<p><strong>Pathway Vector:</strong> nurturing cultivation through patient labor, life-giving guidance, and cyclical awareness of weather and growth.</p>' +
      '<p><strong>Sequence 9 Package (Total Budget 2):</strong> Cultivator&#39;s Hands, Season Reading.</p>' +
      '<p><strong>Sequence 8 Package (Gain Budget +3):</strong> Herbal Diagnosis, Restorative Sap, plus one legacy efficiency upgrade to Cultivator&#39;s Hands.</p>' +
      '<p><strong>Sequence 7 Package (Gain Budget +13):</strong> Seed Catalysation, Plant and Insect Commanding, Harvest Weather Rite, plus two legacy upgrades (Cultivator&#39;s Hands and Herbal Diagnosis).</p>' +
      '<p><strong>Sequence 6 Package (Gain Budget +9):</strong> Cross-breeding, Poison Creation, Knowledge of Life, plus two legacy upgrades (Season Reading and Restorative Sap).</p>' +
      '<p><strong>Sequence 5 Package (Gain Budget +13):</strong> Underground Travel, Wrath of Nature, Child of the Oak, plus two legacy upgrades (Seed Catalysation and Cross-breeding).</p>' +
      '<p><strong>Sequence 4 Package (Gain Budget +33):</strong> Mutation, Artificial Life Creation, Life Aura, Creature Commanding, plus two legacy upgrades (Cross-breeding and Wrath of Nature).</p>' +
      '<p><strong>Sequence 3 Package (Gain Budget +20):</strong> Evil Spirit Transformation, Life Deprivation, Return to Earth, Maternal Embrace, plus two legacy upgrades (Cross-breeding and Child of the Oak).</p>' +
      '<p><strong>Sequence 2 Package (Gain Budget +50):</strong> Gift of the Land, Desolate Domain, Sovereign Broodcraft, Cycle Incarnation, plus two legacy upgrades (Life Deprivation and Artificial Life Creation).</p>' +
      '<p><strong>Sequence 1 Package (Gain Budget +74):</strong> Child of Nature, Various Escape Techniques, World Creation, Natural Concept Sovereignty, plus two legacy upgrades (Gift of the Land and Return to Earth).</p>' +
      '<p><strong>Sequence 0 Package (Gain Budget +114):</strong> Mother&#39;s Authority, Bountiful Earth, Universal Return, Genesis Transmutation, plus two legacy upgrades (Gift of the Land and Return to Earth).</p>' +
      '<p><strong>Continuity Anchor:</strong> At Sequence 0, Naturewalker stewardship reaches complete cyclical authority: nurturing abundance, correcting distorted forms, and enforcing return without abandoning patient life-guidance.</p>';
    pathway._stats = buildStats(now, pathway._stats);
    await pathwaysDb.put(PATHWAY_KEY, JSON.stringify(pathway));

    const folder = await getOptionalJson(abilitiesDb, FOLDER_KEY);
    if (!folder) throw new Error('Planter folder (ukRXXDOSR2TXowMz) not found.');

    folder.name = 'Planter';
    folder.description = 'Sequence abilities for the Planter pathway (authored through Sequence 0).';
    folder.flags = folder.flags ?? {};
    folder.flags.lotm = {
      ...(folder.flags.lotm ?? {}),
      pathwayIdentifier: PATHWAY_IDENTIFIER,
      latestAuthoredSequence: 0
    };
    folder._stats = buildStats(now + 1, folder._stats);
    await abilitiesDb.put(FOLDER_KEY, JSON.stringify(folder));

    const legacyA = await getOptionalJson(abilitiesDb, LEGACY_A_KEY);
    const legacyB = await getOptionalJson(abilitiesDb, LEGACY_B_KEY);
    if (!legacyA) throw new Error('Legacy target lotmAbilityF2001 not found.');
    if (!legacyB) throw new Error('Legacy target lotmAbilityF3003 not found.');

    const legacyAHeader = '<h3>Legacy Upgrade (Sequence 0 - Potency)</h3>';
    const legacyAText =
      '<p>At Sequence 0, Gift of the Land carries primordial motherly decree. ' +
      'Each maintained zone now applies one additional Potency layer: allied blessings scale by +Potency again, while hostile barren penalties impose one extra failed-save consequence chosen at cast time (movement lock, action strain, or vitality suppression). ' +
      'Once per round, you may grant one creature inside any zone immediate stabilization and cleanse one severe condition.</p>';
    const legacyADesc = String(legacyA.system?.description?.value ?? '');
    if (!legacyADesc.includes(legacyAHeader)) {
      legacyA.system.description.value = `${legacyADesc}${legacyAHeader}${legacyAText}`;
    }
    legacyA._stats = buildStats(now + 2, legacyA._stats);
    await abilitiesDb.put(LEGACY_A_KEY, JSON.stringify(legacyA));

    const legacyBHeader = '<h3>Legacy Upgrade (Sequence 0 - Scope)</h3>';
    const legacyBText =
      '<p>At Sequence 0, Return to Earth expands to battlefield inevitability. ' +
      'When triggered, it may now affect up to <strong>Potency</strong> additional valid targets within 60 feet of the origin target and can resolve across line-of-sight barriers of non-mythical grade. ' +
      'In nonlethal mode, affected targets are returned to stable natural baseline instead of destroyed, preserving the pathway&#39;s life-guidance ethos.</p>';
    const legacyBDesc = String(legacyB.system?.description?.value ?? '');
    if (!legacyBDesc.includes(legacyBHeader)) {
      legacyB.system.description.value = `${legacyBDesc}${legacyBHeader}${legacyBText}`;
    }
    legacyB._stats = buildStats(now + 3, legacyB._stats);
    await abilitiesDb.put(LEGACY_B_KEY, JSON.stringify(legacyB));

    const ability1Existing = await getOptionalJson(abilitiesDb, ABILITY_1_KEY);
    const ability2Existing = await getOptionalJson(abilitiesDb, ABILITY_2_KEY);
    const ability3Existing = await getOptionalJson(abilitiesDb, ABILITY_3_KEY);
    const ability4Existing = await getOptionalJson(abilitiesDb, ABILITY_4_KEY);

    const ability1 = buildAbilityDoc({
      id: 'lotmAbilityF0001',
      name: "Mother's Authority",
      description:
        '<p><strong>Baseline (4 Spirituality):</strong> Action. For 1 minute, project a 120-foot aura of natural sovereignty centered on you. Choose two concepts at cast: Light, Lightning, Flame, Storm, Sea, Moon, or Shadowed Growth. Each concept grants one allied benefit and one hostile pressure (GM selects exact checks/saves per scene framing).</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+2 Spirituality:</strong> add one concept and increase aura to 180 feet.</li><li><strong>+3 Spirituality:</strong> run four concepts simultaneously; switch one concept each round as a free action.</li><li><strong>+5 Spirituality:</strong> each round emit one authority pulse affecting up to Potency targets with an immediate concept rider.</li></ul><p><em>Counterplay:</em> rival conceptual dominion, anti-authority seals, and sequence-equal domain contestation.</p><p><em>Corruption Hook:</em> if you impose concept pressure to erase local culture rather than guide recovery, gain 1 Corruption.</p>',
      img: 'icons/magic/nature/symbol-moon-stars-white.webp',
      activationType: 'action',
      durationValue: '1',
      durationUnits: 'minute',
      targetType: 'self',
      targetCount: '1',
      targetSpecial: 'self-centered sovereignty aura',
      rangeUnits: 'self',
      rangeValue: null,
      rangeSpecial: '',
      school: 'abj',
      properties: ['vocal', 'somatic', 'material'],
      materials: 'mother-seal inscribed with seven natural symbols',
      identifier: 'lotm-planter-mothers-authority',
      activityId: 'planterSeq0MotAct01',
      now: now + 4,
      existing: ability1Existing,
      sort: 1500900
    });

    const ability2 = buildAbilityDoc({
      id: 'lotmAbilityF0002',
      name: 'Bountiful Earth',
      description:
        '<p><strong>Baseline (5 Spirituality):</strong> Action or 1-minute rite. Bless one region up to 300-foot radius within 1 mile for 1 hour. Choose mode:</p><ul><li><strong>Bounty:</strong> allied creatures gain accelerated recovery, food/water restoration, and +Potency on endurance and healing rolls.</li><li><strong>Quarantine:</strong> hostile entities lose regenerative effects, take Potency vitality strain each round, and cannot create new summons inside the region.</li></ul><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+2 Spirituality:</strong> increase to 600-foot radius or sustain two linked regions.</li><li><strong>+3 Spirituality:</strong> duration becomes 8 hours; you may switch mode once per round.</li><li><strong>+6 Spirituality:</strong> regional miracle clause: revive dead flora/fauna, heal blight, and clear plague-level contamination at GM-approved scale.</li></ul><p><em>Counterplay:</em> equivalent-rank domain replacement, consecrated denial circles, or forced displacement outside the region.</p><p><em>Corruption Hook:</em> if quarantine is used for punitive starvation of innocents, gain 1 Corruption.</p>',
      img: 'icons/environment/wilderness/wheat-oat-grass-yellow.webp',
      activationType: 'action',
      durationValue: '1',
      durationUnits: 'hour',
      targetType: 'space',
      targetCount: '1',
      targetSpecial: 'blessed or quarantined region',
      rangeUnits: 'mi',
      rangeValue: '1',
      rangeSpecial: '',
      school: 'abj',
      properties: ['vocal', 'somatic', 'material'],
      materials: 'fertile soil, spring water, and moonlit ash',
      identifier: 'lotm-planter-bountiful-earth',
      activityId: 'planterSeq0BouAct02',
      now: now + 5,
      existing: ability2Existing,
      sort: 1500901
    });

    const ability3 = buildAbilityDoc({
      id: 'lotmAbilityF0003',
      name: 'Universal Return',
      description:
        '<p><strong>Baseline (5 Spirituality):</strong> Action. Target up to Potency creatures/constructs/effects within 300 feet. Each target makes a Wisdom save. On failure, it is returned toward its true baseline: active transformations, unstable summons, and forced mutations are suppressed or ended; hostile targets take Potency psychic + necrotic damage and suffer disadvantage on their next roll.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+2 Spirituality:</strong> target count doubles and range becomes 1,000 feet.</li><li><strong>+3 Spirituality:</strong> affects one mythic-grade ongoing effect per target on failed save.</li><li><strong>+6 Spirituality:</strong> invoke total-cycle clause; choose lethal or nonlethal resolution. Lethal can reduce failed targets at low vitality to dust/dispersion, nonlethal forces immediate harmless reversion and incapacitation until end of next turn.</li></ul><p><em>Counterplay:</em> concept-anchor artifacts, true-form locks, and superior sequence shielding.</p><p><em>Corruption Hook:</em> repeated lethal use when nonlethal correction was viable risks 1 Corruption.</p>',
      img: 'icons/magic/death/skull-energy-light-blue.webp',
      activationType: 'action',
      durationValue: '',
      durationUnits: 'inst',
      targetType: 'creature',
      targetCount: '1',
      targetSpecial: 'up to Potency valid targets',
      rangeUnits: 'ft',
      rangeValue: '300',
      rangeSpecial: '',
      school: 'nec',
      properties: ['vocal', 'somatic', 'material'],
      materials: 'cycle-sigil made from seed husk and grave dust',
      identifier: 'lotm-planter-universal-return',
      activityId: 'planterSeq0UniAct03',
      now: now + 6,
      existing: ability3Existing,
      sort: 1500902
    });

    const ability4 = buildAbilityDoc({
      id: 'lotmAbilityF0004',
      name: 'Genesis Transmutation',
      description:
        '<p><strong>Baseline (4 Spirituality):</strong> Action. Within 300 feet, transmute up to Potency targets (creatures, terrain patches, or objects) for 10 minutes. You may heal major injuries, neutralize toxins, convert harmful terrain to safe terrain, or reshape inert matter into functional natural resources.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+2 Spirituality:</strong> extend to 1 hour and double target count.</li><li><strong>+3 Spirituality:</strong> convert one hazardous phenomenon (wildfire front, toxic flood, unstable storm pocket) into a controllable natural state.</li><li><strong>+5 Spirituality:</strong> genesis clause: create a persistent life-support ecosystem node (food, water, shelter, medicinal growth) for one day.</li></ul><p><em>Counterplay:</em> anti-transmutation wards, void zones, and superior conceptual resistance.</p><p><em>Corruption Hook:</em> if transmutation is used to forcibly rewrite sentient identity, gain 1 Corruption.</p>',
      img: 'icons/magic/nature/leaf-rune-glow-green.webp',
      activationType: 'action',
      durationValue: '10',
      durationUnits: 'minute',
      targetType: 'object',
      targetCount: '1',
      targetSpecial: 'up to Potency creatures/objects/terrain patches',
      rangeUnits: 'ft',
      rangeValue: '300',
      rangeSpecial: '',
      school: 'trs',
      properties: ['vocal', 'somatic', 'material'],
      materials: 'living branch, sea salt, and refined mineral dust',
      identifier: 'lotm-planter-genesis-transmutation',
      activityId: 'planterSeq0GenAct04',
      now: now + 7,
      existing: ability4Existing,
      sort: 1500903
    });

    await abilitiesDb.put(ABILITY_1_KEY, JSON.stringify(ability1));
    await abilitiesDb.put(ABILITY_2_KEY, JSON.stringify(ability2));
    await abilitiesDb.put(ABILITY_3_KEY, JSON.stringify(ability3));
    await abilitiesDb.put(ABILITY_4_KEY, JSON.stringify(ability4));

    const verifyPathway = await getOptionalJson(pathwaysDb, PATHWAY_KEY);
    const verifyFolder = await getOptionalJson(abilitiesDb, FOLDER_KEY);
    const verifyLegacyA = await getOptionalJson(abilitiesDb, LEGACY_A_KEY);
    const verifyLegacyB = await getOptionalJson(abilitiesDb, LEGACY_B_KEY);
    const verifyAbility1 = await getOptionalJson(abilitiesDb, ABILITY_1_KEY);
    const verifyAbility2 = await getOptionalJson(abilitiesDb, ABILITY_2_KEY);
    const verifyAbility3 = await getOptionalJson(abilitiesDb, ABILITY_3_KEY);
    const verifyAbility4 = await getOptionalJson(abilitiesDb, ABILITY_4_KEY);

    const legacyAApplied = String(verifyLegacyA?.system?.description?.value ?? '').includes(legacyAHeader);
    const legacyBApplied = String(verifyLegacyB?.system?.description?.value ?? '').includes(legacyBHeader);

    console.log(
      JSON.stringify(
        {
          pathwayKey: PATHWAY_KEY,
          pathwayId: verifyPathway?._id,
          pathwayIdentifier: verifyPathway?.system?.identifier,
          folderKey: FOLDER_KEY,
          folderId: verifyFolder?._id,
          folderName: verifyFolder?.name,
          folderLatestAuthoredSequence: verifyFolder?.flags?.lotm?.latestAuthoredSequence,
          legacyUpdated: [
            { key: LEGACY_A_KEY, applied: legacyAApplied },
            { key: LEGACY_B_KEY, applied: legacyBApplied }
          ],
          abilityKeys: [ABILITY_1_KEY, ABILITY_2_KEY, ABILITY_3_KEY, ABILITY_4_KEY],
          abilityReadBack: [
            {
              _id: verifyAbility1?._id,
              name: verifyAbility1?.name,
              identifier: verifyAbility1?.system?.identifier,
              folder: verifyAbility1?.folder,
              sourceClass: verifyAbility1?.system?.sourceClass,
              grantedSequence: verifyAbility1?.flags?.lotm?.grantedSequence,
              level: verifyAbility1?.system?.level
            },
            {
              _id: verifyAbility2?._id,
              name: verifyAbility2?.name,
              identifier: verifyAbility2?.system?.identifier,
              folder: verifyAbility2?.folder,
              sourceClass: verifyAbility2?.system?.sourceClass,
              grantedSequence: verifyAbility2?.flags?.lotm?.grantedSequence,
              level: verifyAbility2?.system?.level
            },
            {
              _id: verifyAbility3?._id,
              name: verifyAbility3?.name,
              identifier: verifyAbility3?.system?.identifier,
              folder: verifyAbility3?.folder,
              sourceClass: verifyAbility3?.system?.sourceClass,
              grantedSequence: verifyAbility3?.flags?.lotm?.grantedSequence,
              level: verifyAbility3?.system?.level
            },
            {
              _id: verifyAbility4?._id,
              name: verifyAbility4?.name,
              identifier: verifyAbility4?.system?.identifier,
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
})();
