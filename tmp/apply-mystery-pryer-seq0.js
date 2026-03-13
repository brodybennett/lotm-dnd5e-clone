const { ClassicLevel } = require('./node-tools/node_modules/classic-level');

const CORE_VERSION = '13.351';
const SYSTEM_ID = 'lotm';
const SYSTEM_VERSION = '5.2.6';
const MODIFIER = '0000000000000000';

const PATHWAY_IDENTIFIER = 'lotm-mystery-pryer';
const DEFAULT_PATHWAY_ID = 'lotmPathway00014';
const FOLDER_ID = 'GEb0Z39c7pW51DAO';

const LEGACY_A_ID = 'lotmAbilityP1002';
const LEGACY_B_ID = 'lotmAbilityP3002';

const ABILITY_1_ID = 'lotmAbilityP0001';
const ABILITY_2_ID = 'lotmAbilityP0002';
const ABILITY_3_ID = 'lotmAbilityP0003';
const ABILITY_4_ID = 'lotmAbilityP0004';

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
      '<p><strong>Sequence 0 Package (Gain Budget +114):</strong> Hermit Apotheosis, Digital Genesis Mandate, Omniscient Revision, and Doctrine of Hidden Instruction, plus two legacy upgrades (Arcana Bestowal and Fate Cross-Section).</p>' +
      '<p><strong>Continuity Anchor:</strong> At Sequence 0 (Hermit), Mystery Pryer reaches god-tier information sovereignty: symbolic-number authorship, broad copy/deletion/revision control, and pathway-wide knowledge indoctrination pressure while retaining counterplay via anti-authority domains, concealment asymmetry, and escalating corruption consequences.</p>';
    pathway._stats = buildStats(now, pathway._stats);
    await pathwaysDb.put(pathwayKey, JSON.stringify(pathway));

    const folderKey = `!folders!${FOLDER_ID}`;
    const folder = await getOptionalJson(abilitiesDb, folderKey);
    if (!folder) throw new Error(`Mystery Pryer folder (${FOLDER_ID}) not found.`);

    folder.description = 'Sequence abilities for the Mystery Pryer pathway (authored through Sequence 0).';
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

    const legacyAHeader = '<h3>Legacy Upgrade (Sequence 0 - Efficiency)</h3>';
    const legacyAText =
      '<p>At Sequence 0, Arcana Bestowal can be sustained as an imperial doctrine stream rather than a single cast transfer. ' +
      'Once per short rest, cast Arcana Bestowal at baseline without spending Spirituality. ' +
      'When Arcana Bestowal is cast with at least <strong>+2 Spirituality</strong>, one granted rider no longer requires your concentration tracking and persists for its full duration even if you are incapacitated.</p>';
    const legacyADescription = String(legacyA.system?.description?.value ?? '');
    if (!legacyADescription.includes(legacyAHeader)) {
      legacyA.system.description.value = `${legacyADescription}${legacyAHeader}${legacyAText}`;
    }
    legacyA._stats = buildStats(now + 2, legacyA._stats);
    await abilitiesDb.put(legacyAKey, JSON.stringify(legacyA));

    const legacyBHeader = '<h3>Legacy Upgrade (Sequence 0 - Scope)</h3>';
    const legacyBText =
      '<p>At Sequence 0, Fate Cross-Section can map branching outcomes across a wider causal mesh. ' +
      'When activated with at least <strong>+2 Spirituality</strong>, choose up to three linked targets within 300 feet instead of one. ' +
      'For each failed save against your linked fate rider, you may assign a different branch outcome clause to each target. ' +
      'At <strong>+4 Spirituality</strong>, branch read duration extends by 1 minute.</p>';
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
      name: 'Hermit Apotheosis',
      description:
        '<p><strong>Baseline (3 Spirituality):</strong> Action. For 10 minutes (concentration), become an apotheotic information body. You gain immunity to non-magical damage, resistance to magical damage except psychic, can occupy or pass through occupied spaces, and may perceive all creatures within 120 feet as layered information signatures. Once each turn, a hostile creature you pass through must make an Intelligence save or take psychic damage equal to <strong>2 + Potency</strong>.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+2 Spirituality:</strong> Duration becomes 1 hour.</li><li><strong>+4 Spirituality:</strong> Maintain two simultaneous information anchors within 300 feet; you may reform at either as a free action once per round.</li><li><strong>+6 Spirituality:</strong> Split into three parallel information threads for up to 3 rounds; each thread can deliver one non-attack Mystery Pryer ability per round from its position.</li></ul><p><em>Counterplay:</em> anti-divinity seals, high-rank concealment domains, and conceptual anti-transformation effects can constrain or collapse this state.</p><p><em>Corruption Hook:</em> if used to overwrite personal identity boundaries repeatedly, make a Wisdom save after use or gain 1 Corruption.</p>',
      img: 'icons/magic/perception/orb-crystal-ball-scrying.webp',
      activationType: 'action',
      durationValue: '10',
      durationUnits: 'minute',
      targetType: 'self',
      targetCount: '1',
      targetSpecial: '',
      rangeUnits: 'self',
      rangeValue: null,
      rangeSpecial: '',
      school: 'trs',
      properties: ['vocal', 'somatic', 'concentration'],
      materials: 'a silver mirror inscribed with binary numerals',
      identifier: 'lotm-mystery-pryer-hermit-apotheosis',
      activityId: 'pryerSeq0ApoAct01',
      now: now + 4,
      existing: existingAbility1,
      sort: 1100900
    });

    const ability2 = buildAbilityDoc({
      id: ABILITY_2_ID,
      name: 'Digital Genesis Mandate',
      description:
        '<p><strong>Baseline (2 Spirituality):</strong> Action. Imbue symbolic number-law into one digital or symbolic construct within 120 feet (written code, sigil grid, runic display, counting array, or abstract model) for 1 minute. The construct gains one mandate: <em>Copy</em> one visible non-legendary rider, <em>Delete</em> one temporary rider, or <em>Revision</em> one active parameter (range/target/trigger) within bounded legality.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Maintain one additional mandate simultaneously.</li><li><strong>+2 Spirituality:</strong> Duration becomes 10 minutes and copied/revised clauses gain +Potency to save DC pressure checks where applicable.</li><li><strong>+4 Spirituality:</strong> Area protocol: seed up to three linked constructs within 60 feet of each other; each can host a different mandate.</li></ul><p><em>Counterplay:</em> concealed source logic, anti-copy authorities, or uniqueness-protected effects are ineligible.</p><p><em>Corruption Hook:</em> unauthorized rewriting of sacred records or identities can trigger immediate corruption at GM discretion.</p>',
      img: 'icons/magic/symbols/runes-star-pentagon-blue.webp',
      activationType: 'action',
      durationValue: '1',
      durationUnits: 'minute',
      targetType: 'object',
      targetCount: '1',
      targetSpecial: 'digital, symbolic, or runic construct',
      rangeUnits: 'ft',
      rangeValue: '120',
      rangeSpecial: '',
      school: 'abj',
      properties: ['vocal', 'somatic', 'material'],
      materials: 'an etched slate with binary and occult symbols',
      identifier: 'lotm-mystery-pryer-digital-genesis-mandate',
      activityId: 'pryerSeq0DigAct02',
      now: now + 5,
      existing: existingAbility2,
      sort: 1100901
    });

    const ability3 = buildAbilityDoc({
      id: ABILITY_3_ID,
      name: 'Omniscient Revision',
      description:
        '<p><strong>Baseline (2 Spirituality):</strong> Reaction, when a creature within 300 feet declares an action, trigger, or effect resolution. Force an Intelligence save. On failure, choose one authority clause: copy one legal rider from the action and assign it elsewhere in range, delete one legal rider from the action, or revise one legal parameter (target, pathing, or order of resolution).</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Affect one additional creature participating in the same action chain.</li><li><strong>+2 Spirituality:</strong> Apply two different authority clauses to the same failed save target.</li><li><strong>+4 Spirituality:</strong> Lock clause: creatures that fail cannot benefit from reactions tied to the revised action chain until the start of their next turn.</li></ul><p><em>Counterplay:</em> immutable authority effects, successful saves, or hidden initiation vectors can partially evade revision.</p><p><em>Corruption Hook:</em> repeated reality edits for convenience rather than necessity compounds corruption pressure.</p>',
      img: 'icons/magic/time/arrows-circling-green.webp',
      activationType: 'reaction',
      durationValue: '',
      durationUnits: 'inst',
      targetType: 'creature',
      targetCount: '1',
      targetSpecial: 'actor in triggering chain',
      rangeUnits: 'ft',
      rangeValue: '300',
      rangeSpecial: '',
      school: 'enc',
      properties: ['vocal', 'somatic'],
      materials: 'none',
      identifier: 'lotm-mystery-pryer-omniscient-revision',
      activityId: 'pryerSeq0OmnAct03',
      now: now + 6,
      existing: existingAbility3,
      sort: 1100902
    });

    const ability4 = buildAbilityDoc({
      id: ABILITY_4_ID,
      name: 'Doctrine of Hidden Instruction',
      description:
        '<p><strong>Baseline (2 Spirituality):</strong> Bonus action. Select up to three creatures you can see within 180 feet and infuse each with a tailored knowledge directive for 1 minute. Choose one per target: grant +Potency bonus on one check/save category, inflict disadvantage on one category, or force a brief stunned state until end of its next turn on failed Intelligence save.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Affect up to two additional targets.</li><li><strong>+2 Spirituality:</strong> Beneficial directives can be sustained for 10 minutes; hostile directives that fail save also take psychic damage equal to <strong>Potency</strong>.</li><li><strong>+4 Spirituality:</strong> Pathway broadcast: one chosen Hermit-pathway ally in range automatically receives one beneficial directive without consuming target count.</li></ul><p><em>Counterplay:</em> mind-ward effects, high-rank concealment, and anti-indoctrination domains can resist or mute directives.</p><p><em>Corruption Hook:</em> indiscriminate forced indoctrination or identity erosion through repeated hostile directives risks corruption escalation.</p>',
      img: 'icons/magic/perception/third-eye-blue-red.webp',
      activationType: 'bonus',
      durationValue: '1',
      durationUnits: 'minute',
      targetType: 'creature',
      targetCount: '3',
      targetSpecial: 'creatures in line of sight',
      rangeUnits: 'ft',
      rangeValue: '180',
      rangeSpecial: '',
      school: 'div',
      properties: ['vocal'],
      materials: 'none',
      identifier: 'lotm-mystery-pryer-doctrine-of-hidden-instruction',
      activityId: 'pryerSeq0DocAct04',
      now: now + 7,
      existing: existingAbility4,
      sort: 1100903
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
