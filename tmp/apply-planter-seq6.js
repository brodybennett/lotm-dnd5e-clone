const { ClassicLevel } = require('./node-tools/node_modules/classic-level');

const CORE_VERSION = '13.351';
const SYSTEM_ID = 'lotm';
const SYSTEM_VERSION = '5.2.6';
const MODIFIER = '0000000000000000';

const PATHWAY_KEY = '!items!lotmPathway00017';
const FOLDER_KEY = '!folders!ukRXXDOSR2TXowMz';
const PATHWAY_IDENTIFIER = 'lotm-planter';
const FOLDER_ID = 'ukRXXDOSR2TXowMz';

const LEGACY_A_KEY = '!items!lotmAbilityF9002';
const LEGACY_B_KEY = '!items!lotmAbilityF8002';

const ABILITY_1_KEY = '!items!lotmAbilityF6001';
const ABILITY_2_KEY = '!items!lotmAbilityF6002';
const ABILITY_3_KEY = '!items!lotmAbilityF6003';

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
    if (!pathway) throw new Error('Planter pathway (lotmPathway00017) not found.');

    pathway.system = pathway.system ?? {};
    pathway.system.description = pathway.system.description ?? { value: '', chat: '' };
    pathway.system.description.value =
      '<p><strong>Pathway Vector:</strong> nurturing cultivation through patient labor, life-giving guidance, and cyclical awareness of weather and growth.</p>' +
      '<p><strong>Sequence 9 Package (Total Budget 2):</strong> Cultivator&#39;s Hands, Season Reading.</p>' +
      '<p><strong>Sequence 8 Package (Gain Budget +3):</strong> Herbal Diagnosis, Restorative Sap, plus one legacy efficiency upgrade to Cultivator&#39;s Hands.</p>' +
      '<p><strong>Sequence 7 Package (Gain Budget +13):</strong> Seed Catalysation, Plant and Insect Commanding, Harvest Weather Rite, plus two legacy upgrades (Cultivator&#39;s Hands and Herbal Diagnosis).</p>' +
      '<p><strong>Sequence 6 Package (Gain Budget +9):</strong> Cross-breeding, Poison Creation, Knowledge of Life, plus two legacy upgrades (Season Reading and Restorative Sap).</p>' +
      '<p><strong>Sequence 5-0 Status:</strong> Pending authoring in later sequence-focused runs.</p>' +
      '<p><strong>Continuity Anchor:</strong> At Sequence 6 (Biologist), Harvest Priest stewardship becomes experimental life-science: selective breeding, compound extraction, and precise understanding of living systems while preserving patient, non-harsh guidance.</p>';
    pathway._stats = buildStats(now, pathway._stats);
    await pathwaysDb.put(PATHWAY_KEY, JSON.stringify(pathway));

    const folder = await getOptionalJson(abilitiesDb, FOLDER_KEY);
    if (!folder) throw new Error('Planter folder (ukRXXDOSR2TXowMz) not found.');

    folder.name = 'Planter';
    folder.description = 'Sequence abilities for the Planter pathway (authored through Sequence 6).';
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
    if (!legacyA) throw new Error('Legacy target lotmAbilityF9002 not found.');
    if (!legacyB) throw new Error('Legacy target lotmAbilityF8002 not found.');

    const legacyAHeader = '<h3>Legacy Upgrade (Sequence 6 - Scope)</h3>';
    const legacyAText =
      '<p>At Sequence 6, Season Reading can map biological pressure lines. ' +
      'When you complete a Season Reading, choose one additional lane: disease vector, pollination movement, or toxin drift across the forecasted zone. ' +
      'You and allies briefed by you gain <strong>+Potency</strong> on one relevant check to prevent contamination or preserve crops before your next short rest. ' +
      'Once per short rest, this lane mapping can be applied without spending the +1 upcast surcharge.</p>';
    const legacyADesc = String(legacyA.system?.description?.value ?? '');
    if (!legacyADesc.includes(legacyAHeader)) {
      legacyA.system.description.value = `${legacyADesc}${legacyAHeader}${legacyAText}`;
    }
    legacyA._stats = buildStats(now + 2, legacyA._stats);
    await abilitiesDb.put(LEGACY_A_KEY, JSON.stringify(legacyA));

    const legacyBHeader = '<h3>Legacy Upgrade (Sequence 6 - Efficiency)</h3>';
    const legacyBText =
      '<p>At Sequence 6, Restorative Sap can be prepared as a standing tincture. ' +
      'Once per round, if a creature already carries your active Restorative Sap aura and takes damage, you may trigger its baseline healing rider as a <strong>reaction</strong> instead of recasting the ability. ' +
      'When you do, reduce the spirituality surcharge of your next Restorative Sap cast this turn by <strong>1</strong> (minimum 0), once per short rest.</p>';
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
      id: 'lotmAbilityF6001',
      name: 'Cross-breeding',
      description:
        '<p><strong>Baseline (1 Spirituality):</strong> Action. Hybridize two compatible plant or simple-organism samples within 30 feet. For 10 minutes, produce one controlled hybrid trait package:</p><ul><li><strong>Resilience Trait:</strong> chosen plant zone or allied herbal item gains resistance to one natural stress (cold, drought, rot, or pests).</li><li><strong>Yield Trait:</strong> one cultivated target doubles one practical non-combat output (forage, medicine stock, fiber, or seed yield) for the scene.</li><li><strong>Mobility Trait:</strong> allies crossing the hybridized growth ignore one difficult-terrain penalty each round.</li></ul><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> apply two trait packages at once or increase duration to 1 hour.</li><li><strong>+2 Spirituality:</strong> one trait scales to <strong>Potency</strong> targets in the same zone.</li><li><strong>+4 Spirituality:</strong> maintain a stable hybrid field for 1 hour; once per round, one ally in the field gains temporary HP equal to <strong>Potency</strong> or advantage on one Medicine/Nature/Survival check tied to living systems.</li></ul><p><em>Counterplay:</em> incompatible substrates, sterile environments, and anti-transmutation effects collapse hybrid stability.</p><p><em>Corruption Hook:</em> if you force reckless hybridization on sentient populations without consent, gain 1 Corruption.</p>',
      img: 'icons/environment/wilderness/plant-vine-leaf.webp',
      activationType: 'action',
      durationValue: '10',
      durationUnits: 'minute',
      targetType: 'object',
      targetCount: '2',
      targetSpecial: 'compatible plants or simple-organism samples',
      rangeUnits: 'ft',
      rangeValue: '30',
      rangeSpecial: '',
      school: 'trs',
      properties: ['somatic', 'material'],
      materials: 'paired seed samples and a binding nutrient paste',
      identifier: 'lotm-planter-cross-breeding',
      activityId: 'planterSeq6CroAct01',
      now: now + 4,
      existing: ability1Existing,
      sort: 1500300
    });

    const ability2 = buildAbilityDoc({
      id: 'lotmAbilityF6002',
      name: 'Poison Creation',
      description:
        '<p><strong>Baseline (1 Spirituality):</strong> Action. Distill one biological compound from local flora/fauna residue and apply it to a weapon, trap, or dose within 5 feet. Choose one formula:</p><ul><li><strong>Sedative Toxin:</strong> first struck target makes a Constitution save; on failure, its speed is reduced by 10 feet and it cannot take reactions until start of its next turn.</li><li><strong>Irritant Compound:</strong> first struck target makes a Constitution save; on failure, it takes <strong>+1 poison damage</strong> at start of each turn until the end of its next turn.</li><li><strong>Antitoxin Distillate:</strong> one ally immediately gains advantage on its next save against poison/disease and gains HP equal to <strong>Potency</strong>.</li></ul><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> prepare one additional dose or apply one dose at range 30 feet.</li><li><strong>+2 Spirituality:</strong> hostile formula potency becomes <strong>+Potency</strong> damage/effect value; antitoxin can affect up to <strong>Potency</strong> creatures within 10 feet.</li><li><strong>+4 Spirituality:</strong> formulate a dual-use batch that contains one hostile and one restorative dose from the same action, and one chosen dose can be delivered as a bonus action this turn.</li></ul><p><em>Counterplay:</em> toxin immunity, sealed armor, purification wards, and rapid washing counter many biological compounds.</p><p><em>Corruption Hook:</em> if you deploy toxins indiscriminately where collateral is foreseeable, gain 1 Corruption.</p>',
      img: 'icons/consumables/potions/bottle-conical-corked-labeled-green.webp',
      activationType: 'action',
      durationValue: '',
      durationUnits: 'inst',
      targetType: 'creature',
      targetCount: '1',
      targetSpecial: 'first valid target exposed to prepared dose',
      rangeUnits: 'touch',
      rangeValue: null,
      rangeSpecial: '',
      school: 'nec',
      properties: ['somatic', 'material'],
      materials: 'a vial, stabilizing herb salts, and extracted biological residue',
      identifier: 'lotm-planter-poison-creation',
      activityId: 'planterSeq6PoiAct02',
      now: now + 5,
      existing: ability2Existing,
      sort: 1500301
    });

    const ability3 = buildAbilityDoc({
      id: 'lotmAbilityF6003',
      name: 'Knowledge of Life',
      description:
        '<p><strong>Baseline (0 Spirituality):</strong> Bonus action. Enter analytical life-sense for 1 minute. You read one biological profile within 60 feet (vital stress, disease burden, toxin exposure, regenerative potential, or reproductive state) and choose one support rider:</p><ul><li><strong>Clinical Focus:</strong> you or one ally gains <strong>+Potency</strong> on one Medicine/Nature check about that target before your next turn.</li><li><strong>Stability Cue:</strong> target gains +1 on its next saving throw against poison, disease, or exhaustion.</li><li><strong>Cycle Timing:</strong> once this round, an ally acting on your call may move 5 feet without provoking opportunity attacks from biologically impaired creatures.</li></ul><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> profile up to two additional targets and extend duration to 10 minutes.</li><li><strong>+2 Spirituality:</strong> Stability Cue applies to up to <strong>Potency</strong> allies in 20 feet, and Clinical Focus also grants advantage if the check is made within 1 minute.</li><li><strong>+4 Spirituality:</strong> for 1 minute, once per round after a profiled enemy fails a save, you may impose <strong>-Potency</strong> on its next poison/disease/exhaustion-related roll or grant equivalent bonus to an allied countermeasure roll.</li></ul><p><em>Counterplay:</em> shape-shifting biomasks, null-life zones, and heavy magical concealment can blur profile quality.</p><p><em>Corruption Hook:</em> if you treat living beings purely as test stock and suppress humane care, gain 1 Corruption.</p>',
      img: 'icons/magic/life/cross-explosion-green.webp',
      activationType: 'bonus',
      durationValue: '1',
      durationUnits: 'minute',
      targetType: 'creature',
      targetCount: '1',
      targetSpecial: 'biological profile target',
      rangeUnits: 'ft',
      rangeValue: '60',
      rangeSpecial: '',
      school: 'div',
      properties: ['vocal', 'somatic'],
      materials: '',
      identifier: 'lotm-planter-knowledge-of-life',
      activityId: 'planterSeq6KnoAct03',
      now: now + 6,
      existing: ability3Existing,
      sort: 1500302
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
})();
