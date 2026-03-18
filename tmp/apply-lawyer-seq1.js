const { ClassicLevel } = require('./node-tools/node_modules/classic-level');

const CORE_VERSION = '13.351';
const SYSTEM_ID = 'lotm';
const SYSTEM_VERSION = '5.2.6';
const MODIFIER = '0000000000000000';

const PATHWAY_NAME = 'Lawyer';
const PATHWAY_IDENTIFIER = 'lotm-lawyer';
const DEFAULT_PATHWAY_ID = 'lotmPathway00021';
const FOLDER_ID = 'F7OA4PBTMNaIeTZQ';

const LEGACY_A_KEY = '!items!lotmAbilityX3001'; // Superior Mandate (2+ sequences below)
const LEGACY_B_KEY = '!items!lotmAbilityX4001'; // Exploit Clause (2+ sequences below)

const ABILITY_1_ID = 'lotmAbilityX1001';
const ABILITY_2_ID = 'lotmAbilityX1002';
const ABILITY_3_ID = 'lotmAbilityX1003';
const ABILITY_4_ID = 'lotmAbilityX1004';

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
    const locatedPathway = await findPathwayByIdentifier(pathwaysDb, PATHWAY_IDENTIFIER);
    const pathwayId = locatedPathway?.doc?._id ?? DEFAULT_PATHWAY_ID;
    const pathwayKey = locatedPathway?.key ?? `!items!${pathwayId}`;
    const pathway = locatedPathway?.doc ?? (await getOptionalJson(pathwaysDb, pathwayKey));
    if (!pathway) {
      throw new Error(`Lawyer pathway (${pathwayKey}) not found. Sequence 9-2 package is required first.`);
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
      '<p><strong>Sequence 1 Package (Gain Budget +74):</strong> Abolition Edict, Definition Override, Mausoleum Exclusion, Order Repeal, plus two legacy upgrades (Superior Mandate and Exploit Clause).</p>' +
      '<p><strong>Sequence 0 Status:</strong> Pending authoring in later sequence-focused runs.</p>' +
      '<p><strong>Continuity Anchor:</strong> At Sequence 1 (Prince of Abolition), Lawyer rulings cross into authority-level definition and distortion of order itself, while preserving explicit verdict structure, counterplay hooks, and corruption accountability.</p>';
    pathway._stats = buildStats(now, pathway._stats);
    await pathwaysDb.put(pathwayKey, JSON.stringify(pathway));

    const folderKey = `!folders!${FOLDER_ID}`;
    const folder = await getOptionalJson(abilitiesDb, folderKey);
    if (!folder) {
      throw new Error(`Lawyer ability folder (${FOLDER_ID}) not found.`);
    }
    folder.name = PATHWAY_NAME;
    folder.description = 'Sequence abilities for the Lawyer pathway (authored through Sequence 1).';
    folder.flags = folder.flags ?? {};
    folder.flags.lotm = {
      ...(folder.flags.lotm ?? {}),
      pathwayIdentifier: PATHWAY_IDENTIFIER,
      latestAuthoredSequence: 1
    };
    folder._stats = buildStats(now + 1, folder._stats);
    await abilitiesDb.put(folderKey, JSON.stringify(folder));

    const legacyA = await getOptionalJson(abilitiesDb, LEGACY_A_KEY);
    const legacyB = await getOptionalJson(abilitiesDb, LEGACY_B_KEY);
    if (!legacyA) throw new Error('Legacy target lotmAbilityX3001 not found.');
    if (!legacyB) throw new Error('Legacy target lotmAbilityX4001 not found.');

    const legacyAHeader = '<h3>Legacy Upgrade (Sequence 1 - Potency)</h3>';
    const legacyAText =
      '<p>At Sequence 1, <strong>Superior Mandate</strong> gains abolition-grade authority pressure. ' +
      'When a target fails Superior Mandate, you may apply one additional mandate rider from the same casting without another save. ' +
      'If the target is under your Definition Override or Order Repeal, all numeric penalties from Superior Mandate increase by <strong>Potency</strong> and the target cannot gain advantage against your pathway effects until end of its next turn.</p>';
    const legacyADesc = String(legacyA.system?.description?.value ?? '');
    if (!legacyADesc.includes(legacyAHeader)) {
      legacyA.system.description.value = `${legacyADesc}${legacyAHeader}${legacyAText}`;
    }
    legacyA._stats = buildStats(now + 2, legacyA._stats);
    await abilitiesDb.put(LEGACY_A_KEY, JSON.stringify(legacyA));

    const legacyBHeader = '<h3>Legacy Upgrade (Sequence 1 - Efficiency)</h3>';
    const legacyBText =
      '<p>At Sequence 1, <strong>Exploit Clause</strong> becomes rapid to prosecute in abolition domains. ' +
      'Once per round, if you successfully cast Abolition Edict or Authority Distortion, you may cast Exploit Clause as a free rider with 1 less spirituality cost (minimum 0) and no material component. ' +
      'If this free rider succeeds, you may immediately move up to 15 feet and ignore opportunity attacks triggered by that movement.</p>';
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
      name: 'Abolition Edict',
      description:
        '<p><strong>Baseline (4 Spirituality):</strong> Action. Issue an abolition edict to one creature within 120 feet that can hear and understand you (Charisma save). On failure, choose one category to abolish until end of its next turn: <strong>Defensive Routine</strong> (cannot gain resistance, temp HP, or damage reduction), <strong>Mobility Privilege</strong> (speed set to 0 and no teleport), or <strong>Special Procedure</strong> (cannot activate class/pathway feature that requires an action cost greater than a basic attack).</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> affect one additional target (separate save) or increase range to 180 feet.</li><li><strong>+2 Spirituality:</strong> duration becomes 1 minute (concentration, repeat save at end of each affected turn); if target succeeds a repeat save, one abolished category remains suppressed until start of its next turn.</li><li><strong>+4 Spirituality:</strong> on failed save by 5+, target also loses reactions and bonus action until start of its next turn; on success it still takes psychic damage equal to <strong>Potency</strong>.</li></ul><p><em>Counterplay:</em> silence, legend-tier authority immunity, and anti-verdict wards reduce edict reliability.</p><p><em>Corruption Hook:</em> if you abolish critical protections that keep innocents alive, gain 1 Corruption.</p>',
      img: 'icons/magic/control/debuff-aura-flame-red.webp',
      activationType: 'action',
      durationValue: '',
      durationUnits: 'inst',
      targetType: 'creature',
      targetCount: '1',
      targetSpecial: 'creature that can hear and understand you',
      rangeUnits: 'ft',
      rangeValue: '120',
      rangeSpecial: '',
      school: 'enc',
      properties: ['vocal', 'somatic'],
      materials: 'a torn sovereign proclamation sealed in black wax',
      identifier: 'lotm-lawyer-abolition-edict',
      activityId: 'lawyerSeq1Abolish01',
      now: now + 4,
      existing: existing1,
      sort: 1700800
    });

    const ability2 = buildAbilityDoc({
      id: ABILITY_2_ID,
      name: 'Definition Override',
      description:
        '<p><strong>Baseline (3 Spirituality):</strong> Bonus Action. Redefine one legal relation within 90 feet for 1 minute (concentration). Choose one clause: <strong>Substitute</strong> (designate a proxy creature; first qualifying single-target effect each round aimed at you is redirected to proxy, proxy gets save with disadvantage), <strong>Corruption Label</strong> (designated hostile target counts as corrupted for your pathway riders and takes <strong>-1</strong> on saves against them), or <strong>Bribery Definition</strong> (a target action you name is treated as bribe-tainted and cannot grant advantage).</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> maintain one additional definition clause simultaneously.</li><li><strong>+2 Spirituality:</strong> save penalties and rider values become <strong>Potency</strong>; range becomes 120 feet.</li><li><strong>+4 Spirituality:</strong> when an overridden definition blocks a hostile effect, the source takes psychic damage equal to <strong>Potency</strong> and cannot repeat the same effect category until end of its next turn.</li></ul><p><em>Counterplay:</em> immutable-rule effects and anti-definition seals can invalidate override clauses.</p><p><em>Corruption Hook:</em> if you redefine guilt categories to protect actual perpetrators, gain 1 Corruption.</p>',
      img: 'icons/magic/symbols/symbol-lightning-bolt.webp',
      activationType: 'bonus',
      durationValue: '1',
      durationUnits: 'minute',
      targetType: 'creature',
      targetCount: '1',
      targetSpecial: 'legal relation target in line of effect',
      rangeUnits: 'ft',
      rangeValue: '90',
      rangeSpecial: '',
      school: 'abj',
      properties: ['vocal', 'material'],
      materials: 'a dual-sided definition tablet with erasable ink',
      identifier: 'lotm-lawyer-definition-override',
      activityId: 'lawyerSeq1Define02',
      now: now + 5,
      existing: existing2,
      sort: 1700801
    });

    const ability3 = buildAbilityDoc({
      id: ABILITY_3_ID,
      name: 'Mausoleum Exclusion',
      description:
        '<p><strong>Baseline (4 Spirituality):</strong> Action. Distort and isolate a 20-foot-radius area within 120 feet for 1 minute (concentration). The area is partially excluded from normal world interaction: hostile creatures treat it as difficult terrain, ranged attacks crossing the boundary suffer disadvantage, and teleport/phase effects that cross in or out require a Charisma save or fail.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> radius becomes 30 feet, or move the isolated area up to 15 feet at start of your turn.</li><li><strong>+2 Spirituality:</strong> allied creatures you designate ignore movement penalties and gain +<strong>Potency</strong> to saves against hostile control effects while inside.</li><li><strong>+4 Spirituality:</strong> when a hostile creature fails to cross or teleport through the boundary, it loses reactions and takes psychic damage equal to <strong>Potency</strong>.</li></ul><p><em>Counterplay:</em> world-anchor effects, anti-distortion domains, and concentration disruption collapse the exclusion zone.</p><p><em>Corruption Hook:</em> if you trap civilians in exclusion zones for strategic leverage, gain 1 Corruption.</p>',
      img: 'icons/magic/control/debuff-barrier-shield-dome.webp',
      activationType: 'action',
      durationValue: '1',
      durationUnits: 'minute',
      targetType: 'radius',
      targetCount: '1',
      targetSpecial: '20-foot-radius isolated zone',
      rangeUnits: 'ft',
      rangeValue: '120',
      rangeSpecial: '',
      school: 'ill',
      properties: ['vocal', 'somatic', 'material'],
      materials: 'a miniature mausoleum arch etched with sequence runes',
      identifier: 'lotm-lawyer-mausoleum-exclusion',
      activityId: 'lawyerSeq1Maus03',
      now: now + 6,
      existing: existing3,
      sort: 1700802
    });

    const ability4 = buildAbilityDoc({
      id: ABILITY_4_ID,
      name: 'Order Repeal',
      description:
        '<p><strong>Baseline (3 Spirituality):</strong> Reaction when a creature within 150 feet declares a rule-backed action, aura, or condition rider. Contest your spell save against source DC. On success, repeal one applicable clause: <strong>Effect Null</strong> (primary rider suppressed until end of source\'s turn), <strong>Process Inversion</strong> (action resolves as a reduced opposite outcome at GM-defined half potency), or <strong>Jurisdiction Seizure</strong> (you choose a new legal target among eligible creatures in range).</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> apply two repeal clauses on the same trigger.</li><li><strong>+2 Spirituality:</strong> on success, source gains disadvantage on the next check/save tied to this rule category before end of its next turn; penalty magnitude becomes <strong>Potency</strong>.</li><li><strong>+4 Spirituality:</strong> if your contest exceeds source by 5+, you may bank one repeal seal for 1 minute and trigger it later as a free reaction on another valid rule-backed action.</li></ul><p><em>Counterplay:</em> immutable divine clauses, anti-counterspell seals, and contest advantage can defeat repeal attempts.</p><p><em>Corruption Hook:</em> if you repeatedly repeal due process to secure personal authority, gain 1 Corruption.</p>',
      img: 'icons/magic/symbols/ring-circle-smoke-blue.webp',
      activationType: 'reaction',
      durationValue: '',
      durationUnits: 'inst',
      targetType: 'creature',
      targetCount: '1',
      targetSpecial: 'source of a rule-backed action/effect',
      rangeUnits: 'ft',
      rangeValue: '150',
      rangeSpecial: '',
      school: 'abj',
      properties: ['vocal', 'somatic'],
      materials: 'a repealed statute ribbon burned at one end',
      identifier: 'lotm-lawyer-order-repeal',
      activityId: 'lawyerSeq1Repeal04',
      now: now + 7,
      existing: existing4,
      sort: 1700803
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
