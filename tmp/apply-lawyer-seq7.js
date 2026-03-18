const { ClassicLevel } = require('./node-tools/node_modules/classic-level');

const CORE_VERSION = '13.351';
const SYSTEM_ID = 'lotm';
const SYSTEM_VERSION = '5.2.6';
const MODIFIER = '0000000000000000';

const PATHWAY_NAME = 'Lawyer';
const PATHWAY_IDENTIFIER = 'lotm-lawyer';
const DEFAULT_PATHWAY_ID = 'lotmPathway00021';
const FOLDER_ID = 'F7OA4PBTMNaIeTZQ';

const LEGACY_A_KEY = '!items!lotmAbilityX9001';
const LEGACY_B_KEY = '!items!lotmAbilityX8002';

const ABILITY_1_ID = 'lotmAbilityX7001';
const ABILITY_2_ID = 'lotmAbilityX7002';
const ABILITY_3_ID = 'lotmAbilityX7003';

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
      level: 2,
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
        grantedSequence: 7
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
      throw new Error(`Lawyer pathway (${pathwayKey}) not found. Sequence 9+8 package is required first.`);
    }

    pathway.system = pathway.system ?? {};
    pathway.system.description = pathway.system.description ?? { value: '', chat: '' };
    pathway.system.description.value =
      '<p><strong>Pathway Vector:</strong> impartial adjudication through precise rhetoric, loophole analysis, and order-backed injunctions that constrain hostile conduct.</p>' +
      '<p><strong>Sequence 9 Package (Total Budget 2):</strong> Law Proficiency, Order Citation.</p>' +
      '<p><strong>Sequence 8 Package (Gain Budget +3):</strong> Rulebreaker Physique, Verdict Compulsion, plus one legacy scope upgrade to Law Proficiency.</p>' +
      '<p><strong>Sequence 7 Package (Gain Budget +13):</strong> Bribery, Indebted Network, Liability Transfer, plus two legacy upgrades (Law Proficiency and Verdict Compulsion).</p>' +
      '<p><strong>Sequence 6-0 Status:</strong> Pending authoring in later sequence-focused runs.</p>' +
      '<p><strong>Continuity Anchor:</strong> At Sequence 7 (Briber), Lawyer doctrine pivots from direct enforcement into transactional control, social leverage, and relationship tampering that prepares the Distortion-oriented jump at Sequence 6 (Baron of Corruption).</p>';
    pathway._stats = buildStats(now, pathway._stats);
    await pathwaysDb.put(pathwayKey, JSON.stringify(pathway));

    const folderKey = `!folders!${FOLDER_ID}`;
    const folder = await getOptionalJson(abilitiesDb, folderKey);
    if (!folder) {
      throw new Error(`Lawyer ability folder (${FOLDER_ID}) not found.`);
    }
    folder.name = PATHWAY_NAME;
    folder.description = 'Sequence abilities for the Lawyer pathway (authored through Sequence 7).';
    folder.flags = folder.flags ?? {};
    folder.flags.lotm = {
      ...(folder.flags.lotm ?? {}),
      pathwayIdentifier: PATHWAY_IDENTIFIER,
      latestAuthoredSequence: 7
    };
    folder._stats = buildStats(now + 1, folder._stats);
    await abilitiesDb.put(folderKey, JSON.stringify(folder));

    const legacyA = await getOptionalJson(abilitiesDb, LEGACY_A_KEY);
    const legacyB = await getOptionalJson(abilitiesDb, LEGACY_B_KEY);
    if (!legacyA) throw new Error('Legacy target lotmAbilityX9001 not found.');
    if (!legacyB) throw new Error('Legacy target lotmAbilityX8002 not found.');

    const legacyAHeader = '<h3>Legacy Upgrade (Sequence 7 - Efficiency)</h3>';
    const legacyAText =
      '<p>At Sequence 7, <strong>Law Proficiency</strong> becomes a faster courtroom engine in battle. ' +
      'While Law Proficiency is active, once per round you may issue one <strong>Objection</strong> against a creature already affected by your Bribery or Verdict Compulsion without spending your reaction. ' +
      'If you spend at least <strong>+1 Spirituality</strong> on Law Proficiency, the first qualifying free Objection each round also grants one ally within 30 feet a 5-foot reposition that does not provoke opportunity attacks from the violator.</p>';
    const legacyADesc = String(legacyA.system?.description?.value ?? '');
    if (!legacyADesc.includes(legacyAHeader)) {
      legacyA.system.description.value = `${legacyADesc}${legacyAHeader}${legacyAText}`;
    }
    legacyA._stats = buildStats(now + 2, legacyA._stats);
    await abilitiesDb.put(LEGACY_A_KEY, JSON.stringify(legacyA));

    const legacyBHeader = '<h3>Legacy Upgrade (Sequence 7 - Potency)</h3>';
    const legacyBText =
      '<p>At Sequence 7, <strong>Verdict Compulsion</strong> gains heavier sentencing pressure. ' +
      'When a failed target violates a Verdict clause, it suffers psychic backlash equal to <strong>Potency</strong> in addition to the base penalty package. ' +
      'If you upcast Verdict Compulsion by at least <strong>+2 Spirituality</strong>, the first violating target each round also takes a <strong>-Potency</strong> penalty to its next saving throw before the end of its next turn.</p>';
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
      name: 'Bribery',
      description:
        '<p><strong>Baseline (1 Spirituality):</strong> Action. Choose one creature within 60 feet that can hear and understand you; it makes a Wisdom save. On a failure, apply one bribery mode:</p><ul><li><strong>Weaken:</strong> until end of its next turn, it takes <strong>-1</strong> on attack rolls and Strength/Dexterity checks.</li><li><strong>Arrogance:</strong> until end of its next turn, it has disadvantage on Insight and Investigation checks, and cannot benefit from the Help action.</li><li><strong>Charm:</strong> until end of its next turn, it cannot willingly target you with hostile actions unless you or your allies damage it.</li><li><strong>Connection:</strong> for 1 minute, create a temporary relationship marker; once per round when it makes a roll/check/save, you may impose <strong>-1</strong> or grant one ally within 30 feet <strong>+1</strong> against that target before the roll resolves.</li></ul><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> target one additional creature (separate save), or increase range to 120 feet.</li><li><strong>+2 Spirituality:</strong> apply a second bribery mode to each failed target; all numeric modifiers from this ability become <strong>Potency</strong>.</li><li><strong>+4 Spirituality:</strong> duration for all chosen modes becomes 1 minute (concentration), and failed targets repeat the save at end of each turn.</li></ul><p><em>Counterplay:</em> language denial, mental immunity, and strict anti-enchantment wards reduce or nullify bribery leverage.</p><p><em>Corruption Hook:</em> if you fabricate accusations to extort vulnerable civilians, gain 1 Corruption.</p>',
      img: 'icons/commodities/currency/coin-engraved-profile.webp',
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
      materials: 'a sealed coin envelope stamped with a false crest',
      identifier: 'lotm-lawyer-bribery',
      activityId: 'lawyerSeq7Bribe01',
      now: now + 4,
      existing: existing1,
      sort: 1700200
    });

    const ability2 = buildAbilityDoc({
      id: ABILITY_2_ID,
      name: 'Indebted Network',
      description:
        '<p><strong>Baseline (0 Spirituality):</strong> Bonus action. Mark one creature within 60 feet that can hear and understand you as <strong>Indebted</strong> for 1 minute (Wisdom save negates). Once per round, when an Indebted target receives a bonus, healing, or Help from an ally, choose one rider: (a) reduce that granted numeric bonus by <strong>1</strong> (minimum 0), or (b) grant one ally within 30 feet <strong>+1</strong> on their next check or save against the Indebted target before start of your next turn.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> mark one additional creature, or increase range to 90 feet.</li><li><strong>+2 Spirituality:</strong> numeric riders become <strong>Potency</strong>, and an Indebted target that fails a save against one of your abilities loses reactions until start of its next turn.</li><li><strong>+4 Spirituality:</strong> once per round, when an Indebted target gains any beneficial effect, you may redirect that effect&apos;s first numeric benefit to yourself or one ally within 30 feet instead (GM adjudication for incompatible effects).</li></ul><p><em>Counterplay:</em> isolated combatants, non-numeric buffs, and anti-curse/anti-mark cleansing reduce network exploitation.</p><p><em>Corruption Hook:</em> if you trap allies in debt cycles they cannot refuse, gain 1 Corruption.</p>',
      img: 'icons/sundries/documents/contracts-contract-scroll.webp',
      activationType: 'bonus',
      durationValue: '1',
      durationUnits: 'minute',
      targetType: 'creature',
      targetCount: '1',
      targetSpecial: 'creature that can hear and understand you',
      rangeUnits: 'ft',
      rangeValue: '60',
      rangeSpecial: '',
      school: 'enc',
      properties: ['vocal'],
      materials: 'a folded promissory note bound by black thread',
      identifier: 'lotm-lawyer-indebted-network',
      activityId: 'lawyerSeq7Debt02',
      now: now + 5,
      existing: existing2,
      sort: 1700201
    });

    const ability3 = buildAbilityDoc({
      id: ABILITY_3_ID,
      name: 'Liability Transfer',
      description:
        '<p><strong>Baseline (0 Spirituality):</strong> Reaction when you or one ally within 30 feet is targeted by an attack roll or hostile check from a creature within 60 feet that can hear you. Force the attacker to make a Charisma save. On failure, choose one: (a) apply <strong>-1</strong> to the triggering roll, or (b) if another hostile creature is within 10 feet of the attacker and is a valid target, redirect the attack/check to that creature.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> range becomes 120 feet, or protect one additional ally in range until start of your next turn.</li><li><strong>+2 Spirituality:</strong> numeric penalties become <strong>Potency</strong>, and a failed attacker has its speed reduced by 10 feet until end of its next turn.</li><li><strong>+4 Spirituality:</strong> if the triggering attack/check fails after your modification, the attacker loses reactions and takes psychic damage equal to <strong>Potency</strong>.</li></ul><p><em>Counterplay:</em> silence, unhearable attacks, and immunity to charm/compulsion reduce transfer reliability.</p><p><em>Corruption Hook:</em> if you redirect lethal consequences onto uninvolved bystanders, gain 1 Corruption.</p>',
      img: 'icons/magic/control/debuff-chains-ropes-red.webp',
      activationType: 'reaction',
      durationValue: '',
      durationUnits: 'inst',
      targetType: 'creature',
      targetCount: '1',
      targetSpecial: 'attacker or source of hostile check',
      rangeUnits: 'ft',
      rangeValue: '60',
      rangeSpecial: '',
      school: 'abj',
      properties: ['vocal'],
      materials: 'a split wax seal marked with two signatures',
      identifier: 'lotm-lawyer-liability-transfer',
      activityId: 'lawyerSeq7Liab03',
      now: now + 6,
      existing: existing3,
      sort: 1700202
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
