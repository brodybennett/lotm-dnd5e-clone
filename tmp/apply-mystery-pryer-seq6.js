const { ClassicLevel } = require('./node-tools/node_modules/classic-level');

const CORE_VERSION = '13.351';
const SYSTEM_ID = 'lotm';
const SYSTEM_VERSION = '5.2.6';
const MODIFIER = '0000000000000000';

const PATHWAY_IDENTIFIER = 'lotm-mystery-pryer';
const DEFAULT_PATHWAY_ID = 'lotmPathway00014';
const FOLDER_ID = 'GEb0Z39c7pW51DAO';

const LEGACY_A_ID = 'lotmAbilityP9002';
const LEGACY_B_ID = 'lotmAbilityP7002';

const ABILITY_1_ID = 'lotmAbilityP6001';
const ABILITY_2_ID = 'lotmAbilityP6002';
const ABILITY_3_ID = 'lotmAbilityP6003';

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
      level: 3,
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
        grantedSequence: 6
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
      '<p><strong>Sequence 5-0 Status:</strong> Pending authoring in later sequence-focused runs.</p>' +
      '<p><strong>Continuity Anchor:</strong> At Sequence 6 (Scrolls Professor), the pathway turns hard-won symbols into prepared assets, converting inquiry outcomes into deployable scroll techniques with faster release under pressure.</p>';
    pathway._stats = buildStats(now, pathway._stats);
    await pathwaysDb.put(pathwayKey, JSON.stringify(pathway));

    const folderKey = `!folders!${FOLDER_ID}`;
    const folder = await getOptionalJson(abilitiesDb, folderKey);
    if (!folder) throw new Error(`Mystery Pryer folder (${FOLDER_ID}) not found.`);

    folder.description = 'Sequence abilities for the Mystery Pryer pathway (authored through Sequence 6).';
    folder.flags = folder.flags ?? {};
    folder.flags.lotm = {
      ...(folder.flags.lotm ?? {}),
      pathwayIdentifier: PATHWAY_IDENTIFIER,
      latestAuthoredSequence: 6
    };
    folder._stats = buildStats(now + 1, folder._stats);
    await abilitiesDb.put(folderKey, JSON.stringify(folder));

    const legacyAKey = `!items!${LEGACY_A_ID}`;
    const legacyBKey = `!items!${LEGACY_B_ID}`;
    const legacyA = await getOptionalJson(abilitiesDb, legacyAKey);
    const legacyB = await getOptionalJson(abilitiesDb, legacyBKey);
    if (!legacyA) throw new Error(`Legacy target ${LEGACY_A_ID} not found.`);
    if (!legacyB) throw new Error(`Legacy target ${LEGACY_B_ID} not found.`);

    const legacyAHeader = '<h3>Legacy Upgrade (Sequence 6 - Scope)</h3>';
    const legacyAText =
      '<p>At Sequence 6, Quick Rituals can be externalized into prepared script anchors. ' +
      'When you cast Quick Rituals with at least <strong>+1 Spirituality</strong>, you may place a secondary ritual anchor within 30 feet of the primary point. ' +
      'The secondary anchor can hold Arcane Intercept or Residual Portrait independently, allowing two simultaneous coverage points for one casting. ' +
      'Once per short rest, this dual-anchor effect can be used without the +1 surcharge.</p>';
    const legacyADescription = String(legacyA.system?.description?.value ?? '');
    if (!legacyADescription.includes(legacyAHeader)) {
      legacyA.system.description.value = `${legacyADescription}${legacyAHeader}${legacyAText}`;
    }
    legacyA._stats = buildStats(now + 2, legacyA._stats);
    await abilitiesDb.put(legacyAKey, JSON.stringify(legacyA));

    const legacyBHeader = '<h3>Legacy Upgrade (Sequence 6 - Efficiency)</h3>';
    const legacyBText =
      '<p>At Sequence 6, Occult Backtrace marks streamline your prepared script workflow. ' +
      'When you expend a Backtrace Mark, reduce the spirituality surcharge of your next scroll-related cast this turn by <strong>1</strong> (minimum 0). ' +
      'If the reduced cast succeeds on its primary roll or save effect, regain one expended Backtrace Mark once per short rest.</p>';
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
      name: 'Scroll Making',
      description:
        '<p><strong>Baseline (1 Spirituality):</strong> Action. Inscribe one temporary scroll that lasts 1 hour (or until used). Choose one baseline script: <strong>Freeze</strong> (one creature, Constitution save, speed reduced by 10 feet until end of next turn), <strong>Wind</strong> (ally gains 10 feet movement this turn), or <strong>Healing</strong> (target regains 1 hit point and ends one minor nonmagical hindrance). A creature holding the scroll can cast it as an action, after which the scroll burns away.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Create one additional temporary scroll, or extend lifetime to 8 hours.</li><li><strong>+2 Spirituality:</strong> Add stronger script options: <strong>Numb</strong> (failed save: lose reactions until start of next turn), <strong>Burning</strong> (area scorch for fire damage equal to <strong>Potency</strong>), or <strong>Sun</strong> (purifying aura that grants advantage on one save vs undead/corruption before next turn).</li><li><strong>+4 Spirituality:</strong> Prepare up to three scrolls and trigger one of them as a bonus action instead of an action.</li></ul><p><em>Counterplay:</em> soaked or torn media, anti-script seals, and disrupted incantation cadence can invalidate prepared scrolls.</p><p><em>Corruption Hook:</em> if you mass-produce scrolls from forbidden knowledge without safety checks, gain 1 Corruption after the encounter.</p>',
      img: 'icons/sundries/documents/document-script-inked.webp',
      activationType: 'action',
      durationValue: '1',
      durationUnits: 'hour',
      targetType: 'object',
      targetCount: '1',
      targetSpecial: 'one temporary scroll and its eventual user',
      rangeUnits: 'self',
      rangeValue: null,
      rangeSpecial: '',
      school: 'trs',
      properties: ['vocal', 'somatic', 'material'],
      materials: 'prepared parchment, powdered reagent, and an inscribed sigil sequence',
      identifier: 'lotm-mystery-pryer-scroll-making',
      activityId: 'pryerSeq6ScrAct01',
      now: now + 4,
      existing: existingAbility1,
      sort: 1100300
    });

    const ability2 = buildAbilityDoc({
      id: ABILITY_2_ID,
      name: 'Secret Voice Scroll',
      description:
        '<p><strong>Baseline (0 Spirituality):</strong> Action. Burn a prepared whisper-script and establish a hidden voice channel among up to 3 willing creatures within 150 feet for 10 minutes. Linked creatures can communicate mentally in short phrases regardless of ordinary line-of-sight obstructions, so long as they remain on the same plane.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Increase linked creatures to 5, or extend duration to 1 hour.</li><li><strong>+2 Spirituality:</strong> While linked, each participant gains <strong>+Potency</strong> on one check to coordinate tactics (Stealth, Investigation, or Perception) once per cast.</li><li><strong>+4 Spirituality:</strong> Once per round, one linked creature can echo a warning through the channel as a reaction, granting another linked target advantage on one imminent save against an observed threat.</li></ul><p><em>Counterplay:</em> anti-telepathy wards, plane separation, and heavy spiritual interference can sever or garble the channel.</p><p><em>Corruption Hook:</em> if you use hidden channels to orchestrate unjust execution or betrayal, gain 1 Corruption.</p>',
      img: 'icons/magic/symbols/rune-sigil-white.webp',
      activationType: 'action',
      durationValue: '10',
      durationUnits: 'minute',
      targetType: 'ally',
      targetCount: '3',
      targetSpecial: 'willing linked creatures',
      rangeUnits: 'ft',
      rangeValue: '150',
      rangeSpecial: '',
      school: 'div',
      properties: ['vocal', 'material'],
      materials: 'a narrow strip of inscribed parchment burned after incantation',
      identifier: 'lotm-mystery-pryer-secret-voice-scroll',
      activityId: 'pryerSeq6SecAct02',
      now: now + 5,
      existing: existingAbility2,
      sort: 1100301
    });

    const ability3 = buildAbilityDoc({
      id: ABILITY_3_ID,
      name: 'Elemental Cipher Scroll',
      description:
        '<p><strong>Baseline (1 Spirituality):</strong> Action. Release one offensive scroll cipher at a point within 60 feet; choose one mode:</p><ul><li><strong>Freezing Cipher:</strong> 10-foot line, Constitution save, cold damage +1 and target speed halved until end of next turn on failure.</li><li><strong>Storm Cipher:</strong> 10-foot burst, Dexterity save, lightning damage +1 and target cannot take reactions on failure.</li><li><strong>Burning Cipher:</strong> 10-foot burst, Dexterity save, fire damage +1 and ignited ground persists until start of your next turn.</li></ul><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Increase burst/line size to 15 feet or affect one extra target in the area.</li><li><strong>+2 Spirituality:</strong> Damage becomes <strong>+Potency</strong>, and one failed target suffers secondary control (slowed, pushed 10 feet by wind, or disadvantage on next attack).</li><li><strong>+4 Spirituality:</strong> Combine two different modes in one cast, resolving both effects at the same point (separate saves).</li></ul><p><em>Counterplay:</em> elemental resistance, anti-script disruption, and prepared shelter significantly reduce impact.</p><p><em>Corruption Hook:</em> if you deploy destructive ciphers where innocents are predictable collateral, gain 1 Corruption.</p>',
      img: 'icons/magic/fire/barrier-shield-explosion-yellow.webp',
      activationType: 'action',
      durationValue: '',
      durationUnits: 'inst',
      targetType: 'creature',
      targetCount: '1',
      targetSpecial: 'creatures in selected cipher area',
      rangeUnits: 'ft',
      rangeValue: '60',
      rangeSpecial: '',
      school: 'evo',
      properties: ['vocal', 'somatic', 'material'],
      materials: 'scripted elemental ink and a single-use trigger rune',
      identifier: 'lotm-mystery-pryer-elemental-cipher-scroll',
      activityId: 'pryerSeq6EleAct03',
      now: now + 6,
      existing: existingAbility3,
      sort: 1100302
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
