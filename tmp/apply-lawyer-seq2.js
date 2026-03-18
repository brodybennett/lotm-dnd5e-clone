const { ClassicLevel } = require('./node-tools/node_modules/classic-level');

const CORE_VERSION = '13.351';
const SYSTEM_ID = 'lotm';
const SYSTEM_VERSION = '5.2.6';
const MODIFIER = '0000000000000000';

const PATHWAY_NAME = 'Lawyer';
const PATHWAY_IDENTIFIER = 'lotm-lawyer';
const DEFAULT_PATHWAY_ID = 'lotmPathway00021';
const FOLDER_ID = 'F7OA4PBTMNaIeTZQ';

const LEGACY_A_KEY = '!items!lotmAbilityX4001'; // Exploit Clause (2+ sequences below)
const LEGACY_B_KEY = '!items!lotmAbilityX5001'; // Disorder Judgment (2+ sequences below)

const ABILITY_1_ID = 'lotmAbilityX2001';
const ABILITY_2_ID = 'lotmAbilityX2002';
const ABILITY_3_ID = 'lotmAbilityX2003';
const ABILITY_4_ID = 'lotmAbilityX2004';

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
    const locatedPathway = await findPathwayByIdentifier(pathwaysDb, PATHWAY_IDENTIFIER);
    const pathwayId = locatedPathway?.doc?._id ?? DEFAULT_PATHWAY_ID;
    const pathwayKey = locatedPathway?.key ?? `!items!${pathwayId}`;
    const pathway = locatedPathway?.doc ?? (await getOptionalJson(pathwaysDb, pathwayKey));
    if (!pathway) {
      throw new Error(`Lawyer pathway (${pathwayKey}) not found. Sequence 9-3 package is required first.`);
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
      '<p><strong>Sequence 2 Package (Gain Budget +50):</strong> Entropy Writ, Airborne Exploit, Authority Distortion, Extinction Verdict, plus two legacy upgrades (Exploit Clause and Disorder Judgment).</p>' +
      '<p><strong>Sequence 1-0 Status:</strong> Pending authoring in later sequence-focused runs.</p>' +
      '<p><strong>Continuity Anchor:</strong> At Sequence 2 (Duke of Entropy), Lawyer rulings intensify from localized frenzy into sustained entropy pressure and authority-level exploit/distortion, while maintaining explicit verdict structure and accountable counterplay.</p>';
    pathway._stats = buildStats(now, pathway._stats);
    await pathwaysDb.put(pathwayKey, JSON.stringify(pathway));

    const folderKey = `!folders!${FOLDER_ID}`;
    const folder = await getOptionalJson(abilitiesDb, folderKey);
    if (!folder) {
      throw new Error(`Lawyer ability folder (${FOLDER_ID}) not found.`);
    }
    folder.name = PATHWAY_NAME;
    folder.description = 'Sequence abilities for the Lawyer pathway (authored through Sequence 2).';
    folder.flags = folder.flags ?? {};
    folder.flags.lotm = {
      ...(folder.flags.lotm ?? {}),
      pathwayIdentifier: PATHWAY_IDENTIFIER,
      latestAuthoredSequence: 2
    };
    folder._stats = buildStats(now + 1, folder._stats);
    await abilitiesDb.put(folderKey, JSON.stringify(folder));

    const legacyA = await getOptionalJson(abilitiesDb, LEGACY_A_KEY);
    const legacyB = await getOptionalJson(abilitiesDb, LEGACY_B_KEY);
    if (!legacyA) throw new Error('Legacy target lotmAbilityX4001 not found.');
    if (!legacyB) throw new Error('Legacy target lotmAbilityX5001 not found.');

    const legacyAHeader = '<h3>Legacy Upgrade (Sequence 2 - Potency)</h3>';
    const legacyAText =
      '<p>At Sequence 2, <strong>Exploit Clause</strong> gains angel-tier legal force over active states. ' +
      'When you successfully Exploit an effect, you may apply one additional exploit verdict (Extend, Curtail, or Suspend) to the same target effect without a second contest. ' +
      'If the effect is inside your Entropy Writ area or marked by Extinction Verdict, numeric exploit shifts increase by <strong>Potency</strong> and the target cannot restore the altered state until end of its next turn.</p>';
    const legacyADesc = String(legacyA.system?.description?.value ?? '');
    if (!legacyADesc.includes(legacyAHeader)) {
      legacyA.system.description.value = `${legacyADesc}${legacyAHeader}${legacyAText}`;
    }
    legacyA._stats = buildStats(now + 2, legacyA._stats);
    await abilitiesDb.put(LEGACY_A_KEY, JSON.stringify(legacyA));

    const legacyBHeader = '<h3>Legacy Upgrade (Sequence 2 - Scope)</h3>';
    const legacyBText =
      '<p>At Sequence 2, <strong>Disorder Judgment</strong> expands from target rulings into shared-order disruption. ' +
      'When a creature fails Disorder Judgment, you may project half-strength of its selected package to one additional hostile creature within 20 feet (no additional save, minimum penalty 1, duration until end of projected target\'s next turn). ' +
      'While projected disorder is active, your Authority Distortion can treat both creatures as a single legal cluster for one clause redirection.</p>';
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
      name: 'Entropy Writ',
      description:
        '<p><strong>Baseline (3 Spirituality):</strong> Action. Issue an entropy writ on a point within 120 feet for 1 minute (30-foot radius, concentration). Hostile creatures entering or starting in the area make a Wisdom save. On failure they become <strong>Entropized</strong> until end of their turn: roll 1d4 at start of each entropized turn: 1) -<strong>Potency</strong> to first d20 test, 2) speed reduced by 10 + <strong>Potency</strong> feet, 3) cannot benefit from Help/reaction bonuses, 4) first ability/spell effect they produce this turn has its range halved.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> radius becomes 40 feet, or you create a second 15-foot-radius writ within 30 feet of the first.</li><li><strong>+2 Spirituality:</strong> choose one Entropy Writ result and force failed creatures to use it instead of rolling for that turn.</li><li><strong>+4 Spirituality:</strong> creatures that fail saves against your writ for two consecutive turns gain one <em>Extinction Mark</em>; at 2 marks, they lose bonus action and reactions until start of their next turn.</li></ul><p><em>Counterplay:</em> teleportation, anti-field sanctification, and concentration pressure disrupt entropy enforcement.</p><p><em>Corruption Hook:</em> if you deploy writ fields to destabilize civilian infrastructure without necessity, gain 1 Corruption.</p>',
      img: 'icons/magic/control/debuff-energy-hold-vortex-pink.webp',
      activationType: 'action',
      durationValue: '1',
      durationUnits: 'minute',
      targetType: 'radius',
      targetCount: '1',
      targetSpecial: '30-foot-radius entropy writ zone',
      rangeUnits: 'ft',
      rangeValue: '120',
      rangeSpecial: '',
      school: 'ill',
      properties: ['vocal', 'somatic', 'material'],
      materials: 'a black decree strip wound around a rusted compass',
      identifier: 'lotm-lawyer-entropy-writ',
      activityId: 'lawyerSeq2Entropy01',
      now: now + 4,
      existing: existing1,
      sort: 1700700
    });

    const ability2 = buildAbilityDoc({
      id: ABILITY_2_ID,
      name: 'Airborne Exploit',
      description:
        '<p><strong>Baseline (2 Spirituality):</strong> Bonus Action. Exploit your airborne legal state. Until end of your turn, you gain a 40-foot three-dimensional movement burst, ignore falling, and do not provoke opportunity attacks from creatures you move away from. If you began the turn off the ground, add <strong>Potency x 5</strong> feet to this burst.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> carry one willing creature of your size or smaller through this movement, or increase burst distance by 20 feet.</li><li><strong>+2 Spirituality:</strong> duration becomes 1 minute; each turn you may hover up to 20 feet above surfaces and treat vertical movement as normal movement.</li><li><strong>+4 Spirituality:</strong> once before the effect ends, when you would be hit, exploit positional state to shift up to 15 feet and impose disadvantage on that triggering attack.</li></ul><p><em>Counterplay:</em> forced grounding effects, anti-mobility zones, and restraint can block exploitation movement.</p><p><em>Corruption Hook:</em> if you abuse airborne exploit to evade lawful accountability after causing harm, gain 1 Corruption.</p>',
      img: 'icons/magic/air/wind-stream-blue-gray.webp',
      activationType: 'bonus',
      durationValue: '',
      durationUnits: 'inst',
      targetType: 'self',
      targetCount: '1',
      targetSpecial: 'self',
      rangeUnits: 'self',
      rangeValue: '',
      rangeSpecial: '',
      school: 'trs',
      properties: ['somatic'],
      materials: 'a suspended verdict seal tied to a silver thread',
      identifier: 'lotm-lawyer-airborne-exploit',
      activityId: 'lawyerSeq2Airborne02',
      now: now + 5,
      existing: existing2,
      sort: 1700701
    });

    const ability3 = buildAbilityDoc({
      id: ABILITY_3_ID,
      name: 'Authority Distortion',
      description:
        '<p><strong>Baseline (3 Spirituality):</strong> Reaction when a rule-creating effect (aura, zone, command rider, environmental clause, or pathway authority effect) is declared within 120 feet. Contest your spell save against the source\'s spell save/DC (or Charisma save if none). On success, choose one distortion verdict: <strong>Clause Redirection</strong> (move effect origin up to 20 feet), <strong>Target Reframing</strong> (swap one eligible target to another eligible target), or <strong>Timing Deferment</strong> (delay onset until start of source\'s next turn).</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> apply one additional distortion verdict to the same triggering effect.</li><li><strong>+2 Spirituality:</strong> range becomes 180 feet, and you gain advantage on the contest against non-mythic effects.</li><li><strong>+4 Spirituality:</strong> if the contest succeeds by 5 or more, you may reflect one non-damaging rider back onto the original source until end of its next turn.</li></ul><p><em>Counterplay:</em> effects with immutable wording, mythic immunity clauses, and anti-interference seals resist authority distortion.</p><p><em>Corruption Hook:</em> if you distort allied protection clauses to preserve status instead of lives, gain 1 Corruption.</p>',
      img: 'icons/magic/symbols/rune-sigil-green-purple.webp',
      activationType: 'reaction',
      durationValue: '',
      durationUnits: 'inst',
      targetType: 'creature',
      targetCount: '1',
      targetSpecial: 'source of a rule-creating effect',
      rangeUnits: 'ft',
      rangeValue: '120',
      rangeSpecial: '',
      school: 'abj',
      properties: ['vocal', 'somatic', 'material'],
      materials: 'an iron stylus engraved with crossed statutes',
      identifier: 'lotm-lawyer-authority-distortion',
      activityId: 'lawyerSeq2Authority03',
      now: now + 6,
      existing: existing3,
      sort: 1700702
    });

    const ability4 = buildAbilityDoc({
      id: ABILITY_4_ID,
      name: 'Extinction Verdict',
      description:
        '<p><strong>Baseline (2 Spirituality):</strong> Action. Pronounce an extinction verdict on one creature within 90 feet that can hear and understand you (Charisma save). On failure, the target is under <strong>Extinction Docket</strong> for 1 minute (concentration). Each time it takes an action that affects another creature, it gains one docket stack (max 3). At 2 stacks: disadvantage on its next saving throw. At 3 stacks: until end of its next turn it cannot use pathway/class features and takes psychic damage equal to <strong>Potency</strong>.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> apply to one additional target (separate save), or increase range to 120 feet.</li><li><strong>+2 Spirituality:</strong> first stack threshold adds immediate speed reduction by 10 feet and no reaction.</li><li><strong>+4 Spirituality:</strong> when a target reaches 3 stacks, choose one active buff/effect on it; that effect is suppressed until end of its next turn.</li></ul><p><em>Counterplay:</em> action-economy denial immunity, silence, and high Charisma/legendary resistance reduce verdict landing rate.</p><p><em>Corruption Hook:</em> if you issue extinction verdicts to silence lawful dissent, gain 1 Corruption.</p>',
      img: 'icons/magic/death/skull-fire-pink.webp',
      activationType: 'action',
      durationValue: '1',
      durationUnits: 'minute',
      targetType: 'creature',
      targetCount: '1',
      targetSpecial: 'creature that can hear and understand you',
      rangeUnits: 'ft',
      rangeValue: '90',
      rangeSpecial: '',
      school: 'nec',
      properties: ['vocal', 'somatic'],
      materials: 'a sealed black verdict capsule',
      identifier: 'lotm-lawyer-extinction-verdict',
      activityId: 'lawyerSeq2Extinct04',
      now: now + 7,
      existing: existing4,
      sort: 1700703
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
