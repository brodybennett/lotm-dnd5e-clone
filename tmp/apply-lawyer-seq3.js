const { ClassicLevel } = require('./node-tools/node_modules/classic-level');

const CORE_VERSION = '13.351';
const SYSTEM_ID = 'lotm';
const SYSTEM_VERSION = '5.2.6';
const MODIFIER = '0000000000000000';

const PATHWAY_NAME = 'Lawyer';
const PATHWAY_IDENTIFIER = 'lotm-lawyer';
const DEFAULT_PATHWAY_ID = 'lotmPathway00021';
const FOLDER_ID = 'F7OA4PBTMNaIeTZQ';

const LEGACY_A_KEY = '!items!lotmAbilityX5001'; // Disorder Judgment (2+ sequences below)
const LEGACY_B_KEY = '!items!lotmAbilityX6001'; // Distortion Decree (2+ sequences below)

const ABILITY_1_ID = 'lotmAbilityX3001';
const ABILITY_2_ID = 'lotmAbilityX3002';
const ABILITY_3_ID = 'lotmAbilityX3003';
const ABILITY_4_ID = 'lotmAbilityX3004';

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

async function findPathwayByIdentifier(db, identifier) {
  for await (const [key, raw] of db.iterator({ gte: '!items!', lt: '!items!~' })) {
    const doc = JSON.parse(raw);
    if (doc?.system?.identifier === identifier) {
      return { key, doc };
    }
  }
  return null;
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
    const locatedPathway = await findPathwayByIdentifier(pathwaysDb, PATHWAY_IDENTIFIER);
    const pathwayId = locatedPathway?.doc?._id ?? DEFAULT_PATHWAY_ID;
    const pathwayKey = locatedPathway?.key ?? `!items!${pathwayId}`;
    const pathway = locatedPathway?.doc ?? (await getOptionalJson(pathwaysDb, pathwayKey));
    if (!pathway) {
      throw new Error(`Lawyer pathway (${pathwayKey}) not found. Sequence 9-4 package is required first.`);
    }

    pathway.system = pathway.system ?? {};
    pathway.system.description = pathway.system.description ?? { value: '', chat: '' };
    pathway.system.description.value =
      '<p><strong>Pathway Vector:</strong> impartial adjudication through precise rhetoric, loophole analysis, and order-backed injunctions that constrain hostile conduct.</p>' +
      '<p><strong>Sequence 9 Package (Total Budget 2):</strong> Law Proficiency, Order Citation.</p>' +
      '<p><strong>Sequence 8 Package (Gain Budget +3):</strong> Rulebreaker Physique, Verdict Compulsion, plus one legacy scope upgrade to Law Proficiency.</p>' +
      '<p><strong>Sequence 7 Package (Gain Budget +13):</strong> Bribery, Indebted Network, Liability Transfer, plus two legacy upgrades (Law Proficiency and Verdict Compulsion).</p>' +
      '<p><strong>Sequence 6 Package (Gain Budget +9):</strong> Distortion Decree, Corrosion Sentence, Weakness Deposition, plus two legacy upgrades (Law Proficiency and Bribery).</p>' +
      '<p><strong>Sequence 5 Package (Gain Budget +13):</strong> Disorder Judgment, Distance Misrule, Procedural Misorder, plus two legacy upgrades (Law Proficiency and Bribery).</p>' +
      '<p><strong>Sequence 4 Package (Gain Budget +33):</strong> Exploit Clause, Bestowment Sentence, Magnify Decree, Sovereign Disorder, plus two legacy upgrades (Distortion Decree and Law Proficiency).</p>' +
      '<p><strong>Sequence 3 Package (Gain Budget +20):</strong> Superior Mandate, Frenzied Fluctuation, Distorted Advance, Strata Overrule, plus two legacy upgrades (Disorder Judgment and Distortion Decree).</p>' +
      '<p><strong>Sequence 2-0 Status:</strong> Pending authoring in later sequence-focused runs.</p>' +
      '<p><strong>Continuity Anchor:</strong> At Sequence 3 (Frenzied Mage), Lawyer rulings become partially authority-grade: hierarchy pressure, unstable but favorable frenzy variance, and movement-intent distortion layered over existing disorder jurisprudence.</p>';
    pathway._stats = buildStats(now, pathway._stats);
    await pathwaysDb.put(pathwayKey, JSON.stringify(pathway));

    const folderKey = `!folders!${FOLDER_ID}`;
    const folder = await getOptionalJson(abilitiesDb, folderKey);
    if (!folder) {
      throw new Error(`Lawyer ability folder (${FOLDER_ID}) not found.`);
    }
    folder.name = PATHWAY_NAME;
    folder.description = 'Sequence abilities for the Lawyer pathway (authored through Sequence 3).';
    folder.flags = folder.flags ?? {};
    folder.flags.lotm = {
      ...(folder.flags.lotm ?? {}),
      pathwayIdentifier: PATHWAY_IDENTIFIER,
      latestAuthoredSequence: 3
    };
    folder._stats = buildStats(now + 1, folder._stats);
    await abilitiesDb.put(folderKey, JSON.stringify(folder));

    const legacyA = await getOptionalJson(abilitiesDb, LEGACY_A_KEY);
    const legacyB = await getOptionalJson(abilitiesDb, LEGACY_B_KEY);
    if (!legacyA) throw new Error('Legacy target lotmAbilityX5001 not found.');
    if (!legacyB) throw new Error('Legacy target lotmAbilityX6001 not found.');

    const legacyAHeader = '<h3>Legacy Upgrade (Sequence 3 - Potency)</h3>';
    const legacyAText =
      '<p>At Sequence 3, <strong>Disorder Judgment</strong> gains higher-tier sentence force under frenzy conditions. ' +
      'When a creature fails Disorder Judgment while affected by your Frenzied Fluctuation or Strata Overrule, the chosen package applies one additional rider: either movement reduction by 10 feet, or disadvantage on the next check tied to that package. ' +
      'If the target already suffers a package rider, numeric values increase by <strong>Potency</strong> once per turn.</p>';
    const legacyADesc = String(legacyA.system?.description?.value ?? '');
    if (!legacyADesc.includes(legacyAHeader)) {
      legacyA.system.description.value = `${legacyADesc}${legacyAHeader}${legacyAText}`;
    }
    legacyA._stats = buildStats(now + 2, legacyA._stats);
    await abilitiesDb.put(LEGACY_A_KEY, JSON.stringify(legacyA));

    const legacyBHeader = '<h3>Legacy Upgrade (Sequence 3 - Efficiency)</h3>';
    const legacyBText =
      '<p>At Sequence 3, <strong>Distortion Decree</strong> becomes easier to sequence into rapid judgments. ' +
      'Once per round, after you use Distorted Advance or Superior Mandate, you may cast Distortion Decree with reduced setup: no verbal component and 1 less spirituality cost (minimum 0). ' +
      'If this reduced-cost cast succeeds, you can immediately reposition 10 feet without provoking opportunity attacks.</p>';
    const legacyBDesc = String(legacyB.system?.description?.value ?? '');
    if (!legacyBDesc.includes(legacyBHeader)) {
      legacyB.system.description.value = `${legacyBDesc}${legacyBHeader}${legacyBText}`;
    }
    legacyB._stats = buildStats(now + 3, legacyB._stats);
    await abilitiesDb.put(LEGACY_B_KEY, JSON.stringify(legacyB));

    const existing1 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_1_ID}`);
    const existing2 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_2_ID}`);
    const existing3 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_3_ID}`);
    const existing4 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_4_ID}`);

    const ability1 = buildAbilityDoc({
      id: ABILITY_1_ID,
      name: 'Superior Mandate',
      description:
        '<p><strong>Baseline (2 Spirituality):</strong> Action. Deliver a superior ruling to one creature within 90 feet that can hear and understand you (Charisma save). On failure choose one mandate until end of its next turn: <strong>Submit Motion</strong> (cannot target creatures other than you with hostile actions), <strong>Lower Gaze</strong> (disadvantage on attacks and concentration checks), or <strong>Kneel to Rank</strong> (speed becomes 0 and no reactions).</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> affect one additional creature (separate save), or increase range to 120 feet.</li><li><strong>+2 Spirituality:</strong> duration becomes 1 minute (concentration, repeat save at end of each affected turn), and numeric penalties become <strong>Potency</strong>.</li><li><strong>+4 Spirituality:</strong> if a target fails by 5 or more, it is frightened of you until end of its next turn; fear-immune targets instead take psychic damage equal to <strong>Potency</strong> and lose bonus action.</li></ul><p><em>Counterplay:</em> silence, language denial, and high Charisma resistance reduce mandate reliability.</p><p><em>Corruption Hook:</em> if you issue superior rulings for vanity rather than adjudicative necessity, gain 1 Corruption.</p>',
      img: 'icons/magic/control/debuff-chains-shackles-movement-blue.webp',
      activationType: 'action',
      durationValue: '',
      durationUnits: 'inst',
      targetType: 'creature',
      targetCount: '1',
      targetSpecial: 'creature that can hear and understand you',
      rangeUnits: 'ft',
      rangeValue: '90',
      rangeSpecial: '',
      school: 'enc',
      properties: ['vocal', 'somatic'],
      materials: 'a black-edged authority writ',
      identifier: 'lotm-lawyer-superior-mandate',
      activityId: 'lawyerSeq3Superior01',
      now: now + 4,
      existing: existing1,
      sort: 1700600
    });

    const ability2 = buildAbilityDoc({
      id: ABILITY_2_ID,
      name: 'Frenzied Fluctuation',
      description:
        '<p><strong>Baseline (1 Spirituality):</strong> Bonus Action. Open a frenzy docket for 1 minute (concentration). At the start of each of your turns, roll 1d4 and gain one lawful-variance benefit until end of turn: 1) +1 to first d20 roll, 2) +10 speed and difficult terrain ignored, 3) reduce first damage taken by <strong>Potency</strong>, 4) one additional reaction usable only for pathway abilities. Choose one hostile creature within 30 feet; it rolls 1d4 and receives the mirrored penalty version for the same duration.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> choose one additional hostile creature for mirrored fluctuation.</li><li><strong>+2 Spirituality:</strong> you may roll twice for your own result and keep one; hostile creatures roll twice and keep the worse.</li><li><strong>+4 Spirituality:</strong> whenever a hostile creature receives a mirrored penalty result, it also takes psychic damage equal to <strong>Potency</strong> and cannot take Help until end of its turn.</li></ul><p><em>Counterplay:</em> concentration breaks, aura displacement, and anti-randomization effects suppress fluctuation value.</p><p><em>Corruption Hook:</em> if you deliberately sustain frenzy variance in civilian panic zones, gain 1 Corruption.</p>',
      img: 'icons/magic/control/debuff-energy-hold-levitate-yellow.webp',
      activationType: 'bonus',
      durationValue: '1',
      durationUnits: 'minute',
      targetType: 'self',
      targetCount: '1',
      targetSpecial: 'self plus mirrored hostile fluctuation targets',
      rangeUnits: 'self',
      rangeValue: '',
      rangeSpecial: '',
      school: 'div',
      properties: ['vocal'],
      materials: 'a docket wheel marked with four clauses',
      identifier: 'lotm-lawyer-frenzied-fluctuation',
      activityId: 'lawyerSeq3Frenzy02',
      now: now + 5,
      existing: existing2,
      sort: 1700601
    });

    const ability3 = buildAbilityDoc({
      id: ABILITY_3_ID,
      name: 'Distorted Advance',
      description:
        '<p><strong>Baseline (1 Spirituality):</strong> Reaction when a creature within 60 feet starts movement or declares a forward-committed action. The creature makes a Wisdom save. On failure, twist its trajectory: it ends movement 10 feet off intended line, cannot reduce distance to its declared target this move, and if its triggering action required straight-line commitment it fails.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> apply to one additional creature that triggers before start of your next turn.</li><li><strong>+2 Spirituality:</strong> you may choose to force a 10-foot retreat instead; numeric movement disruption becomes <strong>Potency</strong>-scaled.</li><li><strong>+4 Spirituality:</strong> failed creatures lose reactions until start of their next turn and take psychic damage equal to <strong>Potency</strong>.</li></ul><p><em>Counterplay:</em> teleportation, movement immunity, and reaction denial reduce trajectory twisting impact.</p><p><em>Corruption Hook:</em> if you repeatedly distort allied retreats to preserve your image, gain 1 Corruption.</p>',
      img: 'icons/magic/control/debuff-energy-snare-blue.webp',
      activationType: 'reaction',
      durationValue: '',
      durationUnits: 'inst',
      targetType: 'creature',
      targetCount: '1',
      targetSpecial: 'creature committing to movement/action trajectory',
      rangeUnits: 'ft',
      rangeValue: '60',
      rangeSpecial: '',
      school: 'trs',
      properties: ['vocal', 'somatic'],
      materials: 'a bent iron trajectory pin',
      identifier: 'lotm-lawyer-distorted-advance',
      activityId: 'lawyerSeq3Distort03',
      now: now + 6,
      existing: existing3,
      sort: 1700602
    });

    const ability4 = buildAbilityDoc({
      id: ABILITY_4_ID,
      name: 'Strata Overrule',
      description:
        '<p><strong>Baseline (2 Spirituality):</strong> Action. Establish a strata decree field centered on yourself for 1 minute (20-foot radius, concentration). Choose up to <strong>Potency</strong> allies as privileged parties. Hostile creatures entering or starting in the field make a Charisma save. On failure they are demoted until end of turn: reach reduced by 5 feet, first contested check each turn takes <strong>-1</strong>, and they cannot benefit from Help.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> field radius becomes 30 feet, or designate one additional privileged ally.</li><li><strong>+2 Spirituality:</strong> penalties become <strong>Potency</strong>, and you gain 10 temporary hit points while concentration lasts.</li><li><strong>+4 Spirituality:</strong> when a demoted creature violates your declared engagement order, it takes psychic damage equal to <strong>Potency</strong> and loses reactions until start of its next turn.</li></ul><p><em>Counterplay:</em> forced displacement, anti-aura effects, and concentration pressure weaken strata control.</p><p><em>Corruption Hook:</em> if you weaponize rank decrees to humiliate noncombatants, gain 1 Corruption.</p>',
      img: 'icons/magic/control/control-influence-rally-purple.webp',
      activationType: 'action',
      durationValue: '1',
      durationUnits: 'minute',
      targetType: 'radius',
      targetCount: '1',
      targetSpecial: '20-foot-radius strata decree field',
      rangeUnits: 'self',
      rangeValue: '',
      rangeSpecial: '',
      school: 'abj',
      properties: ['vocal', 'somatic', 'material'],
      materials: 'a three-tier seal stamped in obsidian wax',
      identifier: 'lotm-lawyer-strata-overrule',
      activityId: 'lawyerSeq3Strata04',
      now: now + 7,
      existing: existing4,
      sort: 1700603
    });

    await abilitiesDb.put(`!items!${ABILITY_1_ID}`, JSON.stringify(ability1));
    await abilitiesDb.put(`!items!${ABILITY_2_ID}`, JSON.stringify(ability2));
    await abilitiesDb.put(`!items!${ABILITY_3_ID}`, JSON.stringify(ability3));
    await abilitiesDb.put(`!items!${ABILITY_4_ID}`, JSON.stringify(ability4));

    console.log(JSON.stringify({
      pathwayWritten: pathwayKey,
      folderWritten: folderKey,
      legacyUpdated: [LEGACY_A_KEY, LEGACY_B_KEY],
      abilitiesWritten: [
        `!items!${ABILITY_1_ID}`,
        `!items!${ABILITY_2_ID}`,
        `!items!${ABILITY_3_ID}`,
        `!items!${ABILITY_4_ID}`
      ],
      mapping: [
        { id: ABILITY_1_ID, grantedSequence: ability1.flags?.lotm?.grantedSequence ?? null, systemLevel: ability1.system?.level ?? null },
        { id: ABILITY_2_ID, grantedSequence: ability2.flags?.lotm?.grantedSequence ?? null, systemLevel: ability2.system?.level ?? null },
        { id: ABILITY_3_ID, grantedSequence: ability3.flags?.lotm?.grantedSequence ?? null, systemLevel: ability3.system?.level ?? null },
        { id: ABILITY_4_ID, grantedSequence: ability4.flags?.lotm?.grantedSequence ?? null, systemLevel: ability4.system?.level ?? null }
      ]
    }, null, 2));
  } finally {
    await pathwaysDb.close();
    await abilitiesDb.close();
  }
})();
