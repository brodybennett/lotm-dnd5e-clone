const { ClassicLevel } = require('./node-tools/node_modules/classic-level');

const CORE_VERSION = '13.351';
const SYSTEM_ID = 'lotm';
const SYSTEM_VERSION = '5.2.6';
const MODIFIER = '0000000000000000';

const PATHWAY_KEY = '!items!lotmPathway00017';
const FOLDER_KEY = '!folders!ukRXXDOSR2TXowMz';
const PATHWAY_IDENTIFIER = 'lotm-planter';
const FOLDER_ID = 'ukRXXDOSR2TXowMz';

const LEGACY_A_KEY = '!items!lotmAbilityF2001'; // Gift of the Land
const LEGACY_B_KEY = '!items!lotmAbilityF3003'; // Return to Earth

const ABILITY_1_KEY = '!items!lotmAbilityF1001';
const ABILITY_2_KEY = '!items!lotmAbilityF1002';
const ABILITY_3_KEY = '!items!lotmAbilityF1003';
const ABILITY_4_KEY = '!items!lotmAbilityF1004';

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
      level: 8,
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
        grantedSequence: 1
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
      '<p><strong>Sequence 0 Status:</strong> Pending authoring in later sequence-focused runs.</p>' +
      '<p><strong>Continuity Anchor:</strong> At Sequence 1 (Naturewalker), Desolate Matriarch authority matures into stewardship of broader natural concepts: fertile cycles, weathered transitions, and controlled return become angel-tier environmental guidance rather than raw devastation.</p>';
    pathway._stats = buildStats(now, pathway._stats);
    await pathwaysDb.put(PATHWAY_KEY, JSON.stringify(pathway));

    const folder = await getOptionalJson(abilitiesDb, FOLDER_KEY);
    if (!folder) throw new Error('Planter folder (ukRXXDOSR2TXowMz) not found.');

    folder.name = 'Planter';
    folder.description = 'Sequence abilities for the Planter pathway (authored through Sequence 1).';
    folder.flags = folder.flags ?? {};
    folder.flags.lotm = {
      ...(folder.flags.lotm ?? {}),
      pathwayIdentifier: PATHWAY_IDENTIFIER,
      latestAuthoredSequence: 1
    };
    folder._stats = buildStats(now + 1, folder._stats);
    await abilitiesDb.put(FOLDER_KEY, JSON.stringify(folder));

    const legacyA = await getOptionalJson(abilitiesDb, LEGACY_A_KEY);
    const legacyB = await getOptionalJson(abilitiesDb, LEGACY_B_KEY);
    if (!legacyA) throw new Error('Legacy target lotmAbilityF2001 not found.');
    if (!legacyB) throw new Error('Legacy target lotmAbilityF3003 not found.');

    const legacyAHeader = '<h3>Legacy Upgrade (Sequence 1 - Scope)</h3>';
    const legacyAText =
      '<p>At Sequence 1, Gift of the Land becomes trans-regional stewardship. ' +
      'You may sustain up to <strong>Potency</strong> decree zones at once within 1 mile, and once per round you may shift one zone up to 60 feet as a bonus action without recasting. ' +
      'If two zones overlap, allies choose one additional boon while hostiles suffer one additional barren rider.</p>';
    const legacyADesc = String(legacyA.system?.description?.value ?? '');
    if (!legacyADesc.includes(legacyAHeader)) {
      legacyA.system.description.value = `${legacyADesc}${legacyAHeader}${legacyAText}`;
    }
    legacyA._stats = buildStats(now + 2, legacyA._stats);
    await abilitiesDb.put(LEGACY_A_KEY, JSON.stringify(legacyA));

    const legacyBHeader = '<h3>Legacy Upgrade (Sequence 1 - Efficiency)</h3>';
    const legacyBText =
      '<p>At Sequence 1, Return to Earth can be invoked with gentler inevitability. ' +
      'Once per round, when a marked creature within range drops to 0 HP or fails a save against your sequence abilities, you may trigger Return to Earth as a reaction with no additional setup. ' +
      'When you spend 4+ spirituality on another sequence ability, the first Return to Earth trigger before end of next turn costs 1 less spirituality (minimum 1).</p>';
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
      id: 'lotmAbilityF1001',
      name: 'Child of Nature',
      description:
        '<p><strong>Baseline (3 Spirituality):</strong> Action. For 10 minutes, you designate a 90-foot-radius living field within 300 feet. Choose two blessings: Verdant Recovery (allies regain HP equal to Potency at start of turns), Safe Growth (allies gain +Potency on saves vs poison/fear/loss-of-control), Gentle Restraint (hostiles treat terrain as difficult terrain and cannot Dash), or Seasonal Screen (allies gain half cover).</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> choose one additional blessing or increase radius to 120 feet.</li><li><strong>+2 Spirituality:</strong> duration becomes 1 hour and you may relocate the field 30 feet once per round.</li><li><strong>+4 Spirituality:</strong> each round choose one ally in the field to immediately end one poison/disease/charm effect.</li></ul><p><em>Counterplay:</em> anti-field sanctification, total ecological sterilization, and superior domain overrides can suppress blessings.</p><p><em>Corruption Hook:</em> if you enforce growth dogma that denies local will, gain 1 Corruption.</p>',
      img: 'icons/magic/nature/tree-spirit-blue.webp',
      activationType: 'action',
      durationValue: '10',
      durationUnits: 'minute',
      targetType: 'space',
      targetCount: '1',
      targetSpecial: 'living field zone',
      rangeUnits: 'ft',
      rangeValue: '300',
      rangeSpecial: '',
      school: 'abj',
      properties: ['vocal', 'somatic', 'material'],
      materials: 'seed-petal sigil blessed under dawn and dusk',
      identifier: 'lotm-planter-child-of-nature',
      activityId: 'planterSeq1ChiAct01',
      now: now + 4,
      existing: ability1Existing,
      sort: 1500800
    });

    const ability2 = buildAbilityDoc({
      id: 'lotmAbilityF1002',
      name: 'Various Escape Techniques',
      description:
        '<p><strong>Baseline (2 Spirituality):</strong> Reaction or bonus action. Move up to 120 feet to a natural anchor (root, vine, water, wind channel, moon-shadow, or fertile ground) you can perceive. This movement ignores opportunity attacks and restraints of non-legendary origin; if used as reaction to an attack/spell, gain +Potency to AC or saving throw against that trigger.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> bring one willing ally within 10 feet.</li><li><strong>+2 Spirituality:</strong> movement becomes 300 feet and you may pass through solid natural barriers up to 5 feet thick.</li><li><strong>+4 Spirituality:</strong> leave a cyclical afterimage for 1 round; once before your next turn, you may return to your origin point as a free reaction and gain resistance to all damage until the end of that reaction.</li></ul><p><em>Counterplay:</em> anchor denial zones, anti-teleport seals, and mythic tracking can predict exit vectors.</p><p><em>Corruption Hook:</em> repeated panic-escaping that abandons dependents may trigger 1 Corruption.</p>',
      img: 'icons/magic/nature/roots-warped-glow-magenta.webp',
      activationType: 'bonus',
      durationValue: '',
      durationUnits: 'inst',
      targetType: 'self',
      targetCount: '1',
      targetSpecial: 'self and optional adjacent ally',
      rangeUnits: 'self',
      rangeValue: null,
      rangeSpecial: '',
      school: 'con',
      properties: ['somatic', 'material'],
      materials: 'fresh root fiber tied in a loop',
      identifier: 'lotm-planter-various-escape-techniques',
      activityId: 'planterSeq1VarAct02',
      now: now + 5,
      existing: ability2Existing,
      sort: 1500801
    });

    const ability3 = buildAbilityDoc({
      id: 'lotmAbilityF1003',
      name: 'World Creation',
      description:
        '<p><strong>Baseline (4 Spirituality):</strong> Action (or 1-minute rite outside combat). Open a temporary nature pocket for 10 minutes: a 120-foot-radius micro-world centered on a point within 300 feet. You set one climate profile (spring rain, summer vitality, autumn hush, winter stillness). Allies inside gain profile boons; hostiles take profile pressure (GM chooses matching checks/saves).</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+2 Spirituality:</strong> duration becomes 1 hour and radius 180 feet.</li><li><strong>+3 Spirituality:</strong> add a second climate profile and switch profiles once per round.</li><li><strong>+5 Spirituality:</strong> imprint a sanctuary clause: allies can short-rest in 10 minutes while inside, once per scene.</li></ul><p><em>Counterplay:</em> stronger domain replacement, conceptual severance rituals, or forced displacement beyond boundary.</p><p><em>Corruption Hook:</em> if you erase existing communities to impose your ideal world-state, gain 1 Corruption.</p>',
      img: 'icons/environment/wilderness/terrain-forest-gray.webp',
      activationType: 'action',
      durationValue: '10',
      durationUnits: 'minute',
      targetType: 'space',
      targetCount: '1',
      targetSpecial: 'temporary micro-world',
      rangeUnits: 'ft',
      rangeValue: '300',
      rangeSpecial: '',
      school: 'ill',
      properties: ['vocal', 'somatic', 'material'],
      materials: 'soil from four seasons kept in separate vials',
      identifier: 'lotm-planter-world-creation',
      activityId: 'planterSeq1WorAct03',
      now: now + 6,
      existing: ability3Existing,
      sort: 1500802
    });

    const ability4 = buildAbilityDoc({
      id: 'lotmAbilityF1004',
      name: 'Natural Concept Sovereignty',
      description:
        '<p><strong>Baseline (3 Spirituality):</strong> Action. Invoke one natural concept for 1 minute in a 60-foot aura centered on you: Flame, Storm, Tide, Moon, or Shadowed Growth. Each concept grants one ally-facing benefit and one hostile-facing pressure (for example, Storm grants allied mobility and hostile concentration disruption; Tide grants allied repositioning and hostile pull/slow).</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> increase aura to 90 feet.</li><li><strong>+2 Spirituality:</strong> run two concepts simultaneously.</li><li><strong>+4 Spirituality:</strong> each round, switch one active concept as a free action and trigger an immediate concept pulse affecting up to Potency targets.</li></ul><p><em>Counterplay:</em> concept-insulation seals, opposing elemental dominion, and silence/disruption effects on invocation cadence.</p><p><em>Corruption Hook:</em> forcing natural concepts into purely punitive use may trigger 1 Corruption.</p>',
      img: 'icons/magic/nature/leaf-rune-glow-green.webp',
      activationType: 'action',
      durationValue: '1',
      durationUnits: 'minute',
      targetType: 'self',
      targetCount: '1',
      targetSpecial: 'self-centered concept aura',
      rangeUnits: 'self',
      rangeValue: null,
      rangeSpecial: '',
      school: 'trs',
      properties: ['vocal', 'somatic', 'material'],
      materials: 'sigil etched with flame, wave, moon, and branch',
      identifier: 'lotm-planter-natural-concept-sovereignty',
      activityId: 'planterSeq1NatAct04',
      now: now + 7,
      existing: ability4Existing,
      sort: 1500803
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
