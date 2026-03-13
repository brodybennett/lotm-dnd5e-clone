const { ClassicLevel } = require('./node-tools/node_modules/classic-level');

const CORE_VERSION = '13.351';
const SYSTEM_ID = 'lotm';
const SYSTEM_VERSION = '5.2.6';
const MODIFIER = '0000000000000000';

const PATHWAY_IDENTIFIER = 'lotm-mystery-pryer';
const DEFAULT_PATHWAY_ID = 'lotmPathway00014';
const FOLDER_ID = 'GEb0Z39c7pW51DAO';

const LEGACY_A_ID = 'lotmAbilityP4001';
const LEGACY_B_ID = 'lotmAbilityP2002';

const ABILITY_1_ID = 'lotmAbilityP1001';
const ABILITY_2_ID = 'lotmAbilityP1002';
const ABILITY_3_ID = 'lotmAbilityP1003';
const ABILITY_4_ID = 'lotmAbilityP1004';

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
    const pathway = await getOptionalJson(pathwaysDb, pathwayKey);
    if (!pathway) throw new Error(`Mystery Pryer pathway (${pathwayKey}) not found.`);

    pathway.system = pathway.system ?? {};
    pathway.system.description = pathway.system.description ?? { value: '', chat: '' };
    pathway.system.description.value =
      '<p><strong>Pathway Vector:</strong> inquisitive occult scholarship through spirit sight, structured divination, and careful ritual inquiry that rewards layered interpretation over blunt certainty.</p>' +
      '<p><strong>Sequence 9 Package (Total Budget 2):</strong> Eyes of Mystery Prying, Quick Rituals.</p>' +
      '<p><strong>Sequence 8 Package (Gain Budget +3):</strong> Spirit World Entry, Arcane Marginalia, plus one legacy scope upgrade to Eyes of Mystery Prying.</p>' +
      '<p><strong>Sequence 7 Package (Gain Budget +13):</strong> Threefold Formula, Occult Backtrace, Premonitory Footnote, plus two legacy upgrades (Eyes of Mystery Prying and Arcane Marginalia).</p>' +
      '<p><strong>Sequence 6 Package (Gain Budget +9):</strong> Scroll Making, Secret Voice Scroll, Elemental Cipher Scroll, plus two legacy upgrades (Quick Rituals and Occult Backtrace).</p>' +
      '<p><strong>Sequence 5 Package (Gain Budget +13):</strong> Starlight Cage, Stellar Self, Star Concealment, plus two legacy upgrades (Threefold Formula and Scroll Making).</p>' +
      '<p><strong>Sequence 4 Package (Gain Budget +33):</strong> Mystical Re-enactment, Planted Prying Eye, Star Pillar, Knowledge Storm Form, plus two legacy upgrades (Elemental Cipher Scroll and Premonitory Footnote).</p>' +
      '<p><strong>Sequence 3 Package (Gain Budget +20):</strong> Clairvoyant Branch, Fate Cross-Section, Re-enactment Ascendance, Prayer Echo, plus two legacy upgrades (Star Concealment and Secret Voice Scroll).</p>' +
      '<p><strong>Sequence 2 Package (Gain Budget +50):</strong> Information Torrent Manifestation, Deletion Protocol, Revision Mandate, Sage Counterfate, plus two legacy upgrades (Mystical Re-enactment and Starlight Cage).</p>' +
      '<p><strong>Sequence 1 Package (Gain Budget +74):</strong> Imperial Knowledge Embodiment, Arcana Bestowal, Sovereign Revision Field, and Emperor\'s Query, plus two legacy upgrades (Mystical Re-enactment and Deletion Protocol).</p>' +
      '<p><strong>Sequence 0 Status:</strong> Pending authoring in a later sequence-focused run.</p>' +
      '<p><strong>Continuity Anchor:</strong> At Sequence 1 (Knowledge Emperor), Mystery Pryer refines Sage-grade information control into imperial-scale authorship: it can grant bounded foreign powers, impose revision zones, and interrogate fate-linked truth while remaining constrained by anti-divination authority, information redundancy, and corruption pressure.</p>';
    pathway._stats = buildStats(now, pathway._stats);
    await pathwaysDb.put(pathwayKey, JSON.stringify(pathway));

    const folderKey = `!folders!${FOLDER_ID}`;
    const folder = await getOptionalJson(abilitiesDb, folderKey);
    if (!folder) throw new Error(`Mystery Pryer folder (${FOLDER_ID}) not found.`);

    folder.description = 'Sequence abilities for the Mystery Pryer pathway (authored through Sequence 1).';
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

    const legacyAHeader = '<h3>Legacy Upgrade (Sequence 1 - Scope)</h3>';
    const legacyAText =
      '<p>At Sequence 1, Mystical Re-enactment can re-stage multi-threaded occult events as a layered tableau. ' +
      'When cast with at least <strong>+2 Spirituality</strong>, select one additional valid event-thread from within 120 feet; ' +
      'both threads resolve independently and can target different clusters. ' +
      'At <strong>+4 Spirituality</strong>, one chosen ally may stand inside either reenacted thread and count as if present in both for friendly rider triggers.</p>';
    const legacyADescription = String(legacyA.system?.description?.value ?? '');
    if (!legacyADescription.includes(legacyAHeader)) {
      legacyA.system.description.value = `${legacyADescription}${legacyAHeader}${legacyAText}`;
    }
    legacyA._stats = buildStats(now + 2, legacyA._stats);
    await abilitiesDb.put(legacyAKey, JSON.stringify(legacyA));

    const legacyBHeader = '<h3>Legacy Upgrade (Sequence 1 - Potency)</h3>';
    const legacyBText =
      '<p>At Sequence 1, Deletion Protocol can collapse reinforced informational shells. ' +
      'When Deletion Protocol is cast with at least <strong>+2 Spirituality</strong>, deleted layers inflict one stack of <em>Structural Drift</em> (max 2) on failed save. ' +
      'At 2 stacks, target takes psychic damage equal to <strong>Potency</strong> whenever it benefits from a temporary buff or concealment effect. ' +
      'A successful save removes one stack at turn end.</p>';
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
      name: 'Imperial Knowledge Embodiment',
      description:
        '<p><strong>Baseline (2 Spirituality):</strong> Action. Become a sovereign stream of living information for 1 minute (concentration). You gain resistance to all damage except psychic, can pass through gaps as narrow as 1 inch, and may move through creatures and objects as difficult terrain. The first time each turn you pass through a hostile creature, it makes an Intelligence save or takes psychic damage equal to <strong>Potency</strong>.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Gain 30 feet fly speed while transformed.</li><li><strong>+2 Spirituality:</strong> You can leave one stationary information echo in a space you passed through; you may reform from that echo as a bonus action once before the ability ends.</li><li><strong>+4 Spirituality:</strong> Split into two synchronized threads for up to 1 round. You perceive from both positions and may deliver one touch/range-30 Mystery Pryer ability from either thread.</li></ul><p><em>Counterplay:</em> anti-transformation barriers, anti-divination seals, and disruption fields can force immediate reformation.</p><p><em>Corruption Hook:</em> each time you remain transformed beyond 1 minute in a day, make a Wisdom save or gain 1 Corruption from identity diffusion.</p>',
      img: 'icons/magic/perception/eye-ringed-glow-angry-large-teal.webp',
      activationType: 'action',
      durationValue: '1',
      durationUnits: 'minute',
      targetType: 'self',
      targetCount: '1',
      targetSpecial: '',
      rangeUnits: 'self',
      rangeValue: null,
      rangeSpecial: '',
      school: 'trs',
      properties: ['vocal', 'somatic', 'concentration'],
      materials: 'a mirror inscribed with your true name',
      identifier: 'lotm-mystery-pryer-imperial-knowledge-embodiment',
      activityId: 'pryerSeq1EmbAct01',
      now: now + 4,
      existing: existingAbility1,
      sort: 1100800
    });

    const ability2 = buildAbilityDoc({
      id: ABILITY_2_ID,
      name: 'Arcana Bestowal',
      description:
        '<p><strong>Baseline (2 Spirituality):</strong> Action. Imbue one analyzed occult formula into a willing creature within 60 feet for 1 minute. Choose one minor rider: +2 bonus to one skill family (Arcana/Investigation/Religion), +10 feet movement, or advantage on one type of saving throw chosen at cast. A target may hold only one Arcana Bestowal at a time.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Affect one additional willing creature in range.</li><li><strong>+2 Spirituality:</strong> Granted rider strength improves (skill bonus becomes +Potency; save advantage can apply twice before ending).</li><li><strong>+4 Spirituality:</strong> Bestow one bounded copied rider from a non-legendary ability you directly observed this scene (GM verifies eligibility; no authority-level effects).</li></ul><p><em>Counterplay:</em> anti-transfer wards, identity locks, and effects without analyzable structure cannot be bestowed.</p><p><em>Corruption Hook:</em> repeatedly forcing alien knowledge patterns into unwilling minds causes backlash; if used on an unwilling target, gain 1 Corruption on failed Wisdom save.</p>',
      img: 'icons/magic/symbols/runes-star-pentagon-blue.webp',
      activationType: 'action',
      durationValue: '1',
      durationUnits: 'minute',
      targetType: 'creature',
      targetCount: '1',
      targetSpecial: 'willing creature',
      rangeUnits: 'ft',
      rangeValue: '60',
      rangeSpecial: '',
      school: 'abj',
      properties: ['vocal', 'somatic', 'material'],
      materials: 'annotated parchment containing the analyzed formula',
      identifier: 'lotm-mystery-pryer-arcana-bestowal',
      activityId: 'pryerSeq1BesAct02',
      now: now + 5,
      existing: existingAbility2,
      sort: 1100801
    });

    const ability3 = buildAbilityDoc({
      id: ABILITY_3_ID,
      name: 'Sovereign Revision Field',
      description:
        '<p><strong>Baseline (1 Spirituality):</strong> Action. Create a 20-foot-radius revision field centered on a point within 90 feet for 1 minute (concentration). Inside the field, once per round when a creature rolls an attack, save, or check, you may force a Wisdom save. On failure, revise one term: change target to another legal target, reduce movement by 10 feet, or flip advantage/disadvantage state.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Radius becomes 30 feet.</li><li><strong>+2 Spirituality:</strong> You may apply two different legal revisions to the same failed save trigger.</li><li><strong>+4 Spirituality:</strong> Field gains a lock clause; hostile creatures failing the save cannot take reactions until start of their next turn.</li></ul><p><em>Counterplay:</em> immutable authority effects, concealment of trigger timing, and stronger rank certainty can resist revision.</p><p><em>Corruption Hook:</em> if you use this to repeatedly erase consequences for yourself, gain 1 Corruption after the encounter.</p>',
      img: 'icons/magic/time/arrows-circling-green.webp',
      activationType: 'action',
      durationValue: '1',
      durationUnits: 'minute',
      targetType: 'space',
      targetCount: '1',
      targetSpecial: '20-foot-radius revision zone',
      rangeUnits: 'ft',
      rangeValue: '90',
      rangeSpecial: '',
      school: 'enc',
      properties: ['vocal', 'somatic', 'concentration'],
      materials: 'a copper compass marked with occult numerals',
      identifier: 'lotm-mystery-pryer-sovereign-revision-field',
      activityId: 'pryerSeq1RevAct03',
      now: now + 6,
      existing: existingAbility3,
      sort: 1100802
    });

    const ability4 = buildAbilityDoc({
      id: ABILITY_4_ID,
      name: "Emperor's Query",
      description:
        '<p><strong>Baseline (1 Spirituality):</strong> Bonus action. Ask one layered question targeting one creature or phenomenon within 120 feet that can perceive you. The target makes an Intelligence save. On failure, you extract one truthful tactical answer chosen from: immediate intention, nearest hidden support, strongest current weakness, or short-horizon consequence if it continues its declared action.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Ask one additional linked sub-question from the same answer category.</li><li><strong>+2 Spirituality:</strong> You may choose from any two categories on the same cast.</li><li><strong>+4 Spirituality:</strong> Seal of inquiry: if target fails, it takes psychic damage equal to <strong>Potency</strong> whenever it deliberately speaks false information before the end of your next turn.</li></ul><p><em>Counterplay:</em> anti-divination effects, mind partitions, and higher-sequence concealment can blur or block valid answers.</p><p><em>Corruption Hook:</em> compulsive prying into intimate truths without cause accrues corruption pressure at GM discretion.</p>',
      img: 'icons/magic/perception/third-eye-blue-red.webp',
      activationType: 'bonus',
      durationValue: '1',
      durationUnits: 'round',
      targetType: 'creature',
      targetCount: '1',
      targetSpecial: 'creature or active phenomenon capable of yielding information',
      rangeUnits: 'ft',
      rangeValue: '120',
      rangeSpecial: '',
      school: 'div',
      properties: ['vocal'],
      materials: 'none',
      identifier: 'lotm-mystery-pryer-emperors-query',
      activityId: 'pryerSeq1QueAct04',
      now: now + 7,
      existing: existingAbility4,
      sort: 1100803
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
