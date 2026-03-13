const { ClassicLevel } = require('./node-tools/node_modules/classic-level');

const CORE_VERSION = '13.351';
const SYSTEM_ID = 'lotm';
const SYSTEM_VERSION = '5.2.6';
const MODIFIER = '0000000000000000';

const PATHWAY_KEY = '!items!lotmPathway00016';
const FOLDER_KEY = '!folders!FCnegTZeThIPZUlC';
const PATHWAY_IDENTIFIER = 'lotm-monster';

const LEGACY_A_KEY = '!items!lotmAbilityO4001'; // Misfortune Field
const LEGACY_B_KEY = '!items!lotmAbilityO9002'; // Fickle Coin

const ABILITY_1_ID = 'lotmAbilityO2001';
const ABILITY_2_ID = 'lotmAbilityO2002';
const ABILITY_3_ID = 'lotmAbilityO2003';
const ABILITY_4_ID = 'lotmAbilityO2004';

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
      level: 7,
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
        grantedSequence: 2
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
      '<p><strong>Sequence 2 Package (Gain Budget +50):</strong> Spoken Prophecy, Revelation of Fate, Words of Fortune, Inevitable Node, plus two legacy upgrades (Misfortune Field and Fickle Coin).</p>' +
      '<p><strong>Sequence 1-0 Status:</strong> Pending authoring in later sequence-focused runs.</p>' +
      '<p><strong>Continuity Anchor:</strong> At Sequence 2 (Soothsayer), chaos authority consolidates into fate decree. Spoken prophecies now strongly bias reality, but interpretation mistakes and luck recoil keep outcomes perilous and nonlinear.</p>';
    pathway._stats = buildStats(now, pathway._stats);
    await pathwaysDb.put(PATHWAY_KEY, JSON.stringify(pathway));

    const folder = await getOptionalJson(abilitiesDb, FOLDER_KEY);
    if (!folder) throw new Error('Monster folder not found.');

    folder.description = 'Sequence abilities for the Monster pathway (authored through Sequence 2).';
    folder.flags = folder.flags ?? {};
    folder.flags.lotm = {
      ...(folder.flags.lotm ?? {}),
      pathwayIdentifier: PATHWAY_IDENTIFIER,
      latestAuthoredSequence: 2
    };
    folder._stats = buildStats(now + 1, folder._stats);
    await abilitiesDb.put(FOLDER_KEY, JSON.stringify(folder));

    const legacyA = await getOptionalJson(abilitiesDb, LEGACY_A_KEY);
    const legacyB = await getOptionalJson(abilitiesDb, LEGACY_B_KEY);
    if (!legacyA) throw new Error('Legacy target lotmAbilityO4001 not found.');
    if (!legacyB) throw new Error('Legacy target lotmAbilityO9002 not found.');

    const legacyAHeader = '<h3>Legacy Upgrade (Sequence 2 - Scope)</h3>';
    const legacyAText =
      '<p>At Sequence 2, Misfortune Field can be split into fate nodes. ' +
      'When you cast Misfortune Field, you may anchor one secondary 15-foot-radius node within 60 feet of the main aura. ' +
      'Creatures entering either zone trigger the field once per round total. ' +
      'If Misfortune Field is cast with +4 or higher upcast, the secondary node expands to 20 feet and can be repositioned 15 feet at the start of each of your turns.</p>';
    const legacyADescription = String(legacyA.system?.description?.value ?? '');
    if (!legacyADescription.includes(legacyAHeader)) {
      legacyA.system.description.value = `${legacyADescription}${legacyAHeader}${legacyAText}`;
    }
    legacyA._stats = buildStats(now + 2, legacyA._stats);
    await abilitiesDb.put(LEGACY_A_KEY, JSON.stringify(legacyA));

    const legacyBHeader = '<h3>Legacy Upgrade (Sequence 2 - Efficiency)</h3>';
    const legacyBText =
      '<p>At Sequence 2, Fickle Coin becomes a free-floating omen trigger. ' +
      'Once per round after you cast any Monster ability with a Spirituality cost of 1 or more, you may apply Fickle Coin to one creature within 30 feet without spending an action. ' +
      'If this free trigger resolves Windfall or Misstep, you also gain one <strong>Fate Echo</strong>. At the end of your turn, consume Fate Echo to reduce the next +1 upcast surcharge you pay before the end of your next turn by 1 (minimum 0).</p>';
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
      name: 'Spoken Prophecy',
      description:
        '<p><strong>Baseline (3 Spirituality):</strong> Action. Speak a fate clause over up to <strong>Potency</strong> creatures you can see within 120 feet for 1 minute. Choose one mode for each target: <strong>Rise</strong> (ally) or <strong>Fall</strong> (enemy). The first time each affected creature makes a d20 test each round, roll 1d6:</p><ul><li><strong>1-2 Drifting Omen:</strong> apply +1 (Rise) or -1 (Fall).</li><li><strong>3-4 Anchored Omen:</strong> apply +Potency (Rise) or -Potency (Fall).</li><li><strong>5-6 Manifest Omen:</strong> force a reroll (ally keeps higher / enemy keeps lower).</li></ul><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> roll 2d6 for each trigger and choose the omen result.</li><li><strong>+2 Spirituality:</strong> if Manifest Omen changes an outcome, one creature within 15 feet of the trigger gains the corresponding +1d4 or -1d4 on its next d20 test.</li><li><strong>+4 Spirituality:</strong> duration becomes 10 minutes and each affected creature can trigger one additional omen during the duration.</li></ul><p><em>Counterplay:</em> anti-reroll effects, line-of-sight denial, and disruptive silence can limit prophetic enforcement.</p><p><em>Corruption Hook:</em> if you deliberately issue cruel prophecies to break allies\' morale, gain 1 Corruption.</p>',
      img: 'icons/magic/symbols/rune-sigil-green-purple.webp',
      activationType: 'action',
      durationValue: '1',
      durationUnits: 'minute',
      targetType: 'creature',
      targetCount: '',
      targetSpecial: 'up to Potency creatures',
      rangeUnits: 'ft',
      rangeValue: '120',
      rangeSpecial: '',
      school: 'div',
      properties: ['vocal', 'somatic'],
      materials: 'a ribbon inscribed with three unfinished predictions',
      identifier: 'lotm-monster-spoken-prophecy',
      activityId: 'monsterSeq2Pro01',
      now: now + 4,
      existing: existing1,
      sort: 2200800
    });

    const ability2 = buildAbilityDoc({
      id: ABILITY_2_ID,
      name: 'Revelation of Fate',
      description:
        '<p><strong>Baseline (2 Spirituality):</strong> Action. Draw from the River of Fate and mark up to <strong>Potency</strong> creatures within 60 feet for 1 minute. Once per round when a marked creature rolls a d20, you may use your reaction to reveal a strand:</p><ul><li><strong>Guiding Strand (ally):</strong> add <strong>Potency</strong> to the roll.</li><li><strong>Ruin Strand (enemy):</strong> subtract <strong>Potency</strong> from the roll.</li></ul><p>After each revealed strand, roll 1d6 misread check. On a 1, reverse that strand effect (sign flips) and you take psychic damage equal to Potency.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> mark one additional creature and increase range to 120 feet.</li><li><strong>+2 Spirituality:</strong> the first strand you reveal each round ignores misread reversal.</li><li><strong>+4 Spirituality:</strong> once per round when your strand changes an outcome, recover 1 Spirituality (minimum total cost 1 for this cast).</li></ul><p><em>Counterplay:</em> reaction lockout, obscured triggers, and anti-divination zones reduce revelation reliability.</p><p><em>Corruption Hook:</em> if you hide true revelations to steer allies into avoidable suffering, gain 1 Corruption.</p>',
      img: 'icons/magic/perception/orb-crystal-ball-scrying.webp',
      activationType: 'action',
      durationValue: '1',
      durationUnits: 'minute',
      targetType: 'creature',
      targetCount: '',
      targetSpecial: 'up to Potency creatures',
      rangeUnits: 'ft',
      rangeValue: '60',
      rangeSpecial: '',
      school: 'div',
      properties: ['vocal', 'somatic', 'material'],
      materials: 'a droplet of water stored in a silver vial',
      identifier: 'lotm-monster-revelation-of-fate',
      activityId: 'monsterSeq2Rev02',
      now: now + 5,
      existing: existing2,
      sort: 2200801
    });

    const ability3 = buildAbilityDoc({
      id: ABILITY_3_ID,
      name: 'Words of Fortune',
      description:
        '<p><strong>Baseline (3 Spirituality):</strong> Action. Pronounce blessing or misfortune over up to <strong>Potency</strong> creatures within 300 feet for 1 minute. Blessed creatures gain <strong>+1d6</strong> on their first d20 test each round. Cursed creatures take <strong>-1d6</strong> on their first d20 test each round (Wisdom save negates on initial application for hostile targets).</p><p>Whenever a blessed creature rolls a natural 20 or a cursed creature rolls a natural 1 while this effect is active, fate spills: choose one creature within 10 feet of that roller to gain a one-time +1d4 (from blessing) or -1d4 (from curse) on its next d20 test.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> double the number of targets.</li><li><strong>+2 Spirituality:</strong> bonus/penalty die becomes <strong>Potency</strong> (minimum 2).</li><li><strong>+4 Spirituality:</strong> once during the duration, you may flip one creature\'s state from blessed to cursed or cursed to blessed (hostile targets repeat the Wisdom save).</li></ul><p><em>Counterplay:</em> save support, curse cleansing, and forced target dispersion blunt wide-area influence.</p><p><em>Corruption Hook:</em> if you casually unleash lethal bad luck on weak bystanders, gain 1 Corruption.</p>',
      img: 'icons/magic/control/debuff-chains-shackles-magic.webp',
      activationType: 'action',
      durationValue: '1',
      durationUnits: 'minute',
      targetType: 'creature',
      targetCount: '',
      targetSpecial: 'up to Potency creatures',
      rangeUnits: 'ft',
      rangeValue: '300',
      rangeSpecial: '',
      school: 'enc',
      properties: ['vocal', 'somatic'],
      materials: 'a small silver bell with a cracked clapper',
      identifier: 'lotm-monster-words-of-fortune',
      activityId: 'monsterSeq2Wrd03',
      now: now + 6,
      existing: existing3,
      sort: 2200802
    });

    const ability4 = buildAbilityDoc({
      id: ABILITY_4_ID,
      name: 'Inevitable Node',
      description:
        '<p><strong>Baseline (1 Spirituality):</strong> Bonus action. Mark one creature you can see within 60 feet with a fate beacon for 1 minute. Choose one declared outcome: <strong>Land a hit</strong>, <strong>Pass a save</strong>, <strong>Reach a point</strong>, or <strong>Avoid a hit</strong>. The first time this outcome would fail by 5 or less, roll 1d8:</p><ul><li><strong>1-2 Fracture:</strong> node fails; target suffers <strong>-Potency</strong> on its next d20 test.</li><li><strong>3-8 Convergence:</strong> convert that failure into success by +Potency, then target takes <strong>-Potency</strong> on its next d20 test (fate recoil).</li></ul><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> node can trigger twice before ending.</li><li><strong>+2 Spirituality:</strong> Convergence range improves to 2-8 on the d8.</li><li><strong>+4 Spirituality:</strong> when Convergence triggers, you may clear the fate recoil and allow the target to move 15 feet without provoking opportunity attacks.</li></ul><p><em>Counterplay:</em> effects that force failures by large margins, anti-fate wards, and target isolation weaken node reliability.</p><p><em>Corruption Hook:</em> if you engineer allies into danger solely to test your beacon theory, gain 1 Corruption.</p>',
      img: 'icons/magic/time/hourglass-brown-orange.webp',
      activationType: 'bonus',
      durationValue: '1',
      durationUnits: 'minute',
      targetType: 'creature',
      targetCount: '1',
      targetSpecial: 'one creature you can see',
      rangeUnits: 'ft',
      rangeValue: '60',
      rangeSpecial: '',
      school: 'abj',
      properties: ['somatic', 'material'],
      materials: 'a chalk sigil drawn from powdered shell',
      identifier: 'lotm-monster-inevitable-node',
      activityId: 'monsterSeq2Nod04',
      now: now + 7,
      existing: existing4,
      sort: 2200803
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
