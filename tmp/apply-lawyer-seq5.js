const { ClassicLevel } = require('./node-tools/node_modules/classic-level');

const CORE_VERSION = '13.351';
const SYSTEM_ID = 'lotm';
const SYSTEM_VERSION = '5.2.6';
const MODIFIER = '0000000000000000';

const PATHWAY_NAME = 'Lawyer';
const PATHWAY_IDENTIFIER = 'lotm-lawyer';
const DEFAULT_PATHWAY_ID = 'lotmPathway00021';
const FOLDER_ID = 'F7OA4PBTMNaIeTZQ';

const LEGACY_A_KEY = '!items!lotmAbilityX9001'; // Law Proficiency (2+ sequences below)
const LEGACY_B_KEY = '!items!lotmAbilityX7001'; // Bribery (2+ sequences below)

const ABILITY_1_ID = 'lotmAbilityX5001';
const ABILITY_2_ID = 'lotmAbilityX5002';
const ABILITY_3_ID = 'lotmAbilityX5003';

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
      level: 4,
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
        grantedSequence: 5
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
      throw new Error(`Lawyer pathway (${pathwayKey}) not found. Sequence 9-6 package is required first.`);
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
      '<p><strong>Sequence 4-0 Status:</strong> Pending authoring in later sequence-focused runs.</p>' +
      '<p><strong>Continuity Anchor:</strong> At Sequence 5 (Mentor of Disorder), Lawyer authority escalates from single-clause distortion to scene-wide disruption of perception, distance, and control timing while retaining explicit judgment language and adjudication structure.</p>';
    pathway._stats = buildStats(now, pathway._stats);
    await pathwaysDb.put(pathwayKey, JSON.stringify(pathway));

    const folderKey = `!folders!${FOLDER_ID}`;
    const folder = await getOptionalJson(abilitiesDb, folderKey);
    if (!folder) {
      throw new Error(`Lawyer ability folder (${FOLDER_ID}) not found.`);
    }
    folder.name = PATHWAY_NAME;
    folder.description = 'Sequence abilities for the Lawyer pathway (authored through Sequence 5).';
    folder.flags = folder.flags ?? {};
    folder.flags.lotm = {
      ...(folder.flags.lotm ?? {}),
      pathwayIdentifier: PATHWAY_IDENTIFIER,
      latestAuthoredSequence: 5
    };
    folder._stats = buildStats(now + 1, folder._stats);
    await abilitiesDb.put(folderKey, JSON.stringify(folder));

    const legacyA = await getOptionalJson(abilitiesDb, LEGACY_A_KEY);
    const legacyB = await getOptionalJson(abilitiesDb, LEGACY_B_KEY);
    if (!legacyA) throw new Error('Legacy target lotmAbilityX9001 not found.');
    if (!legacyB) throw new Error('Legacy target lotmAbilityX7001 not found.');

    const legacyAHeader = '<h3>Legacy Upgrade (Sequence 5 - Potency)</h3>';
    const legacyAText =
      '<p>At Sequence 5, <strong>Law Proficiency</strong> gains high-pressure sentence force in disordered arenas. ' +
      'When your Objection targets a creature currently affected by Disorder Judgment or Distance Misrule, your numeric Objection values increase by <strong>Potency</strong> once per round. ' +
      'If that modified Objection causes a failed roll/check/save, the target also has disadvantage on its next action-order-sensitive check (initiative rerolls, Ready triggers, or contested control timing) before end of its next turn.</p>';
    const legacyADesc = String(legacyA.system?.description?.value ?? '');
    if (!legacyADesc.includes(legacyAHeader)) {
      legacyA.system.description.value = `${legacyADesc}${legacyAHeader}${legacyAText}`;
    }
    legacyA._stats = buildStats(now + 2, legacyA._stats);
    await abilitiesDb.put(LEGACY_A_KEY, JSON.stringify(legacyA));

    const legacyBHeader = '<h3>Legacy Upgrade (Sequence 5 - Scope)</h3>';
    const legacyBText =
      '<p>At Sequence 5, <strong>Bribery</strong> expands from target-level influence into procedural spillover. ' +
      'When a creature fails Bribery while in your Disorder Judgment or Distance Misrule effects, one additional hostile creature within 15 feet of that target must make a Wisdom save or suffer the same mode at half intensity (minimum 1 for numeric penalties, duration until end of its next turn). ' +
      'For Connection mode, you may maintain two relationship markers simultaneously while this spillover condition is active.</p>';
    const legacyBDesc = String(legacyB.system?.description?.value ?? '');
    if (!legacyBDesc.includes(legacyBHeader)) {
      legacyB.system.description.value = `${legacyBDesc}${legacyBHeader}${legacyBText}`;
    }
    legacyB._stats = buildStats(now + 3, legacyB._stats);
    await abilitiesDb.put(LEGACY_B_KEY, JSON.stringify(legacyB));

    const existing1 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_1_ID}`);
    const existing2 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_2_ID}`);
    const existing3 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_3_ID}`);

    const ability1 = buildAbilityDoc({
      id: ABILITY_1_ID,
      name: 'Disorder Judgment',
      description:
        '<p><strong>Baseline (1 Spirituality):</strong> Action. Issue one disorder ruling against a creature within 60 feet that can hear and understand you (Wisdom save). On failure, choose one judgment package until end of its next turn: <strong>Perception Disorder</strong> (disadvantage on Perception/Insight/Investigation), <strong>Distance Disorder</strong> (its melee reach is treated as 5 feet shorter and ranged attacks count targets as 10 feet farther), or <strong>Control Disorder</strong> (first shove/grapple/forced-move attempt each turn takes a <strong>-1</strong> penalty).</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> target one additional creature (separate save), or increase range to 120 feet.</li><li><strong>+2 Spirituality:</strong> duration becomes 1 minute (concentration, repeat save at end of each affected turn), and numeric penalties become <strong>Potency</strong>.</li><li><strong>+4 Spirituality:</strong> when a failed target attempts an action tied to its disordered package, it takes psychic damage equal to <strong>Potency</strong> and loses reactions until start of its next turn.</li></ul><p><em>Counterplay:</em> language denial, high-Wisdom targets, and anti-compulsion wards weaken disorder rulings.</p><p><em>Corruption Hook:</em> if you knowingly disorder emergency commands to cause collateral panic, gain 1 Corruption.</p>',
      img: 'icons/magic/control/debuff-energy-hold-pink.webp',
      activationType: 'action',
      durationValue: '',
      durationUnits: 'inst',
      targetType: 'creature',
      targetCount: '1',
      targetSpecial: 'creature that can hear and understand you',
      rangeUnits: 'ft',
      rangeValue: '60',
      rangeSpecial: '',
      school: 'enc',
      properties: ['vocal', 'somatic'],
      materials: 'a split ruling seal and chalked clause card',
      identifier: 'lotm-lawyer-disorder-judgment',
      activityId: 'lawyerSeq5Disorder01',
      now: now + 4,
      existing: existing1,
      sort: 1700400
    });

    const ability2 = buildAbilityDoc({
      id: ABILITY_2_ID,
      name: 'Distance Misrule',
      description:
        '<p><strong>Baseline (1 Spirituality):</strong> Action. Declare a misrule zone centered on a point within 90 feet for 1 minute (20-foot radius, concentration). Hostile creatures in the zone treat all measured distances as distorted: movement planning, attack lanes, and line-math become unstable. The first time each turn a hostile creature in the zone makes an attack roll or contested positioning check, it suffers <strong>-1</strong> and cannot benefit from the Help action for that roll.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> zone radius becomes 30 feet, or you place a second 10-foot-radius misrule zone within 30 feet of the first.</li><li><strong>+2 Spirituality:</strong> penalties become <strong>Potency</strong>, and chosen allies ignore all penalties from your misrule zones.</li><li><strong>+4 Spirituality:</strong> creatures that fail a Wisdom save when entering or starting in the zone have speed halved until end of their turn and cannot take reactions during that turn.</li></ul><p><em>Counterplay:</em> teleportation, forced relocation, and anti-zone sanctification reduce distance disorder pressure.</p><p><em>Corruption Hook:</em> if you deploy misrule zones in civilian evacuation lanes for tactical convenience, gain 1 Corruption.</p>',
      img: 'icons/magic/symbols/runes-star-pentagon-orange-purple.webp',
      activationType: 'action',
      durationValue: '1',
      durationUnits: 'minute',
      targetType: 'radius',
      targetCount: '1',
      targetSpecial: '20-foot-radius zone',
      rangeUnits: 'ft',
      rangeValue: '90',
      rangeSpecial: '',
      school: 'ill',
      properties: ['vocal', 'somatic', 'material'],
      materials: 'three cracked measuring rings tied with cord',
      identifier: 'lotm-lawyer-distance-misrule',
      activityId: 'lawyerSeq5Distance02',
      now: now + 5,
      existing: existing2,
      sort: 1700401
    });

    const ability3 = buildAbilityDoc({
      id: ABILITY_3_ID,
      name: 'Procedural Misorder',
      description:
        '<p><strong>Baseline (0 Spirituality):</strong> Reaction when a creature within 60 feet attempts a control-forward action (shove, grapple, forced movement, restraint, command/charm/fear rider, or Help action to set those up). The creature makes a Charisma save. On failure, choose one ruling: <strong>Step Inversion</strong> (its bonus action and reaction are lost until start of its next turn), or <strong>Priority Penalty</strong> (apply <strong>-1</strong> to the triggering roll/DC and grant one target of that effect <strong>+1</strong> on its opposed roll/save).</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> you may trigger this reaction one additional time before your next turn against a different creature.</li><li><strong>+2 Spirituality:</strong> numeric modifiers become <strong>Potency</strong>, and failed creatures have speed reduced by 10 feet until end of their next turn.</li><li><strong>+4 Spirituality:</strong> if the triggering action fails after your ruling, the creature cannot repeat that same control category until end of its next turn and takes psychic damage equal to <strong>Potency</strong>.</li></ul><p><em>Counterplay:</em> action types outside listed control categories and reaction denial effects reduce procedural interruption value.</p><p><em>Corruption Hook:</em> if you repeatedly weaponize misorder rulings to sabotage allies rather than enemies, gain 1 Corruption.</p>',
      img: 'icons/magic/control/debuff-chains-ropes-red.webp',
      activationType: 'reaction',
      durationValue: '',
      durationUnits: 'inst',
      targetType: 'creature',
      targetCount: '1',
      targetSpecial: 'creature attempting a control-forward action',
      rangeUnits: 'ft',
      rangeValue: '60',
      rangeSpecial: '',
      school: 'abj',
      properties: ['vocal'],
      materials: 'a docket tab marked out of order',
      identifier: 'lotm-lawyer-procedural-misorder',
      activityId: 'lawyerSeq5Procedure03',
      now: now + 6,
      existing: existing3,
      sort: 1700402
    });

    await abilitiesDb.put(`!items!${ABILITY_1_ID}`, JSON.stringify(ability1));
    await abilitiesDb.put(`!items!${ABILITY_2_ID}`, JSON.stringify(ability2));
    await abilitiesDb.put(`!items!${ABILITY_3_ID}`, JSON.stringify(ability3));

    console.log(JSON.stringify({
      pathwayWritten: pathwayKey,
      folderWritten: folderKey,
      legacyUpdated: [LEGACY_A_KEY, LEGACY_B_KEY],
      abilitiesWritten: [`!items!${ABILITY_1_ID}`, `!items!${ABILITY_2_ID}`, `!items!${ABILITY_3_ID}`],
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
        }
      ]
    }, null, 2));
  } finally {
    await pathwaysDb.close();
    await abilitiesDb.close();
  }
})();
