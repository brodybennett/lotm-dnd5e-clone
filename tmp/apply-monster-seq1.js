const { ClassicLevel } = require('./node-tools/node_modules/classic-level');

const CORE_VERSION = '13.351';
const SYSTEM_ID = 'lotm';
const SYSTEM_VERSION = '5.2.6';
const MODIFIER = '0000000000000000';

const PATHWAY_KEY = '!items!lotmPathway00016';
const FOLDER_KEY = '!folders!FCnegTZeThIPZUlC';
const PATHWAY_IDENTIFIER = 'lotm-monster';

const LEGACY_A_KEY = '!items!lotmAbilityO2001'; // Spoken Prophecy
const LEGACY_B_KEY = '!items!lotmAbilityO9002'; // Fickle Coin

const ABILITY_1_ID = 'lotmAbilityO1001';
const ABILITY_2_ID = 'lotmAbilityO1002';
const ABILITY_3_ID = 'lotmAbilityO1003';
const ABILITY_4_ID = 'lotmAbilityO1004';

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
      '<p><strong>Sequence 1 Package (Gain Budget +74):</strong> Fated Connection, Cycle of Fate, Reboot, Dream Revelation, plus two legacy upgrades (Spoken Prophecy and Fickle Coin).</p>' +
      '<p><strong>Sequence 0 Status:</strong> Pending authoring in a later sequence-focused run.</p>' +
      '<p><strong>Continuity Anchor:</strong> At Sequence 1 (Snake of Mercury), soothsayer prophecy becomes fate architecture: cycles can be imposed, anchors can channel power across distance, and local reality can be overwritten by Reboot, but luck expenditure and interpretation error keep outcomes dangerous.</p>';
    pathway._stats = buildStats(now, pathway._stats);
    await pathwaysDb.put(PATHWAY_KEY, JSON.stringify(pathway));

    const folder = await getOptionalJson(abilitiesDb, FOLDER_KEY);
    if (!folder) throw new Error('Monster folder not found.');

    folder.description = 'Sequence abilities for the Monster pathway (authored through Sequence 1).';
    folder.flags = folder.flags ?? {};
    folder.flags.lotm = {
      ...(folder.flags.lotm ?? {}),
      pathwayIdentifier: PATHWAY_IDENTIFIER,
      latestAuthoredSequence: 1
    };
    folder._stats = buildStats(now + 1, folder._stats);
    await abilitiesDb.put(FOLDER_KEY, JSON.stringify(folder));

    const legacyA = await getOptionalJson(abilitiesDb, LEGACY_A_KEY);
    const legacyB = await getOptionalJson(abilitiesDb, LEGACY_B_KEY);
    if (!legacyA) throw new Error('Legacy target lotmAbilityO2001 not found.');
    if (!legacyB) throw new Error('Legacy target lotmAbilityO9002 not found.');

    const legacyAHeader = '<h3>Legacy Upgrade (Sequence 1 - Scope)</h3>';
    const legacyAText =
      '<p>At Sequence 1, Spoken Prophecy can be bound to a fixed medium through Snake-of-Mercury-level fate architecture. ' +
      'When you cast Spoken Prophecy, choose one object or surface within range as a prophecy medium. ' +
      'All affected creatures within 30 feet of that medium remain under the prophecy even if they leave your line of sight. ' +
      'If cast with +4 or higher upcast, the medium can be moved up to 30 feet at the start of each of your turns.</p>';
    const legacyADescription = String(legacyA.system?.description?.value ?? '');
    if (!legacyADescription.includes(legacyAHeader)) {
      legacyA.system.description.value = `${legacyADescription}${legacyAHeader}${legacyAText}`;
    }
    legacyA._stats = buildStats(now + 2, legacyA._stats);
    await abilitiesDb.put(LEGACY_A_KEY, JSON.stringify(legacyA));

    const legacyBHeader = '<h3>Legacy Upgrade (Sequence 1 - Potency)</h3>';
    const legacyBText =
      '<p>At Sequence 1, Fickle Coin can carry serpent-level fate recoil. ' +
      'When Fickle Coin resolves Misstep or Windfall, that modifier increases by <strong>Potency</strong>. ' +
      'If the result changes a d20 outcome, you also generate one Serpent Echo that lasts until end of your next turn. ' +
      'Consume Serpent Echo to add <strong>+Potency</strong> or impose <strong>-Potency</strong> on one d20 test you can see as a reaction.</p>';
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
      name: 'Fated Connection',
      description:
        '<p><strong>Baseline (2 Spirituality):</strong> Action. Establish a fate link with one creature, object, or marked surface within 60 feet for 10 minutes. While on the same plane, once per round you may originate one Monster ability from the linked anchor instead of yourself. If that ability has numeric modifiers, reduce one numeric rider by 1 (minimum 1) when cast through a link.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> maintain one additional link and extend practical link range to 1 mile.</li><li><strong>+2 Spirituality:</strong> no numeric reduction when casting through links, and linked origin ignores half cover.</li><li><strong>+4 Spirituality:</strong> when a linked cast changes an outcome, propagate a half-strength omen (+/- Potency, round down) to a second target within 10 feet of the first.</li></ul><p><em>Counterplay:</em> severing or warding the anchor medium, planar separation, and anti-connection rituals can break links.</p><p><em>Corruption Hook:</em> if you bind unaware civilians as disposable anchors, gain 1 Corruption.</p>',
      img: 'icons/magic/control/energy-stream-link-blue.webp',
      activationType: 'action',
      durationValue: '10',
      durationUnits: 'minute',
      targetType: 'creature',
      targetCount: '1',
      targetSpecial: 'one creature, object, or marked surface',
      rangeUnits: 'ft',
      rangeValue: '60',
      rangeSpecial: '',
      school: 'div',
      properties: ['vocal', 'somatic', 'material'],
      materials: 'a thread soaked in mercury and tied in a loop',
      identifier: 'lotm-monster-fated-connection',
      activityId: 'monsterSeq1Con01',
      now: now + 4,
      existing: existing1,
      sort: 2200900
    });

    const ability2 = buildAbilityDoc({
      id: ABILITY_2_ID,
      name: 'Cycle of Fate',
      description:
        '<p><strong>Baseline (3 Spirituality):</strong> Action. Choose one medium (object, mark, or terrain feature) within 120 feet. For 1 minute, create a 20-foot-radius loop around it. Enemies entering the loop for the first time on a turn or starting their turn there make a Wisdom save. On failure, they are <strong>Looped</strong> until the start of their next turn: they lose reactions and subtract <strong>Potency</strong> from their first d20 test that turn. If they repeat the same action type they used last turn, they may ignore this penalty once.</p><p>A loop ends for all creatures if the medium is destroyed.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> radius becomes 30 feet.</li><li><strong>+2 Spirituality:</strong> on failed saves, roll 2d6 and choose one additional rider: speed -10, no bonus action, or disadvantage on concentration checks until turn end.</li><li><strong>+4 Spirituality:</strong> choose one additional medium within 60 feet of the first; both zones persist and share the same duration.</li></ul><p><em>Counterplay:</em> break the medium, force movement out of zones, and stack Wisdom save support.</p><p><em>Corruption Hook:</em> if you trap allies in loops to stage outcomes, gain 1 Corruption.</p>',
      img: 'icons/magic/time/clock-stopwatch-white-blue.webp',
      activationType: 'action',
      durationValue: '1',
      durationUnits: 'minute',
      targetType: 'creature',
      targetCount: '',
      targetSpecial: 'creatures in a 20-foot-radius loop',
      rangeUnits: 'ft',
      rangeValue: '120',
      rangeSpecial: '',
      school: 'enc',
      properties: ['vocal', 'somatic'],
      materials: 'a chalk wheel with a broken spoke',
      identifier: 'lotm-monster-cycle-of-fate',
      activityId: 'monsterSeq1Cyc02',
      now: now + 5,
      existing: existing2,
      sort: 2200901
    });

    const ability3 = buildAbilityDoc({
      id: ABILITY_3_ID,
      name: 'Reboot',
      description:
        '<p><strong>Baseline (4 Spirituality):</strong> Action. Save the state of a 30-foot-radius area within 60 feet for up to 1 minute. While saved, you may use a reaction to trigger Reboot when a creature in the area is hit, fails a save, or a major environmental change occurs. On Reboot, creatures and unattended objects in the area return to their saved positions; one post-save condition per creature is removed, and one terrain/object change is undone. Luck consumed or gained after the save point is not restored.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> area radius becomes 60 feet.</li><li><strong>+2 Spirituality:</strong> exempt up to <strong>Potency</strong> creatures from rewinding.</li><li><strong>+4 Spirituality:</strong> if Reboot changes an outcome, choose one creature in area: ally gains temporary HP equal to <strong>2 x Potency</strong>, or enemy takes psychic damage equal to <strong>Potency</strong> and loses reactions until start of its next turn.</li></ul><p><em>Counterplay:</em> pressure outside saved area, reaction denial, and anti-fate/null zones prevent reliable resets.</p><p><em>Corruption Hook:</em> if you repeatedly Reboot scenes to erase accountability for deliberate harm, gain 1 Corruption.</p>',
      img: 'icons/magic/time/arrows-circling-green.webp',
      activationType: 'action',
      durationValue: '1',
      durationUnits: 'minute',
      targetType: 'creature',
      targetCount: '',
      targetSpecial: 'creatures and objects in a 30-foot-radius area',
      rangeUnits: 'ft',
      rangeValue: '60',
      rangeSpecial: '',
      school: 'trs',
      properties: ['vocal', 'somatic', 'material'],
      materials: 'a folded paper crane marked with a spiral',
      identifier: 'lotm-monster-reboot',
      activityId: 'monsterSeq1Reb03',
      now: now + 6,
      existing: existing3,
      sort: 2200902
    });

    const ability4 = buildAbilityDoc({
      id: ABILITY_4_ID,
      name: 'Dream Revelation',
      description:
        '<p><strong>Baseline (1 Spirituality):</strong> Action. Touch or target one willing creature you can see within 30 feet and seed a revelation for 24 hours. The next time that creature sleeps, it receives a clear omen dream. On waking, it gains one Revelation token (max 1). It may spend that token for one of the following: add <strong>Potency</strong> to a d20 test, gain advantage on initiative, or ask the GM one immediate-danger question that must be answered truthfully but cryptically.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> affect one additional willing creature.</li><li><strong>+2 Spirituality:</strong> each affected creature gains two tokens instead of one (max 2).</li><li><strong>+4 Spirituality:</strong> when a token is spent to avoid danger, the user may move up to 15 feet without provoking opportunity attacks and gains <strong>+Potency</strong> on one saving throw made before end of its next turn.</li></ul><p><em>Counterplay:</em> dream-severing wards, sleepless conditions, and spirit-world interference can block delivery.</p><p><em>Corruption Hook:</em> if you implant manipulated revelations to control followers, gain 1 Corruption.</p>',
      img: 'icons/magic/light/orb-hands-humanoid-yellow.webp',
      activationType: 'action',
      durationValue: '24',
      durationUnits: 'hour',
      targetType: 'creature',
      targetCount: '1',
      targetSpecial: 'one willing creature',
      rangeUnits: 'ft',
      rangeValue: '30',
      rangeSpecial: '',
      school: 'div',
      properties: ['vocal', 'somatic'],
      materials: 'a drop of sleepwater in a glass bead',
      identifier: 'lotm-monster-dream-revelation',
      activityId: 'monsterSeq1Drm04',
      now: now + 7,
      existing: existing4,
      sort: 2200903
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
