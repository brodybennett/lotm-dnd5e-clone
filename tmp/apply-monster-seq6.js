const { ClassicLevel } = require('./node-tools/node_modules/classic-level');

const CORE_VERSION = '13.351';
const SYSTEM_ID = 'lotm';
const SYSTEM_VERSION = '5.2.6';
const MODIFIER = '0000000000000000';

const PATHWAY_KEY = '!items!lotmPathway00016';
const FOLDER_KEY = '!folders!FCnegTZeThIPZUlC';
const PATHWAY_IDENTIFIER = 'lotm-monster';

const LEGACY_A_KEY = '!items!lotmAbilityO9002'; // Fickle Coin
const LEGACY_B_KEY = '!items!lotmAbilityO7003'; // Sudden Reversal

const ABILITY_1_ID = 'lotmAbilityO6001';
const ABILITY_2_ID = 'lotmAbilityO6002';
const ABILITY_3_ID = 'lotmAbilityO6003';

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
      '<p><strong>Sequence 5-0 Status:</strong> Pending authoring in later sequence-focused runs.</p>' +
      '<p><strong>Continuity Anchor:</strong> At Sequence 6 (Calamity Priest), Lucky One fate cycling hardens into active disaster steering: misfortune can be drawn, amplified, and redirected, but outcomes remain volatile rather than fully controlled.</p>';
    pathway._stats = buildStats(now, pathway._stats);
    await pathwaysDb.put(PATHWAY_KEY, JSON.stringify(pathway));

    const folder = await getOptionalJson(abilitiesDb, FOLDER_KEY);
    if (!folder) throw new Error('Monster folder not found.');

    folder.description = 'Sequence abilities for the Monster pathway (authored through Sequence 6).';
    folder.flags = folder.flags ?? {};
    folder.flags.lotm = {
      ...(folder.flags.lotm ?? {}),
      pathwayIdentifier: PATHWAY_IDENTIFIER,
      latestAuthoredSequence: 6
    };
    folder._stats = buildStats(now + 1, folder._stats);
    await abilitiesDb.put(FOLDER_KEY, JSON.stringify(folder));

    const legacyA = await getOptionalJson(abilitiesDb, LEGACY_A_KEY);
    const legacyB = await getOptionalJson(abilitiesDb, LEGACY_B_KEY);
    if (!legacyA) throw new Error('Legacy target lotmAbilityO9002 not found.');
    if (!legacyB) throw new Error('Legacy target lotmAbilityO7003 not found.');

    const legacyAHeader = '<h3>Legacy Upgrade (Sequence 6 - Potency)</h3>';
    const legacyAText =
      '<p>At Sequence 6, Fickle Coin carries sharper impact when fate spikes. ' +
      'When Fickle Coin resolves Misstep or Windfall, increase that numeric modifier by <strong>Potency</strong> (applies once per resolved coin face). ' +
      'If cast with +2 or higher upcast, you may ignore one neutral Sidestep result and reroll that face once.</p>';
    const legacyADescription = String(legacyA.system?.description?.value ?? '');
    if (!legacyADescription.includes(legacyAHeader)) {
      legacyA.system.description.value = `${legacyADescription}${legacyAHeader}${legacyAText}`;
    }
    legacyA._stats = buildStats(now + 2, legacyA._stats);
    await abilitiesDb.put(LEGACY_A_KEY, JSON.stringify(legacyA));

    const legacyBHeader = '<h3>Legacy Upgrade (Sequence 6 - Scope)</h3>';
    const legacyBText =
      '<p>At Sequence 6, Sudden Reversal can echo through linked outcomes. ' +
      'When you trigger a successful reversal, choose one additional creature within 10 feet of the triggering creature. ' +
      'That second creature takes <strong>-1d4</strong> on its next d20 test before the end of its next turn. ' +
      'If you spent +2 or more on Sudden Reversal, this echo penalty becomes <strong>-Potency</strong>.</p>';
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
      name: 'Calamity Attraction',
      description:
        '<p><strong>Baseline (1 Spirituality):</strong> Action. Mark one creature within 60 feet for 1 minute (Wisdom save ends at end of each turn). While marked, the first time each round that creature makes an attack roll or ability check, roll 1d6:</p><ul><li><strong>1-2 Slip:</strong> subtract <strong>1d4</strong> from that roll.</li><li><strong>3-4 Wobble:</strong> no roll change, but its speed is reduced by 10 feet until end of turn.</li><li><strong>5-6 Backlash:</strong> the creature takes psychic damage equal to <strong>Potency</strong>.</li></ul><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> mark one additional creature in range (separate save).</li><li><strong>+2 Spirituality:</strong> roll 2d6 for each trigger and choose which fate result applies.</li><li><strong>+4 Spirituality:</strong> when Backlash occurs, one ally within 30 feet gains <strong>+Potency</strong> to its next d20 test before the end of its next turn.</li></ul><p><em>Counterplay:</em> luck-sealing wards, save bonuses, and attack patterns that avoid checks reduce attraction value.</p><p><em>Corruption Hook:</em> if you deliberately pull calamity onto harmless civilians to test fate, gain 1 Corruption.</p>',
      img: 'icons/magic/death/skull-energy-light-blue.webp',
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
      materials: 'a blackened six-sided die',
      identifier: 'lotm-monster-calamity-attraction',
      activityId: 'monsterSeq6Cal01',
      now: now + 4,
      existing: existing1,
      sort: 2200400
    });

    const ability2 = buildAbilityDoc({
      id: ABILITY_2_ID,
      name: 'Psyche Storm',
      description:
        '<p><strong>Baseline (1 Spirituality):</strong> Action. Unleash a psychic squall in a 15-foot-radius sphere within 60 feet. Creatures in area make a Wisdom save. On failure, they take psychic damage equal to <strong>Potency</strong> and cannot take reactions until the start of your next turn. On success, they take half damage and keep reactions.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> radius becomes 20 feet.</li><li><strong>+2 Spirituality:</strong> failed targets also subtract <strong>1d4</strong> from their next d20 test before end of their next turn.</li><li><strong>+4 Spirituality:</strong> storm lingers for 1 minute; at start of each affected creature\'s turn, it repeats the save, taking Potency psychic damage on failure (ends for that creature on success).</li></ul><p><em>Counterplay:</em> psychic resistance/immunity, dispersed positioning, and cover from line of effect reduce impact.</p><p><em>Corruption Hook:</em> if you trigger storms in crowded noncombat spaces for spectacle, gain 1 Corruption.</p>',
      img: 'icons/magic/sonic/projectile-sound-rings-wave.webp',
      activationType: 'action',
      durationValue: '',
      durationUnits: 'inst',
      targetType: 'creature',
      targetCount: '',
      targetSpecial: 'creatures in a 15-foot-radius sphere',
      rangeUnits: 'ft',
      rangeValue: '60',
      rangeSpecial: '',
      school: 'div',
      properties: ['vocal', 'somatic'],
      materials: 'a cracked tuning fork',
      identifier: 'lotm-monster-psyche-storm',
      activityId: 'monsterSeq6Psy02',
      now: now + 5,
      existing: existing2,
      sort: 2200401
    });

    const ability3 = buildAbilityDoc({
      id: ABILITY_3_ID,
      name: 'Disaster Skim',
      description:
        '<p><strong>Baseline (0 Spirituality):</strong> Reaction when you or one ally within 30 feet would take damage from an attack, trap, or area effect. Roll 1d6:</p><ul><li><strong>1-2 Grazed:</strong> no reduction, but the target may move 5 feet without provoking opportunity attacks from the triggering source.</li><li><strong>3-4 Skim:</strong> reduce triggering damage by <strong>Potency</strong>.</li><li><strong>5-6 Clean Escape:</strong> reduce triggering damage by <strong>2 x Potency</strong>, then choose one enemy within 30 feet of the trigger; it takes psychic damage equal to Potency.</li></ul><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> roll 2d6 and choose which result applies.</li><li><strong>+2 Spirituality:</strong> you may protect one additional ally within 10 feet of the original target with the same rolled result.</li><li><strong>+4 Spirituality:</strong> if Clean Escape is chosen, affected allies gain advantage on their next Dexterity save before the end of their next turn.</li></ul><p><em>Counterplay:</em> anti-teleport fields, unavoidable effects, and reaction denial reduce skim reliability.</p><p><em>Corruption Hook:</em> if you repeatedly let allies absorb danger while hoarding high rolls for yourself, gain 1 Corruption.</p>',
      img: 'icons/magic/time/arrows-circling-green.webp',
      activationType: 'reaction',
      durationValue: '',
      durationUnits: 'inst',
      targetType: 'ally',
      targetCount: '1',
      targetSpecial: 'self or one ally within 30 feet',
      rangeUnits: 'ft',
      rangeValue: '30',
      rangeSpecial: '',
      school: 'abj',
      properties: ['somatic'],
      materials: 'a coin with a drilled hole',
      identifier: 'lotm-monster-disaster-skim',
      activityId: 'monsterSeq6Dis03',
      now: now + 6,
      existing: existing3,
      sort: 2200402
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