const { ClassicLevel } = require('./node-tools/node_modules/classic-level');

const CORE_VERSION = '13.351';
const SYSTEM_ID = 'lotm';
const SYSTEM_VERSION = '5.2.6';
const MODIFIER = '0000000000000000';

const PATHWAY_KEY = '!items!lotmPathway00016';
const FOLDER_KEY = '!folders!FCnegTZeThIPZUlC';
const PATHWAY_IDENTIFIER = 'lotm-monster';

const LEGACY_A_KEY = '!items!lotmAbilityO4001'; // Misfortune Field
const LEGACY_B_KEY = '!items!lotmAbilityO5002'; // Banked Luck

const ABILITY_1_ID = 'lotmAbilityO3001';
const ABILITY_2_ID = 'lotmAbilityO3002';
const ABILITY_3_ID = 'lotmAbilityO3003';
const ABILITY_4_ID = 'lotmAbilityO3004';

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
      '<p><strong>Sequence 4 Package (Gain Budget +33):</strong> Misfortune Field, Group Blessing, Absolute Foresight, Mercury Body, plus two legacy upgrades (Psyche Storm and Curse of Misfortune).</p>' +
      '<p><strong>Sequence 3 Package (Gain Budget +20):</strong> Keeper of Chaos, Spiritual Baptism, Predestination Fracture, Prayer Resonance, plus two legacy upgrades (Misfortune Field and Banked Luck).</p>' +
      '<p><strong>Sequence 2-0 Status:</strong> Pending authoring in later sequence-focused runs.</p>' +
      '<p><strong>Continuity Anchor:</strong> At Sequence 3 (Chaoswalker), the pathway shifts from broad misfortune shaping into active chaos authority: rigid outcomes are destabilized, spirits are purified or distorted, and fate remains dangerously unpredictable.</p>';
    pathway._stats = buildStats(now, pathway._stats);
    await pathwaysDb.put(PATHWAY_KEY, JSON.stringify(pathway));

    const folder = await getOptionalJson(abilitiesDb, FOLDER_KEY);
    if (!folder) throw new Error('Monster folder not found.');

    folder.description = 'Sequence abilities for the Monster pathway (authored through Sequence 3).';
    folder.flags = folder.flags ?? {};
    folder.flags.lotm = {
      ...(folder.flags.lotm ?? {}),
      pathwayIdentifier: PATHWAY_IDENTIFIER,
      latestAuthoredSequence: 3
    };
    folder._stats = buildStats(now + 1, folder._stats);
    await abilitiesDb.put(FOLDER_KEY, JSON.stringify(folder));

    const legacyA = await getOptionalJson(abilitiesDb, LEGACY_A_KEY);
    const legacyB = await getOptionalJson(abilitiesDb, LEGACY_B_KEY);
    if (!legacyA) throw new Error('Legacy target lotmAbilityO4001 not found.');
    if (!legacyB) throw new Error('Legacy target lotmAbilityO5002 not found.');

    const legacyAHeader = '<h3>Legacy Upgrade (Sequence 3 - Potency)</h3>';
    const legacyAText =
      '<p>At Sequence 3, Misfortune Field carries deeper chaos bite. ' +
      'When a creature fails its save in the field, it gains one <strong>Chaos Scar</strong> until the start of its next turn. ' +
      'A scarred creature subtracts <strong>Potency</strong> from the first concentration check or stabilization check it makes. ' +
      'If Misfortune Field was cast with +2 or higher upcast, a scarred creature also has disadvantage on its first reaction-triggered d20 test before the scar ends.</p>';
    const legacyADescription = String(legacyA.system?.description?.value ?? '');
    if (!legacyADescription.includes(legacyAHeader)) {
      legacyA.system.description.value = `${legacyADescription}${legacyAHeader}${legacyAText}`;
    }
    legacyA._stats = buildStats(now + 2, legacyA._stats);
    await abilitiesDb.put(LEGACY_A_KEY, JSON.stringify(legacyA));

    const legacyBHeader = '<h3>Legacy Upgrade (Sequence 3 - Efficiency)</h3>';
    const legacyBText =
      '<p>At Sequence 3, Banked Luck converts near-disaster into immediate tempo. ' +
      'Once per round, when you or an ally within 30 feet would drop below half HP, gain 1 banked luck point immediately (does not consume the normal once-per-round generation trigger). ' +
      'When you spend 2 points, you may also cleanse one minor misfortune rider from the protected target (choose one: speed penalty, reaction lockout, or nonmagical disadvantage rider lasting 1 round).</p>';
    const legacyBDescription = String(legacyB.system?.description?.value ?? '');
    if (!legacyBDescription.includes(legacyBHeader)) {
      legacyB.system.description.value = `${legacyBDescription}${legacyBHeader}${legacyBText}`;
    }
    legacyB._stats = buildStats(now + 3, legacyB._stats);
    await abilitiesDb.put(LEGACY_B_KEY, JSON.stringify(legacyB));

    const existing1 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_1_ID}`);
    const existing2 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_2_ID}`);
    const existing3 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_3_ID}`);
    const existing4 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_4_ID}`);

    const ability1 = buildAbilityDoc({
      id: ABILITY_1_ID,
      name: 'Keeper of Chaos',
      description:
        '<p><strong>Baseline (2 Spirituality):</strong> Reaction when a creature you can see within 60 feet makes a d20 test. Choose <strong>Seal</strong> or <strong>Unleash</strong>, then roll 1d6.</p><ul><li><strong>Seal (ally target):</strong> 1-2 add +1, 3-4 add <strong>Potency</strong>, 5-6 reroll and keep the higher result. On a 5-6, ally also ends one charm/fear effect caused by a creature of equal or lower sequence.</li><li><strong>Unleash (enemy target):</strong> 1-2 subtract 1, 3-4 subtract <strong>Potency</strong>, 5-6 force reroll and keep the lower result. On a 5-6, enemy also loses reactions until start of its next turn.</li></ul><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> roll 2d6 and choose which result applies.</li><li><strong>+2 Spirituality:</strong> after resolving, you may shift fate residue: one ally within 30 feet gains <strong>+1d4</strong> on its next d20 test or one enemy within 30 feet takes <strong>-1d4</strong> on its next d20 test.</li><li><strong>+4 Spirituality:</strong> if you rolled 5-6, apply your chosen mode to one additional creature within 15 feet of the original target at half potency (round down, minimum 1).</li></ul><p><em>Counterplay:</em> effects that ignore rerolls, hidden triggers, and anti-prophecy wards reduce reliability.</p><p><em>Corruption Hook:</em> if you repeatedly unleash chaos in peaceful scenes just to test odds, gain 1 Corruption.</p>',
      img: 'icons/magic/control/debuff-energy-hold-levitate-yellow.webp',
      activationType: 'reaction',
      durationValue: '',
      durationUnits: 'inst',
      targetType: 'creature',
      targetCount: '1',
      targetSpecial: 'creature making a d20 test',
      rangeUnits: 'ft',
      rangeValue: '60',
      rangeSpecial: '',
      school: 'div',
      properties: ['somatic'],
      materials: 'a six-sided die carved from dark bone',
      identifier: 'lotm-monster-keeper-of-chaos',
      activityId: 'monsterSeq3Kep01',
      now: now + 4,
      existing: existing1,
      sort: 2200700
    });

    const ability2 = buildAbilityDoc({
      id: ABILITY_2_ID,
      name: 'Spiritual Baptism',
      description:
        '<p><strong>Baseline (2 Spirituality):</strong> Action. Purify one creature within 30 feet with a fate wash. Target immediately ends one of the following from an equal-or-lower-sequence source: charm, fear, madness-style confusion, or one curse/misfortune rider. For 1 minute, target gains <strong>Stability</strong>: add <strong>Potency</strong> to the first Wisdom, Intelligence, or Charisma save it makes each round.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> affect one additional creature within range.</li><li><strong>+2 Spirituality:</strong> duration extends to 10 minutes, and Stability also grants advantage on checks to maintain concentration.</li><li><strong>+4 Spirituality:</strong> choose a hostile creature within 30 feet of each purified target; that hostile creature must make a Wisdom save or take psychic damage equal to <strong>Potency</strong> and suffer <strong>-Potency</strong> on its next d20 test.</li></ul><p><em>Counterplay:</em> higher-sequence curses, anti-healing zones, and silence/disruption can block or dilute purification.</p><p><em>Corruption Hook:</em> if you forcibly \"purify\" unwilling minds to erase dissent, gain 1 Corruption.</p>',
      img: 'icons/magic/life/heart-cross-strong-flame-purple-orange.webp',
      activationType: 'action',
      durationValue: '1',
      durationUnits: 'minute',
      targetType: 'creature',
      targetCount: '1',
      targetSpecial: '',
      rangeUnits: 'ft',
      rangeValue: '30',
      rangeSpecial: '',
      school: 'abj',
      properties: ['vocal', 'somatic', 'material'],
      materials: 'a silver bowl filled with rainwater',
      identifier: 'lotm-monster-spiritual-baptism',
      activityId: 'monsterSeq3Bap02',
      now: now + 5,
      existing: existing2,
      sort: 2200701
    });

    const ability3 = buildAbilityDoc({
      id: ABILITY_3_ID,
      name: 'Predestination Fracture',
      description:
        '<p><strong>Baseline (1 Spirituality):</strong> Reaction when a creature you can see within 60 feet would auto-succeed, auto-fail, or resolve a fixed result effect (including guaranteed hit/miss clauses from equal-or-lower-sequence sources). Force that resolution into a chaos contest: both sides roll 1d6. If your result is higher, the fixed outcome is canceled and replaced by a normal d20 roll with no advantage/disadvantage. On a tie, the fixed outcome stands but you gain 1 banked luck point (or temporary fate point if Banked Luck is absent).</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> your chaos die becomes 1d8.</li><li><strong>+2 Spirituality:</strong> if you win the contest, apply <strong>+Potency</strong> (ally side) or <strong>-Potency</strong> (enemy side) to the replacement d20 roll.</li><li><strong>+4 Spirituality:</strong> after a successful fracture, one additional creature within 15 feet of the trigger must succeed on a Wisdom save or become fate-dizzied (no reactions, speed -10) until end of its next turn.</li></ul><p><em>Counterplay:</em> higher-sequence authority effects, reaction denial, and unseen trigger sources bypass this fracture.</p><p><em>Corruption Hook:</em> if you fracture destiny merely to escalate collateral chaos, gain 1 Corruption.</p>',
      img: 'icons/magic/symbols/runes-star-blue.webp',
      activationType: 'reaction',
      durationValue: '',
      durationUnits: 'inst',
      targetType: 'creature',
      targetCount: '1',
      targetSpecial: 'creature resolving a fixed-result effect',
      rangeUnits: 'ft',
      rangeValue: '60',
      rangeSpecial: '',
      school: 'enc',
      properties: ['somatic'],
      materials: 'a cracked ring engraved with a closed loop',
      identifier: 'lotm-monster-predestination-fracture',
      activityId: 'monsterSeq3Fra03',
      now: now + 6,
      existing: existing3,
      sort: 2200702
    });

    const ability4 = buildAbilityDoc({
      id: ABILITY_4_ID,
      name: 'Prayer Resonance',
      description:
        '<p><strong>Baseline (1 Spirituality):</strong> Action. For 10 minutes, establish resonance with up to <strong>Potency</strong> willing creatures you can see within 60 feet. Once per round when one marked creature voluntarily calls for your aid (no action), you may use your reaction to answer with one effect: grant <strong>+1d4</strong> to its next d20 test, reduce incoming damage by <strong>Potency</strong>, or let it move 10 feet without provoking opportunity attacks.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> duration becomes 1 hour.</li><li><strong>+2 Spirituality:</strong> reaction response range extends to 300 feet if the target is on the same plane and you have line-of-awareness (GM adjudication).</li><li><strong>+4 Spirituality:</strong> once per minute, when you answer a prayer, also reveal one immediate danger near the caller (ambush point, trap trigger, unstable structure, or hidden hostile intent) if such danger exists.</li></ul><p><em>Counterplay:</em> anti-divination barriers, silence/severance effects, and forced separation across planes can block resonance.</p><p><em>Corruption Hook:</em> if you answer only profitable prayers while abandoning desperate allies you could save, gain 1 Corruption.</p>',
      img: 'icons/magic/light/orb-hands-humanoid-yellow.webp',
      activationType: 'action',
      durationValue: '10',
      durationUnits: 'minute',
      targetType: 'creature',
      targetCount: '',
      targetSpecial: 'up to Potency willing creatures',
      rangeUnits: 'ft',
      rangeValue: '60',
      rangeSpecial: '',
      school: 'div',
      properties: ['vocal', 'somatic', 'material'],
      materials: 'a braided cord with small silver bells',
      identifier: 'lotm-monster-prayer-resonance',
      activityId: 'monsterSeq3Pra04',
      now: now + 7,
      existing: existing4,
      sort: 2200703
    });

    await abilitiesDb.put(`!items!${ABILITY_1_ID}`, JSON.stringify(ability1));
    await abilitiesDb.put(`!items!${ABILITY_2_ID}`, JSON.stringify(ability2));
    await abilitiesDb.put(`!items!${ABILITY_3_ID}`, JSON.stringify(ability3));
    await abilitiesDb.put(`!items!${ABILITY_4_ID}`, JSON.stringify(ability4));

    const verifyPathway = await getOptionalJson(pathwaysDb, PATHWAY_KEY);
    const verifyFolder = await getOptionalJson(abilitiesDb, FOLDER_KEY);
    const verifyLegacyA = await getOptionalJson(abilitiesDb, LEGACY_A_KEY);
    const verifyLegacyB = await getOptionalJson(abilitiesDb, LEGACY_B_KEY);
    const verify1 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_1_ID}`);
    const verify2 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_2_ID}`);
    const verify3 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_3_ID}`);
    const verify4 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_4_ID}`);

    console.log(JSON.stringify({
      pathwayKey: PATHWAY_KEY,
      pathwayIdentifier: verifyPathway?.system?.identifier,
      folderKey: FOLDER_KEY,
      folderFlags: verifyFolder?.flags?.lotm,
      legacyUpdated: [
        { key: LEGACY_A_KEY, applied: String(verifyLegacyA?.system?.description?.value ?? '').includes(legacyAHeader) },
        { key: LEGACY_B_KEY, applied: String(verifyLegacyB?.system?.description?.value ?? '').includes(legacyBHeader) }
      ],
      abilitiesWritten: [`!items!${ABILITY_1_ID}`, `!items!${ABILITY_2_ID}`, `!items!${ABILITY_3_ID}`, `!items!${ABILITY_4_ID}`],
      abilityReadBack: [
        { id: verify1?._id, name: verify1?.name, sourceClass: verify1?.system?.sourceClass, identifier: verify1?.system?.identifier, grantedSequence: verify1?.flags?.lotm?.grantedSequence, level: verify1?.system?.level, folder: verify1?.folder },
        { id: verify2?._id, name: verify2?.name, sourceClass: verify2?.system?.sourceClass, identifier: verify2?.system?.identifier, grantedSequence: verify2?.flags?.lotm?.grantedSequence, level: verify2?.system?.level, folder: verify2?.folder },
        { id: verify3?._id, name: verify3?.name, sourceClass: verify3?.system?.sourceClass, identifier: verify3?.system?.identifier, grantedSequence: verify3?.flags?.lotm?.grantedSequence, level: verify3?.system?.level, folder: verify3?.folder },
        { id: verify4?._id, name: verify4?.name, sourceClass: verify4?.system?.sourceClass, identifier: verify4?.system?.identifier, grantedSequence: verify4?.flags?.lotm?.grantedSequence, level: verify4?.system?.level, folder: verify4?.folder }
      ]
    }, null, 2));
  } finally {
    await pathwaysDb.close();
    await abilitiesDb.close();
  }
})();
