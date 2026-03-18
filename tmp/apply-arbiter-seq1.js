const { ClassicLevel } = require('./node-tools/node_modules/classic-level');

const CORE_VERSION = '13.351';
const SYSTEM_ID = 'lotm';
const SYSTEM_VERSION = '5.2.6';
const MODIFIER = '0000000000000000';

const PATHWAY_KEY = '!items!lotmPathway00022';
const FOLDER_KEY = '!folders!eiKFQVwZoYCkBNOF';
const PATHWAY_IDENTIFIER = 'lotm-arbiter';

const LEGACY_A_KEY = '!items!lotmAbilityZ3001'; // Disorder Pursuit
const LEGACY_B_KEY = '!items!lotmAbilityZ2001'; // Equilibrium Decree

const ABILITY_1_KEY = '!items!lotmAbilityZ1001';
const ABILITY_2_KEY = '!items!lotmAbilityZ1002';
const ABILITY_3_KEY = '!items!lotmAbilityZ1003';
const ABILITY_4_KEY = '!items!lotmAbilityZ1004';

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
    if (!pathway) throw new Error('Arbiter pathway not found. Sequence 9-2 authoring is required first.');

    pathway.system = pathway.system ?? {};
    pathway.system.description = pathway.system.description ?? { value: '', chat: '' };
    pathway.system.description.value =
      '<p><strong>Pathway Vector:</strong> impartial authority through declared order, high-order lawcraft, chaos-hunting execution, forced equilibrium, and lawful proxy governance over battlefield-scale order.</p>' +
      '<p><strong>Sequence 9 Package (Total Budget 2):</strong> Authority Bearing, Preliminary Verdict.</p>' +
      '<p><strong>Sequence 8 Package (Gain Budget +3):</strong> Jurisdiction Field, Recognition Warrant, plus one legacy scope upgrade to Authority Bearing.</p>' +
      '<p><strong>Sequence 7 Package (Gain Budget +13):</strong> Illusory Torture Device, Psychic Lashing, Psychic Piercing, plus two legacy upgrades (Authority Bearing and Jurisdiction Field).</p>' +
      '<p><strong>Sequence 6 Package (Gain Budget +9):</strong> Judicial Exile, Sequestration Order, Cityline Jurisdiction, plus two legacy upgrades (Authority Bearing and Recognition Warrant).</p>' +
      '<p><strong>Sequence 5 Package (Gain Budget +13):</strong> Punishment Mark, Layered Prohibition, Disciplinary Aura, plus two legacy upgrades (Authority Bearing and Psychic Lashing).</p>' +
      '<p><strong>Sequence 4 Package (Gain Budget +33):</strong> Imperative Law, Boundary Edict, Overruling Verdict, Mandate Convergence, plus two legacy upgrades (Authority Bearing and Judicial Exile).</p>' +
      '<p><strong>Sequence 3 Package (Gain Budget +20):</strong> Disorder Pursuit, Sword of Judgment, Metropolitan Partition, Anomaly Quell, plus two legacy upgrades (Punishment Mark and Judicial Exile).</p>' +
      '<p><strong>Sequence 2 Package (Gain Budget +50):</strong> Equilibrium Decree, Counterweight Sentence, Balanced Battlefield, Disorder Census, plus two legacy upgrades (Imperative Law and Punishment Mark).</p>' +
      '<p><strong>Sequence 1 Package (Gain Budget +74):</strong> Order Proxy, Statute Reformation, Remote Judgment, Anomaly Arbitration, plus two legacy upgrades (Disorder Pursuit and Equilibrium Decree).</p>' +
      '<p><strong>Sequence 0 Status:</strong> Pending authoring in a later sequence-focused run.</p>' +
      '<p><strong>Continuity Anchor:</strong> At Sequence 1 (Hand of Order), Arbiter authority becomes proxy governance: it can establish broader order architecture, revise active rule states, and render remote sentence enforcement while preserving lawful neutrality.</p>';
    pathway._stats = buildStats(now, pathway._stats);
    await pathwaysDb.put(PATHWAY_KEY, JSON.stringify(pathway));

    const folder = await getOptionalJson(abilitiesDb, FOLDER_KEY);
    if (!folder) throw new Error('Arbiter folder not found.');

    folder.name = 'Arbiter';
    folder.description = 'Sequence abilities for the Arbiter pathway (authored through Sequence 1).';
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
    if (!legacyA) throw new Error('Legacy target lotmAbilityZ3001 not found.');
    if (!legacyB) throw new Error('Legacy target lotmAbilityZ2001 not found.');

    const legacyAHeader = '<h3>Legacy Upgrade (Sequence 1 - Efficiency)</h3>';
    const legacyAText =
      '<p>At Sequence 1, <strong>Disorder Pursuit</strong> becomes a standing order-tracking process. ' +
      'You may establish one pursuit mark at scene start without spending action economy. ' +
      'Once per round, if a marked target violates any active Arbiter law, decree, or verdict, you can immediately reassign your pursuit movement and tracking rider to another visible disorder source within range while preserving the original mark. ' +
      'If the ability was upcast by at least <strong>+2 Spirituality</strong>, this reassignment also grants 1 use of reaction denial against the new target until start of your next turn.</p>';
    const legacyADesc = String(legacyA.system?.description?.value ?? '');
    if (!legacyADesc.includes(legacyAHeader)) {
      legacyA.system.description.value = `${legacyADesc}${legacyAHeader}${legacyAText}`;
    }
    legacyA._stats = buildStats(now + 2, legacyA._stats);
    await abilitiesDb.put(LEGACY_A_KEY, JSON.stringify(legacyA));

    const legacyBHeader = '<h3>Legacy Upgrade (Sequence 1 - Potency)</h3>';
    const legacyBText =
      '<p>At Sequence 1, <strong>Equilibrium Decree</strong> gains stronger enforcement weight. ' +
      'Over-threshold actions now trigger an additional balancing check: on failure, the excess portion is negated and the acting creature suffers <strong>-Potency</strong> to offensive and mobility rolls/checks/saves until the end of its next turn. ' +
      'Once per round, you may designate one over-threshold event as a major violation, doubling the suppression applied by Equilibrium Decree for that event.</p>';
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
      id: 'lotmAbilityZ1001',
      name: 'Order Proxy',
      description:
        '<p><strong>Baseline (4 Spirituality):</strong> Action. Establish yourself as proxy authority over a battlefield, district block, or equivalent scene area for 1 minute (concentration). Declare up to three operational rules (movement cap, summon cap, save-penalty cap, concealment cap, or teleportation cap). Any creature violating a declared rule must make a Charisma save or have the violating portion of the action voided and suffer spiritual backlash equal to <strong>Potency</strong>. This power is impartial and applies to all sides.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+2 Spirituality:</strong> Add one additional operational rule or extend authority area by one category (street -> block, block -> district segment).</li><li><strong>+4 Spirituality:</strong> First two failed violations each round also lose reactions and cannot benefit from external forced movement until start of next turn.</li><li><strong>+8 Spirituality:</strong> Once per round, temporarily suspend one active hostile environmental rule or mass effect for 1 round, replacing it with your declared proxy clause.</li></ul><p><em>Counterplay:</em> distributed low-intensity action economy, concentration pressure, and lawful-compliance tactics reduce proxy lock potential.</p><p><em>Corruption Hook:</em> if you weaponize proxy clauses to exempt allies from law while over-punishing enemies, gain 1 Corruption.</p>',
      img: 'icons/sundries/documents/document-sealed-signatures-red.webp',
      activationType: 'action',
      durationValue: '1',
      durationUnits: 'minute',
      targetType: 'space',
      targetCount: '1',
      targetSpecial: 'battlefield or district segment under proxy order',
      rangeUnits: 'ft',
      rangeValue: '300',
      rangeSpecial: 'jurisdiction-scale in narrative scenes',
      school: 'abj',
      properties: ['vocal', 'somatic', 'material'],
      materials: 'a signed proxy writ stamped in brass wax',
      identifier: 'lotm-arbiter-order-proxy',
      activityId: 'arbiterSeq1Proxy01',
      now: now + 4,
      existing: existing1,
      sort: 1800900
    });

    const ability2 = buildAbilityDoc({
      id: 'lotmAbilityZ1002',
      name: 'Statute Reformation',
      description:
        '<p><strong>Baseline (3 Spirituality):</strong> Action. Amend one active non-underlying rule effect within 240 feet for 1 minute: tighten, loosen, or invert one operational clause (such as movement restriction, concealment rule, summon throughput, or action tax). If the original effect belongs to a stronger source, the source makes a contested check/save; on success by source, amendment becomes partial (half effect).</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Extend duration by 1 minute or affect one additional linked clause of the same effect.</li><li><strong>+3 Spirituality:</strong> Amend up to two separate qualifying rule effects within range.</li><li><strong>+6 Spirituality:</strong> For one amended effect, lock the reformation so it cannot be restored or reasserted until start of your next turn unless the source succeeds on a hard save/check.</li></ul><p><em>Counterplay:</em> superior source tier, rapid rule cycling, and layered redundant clauses can dilute reformation throughput.</p><p><em>Corruption Hook:</em> if you rewrite statutes to erase lawful protections for vulnerable groups, gain 1 Corruption.</p>',
      img: 'icons/sundries/documents/blueprint-technical-red.webp',
      activationType: 'action',
      durationValue: '1',
      durationUnits: 'minute',
      targetType: 'space',
      targetCount: '1',
      targetSpecial: 'active rule construct or legal field',
      rangeUnits: 'ft',
      rangeValue: '240',
      rangeSpecial: '',
      school: 'trs',
      properties: ['vocal', 'somatic', 'material'],
      materials: 'a revision docket signed with judicial cipher',
      identifier: 'lotm-arbiter-statute-reformation',
      activityId: 'arbiterSeq1Reform02',
      now: now + 5,
      existing: existing2,
      sort: 1800901
    });

    const ability3 = buildAbilityDoc({
      id: 'lotmAbilityZ1003',
      name: 'Remote Judgment',
      description:
        '<p><strong>Baseline (3 Spirituality):</strong> Bonus action. Pronounce judgment on one identified violator within your jurisdiction (or within 600 feet in direct combat) for 1 minute. You do not need line of sight if the target is currently known through your Arbiter tracking/detection effects. On declaration, target makes a Wisdom save. On failure, it gains a sentence mark: once per round when it violates an active Arbiter clause, you trigger one remote backlash event equal to <strong>Potency</strong> and may apply one minor rider (slow 10 feet, reaction lock, or save penalty) until start of its next turn.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Affect one additional qualified violator, or increase direct-combat range to 1,000 feet.</li><li><strong>+3 Spirituality:</strong> Remote backlash ignores mundane cover and resistance reductions tied to terrain or visibility.</li><li><strong>+6 Spirituality:</strong> Once per scene, convert a failed save into a major judgment: target cannot benefit from ally-granted bonuses until end of its next turn.</li></ul><p><em>Counterplay:</em> break tracking chains, remain clause-compliant, and force the Arbiter into uncertain attribution.</p><p><em>Corruption Hook:</em> if you issue remote judgment without reliable evidence of violation, gain 1 Corruption.</p>',
      img: 'icons/magic/symbols/runes-star-orange.webp',
      activationType: 'bonus',
      durationValue: '1',
      durationUnits: 'minute',
      targetType: 'creature',
      targetCount: '1',
      targetSpecial: 'identified violator under sentence mark',
      rangeUnits: 'ft',
      rangeValue: '600',
      rangeSpecial: 'jurisdiction-wide with tracking certainty',
      school: 'div',
      properties: ['vocal', 'somatic'],
      materials: 'a remote verdict tablet engraved with target sigils',
      identifier: 'lotm-arbiter-remote-judgment',
      activityId: 'arbiterSeq1Remote03',
      now: now + 6,
      existing: existing3,
      sort: 1800902
    });

    const ability4 = buildAbilityDoc({
      id: 'lotmAbilityZ1004',
      name: 'Anomaly Arbitration',
      description:
        '<p><strong>Baseline (2 Spirituality):</strong> Reaction when a major supernatural anomaly, battlefield disorder surge, or unstable mystical effect emerges within 300 feet. Enter independent arbitration stance and force an Order check/save contest against the source. On success/failure by source, you immediately quell the anomaly&apos;s next pulse, reduce its active output by <strong>Potency</strong>, and choose one control outcome: delay, redirect vector, or dampen radius until end of current round.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Extend arbitration control through end of your next turn, or include one linked anomaly node.</li><li><strong>+3 Spirituality:</strong> Source creature (if any) takes <strong>-Potency</strong> to rolls/checks/saves tied to that anomaly for 1 round.</li><li><strong>+6 Spirituality:</strong> Once per scene, fully suspend one qualifying anomaly for 1 round and convert its residual force into a temporary lawful clause under your control.</li></ul><p><em>Counterplay:</em> multi-source anomaly layering, immunity to suppression contests, and forced arbitration overload can break control windows.</p><p><em>Corruption Hook:</em> if you arbitrate anomalies to preserve political appearance rather than civilian safety, gain 1 Corruption.</p>',
      img: 'icons/magic/control/control-influence-rally-purple.webp',
      activationType: 'reaction',
      durationValue: '',
      durationUnits: 'inst',
      targetType: 'space',
      targetCount: '1',
      targetSpecial: 'major anomaly event or surge node',
      rangeUnits: 'ft',
      rangeValue: '300',
      rangeSpecial: '',
      school: 'abj',
      properties: ['vocal'],
      materials: 'a narrow brass arbitration rod etched with order glyphs',
      identifier: 'lotm-arbiter-anomaly-arbitration',
      activityId: 'arbiterSeq1Arbit04',
      now: now + 7,
      existing: existing4,
      sort: 1800903
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
