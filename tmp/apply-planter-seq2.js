const { ClassicLevel } = require('./node-tools/node_modules/classic-level');

const CORE_VERSION = '13.351';
const SYSTEM_ID = 'lotm';
const SYSTEM_VERSION = '5.2.6';
const MODIFIER = '0000000000000000';

const PATHWAY_KEY = '!items!lotmPathway00017';
const FOLDER_KEY = '!folders!ukRXXDOSR2TXowMz';
const PATHWAY_IDENTIFIER = 'lotm-planter';
const FOLDER_ID = 'ukRXXDOSR2TXowMz';

const LEGACY_A_KEY = '!items!lotmAbilityF3002';
const LEGACY_B_KEY = '!items!lotmAbilityF4002';

const ABILITY_1_KEY = '!items!lotmAbilityF2001';
const ABILITY_2_KEY = '!items!lotmAbilityF2002';
const ABILITY_3_KEY = '!items!lotmAbilityF2003';
const ABILITY_4_KEY = '!items!lotmAbilityF2004';

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
      '<p><strong>Sequence 1-0 Status:</strong> Pending authoring in later sequence-focused runs.</p>' +
      '<p><strong>Continuity Anchor:</strong> At Sequence 2 (Desolate Matriarch), Pallbearer control blooms into regional authority over fertility and desolation: she can nurture abundance, induce barrenness, spread toxin pressure, command low-intelligence life, and weaponize return-to-earth inevitability.</p>';
    pathway._stats = buildStats(now, pathway._stats);
    await pathwaysDb.put(PATHWAY_KEY, JSON.stringify(pathway));

    const folder = await getOptionalJson(abilitiesDb, FOLDER_KEY);
    if (!folder) throw new Error('Planter folder (ukRXXDOSR2TXowMz) not found.');

    folder.name = 'Planter';
    folder.description = 'Sequence abilities for the Planter pathway (authored through Sequence 2).';
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
    if (!legacyA) throw new Error('Legacy target lotmAbilityF3002 not found.');
    if (!legacyB) throw new Error('Legacy target lotmAbilityF4002 not found.');

    const legacyAHeader = '<h3>Legacy Upgrade (Sequence 2 - Potency)</h3>';
    const legacyAText =
      '<p>At Sequence 2, Life Deprivation carries desolate judgement. ' +
      'When a target fails its Life Deprivation save, it also undergoes a <strong>trial of death and loss of control</strong>: the target must immediately roll a secondary Wisdom save. ' +
      'On secondary failure, it suffers either immediate collapse to 0 HP (if already below half HP) or mutation shock (disadvantage on all d20 tests until end of next turn), GM adjudicated by context. ' +
      'This secondary trial can affect up to <strong>Potency</strong> failed targets per cast.</p>';
    const legacyADesc = String(legacyA.system?.description?.value ?? '');
    if (!legacyADesc.includes(legacyAHeader)) {
      legacyA.system.description.value = `${legacyADesc}${legacyAHeader}${legacyAText}`;
    }
    legacyA._stats = buildStats(now + 2, legacyA._stats);
    await abilitiesDb.put(LEGACY_A_KEY, JSON.stringify(legacyA));

    const legacyBHeader = '<h3>Legacy Upgrade (Sequence 2 - Scope)</h3>';
    const legacyBText =
      '<p>At Sequence 2, Artificial Life Creation scales to broad brood authority. ' +
      'A single cast can now create mixed medium constructs (soil, plant, ore, or metal) distributed across a 60-foot radius, with a maximum of <strong>Potency</strong> concurrent constructs in your control (GM may cap by scene complexity). ' +
      'One construct may be designated a demigod-grade vanguard with doubled HP and one extra role action each round for 1 minute.</p>';
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
      id: 'lotmAbilityF2001',
      name: 'Gift of the Land',
      description:
        '<p><strong>Baseline (2 Spirituality):</strong> Action. Establish one 60-foot-radius land decree within 300 feet for 10 minutes. Choose one mode:</p><ul><li><strong>Bountiful Earth:</strong> allied creatures in the zone gain +Potency on Survival/Nature/Medicine checks and one allied creature each round regains HP equal to Potency.</li><li><strong>Barren Earth:</strong> hostile creatures in the zone treat terrain as difficult terrain and cannot benefit from natural regeneration or food-based recovery.</li></ul><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> increase radius to 90 feet or create one additional adjacent decree zone.</li><li><strong>+2 Spirituality:</strong> Bountiful Earth also grants advantage on saves against poison/disease; Barren Earth forces Constitution saves each round or take Potency necrotic damage.</li><li><strong>+4 Spirituality:</strong> for 1 hour, you may switch each decree zone between Bountiful and Barren once per round as a bonus action.</li></ul><p><em>Counterplay:</em> high-tier purification, anti-field rites, and sealed sterile environments can suppress zone authority.</p><p><em>Corruption Hook:</em> if you weaponize barren decrees to starve noncombatants, gain 1 Corruption.</p>',
      img: 'icons/environment/wilderness/wheat-oat-grass-yellow.webp',
      activationType: 'action',
      durationValue: '10',
      durationUnits: 'minute',
      targetType: 'space',
      targetCount: '1',
      targetSpecial: 'land decree zone',
      rangeUnits: 'ft',
      rangeValue: '300',
      rangeSpecial: '',
      school: 'abj',
      properties: ['vocal', 'somatic', 'material'],
      materials: 'soil from fertile and barren ground mixed in one vessel',
      identifier: 'lotm-planter-gift-of-the-land',
      activityId: 'planterSeq2GifAct01',
      now: now + 4,
      existing: ability1Existing,
      sort: 1500700
    });

    const ability2 = buildAbilityDoc({
      id: 'lotmAbilityF2002',
      name: 'Desolate Domain',
      description:
        '<p><strong>Baseline (2 Spirituality):</strong> Action. Carve a 30-foot-radius desolation domain within 120 feet for 1 minute. Hostile creatures in the domain make a Constitution save at start of their turns; on failure they take Potency necrotic damage and have disadvantage on the next saving throw against mutation, toxin, or fear before end of turn.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> radius becomes 45 feet and includes one secondary toxin profile (choose: slow, blurred vision, or reaction lockout) on failed saves.</li><li><strong>+2 Spirituality:</strong> you may designate up to Potency low-intelligence creatures in the domain as tamed auxiliaries while domain lasts.</li><li><strong>+4 Spirituality:</strong> each failed save also increases instability pressure (GM corruption track) by one step; undead in the domain make Wisdom saves or dissipate at end of their turn.</li></ul><p><em>Counterplay:</em> radiant sanctuaries, strong anti-necrotic wards, and rapid displacement out of the domain.</p><p><em>Corruption Hook:</em> if you invoke domain collapse in settlements where safer options existed, gain 1 Corruption.</p>',
      img: 'icons/environment/wilderness/terrain-barren-earth-cracked.webp',
      activationType: 'action',
      durationValue: '1',
      durationUnits: 'minute',
      targetType: 'space',
      targetCount: '1',
      targetSpecial: 'desolation domain',
      rangeUnits: 'ft',
      rangeValue: '120',
      rangeSpecial: '',
      school: 'nec',
      properties: ['vocal', 'somatic', 'material'],
      materials: 'withered root dust and a sealed toxin seed',
      identifier: 'lotm-planter-desolate-domain',
      activityId: 'planterSeq2DesAct02',
      now: now + 5,
      existing: ability2Existing,
      sort: 1500701
    });

    const ability3 = buildAbilityDoc({
      id: 'lotmAbilityF2003',
      name: 'Sovereign Broodcraft',
      description:
        '<p><strong>Baseline (2 Spirituality):</strong> Action. Create up to two demigod-grade brood constructs from soil, plants, ore, or metal in unoccupied spaces within 60 feet for 10 minutes. Each construct can take one role per round: guard, harry, carry, grapple, or intercept one strike for an ally.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> create one additional lesser construct or grant one construct flying/climbing movement.</li><li><strong>+2 Spirituality:</strong> constructs gain HP equal to Potency*4 and one enhanced role (toxin lash, shielding wall, or life-seed repair).</li><li><strong>+4 Spirituality:</strong> designate one sovereign construct for 1 minute; it gains two role actions per round and can emit a 15-foot aura that grants allies +Potency on saves vs poison/disease/loss-of-control.</li></ul><p><em>Counterplay:</em> anti-summon effects, construct-bane attacks, and soul-disruption can collapse brood control.</p><p><em>Corruption Hook:</em> if you treat sentient-like constructs as disposable torment tools, gain 1 Corruption.</p>',
      img: 'icons/magic/nature/tree-spirit-green.webp',
      activationType: 'action',
      durationValue: '10',
      durationUnits: 'minute',
      targetType: 'object',
      targetCount: '1',
      targetSpecial: 'local earth/organic/ore medium for brood constructs',
      rangeUnits: 'ft',
      rangeValue: '60',
      rangeSpecial: '',
      school: 'trs',
      properties: ['somatic', 'material'],
      materials: 'clay heart-core, sprout catalyst, and engraved metal dust',
      identifier: 'lotm-planter-sovereign-broodcraft',
      activityId: 'planterSeq2BroAct03',
      now: now + 6,
      existing: ability3Existing,
      sort: 1500702
    });

    const ability4 = buildAbilityDoc({
      id: 'lotmAbilityF2004',
      name: 'Cycle Incarnation',
      description:
        '<p><strong>Baseline (2 Spirituality):</strong> Bonus action. Assume a partial cycle-incarnation form for 1 minute. Choose one aspect:</p><ul><li><strong>Life Aspect:</strong> your healing/support effects gain +Potency and you gain resistance to poison.</li><li><strong>Earth Aspect:</strong> you gain burrow speed 20 ft and resistance to nonmagical bludgeoning/piercing.</li><li><strong>Return Aspect:</strong> hostile creatures you hit or affect have -Potency on the next save against your death/return effects.</li></ul><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> maintain two aspects simultaneously.</li><li><strong>+2 Spirituality:</strong> gain temporary HP equal to Potency*2 when transformation begins, and movement through natural terrain ignores difficult terrain.</li><li><strong>+4 Spirituality:</strong> briefly touch mythical threshold; once per round when you cast a Sequence ability, apply one additional upcast rider from that ability for free (GM adjudicates compatibility).</li></ul><p><em>Counterplay:</em> anti-transformation effects, high-pressure radiant suppression, and control-lock debuffs can force reversion.</p><p><em>Corruption Hook:</em> if you overuse mythical threshold despite obvious instability risk, gain 1 Corruption.</p>',
      img: 'icons/magic/nature/leaf-glow-maple-teal.webp',
      activationType: 'bonus',
      durationValue: '1',
      durationUnits: 'minute',
      targetType: 'self',
      targetCount: '1',
      targetSpecial: 'self cycle-incarnation state',
      rangeUnits: 'self',
      rangeValue: null,
      rangeSpecial: '',
      school: 'abj',
      properties: ['vocal', 'somatic', 'material'],
      materials: 'threefold sigil of seed, stone, and grave-soil',
      identifier: 'lotm-planter-cycle-incarnation',
      activityId: 'planterSeq2CycAct04',
      now: now + 7,
      existing: ability4Existing,
      sort: 1500703
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
