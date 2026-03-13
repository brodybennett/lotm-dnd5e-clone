const { ClassicLevel } = require('./node-tools/node_modules/classic-level');

const CORE_VERSION = '13.351';
const SYSTEM_ID = 'lotm';
const SYSTEM_VERSION = '5.2.6';
const MODIFIER = '0000000000000000';

const PATHWAY_NAME = 'Savant';
const PATHWAY_IDENTIFIER = 'lotm-savant';
const DEFAULT_PATHWAY_ID = 'lotmPathway00015';
const FOLDER_ID = 'UYUzB1Ws2OvdbFzG';

const LEGACY_A_ID = 'lotmAbilityT7003';
const LEGACY_B_ID = 'lotmAbilityT6001';

const ABILITY_1_ID = 'lotmAbilityT5001';
const ABILITY_2_ID = 'lotmAbilityT5002';
const ABILITY_3_ID = 'lotmAbilityT5003';
const ABILITY_4_ID = 'lotmAbilityT5004';

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
          durationUnits,
          targetUnits: 'ft'
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
    if (!pathway) throw new Error(`Savant pathway (${pathwayKey}) not found.`);

    pathway.system = pathway.system ?? {};
    pathway.system.description = pathway.system.description ?? { value: '', chat: '' };
    pathway.system.description.value =
      '<p><strong>Pathway Vector:</strong> engineered problem-solving through technical literacy, memory discipline, and precise process control under pressure.</p>' +
      '<p><strong>Sequence 9 Package (Total Budget 2):</strong> Mechanics Comprehension, Precision Recall.</p>' +
      '<p><strong>Sequence 8 Package (Gain Budget +3):</strong> Adaption, Strata Appraisal, plus one legacy potency upgrade to Precision Recall.</p>' +
      '<p><strong>Sequence 7 Package (Gain Budget +13):</strong> Strengthened Knowledge, Ruin Route Solver, Memory Indexing, plus two legacy upgrades (Adaption and Strata Appraisal).</p>' +
      '<p><strong>Sequence 6 Package (Gain Budget +9):</strong> Manufacturing, Artifact Calibration, Ritual Fixture Integration, plus two legacy upgrades (Ruin Route Solver and Adaption).</p>' +
      '<p><strong>Sequence 5 Package (Gain Budget +13):</strong> Astronomy, False Constellations, Star of Curses, Blessing of Stars, plus two legacy upgrades (Memory Indexing and Manufacturing).</p>' +
      '<p><strong>Sequence 4-0 Status:</strong> Pending authoring in later sequence-focused runs.</p>' +
      '<p><strong>Continuity Anchor:</strong> At Sequence 5 (Astronomer), Savant extends machine-layer engineering into celestial modeling, using orbital timing and field geometry as tactical control inputs.</p>';
    pathway._stats = buildStats(now, pathway._stats);
    await pathwaysDb.put(pathwayKey, JSON.stringify(pathway));

    const folderKey = `!folders!${FOLDER_ID}`;
    const folder = await getOptionalJson(abilitiesDb, folderKey);
    if (!folder) throw new Error(`Savant folder (${FOLDER_ID}) not found.`);

    folder.name = PATHWAY_NAME;
    folder.description = 'Sequence abilities for the Savant pathway (authored through Sequence 5).';
    folder.flags = folder.flags ?? {};
    folder.flags.lotm = {
      ...(folder.flags.lotm ?? {}),
      pathwayIdentifier: PATHWAY_IDENTIFIER,
      latestAuthoredSequence: 5
    };
    folder._stats = buildStats(now + 1, folder._stats);
    await abilitiesDb.put(folderKey, JSON.stringify(folder));

    const legacyAKey = `!items!${LEGACY_A_ID}`;
    const legacyBKey = `!items!${LEGACY_B_ID}`;
    const legacyA = await getOptionalJson(abilitiesDb, legacyAKey);
    const legacyB = await getOptionalJson(abilitiesDb, legacyBKey);
    if (!legacyA) throw new Error(`Legacy target ${LEGACY_A_ID} not found.`);
    if (!legacyB) throw new Error(`Legacy target ${LEGACY_B_ID} not found.`);

    const legacyAHeader = '<h3>Legacy Upgrade (Sequence 5 - Scope)</h3>';
    const legacyAText =
      '<p>At Sequence 5, Memory Indexing can run a distributed index bus instead of a single-hand relay. ' +
      'When an index is consumed, you may assign the reroll rider to two allies within 60 feet of you (instead of one within 30 feet). ' +
      'If you spend at least <strong>+1 Spirituality</strong> on Memory Indexing, one of those allies may also shift 5 feet without provoking opportunity attacks after resolving the indexed action.</p>';
    const legacyADescription = String(legacyA.system?.description?.value ?? '');
    if (!legacyADescription.includes(legacyAHeader)) {
      legacyA.system.description.value = `${legacyADescription}${legacyAHeader}${legacyAText}`;
    }
    legacyA._stats = buildStats(now + 2, legacyA._stats);
    await abilitiesDb.put(legacyAKey, JSON.stringify(legacyA));

    const legacyBHeader = '<h3>Legacy Upgrade (Sequence 5 - Potency)</h3>';
    const legacyBText =
      '<p>At Sequence 5, Manufacturing supports star-tuned output tolerances. ' +
      'Tool Prototype and Safeguard Prototype numeric bonuses increase by <strong>+Potency</strong>. ' +
      'For Armament Prototype, the first qualifying hit each round deals an extra <strong>+Potency</strong> force damage on top of its current rider. ' +
      'If Manufacturing is cast with <strong>+2 Spirituality</strong> or more, one manufactured prototype ignores nonmagical environmental degradation for the full duration.</p>';
    const legacyBDescription = String(legacyB.system?.description?.value ?? '');
    if (!legacyBDescription.includes(legacyBHeader)) {
      legacyB.system.description.value = `${legacyBDescription}${legacyBHeader}${legacyBText}`;
    }
    legacyB._stats = buildStats(now + 3, legacyB._stats);
    await abilitiesDb.put(legacyBKey, JSON.stringify(legacyB));

    const existingAbility1 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_1_ID}`);
    const existingAbility2 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_2_ID}`);
    const existingAbility3 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_3_ID}`);
    const existingAbility4 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_4_ID}`);

    const ability1 = buildAbilityDoc({
      id: ABILITY_1_ID,
      name: 'Astronomy',
      description:
        '<p><strong>Baseline (0 Spirituality):</strong> Action. Build an astronomical solution model for 10 minutes and choose one module:</p><ul><li><strong>Timing Module:</strong> choose yourself or one ally within 30 feet; the next initiative roll, concentration save, or technical check made before your next turn gains <strong>+Potency</strong>.</li><li><strong>Vector Module:</strong> choose one creature you can see within 60 feet; the next attack or contested check against it gains +1 and ignores half cover created by movement geometry.</li><li><strong>Stability Module:</strong> allies in a 10-foot radius around you gain +1 on saves against prone, forced movement, and disorientation effects.</li></ul><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> run two modules at once.</li><li><strong>+2 Spirituality:</strong> module ranges double, and numeric +1 modifiers become <strong>+Potency</strong>.</li><li><strong>+4 Spirituality:</strong> duration becomes 1 hour; once per round, you may reassign one active module to a new valid target without spending an action.</li></ul><p><em>Counterplay:</em> enclosed environments with no stellar reference, timing spoof fields, and aggressive line-of-sight denial reduce model fidelity.</p><p><em>Corruption Hook:</em> if you falsify model readouts to justify avoidable casualties, gain 1 Corruption.</p>',
      img: 'icons/environment/wilderness/stars-night-clear.webp',
      activationType: 'action',
      durationValue: '10',
      durationUnits: 'minute',
      targetType: 'self',
      targetCount: '1',
      targetSpecial: 'self with module assignment to allies and marked targets',
      rangeUnits: 'self',
      rangeValue: null,
      rangeSpecial: '',
      school: 'div',
      properties: ['vocal', 'somatic', 'material'],
      materials: 'a star chart with three indexed bearings',
      identifier: 'lotm-savant-astronomy',
      activityId: 'savantSeq5AstAct01',
      now: now + 4,
      existing: existingAbility1,
      sort: 1200400
    });

    const ability2 = buildAbilityDoc({
      id: ABILITY_2_ID,
      name: 'False Constellations',
      description:
        '<p><strong>Baseline (1 Spirituality):</strong> Action. Project an engineered false-star map in a 20-foot-radius zone within 120 feet for 1 minute. Hostile creatures in zone suffer -1 on Perception and Investigation checks tied to position tracking. The first time each round a hostile creature in zone targets an ally, it must pass an Intelligence save or treat the ally as having half cover for that attack.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> zone radius becomes 30 feet, and you may exempt up to Potency allies from all penalties.</li><li><strong>+2 Spirituality:</strong> numeric -1 penalties become <strong>-Potency</strong>, and one active tracking, lock-on, or guidance effect in zone is suppressed until start of your next turn.</li><li><strong>+4 Spirituality:</strong> once per round while zone persists, you may use your reaction to retarget one hostile single-target attack in zone to another legal hostile target or force it to miss if no legal target remains.</li></ul><p><em>Counterplay:</em> area effects, blind-firing by coordinates, and high-quality instrument recalibration can bypass misdirection.</p><p><em>Corruption Hook:</em> if you deploy false maps to misroute civilian evacuation traffic, gain 1 Corruption.</p>',
      img: 'icons/magic/perception/eye-ringed-green.webp',
      activationType: 'action',
      durationValue: '1',
      durationUnits: 'minute',
      targetType: 'space',
      targetCount: '1',
      targetSpecial: 'projected false-star zone',
      rangeUnits: 'ft',
      rangeValue: '120',
      rangeSpecial: '',
      school: 'ill',
      properties: ['vocal', 'somatic', 'material'],
      materials: 'a mirrored disk marked with offset azimuth lines',
      identifier: 'lotm-savant-false-constellations',
      activityId: 'savantSeq5FalAct02',
      now: now + 5,
      existing: existingAbility2,
      sort: 1200401
    });

    const ability3 = buildAbilityDoc({
      id: ABILITY_3_ID,
      name: 'Star of Curses',
      description:
        '<p><strong>Baseline (1 Spirituality):</strong> Action. Pin a target creature within 60 feet with a hostile stellar marker for 1 minute. The target makes a Constitution save. On failure, choose one fault condition:</p><ul><li><strong>Load Drift:</strong> -1 to attack rolls.</li><li><strong>Timing Drift:</strong> speed reduced by 10 feet.</li><li><strong>Signal Drift:</strong> disadvantage on the first concentration save or technical check it makes each round.</li></ul><p>The target repeats the save at end of each of its turns, ending the marker on success.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> apply two different fault conditions on failed save.</li><li><strong>+2 Spirituality:</strong> numeric -1 penalties become <strong>-Potency</strong>; whenever the target fails a check while marked, it takes force damage equal to Potency (once per round).</li><li><strong>+4 Spirituality:</strong> when the target fails an end-of-turn save, propagate a reduced marker (single fault condition only) to a second creature within 15 feet until end of your next turn.</li></ul><p><em>Counterplay:</em> condition cleansing, line-of-sight breaks, and high-constitution targets reduce marker uptime.</p><p><em>Corruption Hook:</em> if you mark a compliant captive for prolonged experimental suffering, gain 1 Corruption.</p>',
      img: 'icons/magic/light/projectile-stars-blue.webp',
      activationType: 'action',
      durationValue: '1',
      durationUnits: 'minute',
      targetType: 'creature',
      targetCount: '1',
      targetSpecial: 'one creature designated as stellar fault target',
      rangeUnits: 'ft',
      rangeValue: '60',
      rangeSpecial: '',
      school: 'nec',
      properties: ['vocal', 'somatic', 'material'],
      materials: 'a blackened compass needle and a fixed-angle wire frame',
      identifier: 'lotm-savant-star-of-curses',
      activityId: 'savantSeq5StaAct03',
      now: now + 6,
      existing: existingAbility3,
      sort: 1200402
    });

    const ability4 = buildAbilityDoc({
      id: ABILITY_4_ID,
      name: 'Blessing of Stars',
      description:
        '<p><strong>Baseline (0 Spirituality):</strong> Bonus action. Apply an orbital-support blessing to yourself or one ally within 30 feet for 1 minute. Choose one mode:</p><ul><li><strong>Light Frame:</strong> speed +10 feet and ignore nonmagical difficult terrain from rubble, mud, or debris.</li><li><strong>Anchor Frame:</strong> +1 AC and resistance to forced movement equal to Potency feet per forced movement instance.</li><li><strong>Vector Frame:</strong> once per turn after taking an action, move 10 feet without provoking opportunity attacks from one creature of your choice.</li></ul><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> target one additional ally within range.</li><li><strong>+2 Spirituality:</strong> numeric +1 bonuses become <strong>+Potency</strong>, and Light Frame speed bonus becomes +20 feet.</li><li><strong>+4 Spirituality:</strong> once per round while duration lasts, blessed targets may use a reaction to push or pull one creature within 10 feet by 10 feet after that creature makes an attack.</li></ul><p><em>Counterplay:</em> cramped terrain, anti-mobility anchors, and forced teleports can override frame optimization.</p><p><em>Corruption Hook:</em> if you reserve blessing allocation only for those who can repay you under coercive terms, gain 1 Corruption.</p>',
      img: 'icons/magic/light/explosion-star-glow-silhouette.webp',
      activationType: 'bonus',
      durationValue: '1',
      durationUnits: 'minute',
      targetType: 'ally',
      targetCount: '1',
      targetSpecial: 'you or one ally for orbital-support frame',
      rangeUnits: 'ft',
      rangeValue: '30',
      rangeSpecial: '',
      school: 'trs',
      properties: ['somatic', 'material'],
      materials: 'a polished ring etched with three orbital tracks',
      identifier: 'lotm-savant-blessing-of-stars',
      activityId: 'savantSeq5BleAct04',
      now: now + 7,
      existing: existingAbility4,
      sort: 1200403
    });

    await abilitiesDb.put(`!items!${ABILITY_1_ID}`, JSON.stringify(ability1));
    await abilitiesDb.put(`!items!${ABILITY_2_ID}`, JSON.stringify(ability2));
    await abilitiesDb.put(`!items!${ABILITY_3_ID}`, JSON.stringify(ability3));
    await abilitiesDb.put(`!items!${ABILITY_4_ID}`, JSON.stringify(ability4));

    const verifyPathway = await getOptionalJson(pathwaysDb, pathwayKey);
    const verifyFolder = await getOptionalJson(abilitiesDb, folderKey);
    const verifyLegacyA = await getOptionalJson(abilitiesDb, legacyAKey);
    const verifyLegacyB = await getOptionalJson(abilitiesDb, legacyBKey);
    const verifyAbility1 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_1_ID}`);
    const verifyAbility2 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_2_ID}`);
    const verifyAbility3 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_3_ID}`);
    const verifyAbility4 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_4_ID}`);

    const legacyAApplied = String(verifyLegacyA?.system?.description?.value ?? '').includes(legacyAHeader);
    const legacyBApplied = String(verifyLegacyB?.system?.description?.value ?? '').includes(legacyBHeader);

    console.log(
      JSON.stringify(
        {
          pathwayKey,
          pathwayId: verifyPathway?._id,
          pathwayIdentifier: verifyPathway?.system?.identifier,
          folderKey,
          folderId: verifyFolder?._id,
          folderFlags: verifyFolder?.flags?.lotm,
          legacyUpdated: [
            { key: legacyAKey, applied: legacyAApplied },
            { key: legacyBKey, applied: legacyBApplied }
          ],
          abilityKeys: [
            `!items!${ABILITY_1_ID}`,
            `!items!${ABILITY_2_ID}`,
            `!items!${ABILITY_3_ID}`,
            `!items!${ABILITY_4_ID}`
          ],
          abilityReadBack: [
            {
              _id: verifyAbility1?._id,
              name: verifyAbility1?.name,
              folder: verifyAbility1?.folder,
              sourceClass: verifyAbility1?.system?.sourceClass,
              grantedSequence: verifyAbility1?.flags?.lotm?.grantedSequence,
              level: verifyAbility1?.system?.level
            },
            {
              _id: verifyAbility2?._id,
              name: verifyAbility2?.name,
              folder: verifyAbility2?.folder,
              sourceClass: verifyAbility2?.system?.sourceClass,
              grantedSequence: verifyAbility2?.flags?.lotm?.grantedSequence,
              level: verifyAbility2?.system?.level
            },
            {
              _id: verifyAbility3?._id,
              name: verifyAbility3?.name,
              folder: verifyAbility3?.folder,
              sourceClass: verifyAbility3?.system?.sourceClass,
              grantedSequence: verifyAbility3?.flags?.lotm?.grantedSequence,
              level: verifyAbility3?.system?.level
            },
            {
              _id: verifyAbility4?._id,
              name: verifyAbility4?.name,
              folder: verifyAbility4?.folder,
              sourceClass: verifyAbility4?.system?.sourceClass,
              grantedSequence: verifyAbility4?.flags?.lotm?.grantedSequence,
              level: verifyAbility4?.system?.level
            }
          ]
        },
        null,
        2
      )
    );
  } finally {
    await pathwaysDb.close();
    await abilitiesDb.close();
  }
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
