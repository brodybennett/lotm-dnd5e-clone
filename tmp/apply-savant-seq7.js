const { ClassicLevel } = require('./node-tools/node_modules/classic-level');

const CORE_VERSION = '13.351';
const SYSTEM_ID = 'lotm';
const SYSTEM_VERSION = '5.2.6';
const MODIFIER = '0000000000000000';

const PATHWAY_NAME = 'Savant';
const PATHWAY_IDENTIFIER = 'lotm-savant';
const DEFAULT_PATHWAY_ID = 'lotmPathway00015';
const FOLDER_ID = 'UYUzB1Ws2OvdbFzG';

const LEGACY_A_ID = 'lotmAbilityT8001';
const LEGACY_B_ID = 'lotmAbilityT8002';

const ABILITY_1_ID = 'lotmAbilityT7001';
const ABILITY_2_ID = 'lotmAbilityT7002';
const ABILITY_3_ID = 'lotmAbilityT7003';

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
      level: 2,
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
        grantedSequence: 7
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
      '<p><strong>Sequence 6-0 Status:</strong> Pending authoring in later sequence-focused runs.</p>' +
      '<p><strong>Continuity Anchor:</strong> At Sequence 7 (Appraiser), Savant graduates from isolated analysis into expedition-grade execution where knowledge disciplines, route engineering, and memory systems operate as one method stack.</p>';
    pathway._stats = buildStats(now, pathway._stats);
    await pathwaysDb.put(pathwayKey, JSON.stringify(pathway));

    const folderKey = `!folders!${FOLDER_ID}`;
    const folder = await getOptionalJson(abilitiesDb, folderKey);
    if (!folder) throw new Error(`Savant folder (${FOLDER_ID}) not found.`);

    folder.name = PATHWAY_NAME;
    folder.description = 'Sequence abilities for the Savant pathway (authored through Sequence 7).';
    folder.flags = folder.flags ?? {};
    folder.flags.lotm = {
      ...(folder.flags.lotm ?? {}),
      pathwayIdentifier: PATHWAY_IDENTIFIER,
      latestAuthoredSequence: 7
    };
    folder._stats = buildStats(now + 1, folder._stats);
    await abilitiesDb.put(folderKey, JSON.stringify(folder));

    const legacyAKey = `!items!${LEGACY_A_ID}`;
    const legacyBKey = `!items!${LEGACY_B_ID}`;
    const legacyA = await getOptionalJson(abilitiesDb, legacyAKey);
    const legacyB = await getOptionalJson(abilitiesDb, legacyBKey);
    if (!legacyA) throw new Error(`Legacy target ${LEGACY_A_ID} not found.`);
    if (!legacyB) throw new Error(`Legacy target ${LEGACY_B_ID} not found.`);

    const legacyAHeader = '<h3>Legacy Upgrade (Sequence 7 - Efficiency)</h3>';
    const legacyAText =
      '<p>At Sequence 7, Adaption supports procedure swaps without wasted motion. ' +
      'Once per round, you may switch active protocol as part of movement or interaction instead of spending a bonus action. ' +
      'If you pay at least <strong>+1 Spirituality</strong> on Adaption, the protocol handoff also grants <strong>+Potency</strong> to one immediate check or save tied to the new protocol before end of turn.</p>';
    const legacyADescription = String(legacyA.system?.description?.value ?? '');
    if (!legacyADescription.includes(legacyAHeader)) {
      legacyA.system.description.value = `${legacyADescription}${legacyAHeader}${legacyAText}`;
    }
    legacyA._stats = buildStats(now + 2, legacyA._stats);
    await abilitiesDb.put(legacyAKey, JSON.stringify(legacyA));

    const legacyBHeader = '<h3>Legacy Upgrade (Sequence 7 - Scope)</h3>';
    const legacyBText =
      '<p>At Sequence 7, Strata Appraisal can map layered systems instead of single points. ' +
      'When you cast it with at least <strong>+1 Spirituality</strong>, you may define a connected 20-foot zone and treat all linked surfaces/components inside as one appraisal set. ' +
      'Context Bridge can then apply to up to two allied checks in that set before the duration ends.</p>';
    const legacyBDescription = String(legacyB.system?.description?.value ?? '');
    if (!legacyBDescription.includes(legacyBHeader)) {
      legacyB.system.description.value = `${legacyBDescription}${legacyBHeader}${legacyBText}`;
    }
    legacyB._stats = buildStats(now + 3, legacyB._stats);
    await abilitiesDb.put(legacyBKey, JSON.stringify(legacyB));

    const existingAbility1 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_1_ID}`);
    const existingAbility2 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_2_ID}`);
    const existingAbility3 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_3_ID}`);

    const ability1 = buildAbilityDoc({
      id: ABILITY_1_ID,
      name: 'Strengthened Knowledge',
      description:
        '<p><strong>Baseline (0 Spirituality):</strong> Bonus action. Compile an Appraiser knowledge stack for 10 minutes. Choose one discipline: <strong>History</strong>, <strong>Survival</strong>, or <strong>Mysticism</strong>. You gain <strong>+Potency</strong> on checks in that discipline, and the first ally you brief each round gains +1 on one matching check before your next turn.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> run two disciplines simultaneously.</li><li><strong>+2 Spirituality:</strong> include all three disciplines, and briefed allies gain +Potency instead of +1 on their first matching check each round.</li><li><strong>+4 Spirituality:</strong> once per round after a successful stack-enabled check, choose one target identified by that check; it suffers -Potency on its next save or contested check against you or your briefed ally before end of turn.</li></ul><p><em>Counterplay:</em> contradictory records, falsified landmarks, and unstable occult signatures can reduce stack reliability.</p><p><em>Corruption Hook:</em> if you forge evidence to force a preferred conclusion while claiming objective appraisal, gain 1 Corruption.</p>',
      img: 'icons/sundries/books/book-stack.webp',
      activationType: 'bonus',
      durationValue: '10',
      durationUnits: 'minute',
      targetType: 'self',
      targetCount: '1',
      targetSpecial: 'self and one briefed ally each round',
      rangeUnits: 'self',
      rangeValue: null,
      rangeSpecial: '',
      school: 'div',
      properties: ['vocal', 'somatic', 'material'],
      materials: 'field notebook tabs and one etched brass index pin',
      identifier: 'lotm-savant-strengthened-knowledge',
      activityId: 'savantSeq7KnoAct01',
      now: now + 4,
      existing: existingAbility1,
      sort: 1200200
    });

    const ability2 = buildAbilityDoc({
      id: ABILITY_2_ID,
      name: 'Ruin Route Solver',
      description:
        '<p><strong>Baseline (0 Spirituality):</strong> Action. Solve a traversable route through a ruin, battlefield, or machinery floor plan within 60 feet. Define a 30-foot route segment; allies following it ignore one hazard category you identified (unstable footing, pressure triggers, or visibility loss) until start of your next turn. The first ally who follows gains +1 AC against one trap or opportunity attack triggered by route movement.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> extend to two connected 30-foot segments.</li><li><strong>+2 Spirituality:</strong> route support lasts 1 minute, and AC support becomes +Potency.</li><li><strong>+4 Spirituality:</strong> once per round, if a supported ally would trigger a trap on the solved route, you may use your reaction to cancel that trigger and reroute the ally 10 feet to a legal adjacent square.</li></ul><p><em>Counterplay:</em> dynamic hazards, delayed trigger chains, and hostile route denial can invalidate solved segments.</p><p><em>Corruption Hook:</em> if you knowingly route expendable allies through lethal fallback paths to preserve your own position, gain 1 Corruption.</p>',
      img: 'icons/sundries/documents/map-routes-yellow.webp',
      activationType: 'action',
      durationValue: '',
      durationUnits: 'inst',
      targetType: 'space',
      targetCount: '1',
      targetSpecial: 'route segment, ruin lane, or machinery floor plan',
      rangeUnits: 'ft',
      rangeValue: '60',
      rangeSpecial: '',
      school: 'abj',
      properties: ['somatic', 'material'],
      materials: 'chalk thread and a quick-mark compass',
      identifier: 'lotm-savant-ruin-route-solver',
      activityId: 'savantSeq7RouAct02',
      now: now + 5,
      existing: existingAbility2,
      sort: 1200201
    });

    const ability3 = buildAbilityDoc({
      id: ABILITY_3_ID,
      name: 'Memory Indexing',
      description:
        '<p><strong>Baseline (0 Spirituality):</strong> Bonus action. Create indexed memory slots for 1 hour. You may hold two indexed observations (diagram, phrase, trigger pattern, or combat rhythm). While indexed, when you or an ally within 30 feet uses one index, that creature may reroll one failed Intelligence check, tool check, or initiative roll tied to the indexed data and keep the new result.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> hold one additional index slot.</li><li><strong>+2 Spirituality:</strong> when an index is consumed, also grant +Potency on one immediate follow-up attack roll, save DC, or contested check tied to the same target/process.</li><li><strong>+4 Spirituality:</strong> once during duration, consume two slots at once to force a studied creature within 60 feet to make an Intelligence save; on failure it loses reactions and takes psychic damage equal to Potency as its pattern is pre-solved.</li></ul><p><em>Counterplay:</em> deliberate pattern randomization, memory-noise effects, and rapid context swaps can spoil index fidelity.</p><p><em>Corruption Hook:</em> if you alter indexed records to erase ally credit or falsify outcomes, gain 1 Corruption.</p>',
      img: 'icons/sundries/documents/document-sealed-signatures-red.webp',
      activationType: 'bonus',
      durationValue: '1',
      durationUnits: 'hour',
      targetType: 'self',
      targetCount: '1',
      targetSpecial: 'self indexing system and allies using indexed data',
      rangeUnits: 'self',
      rangeValue: null,
      rangeSpecial: '',
      school: 'enc',
      properties: ['somatic', 'material'],
      materials: 'a numbered card set or etched mnemonic ring',
      identifier: 'lotm-savant-memory-indexing',
      activityId: 'savantSeq7MemAct03',
      now: now + 6,
      existing: existingAbility3,
      sort: 1200202
    });

    await abilitiesDb.put(`!items!${ABILITY_1_ID}`, JSON.stringify(ability1));
    await abilitiesDb.put(`!items!${ABILITY_2_ID}`, JSON.stringify(ability2));
    await abilitiesDb.put(`!items!${ABILITY_3_ID}`, JSON.stringify(ability3));

    const verifyPathway = await getOptionalJson(pathwaysDb, pathwayKey);
    const verifyFolder = await getOptionalJson(abilitiesDb, folderKey);
    const verifyLegacyA = await getOptionalJson(abilitiesDb, legacyAKey);
    const verifyLegacyB = await getOptionalJson(abilitiesDb, legacyBKey);
    const verifyAbility1 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_1_ID}`);
    const verifyAbility2 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_2_ID}`);
    const verifyAbility3 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_3_ID}`);

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
          abilityKeys: [`!items!${ABILITY_1_ID}`, `!items!${ABILITY_2_ID}`, `!items!${ABILITY_3_ID}`],
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
