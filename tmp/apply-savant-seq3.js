const { ClassicLevel } = require('./node-tools/node_modules/classic-level');

const CORE_VERSION = '13.351';
const SYSTEM_ID = 'lotm';
const SYSTEM_VERSION = '5.2.6';
const MODIFIER = '0000000000000000';

const PATHWAY_NAME = 'Savant';
const PATHWAY_IDENTIFIER = 'lotm-savant';
const DEFAULT_PATHWAY_ID = 'lotmPathway00015';
const FOLDER_ID = 'UYUzB1Ws2OvdbFzG';

const LEGACY_A_ID = 'lotmAbilityT5001';
const LEGACY_B_ID = 'lotmAbilityT4001';

const ABILITY_1_ID = 'lotmAbilityT3001';
const ABILITY_2_ID = 'lotmAbilityT3002';
const ABILITY_3_ID = 'lotmAbilityT3003';
const ABILITY_4_ID = 'lotmAbilityT3004';

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
      '<p><strong>Sequence 2-0 Status:</strong> Pending authoring in later sequence-focused runs.</p>' +
      '<p><strong>Continuity Anchor:</strong> At Sequence 3 (Arcane Scholar), Savant fuses alchemical fabrication with system-level battlefield control, converting analysis outputs into direct rule-shaping operations.</p>';
    pathway._stats = buildStats(now, pathway._stats);
    await pathwaysDb.put(pathwayKey, JSON.stringify(pathway));

    const folderKey = `!folders!${FOLDER_ID}`;
    const folder = await getOptionalJson(abilitiesDb, folderKey);
    if (!folder) throw new Error(`Savant folder (${FOLDER_ID}) not found.`);

    folder.name = PATHWAY_NAME;
    folder.description = 'Sequence abilities for the Savant pathway (authored through Sequence 3).';
    folder.flags = folder.flags ?? {};
    folder.flags.lotm = {
      ...(folder.flags.lotm ?? {}),
      pathwayIdentifier: PATHWAY_IDENTIFIER,
      latestAuthoredSequence: 3
    };
    folder._stats = buildStats(now + 1, folder._stats);
    await abilitiesDb.put(folderKey, JSON.stringify(folder));

    const legacyAKey = `!items!${LEGACY_A_ID}`;
    const legacyBKey = `!items!${LEGACY_B_ID}`;
    const legacyA = await getOptionalJson(abilitiesDb, legacyAKey);
    const legacyB = await getOptionalJson(abilitiesDb, legacyBKey);
    if (!legacyA) throw new Error(`Legacy target ${LEGACY_A_ID} not found.`);
    if (!legacyB) throw new Error(`Legacy target ${LEGACY_B_ID} not found.`);

    const legacyAHeader = '<h3>Legacy Upgrade (Sequence 3 - Efficiency)</h3>';
    const legacyAText =
      '<p>At Sequence 3, Astronomy can hot-swap modules through predictive buffering. ' +
      'Once per round, you may switch one active Astronomy module as a free rider on movement, attack, or help actions instead of consuming an action channel. ' +
      'If Astronomy is cast with at least <strong>+2 Spirituality</strong>, one module reassignment each round also grants <strong>+Potency</strong> on the first matching check or save.</p>';
    const legacyADescription = String(legacyA.system?.description?.value ?? '');
    if (!legacyADescription.includes(legacyAHeader)) {
      legacyA.system.description.value = `${legacyADescription}${legacyAHeader}${legacyAText}`;
    }
    legacyA._stats = buildStats(now + 2, legacyA._stats);
    await abilitiesDb.put(legacyAKey, JSON.stringify(legacyA));

    const legacyBHeader = '<h3>Legacy Upgrade (Sequence 3 - Scope)</h3>';
    const legacyBText =
      '<p>At Sequence 3, Alchemy supports a distributed production frame. ' +
      'A single Alchemy cast may now address up to three prepared objects within 20 feet of each other, applying one selected baseline result to each valid object. ' +
      'When Alchemy is cast with <strong>+2 Spirituality</strong> or more, one of those objects may host an additional secondary result without extra action cost.</p>';
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
      name: 'Knowledge Spirit',
      description:
        '<p><strong>Baseline (1 Spirituality):</strong> Action. Deploy a knowledge spirit process for 10 minutes in a 30-foot radius. While active, you and allies in zone gain +1 on checks tied to analysis, tool operation, rune decoding, and mechanism diagnosis. Once per round, one ally in zone may reroll one failed Intelligence or tool check and keep the new result.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> zone radius becomes 60 feet and supports one additional reroll each round.</li><li><strong>+2 Spirituality:</strong> numeric +1 bonuses become <strong>+Potency</strong>, and first reroll each round also removes one source of disadvantage from environmental noise or partial data.</li><li><strong>+4 Spirituality:</strong> instantiate a bounded expert thread; once per round, ask one precise process question about a visible system and receive an actionable technical answer from the GM.</li></ul><p><em>Counterplay:</em> anti-divination shielding, false telemetry, and deliberate data poisoning can reduce or misdirect outputs.</p><p><em>Corruption Hook:</em> if you conceal critical findings to monopolize strategic leverage, gain 1 Corruption.</p>',
      img: 'icons/magic/perception/third-eye-blue-red.webp',
      activationType: 'action',
      durationValue: '10',
      durationUnits: 'minute',
      targetType: 'space',
      targetCount: '1',
      targetSpecial: 'knowledge-support zone centered on you or marked point',
      rangeUnits: 'ft',
      rangeValue: '30',
      rangeSpecial: '',
      school: 'div',
      properties: ['vocal', 'somatic', 'material'],
      materials: 'indexed notecards and a calibrated mnemonic charm',
      identifier: 'lotm-savant-knowledge-spirit',
      activityId: 'savantSeq3KnoAct01',
      now: now + 4,
      existing: existingAbility1,
      sort: 1200600
    });

    const ability2 = buildAbilityDoc({
      id: ABILITY_2_ID,
      name: 'Environment Controller',
      description:
        '<p><strong>Baseline (1 Spirituality):</strong> Action. Reconfigure one 20-foot-radius environment cell within 90 feet for 1 minute. Choose one profile:</p><ul><li><strong>Friction Grid:</strong> hostile movement in cell costs +10 feet and opportunity attacks against them gain +1.</li><li><strong>Pressure Equalization:</strong> allies in cell gain +1 to saves vs forced movement, stun, and disorientation.</li><li><strong>Signal Damping:</strong> hostile lock-on, tracking, or concentration checks in cell take -1.</li></ul><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> affect one additional adjacent cell.</li><li><strong>+2 Spirituality:</strong> numeric +1/-1 values become <strong>+Potency/-Potency</strong>, and profile changes can be switched once per round as a bonus action.</li><li><strong>+4 Spirituality:</strong> designate one anchor point; once per round, when an enemy fails a save/check in a controlled cell, you may pull or push it 10 feet within controlled terrain.</li></ul><p><em>Counterplay:</em> terrain destruction, anti-field pulses, and rapid multi-vector movement can break control coverage.</p><p><em>Corruption Hook:</em> if you weaponize controlled terrain to trap noncombatants as expendable blockers, gain 1 Corruption.</p>',
      img: 'icons/magic/control/debuff-energy-snare-purple-pink.webp',
      activationType: 'action',
      durationValue: '1',
      durationUnits: 'minute',
      targetType: 'space',
      targetCount: '1',
      targetSpecial: 'environment control cell',
      rangeUnits: 'ft',
      rangeValue: '90',
      rangeSpecial: '',
      school: 'abj',
      properties: ['vocal', 'somatic', 'material'],
      materials: 'a terrain map slate and two tuning spikes',
      identifier: 'lotm-savant-environment-controller',
      activityId: 'savantSeq3EnvAct02',
      now: now + 5,
      existing: existingAbility2,
      sort: 1200601
    });

    const ability3 = buildAbilityDoc({
      id: ABILITY_3_ID,
      name: 'Absorption',
      description:
        '<p><strong>Baseline (0 Spirituality):</strong> Reaction when you or an ally within 30 feet is hit by a spell, mechanism discharge, or environmental burst. Absorb part of the payload: reduce incoming damage by <strong>Potency + proficiency bonus</strong>, and store one charge fragment for 1 minute.</p><p><strong>Stored charge usage:</strong> once before expiry, release charge on your turn to gain one benefit: +1 on one attack/check/save, add Potency force damage to one hit, or recover Spirituality equal to Potency (minimum 1).</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> reaction range becomes 60 feet and may protect two targets from the same burst if both are in range.</li><li><strong>+2 Spirituality:</strong> reduction becomes <strong>2 x Potency + proficiency bonus</strong> and stored release benefits scale by +Potency.</li><li><strong>+4 Spirituality:</strong> if you absorb from a hostile source, mark that source until end of your next turn; first attack/check/save against it gains advantage and it suffers -Potency on its first save/check against you.</li></ul><p><em>Counterplay:</em> non-energy physical attacks, anti-storage effects, and rapid multi-hit pressure can exhaust reaction capacity.</p><p><em>Corruption Hook:</em> if you intentionally let allies get hit to farm charge fragments, gain 1 Corruption.</p>',
      img: 'icons/magic/defensive/shield-barrier-flaming-diamond-blue-yellow.webp',
      activationType: 'reaction',
      durationValue: '1',
      durationUnits: 'minute',
      targetType: 'ally',
      targetCount: '1',
      targetSpecial: 'you or ally struck by absorbable payload',
      rangeUnits: 'ft',
      rangeValue: '30',
      rangeSpecial: '',
      school: 'abj',
      properties: ['somatic', 'material'],
      materials: 'a conductive coil wrapped around a sigil core',
      identifier: 'lotm-savant-absorption',
      activityId: 'savantSeq3AbsAct03',
      now: now + 6,
      existing: existingAbility3,
      sort: 1200602
    });

    const ability4 = buildAbilityDoc({
      id: ABILITY_4_ID,
      name: 'Dissociation',
      description:
        '<p><strong>Baseline (1 Spirituality):</strong> Bonus action. Enter a dissociated analytical frame for 1 minute. While active, choose one mode each round at start of your turn:</p><ul><li><strong>Thread Split:</strong> take one additional object interaction and gain +1 on one technical check.</li><li><strong>Latency Break:</strong> move 10 feet without provoking opportunity attacks from one observed enemy.</li><li><strong>Error Isolation:</strong> gain resistance to psychic damage and advantage on one save against charm/fear/confusion.</li></ul><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> maintain two modes simultaneously each round.</li><li><strong>+2 Spirituality:</strong> numeric +1 bonuses become <strong>+Potency</strong>, and Latency Break movement becomes 20 feet.</li><li><strong>+4 Spirituality:</strong> once per round, after an enemy within 60 feet completes an action, you may use reaction to force an Intelligence save; on failure that enemy loses one bonus action/reaction option until start of its next turn.</li></ul><p><em>Counterplay:</em> sensory overload, anti-telemetry fields, and hard-disable conditions can interrupt dissociated execution.</p><p><em>Corruption Hook:</em> if you progressively sever empathy to treat all allies as disposable process nodes, gain 1 Corruption.</p>',
      img: 'icons/magic/control/silhouette-hold-change-blue.webp',
      activationType: 'bonus',
      durationValue: '1',
      durationUnits: 'minute',
      targetType: 'self',
      targetCount: '1',
      targetSpecial: 'self cognitive frame',
      rangeUnits: 'self',
      rangeValue: null,
      rangeSpecial: '',
      school: 'enc',
      properties: ['somatic', 'material'],
      materials: 'a split-focus lens and an insulated thought loop ring',
      identifier: 'lotm-savant-dissociation',
      activityId: 'savantSeq3DisAct04',
      now: now + 7,
      existing: existingAbility4,
      sort: 1200603
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
