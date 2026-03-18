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
const LEGACY_B_KEY = '!items!lotmAbilityX7001'; // Bribery

const ABILITY_1_ID = 'lotmAbilityX6001';
const ABILITY_2_ID = 'lotmAbilityX6002';
const ABILITY_3_ID = 'lotmAbilityX6003';

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
      level: 3,
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
        grantedSequence: 6
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
      throw new Error(`Lawyer pathway (${pathwayKey}) not found. Sequence 9-7 package is required first.`);
    }

    pathway.system = pathway.system ?? {};
    pathway.system.description = pathway.system.description ?? { value: '', chat: '' };
    pathway.system.description.value =
      '<p><strong>Pathway Vector:</strong> impartial adjudication through precise rhetoric, loophole analysis, and order-backed injunctions that constrain hostile conduct.</p>' +
      '<p><strong>Sequence 9 Package (Total Budget 2):</strong> Law Proficiency, Order Citation.</p>' +
      '<p><strong>Sequence 8 Package (Gain Budget +3):</strong> Rulebreaker Physique, Verdict Compulsion, plus one legacy scope upgrade to Law Proficiency.</p>' +
      '<p><strong>Sequence 7 Package (Gain Budget +13):</strong> Bribery, Indebted Network, Liability Transfer, plus two legacy upgrades (Law Proficiency and Verdict Compulsion).</p>' +
      '<p><strong>Sequence 6 Package (Gain Budget +9):</strong> Distortion Decree, Corrosion Sentence, Weakness Deposition, plus two legacy upgrades (Law Proficiency and Bribery).</p>' +
      '<p><strong>Sequence 5-0 Status:</strong> Pending authoring in later sequence-focused runs.</p>' +
      '<p><strong>Continuity Anchor:</strong> At Sequence 6 (Baron of Corruption), Lawyer authority expands into direct distortion of intent and corrosive legal pressure while preserving explicit verdict structure and evidentiary framing.</p>';
    pathway._stats = buildStats(now, pathway._stats);
    await pathwaysDb.put(pathwayKey, JSON.stringify(pathway));

    const folderKey = `!folders!${FOLDER_ID}`;
    const folder = await getOptionalJson(abilitiesDb, folderKey);
    if (!folder) {
      throw new Error(`Lawyer ability folder (${FOLDER_ID}) not found.`);
    }
    folder.name = PATHWAY_NAME;
    folder.description = 'Sequence abilities for the Lawyer pathway (authored through Sequence 6).';
    folder.flags = folder.flags ?? {};
    folder.flags.lotm = {
      ...(folder.flags.lotm ?? {}),
      pathwayIdentifier: PATHWAY_IDENTIFIER,
      latestAuthoredSequence: 6
    };
    folder._stats = buildStats(now + 1, folder._stats);
    await abilitiesDb.put(folderKey, JSON.stringify(folder));

    const legacyA = await getOptionalJson(abilitiesDb, LEGACY_A_KEY);
    const legacyB = await getOptionalJson(abilitiesDb, LEGACY_B_KEY);
    if (!legacyA) throw new Error('Legacy target lotmAbilityX9001 not found.');
    if (!legacyB) throw new Error('Legacy target lotmAbilityX7001 not found.');

    const legacyAHeader = '<h3>Legacy Upgrade (Sequence 6 - Scope)</h3>';
    const legacyAText =
      '<p>At Sequence 6, <strong>Law Proficiency</strong> can formally tag one active distortion as a docketed case. ' +
      'When a creature is affected by your <strong>Distortion Decree</strong>, your Objection may target that distorted clause from up to 120 feet regardless of your normal declared-process range. ' +
      'On the first successful Objection against a docketed case each round, you may apply both branches of Objection (ally bonus and violator penalty) instead of choosing one.</p>';
    const legacyADesc = String(legacyA.system?.description?.value ?? '');
    if (!legacyADesc.includes(legacyAHeader)) {
      legacyA.system.description.value = `${legacyADesc}${legacyAHeader}${legacyAText}`;
    }
    legacyA._stats = buildStats(now + 2, legacyA._stats);
    await abilitiesDb.put(LEGACY_A_KEY, JSON.stringify(legacyA));

    const legacyBHeader = '<h3>Legacy Upgrade (Sequence 6 - Efficiency)</h3>';
    const legacyBText =
      '<p>At Sequence 6, <strong>Bribery</strong> capitalizes on distorted proceedings. ' +
      'Once per round, if your Bribery targets a creature currently under Distortion Decree or Corrosion Sentence, reduce one upcast surcharge on Bribery by 1 (minimum 0). ' +
      'If you choose Connection mode under this condition, you may move the relationship marker to another valid creature within 30 feet of the original target as a bonus action without a new save.</p>';
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
      name: 'Distortion Decree',
      description:
        '<p><strong>Baseline (1 Spirituality):</strong> Action. Declare one explicit rule-clause and target one creature within 60 feet that can hear and understand you; it makes a Charisma save. On failure, choose one distortion package until end of its next turn: <strong>Movement Distortion</strong> (its first move must end at least 10 feet farther from a named lane/object if possible), <strong>Intent Distortion</strong> (first hostile roll against a named target is at disadvantage), or <strong>Procedure Distortion</strong> (first item/feature use against your named clause fizzles, consuming the action).</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> affect one additional creature (separate save), or increase range to 120 feet.</li><li><strong>+2 Spirituality:</strong> duration becomes 1 minute (concentration, repeat save at end of each affected turn).</li><li><strong>+4 Spirituality:</strong> if an affected creature violates or resists the distorted clause, it takes psychic damage equal to <strong>Potency</strong> and loses reactions until start of its next turn.</li></ul><p><em>Counterplay:</em> language denial, anti-compulsion wards, and chaotic action selection reduce distortion reliability.</p><p><em>Corruption Hook:</em> if you distort testimony to convict knowingly innocent targets, gain 1 Corruption.</p>',
      img: 'icons/magic/control/debuff-energy-hold-purple.webp',
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
      materials: 'a folded decree slip marked with crossed clauses',
      identifier: 'lotm-lawyer-distortion-decree',
      activityId: 'lawyerSeq6Distort01',
      now: now + 4,
      existing: existing1,
      sort: 1700300
    });

    const ability2 = buildAbilityDoc({
      id: ABILITY_2_ID,
      name: 'Corrosion Sentence',
      description:
        '<p><strong>Baseline (1 Spirituality):</strong> Action. Establish a 15-foot-radius sentence zone at a point within 60 feet for 1 minute (concentration). Hostile creatures that start their turn in the zone or enter it make a Constitution save. On failure, they gain one corrosion mark until end of their next turn: <strong>-1</strong> to attack rolls and ability checks tied to forceful actions (shove, grapple, break, cast with somatic strain).</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> increase zone radius to 20 feet, or create a second 10-foot-radius zone within 30 feet of the first.</li><li><strong>+2 Spirituality:</strong> numeric penalties become <strong>Potency</strong>, and failed targets cannot benefit from the Help action while marked.</li><li><strong>+4 Spirituality:</strong> failed targets also take necrotic damage equal to <strong>Potency</strong> at the start of their next turn and cannot gain temporary HP until then.</li></ul><p><em>Counterplay:</em> high-Constitution enemies, forced relocation, and anti-necrotic sanctification reduce zone pressure.</p><p><em>Corruption Hook:</em> if you impose corrosion penalties on civilians to stage compliance tests, gain 1 Corruption.</p>',
      img: 'icons/magic/death/acid-bubble-corrosion-green.webp',
      activationType: 'action',
      durationValue: '1',
      durationUnits: 'minute',
      targetType: 'radius',
      targetCount: '1',
      targetSpecial: '15-foot-radius zone',
      rangeUnits: 'ft',
      rangeValue: '60',
      rangeSpecial: '',
      school: 'nec',
      properties: ['vocal', 'somatic', 'material'],
      materials: 'corroded filings sealed in black wax',
      identifier: 'lotm-lawyer-corrosion-sentence',
      activityId: 'lawyerSeq6Corrode02',
      now: now + 5,
      existing: existing2,
      sort: 1700301
    });

    const ability3 = buildAbilityDoc({
      id: ABILITY_3_ID,
      name: 'Weakness Deposition',
      description:
        '<p><strong>Baseline (0 Spirituality):</strong> Bonus action. Depose one creature, object, or active effect within 90 feet for 1 minute. Choose one weakness vector: <strong>Mobility</strong>, <strong>Concentration</strong>, <strong>Resolve</strong>, or <strong>Structure</strong>. Once per round, when you or an ally exploits the chosen vector against the deposed target, apply one rider: gain <strong>+1</strong> on the roll/check/save, or impose <strong>-1</strong> on the target&apos;s next related check/save before end of its next turn.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> depose one additional target, or increase range to 150 feet.</li><li><strong>+2 Spirituality:</strong> numeric modifiers become <strong>Potency</strong>, and you may change the chosen weakness vector once during the effect as a free action.</li><li><strong>+4 Spirituality:</strong> when a deposed target fails a roll/check/save modified by this ability, choose one: it loses reactions, or it has disadvantage on its next saving throw before end of its next turn.</li></ul><p><em>Counterplay:</em> rapidly shifting forms, decoys, and concealed true defenses can force incorrect deposition vectors.</p><p><em>Corruption Hook:</em> if you falsify evidence to frame a target&apos;s weakness as guilt, gain 1 Corruption.</p>',
      img: 'icons/sundries/documents/document-symbol-eye.webp',
      activationType: 'bonus',
      durationValue: '1',
      durationUnits: 'minute',
      targetType: 'creature',
      targetCount: '1',
      targetSpecial: 'creature, object, or active effect',
      rangeUnits: 'ft',
      rangeValue: '90',
      rangeSpecial: '',
      school: 'div',
      properties: ['vocal'],
      materials: 'a cross-indexed evidence card',
      identifier: 'lotm-lawyer-weakness-deposition',
      activityId: 'lawyerSeq6Depose03',
      now: now + 6,
      existing: existing3,
      sort: 1700302
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
