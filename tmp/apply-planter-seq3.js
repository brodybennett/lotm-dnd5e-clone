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
const LEGACY_B_KEY = '!items!lotmAbilityF5003';

const ABILITY_1_KEY = '!items!lotmAbilityF3001';
const ABILITY_2_KEY = '!items!lotmAbilityF3002';
const ABILITY_3_KEY = '!items!lotmAbilityF3003';
const ABILITY_4_KEY = '!items!lotmAbilityF3004';

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
      level: 6,
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
        grantedSequence: 3
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
      '<p><strong>Sequence 2-0 Status:</strong> Pending authoring in later sequence-focused runs.</p>' +
      '<p><strong>Continuity Anchor:</strong> At Sequence 3 (Pallbearer), Ancient Alchemist authority extends into cycle-of-life sovereignty: shaping spirits, draining vitality from hostile forces, returning unstable beings to earth, and protecting allies through grave-calm maternal shelter.</p>';
    pathway._stats = buildStats(now, pathway._stats);
    await pathwaysDb.put(PATHWAY_KEY, JSON.stringify(pathway));

    const folder = await getOptionalJson(abilitiesDb, FOLDER_KEY);
    if (!folder) throw new Error('Planter folder (ukRXXDOSR2TXowMz) not found.');

    folder.name = 'Planter';
    folder.description = 'Sequence abilities for the Planter pathway (authored through Sequence 3).';
    folder.flags = folder.flags ?? {};
    folder.flags.lotm = {
      ...(folder.flags.lotm ?? {}),
      pathwayIdentifier: PATHWAY_IDENTIFIER,
      latestAuthoredSequence: 3
    };
    folder._stats = buildStats(now + 1, folder._stats);
    await abilitiesDb.put(FOLDER_KEY, JSON.stringify(folder));

    const legacyA = await getOptionalJson(abilitiesDb, LEGACY_A_KEY);
    const legacyB = await getOptionalJson(abilitiesDb, LEGACY_B_KEY);
    if (!legacyA) throw new Error('Legacy target lotmAbilityF6001 not found.');
    if (!legacyB) throw new Error('Legacy target lotmAbilityF5003 not found.');

    const legacyAHeader = '<h3>Legacy Upgrade (Sequence 3 - Potency)</h3>';
    const legacyAText =
      '<p>At Sequence 3, Cross-breeding can carry predatory life pressure. ' +
      'When a hostile creature first enters or starts its turn in a Cross-breeding hybrid field, it takes vitality damage equal to <strong>Potency</strong> and has disadvantage on its next save against your Mutation or Life Deprivation before the end of your next turn. ' +
      'If Cross-breeding was cast with +4 Spirituality, this potency rider can apply to up to two hostile creatures per round.</p>';
    const legacyADesc = String(legacyA.system?.description?.value ?? '');
    if (!legacyADesc.includes(legacyAHeader)) {
      legacyA.system.description.value = `${legacyADesc}${legacyAHeader}${legacyAText}`;
    }
    legacyA._stats = buildStats(now + 2, legacyA._stats);
    await abilitiesDb.put(LEGACY_A_KEY, JSON.stringify(legacyA));

    const legacyBHeader = '<h3>Legacy Upgrade (Sequence 3 - Efficiency)</h3>';
    const legacyBText =
      '<p>At Sequence 3, Child of the Oak can answer harm as an instinctive maternal reflex. ' +
      'Once per round, when a creature protected by Child of the Oak would take damage, you may trigger its baseline protection as a <strong>reaction</strong> without recasting. ' +
      'When this reflex trigger occurs, the first upcast surcharge of your next Child of the Oak cast this turn is reduced by 1 (minimum 0). Once per short rest, this reflex trigger is free even if your reaction was spent.</p>';
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
      id: 'lotmAbilityF3001',
      name: 'Evil Spirit Transformation',
      description:
        '<p><strong>Baseline (2 Spirituality):</strong> Action. Transform one fresh corpse or unstable spirit remnant within 60 feet into a bound evil spirit for 10 minutes. The spirit acts on your initiative, moves up to 30 feet flying, and can make one spectral strike each round (attack/check resolved with your Potency; on hit: <strong>Potency</strong> necrotic damage).</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> create one additional lesser spirit or extend duration to 1 hour.</li><li><strong>+2 Spirituality:</strong> each spirit&#39;s first hit per round forces a Constitution save; on failure, target loses reactions until start of its next turn.</li><li><strong>+4 Spirituality:</strong> in a 15-foot zone around one corpse/remnant, raise up to <strong>Potency</strong> lesser spirits for 1 minute; lesser spirits cannot leave the zone but impose difficult terrain and haunting pressure on enemies inside.</li></ul><p><em>Counterplay:</em> radiant purification, corpse destruction, and anti-necromancy wards disrupt or prevent spirit conversion.</p><p><em>Corruption Hook:</em> if you force unwilling souls into torment for convenience, gain 1 Corruption.</p>',
      img: 'icons/magic/death/undead-ghost-scream-teal.webp',
      activationType: 'action',
      durationValue: '10',
      durationUnits: 'minute',
      targetType: 'object',
      targetCount: '1',
      targetSpecial: 'fresh corpse or unstable spirit remnant',
      rangeUnits: 'ft',
      rangeValue: '60',
      rangeSpecial: '',
      school: 'nec',
      properties: ['vocal', 'somatic', 'material'],
      materials: 'grave soil mixed with a drop of purified resin',
      identifier: 'lotm-planter-evil-spirit-transformation',
      activityId: 'planterSeq3EviAct01',
      now: now + 4,
      existing: ability1Existing,
      sort: 1500600
    });

    const ability2 = buildAbilityDoc({
      id: 'lotmAbilityF3002',
      name: 'Life Deprivation',
      description:
        '<p><strong>Baseline (1 Spirituality):</strong> Action. Target one creature within 60 feet. It makes a Constitution save. On failure, it takes <strong>Potency</strong> necrotic damage and cannot regain HP until the start of your next turn. You may restore HP equal to half Potency (minimum 1) to yourself or one ally within 30 feet.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> affect one additional target in range with separate saves.</li><li><strong>+2 Spirituality:</strong> failed targets take <strong>2 x Potency</strong> necrotic damage and suffer -Potency on their next save against poison/disease/exhaustion effects before end of next turn.</li><li><strong>+4 Spirituality:</strong> create a 15-foot deprivation zone for 1 minute at the target point; first time each hostile starts its turn there, it takes Potency necrotic damage and cannot regain HP until end of turn.</li></ul><p><em>Counterplay:</em> necrotic resistance, purification rites, and distance/line-of-sight breaks reduce effectiveness.</p><p><em>Corruption Hook:</em> if you drain life from non-hostile creatures to fuel trivial aims, gain 1 Corruption.</p>',
      img: 'icons/magic/death/hand-withered-gray.webp',
      activationType: 'action',
      durationValue: '',
      durationUnits: 'inst',
      targetType: 'creature',
      targetCount: '1',
      targetSpecial: 'living or undead creature subject to deprivation',
      rangeUnits: 'ft',
      rangeValue: '60',
      rangeSpecial: '',
      school: 'nec',
      properties: ['vocal', 'somatic'],
      materials: '',
      identifier: 'lotm-planter-life-deprivation',
      activityId: 'planterSeq3LifAct02',
      now: now + 5,
      existing: ability2Existing,
      sort: 1500601
    });

    const ability3 = buildAbilityDoc({
      id: 'lotmAbilityF3003',
      name: 'Return to Earth',
      description:
        '<p><strong>Baseline (1 Spirituality):</strong> Action. Target one undead, spirit, chimera, or biologically unstable creature within 60 feet. It makes a Wisdom save. On failure, earthen bindings seize it: speed becomes 0, it is restrained until end of your next turn, and it cannot take reactions.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> affect one additional valid target within 20 feet of the first.</li><li><strong>+2 Spirituality:</strong> duration becomes 1 minute (save ends at end of each target turn), and bound targets have disadvantage on attacks against living allies.</li><li><strong>+4 Spirituality:</strong> apply in a 20-foot radius zone; failed targets are forced into earth-stasis until end of their next turn and cannot be willingly moved by allies.</li></ul><p><em>Counterplay:</em> flight, phase movement, anti-binding effects, and strong spiritual dominance can break restraints early.</p><p><em>Corruption Hook:</em> if you bury sentient targets alive as punishment beyond combat necessity, gain 1 Corruption.</p>',
      img: 'icons/environment/wilderness/roots-wrangle.webp',
      activationType: 'action',
      durationValue: '',
      durationUnits: 'inst',
      targetType: 'creature',
      targetCount: '1',
      targetSpecial: 'undead, spirit, chimera, or unstable biological target',
      rangeUnits: 'ft',
      rangeValue: '60',
      rangeSpecial: '',
      school: 'abj',
      properties: ['vocal', 'somatic', 'material'],
      materials: 'a braided root cord stained with clay',
      identifier: 'lotm-planter-return-to-earth',
      activityId: 'planterSeq3RetAct03',
      now: now + 6,
      existing: ability3Existing,
      sort: 1500602
    });

    const ability4 = buildAbilityDoc({
      id: 'lotmAbilityF3004',
      name: 'Maternal Embrace',
      description:
        '<p><strong>Baseline (0 Spirituality):</strong> Bonus action. Wrap yourself or one willing creature within 30 feet in a grave-calm cocoon for 1 minute. The target gains temporary HP equal to <strong>Potency</strong>, advantage on saves against fear/charm/corruption pressure, and may ignore one forced movement effect each round.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> affect one additional willing creature.</li><li><strong>+2 Spirituality:</strong> once per round when an embraced target takes damage, reduce that damage by <strong>Potency</strong> as a reaction.</li><li><strong>+4 Spirituality:</strong> if an embraced target would drop to 0 HP, it drops to 1 HP instead, and nearby allies in 10 feet regain HP equal to Potency (once per target per cast).</li></ul><p><em>Counterplay:</em> anti-healing suppression, curse-brand effects, and sustained burst damage can outpace the cocoon.</p><p><em>Corruption Hook:</em> if you reserve embrace only for favored elites while abandoning those under your care, gain 1 Corruption.</p>',
      img: 'icons/magic/life/heart-cross-strong-purple-orange.webp',
      activationType: 'bonus',
      durationValue: '1',
      durationUnits: 'minute',
      targetType: 'ally',
      targetCount: '1',
      targetSpecial: 'self or willing ally under protective cocoon',
      rangeUnits: 'ft',
      rangeValue: '30',
      rangeSpecial: '',
      school: 'abj',
      properties: ['vocal', 'somatic', 'material'],
      materials: 'a ribbon of burial cloth tied with a green knot',
      identifier: 'lotm-planter-maternal-embrace',
      activityId: 'planterSeq3MatAct04',
      now: now + 7,
      existing: ability4Existing,
      sort: 1500603
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
