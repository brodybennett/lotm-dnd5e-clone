const { ClassicLevel } = require('./node-tools/node_modules/classic-level');

const CORE_VERSION = '13.351';
const SYSTEM_ID = 'lotm';
const SYSTEM_VERSION = '5.2.6';
const MODIFIER = '0000000000000000';

const PATHWAY_IDENTIFIER = 'lotm-mystery-pryer';
const DEFAULT_PATHWAY_ID = 'lotmPathway00014';
const FOLDER_ID = 'GEb0Z39c7pW51DAO';

const LEGACY_A_ID = 'lotmAbilityP9001';
const LEGACY_B_ID = 'lotmAbilityP8002';

const ABILITY_1_ID = 'lotmAbilityP7001';
const ABILITY_2_ID = 'lotmAbilityP7002';
const ABILITY_3_ID = 'lotmAbilityP7003';

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
    const pathway = await getOptionalJson(pathwaysDb, pathwayKey);
    if (!pathway) throw new Error(`Mystery Pryer pathway (${pathwayKey}) not found.`);

    pathway.system = pathway.system ?? {};
    pathway.system.description = pathway.system.description ?? { value: '', chat: '' };
    pathway.system.description.value =
      '<p><strong>Pathway Vector:</strong> inquisitive occult scholarship through spirit sight, structured divination, and careful ritual inquiry that rewards layered interpretation over blunt certainty.</p>' +
      '<p><strong>Sequence 9 Package (Total Budget 2):</strong> Eyes of Mystery Prying, Quick Rituals.</p>' +
      '<p><strong>Sequence 8 Package (Gain Budget +3):</strong> Spirit World Entry, Arcane Marginalia, plus one legacy scope upgrade to Eyes of Mystery Prying.</p>' +
      '<p><strong>Sequence 7 Package (Gain Budget +13):</strong> Threefold Formula, Occult Backtrace, Premonitory Footnote, plus two legacy upgrades (Eyes of Mystery Prying and Arcane Marginalia).</p>' +
      '<p><strong>Sequence 6-0 Status:</strong> Pending authoring in later sequence-focused runs.</p>' +
      '<p><strong>Continuity Anchor:</strong> At Sequence 7 (Warlock), Mystery Pryer integrates disciplined spell architecture, predictive instinct, and deeper arcane backtracing so knowledge becomes repeatable battlefield method rather than isolated insight.</p>';
    pathway._stats = buildStats(now, pathway._stats);
    await pathwaysDb.put(pathwayKey, JSON.stringify(pathway));

    const folderKey = `!folders!${FOLDER_ID}`;
    const folder = await getOptionalJson(abilitiesDb, folderKey);
    if (!folder) throw new Error(`Mystery Pryer folder (${FOLDER_ID}) not found.`);

    folder.description = 'Sequence abilities for the Mystery Pryer pathway (authored through Sequence 7).';
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

    const legacyAHeader = '<h3>Legacy Upgrade (Sequence 7 - Potency)</h3>';
    const legacyAText =
      '<p>At Sequence 7, Eyes of Mystery Prying can weaponize precise conclusions. ' +
      'If you use the ability and then successfully hit or force a save from that same target before the end of your next turn, deal extra psychic damage equal to <strong>Potency</strong> once per cast. ' +
      'If the cast included a +2 or higher upcast tier, the target also has disadvantage on its next check to maintain concealment or deception before your next turn.</p>';
    const legacyADescription = String(legacyA.system?.description?.value ?? '');
    if (!legacyADescription.includes(legacyAHeader)) {
      legacyA.system.description.value = `${legacyADescription}${legacyAHeader}${legacyAText}`;
    }
    legacyA._stats = buildStats(now + 2, legacyA._stats);
    await abilitiesDb.put(legacyAKey, JSON.stringify(legacyA));

    const legacyBHeader = '<h3>Legacy Upgrade (Sequence 7 - Efficiency)</h3>';
    const legacyBText =
      '<p>At Sequence 7, Arcane Marginalia can be threaded into ongoing analysis. ' +
      'Once per round, if your current turn already included a successful Arcana, Investigation, or Insight check, you may cast Arcane Marginalia as part of the same action without consuming your bonus action. ' +
      'When cast this way, its +1 upcast rider cost is reduced by 1 (minimum 0).</p>';
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
      name: 'Threefold Formula',
      description:
        '<p><strong>Baseline (1 Spirituality):</strong> Action. Execute a Warlock-grade 3-step cast (focus, mental symbol, material trigger) against one creature within 60 feet. Choose one formula:</p><ul><li><strong>Disruptive Formula:</strong> Intelligence save. On failure, the target takes <strong>+1 psychic damage</strong> and has disadvantage on its next concentration check before your next turn.</li><li><strong>Clarifying Formula:</strong> One ally within 30 feet gains <strong>+1</strong> on its next check or save against illusion, charm, or misinformation before your next turn.</li></ul><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Apply the chosen formula to one additional valid target.</li><li><strong>+2 Spirituality:</strong> Disruptive damage becomes <strong>+Potency</strong>; Clarifying bonus becomes <strong>+Potency</strong>.</li><li><strong>+4 Spirituality:</strong> Resolve both formulas with one cast (separate targets allowed), and the Disruptive target cannot benefit from advantage on its next spell attack or save DC boost before your next turn.</li></ul><p><em>Counterplay:</em> broken line-of-sight, symbol interference, and anti-magic turbulence can interrupt one step of the formula.</p><p><em>Corruption Hook:</em> if you intentionally overwrite a bystander\'s mind-state with fabricated certainties, gain 1 Corruption.</p>',
      img: 'icons/magic/symbols/runes-star-square-purple.webp',
      activationType: 'action',
      durationValue: '',
      durationUnits: 'inst',
      targetType: 'creature',
      targetCount: '1',
      targetSpecial: 'creature or ally involved in the formula resolution',
      rangeUnits: 'ft',
      rangeValue: '60',
      rangeSpecial: '',
      school: 'evo',
      properties: ['vocal', 'somatic', 'material'],
      materials: 'powdered chalk, a traced sigil, and one drop of ink',
      identifier: 'lotm-mystery-pryer-threefold-formula',
      activityId: 'pryerSeq7ForAct01',
      now: now + 4,
      existing: existingAbility1,
      sort: 1100200
    });

    const ability2 = buildAbilityDoc({
      id: ABILITY_2_ID,
      name: 'Occult Backtrace',
      description:
        '<p><strong>Baseline (0 Spirituality):</strong> Action. Inspect one creature, remnant aura, blood trace, sealed artifact, or ritual residue within 30 feet. Ask one <em>probing backtrace question</em> (origin, domain, intent, or missing component); GM provides one truthful clue. You then gain one <strong>Backtrace Mark</strong> for 10 minutes tied to that source. While you hold the mark, once you may add <strong>+1</strong> to a save or contest directly against that source\'s related effect.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Gain one additional Backtrace Mark or extend mark duration to 1 hour.</li><li><strong>+2 Spirituality:</strong> Expend a mark to force the linked source (or current bearer) to make an Intelligence save; on failure, it loses reactions until the start of its next turn.</li><li><strong>+4 Spirituality:</strong> Expend two marks to imitate one minor quality of the traced source for 1 round (GM-approved: resistance fragment, movement trait, or sensory trait), without copying full authority.</li></ul><p><em>Counterplay:</em> scrubbed scenes, null-residue wards, and intentionally mixed signatures reduce trace reliability.</p><p><em>Corruption Hook:</em> if you steal power from traces tied to taboo sacrifices or unwilling victims, gain 1 Corruption.</p>',
      img: 'icons/magic/symbols/runes-triangular-tiny-gold.webp',
      activationType: 'action',
      durationValue: '10',
      durationUnits: 'minute',
      targetType: 'creature',
      targetCount: '1',
      targetSpecial: 'creature, remnant aura, blood trace, sealed artifact, or ritual residue',
      rangeUnits: 'ft',
      rangeValue: '30',
      rangeSpecial: '',
      school: 'div',
      properties: ['vocal', 'somatic', 'material'],
      materials: 'a tracing stylus and any absorbent medium (paper, dust, cloth)',
      identifier: 'lotm-mystery-pryer-occult-backtrace',
      activityId: 'pryerSeq7BacAct02',
      now: now + 5,
      existing: existingAbility2,
      sort: 1100201
    });

    const ability3 = buildAbilityDoc({
      id: ABILITY_3_ID,
      name: 'Premonitory Footnote',
      description:
        '<p><strong>Baseline (0 Spirituality):</strong> Bonus action. Write a predictive footnote into your awareness for 1 minute. Choose yourself or one ally within 30 feet. Once per round when the chosen target is about to be attacked or forced to save, it can shift up to 5 feet and gain <strong>+1 AC</strong> or <strong>+1</strong> to that save (declared before resolution).</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Affect one additional ally in range.</li><li><strong>+2 Spirituality:</strong> Bonus becomes <strong>+Potency</strong>, and each affected target gains advantage on one initiative or Perception check before the effect ends.</li><li><strong>+4 Spirituality:</strong> Once during duration, when an affected target is hit, you may force the attacker to reroll the d20 and use the lower result (one use per cast).</li></ul><p><em>Counterplay:</em> overwhelming area effects, silence/mental suppression, and forced immobilization can blunt premonition value.</p><p><em>Corruption Hook:</em> if you ignore repeated warning signs to pursue reckless prying anyway, gain 1 Corruption at scene end.</p>',
      img: 'icons/magic/time/clock-stopwatch-white-blue.webp',
      activationType: 'bonus',
      durationValue: '1',
      durationUnits: 'minute',
      targetType: 'ally',
      targetCount: '1',
      targetSpecial: 'self or one ally within range',
      rangeUnits: 'ft',
      rangeValue: '30',
      rangeSpecial: '',
      school: 'div',
      properties: ['vocal', 'somatic'],
      materials: 'a short written clause or finger-traced annotation sigil',
      identifier: 'lotm-mystery-pryer-premonitory-footnote',
      activityId: 'pryerSeq7PreAct03',
      now: now + 6,
      existing: existingAbility3,
      sort: 1100202
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
          abilityKeys: [
            `!items!${ABILITY_1_ID}`,
            `!items!${ABILITY_2_ID}`,
            `!items!${ABILITY_3_ID}`
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
