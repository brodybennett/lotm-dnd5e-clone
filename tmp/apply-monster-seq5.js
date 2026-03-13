const { ClassicLevel } = require('./node-tools/node_modules/classic-level');

const CORE_VERSION = '13.351';
const SYSTEM_ID = 'lotm';
const SYSTEM_VERSION = '5.2.6';
const MODIFIER = '0000000000000000';

const PATHWAY_KEY = '!items!lotmPathway00016';
const FOLDER_KEY = '!folders!FCnegTZeThIPZUlC';
const PATHWAY_IDENTIFIER = 'lotm-monster';

const LEGACY_A_KEY = '!items!lotmAbilityO9002'; // Fickle Coin
const LEGACY_B_KEY = '!items!lotmAbilityO7001'; // Lucky Pulse

const ABILITY_1_ID = 'lotmAbilityO5001';
const ABILITY_2_ID = 'lotmAbilityO5002';
const ABILITY_3_ID = 'lotmAbilityO5003';

function buildStats(now, existing = null) {
  const createdTime = existing?.createdTime ?? now;
  return {
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
    folder: 'FCnegTZeThIPZUlC',
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
    const pathway = await getOptionalJson(pathwaysDb, PATHWAY_KEY);
    if (!pathway) throw new Error('Monster pathway not found.');

    pathway.system = pathway.system ?? {};
    pathway.system.description = pathway.system.description ?? { value: '', chat: '' };
    pathway.system.description.value =
      '<p><strong>Pathway Vector:</strong> whimsical fate-walking through lucky accidents, uncanny danger sense, and sudden reversals that resist rigid planning.</p>' +
      '<p><strong>Sequence 9 Package (Total Budget 2):</strong> Calamity Instinct, Fickle Coin.</p>' +
      '<p><strong>Sequence 8 Package (Gain Budget +3):</strong> Weighted Outcome, Fortune Drift, plus one legacy scope upgrade to Fickle Coin.</p>' +
      '<p><strong>Sequence 7 Package (Gain Budget +13):</strong> Lucky Pulse, Jinx Bloom, Sudden Reversal, plus two legacy upgrades (Calamity Instinct and Weighted Outcome).</p>' +
      '<p><strong>Sequence 6 Package (Gain Budget +9):</strong> Calamity Attraction, Psyche Storm, Disaster Skim, plus two legacy upgrades (Fickle Coin and Sudden Reversal).</p>' +
      '<p><strong>Sequence 5 Package (Gain Budget +13):</strong> Curse of Misfortune, Banked Luck, Winner\'s Premonition, plus two legacy upgrades (Fickle Coin and Lucky Pulse).</p>' +
      '<p><strong>Sequence 4-0 Status:</strong> Pending authoring in later sequence-focused runs.</p>' +
      '<p><strong>Continuity Anchor:</strong> At Sequence 5 (Winner), calamity steering graduates into luck-capital play: misfortune can be banked, cursed, and flipped at key moments, but outcomes stay capricious rather than deterministic.</p>';
    pathway._stats = buildStats(now, pathway._stats);
    await pathwaysDb.put(PATHWAY_KEY, JSON.stringify(pathway));

    const folder = await getOptionalJson(abilitiesDb, FOLDER_KEY);
    if (!folder) throw new Error('Monster folder not found.');

    folder.description = 'Sequence abilities for the Monster pathway (authored through Sequence 5).';
    folder.flags = folder.flags ?? {};
    folder.flags.lotm = {
      ...(folder.flags.lotm ?? {}),
      pathwayIdentifier: PATHWAY_IDENTIFIER,
      latestAuthoredSequence: 5
    };
    folder._stats = buildStats(now + 1, folder._stats);
    await abilitiesDb.put(FOLDER_KEY, JSON.stringify(folder));

    const legacyA = await getOptionalJson(abilitiesDb, LEGACY_A_KEY);
    const legacyB = await getOptionalJson(abilitiesDb, LEGACY_B_KEY);
    if (!legacyA) throw new Error('Legacy target lotmAbilityO9002 not found.');
    if (!legacyB) throw new Error('Legacy target lotmAbilityO7001 not found.');

    const legacyAHeader = '<h3>Legacy Upgrade (Sequence 5 - Scope)</h3>';
    const legacyAText =
      '<p>At Sequence 5, Fickle Coin can arc through clustered fate-lines. ' +
      'When Fickle Coin resolves on a creature, choose one additional creature within 15 feet of that target. ' +
      'The secondary creature receives the same coin face at half strength (round down; minimum 1 for numeric effects). ' +
      'If you cast Fickle Coin with +2 or higher upcast, this secondary target instead receives full strength.</p>';
    const legacyADescription = String(legacyA.system?.description?.value ?? '');
    if (!legacyADescription.includes(legacyAHeader)) {
      legacyA.system.description.value = `${legacyADescription}${legacyAHeader}${legacyAText}`;
    }
    legacyA._stats = buildStats(now + 2, legacyA._stats);
    await abilitiesDb.put(LEGACY_A_KEY, JSON.stringify(legacyA));

    const legacyBHeader = '<h3>Legacy Upgrade (Sequence 5 - Efficiency)</h3>';
    const legacyBText =
      '<p>At Sequence 5, Lucky Pulse recycles failed turns into tactical leverage. ' +
      'When you roll Dim Pulse, you may immediately gain 1 Banked Luck point (or temporary fate point if Banked Luck is not active). ' +
      'Once per round, you can spend that point to offset your own Dim Pulse penalty by <strong>+1</strong> or to give one ally within 30 feet a <strong>+1d4</strong> on their next d20 test before your next turn.</p>';
    const legacyBDescription = String(legacyB.system?.description?.value ?? '');
    if (!legacyBDescription.includes(legacyBHeader)) {
      legacyB.system.description.value = `${legacyBDescription}${legacyBHeader}${legacyBText}`;
    }
    legacyB._stats = buildStats(now + 3, legacyB._stats);
    await abilitiesDb.put(LEGACY_B_KEY, JSON.stringify(legacyB));

    const existing1 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_1_ID}`);
    const existing2 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_2_ID}`);
    const existing3 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_3_ID}`);

    const ability1 = buildAbilityDoc({
      id: ABILITY_1_ID,
      name: 'Curse of Misfortune',
      description:
        '<p><strong>Baseline (1 Spirituality):</strong> Action. Curse one creature within 60 feet for 1 minute (Wisdom save ends at end of each turn). While cursed, the first d20 test it makes each round triggers a misfortune roll (1d6):</p><ul><li><strong>1-2 Snare:</strong> subtract <strong>Potency</strong> from the d20 test.</li><li><strong>3-4 Stumble:</strong> no d20 modifier, but the creature cannot take reactions until end of turn.</li><li><strong>5-6 Spill:</strong> subtract <strong>1</strong> from the d20 test and the creature takes psychic damage equal to <strong>Potency</strong>.</li></ul><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> affect one additional creature in range (separate save and misfortune roll).</li><li><strong>+2 Spirituality:</strong> roll 2d6 for each trigger and choose which misfortune result applies.</li><li><strong>+4 Spirituality:</strong> whenever Spill occurs, one ally within 30 feet gains <strong>+Potency</strong> on its next d20 test before the end of its next turn.</li></ul><p><em>Counterplay:</em> Wisdom save support, curse cleansing, and reaction-independent tactics reduce impact.</p><p><em>Corruption Hook:</em> if you curse noncombatants for entertainment, gain 1 Corruption.</p>',
      img: 'icons/magic/death/undead-skeleton-strands-blue.webp',
      activationType: 'action',
      durationValue: '1',
      durationUnits: 'minute',
      targetType: 'creature',
      targetCount: '1',
      targetSpecial: '',
      rangeUnits: 'ft',
      rangeValue: '60',
      rangeSpecial: '',
      school: 'enc',
      properties: ['vocal', 'somatic'],
      materials: 'a cracked clover charm tied with black thread',
      identifier: 'lotm-monster-curse-of-misfortune',
      activityId: 'monsterSeq5Cur01',
      now: now + 4,
      existing: existing1,
      sort: 2200500
    });

    const ability2 = buildAbilityDoc({
      id: ABILITY_2_ID,
      name: 'Banked Luck',
      description:
        '<p><strong>Baseline (0 Spirituality):</strong> Bonus action. For 1 minute, you begin banking luck. Once per round when you fail a d20 test or take damage from a hostile source, gain 1 banked luck point (maximum <strong>Potency</strong>). As a reaction when you or an ally within 30 feet rolls a d20 test or takes damage, spend points:</p><ul><li><strong>1 point:</strong> add <strong>1d4</strong> to the d20 test or reduce incoming damage by <strong>Potency</strong>.</li><li><strong>2 points:</strong> add <strong>Potency</strong> to the d20 test or reduce incoming damage by <strong>2 x Potency</strong>.</li></ul><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> max bank increases by <strong>+Potency</strong>, and ally failures within 30 feet can also generate points (still once per round).</li><li><strong>+2 Spirituality:</strong> once per round, when you spend points, you may force one enemy within 30 feet to subtract <strong>1d4</strong> from its next d20 test before the end of its next turn.</li><li><strong>+4 Spirituality:</strong> when you spend 2 points, one protected target may immediately move 10 feet without provoking opportunity attacks.</li></ul><p><em>Counterplay:</em> burst damage before points accrue, reaction denial, and range pressure can shut down banking loops.</p><p><em>Corruption Hook:</em> if you intentionally engineer ally suffering to farm luck points, gain 1 Corruption.</p>',
      img: 'icons/commodities/currency/coin-embossed-shield-brown.webp',
      activationType: 'bonus',
      durationValue: '1',
      durationUnits: 'minute',
      targetType: 'self',
      targetCount: '1',
      targetSpecial: 'self',
      rangeUnits: 'self',
      rangeValue: null,
      rangeSpecial: '',
      school: 'div',
      properties: ['somatic', 'material'],
      materials: 'a small sealed purse containing three mismatched coins',
      identifier: 'lotm-monster-banked-luck',
      activityId: 'monsterSeq5Bank02',
      now: now + 5,
      existing: existing2,
      sort: 2200501
    });

    const ability3 = buildAbilityDoc({
      id: ABILITY_3_ID,
      name: "Winner's Premonition",
      description:
        '<p><strong>Baseline (1 Spirituality):</strong> Reaction when a creature you can see within 60 feet succeeds on a d20 test or when an ally you can see fails one. Roll a pivot die (1d8): on <strong>1-4</strong>, no reversal occurs and you gain 1 banked luck point (or a temporary fate point if Banked Luck is inactive). On <strong>5-8</strong>, force a reroll: enemy keeps lower, ally keeps higher. If this changes the outcome, one creature affected by the trigger may move 10 feet without provoking opportunity attacks from the triggering creature.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> pivot die becomes 1d10 (reversal on 4-10).</li><li><strong>+2 Spirituality:</strong> if reversal succeeds, apply <strong>-Potency</strong> to the triggering enemy\'s next d20 test before end of its next turn, or <strong>+Potency</strong> to the rescued ally\'s next d20 test.</li><li><strong>+4 Spirituality:</strong> after a successful reversal, choose a second creature within 15 feet of the trigger; it takes psychic damage equal to <strong>Potency</strong> and loses reactions until the start of its next turn.</li></ul><p><em>Counterplay:</em> reroll immunity, hidden triggers, and line-of-sight denial reduce reversal reliability.</p><p><em>Corruption Hook:</em> if you weaponize reversals to sabotage allies\' spotlight moments out of envy, gain 1 Corruption.</p>',
      img: 'icons/magic/perception/eye-ringed-glow-angry-small-teal.webp',
      activationType: 'reaction',
      durationValue: '',
      durationUnits: 'inst',
      targetType: 'creature',
      targetCount: '1',
      targetSpecial: 'creature you can see that just resolved a d20 test',
      rangeUnits: 'ft',
      rangeValue: '60',
      rangeSpecial: '',
      school: 'div',
      properties: ['somatic'],
      materials: 'a silver mirror shard wrapped in linen',
      identifier: 'lotm-monster-winners-premonition',
      activityId: 'monsterSeq5Pre03',
      now: now + 6,
      existing: existing3,
      sort: 2200502
    });

    await abilitiesDb.put(`!items!${ABILITY_1_ID}`, JSON.stringify(ability1));
    await abilitiesDb.put(`!items!${ABILITY_2_ID}`, JSON.stringify(ability2));
    await abilitiesDb.put(`!items!${ABILITY_3_ID}`, JSON.stringify(ability3));

    const verifyPathway = await getOptionalJson(pathwaysDb, PATHWAY_KEY);
    const verifyFolder = await getOptionalJson(abilitiesDb, FOLDER_KEY);
    const verifyLegacyA = await getOptionalJson(abilitiesDb, LEGACY_A_KEY);
    const verifyLegacyB = await getOptionalJson(abilitiesDb, LEGACY_B_KEY);
    const verify1 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_1_ID}`);
    const verify2 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_2_ID}`);
    const verify3 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_3_ID}`);

    console.log(JSON.stringify({
      pathwayKey: PATHWAY_KEY,
      pathwayIdentifier: verifyPathway?.system?.identifier,
      folderKey: FOLDER_KEY,
      folderFlags: verifyFolder?.flags?.lotm,
      legacyUpdated: [
        { key: LEGACY_A_KEY, applied: String(verifyLegacyA?.system?.description?.value ?? '').includes(legacyAHeader) },
        { key: LEGACY_B_KEY, applied: String(verifyLegacyB?.system?.description?.value ?? '').includes(legacyBHeader) }
      ],
      abilitiesWritten: [`!items!${ABILITY_1_ID}`, `!items!${ABILITY_2_ID}`, `!items!${ABILITY_3_ID}`],
      abilityReadBack: [
        { id: verify1?._id, name: verify1?.name, sourceClass: verify1?.system?.sourceClass, identifier: verify1?.system?.identifier, grantedSequence: verify1?.flags?.lotm?.grantedSequence, level: verify1?.system?.level, folder: verify1?.folder },
        { id: verify2?._id, name: verify2?.name, sourceClass: verify2?.system?.sourceClass, identifier: verify2?.system?.identifier, grantedSequence: verify2?.flags?.lotm?.grantedSequence, level: verify2?.system?.level, folder: verify2?.folder },
        { id: verify3?._id, name: verify3?.name, sourceClass: verify3?.system?.sourceClass, identifier: verify3?.system?.identifier, grantedSequence: verify3?.flags?.lotm?.grantedSequence, level: verify3?.system?.level, folder: verify3?.folder }
      ]
    }, null, 2));
  } finally {
    await pathwaysDb.close();
    await abilitiesDb.close();
  }
})();
