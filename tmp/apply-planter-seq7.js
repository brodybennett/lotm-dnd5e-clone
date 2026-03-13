const { ClassicLevel } = require('./node-tools/node_modules/classic-level');

const CORE_VERSION = '13.351';
const SYSTEM_ID = 'lotm';
const SYSTEM_VERSION = '5.2.6';
const MODIFIER = '0000000000000000';

const PATHWAY_KEY = '!items!lotmPathway00017';
const FOLDER_KEY = '!folders!ukRXXDOSR2TXowMz';
const PATHWAY_IDENTIFIER = 'lotm-planter';
const FOLDER_ID = 'ukRXXDOSR2TXowMz';

const LEGACY_A_KEY = '!items!lotmAbilityF9001';
const LEGACY_B_KEY = '!items!lotmAbilityF8001';

const ABILITY_1_KEY = '!items!lotmAbilityF7001';
const ABILITY_2_KEY = '!items!lotmAbilityF7002';
const ABILITY_3_KEY = '!items!lotmAbilityF7003';

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
    if (!pathway) throw new Error('Planter pathway (lotmPathway00017) not found.');

    pathway.system = pathway.system ?? {};
    pathway.system.description = pathway.system.description ?? { value: '', chat: '' };
    pathway.system.description.value =
      '<p><strong>Pathway Vector:</strong> nurturing cultivation through patient labor, life-giving guidance, and cyclical awareness of weather and growth.</p>' +
      '<p><strong>Sequence 9 Package (Total Budget 2):</strong> Cultivator&#39;s Hands, Season Reading.</p>' +
      '<p><strong>Sequence 8 Package (Gain Budget +3):</strong> Herbal Diagnosis, Restorative Sap, plus one legacy efficiency upgrade to Cultivator&#39;s Hands.</p>' +
      '<p><strong>Sequence 7 Package (Gain Budget +13):</strong> Seed Catalysation, Plant and Insect Commanding, Harvest Weather Rite, plus two legacy upgrades (Cultivator&#39;s Hands and Herbal Diagnosis).</p>' +
      '<p><strong>Sequence 6-0 Status:</strong> Pending authoring in later sequence-focused runs.</p>' +
      '<p><strong>Continuity Anchor:</strong> At Sequence 7 (Harvest Priest), Doctor-level treatment expands into ecosystem-scale stewardship: accelerating growth, coordinating simple lifeforms, and guiding weather in restorative cycles.</p>';
    pathway._stats = buildStats(now, pathway._stats);
    await pathwaysDb.put(PATHWAY_KEY, JSON.stringify(pathway));

    const folder = await getOptionalJson(abilitiesDb, FOLDER_KEY);
    if (!folder) throw new Error('Planter folder (ukRXXDOSR2TXowMz) not found.');

    folder.name = 'Planter';
    folder.description = 'Sequence abilities for the Planter pathway (authored through Sequence 7).';
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
    if (!legacyA) throw new Error('Legacy target lotmAbilityF9001 not found.');
    if (!legacyB) throw new Error('Legacy target lotmAbilityF8001 not found.');

    const legacyAHeader = '<h3>Legacy Upgrade (Sequence 7 - Scope)</h3>';
    const legacyAText =
      '<p>At Sequence 7, Cultivator&#39;s Hands can propagate in a full planting lane. ' +
      'If you use Cultivator&#39;s Hands with at least <strong>+1 Spirituality</strong>, its chosen mode can affect one additional 5-foot square or plant target within 15 feet of the first. ' +
      'When you choose Guiding Furrow, both squares can provide the movement rider in the same round. ' +
      'Once per short rest, this split-lane effect applies without the +1 surcharge.</p>';
    const legacyADesc = String(legacyA.system?.description?.value ?? '');
    if (!legacyADesc.includes(legacyAHeader)) {
      legacyA.system.description.value = `${legacyADesc}${legacyAHeader}${legacyAText}`;
    }
    legacyA._stats = buildStats(now + 2, legacyA._stats);
    await abilitiesDb.put(LEGACY_A_KEY, JSON.stringify(legacyA));

    const legacyBHeader = '<h3>Legacy Upgrade (Sequence 7 - Efficiency)</h3>';
    const legacyBText =
      '<p>At Sequence 7, Herbal Diagnosis can be woven into active care flow. ' +
      'If you have physically examined a creature within the last minute, you may cast Herbal Diagnosis on that same creature as a <strong>bonus action</strong> instead of an action. ' +
      'When cast this way, the first <strong>+1 Spirituality</strong> upcast rider cost is reduced by 1 (minimum 0) once per round.</p>';
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
      id: 'lotmAbilityF7001',
      name: 'Seed Catalysation',
      description:
        '<p><strong>Baseline (1 Spirituality):</strong> Action. Catalyse seeds or rooted plants within a 15-foot radius point in 60 feet. Choose one mode:</p><ul><li><strong>Rapid Bloom:</strong> Create grasping roots in the area until the start of your next turn; it is difficult terrain for hostile creatures.</li><li><strong>Burst Maturity:</strong> One prepared plant target erupts to useful maturity, granting one immediate alchemical/medical plant resource or one 5-foot cube of soft cover.</li></ul><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Radius becomes 20 feet, and you may choose both modes.</li><li><strong>+2 Spirituality:</strong> Hostile creatures entering Rapid Bloom for the first time each round must pass a Strength save or have speed reduced by <strong>Potency * 5 feet</strong> until the end of their turn.</li><li><strong>+4 Spirituality:</strong> The growth cycle continues for 1 minute. At the start of each of your turns, choose one allied creature in the area to gain temporary HP equal to <strong>Potency</strong> or gain +Potency on one Nature, Survival, or Medicine check before your next turn.</li></ul><p><em>Counterplay:</em> sterile stone, salt-scorched earth, firebreaks, and anti-growth effects reduce or block catalysis.</p><p><em>Corruption Hook:</em> if you force overgrowth that destroys a community&#39;s food chain for personal gain, gain 1 Corruption.</p>',
      img: 'icons/environment/wilderness/plant-seedling-blue.webp',
      activationType: 'action',
      durationValue: '',
      durationUnits: 'inst',
      targetType: 'point',
      targetCount: '1',
      targetSpecial: 'seeds or rooted plants in target area',
      rangeUnits: 'ft',
      rangeValue: '60',
      rangeSpecial: '',
      school: 'trs',
      properties: ['somatic', 'material'],
      materials: 'a handful of mixed seeds and damp soil',
      identifier: 'lotm-planter-seed-catalysation',
      activityId: 'planterSeq7CatAct01',
      now: now + 4,
      existing: ability1Existing,
      sort: 1500200
    });

    const ability2 = buildAbilityDoc({
      id: 'lotmAbilityF7002',
      name: 'Plant and Insect Commanding',
      description:
        '<p><strong>Baseline (0 Spirituality):</strong> Bonus action. Issue gentle command to non-sapient plants and insects within 30 feet for 1 minute. Choose one command mode:</p><ul><li><strong>Guide:</strong> One ally gains +1d4 on its next Survival, Nature, or Perception check using local flora/fauna signs.</li><li><strong>Harry:</strong> One hostile creature must pass a Constitution save or has disadvantage on its next attack roll before the end of its next turn.</li><li><strong>Screen:</strong> Living growth and swarming insects create light cover for one creature until the start of your next turn.</li></ul><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Affect one additional target and extend range to 60 feet.</li><li><strong>+2 Spirituality:</strong> Up to <strong>Potency</strong> allies can benefit from Guide or Screen in the same cast.</li><li><strong>+4 Spirituality:</strong> Establish a 20-foot command zone for 1 minute; once per round, you may switch one creature inside between Guide/Harry/Screen without spending another action.</li></ul><p><em>Counterplay:</em> barren terrain, pesticide/smoke saturation, heavy rain, and supernatural fear auras disperse controlled lifeforms.</p><p><em>Corruption Hook:</em> if you command swarms to slowly torment captives instead of ending conflict, gain 1 Corruption.</p>',
      img: 'icons/creatures/invertebrates/wasp-swarm.webp',
      activationType: 'bonus',
      durationValue: '1',
      durationUnits: 'minute',
      targetType: 'creature',
      targetCount: '1',
      targetSpecial: 'creatures assisted or hindered by nearby plants and insects',
      rangeUnits: 'ft',
      rangeValue: '30',
      rangeSpecial: '',
      school: 'enc',
      properties: ['vocal', 'somatic'],
      materials: '',
      identifier: 'lotm-planter-plant-and-insect-commanding',
      activityId: 'planterSeq7CmdAct02',
      now: now + 5,
      existing: ability2Existing,
      sort: 1500201
    });

    const ability3 = buildAbilityDoc({
      id: 'lotmAbilityF7003',
      name: 'Harvest Weather Rite',
      description:
        '<p><strong>Baseline (1 Spirituality):</strong> Action (or 1-minute ritual for non-combat use). Shape local weather in a 60-foot radius centered within 120 feet for 10 minutes: choose <strong>Gentle Rain</strong> (dust suppression, soil softening, minor heat relief) or <strong>Clear Sky</strong> (fog thinning, light drying, wind calming). While active, allied creatures in the area gain +1 on checks against natural weather hazards.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Radius becomes 90 feet and duration becomes 1 hour.</li><li><strong>+2 Spirituality:</strong> In Gentle Rain, allied creatures regain HP equal to <strong>Potency</strong> once per scene when they spend Hit Dice or receive healing; in Clear Sky, difficult terrain from mud/rain/wind is ignored by allies for one movement each round.</li><li><strong>+4 Spirituality:</strong> Choose one cultivated field, grove, or garden in the area; cleanse one non-supernatural blight or one disease affecting its plants, and up to <strong>Potency</strong> allies gain advantage on their next save against poison or disease before the rite ends.</li></ul><p><em>Counterplay:</em> sealed interiors, violent supernatural weather, and anti-ritual interference can collapse the rite early.</p><p><em>Corruption Hook:</em> if you weaponize famine by selectively denying weather relief to helpless settlements, gain 1 Corruption.</p>',
      img: 'icons/environment/wilderness/clouds-rainfall-heavy-blue.webp',
      activationType: 'action',
      durationValue: '10',
      durationUnits: 'minute',
      targetType: 'sphere',
      targetCount: '1',
      targetSpecial: 'localized weather field',
      rangeUnits: 'ft',
      rangeValue: '120',
      rangeSpecial: '',
      school: 'abj',
      properties: ['vocal', 'somatic', 'material'],
      materials: 'a ribbon of wheat straw and a bowl of clean water',
      identifier: 'lotm-planter-harvest-weather-rite',
      activityId: 'planterSeq7WeaAct03',
      now: now + 6,
      existing: ability3Existing,
      sort: 1500202
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
})();
