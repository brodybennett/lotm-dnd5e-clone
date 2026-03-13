const { ClassicLevel } = require('./node-tools/node_modules/classic-level');

const CORE_VERSION = '13.351';
const SYSTEM_ID = 'lotm';
const SYSTEM_VERSION = '5.2.6';
const MODIFIER = '0000000000000000';

const PATHWAY_IDENTIFIER = 'lotm-mystery-pryer';
const DEFAULT_PATHWAY_ID = 'lotmPathway00014';
const FOLDER_ID = 'GEb0Z39c7pW51DAO';

const LEGACY_A_ID = 'lotmAbilityP5003';
const LEGACY_B_ID = 'lotmAbilityP6002';

const ABILITY_1_ID = 'lotmAbilityP3001';
const ABILITY_2_ID = 'lotmAbilityP3002';
const ABILITY_3_ID = 'lotmAbilityP3003';
const ABILITY_4_ID = 'lotmAbilityP3004';

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
      '<p><strong>Sequence 2-0 Status:</strong> Pending authoring in later sequence-focused runs.</p>' +
      '<p><strong>Continuity Anchor:</strong> At Sequence 3 (Clairvoyant), Mystery Pryer gains partial authority over destiny-prying: foresight becomes operational, reenactment grows more accurate and repeatable, and remote prayer response enters play.</p>';
    pathway._stats = buildStats(now, pathway._stats);
    await pathwaysDb.put(pathwayKey, JSON.stringify(pathway));

    const folderKey = `!folders!${FOLDER_ID}`;
    const folder = await getOptionalJson(abilitiesDb, folderKey);
    if (!folder) throw new Error(`Mystery Pryer folder (${FOLDER_ID}) not found.`);

    folder.description = 'Sequence abilities for the Mystery Pryer pathway (authored through Sequence 3).';
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

    const legacyAHeader = '<h3>Legacy Upgrade (Sequence 3 - Scope)</h3>';
    const legacyAText =
      '<p>At Sequence 3, Star Concealment can adopt prophecy-indexed safe corridors. ' +
      'When cast with at least <strong>+2 Spirituality</strong>, choose one ally per round that starts inside the zone: that ally may move up to 15 feet inside or between concealment zones without provoking opportunity attacks. ' +
      'If you use the +4 dual-zone mode, this safe-corridor movement can bridge the zones once per round.</p>';
    const legacyADescription = String(legacyA.system?.description?.value ?? '');
    if (!legacyADescription.includes(legacyAHeader)) {
      legacyA.system.description.value = `${legacyADescription}${legacyAHeader}${legacyAText}`;
    }
    legacyA._stats = buildStats(now + 2, legacyA._stats);
    await abilitiesDb.put(legacyAKey, JSON.stringify(legacyA));

    const legacyBHeader = '<h3>Legacy Upgrade (Sequence 3 - Efficiency)</h3>';
    const legacyBText =
      '<p>At Sequence 3, Secret Voice Scroll upgrades into an omen relay network. ' +
      'While the link persists, each connected ally can issue one omen ping per round as a free action (no action cost) indicating threat direction. ' +
      'The first spirituality surcharge spent on the next allied defensive or movement effect this round is reduced by <strong>1</strong> (minimum 0), once per round across the network.</p>';
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
      name: 'Clairvoyant Branch',
      description:
        '<p><strong>Baseline (1 Spirituality):</strong> Action. Choose one creature, choice-point, or unfolding event within 120 feet that you can perceive. You gain a brief prophecy branch: GM provides one likely immediate consequence, and you choose one rider:</p><ul><li><strong>Best Option:</strong> one ally gains <strong>+1</strong> on its next roll against that target/event before end of your next turn.</li><li><strong>Bad Branch Warning:</strong> one enemy linked to that branch takes <strong>-1</strong> on its next attack roll or save DC before end of its next turn.</li></ul><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Read one additional branch or include one additional allied/enemy rider target.</li><li><strong>+2 Spirituality:</strong> If the chosen creature follows the predicted branch, you may force one reroll of its next d20 before your next turn (must use lower for hostile, higher for allied).</li><li><strong>+4 Spirituality:</strong> Lock one branch for 1 round: target creature cannot benefit from advantage on branch-relevant checks/saves, and your ally bonus becomes <strong>+Potency</strong>.</li></ul><p><em>Counterplay:</em> chaotic multi-variable environments, anti-divination wards, and superior rank interference can blur branch accuracy.</p><p><em>Corruption Hook:</em> aggressively forcing fate outcomes for vanity over necessity adds corruption pressure.</p>',
      img: 'icons/magic/perception/orb-crystal-ball-scrying-blue.webp',
      activationType: 'action',
      durationValue: '1',
      durationUnits: 'round',
      targetType: 'creature',
      targetCount: '1',
      targetSpecial: 'creature, decision branch, or unfolding event under prophecy',
      rangeUnits: 'ft',
      rangeValue: '120',
      rangeSpecial: '',
      school: 'div',
      properties: ['vocal', 'somatic'],
      materials: 'none',
      identifier: 'lotm-mystery-pryer-clairvoyant-branch',
      activityId: 'pryerSeq3BraAct01',
      now: now + 4,
      existing: existingAbility1,
      sort: 1100600
    });

    const ability2 = buildAbilityDoc({
      id: ABILITY_2_ID,
      name: 'Fate Cross-Section',
      description:
        '<p><strong>Baseline (0 Spirituality):</strong> Action. Slice through one target\'s fate context (creature, object, or scene residue) within 60 feet and visualize one past or imminent thread. Ask one precise question about what just happened or what likely follows in the next minute; GM provides one truthful but bounded answer. You gain one <strong>Fate Tag</strong> for 10 minutes tied to that thread.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Gain one additional Fate Tag or expand read-window to the last 24 hours.</li><li><strong>+2 Spirituality:</strong> Expend a Fate Tag to impose disadvantage on one deception, concealment, or misdirection attempt tied to the same thread.</li><li><strong>+4 Spirituality:</strong> Expend two Fate Tags to briefly rewrite trajectory: after a visible creature in thread range rolls a d20, force a reroll and choose the new result (once per cast).</li></ul><p><em>Counterplay:</em> false ritual residues, fate-obscuring artifacts, and higher-sequence concealment can produce partial or noisy reads.</p><p><em>Corruption Hook:</em> reading personal destinies without consent or tactical need increases corruption risk.</p>',
      img: 'icons/magic/symbols/runes-etched-steel-blade.webp',
      activationType: 'action',
      durationValue: '10',
      durationUnits: 'minute',
      targetType: 'creature',
      targetCount: '1',
      targetSpecial: 'creature, object, or scene residue under fate analysis',
      rangeUnits: 'ft',
      rangeValue: '60',
      rangeSpecial: '',
      school: 'div',
      properties: ['vocal', 'somatic', 'material'],
      materials: 'a marked index card, dust map, or inscribed thread diagram',
      identifier: 'lotm-mystery-pryer-fate-cross-section',
      activityId: 'pryerSeq3FatAct02',
      now: now + 5,
      existing: existingAbility2,
      sort: 1100601
    });

    const ability3 = buildAbilityDoc({
      id: ABILITY_3_ID,
      name: 'Re-enactment Ascendance',
      description:
        '<p><strong>Baseline (2 Spirituality):</strong> Bonus action. Empower one active or immediately-following reenactment-style effect you cast this round. The empowered effect gains one enhancement: +Potency, +10 feet range, or one additional valid target (if multi-target is legal for that effect).</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Apply two enhancements instead of one.</li><li><strong>+2 Spirituality:</strong> If the empowered effect has a save, affected creatures that fail by 5 or more suffer an additional rider relevant to the effect (GM-adjudicated, minor control).</li><li><strong>+4 Spirituality:</strong> Invoke high-exclusivity knowledge: triple Potency contribution to one empowered instance, but make a Wisdom save or gain 1 Corruption due to retaliation feedback.</li></ul><p><em>Counterplay:</em> knowledge denial, ritual interruption, and anti-reenactment suppression reduce ascendance reliability.</p><p><em>Corruption Hook:</em> repeated overuse of high-exclusivity reenactment accelerates mental instability.</p>',
      img: 'icons/magic/symbols/ring-circle-smoke-blue.webp',
      activationType: 'bonus',
      durationValue: '1',
      durationUnits: 'round',
      targetType: 'self',
      targetCount: '1',
      targetSpecial: 'next reenactment-style effect you cast this round',
      rangeUnits: 'self',
      rangeValue: null,
      rangeSpecial: '',
      school: 'evo',
      properties: ['vocal', 'somatic', 'material'],
      materials: 'a mnemonic shard tied to one known mystical event',
      identifier: 'lotm-mystery-pryer-re-enactment-ascendance',
      activityId: 'pryerSeq3AscAct03',
      now: now + 6,
      existing: existingAbility3,
      sort: 1100602
    });

    const ability4 = buildAbilityDoc({
      id: ABILITY_4_ID,
      name: 'Prayer Echo',
      description:
        '<p><strong>Baseline (0 Spirituality):</strong> Reaction, when a marked ally within 300 feet calls your sigil-name in danger. Send one concise omen response: ally gains <strong>+1</strong> to AC or the triggering save, and may move 5 feet without provoking opportunity attacks from the triggering source.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Affect one additional linked ally who can hear the omen in the same scene.</li><li><strong>+2 Spirituality:</strong> Bonus becomes <strong>+Potency</strong>, and one affected ally may immediately end one minor fear/charm/illusion rider.</li><li><strong>+4 Spirituality:</strong> Echo rebounds onto hostile source: it makes a Wisdom save or has disadvantage on its next attack and takes psychic damage equal to <strong>Potency</strong>.</li></ul><p><em>Counterplay:</em> anti-prayer barriers, silence of symbolic identity, or planar separation can block the echo.</p><p><em>Corruption Hook:</em> promising divine certainty when your omen is knowingly false incurs corruption.</p>',
      img: 'icons/magic/light/explosion-star-small-pink.webp',
      activationType: 'reaction',
      durationValue: '1',
      durationUnits: 'inst',
      targetType: 'ally',
      targetCount: '1',
      targetSpecial: 'linked ally invoking your sigil-name',
      rangeUnits: 'ft',
      rangeValue: '300',
      rangeSpecial: '',
      school: 'abj',
      properties: ['vocal'],
      materials: 'none',
      identifier: 'lotm-mystery-pryer-prayer-echo',
      activityId: 'pryerSeq3PraAct04',
      now: now + 7,
      existing: existingAbility4,
      sort: 1100603
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
