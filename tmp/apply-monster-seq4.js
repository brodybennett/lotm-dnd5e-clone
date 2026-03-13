const { ClassicLevel } = require('./node-tools/node_modules/classic-level');

const CORE_VERSION = '13.351';
const SYSTEM_ID = 'lotm';
const SYSTEM_VERSION = '5.2.6';
const MODIFIER = '0000000000000000';

const PATHWAY_KEY = '!items!lotmPathway00016';
const FOLDER_KEY = '!folders!FCnegTZeThIPZUlC';
const PATHWAY_IDENTIFIER = 'lotm-monster';

const LEGACY_A_KEY = '!items!lotmAbilityO6002'; // Psyche Storm
const LEGACY_B_KEY = '!items!lotmAbilityO5001'; // Curse of Misfortune

const ABILITY_1_ID = 'lotmAbilityO4001';
const ABILITY_2_ID = 'lotmAbilityO4002';
const ABILITY_3_ID = 'lotmAbilityO4003';
const ABILITY_4_ID = 'lotmAbilityO4004';

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
      '<p><strong>Sequence 3-0 Status:</strong> Pending authoring in later sequence-focused runs.</p>' +
      '<p><strong>Continuity Anchor:</strong> At Sequence 4 (Misfortune Mage), Winner-grade luck banking evolves into broad bad-luck projection and selective blessing. Fate pressure intensifies and can threaten lives, but outcomes remain chaotic rather than guaranteed.</p>';
    pathway._stats = buildStats(now, pathway._stats);
    await pathwaysDb.put(PATHWAY_KEY, JSON.stringify(pathway));

    const folder = await getOptionalJson(abilitiesDb, FOLDER_KEY);
    if (!folder) throw new Error('Monster folder not found.');

    folder.description = 'Sequence abilities for the Monster pathway (authored through Sequence 4).';
    folder.flags = folder.flags ?? {};
    folder.flags.lotm = {
      ...(folder.flags.lotm ?? {}),
      pathwayIdentifier: PATHWAY_IDENTIFIER,
      latestAuthoredSequence: 4
    };
    folder._stats = buildStats(now + 1, folder._stats);
    await abilitiesDb.put(FOLDER_KEY, JSON.stringify(folder));

    const legacyA = await getOptionalJson(abilitiesDb, LEGACY_A_KEY);
    const legacyB = await getOptionalJson(abilitiesDb, LEGACY_B_KEY);
    if (!legacyA) throw new Error('Legacy target lotmAbilityO6002 not found.');
    if (!legacyB) throw new Error('Legacy target lotmAbilityO5001 not found.');

    const legacyAHeader = '<h3>Legacy Upgrade (Sequence 4 - Potency)</h3>';
    const legacyAText =
      '<p>At Sequence 4, Psyche Storm acquires destabilizing madness edges. ' +
      'When a creature fails the save against Psyche Storm, it also suffers <strong>Mind Static</strong> until the start of your next turn: it cannot benefit from advantage on Intelligence, Wisdom, or Charisma d20 tests. ' +
      'If Psyche Storm was cast with +2 or higher upcast, Mind Static also imposes <strong>-Potency</strong> on the first such d20 test the creature makes before the effect ends.</p>';
    const legacyADescription = String(legacyA.system?.description?.value ?? '');
    if (!legacyADescription.includes(legacyAHeader)) {
      legacyA.system.description.value = `${legacyADescription}${legacyAHeader}${legacyAText}`;
    }
    legacyA._stats = buildStats(now + 2, legacyA._stats);
    await abilitiesDb.put(LEGACY_A_KEY, JSON.stringify(legacyA));

    const legacyBHeader = '<h3>Legacy Upgrade (Sequence 4 - Scope)</h3>';
    const legacyBText =
      '<p>At Sequence 4, Curse of Misfortune can escalate through fate spillover. ' +
      'When a cursed target triggers Spill, choose one creature within 10 feet of it; that creature suffers a lesser mishap (either <strong>-1d4</strong> on its next d20 test or psychic damage equal to <strong>Potency</strong>). ' +
      'If Curse of Misfortune was cast with +2 or higher upcast, you may affect two nearby creatures instead of one.</p>';
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
      name: 'Misfortune Field',
      description:
        '<p><strong>Baseline (2 Spirituality):</strong> Action. For 1 minute, project a 20-foot-radius aura centered on yourself. Enemies that enter the aura for the first time on a turn or start their turn there make a Wisdom save. On a failure, roll 1d6:</p><ul><li><strong>1-2 Crooked Step:</strong> subtract <strong>Potency</strong> from the creature\'s next d20 test before the start of its next turn.</li><li><strong>3-4 Tangled Course:</strong> speed is halved and it cannot take reactions until end of turn.</li><li><strong>5-6 Falling Sign:</strong> creature takes psychic damage equal to <strong>Potency</strong> and has disadvantage on its next attack roll.</li></ul><p>On a success, it takes only the Falling Sign psychic damage rider at half value (round down, minimum 1) and no other effect.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> aura radius becomes 30 feet.</li><li><strong>+2 Spirituality:</strong> roll 2d6 on failed saves and choose which misfortune result applies.</li><li><strong>+4 Spirituality:</strong> choose up to <strong>Potency</strong> allies in aura at cast time; they are ignored by the aura and gain <strong>+1d4</strong> on their first d20 test each round while inside it.</li></ul><p><em>Counterplay:</em> forced movement to break aura contact, Wisdom-save boosts, and long-range pressure reduce field control.</p><p><em>Corruption Hook:</em> if you keep civilians inside your field to watch calamity unfold, gain 1 Corruption.</p>',
      img: 'icons/magic/control/debuff-energy-hold-purple-pink.webp',
      activationType: 'action',
      durationValue: '1',
      durationUnits: 'minute',
      targetType: 'self',
      targetCount: '1',
      targetSpecial: '20-foot aura centered on self',
      rangeUnits: 'self',
      rangeValue: null,
      rangeSpecial: '',
      school: 'enc',
      properties: ['vocal', 'somatic'],
      materials: 'a knot of black thread wrapped around a mercury bead',
      identifier: 'lotm-monster-misfortune-field',
      activityId: 'monsterSeq4Mis01',
      now: now + 4,
      existing: existing1,
      sort: 2200600
    });

    const ability2 = buildAbilityDoc({
      id: ABILITY_2_ID,
      name: 'Group Blessing',
      description:
        '<p><strong>Baseline (2 Spirituality):</strong> Action. Choose up to <strong>Potency</strong> creatures within 30 feet. Each target gains a luck mark for 1 minute. The first time each marked creature makes an attack roll, ability check, or saving throw each round, it adds <strong>1d4</strong>. If a marked creature currently suffers one Monster-pathway misfortune effect, that creature may remove one such effect when it receives this blessing.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> increase range to 60 feet and add one additional target.</li><li><strong>+2 Spirituality:</strong> bonus die becomes <strong>Potency</strong> (minimum +2) for each marked creature\'s first d20 test each round.</li><li><strong>+4 Spirituality:</strong> when a marked creature uses its bonus, it may immediately move 10 feet without provoking opportunity attacks.</li></ul><p><em>Counterplay:</em> dispersion, line-of-sight denial, and anti-buff suppression can limit blessing impact.</p><p><em>Corruption Hook:</em> if you drain allies\' luck reserves without consent for repeated blessing cycles, gain 1 Corruption.</p>',
      img: 'icons/magic/light/hand-sparks-smoke-blue.webp',
      activationType: 'action',
      durationValue: '1',
      durationUnits: 'minute',
      targetType: 'creature',
      targetCount: '',
      targetSpecial: 'up to Potency creatures in 30 feet',
      rangeUnits: 'ft',
      rangeValue: '30',
      rangeSpecial: '',
      school: 'abj',
      properties: ['vocal', 'somatic', 'material'],
      materials: 'a polished silver token etched with a spiral wheel',
      identifier: 'lotm-monster-group-blessing',
      activityId: 'monsterSeq4Grp02',
      now: now + 5,
      existing: existing2,
      sort: 2200601
    });

    const ability3 = buildAbilityDoc({
      id: ABILITY_3_ID,
      name: 'Absolute Foresight',
      description:
        '<p><strong>Baseline (1 Spirituality):</strong> Reaction when a creature you can see within 60 feet is about to make a d20 test. You glimpse one probable branch and roll 1d6:</p><ul><li><strong>1-2 False Omen:</strong> your read is wrong; target gains <strong>+1</strong> or <strong>-1</strong> (your choice) to the roll.</li><li><strong>3-4 Narrow Omen:</strong> target adds or subtracts <strong>Potency</strong> (your choice).</li><li><strong>5-6 Sharp Omen:</strong> force a reroll; ally keeps higher or enemy keeps lower.</li></ul><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> roll 2d6 and choose which omen band applies.</li><li><strong>+2 Spirituality:</strong> after resolving the omen, you may immediately identify one hidden immediate danger in 60 feet (trap trigger, ambush angle, unstable terrain, or similar).</li><li><strong>+4 Spirituality:</strong> if Sharp Omen changes the outcome, target also gains/loses <strong>Potency</strong> on its next d20 test before end of its next turn (sign follows your ally/enemy choice).</li></ul><p><em>Counterplay:</em> hidden information outside your senses, anti-divination effects, and reroll immunity reduce control.</p><p><em>Corruption Hook:</em> if you exploit foreknowledge to stage disasters for amusement, gain 1 Corruption.</p>',
      img: 'icons/magic/perception/eye-tendrils-web-purple.webp',
      activationType: 'reaction',
      durationValue: '',
      durationUnits: 'inst',
      targetType: 'creature',
      targetCount: '1',
      targetSpecial: 'creature you can see about to make a d20 test',
      rangeUnits: 'ft',
      rangeValue: '60',
      rangeSpecial: '',
      school: 'div',
      properties: ['somatic'],
      materials: 'an eye-mask stitched with silver thread',
      identifier: 'lotm-monster-absolute-foresight',
      activityId: 'monsterSeq4For03',
      now: now + 6,
      existing: existing3,
      sort: 2200602
    });

    const ability4 = buildAbilityDoc({
      id: ABILITY_4_ID,
      name: 'Mercury Body',
      description:
        '<p><strong>Baseline (0 Spirituality):</strong> Bonus action. Assume a flowing mercury-body state for 1 minute. While active, you gain resistance to bludgeoning, piercing, and slashing damage from nonmagical attacks, advantage on checks/saves against being grappled or restrained, and creatures have disadvantage on attempts to read your future via divination effects at or below your sequence authority.</p><p>Once per round when you take damage while this state is active, roll 1d4:</p><ul><li><strong>1 Stiffen:</strong> no reduction.</li><li><strong>2-3 Flow:</strong> reduce damage by <strong>Potency</strong>.</li><li><strong>4 Slip:</strong> reduce damage by <strong>2 x Potency</strong> and move 5 feet without provoking opportunity attacks from the source.</li></ul><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> roll 2d4 for the once-per-round reduction and choose the result.</li><li><strong>+2 Spirituality:</strong> when Slip triggers, one ally within 30 feet gains <strong>+1d4</strong> on its next saving throw before end of its next turn.</li><li><strong>+4 Spirituality:</strong> for the duration, the first hostile divination each round targeting you or one ally within 30 feet automatically fails unless the source succeeds on a high-difficulty sequence contest set by the GM.</li></ul><p><em>Counterplay:</em> magic weapon pressure, forced saves that avoid attack damage, and anti-transmutation fields reduce durability value.</p><p><em>Corruption Hook:</em> if you hide in false omens to abandon allies to their fate, gain 1 Corruption.</p>',
      img: 'icons/magic/water/heart-ice-freeze.webp',
      activationType: 'bonus',
      durationValue: '1',
      durationUnits: 'minute',
      targetType: 'self',
      targetCount: '1',
      targetSpecial: 'self',
      rangeUnits: 'self',
      rangeValue: null,
      rangeSpecial: '',
      school: 'trs',
      properties: ['somatic', 'material'],
      materials: 'a drop of quicksilver sealed in glass',
      identifier: 'lotm-monster-mercury-body',
      activityId: 'monsterSeq4Mer04',
      now: now + 7,
      existing: existing4,
      sort: 2200603
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
