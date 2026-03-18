const { ClassicLevel } = require('./node-tools/node_modules/classic-level');

const CORE_VERSION = '13.351';
const SYSTEM_ID = 'lotm';
const SYSTEM_VERSION = '5.2.6';
const MODIFIER = '0000000000000000';

const PATHWAY_KEY = '!items!lotmPathway00022';
const FOLDER_KEY = '!folders!eiKFQVwZoYCkBNOF';
const PATHWAY_IDENTIFIER = 'lotm-arbiter';

const LEGACY_A_KEY = '!items!lotmAbilityZ5001';
const LEGACY_B_KEY = '!items!lotmAbilityZ6001';

const ABILITY_1_KEY = '!items!lotmAbilityZ3001';
const ABILITY_2_KEY = '!items!lotmAbilityZ3002';
const ABILITY_3_KEY = '!items!lotmAbilityZ3003';
const ABILITY_4_KEY = '!items!lotmAbilityZ3004';

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
    if (!pathway) throw new Error('Arbiter pathway not found. Sequence 9-4 authoring is required first.');

    pathway.system = pathway.system ?? {};
    pathway.system.description = pathway.system.description ?? { value: '', chat: '' };
    pathway.system.description.value =
      '<p><strong>Pathway Vector:</strong> impartial authority through declared order, high-order lawcraft, and chaos-hunting execution that tracks and punishes disorder directly.</p>' +
      '<p><strong>Sequence 9 Package (Total Budget 2):</strong> Authority Bearing, Preliminary Verdict.</p>' +
      '<p><strong>Sequence 8 Package (Gain Budget +3):</strong> Jurisdiction Field, Recognition Warrant, plus one legacy scope upgrade to Authority Bearing.</p>' +
      '<p><strong>Sequence 7 Package (Gain Budget +13):</strong> Illusory Torture Device, Psychic Lashing, Psychic Piercing, plus two legacy upgrades (Authority Bearing and Jurisdiction Field).</p>' +
      '<p><strong>Sequence 6 Package (Gain Budget +9):</strong> Judicial Exile, Sequestration Order, Cityline Jurisdiction, plus two legacy upgrades (Authority Bearing and Recognition Warrant).</p>' +
      '<p><strong>Sequence 5 Package (Gain Budget +13):</strong> Punishment Mark, Layered Prohibition, Disciplinary Aura, plus two legacy upgrades (Authority Bearing and Psychic Lashing).</p>' +
      '<p><strong>Sequence 4 Package (Gain Budget +33):</strong> Imperative Law, Boundary Edict, Overruling Verdict, Mandate Convergence, plus two legacy upgrades (Authority Bearing and Judicial Exile).</p>' +
      '<p><strong>Sequence 3 Package (Gain Budget +20):</strong> Disorder Pursuit, Sword of Judgment, Metropolitan Partition, Anomaly Quell, plus two legacy upgrades (Punishment Mark and Judicial Exile).</p>' +
      '<p><strong>Sequence 2-0 Status:</strong> Pending authoring in later sequence-focused runs.</p>' +
      '<p><strong>Continuity Anchor:</strong> At Sequence 3 (Chaos Hunter), Arbiter power shifts from static law architecture into active disorder-tracking pressure: sensing and locking onto destabilizing targets while leveraging existing laws for unavoidable sentence momentum.</p>';
    pathway._stats = buildStats(now, pathway._stats);
    await pathwaysDb.put(PATHWAY_KEY, JSON.stringify(pathway));

    const folder = await getOptionalJson(abilitiesDb, FOLDER_KEY);
    if (!folder) throw new Error('Arbiter folder not found.');

    folder.name = 'Arbiter';
    folder.description = 'Sequence abilities for the Arbiter pathway (authored through Sequence 3).';
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
    if (!legacyA) throw new Error('Legacy target lotmAbilityZ5001 not found.');
    if (!legacyB) throw new Error('Legacy target lotmAbilityZ6001 not found.');

    const legacyAHeader = '<h3>Legacy Upgrade (Sequence 3 - Potency)</h3>';
    const legacyAText =
      '<p>At Sequence 3, <strong>Punishment Mark</strong> gains chaos-hunting lethality. ' +
      'When a marked target triggers punishment while affected by Disorder Pursuit or standing inside Metropolitan Partition, the punishment backlash increases by <strong>Potency</strong> and the target takes a <strong>-Potency</strong> penalty to its next save against one of your Arbiter abilities before the end of its next turn. ' +
      'This enhanced backlash can trigger only once per marked target each round.</p>';
    const legacyADesc = String(legacyA.system?.description?.value ?? '');
    if (!legacyADesc.includes(legacyAHeader)) {
      legacyA.system.description.value = `${legacyADesc}${legacyAHeader}${legacyAText}`;
    }
    legacyA._stats = buildStats(now + 2, legacyA._stats);
    await abilitiesDb.put(LEGACY_A_KEY, JSON.stringify(legacyA));

    const legacyBHeader = '<h3>Legacy Upgrade (Sequence 3 - Efficiency)</h3>';
    const legacyBText =
      '<p>At Sequence 3, <strong>Judicial Exile</strong> becomes a faster pursuit sentence. ' +
      'When you cast Judicial Exile on a creature currently violating one of your active laws, prohibitions, or boundaries, you may apply the first exile push without consuming your action economy (once per round). ' +
      'If Judicial Exile was upcast by at least <strong>+2 Spirituality</strong>, the first qualifying free exile each round also strips reactions until the start of the target\'s next turn.</p>';
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
      id: 'lotmAbilityZ3001',
      name: 'Disorder Pursuit',
      description:
        '<p><strong>Baseline (1 Spirituality):</strong> Bonus action. Mark one creature or active anomaly source within 150 feet as a disorder target for 1 minute. While marked, you always know its direction if it is within your jurisdiction or line of sight, and once per round when it violates one of your rules/verdicts you may move up to 15 feet without provoking opportunity attacks. Your first attack/check/save against that target each round gains <strong>+Potency</strong>.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Mark one additional disorder target, or extend tracking range to 300 feet while inside your jurisdiction.</li><li><strong>+2 Spirituality:</strong> You may instantly jump to a visible point within 10 feet of the marked target when it fails a save against one of your Arbiter abilities (once per round).</li><li><strong>+4 Spirituality:</strong> The first marked target each round that violates your law takes unavoidable spiritual backlash equal to <strong>Potency</strong> and cannot take reactions until start of its next turn.</li></ul><p><em>Counterplay:</em> concealment-breaking countermeasures, jurisdiction escape, and anti-mark cleansing can reduce pursuit persistence.</p><p><em>Corruption Hook:</em> if you deliberately hunt compliant civilians as disorder prey, gain 1 Corruption.</p>',
      img: 'icons/skills/tracking/footprints-trail-brown.webp',
      activationType: 'bonus',
      durationValue: '1',
      durationUnits: 'minute',
      targetType: 'creature',
      targetCount: '1',
      targetSpecial: 'creature or anomaly source',
      rangeUnits: 'ft',
      rangeValue: '150',
      rangeSpecial: '',
      school: 'div',
      properties: ['vocal', 'somatic'],
      materials: 'a copper pursuit seal engraved with a target sigil',
      identifier: 'lotm-arbiter-disorder-pursuit',
      activityId: 'arbiterSeq3Pursuit01',
      now: now + 4,
      existing: existing1,
      sort: 1800700
    });

    const ability2 = buildAbilityDoc({
      id: 'lotmAbilityZ3002',
      name: 'Sword of Judgment',
      description:
        '<p><strong>Baseline (1 Spirituality):</strong> Action. Deliver a direct sentence strike against one creature within 90 feet that is currently disorderly (violating a rule, under chaotic effect, or resisting a verdict). It makes a Wisdom save. On a failure, it takes spiritual damage equal to <strong>Potency</strong> and becomes rooted until end of turn. If it is currently violating one of your effects, this strike ignores mundane cover and cannot be redirected.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Increase range to 150 feet or affect one additional valid target within 20 feet of the first (separate save).</li><li><strong>+2 Spirituality:</strong> Failed targets also suffer <strong>-Potency</strong> on their next save against one of your Arbiter abilities before end of next turn.</li><li><strong>+4 Spirituality:</strong> If a target fails while inside your active law zone, you may immediately jump adjacent to it or a point within 10 feet of it, then apply one free Punishment Mark rider (no upcast).</li></ul><p><em>Counterplay:</em> rule-compliant behavior, immunity to movement lock, and anti-judgment effects can blunt sentence impact.</p><p><em>Corruption Hook:</em> if you pronounce judgment without due cause to satisfy vendettas, gain 1 Corruption.</p>',
      img: 'icons/weapons/swords/sword-flanged-lightning.webp',
      activationType: 'action',
      durationValue: '',
      durationUnits: 'inst',
      targetType: 'creature',
      targetCount: '1',
      targetSpecial: 'disorderly creature in sentence range',
      rangeUnits: 'ft',
      rangeValue: '90',
      rangeSpecial: '',
      school: 'evo',
      properties: ['vocal', 'somatic'],
      materials: 'a miniature blade charm stamped with a verdict rune',
      identifier: 'lotm-arbiter-sword-of-judgment',
      activityId: 'arbiterSeq3Judgment02',
      now: now + 5,
      existing: existing2,
      sort: 1800701
    });

    const ability3 = buildAbilityDoc({
      id: 'lotmAbilityZ3003',
      name: 'Metropolitan Partition',
      description:
        '<p><strong>Baseline (2 Spirituality):</strong> Action. Partition a battlefield within 120 feet into two legal sectors for 1 minute (concentration), separated by a visible dividing boundary. Hostile creatures crossing sectors make a Charisma save. On failure, they are forced back into their current sector and take <strong>-1</strong> to all rolls/checks/saves until start of their next turn if they attempt another crossing. Allies crossing sectors gain advantage on one save against forced movement before end of turn.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Increase partition diameter by 20 feet, or create one additional dividing boundary.</li><li><strong>+2 Spirituality:</strong> Failed hostile crossings take spiritual backlash equal to <strong>Potency</strong> and lose reactions until start of next turn.</li><li><strong>+4 Spirituality:</strong> Once per round, one hostile creature that fails crossing is excluded from its sector for 1 round (cannot affect or be affected across sector boundaries except by your abilities).</li></ul><p><em>Counterplay:</em> long-range pressure from within a legal sector, non-crossing tactics, and anti-barrier abilities limit partition control.</p><p><em>Corruption Hook:</em> if you partition civilians to deny life-saving aid, gain 1 Corruption.</p>',
      img: 'icons/magic/symbols/runes-triangle-blue.webp',
      activationType: 'action',
      durationValue: '1',
      durationUnits: 'minute',
      targetType: 'space',
      targetCount: '1',
      targetSpecial: 'partitioned battlefield zone',
      rangeUnits: 'ft',
      rangeValue: '120',
      rangeSpecial: '',
      school: 'abj',
      properties: ['vocal', 'somatic', 'material'],
      materials: 'a segmented city map cut into equal legal sectors',
      identifier: 'lotm-arbiter-metropolitan-partition',
      activityId: 'arbiterSeq3Partition03',
      now: now + 6,
      existing: existing3,
      sort: 1800702
    });

    const ability4 = buildAbilityDoc({
      id: 'lotmAbilityZ3004',
      name: 'Anomaly Quell',
      description:
        '<p><strong>Baseline (0 Spirituality):</strong> Reaction when a visible environmental or mystical disorder effect occurs within 120 feet (sudden zone hazard, unstable summon, uncontrolled surge, collapsing law effect). Make an Arbiter suppression check (or force a Charisma save from a responsible creature at GM option). On success/fail respectively, reduce the effect&apos;s immediate impact by <strong>Potency</strong> and stabilize it until end of current round.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Extend stabilization to end of your next turn, or suppress one additional linked anomaly within 30 feet of the first.</li><li><strong>+2 Spirituality:</strong> If the anomaly has an active source creature, that source takes <strong>-Potency</strong> on its next roll/check/save tied to that anomaly.</li><li><strong>+4 Spirituality:</strong> Convert the quelled anomaly into a temporary legal clause under your control for 1 round; you choose one creature to be immune and one hostile creature to be bound by it.</li></ul><p><em>Counterplay:</em> repeated layered anomaly generation, suppression immunity, or effects anchored outside your legal influence can overwhelm quelling.</p><p><em>Corruption Hook:</em> if you selectively quell hazards only for favored elites while abandoning lawful civilians, gain 1 Corruption.</p>',
      img: 'icons/magic/control/debuff-energy-wave-teal.webp',
      activationType: 'reaction',
      durationValue: '',
      durationUnits: 'inst',
      targetType: 'space',
      targetCount: '1',
      targetSpecial: 'environmental or mystical disorder event',
      rangeUnits: 'ft',
      rangeValue: '120',
      rangeSpecial: '',
      school: 'abj',
      properties: ['vocal'],
      materials: 'a folded emergency ordinance slip',
      identifier: 'lotm-arbiter-anomaly-quell',
      activityId: 'arbiterSeq3Quell04',
      now: now + 7,
      existing: existing4,
      sort: 1800703
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
