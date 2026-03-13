const { ClassicLevel } = require('./node-tools/node_modules/classic-level');

const CORE_VERSION = '13.351';
const SYSTEM_ID = 'lotm';
const SYSTEM_VERSION = '5.2.6';
const MODIFIER = '0000000000000000';

const PATHWAY_IDENTIFIER = 'lotm-mystery-pryer';
const DEFAULT_PATHWAY_ID = 'lotmPathway00014';
const FOLDER_ID = 'GEb0Z39c7pW51DAO';

const LEGACY_A_ID = 'lotmAbilityP6003';
const LEGACY_B_ID = 'lotmAbilityP7003';

const ABILITY_1_ID = 'lotmAbilityP4001';
const ABILITY_2_ID = 'lotmAbilityP4002';
const ABILITY_3_ID = 'lotmAbilityP4003';
const ABILITY_4_ID = 'lotmAbilityP4004';

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
      level: 5,
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
        grantedSequence: 4
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
      '<p><strong>Sequence 3-0 Status:</strong> Pending authoring in later sequence-focused runs.</p>' +
      '<p><strong>Continuity Anchor:</strong> At Sequence 4 (Mysticologist), Mystery Pryer becomes a demigod-scale occult narrative engine: hidden knowledge can be reenacted as spell-logic, prying eyes can be externalized, and stellar domain control can lock space and thought.</p>';
    pathway._stats = buildStats(now, pathway._stats);
    await pathwaysDb.put(pathwayKey, JSON.stringify(pathway));

    const folderKey = `!folders!${FOLDER_ID}`;
    const folder = await getOptionalJson(abilitiesDb, folderKey);
    if (!folder) throw new Error(`Mystery Pryer folder (${FOLDER_ID}) not found.`);

    folder.description = 'Sequence abilities for the Mystery Pryer pathway (authored through Sequence 4).';
    folder.flags = folder.flags ?? {};
    folder.flags.lotm = {
      ...(folder.flags.lotm ?? {}),
      pathwayIdentifier: PATHWAY_IDENTIFIER,
      latestAuthoredSequence: 4
    };
    folder._stats = buildStats(now + 1, folder._stats);
    await abilitiesDb.put(folderKey, JSON.stringify(folder));

    const legacyAKey = `!items!${LEGACY_A_ID}`;
    const legacyBKey = `!items!${LEGACY_B_ID}`;
    const legacyA = await getOptionalJson(abilitiesDb, legacyAKey);
    const legacyB = await getOptionalJson(abilitiesDb, legacyBKey);
    if (!legacyA) throw new Error(`Legacy target ${LEGACY_A_ID} not found.`);
    if (!legacyB) throw new Error(`Legacy target ${LEGACY_B_ID} not found.`);

    const legacyAHeader = '<h3>Legacy Upgrade (Sequence 4 - Scope)</h3>';
    const legacyAText =
      '<p>At Sequence 4, Elemental Cipher Scroll can encode constellation overlays. ' +
      'When you cast it with at least <strong>+2 Spirituality</strong>, choose one additional adjacent 10-foot zone and apply the same elemental mode there. ' +
      'If you use the +4 dual-mode option, each zone may receive a different mode. ' +
      'A creature can only be affected by one zone per cast unless you spend +4 Spirituality.</p>';
    const legacyADescription = String(legacyA.system?.description?.value ?? '');
    if (!legacyADescription.includes(legacyAHeader)) {
      legacyA.system.description.value = `${legacyADescription}${legacyAHeader}${legacyAText}`;
    }
    legacyA._stats = buildStats(now + 2, legacyA._stats);
    await abilitiesDb.put(legacyAKey, JSON.stringify(legacyA));

    const legacyBHeader = '<h3>Legacy Upgrade (Sequence 4 - Potency)</h3>';
    const legacyBText =
      '<p>At Sequence 4, Premonitory Footnote gains higher-order warning resolution. ' +
      'When an affected target uses the baseline or upcast defensive rider, increase the AC/save bonus by <strong>+Potency</strong> for that trigger once per round. ' +
      'If the +4 reroll effect is used, the attacker also suffers psychic damage equal to Potency on a failed Wisdom save.</p>';
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
      name: 'Mystical Re-enactment',
      description:
        '<p><strong>Baseline (2 Spirituality):</strong> Action. Re-enact one known mystical event, fairy tale, or occult narrative through a chosen script axis at a point within 60 feet. Pick one axis:</p><ul><li><strong>Destruction Script:</strong> one creature makes an Intelligence save; on failure it takes psychic damage equal to <strong>+Potency</strong> and cannot gain advantage before your next turn.</li><li><strong>Concealment Script:</strong> create a 15-foot zone of warped narrative for 1 round; checks to perceive creatures inside are at disadvantage.</li><li><strong>Guidance Script:</strong> up to two allies gain <strong>+Potency</strong> on one check/save each before end of next turn.</li></ul><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Resolve one additional script axis from the list.</li><li><strong>+2 Spirituality:</strong> Increase range to 120 feet and zone radius to 20 feet, or affect one additional target for destruction/guidance.</li><li><strong>+4 Spirituality:</strong> For one script axis, treat exclusivity as high-tier: double Potency contribution and ignore one minor immunity/mitigation clause (GM adjudication). After use, make a Wisdom save; on failure gain 1 Corruption.</li></ul><p><em>Counterplay:</em> anti-ritual interruption, knowledge denial, and narrative anchor disruption reduce reenactment quality.</p><p><em>Corruption Hook:</em> forcing forbidden reenactments without restraint risks backlash and immediate corruption pressure.</p>',
      img: 'icons/magic/symbols/runes-star-pentagon-magenta.webp',
      activationType: 'action',
      durationValue: '1',
      durationUnits: 'round',
      targetType: 'creature',
      targetCount: '1',
      targetSpecial: 'creature, zone, or allied recipients based on chosen script axis',
      rangeUnits: 'ft',
      rangeValue: '60',
      rangeSpecial: '',
      school: 'div',
      properties: ['vocal', 'somatic', 'material'],
      materials: 'a fragment of written lore, sigil powder, and a focused narrative keyword',
      identifier: 'lotm-mystery-pryer-mystical-re-enactment',
      activityId: 'pryerSeq4ReeAct01',
      now: now + 4,
      existing: existingAbility1,
      sort: 1100500
    });

    const ability2 = buildAbilityDoc({
      id: ABILITY_2_ID,
      name: 'Planted Prying Eye',
      description:
        '<p><strong>Baseline (1 Spirituality):</strong> Bonus action. Plant an invisible prying eye on one creature or object within 90 feet for 10 minutes (Wisdom save negates on unwilling creature). While active, you can perceive through that eye as a free action once per round and gain advantage on checks to detect concealment, illusion overlays, and hidden ritual traces near the marked target.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Plant one additional eye (different target), or extend duration to 1 hour.</li><li><strong>+2 Spirituality:</strong> Planted eyes can relay status pings (hostile intent, sudden movement, or active casting) to you regardless of ordinary line of sight on the same plane.</li><li><strong>+4 Spirituality:</strong> Once during duration, detonate one planted eye as a reveal pulse: creatures within 15 feet of the eye must make an Intelligence save or lose invisibility/concealment benefits until the end of your next turn.</li></ul><p><em>Counterplay:</em> anti-divination fields, identity-scrambling rituals, and planar isolation can suppress or sever planted-eye feeds.</p><p><em>Corruption Hook:</em> pervasive voyeuristic use without cause accrues corruption and social fallout.</p>',
      img: 'icons/magic/perception/eye-ringed-teal.webp',
      activationType: 'bonus',
      durationValue: '10',
      durationUnits: 'minute',
      targetType: 'creature',
      targetCount: '1',
      targetSpecial: 'creature or object receiving concealed prying eye mark',
      rangeUnits: 'ft',
      rangeValue: '90',
      rangeSpecial: '',
      school: 'div',
      properties: ['vocal', 'somatic'],
      materials: 'none',
      identifier: 'lotm-mystery-pryer-planted-prying-eye',
      activityId: 'pryerSeq4EyeAct02',
      now: now + 5,
      existing: existingAbility2,
      sort: 1100501
    });

    const ability3 = buildAbilityDoc({
      id: ABILITY_3_ID,
      name: 'Star Pillar',
      description:
        '<p><strong>Baseline (2 Spirituality):</strong> Action. Raise a 20-foot radius star pillar centered on a point within 90 feet for 1 minute. Creatures in the pillar cannot teleport, phase, or be relocated by non-artifact magical movement unless they pass a Charisma save when attempting it. The pillar is lightly obscuring to enemies and grants allies inside <strong>+1</strong> to saves against forced movement.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Increase radius to 30 feet.</li><li><strong>+2 Spirituality:</strong> Enemies that start their turn in the pillar must pass a Dexterity save or have speed reduced by 15 feet until turn end.</li><li><strong>+4 Spirituality:</strong> Create a second 15-foot pillar within 60 feet of the first; once per round, one ally can shift from one pillar to the other as 15 feet of movement.</li></ul><p><em>Counterplay:</em> overwhelming anti-magic force, destruction of geometric anchors, or stronger authority-level movement can contest the pillar.</p><p><em>Corruption Hook:</em> if used to trap innocents for prolonged suffering, gain 1 Corruption.</p>',
      img: 'icons/magic/space/constellation-column-stars.webp',
      activationType: 'action',
      durationValue: '1',
      durationUnits: 'minute',
      targetType: 'space',
      targetCount: '1',
      targetSpecial: 'area under stellar lock geometry',
      rangeUnits: 'ft',
      rangeValue: '90',
      rangeSpecial: '',
      school: 'abj',
      properties: ['vocal', 'somatic', 'material'],
      materials: 'a polished star chart plate or etched metallic compass ring',
      identifier: 'lotm-mystery-pryer-star-pillar',
      activityId: 'pryerSeq4PilAct03',
      now: now + 6,
      existing: existingAbility3,
      sort: 1100502
    });

    const ability4 = buildAbilityDoc({
      id: ABILITY_4_ID,
      name: 'Knowledge Storm Form',
      description:
        '<p><strong>Baseline (1 Spirituality):</strong> Action. Manifest a brief incomplete mythical form surge for 1 round. Choose up to two creatures within 30 feet; each makes an Intelligence save. On failure, the target takes psychic damage equal to <strong>+Potency</strong> and has disadvantage on its next attack or save DC check before end of next turn.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Affect one additional creature in range.</li><li><strong>+2 Spirituality:</strong> Duration becomes 1 minute; once per round you can retarget one affected creature (new save).</li><li><strong>+4 Spirituality:</strong> On failed save, target is overloaded with conflicting knowledge and cannot take reactions until start of its next turn; if already affected by Planted Prying Eye or Mystical Re-enactment this round, add extra psychic damage equal to Potency.</li></ul><p><em>Counterplay:</em> mind warding, dampened cognition states, and anti-psychic barriers reduce storm effectiveness.</p><p><em>Corruption Hook:</em> frequent overextension of this form risks mental fracture and accelerated corruption.</p>',
      img: 'icons/magic/control/debuff-energy-hold-levitate-blue.webp',
      activationType: 'action',
      durationValue: '1',
      durationUnits: 'round',
      targetType: 'creature',
      targetCount: '2',
      targetSpecial: 'creatures struck by knowledge overload surge',
      rangeUnits: 'ft',
      rangeValue: '30',
      rangeSpecial: '',
      school: 'enc',
      properties: ['vocal', 'somatic'],
      materials: 'none',
      identifier: 'lotm-mystery-pryer-knowledge-storm-form',
      activityId: 'pryerSeq4StoAct04',
      now: now + 7,
      existing: existingAbility4,
      sort: 1100503
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
