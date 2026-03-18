const { ClassicLevel } = require('./node-tools/node_modules/classic-level');

const CORE_VERSION = '13.351';
const SYSTEM_ID = 'lotm';
const SYSTEM_VERSION = '5.2.6';
const MODIFIER = '0000000000000000';

const PATHWAY_NAME = 'Lawyer';
const PATHWAY_IDENTIFIER = 'lotm-lawyer';
const DEFAULT_PATHWAY_ID = 'lotmPathway00021';
const FOLDER_ID = 'F7OA4PBTMNaIeTZQ';

const LEGACY_A_KEY = '!items!lotmAbilityX6001'; // Distortion Decree (2+ sequences below)
const LEGACY_B_KEY = '!items!lotmAbilityX9001'; // Law Proficiency (2+ sequences below)

const ABILITY_1_ID = 'lotmAbilityX4001';
const ABILITY_2_ID = 'lotmAbilityX4002';
const ABILITY_3_ID = 'lotmAbilityX4003';
const ABILITY_4_ID = 'lotmAbilityX4004';

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
      level: 5,
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
        grantedSequence: 4
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
      throw new Error(`Lawyer pathway (${pathwayKey}) not found. Sequence 9-5 package is required first.`);
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
      '<p><strong>Sequence 3-0 Status:</strong> Pending authoring in later sequence-focused runs.</p>' +
      '<p><strong>Continuity Anchor:</strong> At Sequence 4 (Earl of the Fallen), Lawyer rulings graduate from encounter disorder into demigod-level legal exploitation of duration, scale, and procedure, while preserving explicit verdict structure and counterplay hooks.</p>';
    pathway._stats = buildStats(now, pathway._stats);
    await pathwaysDb.put(pathwayKey, JSON.stringify(pathway));

    const folderKey = `!folders!${FOLDER_ID}`;
    const folder = await getOptionalJson(abilitiesDb, folderKey);
    if (!folder) {
      throw new Error(`Lawyer ability folder (${FOLDER_ID}) not found.`);
    }
    folder.name = PATHWAY_NAME;
    folder.description = 'Sequence abilities for the Lawyer pathway (authored through Sequence 4).';
    folder.flags = folder.flags ?? {};
    folder.flags.lotm = {
      ...(folder.flags.lotm ?? {}),
      pathwayIdentifier: PATHWAY_IDENTIFIER,
      latestAuthoredSequence: 4
    };
    folder._stats = buildStats(now + 1, folder._stats);
    await abilitiesDb.put(folderKey, JSON.stringify(folder));

    const legacyA = await getOptionalJson(abilitiesDb, LEGACY_A_KEY);
    const legacyB = await getOptionalJson(abilitiesDb, LEGACY_B_KEY);
    if (!legacyA) throw new Error('Legacy target lotmAbilityX6001 not found.');
    if (!legacyB) throw new Error('Legacy target lotmAbilityX9001 not found.');

    const legacyAHeader = '<h3>Legacy Upgrade (Sequence 4 - Scope)</h3>';
    const legacyAText =
      '<p>At Sequence 4, <strong>Distortion Decree</strong> expands from clause-level disruption to courtroom-field manipulation. ' +
      'When you issue Distortion Decree, you may apply two different decree clauses at once (same target or two targets within 30 feet of each other). ' +
      'If either target is inside your Sovereign Disorder area, both clauses persist one additional round after concentration ends.</p>';
    const legacyADesc = String(legacyA.system?.description?.value ?? '');
    if (!legacyADesc.includes(legacyAHeader)) {
      legacyA.system.description.value = `${legacyADesc}${legacyAHeader}${legacyAText}`;
    }
    legacyA._stats = buildStats(now + 2, legacyA._stats);
    await abilitiesDb.put(LEGACY_A_KEY, JSON.stringify(legacyA));

    const legacyBHeader = '<h3>Legacy Upgrade (Sequence 4 - Efficiency)</h3>';
    const legacyBText =
      '<p>At Sequence 4, <strong>Law Proficiency</strong> gains adjudication efficiency under established verdict control. ' +
      'Once per round, when a creature fails against your Exploit Clause, Bestowment Sentence, or Sovereign Disorder, you may apply your Objection rider from Law Proficiency without spending spirituality. ' +
      'If that free Objection succeeds, you recover 1 spent spirituality (maximum once per turn).</p>';
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
      name: 'Exploit Clause',
      description:
        '<p><strong>Baseline (2 Spirituality):</strong> Action. Declare one exploit ruling on an ongoing effect, condition, or environmental state you can perceive within 60 feet. Make a Spell Save contest against the effect owner (or affected creature if no owner). On success choose one verdict: <strong>Extend</strong> (increase remaining duration by 1 round, max once per effect), <strong>Curtail</strong> (reduce remaining duration by 1 round), or <strong>Suspend</strong> (effect is suppressed until start of your next turn, then resumes with remaining duration).</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> target one additional eligible effect or state within range.</li><li><strong>+2 Spirituality:</strong> Extend/Curtail changes become <strong>Potency</strong> rounds (minimum 2, maximum 4).</li><li><strong>+4 Spirituality:</strong> after a successful exploit, the affected target cannot reapply the same effect category until end of its next turn, and takes psychic damage equal to <strong>Potency</strong>.</li></ul><p><em>Counterplay:</em> effects without durations, legendary resistance, and anti-manipulation sanctums limit legal exploitation.</p><p><em>Corruption Hook:</em> if you exploit emergency protections for personal gain, gain 1 Corruption.</p>',
      img: 'icons/magic/symbols/question-stroke-yellow.webp',
      activationType: 'action',
      durationValue: '',
      durationUnits: 'inst',
      targetType: 'creature',
      targetCount: '1',
      targetSpecial: 'ongoing effect or state in legal scope',
      rangeUnits: 'ft',
      rangeValue: '60',
      rangeSpecial: '',
      school: 'enc',
      properties: ['vocal', 'somatic'],
      materials: 'a folded loophole brief annotated in black ink',
      identifier: 'lotm-lawyer-exploit-clause',
      activityId: 'lawyerSeq4Exploit01',
      now: now + 4,
      existing: existing1,
      sort: 1700500
    });

    const ability2 = buildAbilityDoc({
      id: ABILITY_2_ID,
      name: 'Bestowment Sentence',
      description:
        '<p><strong>Baseline (1 Spirituality):</strong> Action. Pronounce a binding sentence on one creature within 90 feet that can hear and understand you (Wisdom save). On failure, bestow one trait until end of its next turn: <strong>Avarice</strong> (cannot take Help and has disadvantage on Insight), <strong>Rashness</strong> (cannot Ready and has disadvantage on concentration checks), <strong>Sluggishness</strong> (speed -10 feet), <strong>Anxiety</strong> (first d20 roll each turn takes <strong>-1</strong>), or <strong>Relinquishment</strong> (cannot take reactions).</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> apply one additional trait to the same target, or sentence a second target (separate save).</li><li><strong>+2 Spirituality:</strong> duration becomes 1 minute (concentration, repeat save at end of each affected turn); numeric penalties become <strong>Potency</strong>.</li><li><strong>+4 Spirituality:</strong> on failed save, target also has disadvantage on its next attack roll and next saving throw before end of its next turn.</li></ul><p><em>Counterplay:</em> silence, language barriers, and condition immunity reduce sentence reliability.</p><p><em>Corruption Hook:</em> if you impose sentence traits on non-hostile civilians for convenience, gain 1 Corruption.</p>',
      img: 'icons/magic/control/debuff-energy-snare-purple-pink.webp',
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
      materials: 'a stamped sentencing strip',
      identifier: 'lotm-lawyer-bestowment-sentence',
      activityId: 'lawyerSeq4Bestow02',
      now: now + 5,
      existing: existing2,
      sort: 1700501
    });

    const ability3 = buildAbilityDoc({
      id: ABILITY_3_ID,
      name: 'Magnify Decree',
      description:
        '<p><strong>Baseline (2 Spirituality):</strong> Action. Issue one magnification decree on a visible interaction within 120 feet until start of your next turn. Choose one mode: <strong>Impact Magnification</strong> (next hit by chosen ally deals bonus damage equal to <strong>Potency</strong>), <strong>Constraint Magnification</strong> (next grapple/shove from chosen ally gains +<strong>Potency</strong> and 10-foot extra legal reach), or <strong>Hazard Magnification</strong> (one existing hazard/zone increases radius by 10 feet and save DC by +1).</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> choose two different magnification modes in the same declaration.</li><li><strong>+2 Spirituality:</strong> range becomes 180 feet; bonus damage and numeric modifiers increase by +2.</li><li><strong>+4 Spirituality:</strong> when a magnified effect lands, affected hostile creatures must make a Wisdom save or lose reactions until start of their next turn.</li></ul><p><em>Counterplay:</em> forced repositioning, line-of-sight denial, and anti-amplification wards limit decree impact.</p><p><em>Corruption Hook:</em> if you magnify collateral hazards despite clear allied risk, gain 1 Corruption.</p>',
      img: 'icons/magic/symbols/runes-carved-stone-yellow.webp',
      activationType: 'action',
      durationValue: '',
      durationUnits: 'inst',
      targetType: 'creature',
      targetCount: '1',
      targetSpecial: 'visible interaction in legal scope',
      rangeUnits: 'ft',
      rangeValue: '120',
      rangeSpecial: '',
      school: 'trs',
      properties: ['vocal', 'somatic', 'material'],
      materials: 'a brass magnifier marked with judicial glyphs',
      identifier: 'lotm-lawyer-magnify-decree',
      activityId: 'lawyerSeq4Magnify03',
      now: now + 6,
      existing: existing3,
      sort: 1700502
    });

    const ability4 = buildAbilityDoc({
      id: ABILITY_4_ID,
      name: 'Sovereign Disorder',
      description:
        '<p><strong>Baseline (3 Spirituality):</strong> Action. Establish a sovereign disorder field at a point within 120 feet for 1 minute (30-foot radius, concentration). Hostile creatures entering or starting in the area make a Wisdom save. On failure, choose two rulings until end of their turn: <strong>Lane Collapse</strong> (ranged attacks beyond 30 feet are at disadvantage), <strong>Step Drift</strong> (movement is difficult terrain and speed -10 feet), <strong>Procedure Break</strong> (first reaction each turn is lost).</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> radius becomes 40 feet, or you may reposition the field up to 20 feet at the start of your turns.</li><li><strong>+2 Spirituality:</strong> numeric penalties become <strong>Potency</strong>, and allies you designate ignore one chosen ruling.</li><li><strong>+4 Spirituality:</strong> once per round when a creature fails its save in the field, you may force it to reroll one successful attack or check made that turn and use the lower result.</li></ul><p><em>Counterplay:</em> teleportation, anti-field sanctification, and concentration disruption weaken sovereign disorder.</p><p><em>Corruption Hook:</em> if you sustain this field to indiscriminately collapse civilian order, gain 1 Corruption.</p>',
      img: 'icons/magic/control/debuff-aura-flame-ring-blue.webp',
      activationType: 'action',
      durationValue: '1',
      durationUnits: 'minute',
      targetType: 'radius',
      targetCount: '1',
      targetSpecial: '30-foot-radius sovereign disorder field',
      rangeUnits: 'ft',
      rangeValue: '120',
      rangeSpecial: '',
      school: 'ill',
      properties: ['vocal', 'somatic', 'material'],
      materials: 'a broken ceremonial gavel wrapped in black cord',
      identifier: 'lotm-lawyer-sovereign-disorder',
      activityId: 'lawyerSeq4Sovereign04',
      now: now + 7,
      existing: existing4,
      sort: 1700503
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
        {
          id: ABILITY_1_ID,
          grantedSequence: ability1.flags?.lotm?.grantedSequence ?? null,
          systemLevel: ability1.system?.level ?? null
        },
        {
          id: ABILITY_2_ID,
          grantedSequence: ability2.flags?.lotm?.grantedSequence ?? null,
          systemLevel: ability2.system?.level ?? null
        },
        {
          id: ABILITY_3_ID,
          grantedSequence: ability3.flags?.lotm?.grantedSequence ?? null,
          systemLevel: ability3.system?.level ?? null
        },
        {
          id: ABILITY_4_ID,
          grantedSequence: ability4.flags?.lotm?.grantedSequence ?? null,
          systemLevel: ability4.system?.level ?? null
        }
      ]
    }, null, 2));
  } finally {
    await pathwaysDb.close();
    await abilitiesDb.close();
  }
})();
