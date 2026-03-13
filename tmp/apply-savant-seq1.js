const { ClassicLevel } = require('./node-tools/node_modules/classic-level');

const CORE_VERSION = '13.351';
const SYSTEM_ID = 'lotm';
const SYSTEM_VERSION = '5.2.6';
const MODIFIER = '0000000000000000';

const PATHWAY_NAME = 'Savant';
const PATHWAY_IDENTIFIER = 'lotm-savant';
const DEFAULT_PATHWAY_ID = 'lotmPathway00015';
const FOLDER_ID = 'UYUzB1Ws2OvdbFzG';

const LEGACY_A_ID = 'lotmAbilityT2002';
const LEGACY_B_ID = 'lotmAbilityT4004';

const ABILITY_1_ID = 'lotmAbilityT1001';
const ABILITY_2_ID = 'lotmAbilityT1002';
const ABILITY_3_ID = 'lotmAbilityT1003';
const ABILITY_4_ID = 'lotmAbilityT1004';

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
      '<p><strong>Sequence 0 Status:</strong> Pending authoring in later sequence-focused runs.</p>' +
      '<p><strong>Continuity Anchor:</strong> At Sequence 1 (Illuminator), Savant expresses civilization authority directly: imposing order constraints, defending with historical projection layers, and turning education/manufacturing into immediate battlefield infrastructure.</p>';
    pathway._stats = buildStats(now, pathway._stats);
    await pathwaysDb.put(pathwayKey, JSON.stringify(pathway));

    const folderKey = `!folders!${FOLDER_ID}`;
    const folder = await getOptionalJson(abilitiesDb, folderKey);
    if (!folder) throw new Error(`Savant folder (${FOLDER_ID}) not found.`);

    folder.name = PATHWAY_NAME;
    folder.description = 'Sequence abilities for the Savant pathway (authored through Sequence 1).';
    folder.flags = folder.flags ?? {};
    folder.flags.lotm = {
      ...(folder.flags.lotm ?? {}),
      pathwayIdentifier: PATHWAY_IDENTIFIER,
      latestAuthoredSequence: 1
    };
    folder._stats = buildStats(now + 1, folder._stats);
    await abilitiesDb.put(folderKey, JSON.stringify(folder));

    const legacyAKey = `!items!${LEGACY_A_ID}`;
    const legacyBKey = `!items!${LEGACY_B_ID}`;
    const legacyA = await getOptionalJson(abilitiesDb, legacyAKey);
    const legacyB = await getOptionalJson(abilitiesDb, legacyBKey);
    if (!legacyA) throw new Error(`Legacy target ${LEGACY_A_ID} not found.`);
    if (!legacyB) throw new Error(`Legacy target ${LEGACY_B_ID} not found.`);

    const legacyAHeader = '<h3>Legacy Upgrade (Sequence 1 - Efficiency)</h3>';
    const legacyAText =
      '<p>At Sequence 1, Law Parameter Shift can run on a persistent civilization anchor. ' +
      'Once per round while a law anchor is active, you may switch one shift profile without spending a reaction. ' +
      'In addition, once per short rest, you may apply the <strong>+2 Spirituality</strong> extension rider to Law Parameter Shift at no Spirituality cost when cast in a zone you previously prepared.</p>';
    const legacyADescription = String(legacyA.system?.description?.value ?? '');
    if (!legacyADescription.includes(legacyAHeader)) {
      legacyA.system.description.value = `${legacyADescription}${legacyAHeader}${legacyAText}`;
    }
    legacyA._stats = buildStats(now + 2, legacyA._stats);
    await abilitiesDb.put(legacyAKey, JSON.stringify(legacyA));

    const legacyBHeader = '<h3>Legacy Upgrade (Sequence 1 - Potency)</h3>';
    const legacyBText =
      '<p>At Sequence 1, Mechanical Body Retrofit modules operate at civilization-grade output. ' +
      'All module numeric values increase by <strong>+Potency</strong>, including cannon damage riders, defensive values, and mobility riders. ' +
      'If Mechanical Body Retrofit is cast with <strong>+2 Spirituality</strong> or more, one upgraded module per round may ignore one anti-construct suppression rider before end of turn.</p>';
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
      name: 'Civilization Engine',
      description:
        '<p><strong>Baseline (3 Spirituality):</strong> Action. Establish a civilization engine zone in a 40-foot radius within 120 feet for 1 minute. Choose one operating mode:</p><ul><li><strong>Order from Chaos:</strong> hostile creatures in zone suffer -Potency on checks/saves tied to fear, confusion, frenzy, or uncontrolled mutation; allied checks against those same effects gain +Potency.</li><li><strong>Life from Ruin:</strong> when an allied creature in zone takes damage, it gains temporary HP equal to Potency (once per round per creature).</li><li><strong>Light from Darkness:</strong> suppress non-divine darkness in zone and reveal hidden hostile creatures that fail a Dexterity save.</li></ul><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+2 Spirituality:</strong> run two operating modes simultaneously.</li><li><strong>+4 Spirituality:</strong> zone radius becomes 80 feet and duration becomes 10 minutes.</li><li><strong>+8 Spirituality:</strong> once per round, force one hostile creature in zone to make a Wisdom save; on failure it loses one action option of your choice (attack, cast, dash, or hide) until start of its next turn.</li></ul><p><em>Counterplay:</em> higher-authority domain overwrite, anti-zone seals, and rapid displacement can break operating coverage.</p><p><em>Corruption Hook:</em> if you impose rigid order by suppressing ally free will during non-emergency situations, gain 1 Corruption.</p>',
      img: 'icons/environment/settlement/city-night.webp',
      activationType: 'action',
      durationValue: '1',
      durationUnits: 'minute',
      targetType: 'space',
      targetCount: '1',
      targetSpecial: 'civilization engine control zone',
      rangeUnits: 'ft',
      rangeValue: '120',
      rangeSpecial: '',
      school: 'abj',
      properties: ['vocal', 'somatic', 'material'],
      materials: 'a civilization sigil lattice and tri-phase governor core',
      identifier: 'lotm-savant-civilization-engine',
      activityId: 'savantSeq1CivAct01',
      now: now + 4,
      existing: existingAbility1,
      sort: 1200800
    });

    const ability2 = buildAbilityDoc({
      id: ABILITY_2_ID,
      name: 'History Projection',
      description:
        '<p><strong>Baseline (2 Spirituality):</strong> Reaction when you or an ally within 60 feet is targeted by an attack, spell, or hostile effect. Project a layered civilization image shield until start of your next turn: reduce the triggering damage/effect severity by <strong>2 x Potency</strong>, and grant advantage on the next save against information or knowledge-overload effects.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+2 Spirituality:</strong> affect one additional ally within 20 feet of original target.</li><li><strong>+4 Spirituality:</strong> if the trigger is mental/information-based, reflect a reduced backlash forcing the source to make an Intelligence save or suffer -Potency on its next check/save.</li><li><strong>+8 Spirituality:</strong> maintain the projection for 1 minute; allies under projection gain resistance to psychic and force damage, and once per round one projected ally can negate a hostile rider effect entirely.</li></ul><p><em>Counterplay:</em> sustained area attrition, authority-level reality cuts, and projection-anchor disruption can drain shields quickly.</p><p><em>Corruption Hook:</em> if you forge historical projection imagery to erase atrocity evidence for political convenience, gain 1 Corruption.</p>',
      img: 'icons/magic/defensive/shield-barrier-blue.webp',
      activationType: 'reaction',
      durationValue: '1',
      durationUnits: 'round',
      targetType: 'ally',
      targetCount: '1',
      targetSpecial: 'you or ally protected by civilization history projection',
      rangeUnits: 'ft',
      rangeValue: '60',
      rangeSpecial: '',
      school: 'abj',
      properties: ['somatic', 'material'],
      materials: 'engraved history plates and a mirrored record seal',
      identifier: 'lotm-savant-history-projection',
      activityId: 'savantSeq1HisAct02',
      now: now + 5,
      existing: existingAbility2,
      sort: 1200801
    });

    const ability3 = buildAbilityDoc({
      id: ABILITY_3_ID,
      name: 'Enlightenment Matrix',
      description:
        '<p><strong>Baseline (2 Spirituality):</strong> Action. Deploy an education authority matrix linking up to proficiency bonus allies within 90 feet for 10 minutes. Linked allies gain +Potency to Intelligence, Wisdom, and tool checks; once per round each linked ally may convert one failed check into a success if the failure margin is Potency or less.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+2 Spirituality:</strong> include one additional ally and add Charisma-based technical command checks to the matrix bonus list.</li><li><strong>+4 Spirituality:</strong> designate one hostile creature in 120 feet; it must pass an Intelligence save at end of each turn or remain trapped in a mathematical maze, reducing speed to 0 and preventing reactions until save succeeds.</li><li><strong>+8 Spirituality:</strong> matrix duration becomes 1 hour; once per round a linked ally who succeeds on a matrix-assisted action may grant immediate +Potency to one other linked ally next roll before end of turn.</li></ul><p><em>Counterplay:</em> communication silence, cognition disruption, and anti-education influence effects can sever matrix links.</p><p><em>Corruption Hook:</em> if you use enlightenment authority to indoctrinate rather than teach, gain 1 Corruption.</p>',
      img: 'icons/sundries/books/book-stack.webp',
      activationType: 'action',
      durationValue: '10',
      durationUnits: 'minute',
      targetType: 'ally',
      targetCount: '1',
      targetSpecial: 'linked allies in enlightenment matrix',
      rangeUnits: 'ft',
      rangeValue: '90',
      rangeSpecial: '',
      school: 'enc',
      properties: ['vocal', 'somatic', 'material'],
      materials: 'matrix tablets, theorem cards, and a keyed instructor rod',
      identifier: 'lotm-savant-enlightenment-matrix',
      activityId: 'savantSeq1EnlAct03',
      now: now + 6,
      existing: existingAbility3,
      sort: 1200802
    });

    const ability4 = buildAbilityDoc({
      id: ABILITY_4_ID,
      name: 'Civilization Works',
      description:
        '<p><strong>Baseline (3 Spirituality):</strong> Action. Realize one civilization effect in a scene-scale 200-foot work envelope for 10 minutes. Choose one:</p><ul><li><strong>Sanitation Pulse:</strong> clear one corruption source category (toxin, rot, low-grade spiritual contamination) and grant allies +Potency on saves against re-infection for duration.</li><li><strong>Rapid Reconstruction:</strong> rebuild or reinforce structures, bridges, barricades, and machinery lanes at high speed; allied traversal gains +Potency and hostile traversal treats rebuilt lanes as difficult terrain.</li><li><strong>Transport Artery:</strong> establish accelerated material/personnel routing; selected allies can move an additional 20 feet and ignore one movement tax each round.</li></ul><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+2 Spirituality:</strong> run one additional civilization effect simultaneously.</li><li><strong>+4 Spirituality:</strong> envelope expands to 400 feet; all numeric riders gain +Potency.</li><li><strong>+8 Spirituality:</strong> anchor a temporary miniature civilization grid for 1 hour; once per round you may trigger one emergency function (instant barricade, emergency cleanse, or rapid evacuation line) as reaction.</li></ul><p><em>Counterplay:</em> authority-level sabotage, infrastructure collapse attacks, and sustained anti-civilization curses can break the works grid.</p><p><em>Corruption Hook:</em> if you selectively deny lifesaving civilization functions to coerce obedience, gain 1 Corruption.</p>',
      img: 'icons/environment/settlement/stone-wall.webp',
      activationType: 'action',
      durationValue: '10',
      durationUnits: 'minute',
      targetType: 'space',
      targetCount: '1',
      targetSpecial: 'civilization works envelope',
      rangeUnits: 'ft',
      rangeValue: '200',
      rangeSpecial: '',
      school: 'trs',
      properties: ['vocal', 'somatic', 'material'],
      materials: 'infrastructure schematics and a tri-channel regulator baton',
      identifier: 'lotm-savant-civilization-works',
      activityId: 'savantSeq1WorAct04',
      now: now + 7,
      existing: existingAbility4,
      sort: 1200803
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
