const { ClassicLevel } = require('./node-tools/node_modules/classic-level');

const CORE_VERSION = '13.351';
const SYSTEM_ID = 'lotm';
const SYSTEM_VERSION = '5.2.6';
const MODIFIER = '0000000000000000';

const PATHWAY_KEY = '!items!lotmPathway00017';
const FOLDER_KEY = '!folders!ukRXXDOSR2TXowMz';
const PATHWAY_IDENTIFIER = 'lotm-planter';
const FOLDER_ID = 'ukRXXDOSR2TXowMz';

const LEGACY_A_KEY = '!items!lotmAbilityF7001';
const LEGACY_B_KEY = '!items!lotmAbilityF6001';

const ABILITY_1_KEY = '!items!lotmAbilityF5001';
const ABILITY_2_KEY = '!items!lotmAbilityF5002';
const ABILITY_3_KEY = '!items!lotmAbilityF5003';

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
      '<p><strong>Sequence 4-0 Status:</strong> Pending authoring in later sequence-focused runs.</p>' +
      '<p><strong>Continuity Anchor:</strong> At Sequence 5 (Druid), Biologist experimentation expands into active natural authority: traversing earth, directing environmental hostility at threats, and shielding life through oak-bound protection.</p>';
    pathway._stats = buildStats(now, pathway._stats);
    await pathwaysDb.put(PATHWAY_KEY, JSON.stringify(pathway));

    const folder = await getOptionalJson(abilitiesDb, FOLDER_KEY);
    if (!folder) throw new Error('Planter folder (ukRXXDOSR2TXowMz) not found.');

    folder.name = 'Planter';
    folder.description = 'Sequence abilities for the Planter pathway (authored through Sequence 5).';
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
    if (!legacyA) throw new Error('Legacy target lotmAbilityF7001 not found.');
    if (!legacyB) throw new Error('Legacy target lotmAbilityF6001 not found.');

    const legacyAHeader = '<h3>Legacy Upgrade (Sequence 5 - Potency)</h3>';
    const legacyAText =
      '<p>At Sequence 5, Seed Catalysation gains druidic force. ' +
      'When a creature fails the strongest control rider from Seed Catalysation, it also takes vitality pressure equal to <strong>Potency</strong> once that round. ' +
      'If you used the +4 Spirituality tier, this vitality pressure can trigger on up to two failed targets per round. ' +
      'Once per short rest, the first trigger in a scene applies without additional surcharge.</p>';
    const legacyADesc = String(legacyA.system?.description?.value ?? '');
    if (!legacyADesc.includes(legacyAHeader)) {
      legacyA.system.description.value = `${legacyADesc}${legacyAHeader}${legacyAText}`;
    }
    legacyA._stats = buildStats(now + 2, legacyA._stats);
    await abilitiesDb.put(LEGACY_A_KEY, JSON.stringify(legacyA));

    const legacyBHeader = '<h3>Legacy Upgrade (Sequence 5 - Efficiency)</h3>';
    const legacyBText =
      '<p>At Sequence 5, Cross-breeding can be prepared as a patient field protocol. ' +
      'If you created a hybrid field earlier in the scene, you may reapply one existing trait package within 30 feet as a <strong>bonus action</strong> instead of an action. ' +
      'When reapplying this way, reduce the first upcast surcharge of Cross-breeding by <strong>1</strong> (minimum 0), once per round and once per short rest for free.</p>';
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
      id: 'lotmAbilityF5001',
      name: 'Underground Travel',
      description:
        '<p><strong>Baseline (1 Spirituality):</strong> Action. Melt into natural earth or packed stone and travel underground up to 30 feet, then emerge in an unoccupied space you can sense. This movement ignores opportunity attacks and most surface obstacles. You leave the ground stable behind you unless you choose otherwise.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Travel distance becomes 60 feet, or bring one willing creature of your size or smaller along the path.</li><li><strong>+2 Spirituality:</strong> Emerge with a soft earthen surge in a 10-foot radius; hostile creatures must pass a Dexterity save or fall prone.</li><li><strong>+4 Spirituality:</strong> Maintain subterranean phase for 1 minute. Once per round, you may re-submerge and relocate up to 30 feet as a bonus action while this phase lasts.</li></ul><p><em>Counterplay:</em> worked metal flooring, consecrated foundations, anti-earth barriers, and unstable voids can block transit.</p><p><em>Corruption Hook:</em> if you use this to abandon dependents you vowed to protect, gain 1 Corruption.</p>',
      img: 'icons/environment/wilderness/cave-entrance-mountain-blue.webp',
      activationType: 'action',
      durationValue: '',
      durationUnits: 'inst',
      targetType: 'self',
      targetCount: '1',
      targetSpecial: 'self and optional carried ally when upcast',
      rangeUnits: 'self',
      rangeValue: null,
      rangeSpecial: '',
      school: 'trs',
      properties: ['somatic', 'material'],
      materials: 'a fist of native soil and a pressed oak root fiber',
      identifier: 'lotm-planter-underground-travel',
      activityId: 'planterSeq5UndAct01',
      now: now + 4,
      existing: ability1Existing,
      sort: 1500400
    });

    const ability2 = buildAbilityDoc({
      id: 'lotmAbilityF5002',
      name: 'Wrath of Nature',
      description:
        '<p><strong>Baseline (1 Spirituality):</strong> Action. Designate up to 3 adversaries you can perceive within 60 feet for 1 round. Local environment turns hostile to them: their space and adjacent ground becomes difficult terrain, and each designated target has disadvantage on its next attack roll or mobility check before the end of its next turn.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Targets increase to <strong>Potency</strong>, or range increases to 90 feet.</li><li><strong>+2 Spirituality:</strong> Each target makes a Strength save; on failure, roots and debris restrain it until the end of its next turn.</li><li><strong>+4 Spirituality:</strong> Sustain for 1 minute in a 30-foot radius zone. Once per round, choose one designated target; that target must pass a Dexterity save or take <strong>Potency</strong> bludgeoning damage from falling branches/stones and lose reactions until start of next turn.</li></ul><p><em>Counterplay:</em> sterile interiors, cleared battlefields, and strong anti-control effects reduce environmental leverage.</p><p><em>Corruption Hook:</em> if you call wrath on farmland or civilians out of impatience, gain 1 Corruption.</p>',
      img: 'icons/environment/wilderness/terrain-rocky-ground.webp',
      activationType: 'action',
      durationValue: '1',
      durationUnits: 'round',
      targetType: 'creature',
      targetCount: '3',
      targetSpecial: 'designated adversaries in natural or mixed terrain',
      rangeUnits: 'ft',
      rangeValue: '60',
      rangeSpecial: '',
      school: 'enc',
      properties: ['vocal', 'somatic'],
      materials: '',
      identifier: 'lotm-planter-wrath-of-nature',
      activityId: 'planterSeq5WraAct02',
      now: now + 5,
      existing: ability2Existing,
      sort: 1500401
    });

    const ability3 = buildAbilityDoc({
      id: 'lotmAbilityF5003',
      name: 'Child of the Oak',
      description:
        '<p><strong>Baseline (0 Spirituality):</strong> Bonus action. Encase yourself or one willing creature within 30 feet in layered bark and stone fibers for 1 minute. The target gains +1 AC and temporary HP equal to <strong>Potency</strong>. While this armor remains, the target has advantage on checks against forced movement.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Affect one additional willing creature in range.</li><li><strong>+2 Spirituality:</strong> AC bonus becomes <strong>+Potency</strong> (max +3), and targets gain resistance to nonmagical bludgeoning or piercing damage (choose on cast).</li><li><strong>+4 Spirituality:</strong> For 1 minute, each affected target can root itself as a reaction once per round when hit: reduce incoming damage by <strong>Potency</strong> and cannot be pushed/pulled until end of current turn.</li></ul><p><em>Counterplay:</em> fire-heavy pressure, anti-transmutation effects, and repeated movement disruption can strip oak protections quickly.</p><p><em>Corruption Hook:</em> if you hoard defensive blessings only for status allies while abandoning innocents, gain 1 Corruption.</p>',
      img: 'icons/magic/nature/tree-spirit-glow-black-yellow.webp',
      activationType: 'bonus',
      durationValue: '1',
      durationUnits: 'minute',
      targetType: 'ally',
      targetCount: '1',
      targetSpecial: 'self or willing creature receiving oak skin',
      rangeUnits: 'ft',
      rangeValue: '30',
      rangeSpecial: '',
      school: 'abj',
      properties: ['vocal', 'somatic', 'material'],
      materials: 'a sliver of oak bark wrapped in green thread',
      identifier: 'lotm-planter-child-of-the-oak',
      activityId: 'planterSeq5OakAct03',
      now: now + 6,
      existing: ability3Existing,
      sort: 1500402
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
