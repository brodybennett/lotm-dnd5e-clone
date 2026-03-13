const { ClassicLevel } = require('./node-tools/node_modules/classic-level');

const CORE_VERSION = '13.351';
const SYSTEM_ID = 'lotm';
const SYSTEM_VERSION = '5.2.6';
const MODIFIER = '0000000000000000';

const PATHWAY_KEY = '!items!lotmPathway00017';
const FOLDER_KEY = '!folders!ukRXXDOSR2TXowMz';
const PATHWAY_IDENTIFIER = 'lotm-planter';
const FOLDER_ID = 'ukRXXDOSR2TXowMz';

const LEGACY_A_KEY = '!items!lotmAbilityF6001';
const LEGACY_B_KEY = '!items!lotmAbilityF5002';

const ABILITY_1_KEY = '!items!lotmAbilityF4001';
const ABILITY_2_KEY = '!items!lotmAbilityF4002';
const ABILITY_3_KEY = '!items!lotmAbilityF4003';
const ABILITY_4_KEY = '!items!lotmAbilityF4004';

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
      '<p><strong>Sequence 3-0 Status:</strong> Pending authoring in later sequence-focused runs.</p>' +
      '<p><strong>Continuity Anchor:</strong> At Sequence 4 (Ancient Alchemist), Druid authority condenses into demigod-grade transmutation and control: mutation pressure, crafted lifeforms, broader life-aura amplification, and controlled command over unstable organisms.</p>';
    pathway._stats = buildStats(now, pathway._stats);
    await pathwaysDb.put(PATHWAY_KEY, JSON.stringify(pathway));

    const folder = await getOptionalJson(abilitiesDb, FOLDER_KEY);
    if (!folder) throw new Error('Planter folder (ukRXXDOSR2TXowMz) not found.');

    folder.name = 'Planter';
    folder.description = 'Sequence abilities for the Planter pathway (authored through Sequence 4).';
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
    if (!legacyA) throw new Error('Legacy target lotmAbilityF6001 not found.');
    if (!legacyB) throw new Error('Legacy target lotmAbilityF5002 not found.');

    const legacyAHeader = '<h3>Legacy Upgrade (Sequence 4 - Scope)</h3>';
    const legacyAText =
      '<p>At Sequence 4, Cross-breeding reaches soul-bearing propagation. ' +
      'When you apply Cross-breeding with at least <strong>+2 Spirituality</strong>, one resulting hybrid can retain coherent behavior and function outside the immediate area for up to 1 hour. ' +
      'You may maintain up to <strong>Potency</strong> such stable hybrids at once, and each can carry one previously chosen trait package into a new adjacent zone once per scene.</p>';
    const legacyADesc = String(legacyA.system?.description?.value ?? '');
    if (!legacyADesc.includes(legacyAHeader)) {
      legacyA.system.description.value = `${legacyADesc}${legacyAHeader}${legacyAText}`;
    }
    legacyA._stats = buildStats(now + 2, legacyA._stats);
    await abilitiesDb.put(LEGACY_A_KEY, JSON.stringify(legacyA));

    const legacyBHeader = '<h3>Legacy Upgrade (Sequence 4 - Potency)</h3>';
    const legacyBText =
      '<p>At Sequence 4, Wrath of Nature carries mutation-weighted pressure. ' +
      'When a designated target fails the strongest Wrath of Nature control rider, it also suffers <strong>Potency</strong> vitality damage and gains +1 madness pressure step (GM corruption-risk tracker) until the end of its next turn. ' +
      'If cast at +4 Spirituality, this potency rider can apply to up to <strong>Potency</strong> failed targets once per round.</p>';
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
      id: 'lotmAbilityF4001',
      name: 'Mutation',
      description:
        '<p><strong>Baseline (2 Spirituality):</strong> Action. Target one creature within 60 feet and impose an unstable biological shift. The target makes a Constitution save. On failure, choose one mutation until end of its next turn: extra-organ burden (disadvantage on physical checks), contaminant growth (cannot benefit from food/potion healing), or sensory distortion (disadvantage on Perception and ranged attacks).</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Affect one additional target with separate saves.</li><li><strong>+2 Spirituality:</strong> Duration becomes 1 minute (repeat save at end of each turn), and first failed save also deals <strong>Potency</strong> bio-psychic damage.</li><li><strong>+4 Spirituality:</strong> Mutation becomes contagious in a 10-foot radius around each failed target for one round; secondary targets make a Constitution save or suffer a lesser version of the chosen mutation until end of next turn.</li></ul><p><em>Counterplay:</em> purification effects, transmutation resistance, and strong biological stabilization can suppress mutation outcomes.</p><p><em>Corruption Hook:</em> if you inflict mutation for spectacle on helpless beings, gain 1 Corruption.</p>',
      img: 'icons/magic/unholy/strike-body-life-soul-green.webp',
      activationType: 'action',
      durationValue: '',
      durationUnits: 'inst',
      targetType: 'creature',
      targetCount: '1',
      targetSpecial: 'creature subjected to active mutation pressure',
      rangeUnits: 'ft',
      rangeValue: '60',
      rangeSpecial: '',
      school: 'nec',
      properties: ['vocal', 'somatic', 'material'],
      materials: 'a preserved mutation sample in resin',
      identifier: 'lotm-planter-mutation',
      activityId: 'planterSeq4MutAct01',
      now: now + 4,
      existing: ability1Existing,
      sort: 1500500
    });

    const ability2 = buildAbilityDoc({
      id: 'lotmAbilityF4002',
      name: 'Artificial Life Creation',
      description:
        '<p><strong>Baseline (2 Spirituality):</strong> Action. Shape nearby soil, clay, plant matter, or prepared organic medium into one temporary life construct (small golem/chimera helper) for 10 minutes. It can perform one assigned role each round: guard, carry, hinder one creature (contest vs your DC), or deliver one touch-range ability for you.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Create one additional construct or increase one construct to medium size.</li><li><strong>+2 Spirituality:</strong> Constructs gain HP equal to <strong>Potency * 3</strong> and one special rider (grapple tendrils, shielding body, or detox secretion).</li><li><strong>+4 Spirituality:</strong> One construct gains quasi-soul coherence for 1 hour: it can follow complex instructions, maintain one ritual stance, and relay sensory snapshots to you once per round.</li></ul><p><em>Counterplay:</em> anti-summon fields, intense heat, and soul-disruption effects can degrade construct integrity quickly.</p><p><em>Corruption Hook:</em> if you create disposable lifeforms solely to absorb civilian harm you could prevent, gain 1 Corruption.</p>',
      img: 'icons/magic/nature/tree-spirit-ward.webp',
      activationType: 'action',
      durationValue: '10',
      durationUnits: 'minute',
      targetType: 'object',
      targetCount: '1',
      targetSpecial: 'local earth/organic medium transformed into temporary construct',
      rangeUnits: 'ft',
      rangeValue: '30',
      rangeSpecial: '',
      school: 'trs',
      properties: ['somatic', 'material'],
      materials: 'clay, seed mass, and a bloodless soul-fragment analogue sigil',
      identifier: 'lotm-planter-artificial-life-creation',
      activityId: 'planterSeq4ArtAct02',
      now: now + 5,
      existing: ability2Existing,
      sort: 1500501
    });

    const ability3 = buildAbilityDoc({
      id: 'lotmAbilityF4003',
      name: 'Life Aura',
      description:
        '<p><strong>Baseline (1 Spirituality):</strong> Bonus action. Radiate vibrant life force in a 20-foot aura for 1 minute. Allies in the aura gain +1 to saving throws against poison, disease, and fear. Plants and simple organisms in the zone rapidly recover, and one allied creature each round gains temporary HP equal to <strong>Potency</strong>.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Aura radius becomes 30 feet and lasts 10 minutes.</li><li><strong>+2 Spirituality:</strong> Allies in aura recover <strong>Potency</strong> HP the first time each round they start below half HP (once per creature per round).</li><li><strong>+4 Spirituality:</strong> Life force surge suppresses one ongoing poison/disease effect on each ally in aura for 1 round and may calm one low-intelligence hostile biological creature (Wisdom save negates).</li></ul><p><em>Counterplay:</em> necrotic zones, anti-healing wards, and severe corruption fields can invert or dampen aura output.</p><p><em>Corruption Hook:</em> if you exploit aura dependence to control allies rather than protect them, gain 1 Corruption.</p>',
      img: 'icons/magic/life/heart-area-circle-green.webp',
      activationType: 'bonus',
      durationValue: '1',
      durationUnits: 'minute',
      targetType: 'sphere',
      targetCount: '1',
      targetSpecial: 'life-force aura around caster',
      rangeUnits: 'self',
      rangeValue: null,
      rangeSpecial: '',
      school: 'abj',
      properties: ['vocal', 'somatic'],
      materials: '',
      identifier: 'lotm-planter-life-aura',
      activityId: 'planterSeq4LifAct03',
      now: now + 6,
      existing: ability3Existing,
      sort: 1500502
    });

    const ability4 = buildAbilityDoc({
      id: 'lotmAbilityF4004',
      name: 'Creature Commanding',
      description:
        '<p><strong>Baseline (1 Spirituality):</strong> Action. Command one low-intelligence creature (beast, insect swarm, plant-like beyonder creature, or unstable chimera) within 60 feet for 1 minute. Target makes a Wisdom save. On failure, it follows one concise command each round (move, hold, harry, guard) and suffers disadvantage on attacks against your designated protected target.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Affect one additional valid creature with separate saves.</li><li><strong>+2 Spirituality:</strong> Duration becomes 10 minutes and failed targets also lose reactions while obeying your command this round.</li><li><strong>+4 Spirituality:</strong> If a target fails by 5 or more, you may briefly suppress its instability/madness pressure for 1 round and redirect it to protect allies or disengage from civilians.</li></ul><p><em>Counterplay:</em> high-intelligence minds, domination immunity, and strong will reinforcement can resist or break command loops.</p><p><em>Corruption Hook:</em> if you force dominated creatures to commit unnecessary cruelty, gain 1 Corruption.</p>',
      img: 'icons/creatures/mammals/bull-horned-blue.webp',
      activationType: 'action',
      durationValue: '1',
      durationUnits: 'minute',
      targetType: 'creature',
      targetCount: '1',
      targetSpecial: 'low-intelligence biological or plant-like creature',
      rangeUnits: 'ft',
      rangeValue: '60',
      rangeSpecial: '',
      school: 'enc',
      properties: ['vocal', 'somatic', 'material'],
      materials: 'a braided vine ring and ironwood token',
      identifier: 'lotm-planter-creature-commanding',
      activityId: 'planterSeq4ComAct04',
      now: now + 7,
      existing: ability4Existing,
      sort: 1500503
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
          legacyUpdated: [
            { key: LEGACY_A_KEY, applied: legacyAApplied },
            { key: LEGACY_B_KEY, applied: legacyBApplied }
          ],
          abilityKeys: [ABILITY_1_KEY, ABILITY_2_KEY, ABILITY_3_KEY, ABILITY_4_KEY],
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
})();
