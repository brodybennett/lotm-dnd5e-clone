const { ClassicLevel } = require('./node-tools/node_modules/classic-level');

const CORE_VERSION = '13.351';
const SYSTEM_ID = 'lotm';
const SYSTEM_VERSION = '5.2.6';
const MODIFIER = '0000000000000000';

const PATHWAY_KEY = '!items!lotmPathway00022';
const FOLDER_KEY = '!folders!eiKFQVwZoYCkBNOF';
const PATHWAY_IDENTIFIER = 'lotm-arbiter';

const LEGACY_A_KEY = '!items!lotmAbilityZ4001'; // Imperative Law
const LEGACY_B_KEY = '!items!lotmAbilityZ5001'; // Punishment Mark

const ABILITY_1_KEY = '!items!lotmAbilityZ2001';
const ABILITY_2_KEY = '!items!lotmAbilityZ2002';
const ABILITY_3_KEY = '!items!lotmAbilityZ2003';
const ABILITY_4_KEY = '!items!lotmAbilityZ2004';

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
    folder: 'eiKFQVwZoYCkBNOF',
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
    if (!pathway) throw new Error('Arbiter pathway not found. Sequence 9-3 authoring is required first.');

    pathway.system = pathway.system ?? {};
    pathway.system.description = pathway.system.description ?? { value: '', chat: '' };
    pathway.system.description.value =
      '<p><strong>Pathway Vector:</strong> impartial authority through declared order, high-order lawcraft, chaos-hunting execution, and enforced balance against escalating disorder.</p>' +
      '<p><strong>Sequence 9 Package (Total Budget 2):</strong> Authority Bearing, Preliminary Verdict.</p>' +
      '<p><strong>Sequence 8 Package (Gain Budget +3):</strong> Jurisdiction Field, Recognition Warrant, plus one legacy scope upgrade to Authority Bearing.</p>' +
      '<p><strong>Sequence 7 Package (Gain Budget +13):</strong> Illusory Torture Device, Psychic Lashing, Psychic Piercing, plus two legacy upgrades (Authority Bearing and Jurisdiction Field).</p>' +
      '<p><strong>Sequence 6 Package (Gain Budget +9):</strong> Judicial Exile, Sequestration Order, Cityline Jurisdiction, plus two legacy upgrades (Authority Bearing and Recognition Warrant).</p>' +
      '<p><strong>Sequence 5 Package (Gain Budget +13):</strong> Punishment Mark, Layered Prohibition, Disciplinary Aura, plus two legacy upgrades (Authority Bearing and Psychic Lashing).</p>' +
      '<p><strong>Sequence 4 Package (Gain Budget +33):</strong> Imperative Law, Boundary Edict, Overruling Verdict, Mandate Convergence, plus two legacy upgrades (Authority Bearing and Judicial Exile).</p>' +
      '<p><strong>Sequence 3 Package (Gain Budget +20):</strong> Disorder Pursuit, Sword of Judgment, Metropolitan Partition, Anomaly Quell, plus two legacy upgrades (Punishment Mark and Judicial Exile).</p>' +
      '<p><strong>Sequence 2 Package (Gain Budget +50):</strong> Equilibrium Decree, Counterweight Sentence, Balanced Battlefield, Disorder Census, plus two legacy upgrades (Imperative Law and Punishment Mark).</p>' +
      '<p><strong>Sequence 1-0 Status:</strong> Pending authoring in later sequence-focused runs.</p>' +
      '<p><strong>Continuity Anchor:</strong> At Sequence 2 (Balancer), Arbiter authority moves from tracking and partitioning disorder to actively forcing parity states: rebalancing power spikes, excluding excess force, and restoring lawful equilibrium without emotional sway.</p>';
    pathway._stats = buildStats(now, pathway._stats);
    await pathwaysDb.put(PATHWAY_KEY, JSON.stringify(pathway));

    const folder = await getOptionalJson(abilitiesDb, FOLDER_KEY);
    if (!folder) throw new Error('Arbiter folder not found.');

    folder.name = 'Arbiter';
    folder.description = 'Sequence abilities for the Arbiter pathway (authored through Sequence 2).';
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
    if (!legacyA) throw new Error('Legacy target lotmAbilityZ4001 not found.');
    if (!legacyB) throw new Error('Legacy target lotmAbilityZ5001 not found.');

    const legacyAHeader = '<h3>Legacy Upgrade (Sequence 2 - Scope)</h3>';
    const legacyAText =
      '<p>At Sequence 2, <strong>Imperative Law</strong> gains battlefield-balancing scope. ' +
      'When you establish Imperative Law, designate two legal clauses instead of one, each governing different action categories (movement, offense, supernatural utility, or escape). ' +
      'A creature that violates both clauses in the same round is temporarily excluded from influencing creatures outside its immediate 20-foot zone until the start of its next turn. ' +
      'This exclusion cannot trigger on the same creature more than once per round.</p>';
    const legacyADesc = String(legacyA.system?.description?.value ?? '');
    if (!legacyADesc.includes(legacyAHeader)) {
      legacyA.system.description.value = `${legacyADesc}${legacyAHeader}${legacyAText}`;
    }
    legacyA._stats = buildStats(now + 2, legacyA._stats);
    await abilitiesDb.put(LEGACY_A_KEY, JSON.stringify(legacyA));

    const legacyBHeader = '<h3>Legacy Upgrade (Sequence 2 - Efficiency)</h3>';
    const legacyBText =
      '<p>At Sequence 2, <strong>Punishment Mark</strong> becomes a low-friction balancing sentence. ' +
      'When a marked target first violates one of your active rules each round, you may trigger Punishment backlash as a free rider and shift 10 feet without provoking opportunity attacks. ' +
      'If Punishment Mark was upcast by at least <strong>+2 Spirituality</strong>, the first free rider each round also restores <strong>1 Spirituality</strong> once per scene.</p>';
    const legacyBDesc = String(legacyB.system?.description?.value ?? '');
    if (!legacyBDesc.includes(legacyBHeader)) {
      legacyB.system.description.value = `${legacyBDesc}${legacyBHeader}${legacyBText}`;
    }
    legacyB._stats = buildStats(now + 3, legacyB._stats);
    await abilitiesDb.put(LEGACY_B_KEY, JSON.stringify(legacyB));

    const existing1 = await getOptionalJson(abilitiesDb, ABILITY_1_KEY);
    const existing2 = await getOptionalJson(abilitiesDb, ABILITY_2_KEY);
    const existing3 = await getOptionalJson(abilitiesDb, ABILITY_3_KEY);
    const existing4 = await getOptionalJson(abilitiesDb, ABILITY_4_KEY);

    const ability1 = buildAbilityDoc({
      id: 'lotmAbilityZ2001',
      name: 'Equilibrium Decree',
      description:
        '<p><strong>Baseline (3 Spirituality):</strong> Action. Declare an equilibrium decree over a 120-foot visible battlefield segment for 1 minute (concentration). When one side exceeds the established force threshold (damage burst, stacked summons, layered buffs, or mass control), the excess effect is suppressed by <strong>Potency</strong> and the offending side must pass a Charisma save or lose reactions until the start of its next turn. This declaration is impartial: the same threshold applies to allies and enemies.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Increase decree area by 30 feet radius, or add one explicit threshold clause (e.g., forced movement limit, summon cap, or save-penalty cap).</li><li><strong>+2 Spirituality:</strong> First over-threshold violation each round also inflicts spiritual backlash equal to <strong>Potency</strong> and prevents teleportation until end of turn.</li><li><strong>+4 Spirituality:</strong> Once per round, you may exclude one over-threshold creature from affecting other sectors of the battle for 1 round.</li></ul><p><em>Counterplay:</em> distribute force across multiple rounds, avoid threshold spikes, or force the Arbiter out of concentration.</p><p><em>Corruption Hook:</em> if you set unequal thresholds to protect favored offenders, gain 1 Corruption.</p>',
      img: 'icons/magic/symbols/scales-balance-yellow.webp',
      activationType: 'action',
      durationValue: '1',
      durationUnits: 'minute',
      targetType: 'space',
      targetCount: '1',
      targetSpecial: 'battlefield segment under declared balance',
      rangeUnits: 'ft',
      rangeValue: '120',
      rangeSpecial: '',
      school: 'abj',
      properties: ['vocal', 'somatic', 'material'],
      materials: 'a brass scale plate etched with legal thresholds',
      identifier: 'lotm-arbiter-equilibrium-decree',
      activityId: 'arbiterSeq2Decree01',
      now: now + 4,
      existing: existing1,
      sort: 1800800
    });

    const ability2 = buildAbilityDoc({
      id: 'lotmAbilityZ2002',
      name: 'Counterweight Sentence',
      description:
        '<p><strong>Baseline (2 Spirituality):</strong> Action. Sentence one creature within 120 feet to counterweight terms for 1 minute. Choose either <strong>Reduction Verdict</strong> or <strong>Compensation Verdict</strong>. Reduction Verdict lowers one offensive vector (attacks, spell save DC, or movement burst) by <strong>Potency</strong>. Compensation Verdict raises one deficient defense vector (AC substitute, save, or anti-control check) by <strong>Potency</strong>. A creature cannot benefit from both verdicts at once.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Affect one additional creature within 30 feet of the first using the opposite verdict.</li><li><strong>+2 Spirituality:</strong> Each affected creature immediately rerolls one active imbalance check/save with your verdict applied; new result stands.</li><li><strong>+4 Spirituality:</strong> Once per round, when an affected creature attempts to exceed its verdict limits, you may nullify that attempt and impose <strong>-Potency</strong> on its next roll/check/save.</li></ul><p><em>Counterplay:</em> line-of-effect denial, hard immunity layers, or forcing the Arbiter to spend verdicts on low-value targets.</p><p><em>Corruption Hook:</em> if you issue verdicts to settle personal grudges rather than restore parity, gain 1 Corruption.</p>',
      img: 'icons/magic/control/energy-stream-link-spiral.webp',
      activationType: 'action',
      durationValue: '1',
      durationUnits: 'minute',
      targetType: 'creature',
      targetCount: '1',
      targetSpecial: 'creature under balancing sentence',
      rangeUnits: 'ft',
      rangeValue: '120',
      rangeSpecial: '',
      school: 'enc',
      properties: ['vocal', 'somatic'],
      materials: 'two linked iron rings marked reduction and compensation',
      identifier: 'lotm-arbiter-counterweight-sentence',
      activityId: 'arbiterSeq2Sentence02',
      now: now + 5,
      existing: existing2,
      sort: 1800801
    });

    const ability3 = buildAbilityDoc({
      id: 'lotmAbilityZ2003',
      name: 'Balanced Battlefield',
      description:
        '<p><strong>Baseline (2 Spirituality):</strong> Bonus action. Divide a visible combat space within 180 feet into up to three linked sectors for 1 minute (concentration). Each sector receives a declared force ceiling. If one side exceeds that ceiling inside a sector, its excess participants are displaced to sector edge and cannot cross sectors until the end of their next turn. Creatures in compliant sectors gain <strong>+Potency</strong> against forced movement and panic effects.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Add one sector or increase each sector diameter by 20 feet.</li><li><strong>+2 Spirituality:</strong> Over-cap displacement also strips reactions and concentration checks are made with disadvantage.</li><li><strong>+4 Spirituality:</strong> Once per round, you may seal one sector for 1 round so outside interference, including remote abilities, cannot affect it unless cast by you.</li></ul><p><em>Counterplay:</em> attrition from within sectors, concentration breaks, and pre-positioning before division.</p><p><em>Corruption Hook:</em> if you isolate civilians with hostiles for tactical convenience, gain 1 Corruption.</p>',
      img: 'icons/magic/symbols/ring-circle-smoke-blue.webp',
      activationType: 'bonus',
      durationValue: '1',
      durationUnits: 'minute',
      targetType: 'space',
      targetCount: '1',
      targetSpecial: 'multi-sector battlefield partition',
      rangeUnits: 'ft',
      rangeValue: '180',
      rangeSpecial: '',
      school: 'abj',
      properties: ['vocal', 'somatic', 'material'],
      materials: 'a tri-part brass map with movable boundary pins',
      identifier: 'lotm-arbiter-balanced-battlefield',
      activityId: 'arbiterSeq2Battle03',
      now: now + 6,
      existing: existing3,
      sort: 1800802
    });

    const ability4 = buildAbilityDoc({
      id: 'lotmAbilityZ2004',
      name: 'Disorder Census',
      description:
        '<p><strong>Baseline (1 Spirituality):</strong> Reaction or bonus action. Conduct an immediate census of disorder within 300 feet for 1 minute. You detect concealed entities, ongoing anomaly nodes, and active imbalance sources, and classify each as minor, major, or critical. Once per round, when a detected source escalates category, you may issue a short declaration that imposes <strong>-Potency</strong> to its next relevant roll/check/save.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Extend census radius to 600 feet or include one enclosed structure within range.</li><li><strong>+2 Spirituality:</strong> You may share census results with up to <strong>Potency</strong> allies, granting them advantage on one check/save against detected disorder before end of next turn.</li><li><strong>+4 Spirituality:</strong> Once per scene, immediately downgrade one detected major disorder to minor for 1 round, or force a critical source to pause one signature action for 1 turn (save allowed).</li></ul><p><em>Counterplay:</em> false signatures, layered concealment, and rapid disorder cycling can dilute census value.</p><p><em>Corruption Hook:</em> if you suppress census findings to shield politically favored offenders, gain 1 Corruption.</p>',
      img: 'icons/magic/perception/eye-ringed-glow-angry-small-teal.webp',
      activationType: 'reaction',
      durationValue: '1',
      durationUnits: 'minute',
      targetType: 'space',
      targetCount: '1',
      targetSpecial: 'regional disorder profile',
      rangeUnits: 'ft',
      rangeValue: '300',
      rangeSpecial: '',
      school: 'div',
      properties: ['vocal'],
      materials: 'a census register page stamped with a judicial seal',
      identifier: 'lotm-arbiter-disorder-census',
      activityId: 'arbiterSeq2Census04',
      now: now + 7,
      existing: existing4,
      sort: 1800803
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

    console.log(JSON.stringify({
      pathwayWritten: PATHWAY_KEY,
      folderWritten: FOLDER_KEY,
      legacyUpdated: [LEGACY_A_KEY, LEGACY_B_KEY],
      abilitiesWritten: [ABILITY_1_KEY, ABILITY_2_KEY, ABILITY_3_KEY, ABILITY_4_KEY],
      readBack: {
        pathway: {
          id: verifyPathway?._id,
          identifier: verifyPathway?.system?.identifier
        },
        folder: {
          id: verifyFolder?._id,
          latestAuthoredSequence: verifyFolder?.flags?.lotm?.latestAuthoredSequence
        },
        legacyA: {
          id: verifyLegacyA?._id,
          hasHeader: String(verifyLegacyA?.system?.description?.value ?? '').includes(legacyAHeader),
          grantedSequence: verifyLegacyA?.flags?.lotm?.grantedSequence,
          level: verifyLegacyA?.system?.level
        },
        legacyB: {
          id: verifyLegacyB?._id,
          hasHeader: String(verifyLegacyB?.system?.description?.value ?? '').includes(legacyBHeader),
          grantedSequence: verifyLegacyB?.flags?.lotm?.grantedSequence,
          level: verifyLegacyB?.system?.level
        },
        sequenceAbilities: [verifyAbility1, verifyAbility2, verifyAbility3, verifyAbility4].map((doc) => ({
          id: doc?._id,
          name: doc?.name,
          sourceClass: doc?.system?.sourceClass,
          grantedSequence: doc?.flags?.lotm?.grantedSequence,
          level: doc?.system?.level,
          folder: doc?.folder
        }))
      }
    }, null, 2));
  } finally {
    await pathwaysDb.close();
    await abilitiesDb.close();
  }
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
