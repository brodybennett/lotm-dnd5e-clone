const { ClassicLevel } = require('./node-tools/node_modules/classic-level');

const CORE_VERSION = '13.351';
const SYSTEM_ID = 'lotm';
const SYSTEM_VERSION = '5.2.6';
const MODIFIER = '0000000000000000';

const PATHWAY_NAME = 'Savant';
const PATHWAY_IDENTIFIER = 'lotm-savant';
const DEFAULT_PATHWAY_ID = 'lotmPathway00015';
const FOLDER_ID = 'UYUzB1Ws2OvdbFzG';

const LEGACY_A_ID = 'lotmAbilityT3002';
const LEGACY_B_ID = 'lotmAbilityT4004';

const ABILITY_1_ID = 'lotmAbilityT2001';
const ABILITY_2_ID = 'lotmAbilityT2002';
const ABILITY_3_ID = 'lotmAbilityT2003';
const ABILITY_4_ID = 'lotmAbilityT2004';

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
      '<p><strong>Sequence 1-0 Status:</strong> Pending authoring in later sequence-focused runs.</p>' +
      '<p><strong>Continuity Anchor:</strong> At Sequence 2 (Knowledge Magister), Savant advances from regional engineering control to near-angel authority over manufacturing, laws, and analysis, enabling system-scale reconfiguration in live operations.</p>';
    pathway._stats = buildStats(now, pathway._stats);
    await pathwaysDb.put(pathwayKey, JSON.stringify(pathway));

    const folderKey = `!folders!${FOLDER_ID}`;
    const folder = await getOptionalJson(abilitiesDb, folderKey);
    if (!folder) throw new Error(`Savant folder (${FOLDER_ID}) not found.`);

    folder.name = PATHWAY_NAME;
    folder.description = 'Sequence abilities for the Savant pathway (authored through Sequence 2).';
    folder.flags = folder.flags ?? {};
    folder.flags.lotm = {
      ...(folder.flags.lotm ?? {}),
      pathwayIdentifier: PATHWAY_IDENTIFIER,
      latestAuthoredSequence: 2
    };
    folder._stats = buildStats(now + 1, folder._stats);
    await abilitiesDb.put(folderKey, JSON.stringify(folder));

    const legacyAKey = `!items!${LEGACY_A_ID}`;
    const legacyBKey = `!items!${LEGACY_B_ID}`;
    const legacyA = await getOptionalJson(abilitiesDb, legacyAKey);
    const legacyB = await getOptionalJson(abilitiesDb, legacyBKey);
    if (!legacyA) throw new Error(`Legacy target ${LEGACY_A_ID} not found.`);
    if (!legacyB) throw new Error(`Legacy target ${LEGACY_B_ID} not found.`);

    const legacyAHeader = '<h3>Legacy Upgrade (Sequence 2 - Potency)</h3>';
    const legacyAText =
      '<p>At Sequence 2, Environment Controller runs on a law-aware control kernel. ' +
      'All numeric profile modifiers from Environment Controller gain an additional <strong>+Potency</strong> or <strong>-Potency</strong> swing. ' +
      'When cast with at least <strong>+2 Spirituality</strong>, one controlled cell per round can forcibly invert one hostile movement option (dash, disengage, climb, or glide) into difficult movement instead.</p>';
    const legacyADescription = String(legacyA.system?.description?.value ?? '');
    if (!legacyADescription.includes(legacyAHeader)) {
      legacyA.system.description.value = `${legacyADescription}${legacyAHeader}${legacyAText}`;
    }
    legacyA._stats = buildStats(now + 2, legacyA._stats);
    await abilitiesDb.put(legacyAKey, JSON.stringify(legacyA));

    const legacyBHeader = '<h3>Legacy Upgrade (Sequence 2 - Scope)</h3>';
    const legacyBText =
      '<p>At Sequence 2, Mechanical Body Retrofit scales from single-operator modules to coordinated deployment. ' +
      'One cast can target up to three willing allies within 30 feet, each receiving one selected module profile. ' +
      'If cast with <strong>+2 Spirituality</strong> or more, one designated ally may run a synchronized overflow action once per round without consuming your own reaction.</p>';
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
      name: 'Manufacturing Authority',
      description:
        '<p><strong>Baseline (2 Spirituality):</strong> Action. Manifest one engineered product template within 120 feet for 10 minutes. Choose one template:</p><ul><li><strong>Siege Template:</strong> create a heavy construct node with HP equal to Potency x 10 that can execute one ranged force attack each round.</li><li><strong>Support Template:</strong> create a logistics platform that grants +Potency to one allied attack, save, or technical check each round.</li><li><strong>Substitution Template:</strong> create temporary material substitutes to fulfill one missing non-unique component requirement for a crafted item, ritual fixture, or mechanism.</li></ul><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+2 Spirituality:</strong> instantiate one additional template or extend duration to 1 hour.</li><li><strong>+4 Spirituality:</strong> all template numeric outputs gain +Potency and substitution can cover one rare material constraint for scene duration.</li><li><strong>+8 Spirituality:</strong> deploy a scene-scale manufacturing frame for 1 minute; once per round, you may reconfigure one active template as a bonus action without losing prior output continuity.</li></ul><p><em>Counterplay:</em> anti-manifestation fields, catastrophic EMP-like pulses, and high-grade seal interference can collapse templates.</p><p><em>Corruption Hook:</em> if you mass-produce coercive devices to suppress civilian agency, gain 1 Corruption.</p>',
      img: 'icons/commodities/tech/metal-gears.webp',
      activationType: 'action',
      durationValue: '10',
      durationUnits: 'minute',
      targetType: 'space',
      targetCount: '1',
      targetSpecial: 'manufacturing template deployment point',
      rangeUnits: 'ft',
      rangeValue: '120',
      rangeSpecial: '',
      school: 'trs',
      properties: ['vocal', 'somatic', 'material'],
      materials: 'a master blueprint plate, relay spindle, and catalyst array',
      identifier: 'lotm-savant-manufacturing-authority',
      activityId: 'savantSeq2ManAct01',
      now: now + 4,
      existing: existingAbility1,
      sort: 1200700
    });

    const ability2 = buildAbilityDoc({
      id: ABILITY_2_ID,
      name: 'Law Parameter Shift',
      description:
        '<p><strong>Baseline (2 Spirituality):</strong> Action. Rewrite one physical rule parameter in a 30-foot-radius zone within 90 feet for 1 round. Choose one shift:</p><ul><li><strong>Combustion Shift:</strong> flame-producing effects in zone lose ignition riders and deal reduced damage by Potency.</li><li><strong>Thermal Inversion:</strong> cold effects in zone grant warmth shielding to allies, giving +1 on saves against slow, freeze, or brittle effects.</li><li><strong>Weight Drift:</strong> selected creatures in zone treat gravity as reduced, gaining +10 feet movement and advantage on jump/reposition checks.</li></ul><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+2 Spirituality:</strong> duration becomes 1 minute and zone radius becomes 60 feet.</li><li><strong>+4 Spirituality:</strong> apply two shifts simultaneously; numeric +1 values become <strong>+Potency</strong>.</li><li><strong>+8 Spirituality:</strong> establish a law anchor; once per round you may switch active shift profile as reaction when a creature in zone makes an attack, save, or key check.</li></ul><p><em>Counterplay:</em> high-authority counter-laws, anchor disruption, and reality-stabilizing seals can reduce or terminate shifts.</p><p><em>Corruption Hook:</em> if you alter local laws to stage irreversible collateral incidents as \"tests,\" gain 1 Corruption.</p>',
      img: 'icons/magic/symbols/rune-sigil-rough-white-teal.webp',
      activationType: 'action',
      durationValue: '1',
      durationUnits: 'round',
      targetType: 'space',
      targetCount: '1',
      targetSpecial: 'localized law-shift zone',
      rangeUnits: 'ft',
      rangeValue: '90',
      rangeSpecial: '',
      school: 'abj',
      properties: ['vocal', 'somatic', 'material'],
      materials: 'a calibrated law-matrix card and two phase weights',
      identifier: 'lotm-savant-law-parameter-shift',
      activityId: 'savantSeq2LawAct02',
      now: now + 5,
      existing: existingAbility2,
      sort: 1200701
    });

    const ability3 = buildAbilityDoc({
      id: ABILITY_3_ID,
      name: 'Essence Analysis',
      description:
        '<p><strong>Baseline (1 Spirituality):</strong> Bonus action. Analyze the essence of one creature, item, or effect within 300 feet for 1 minute. Gain a tactical packet: known resistance profile, active structural weaknesses, and one recommended counter-line. You and one ally gain +Potency on the first attack/check/save each round that follows this packet.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> include one additional target in analysis set.</li><li><strong>+2 Spirituality:</strong> reveal one concealed subsystem (hidden trigger, false layer, or embedded rider), and share packet to up to proficiency bonus allies.</li><li><strong>+4 Spirituality:</strong> mark one analyzed target as solved; first successful allied hit/check each round against solved target applies a secondary rider: reduce target AC, save DC, or contested-check bonus by Potency until start of your next turn.</li></ul><p><em>Counterplay:</em> anti-analysis obfuscation, rapidly mutating structures, and deliberate false-signature bait reduce packet reliability.</p><p><em>Corruption Hook:</em> if you knowingly exploit private biological/mental vulnerabilities revealed by analysis for non-consensual control, gain 1 Corruption.</p>',
      img: 'icons/magic/perception/orb-crystal-ball-scrying-blue.webp',
      activationType: 'bonus',
      durationValue: '1',
      durationUnits: 'minute',
      targetType: 'creature',
      targetCount: '1',
      targetSpecial: 'analyzed creature, item, or active effect',
      rangeUnits: 'ft',
      rangeValue: '300',
      rangeSpecial: '',
      school: 'div',
      properties: ['somatic', 'material'],
      materials: 'a prism lens and a signal-decoding stylus',
      identifier: 'lotm-savant-essence-analysis',
      activityId: 'savantSeq2EssAct03',
      now: now + 6,
      existing: existingAbility3,
      sort: 1200702
    });

    const ability4 = buildAbilityDoc({
      id: ABILITY_4_ID,
      name: 'Mentor Protocol',
      description:
        '<p><strong>Baseline (1 Spirituality):</strong> Action. Launch a mentor protocol for 10 minutes targeting up to proficiency bonus allies within 60 feet. Choose one technical domain (mechanics, strategy, ritual systems, or field logistics). Targets gain accelerated learning: +1 on related checks and may treat non-proficiency as half proficiency (rounded up) for protocol scope.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> choose one additional domain.</li><li><strong>+2 Spirituality:</strong> numeric +1 values become <strong>+Potency</strong>, and each target may reroll one failed protocol-related check per round.</li><li><strong>+4 Spirituality:</strong> initiate testing thread; once per round after a target succeeds on a protocol action, that target may transfer a condensed lesson to one ally within 30 feet, granting immediate +Potency on one matching roll before end of turn.</li></ul><p><em>Counterplay:</em> communication jamming, panic states, and hard cognitive disruption can sever lesson transfer chains.</p><p><em>Corruption Hook:</em> if you weaponize mentor protocols to enforce absolute obedience and suppress independent judgment, gain 1 Corruption.</p>',
      img: 'icons/sundries/books/book-embossed-steel.webp',
      activationType: 'action',
      durationValue: '10',
      durationUnits: 'minute',
      targetType: 'ally',
      targetCount: '1',
      targetSpecial: 'up to proficiency bonus allies in protocol network',
      rangeUnits: 'ft',
      rangeValue: '60',
      rangeSpecial: '',
      school: 'enc',
      properties: ['vocal', 'somatic', 'material'],
      materials: 'instruction slates, timing baton, and encoded mentor seals',
      identifier: 'lotm-savant-mentor-protocol',
      activityId: 'savantSeq2MenAct04',
      now: now + 7,
      existing: existingAbility4,
      sort: 1200703
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
