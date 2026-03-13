const { ClassicLevel } = require('./node-tools/node_modules/classic-level');

const CORE_VERSION = '13.351';
const SYSTEM_ID = 'lotm';
const SYSTEM_VERSION = '5.2.6';
const MODIFIER = '0000000000000000';

const PATHWAY_IDENTIFIER = 'lotm-mystery-pryer';
const DEFAULT_PATHWAY_ID = 'lotmPathway00014';
const FOLDER_ID = 'GEb0Z39c7pW51DAO';

const LEGACY_A_ID = 'lotmAbilityP4001';
const LEGACY_B_ID = 'lotmAbilityP5001';

const ABILITY_1_ID = 'lotmAbilityP2001';
const ABILITY_2_ID = 'lotmAbilityP2002';
const ABILITY_3_ID = 'lotmAbilityP2003';
const ABILITY_4_ID = 'lotmAbilityP2004';

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
      '<p><strong>Sequence 1-0 Status:</strong> Pending authoring in later sequence-focused runs.</p>' +
      '<p><strong>Continuity Anchor:</strong> At Sequence 2 (Sage), Mystery Pryer crosses into information-authority play: deleting, revising, and remapping knowledge-state while maintaining counterplay via scope limits, corruption risk, and setup pressure.</p>';
    pathway._stats = buildStats(now, pathway._stats);
    await pathwaysDb.put(pathwayKey, JSON.stringify(pathway));

    const folderKey = `!folders!${FOLDER_ID}`;
    const folder = await getOptionalJson(abilitiesDb, folderKey);
    if (!folder) throw new Error(`Mystery Pryer folder (${FOLDER_ID}) not found.`);

    folder.description = 'Sequence abilities for the Mystery Pryer pathway (authored through Sequence 2).';
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
      '<p>At Sequence 2, Mystical Re-enactment can carry partial Sage-grade informational overload. ' +
      'When cast with at least <strong>+2 Spirituality</strong>, affected targets that fail their primary save take bonus psychic damage equal to <strong>Potency</strong> and cannot benefit from advantage on the next knowledge-dependent check/save before your next turn. ' +
      'If you invoke the +4 exclusivity clause, this bonus triggers once per affected target.</p>';
    const legacyADescription = String(legacyA.system?.description?.value ?? '');
    if (!legacyADescription.includes(legacyAHeader)) {
      legacyA.system.description.value = `${legacyADescription}${legacyAHeader}${legacyAText}`;
    }
    legacyA._stats = buildStats(now + 2, legacyA._stats);
    await abilitiesDb.put(legacyAKey, JSON.stringify(legacyA));

    const legacyBHeader = '<h3>Legacy Upgrade (Sequence 2 - Scope)</h3>';
    const legacyBText =
      '<p>At Sequence 2, Starlight Cage can be woven into layered informational grids. ' +
      'When you cast Starlight Cage with at least <strong>+2 Spirituality</strong>, place one secondary cage anchor within 20 feet of the first. ' +
      'Each anchor resolves its own save and lock effect; each creature can be held by only one anchor unless +4 Spirituality is spent. ' +
      'Once per short rest, the secondary anchor can be created without paying the +2 surcharge.</p>';
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
      name: 'Information Torrent Manifestation',
      description:
        '<p><strong>Baseline (2 Spirituality):</strong> Action. Convert your current body-state into a controlled stream of occult information until the end of your next turn. While manifested, you gain resistance to bludgeoning, piercing, and slashing damage from non-magical sources, can move through occupied spaces, and ignore nonmagical difficult terrain.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Duration becomes 1 minute; you can end it early as a free action.</li><li><strong>+2 Spirituality:</strong> Passing through a creature forces an Intelligence save; on failure it takes psychic damage equal to <strong>Potency</strong> and has disadvantage on its next opportunity attack.</li><li><strong>+4 Spirituality:</strong> Split into two information strands and reform at one chosen endpoint within 120 feet; one strand may carry a held object or willing touched ally of your size or smaller.</li></ul><p><em>Counterplay:</em> anti-transformation seals, information-scrambling fields, and stronger conceptual bindings can constrain movement or force early reformation.</p><p><em>Corruption Hook:</em> prolonged torrent-state without rest risks identity erosion; failed post-cast Wisdom save gains 1 Corruption.</p>',
      img: 'icons/magic/symbols/question-stone-yellow.webp',
      activationType: 'action',
      durationValue: '1',
      durationUnits: 'round',
      targetType: 'self',
      targetCount: '1',
      targetSpecial: '',
      rangeUnits: 'self',
      rangeValue: null,
      rangeSpecial: '',
      school: 'trs',
      properties: ['vocal', 'somatic'],
      materials: 'none',
      identifier: 'lotm-mystery-pryer-information-torrent-manifestation',
      activityId: 'pryerSeq2TorAct01',
      now: now + 4,
      existing: existingAbility1,
      sort: 1100700
    });

    const ability2 = buildAbilityDoc({
      id: ABILITY_2_ID,
      name: 'Deletion Protocol',
      description:
        '<p><strong>Baseline (1 Spirituality):</strong> Action. Choose one creature, object, or effect within 90 feet and mark one <em>information layer</em> for deletion (movement rider, concealment rider, or one non-legendary temporary buff). Target makes an Intelligence save (or the effect uses its controller\'s spell DC). On failure, the selected layer is suppressed until the start of your next turn.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Suppress one additional eligible information layer on same target.</li><li><strong>+2 Spirituality:</strong> Duration becomes 1 minute; target repeats save at end of each turn to restore deleted layer.</li><li><strong>+4 Spirituality:</strong> Area protocol: choose up to three targets within 20 feet of each other and delete one eligible layer from each (separate saves).</li></ul><p><em>Counterplay:</em> authority-grade effects, artifact-bound states, and layered redundancy can prevent or quickly restore deleted layers.</p><p><em>Corruption Hook:</em> deleting identity-defining memories or sacred truths for convenience incurs immediate corruption pressure.</p>',
      img: 'icons/magic/unholy/silhouette-fire-blue.webp',
      activationType: 'action',
      durationValue: '1',
      durationUnits: 'round',
      targetType: 'creature',
      targetCount: '1',
      targetSpecial: 'creature, object, or active effect with deletable information layer',
      rangeUnits: 'ft',
      rangeValue: '90',
      rangeSpecial: '',
      school: 'enc',
      properties: ['vocal', 'somatic', 'material'],
      materials: 'an erased sigil card or wiped script surface',
      identifier: 'lotm-mystery-pryer-deletion-protocol',
      activityId: 'pryerSeq2DelAct02',
      now: now + 5,
      existing: existingAbility2,
      sort: 1100701
    });

    const ability3 = buildAbilityDoc({
      id: ABILITY_3_ID,
      name: 'Revision Mandate',
      description:
        '<p><strong>Baseline (1 Spirituality):</strong> Bonus action. Choose one known fact-pattern or immediate action declaration within 60 feet and issue a bounded revision. Target creature makes a Wisdom save. On failure, revise one parameter: shift final position by up to 10 feet, change chosen target to another valid option in range, or invert advantage/disadvantage state on one declared roll.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Apply one additional revision parameter if legally compatible.</li><li><strong>+2 Spirituality:</strong> Revision window extends to the start of your next turn and may affect one ally and one hostile target in the same cast (separate saves as needed).</li><li><strong>+4 Spirituality:</strong> Enforce hard revision clause: on failed save, target cannot benefit from reactions tied to the revised action sequence until turn end.</li></ul><p><em>Counterplay:</em> precommitted authority effects, immutable clauses, and better rank certainty can resist revision.</p><p><em>Corruption Hook:</em> abusing revision to erase accountability or fabricate innocence gains corruption.</p>',
      img: 'icons/magic/time/arrows-circling-green.webp',
      activationType: 'bonus',
      durationValue: '1',
      durationUnits: 'round',
      targetType: 'creature',
      targetCount: '1',
      targetSpecial: 'creature or action-sequence node under revision',
      rangeUnits: 'ft',
      rangeValue: '60',
      rangeSpecial: '',
      school: 'div',
      properties: ['vocal', 'somatic'],
      materials: 'none',
      identifier: 'lotm-mystery-pryer-revision-mandate',
      activityId: 'pryerSeq2RevAct03',
      now: now + 6,
      existing: existingAbility3,
      sort: 1100702
    });

    const ability4 = buildAbilityDoc({
      id: ABILITY_4_ID,
      name: 'Sage Counterfate',
      description:
        '<p><strong>Baseline (0 Spirituality):</strong> Reaction, when a visible creature within 120 feet takes an action. You glimpse a future fragment and impose a counterfate check: creature makes an Intelligence save. On failure, it takes <strong>+1 psychic damage</strong> and suffers disadvantage on the triggering action\'s next d20 roll component.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Affect one additional creature participating in the same triggering sequence.</li><li><strong>+2 Spirituality:</strong> Damage becomes <strong>+Potency</strong>; on failed save, target also loses reactions until start of its next turn.</li><li><strong>+4 Spirituality:</strong> Counterfate lock: after failure, choose one of target\'s active temporary effects; it is suppressed until end of target\'s next turn (non-artifact only).</li></ul><p><em>Counterplay:</em> hidden actions, anti-prophecy shielding, and off-turn authority activations can evade counterfate timing.</p><p><em>Corruption Hook:</em> compulsive overuse of future-fragment interception leads to paranoia and corruption.</p>',
      img: 'icons/magic/perception/eye-ringed-glow-angry-large-teal.webp',
      activationType: 'reaction',
      durationValue: '',
      durationUnits: 'inst',
      targetType: 'creature',
      targetCount: '1',
      targetSpecial: 'creature taking the triggering action',
      rangeUnits: 'ft',
      rangeValue: '120',
      rangeSpecial: '',
      school: 'enc',
      properties: ['vocal'],
      materials: 'none',
      identifier: 'lotm-mystery-pryer-sage-counterfate',
      activityId: 'pryerSeq2CouAct04',
      now: now + 7,
      existing: existingAbility4,
      sort: 1100703
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
