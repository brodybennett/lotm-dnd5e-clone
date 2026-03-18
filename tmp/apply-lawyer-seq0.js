const { ClassicLevel } = require('./node-tools/node_modules/classic-level');

const CORE_VERSION = '13.351';
const SYSTEM_ID = 'lotm';
const SYSTEM_VERSION = '5.2.6';
const MODIFIER = '0000000000000000';

const PATHWAY_NAME = 'Lawyer';
const PATHWAY_IDENTIFIER = 'lotm-lawyer';
const DEFAULT_PATHWAY_ID = 'lotmPathway00021';
const FOLDER_ID = 'F7OA4PBTMNaIeTZQ';

const LEGACY_A_KEY = '!items!lotmAbilityX2003'; // Authority Distortion (2+ sequences below)
const LEGACY_B_KEY = '!items!lotmAbilityX3004'; // Strata Overrule (2+ sequences below)

const ABILITY_1_ID = 'lotmAbilityX0001';
const ABILITY_2_ID = 'lotmAbilityX0002';
const ABILITY_3_ID = 'lotmAbilityX0003';
const ABILITY_4_ID = 'lotmAbilityX0004';

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
    const locatedPathway = await findPathwayByIdentifier(pathwaysDb, PATHWAY_IDENTIFIER);
    const pathwayId = locatedPathway?.doc?._id ?? DEFAULT_PATHWAY_ID;
    const pathwayKey = locatedPathway?.key ?? `!items!${pathwayId}`;
    const pathway = locatedPathway?.doc ?? (await getOptionalJson(pathwaysDb, pathwayKey));
    if (!pathway) {
      throw new Error(`Lawyer pathway (${pathwayKey}) not found. Sequence 9-1 package is required first.`);
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
      '<p><strong>Sequence 0 Package (Gain Budget +114):</strong> Autocrat Decree, Fundamental Distortion, Mausoleum Return, Order Cataclysm, plus two legacy upgrades (Authority Distortion and Strata Overrule).</p>' +
      '<p><strong>Pathway Completion:</strong> Authored through Sequence 0.</p>' +
      '<p><strong>Continuity Anchor:</strong> At Sequence 0 (Black Emperor), Lawyer authority culminates in Autocrat-level command over Order and Disorder, including world-rule distortion and mausoleum-backed persistence, while preserving verdict structure and explicit counterplay.</p>';
    pathway._stats = buildStats(now, pathway._stats);
    await pathwaysDb.put(pathwayKey, JSON.stringify(pathway));

    const folderKey = `!folders!${FOLDER_ID}`;
    const folder = await getOptionalJson(abilitiesDb, folderKey);
    if (!folder) {
      throw new Error(`Lawyer ability folder (${FOLDER_ID}) not found.`);
    }
    folder.name = PATHWAY_NAME;
    folder.description = 'Sequence abilities for the Lawyer pathway (authored through Sequence 0).';
    folder.flags = folder.flags ?? {};
    folder.flags.lotm = {
      ...(folder.flags.lotm ?? {}),
      pathwayIdentifier: PATHWAY_IDENTIFIER,
      latestAuthoredSequence: 0
    };
    folder._stats = buildStats(now + 1, folder._stats);
    await abilitiesDb.put(folderKey, JSON.stringify(folder));

    const legacyA = await getOptionalJson(abilitiesDb, LEGACY_A_KEY);
    const legacyB = await getOptionalJson(abilitiesDb, LEGACY_B_KEY);
    if (!legacyA) throw new Error('Legacy target lotmAbilityX2003 not found.');
    if (!legacyB) throw new Error('Legacy target lotmAbilityX3004 not found.');

    const legacyAHeader = '<h3>Legacy Upgrade (Sequence 0 - Potency)</h3>';
    const legacyAText =
      '<p>At Sequence 0, <strong>Authority Distortion</strong> gains world-rule potency. ' +
      'When you win the contest for Authority Distortion, you may distort one additional subordinate clause without an extra contest, and your distortion penalties/riders increase by <strong>Potency</strong>. ' +
      'If the target effect belongs to a non-Mythic source, the source cannot re-establish the same rule category until end of its next turn.</p>';
    const legacyADesc = String(legacyA.system?.description?.value ?? '');
    if (!legacyADesc.includes(legacyAHeader)) {
      legacyA.system.description.value = `${legacyADesc}${legacyAHeader}${legacyAText}`;
    }
    legacyA._stats = buildStats(now + 2, legacyA._stats);
    await abilitiesDb.put(LEGACY_A_KEY, JSON.stringify(legacyA));

    const legacyBHeader = '<h3>Legacy Upgrade (Sequence 0 - Scope)</h3>';
    const legacyBText =
      '<p>At Sequence 0, <strong>Strata Overrule</strong> expands from battlefield hierarchy into jurisdictional breadth. ' +
      'Its field may now anchor to any visible point within 150 feet instead of self-only, and demotion effects can propagate to one additional hostile creature within 10 feet of each failed target at half intensity (minimum 1). ' +
      'While this propagation is active, your Autocrat Decree can treat affected creatures as a single legal cluster for one extra sanction application.</p>';
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
      name: 'Autocrat Decree',
      description:
        '<p><strong>Baseline (6 Spirituality):</strong> Action. Pronounce an autocrat decree over up to <strong>Potency</strong> hostile creatures within 180 feet that can hear and understand you (Charisma save each). On failure, apply two sanctions until end of their next turn: <strong>Procedure Lock</strong> (no reactions and no bonus action), <strong>Jurisdiction Lock</strong> (speed halved and teleportation requires successful Charisma save), <strong>Verdict Suppression</strong> (first d20 roll each turn is made at disadvantage), or <strong>Privilege Revocation</strong> (cannot gain advantage from external effects).</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> increase target cap by 1 and range to 240 feet.</li><li><strong>+2 Spirituality:</strong> apply three sanctions instead of two, and failed targets do not repeat saves during the first round.</li><li><strong>+4 Spirituality:</strong> failed targets by 5+ also have one active beneficial effect suppressed until end of their next turn and take psychic damage equal to <strong>Potency x 2</strong>.</li></ul><p><em>Counterplay:</em> silence, legend-tier authority immunity, and effect-negation sanctums reduce decree reach.</p><p><em>Corruption Hook:</em> if you issue autocrat sanctions on non-hostile lawful dissent, gain 1 Corruption.</p>',
      img: 'icons/magic/control/energy-stream-link-large-teal.webp',
      activationType: 'action',
      durationValue: '',
      durationUnits: 'inst',
      targetType: 'creature',
      targetCount: '',
      targetSpecial: 'up to Potency hostile creatures that hear and understand you',
      rangeUnits: 'ft',
      rangeValue: '180',
      rangeSpecial: '',
      school: 'enc',
      properties: ['vocal', 'somatic', 'material'],
      materials: 'an imperial statute tablet engraved with four sanction clauses',
      identifier: 'lotm-lawyer-autocrat-decree',
      activityId: 'lawyerSeq0Autocrat01',
      now: now + 4,
      existing: existing1,
      sort: 1700900
    });

    const ability2 = buildAbilityDoc({
      id: ABILITY_2_ID,
      name: 'Fundamental Distortion',
      description:
        '<p><strong>Baseline (5 Spirituality):</strong> Reaction when a rule-creating effect, process, teleportation, or clause-bound action is declared within 240 feet. Contest your spell save against source DC. On success choose one distortion verdict: <strong>Opposition</strong> (declared outcome resolves as its closest legal opposite at half potency), <strong>Destination Twist</strong> (move origin/destination up to 30 feet), <strong>Temporal Deferral</strong> (effect delayed until start of source\'s next turn), or <strong>Clause Collapse</strong> (one rider of the effect is removed this turn).</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> apply one additional distortion verdict to the same trigger.</li><li><strong>+2 Spirituality:</strong> on contest failure, you still apply one reduced distortion (GM selects least invasive legal outcome); on success by 5+, source gains disadvantage on next same-category effect.</li><li><strong>+4 Spirituality:</strong> bank one distortion seal for 1 minute; as a free reaction, expend it to distort a second valid trigger this round without another contest.</li></ul><p><em>Counterplay:</em> immutable divine clauses, anti-countermeasure seals, and source-side contest bonuses can resist distortion.</p><p><em>Corruption Hook:</em> if you distort rescue logistics to preserve political order at cost of lives, gain 1 Corruption.</p>',
      img: 'icons/magic/symbols/runes-star-pentagon-orange-purple.webp',
      activationType: 'reaction',
      durationValue: '',
      durationUnits: 'inst',
      targetType: 'creature',
      targetCount: '1',
      targetSpecial: 'source of rule-creating effect/process',
      rangeUnits: 'ft',
      rangeValue: '240',
      rangeSpecial: '',
      school: 'abj',
      properties: ['vocal', 'somatic'],
      materials: 'a broken world-rule metronome',
      identifier: 'lotm-lawyer-fundamental-distortion',
      activityId: 'lawyerSeq0Distort02',
      now: now + 5,
      existing: existing2,
      sort: 1700901
    });

    const ability3 = buildAbilityDoc({
      id: ABILITY_3_ID,
      name: 'Mausoleum Return',
      description:
        '<p><strong>Baseline (4 Spirituality):</strong> Bonus Action. Establish one mausoleum return seal on yourself for 24 hours (max 1 active baseline seal). If you would drop to 0 HP or fail a death-saving sequence, seal triggers instead: you remain at 1 HP, then regain HP equal to <strong>Potency x 6</strong>, end one charmed/frightened/restrained condition, and may stand without using movement. After trigger, this seal ends.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> place a reduced return seal on one willing creature within 60 feet (heals Potency x 3 on trigger).</li><li><strong>+2 Spirituality:</strong> maintain up to two active self-seals; if one triggers, gain resistance to all damage until end of your next turn.</li><li><strong>+4 Spirituality:</strong> when a self-seal triggers, emit a 30-foot verdict pulse; hostile creatures make Wisdom save or lose reactions and take psychic damage equal to <strong>Potency</strong>.</li></ul><p><em>Counterplay:</em> seal-suppression effects, anti-resurrection zones, and pre-emptive banishment can block return triggers.</p><p><em>Corruption Hook:</em> if you repeatedly gamble allies\' lives because your own return is secured, gain 1 Corruption.</p>',
      img: 'icons/magic/life/heart-area-circle-red-green.webp',
      activationType: 'bonus',
      durationValue: '24',
      durationUnits: 'hour',
      targetType: 'self',
      targetCount: '1',
      targetSpecial: 'self, optional willing ally for reduced seal',
      rangeUnits: 'self',
      rangeValue: '',
      rangeSpecial: '',
      school: 'nec',
      properties: ['vocal', 'material'],
      materials: 'a mausoleum key etched with a return verdict',
      identifier: 'lotm-lawyer-mausoleum-return',
      activityId: 'lawyerSeq0Maus03',
      now: now + 6,
      existing: existing3,
      sort: 1700902
    });

    const ability4 = buildAbilityDoc({
      id: ABILITY_4_ID,
      name: 'Order Cataclysm',
      description:
        '<p><strong>Baseline (5 Spirituality):</strong> Action. Establish an order-cataclysm domain centered on a point within 180 feet for 1 minute (40-foot radius, concentration). Hostile creatures entering or starting in the domain make a Wisdom save. On failure, choose two cataclysm rulings until end of their turn: <strong>Command Rupture</strong> (cannot use command/aura riders), <strong>Distance Collapse</strong> (all ranges are treated as 20 feet shorter for that creature, minimum self), <strong>Process Disorder</strong> (first action each turn resolves after all other creatures this round), <strong>Identity Drift</strong> (cannot benefit from tags/keywords such as ally, summon, marked, or protected).</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> radius becomes 60 feet, or you may move the domain up to 20 feet at start of each turn.</li><li><strong>+2 Spirituality:</strong> apply three rulings instead of two, and designated allies ignore one chosen ruling.</li><li><strong>+4 Spirituality:</strong> once per round when a creature fails in the domain, you may force it to reroll one successful roll made that turn and use the lower result; it then takes psychic damage equal to <strong>Potency</strong>.</li></ul><p><em>Counterplay:</em> anti-domain sanctification, forced movement, and concentration disruption can break cataclysm control.</p><p><em>Corruption Hook:</em> if you sustain cataclysm where civilian order collapse is avoidable, gain 1 Corruption.</p>',
      img: 'icons/magic/control/debuff-energy-hold-levitate-purple.webp',
      activationType: 'action',
      durationValue: '1',
      durationUnits: 'minute',
      targetType: 'radius',
      targetCount: '1',
      targetSpecial: '40-foot-radius order-cataclysm domain',
      rangeUnits: 'ft',
      rangeValue: '180',
      rangeSpecial: '',
      school: 'ill',
      properties: ['vocal', 'somatic', 'material'],
      materials: 'a split crown seal and a black judgment chain',
      identifier: 'lotm-lawyer-order-cataclysm',
      activityId: 'lawyerSeq0Cataclysm04',
      now: now + 7,
      existing: existing4,
      sort: 1700903
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
