const { ClassicLevel } = require('./node-tools/node_modules/classic-level');

const CORE_VERSION = '13.351';
const SYSTEM_ID = 'lotm';
const SYSTEM_VERSION = '5.2.6';
const MODIFIER = '0000000000000000';

const PATHWAY_KEY = '!items!lotmPathway00022';
const FOLDER_KEY = '!folders!eiKFQVwZoYCkBNOF';
const PATHWAY_IDENTIFIER = 'lotm-arbiter';

const LEGACY_A_KEY = '!items!lotmAbilityZ1001'; // Order Proxy
const LEGACY_B_KEY = '!items!lotmAbilityZ3001'; // Disorder Pursuit

const ABILITY_1_KEY = '!items!lotmAbilityZ0001';
const ABILITY_2_KEY = '!items!lotmAbilityZ0002';
const ABILITY_3_KEY = '!items!lotmAbilityZ0003';
const ABILITY_4_KEY = '!items!lotmAbilityZ0004';

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
    if (!pathway) throw new Error('Arbiter pathway not found. Sequence 9-1 authoring is required first.');

    pathway.system = pathway.system ?? {};
    pathway.system.description = pathway.system.description ?? { value: '', chat: '' };
    pathway.system.description.value =
      '<p><strong>Pathway Vector:</strong> impartial authority through declared order, high-order lawcraft, chaos-hunting execution, forced equilibrium, lawful proxy governance, and final adjudication over underlying rule interactions.</p>' +
      '<p><strong>Sequence 9 Package (Total Budget 2):</strong> Authority Bearing, Preliminary Verdict.</p>' +
      '<p><strong>Sequence 8 Package (Gain Budget +3):</strong> Jurisdiction Field, Recognition Warrant, plus one legacy scope upgrade to Authority Bearing.</p>' +
      '<p><strong>Sequence 7 Package (Gain Budget +13):</strong> Illusory Torture Device, Psychic Lashing, Psychic Piercing, plus two legacy upgrades (Authority Bearing and Jurisdiction Field).</p>' +
      '<p><strong>Sequence 6 Package (Gain Budget +9):</strong> Judicial Exile, Sequestration Order, Cityline Jurisdiction, plus two legacy upgrades (Authority Bearing and Recognition Warrant).</p>' +
      '<p><strong>Sequence 5 Package (Gain Budget +13):</strong> Punishment Mark, Layered Prohibition, Disciplinary Aura, plus two legacy upgrades (Authority Bearing and Psychic Lashing).</p>' +
      '<p><strong>Sequence 4 Package (Gain Budget +33):</strong> Imperative Law, Boundary Edict, Overruling Verdict, Mandate Convergence, plus two legacy upgrades (Authority Bearing and Judicial Exile).</p>' +
      '<p><strong>Sequence 3 Package (Gain Budget +20):</strong> Disorder Pursuit, Sword of Judgment, Metropolitan Partition, Anomaly Quell, plus two legacy upgrades (Punishment Mark and Judicial Exile).</p>' +
      '<p><strong>Sequence 2 Package (Gain Budget +50):</strong> Equilibrium Decree, Counterweight Sentence, Balanced Battlefield, Disorder Census, plus two legacy upgrades (Imperative Law and Punishment Mark).</p>' +
      '<p><strong>Sequence 1 Package (Gain Budget +74):</strong> Order Proxy, Statute Reformation, Remote Judgment, Anomaly Arbitration, plus two legacy upgrades (Disorder Pursuit and Equilibrium Decree).</p>' +
      '<p><strong>Sequence 0 Package (Gain Budget +114):</strong> Underlying Edict, World Verdict, Disorder Arbitration, Abstract Equilibrium, plus two legacy upgrades (Order Proxy and Disorder Pursuit).</p>' +
      '<p><strong>Continuity Anchor:</strong> At Sequence 0 (Justiciar), Arbiter authority advances from proxy rule governance into world-grade adjudication. Judgments can be issued with broad lawful backing, disorder can be restored/quelled/extinguished as needed, and abstract balances can be forcefully stabilized for limited windows.</p>';
    pathway._stats = buildStats(now, pathway._stats);
    await pathwaysDb.put(PATHWAY_KEY, JSON.stringify(pathway));

    const folder = await getOptionalJson(abilitiesDb, FOLDER_KEY);
    if (!folder) throw new Error('Arbiter folder not found.');

    folder.name = 'Arbiter';
    folder.description = 'Sequence abilities for the Arbiter pathway (authored through Sequence 0).';
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
    if (!legacyA) throw new Error('Legacy target lotmAbilityZ1001 not found.');
    if (!legacyB) throw new Error('Legacy target lotmAbilityZ3001 not found.');

    const legacyAHeader = '<h3>Legacy Upgrade (Sequence 0 - Potency)</h3>';
    const legacyAText =
      '<p>At Sequence 0, <strong>Order Proxy</strong> receives final enforcement weight. ' +
      'Each round, designate one major violation against your proxy clauses. ' +
      'On failed save, the violating portion of that action is fully nullified and the violator suffers additional backlash equal to <strong>Potency</strong> plus a <strong>-Potency</strong> penalty on its next roll/check/save before the end of its next turn. ' +
      'This major violation rider can affect only one creature per round.</p>';
    const legacyADesc = String(legacyA.system?.description?.value ?? '');
    if (!legacyADesc.includes(legacyAHeader)) {
      legacyA.system.description.value = `${legacyADesc}${legacyAHeader}${legacyAText}`;
    }
    legacyA._stats = buildStats(now + 2, legacyA._stats);
    await abilitiesDb.put(LEGACY_A_KEY, JSON.stringify(legacyA));

    const legacyBHeader = '<h3>Legacy Upgrade (Sequence 0 - Scope)</h3>';
    const legacyBText =
      '<p>At Sequence 0, <strong>Disorder Pursuit</strong> scales to network pursuit. ' +
      'When you mark one disorder source, you may also bind up to <strong>Potency</strong> linked violations within range. ' +
      'You can track all bound targets simultaneously and once per round shift your sentence pressure to any one of them without spending action economy. ' +
      'If Disorder Pursuit is upcast by at least <strong>+4 Spirituality</strong>, one bound target that triggers violation backlash also loses reactions until the start of its next turn.</p>';
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
      id: 'lotmAbilityZ0001',
      name: 'Underlying Edict',
      description:
        '<p><strong>Baseline (6 Spirituality):</strong> Action. Pronounce one world-facing edict over a battlefield, city district, or equivalent jurisdictional scene for 1 minute (concentration). Choose one foundational interaction clause (movement vectors, summoning throughput, concealment reliability, teleport expression, or forced-effect transfer). Any creature that violates the clause makes a Charisma save; on failure, the violating portion is suppressed and it takes spiritual backlash equal to <strong>Potency</strong>. The edict is impartial and binds allies and enemies equally.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+2 Spirituality:</strong> Add one additional foundational clause or extend jurisdiction category by one step.</li><li><strong>+5 Spirituality:</strong> Temporarily rewrite one active hostile non-underlying rule within the edict zone so it follows your clause logic until the end of your next turn.</li><li><strong>+10 Spirituality:</strong> Once per round, mark one major breach; if it fails the save, the breach is fully nullified and the target cannot receive external buffs until the start of its next turn.</li></ul><p><em>Counterplay:</em> lawful low-intensity sequencing, concentration disruption, and compliance-first tactics reduce breach punishments.</p><p><em>Corruption Hook:</em> if you engineer clauses to privilege a faction instead of impartial order, gain 1 Corruption.</p>',
      img: 'icons/magic/symbols/runes-star-pentagon-orange.webp',
      activationType: 'action',
      durationValue: '1',
      durationUnits: 'minute',
      targetType: 'space',
      targetCount: '1',
      targetSpecial: 'jurisdiction-scale edict field',
      rangeUnits: 'ft',
      rangeValue: '600',
      rangeSpecial: 'city-scale in narrative jurisdiction',
      school: 'abj',
      properties: ['vocal', 'somatic', 'material'],
      materials: 'a black-gold decree tablet inscribed with mutable law lines',
      identifier: 'lotm-arbiter-underlying-edict',
      activityId: 'arbiterSeq0Edict01',
      now: now + 4,
      existing: existing1,
      sort: 1801000
    });

    const ability2 = buildAbilityDoc({
      id: 'lotmAbilityZ0002',
      name: 'World Verdict',
      description:
        '<p><strong>Baseline (5 Spirituality):</strong> Bonus action or action. Render a formal verdict on one confirmed violator within 1,200 feet or anywhere in your declared jurisdiction if tracked by Arbiter effects. The target makes a Wisdom save. On failure, it gains a world-backed sentence mark for 1 minute: once per round when it violates an active law/verdict/edict, it suffers unavoidable backlash equal to <strong>Potency</strong> and one rider of your choice (reaction lock, speed suppression, or save penalty) until start of its next turn.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+2 Spirituality:</strong> Affect one additional valid violator, or apply two minor riders to the primary target on failed save.</li><li><strong>+5 Spirituality:</strong> First failed violation each round also bypasses mundane cover and common terrain-based mitigation.</li><li><strong>+10 Spirituality:</strong> Once per scene, elevate one failed target to severe sentence: it cannot benefit from ally-granted bonuses and cannot teleport until the end of its next turn.</li></ul><p><em>Counterplay:</em> break tracking certainty, maintain strict compliance, or force ambiguous causality to contest violator attribution.</p><p><em>Corruption Hook:</em> if you issue verdict without sufficient evidence, gain 1 Corruption.</p>',
      img: 'icons/skills/melee/strike-weapons-orange.webp',
      activationType: 'bonus',
      durationValue: '1',
      durationUnits: 'minute',
      targetType: 'creature',
      targetCount: '1',
      targetSpecial: 'confirmed law violator',
      rangeUnits: 'ft',
      rangeValue: '1200',
      rangeSpecial: 'jurisdiction-wide with valid tracking chain',
      school: 'enc',
      properties: ['vocal', 'somatic'],
      materials: 'a brass verdict ring engraved with sentence sigils',
      identifier: 'lotm-arbiter-world-verdict',
      activityId: 'arbiterSeq0Verdict02',
      now: now + 5,
      existing: existing2,
      sort: 1801001
    });

    const ability3 = buildAbilityDoc({
      id: 'lotmAbilityZ0003',
      name: 'Disorder Arbitration',
      description:
        '<p><strong>Baseline (4 Spirituality):</strong> Reaction when major anomaly, riotous mystical surge, or unstable law conflict emerges within 600 feet. Choose one declaration mode: <strong>Restore</strong>, <strong>Quell</strong>, or <strong>Extinguish</strong>. Restore converts one chaotic interaction into controlled order for 1 round; Quell suppresses the next pulse and reduces current output by <strong>Potency</strong>; Extinguish forces a Charisma save from the source and on failure ends one non-underlying disorder effect. You remain in independent arbitration position for adjudicating this event.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+2 Spirituality:</strong> Affect one additional linked anomaly node or extend control one extra round.</li><li><strong>+5 Spirituality:</strong> Redirect residual force into a temporary legal clause under your control; choose one creature immune and one bound target.</li><li><strong>+10 Spirituality:</strong> Once per scene, impose an extinction verdict on one qualifying disorder complex for 1 round so it cannot generate new pulses in your jurisdiction.</li></ul><p><em>Counterplay:</em> multi-source anomaly stacking, anti-arbitration immunity, or simultaneous event overload can pressure arbitration limits.</p><p><em>Corruption Hook:</em> if you arbitrate disasters for political optics instead of public safety, gain 1 Corruption.</p>',
      img: 'icons/magic/control/debuff-energy-hold-teal-yellow.webp',
      activationType: 'reaction',
      durationValue: '',
      durationUnits: 'inst',
      targetType: 'space',
      targetCount: '1',
      targetSpecial: 'major disorder event or anomaly complex',
      rangeUnits: 'ft',
      rangeValue: '600',
      rangeSpecial: '',
      school: 'abj',
      properties: ['vocal'],
      materials: 'a tri-seal arbitration rod marked restore/quell/extinguish',
      identifier: 'lotm-arbiter-disorder-arbitration',
      activityId: 'arbiterSeq0Arbit03',
      now: now + 6,
      existing: existing3,
      sort: 1801002
    });

    const ability4 = buildAbilityDoc({
      id: 'lotmAbilityZ0004',
      name: 'Abstract Equilibrium',
      description:
        '<p><strong>Baseline (5 Spirituality):</strong> Action. Declare a binding equivalency between two abstract states in a 300-foot area or among up to <strong>Potency</strong> creatures for up to 3 minutes (concentration). Choose one axis pair: reason/madness, offense/defense, concealment/revelation, or expansion/restraint. During the effect, whichever side rises beyond the declared midpoint is reduced toward parity by <strong>Potency</strong>, and the opposite side is stabilized. This declaration applies impartially.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+2 Spirituality:</strong> Add one additional axis pair, or double the number of affected creatures.</li><li><strong>+5 Spirituality:</strong> First over-midpoint surge each round triggers a forced rebalance pulse that imposes <strong>-Potency</strong> on the next relevant roll/check/save.</li><li><strong>+10 Spirituality:</strong> Once per scene, lock one declared axis at equilibrium for 1 round; external effects cannot shift that axis unless they pass a hard save/check.</li></ul><p><em>Counterplay:</em> rotating pressure across unselected axes, threshold baiting, and concentrated anti-balance effects can weaken forced parity.</p><p><em>Corruption Hook:</em> if you force equilibrium to erase rightful agency or silence lawful dissent, gain 1 Corruption.</p>',
      img: 'icons/magic/symbols/scales-balance-blue.webp',
      activationType: 'action',
      durationValue: '3',
      durationUnits: 'minute',
      targetType: 'space',
      targetCount: '1',
      targetSpecial: 'abstract axis pair under forced equilibrium',
      rangeUnits: 'ft',
      rangeValue: '300',
      rangeSpecial: '',
      school: 'div',
      properties: ['vocal', 'somatic', 'material'],
      materials: 'a mirrored balance plate split into opposed symbols',
      identifier: 'lotm-arbiter-abstract-equilibrium',
      activityId: 'arbiterSeq0Equi04',
      now: now + 7,
      existing: existing4,
      sort: 1801003
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
