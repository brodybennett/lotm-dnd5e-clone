const { ClassicLevel } = require('./node-tools/node_modules/classic-level');

const CORE_VERSION = '13.351';
const SYSTEM_ID = 'lotm';
const SYSTEM_VERSION = '5.2.6';
const MODIFIER = '0000000000000000';

const PATHWAY_NAME = 'Savant';
const PATHWAY_IDENTIFIER = 'lotm-savant';
const DEFAULT_PATHWAY_ID = 'lotmPathway00015';
const FOLDER_ID = 'UYUzB1Ws2OvdbFzG';

const LEGACY_A_ID = 'lotmAbilityT2001';
const LEGACY_B_ID = 'lotmAbilityT3003';

const ABILITY_1_ID = 'lotmAbilityT0001';
const ABILITY_2_ID = 'lotmAbilityT0002';
const ABILITY_3_ID = 'lotmAbilityT0003';
const ABILITY_4_ID = 'lotmAbilityT0004';

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
      level: 9,
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
        grantedSequence: 0
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
      '<p><strong>Sequence 4 Package (Gain Budget +33):</strong> Alchemy, Soul Infusion, Rapid Fabrication, Mechanical Body Retrofit, plus two legacy upgrades (Star of Curses and Ritual Fixture Integration).</p>' +
      '<p><strong>Sequence 3 Package (Gain Budget +20):</strong> Knowledge Spirit, Environment Controller, Absorption, Dissociation, plus two legacy upgrades (Astronomy and Alchemy).</p>' +
      '<p><strong>Sequence 2 Package (Gain Budget +50):</strong> Manufacturing Authority, Law Parameter Shift, Essence Analysis, Mentor Protocol, plus two legacy upgrades (Environment Controller and Mechanical Body Retrofit).</p>' +
      '<p><strong>Sequence 1 Package (Gain Budget +74):</strong> Civilization Engine, History Projection, Enlightenment Matrix, Civilization Works, plus two legacy upgrades (Law Parameter Shift and Mechanical Body Retrofit).</p>' +
      '<p><strong>Sequence 0 Package (Gain Budget +114):</strong> Reality Knowledge, Civilization Refactoring, Law Refactoring, Spirit World Mentor, plus two legacy upgrades (Manufacturing Authority and Absorption).</p>' +
      '<p><strong>Continuity Anchor:</strong> At Sequence 0 (Paragon), Savant authority resolves as direct reality-knowledge control and civilization-level system rewriting while retaining lower-sequence engineering tactics as modular execution channels.</p>';
    pathway._stats = buildStats(now, pathway._stats);
    await pathwaysDb.put(pathwayKey, JSON.stringify(pathway));

    const folderKey = `!folders!${FOLDER_ID}`;
    const folder = await getOptionalJson(abilitiesDb, folderKey);
    if (!folder) throw new Error(`Savant folder (${FOLDER_ID}) not found.`);

    folder.name = PATHWAY_NAME;
    folder.description = 'Sequence abilities for the Savant pathway (authored through Sequence 0).';
    folder.flags = folder.flags ?? {};
    folder.flags.lotm = {
      ...(folder.flags.lotm ?? {}),
      pathwayIdentifier: PATHWAY_IDENTIFIER,
      latestAuthoredSequence: 0
    };
    folder._stats = buildStats(now + 1, folder._stats);
    await abilitiesDb.put(folderKey, JSON.stringify(folder));

    const legacyAKey = `!items!${LEGACY_A_ID}`;
    const legacyBKey = `!items!${LEGACY_B_ID}`;
    const legacyA = await getOptionalJson(abilitiesDb, legacyAKey);
    const legacyB = await getOptionalJson(abilitiesDb, legacyBKey);
    if (!legacyA) throw new Error(`Legacy target ${LEGACY_A_ID} not found.`);
    if (!legacyB) throw new Error(`Legacy target ${LEGACY_B_ID} not found.`);

    const legacyAHeader = '<h3>Legacy Upgrade (Sequence 0 - Scope)</h3>';
    const legacyAText =
      '<p>At Sequence 0, Manufacturing Authority can project parallel template arrays at civilization scale. ' +
      'One cast may sustain up to three independent template clusters in separate zones within 1000 feet of each other. ' +
      'When cast with <strong>+4 Spirituality</strong> or more, one cluster can generate temporary non-characteristic mystical items that persist for one full scene instead of one minute.</p>';
    const legacyADescription = String(legacyA.system?.description?.value ?? '');
    if (!legacyADescription.includes(legacyAHeader)) {
      legacyA.system.description.value = `${legacyADescription}${legacyAHeader}${legacyAText}`;
    }
    legacyA._stats = buildStats(now + 2, legacyA._stats);
    await abilitiesDb.put(legacyAKey, JSON.stringify(legacyA));

    const legacyBHeader = '<h3>Legacy Upgrade (Sequence 0 - Efficiency)</h3>';
    const legacyBText =
      '<p>At Sequence 0, Absorption can cache reality fragments with near-instant routing. ' +
      'Absorption now stores up to three charge fragments simultaneously, and consuming a fragment does not require action economy beyond the triggering roll context. ' +
      'Once per round, if you absorb from a hostile source, you may immediately assign one stored fragment to an ally within 120 feet as a free transfer.</p>';
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
      name: 'Reality Knowledge',
      description:
        '<p><strong>Baseline (3 Spirituality):</strong> Action. Assert direct reality knowledge over one creature, item, or active effect within 500 feet for 1 minute. Choose one rewrite:</p><ul><li><strong>Knowledge Denial:</strong> target loses access to one identified knowledge channel (one proficiency, one known protocol, or one active analytical rider), suffering -Potency on related checks.</li><li><strong>Information Collapse:</strong> collapse one information structure (message stream, recorded image, symbol array, illusion scaffold) into static; all dependent effects fail in a 20-foot radius.</li><li><strong>Essence Redirect:</strong> convert one hostile knowledge effect into a dormant subroutine that benefits you on your next related roll (+Potency).</li></ul><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+2 Spirituality:</strong> apply a second rewrite to the same target or one additional target in 120 feet.</li><li><strong>+4 Spirituality:</strong> duration becomes 10 minutes and collapse radius becomes 40 feet.</li><li><strong>+8 Spirituality:</strong> establish an information vortex for 1 minute; hostile concentration, analysis, and data-dependent saves in 60 feet are made with disadvantage.</li></ul><p><em>Counterplay:</em> equal or higher authority shielding, sealed cognition domains, and distributed redundant channels can reduce rewrite impact.</p><p><em>Corruption Hook:</em> if you erase shared historical records to monopolize truth, gain 1 Corruption.</p>',
      img: 'icons/magic/perception/orb-crystal-ball-scrying-blue.webp',
      activationType: 'action',
      durationValue: '1',
      durationUnits: 'minute',
      targetType: 'creature',
      targetCount: '1',
      targetSpecial: 'creature, item, or active effect under reality-knowledge assertion',
      rangeUnits: 'ft',
      rangeValue: '500',
      rangeSpecial: '',
      school: 'div',
      properties: ['vocal', 'somatic', 'material'],
      materials: 'a prismatic equation plate and indexed cognition seal',
      identifier: 'lotm-savant-reality-knowledge',
      activityId: 'savantSeq0ReaAct01',
      now: now + 4,
      existing: existingAbility1,
      sort: 1200900
    });

    const ability2 = buildAbilityDoc({
      id: ABILITY_2_ID,
      name: 'Civilization Refactoring',
      description:
        '<p><strong>Baseline (3 Spirituality):</strong> Action. Refactor one civilization state in a 120-foot-radius zone within 300 feet for 1 minute. Choose one state:</p><ul><li><strong>Barbarism Lock:</strong> hostile creatures cannot benefit from advanced devices, engineered support effects, or tactical automation in zone.</li><li><strong>Civilization Surge:</strong> allies in zone gain +Potency on strategic checks, tool checks, and saves against chaos, terror, and disorientation.</li><li><strong>Weight of Civilization:</strong> once per round you may bind one hostile creature in zone; it makes a Strength save or has speed reduced to 0 until end of turn.</li></ul><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+2 Spirituality:</strong> run two states simultaneously.</li><li><strong>+4 Spirituality:</strong> radius becomes 240 feet and duration becomes 10 minutes.</li><li><strong>+8 Spirituality:</strong> designate a group-scale target profile; affected hostiles in zone must make Wisdom saves each round or lose one chosen action option.</li></ul><p><em>Counterplay:</em> counter-domain overwrite, mobility outside zone, and civilization-anchor sabotage can break state persistence.</p><p><em>Corruption Hook:</em> if you enforce permanent ignorance on populations to keep control, gain 1 Corruption.</p>',
      img: 'icons/environment/settlement/city-night.webp',
      activationType: 'action',
      durationValue: '1',
      durationUnits: 'minute',
      targetType: 'space',
      targetCount: '1',
      targetSpecial: 'civilization refactoring zone',
      rangeUnits: 'ft',
      rangeValue: '300',
      rangeSpecial: '',
      school: 'abj',
      properties: ['vocal', 'somatic', 'material'],
      materials: 'a civilization ledger core and three governance sigils',
      identifier: 'lotm-savant-civilization-refactoring',
      activityId: 'savantSeq0CivAct02',
      now: now + 5,
      existing: existingAbility2,
      sort: 1200901
    });

    const ability3 = buildAbilityDoc({
      id: ABILITY_3_ID,
      name: 'Law Refactoring',
      description:
        '<p><strong>Baseline (2 Spirituality):</strong> Action. Rewrite one law matrix in a 100-foot-radius zone within 300 feet for 1 minute. Choose one matrix:</p><ul><li><strong>Thermodynamic Matrix:</strong> invert one heat or cold effect profile, reducing hostile output by Potency and granting allies resistance windows.</li><li><strong>Gravitational Matrix:</strong> alter weight distribution; allies gain +20 feet movement and hostiles treat terrain as difficult.</li><li><strong>Structural Matrix:</strong> restore basic structure in zone, repairing damaged objects and suppressing one ongoing structural corruption effect each round.</li></ul><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+2 Spirituality:</strong> apply one additional matrix.</li><li><strong>+4 Spirituality:</strong> duration becomes 10 minutes and all numeric effects gain +Potency.</li><li><strong>+8 Spirituality:</strong> create a law anchor for 1 hour; once per round as reaction, swap active matrix profile in response to an enemy action.</li></ul><p><em>Counterplay:</em> stronger law authority, anti-refactor seals, and broken anchor geometry reduce effect reliability.</p><p><em>Corruption Hook:</em> if you rewrite laws to induce irreversible collateral collapse for experimentation, gain 1 Corruption.</p>',
      img: 'icons/magic/symbols/rune-sigil-rough-white-teal.webp',
      activationType: 'action',
      durationValue: '1',
      durationUnits: 'minute',
      targetType: 'space',
      targetCount: '1',
      targetSpecial: 'law matrix refactoring zone',
      rangeUnits: 'ft',
      rangeValue: '300',
      rangeSpecial: '',
      school: 'abj',
      properties: ['vocal', 'somatic', 'material'],
      materials: 'law lattice tags and a calibrated phase manifold',
      identifier: 'lotm-savant-law-refactoring',
      activityId: 'savantSeq0LawAct03',
      now: now + 6,
      existing: existingAbility3,
      sort: 1200902
    });

    const ability4 = buildAbilityDoc({
      id: ABILITY_4_ID,
      name: 'Spirit World Mentor',
      description:
        '<p><strong>Baseline (2 Spirituality):</strong> Bonus action. Link allies to a spirit-world mentorship stream for 10 minutes in a 120-foot radius. Linked allies gain +Potency on insight, strategy, and knowledge-dependent checks. Once per round, one linked ally can convert a failed check into a partial success with reduced effect.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+2 Spirituality:</strong> include allies up to double your proficiency bonus and extend range to 240 feet.</li><li><strong>+4 Spirituality:</strong> linked allies may each reroll one failed save per round against confusion, charm, or knowledge-injection effects.</li><li><strong>+8 Spirituality:</strong> establish a spirit-world test lattice for 1 minute; enemies in range that fail an Intelligence save lose reactions and take psychic damage equal to Potency at end of turn.</li></ul><p><em>Counterplay:</em> spirit isolation barriers, silence zones, and cognition scrambling can sever mentorship links.</p><p><em>Corruption Hook:</em> if you use mentorship authority to overwrite ally identity and autonomy, gain 1 Corruption.</p>',
      img: 'icons/magic/perception/third-eye-blue-red.webp',
      activationType: 'bonus',
      durationValue: '10',
      durationUnits: 'minute',
      targetType: 'ally',
      targetCount: '1',
      targetSpecial: 'linked allies in spirit-world mentorship stream',
      rangeUnits: 'ft',
      rangeValue: '120',
      rangeSpecial: '',
      school: 'enc',
      properties: ['somatic', 'material'],
      materials: 'mentor schema tablets and a spirit-conduction relay pin',
      identifier: 'lotm-savant-spirit-world-mentor',
      activityId: 'savantSeq0SpiAct04',
      now: now + 7,
      existing: existingAbility4,
      sort: 1200903
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
