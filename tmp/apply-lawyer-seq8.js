const { ClassicLevel } = require('./node-tools/node_modules/classic-level');

const CORE_VERSION = '13.351';
const SYSTEM_ID = 'lotm';
const SYSTEM_VERSION = '5.2.6';
const MODIFIER = '0000000000000000';

const PATHWAY_NAME = 'Lawyer';
const PATHWAY_IDENTIFIER = 'lotm-lawyer';
const DEFAULT_PATHWAY_ID = 'lotmPathway00021';
const FOLDER_ID = 'F7OA4PBTMNaIeTZQ';

const LEGACY_ABILITY_ID = 'lotmAbilityX9001';
const ABILITY_1_ID = 'lotmAbilityX8001';
const ABILITY_2_ID = 'lotmAbilityX8002';

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
      level: 1,
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
        grantedSequence: 8
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
      throw new Error(`Lawyer pathway (${pathwayKey}) not found. Sequence 9 package is required first.`);
    }

    pathway.system = pathway.system ?? {};
    pathway.system.description = pathway.system.description ?? { value: '', chat: '' };
    pathway.system.description.value =
      '<p><strong>Pathway Vector:</strong> impartial adjudication through precise rhetoric, loophole analysis, and order-backed injunctions that constrain hostile conduct.</p>' +
      '<p><strong>Sequence 9 Package (Total Budget 2):</strong> Law Proficiency, Order Citation.</p>' +
      '<p><strong>Sequence 8 Package (Gain Budget +3):</strong> Rulebreaker Physique, Verdict Compulsion, plus one legacy scope upgrade to Law Proficiency.</p>' +
      '<p><strong>Sequence 7-0 Status:</strong> Pending authoring in later sequence-focused runs.</p>' +
      '<p><strong>Continuity Anchor:</strong> At Sequence 8 (Barbarian), Lawyer doctrine adds lawful force: unresolved disputes are settled through decisive physical enforcement backed by mental resistance and procedural certainty, with progression aimed toward Sequence 7 (Briber).</p>';
    pathway._stats = buildStats(now, pathway._stats);
    await pathwaysDb.put(pathwayKey, JSON.stringify(pathway));

    const folderKey = `!folders!${FOLDER_ID}`;
    const folder = await getOptionalJson(abilitiesDb, folderKey);
    if (!folder) {
      throw new Error(`Lawyer ability folder (${FOLDER_ID}) not found.`);
    }

    folder.name = PATHWAY_NAME;
    folder.description = 'Sequence abilities for the Lawyer pathway (authored through Sequence 8).';
    folder.flags = folder.flags ?? {};
    folder.flags.lotm = {
      ...(folder.flags.lotm ?? {}),
      pathwayIdentifier: PATHWAY_IDENTIFIER,
      latestAuthoredSequence: 8
    };
    folder._stats = buildStats(now + 1, folder._stats);
    await abilitiesDb.put(folderKey, JSON.stringify(folder));

    const legacyKey = `!items!${LEGACY_ABILITY_ID}`;
    const legacyAbility = await getOptionalJson(abilitiesDb, legacyKey);
    if (!legacyAbility) {
      throw new Error(`Legacy target ${LEGACY_ABILITY_ID} not found. Sequence 9 package is required first.`);
    }

    const legacyHeader = '<h3>Legacy Upgrade (Sequence 8 - Scope)</h3>';
    const legacyText =
      '<p>At Sequence 8, <strong>Law Proficiency</strong> extends from abstract procedure into bodily enforcement lanes. ' +
      'Your named process may now be a physical rule such as zone breach order, guard line priority, grappling priority, or protected-person perimeter. ' +
      'When a creature violates one of these named physical rules, your <strong>Objection</strong> can modify the related Strength, Constitution, or Wisdom roll/check/save as well as normal legal checks. ' +
      'If you spend at least <strong>+1 Spirituality</strong> while using Law Proficiency, your violation-tracking radius increases to 120 feet for that use.</p>';
    const legacyDescription = String(legacyAbility.system?.description?.value ?? '');
    if (!legacyDescription.includes(legacyHeader)) {
      legacyAbility.system.description.value = `${legacyDescription}${legacyHeader}${legacyText}`;
    }
    legacyAbility._stats = buildStats(now + 2, legacyAbility._stats);
    await abilitiesDb.put(legacyKey, JSON.stringify(legacyAbility));

    const existingAbility1 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_1_ID}`);
    const existingAbility2 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_2_ID}`);

    const ability1 = buildAbilityDoc({
      id: ABILITY_1_ID,
      name: 'Rulebreaker Physique',
      description:
        '<p><strong>Baseline (0 Spirituality):</strong> Bonus action. For 1 minute, enter an enforcement frame. You gain advantage on Strength (Athletics) checks, Constitution saving throws made against forced movement, exhaustion, or pain effects, and Wisdom saves against charm or fear effects generated by social coercion. Once per turn when you move adjacent to a creature that violated one of your declared clauses this round, you may immediately attempt a shove or grapple check without spending additional movement.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> gain temporary HP equal to <strong>Potency</strong> when the frame begins, and again once when you reduce a violating target&apos;s speed to 0 by grapple or shove positioning.</li><li><strong>+2 Spirituality:</strong> while active, you ignore nonmagical difficult terrain and gain <strong>+Potency</strong> on checks to resist disarm, restraint, or knockback effects.</li><li><strong>+4 Spirituality:</strong> the first time each round you succeed on a charm/fear-related save, you may issue a silent verdict pulse to one creature within 30 feet; it must pass a Wisdom save or lose reactions until the start of its next turn.</li></ul><p><em>Counterplay:</em> silence-independent mental effects, teleport displacement, and large-area control can bypass close-range enforcement.</p><p><em>Corruption Hook:</em> if you use lawful force to publicly break harmless dissenters for reputation gain, gain 1 Corruption.</p>',
      img: 'icons/skills/melee/unarmed-punch-fist-yellow.webp',
      activationType: 'bonus',
      durationValue: '1',
      durationUnits: 'minute',
      targetType: 'self',
      targetCount: '1',
      targetSpecial: '',
      rangeUnits: 'self',
      rangeValue: null,
      rangeSpecial: '',
      school: 'trs',
      properties: ['somatic', 'material'],
      materials: 'a stamped iron signet wrapped in cloth',
      identifier: 'lotm-lawyer-rulebreaker-physique',
      activityId: 'lawyerSeq8Physique01',
      now: now + 3,
      existing: existingAbility1,
      sort: 1700100
    });

    const ability2 = buildAbilityDoc({
      id: ABILITY_2_ID,
      name: 'Verdict Compulsion',
      description:
        '<p><strong>Baseline (0 Spirituality):</strong> Action. Declare one explicit verdict clause against a creature within 60 feet that can hear and understand you: <em>do not advance</em>, <em>do not strike</em>, <em>do not cast or invoke</em>, or <em>do not manipulate a named object/lever/door</em>. The target makes a Wisdom save. On a failure, until the end of its next turn, if it attempts the prohibited conduct it must choose one: cancel the attempt, or proceed and suffer both disadvantage on the triggering roll/check and a forced 10-foot push directly away from the protected lane, creature, or object.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> range becomes 120 feet, or you add one secondary prohibited clause against the same target.</li><li><strong>+2 Spirituality:</strong> affect one additional creature within 30 feet of the first target (separate save), and failed targets lose reactions when they violate the clause.</li><li><strong>+4 Spirituality:</strong> duration becomes 1 minute (concentration). Each affected target repeats the save at the end of its turn; on each failed save, clause violation also sets its speed to 0 for the remainder of that turn.</li></ul><p><em>Counterplay:</em> deafness, language denial, immunity to command-like influence, and broken line of effect before declaration can negate this verdict.</p><p><em>Corruption Hook:</em> if you draft impossible clauses solely to justify violence, gain 1 Corruption.</p>',
      img: 'icons/skills/social/intimidation-impressing.webp',
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
      properties: ['vocal'],
      materials: 'a folded verdict slip marked with a red line',
      identifier: 'lotm-lawyer-verdict-compulsion',
      activityId: 'lawyerSeq8Verdict01',
      now: now + 4,
      existing: existingAbility2,
      sort: 1700101
    });

    await abilitiesDb.put(`!items!${ABILITY_1_ID}`, JSON.stringify(ability1));
    await abilitiesDb.put(`!items!${ABILITY_2_ID}`, JSON.stringify(ability2));

    console.log(JSON.stringify({
      pathwayWritten: pathwayKey,
      folderWritten: folderKey,
      legacyUpdated: legacyKey,
      abilitiesWritten: [`!items!${ABILITY_1_ID}`, `!items!${ABILITY_2_ID}`],
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
        }
      ]
    }, null, 2));
  } finally {
    await pathwaysDb.close();
    await abilitiesDb.close();
  }
})();
