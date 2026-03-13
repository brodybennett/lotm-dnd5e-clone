const { ClassicLevel } = require('./node-tools/node_modules/classic-level');

const CORE_VERSION = '13.351';
const SYSTEM_ID = 'lotm';
const SYSTEM_VERSION = '5.2.6';
const MODIFIER = '0000000000000000';

const PATHWAY_IDENTIFIER = 'lotm-mystery-pryer';
const DEFAULT_PATHWAY_ID = 'lotmPathway00014';
const FOLDER_ID = 'GEb0Z39c7pW51DAO';
const LEGACY_ABILITY_ID = 'lotmAbilityP9001';
const ABILITY_1_ID = 'lotmAbilityP8001';
const ABILITY_2_ID = 'lotmAbilityP8002';

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
    if (doc?.system?.identifier === identifier) return { key, doc };
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
      level: 1,
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
        grantedSequence: 8
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
    if (!pathway) {
      throw new Error(`Mystery Pryer pathway (${pathwayKey}) not found. Author Sequence 9 first.`);
    }

    pathway.system = pathway.system ?? {};
    pathway.system.description = pathway.system.description ?? { value: '', chat: '' };
    pathway.system.description.value =
      '<p><strong>Pathway Vector:</strong> inquisitive occult scholarship through spirit sight, structured divination, and careful ritual inquiry that rewards layered interpretation over blunt certainty.</p>' +
      '<p><strong>Sequence 9 Package (Total Budget 2):</strong> Eyes of Mystery Prying, Quick Rituals.</p>' +
      '<p><strong>Sequence 8 Package (Gain Budget +3):</strong> Spirit World Entry, Arcane Marginalia, plus one legacy scope upgrade to Eyes of Mystery Prying.</p>' +
      '<p><strong>Sequence 7-0 Status:</strong> Pending authoring in later sequence-focused runs.</p>' +
      '<p><strong>Continuity Anchor:</strong> At Sequence 8 (Melee Scholar), Mystery Pryer transitions from isolated clues to comparative occult synthesis by stepping into Spirit World context and annotating layered meaning in real time.</p>';
    pathway._stats = buildStats(now, pathway._stats);
    await pathwaysDb.put(pathwayKey, JSON.stringify(pathway));

    const folderKey = `!folders!${FOLDER_ID}`;
    const folder = await getOptionalJson(abilitiesDb, folderKey);
    if (!folder) throw new Error(`Mystery Pryer folder (${FOLDER_ID}) not found.`);

    folder.description = 'Sequence abilities for the Mystery Pryer pathway (authored through Sequence 8).';
    folder.flags = folder.flags ?? {};
    folder.flags.lotm = {
      ...(folder.flags.lotm ?? {}),
      pathwayIdentifier: PATHWAY_IDENTIFIER,
      latestAuthoredSequence: 8
    };
    folder._stats = buildStats(now + 1, folder._stats);
    await abilitiesDb.put(folderKey, JSON.stringify(folder));

    const legacyKey = `!items!${LEGACY_ABILITY_ID}`;
    const legacyAbility = await getOptionalJson(abilitiesDb, legacyKey);
    if (!legacyAbility) {
      throw new Error(`Legacy target ${LEGACY_ABILITY_ID} not found. Sequence 9 package is required first.`);
    }

    const legacyHeader = '<h3>Legacy Upgrade (Sequence 8 - Scope)</h3>';
    const legacyText =
      '<p>At Sequence 8, Eyes of Mystery Prying can branch a second line of inquiry. ' +
      'When you cast it with at least <strong>+1 Spirituality</strong>, you may include one additional target (creature, object, or sigil) within 30 feet of the first. ' +
      'Ask one probing question for each included target and gain your follow-up advantage against either target before the end of your next turn. ' +
      'This split inquiry can be used once per short rest without paying the +1 surcharge.</p>';
    const legacyDescription = String(legacyAbility.system?.description?.value ?? '');
    if (!legacyDescription.includes(legacyHeader)) {
      legacyAbility.system.description.value = `${legacyDescription}${legacyHeader}${legacyText}`;
    }
    legacyAbility._stats = buildStats(now + 2, legacyAbility._stats);
    await abilitiesDb.put(legacyKey, JSON.stringify(legacyAbility));

    const existingAbility1 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_1_ID}`);
    const existingAbility2 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_2_ID}`);

    const ability1 = buildAbilityDoc({
      id: ABILITY_1_ID,
      name: 'Spirit World Entry',
      description:
        '<p><strong>Baseline (0 Spirituality):</strong> Action. For 1 minute, your body and spirit partially overlap. You perceive invisible creatures, spirit-world entities, and occult traces within 30 feet, and you gain advantage on checks to identify or track those phenomena. Once per turn, when a perceived spirit-world creature forces you to make a save, reduce the DC by 1 (minimum 10).</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Perception radius becomes 60 feet, and you may grant one ally within 30 feet the same perception for 1 round.</li><li><strong>+2 Spirituality:</strong> Choose one creature you can perceive; it must succeed on a Wisdom save or lose benefits from invisibility and spirit concealment until the end of your next turn.</li><li><strong>+4 Spirituality:</strong> For this casting, once per round when you succeed on an Arcana, Investigation, or Insight check related to a spirit-world phenomenon, gain temporary hit points equal to <strong>Potency</strong> and move up to 10 feet without provoking opportunity attacks.</li></ul><p><em>Counterplay:</em> consecrated anti-spirit barriers, visual overload, and rapid line-of-sight breaks can deny meaningful reads.</p><p><em>Corruption Hook:</em> if you remain overlapped with hostile spirit echoes longer than necessary to extract power, gain 1 Corruption after the scene.</p>',
      img: 'icons/magic/perception/eye-ringed-glow-angry-small-teal.webp',
      activationType: 'action',
      durationValue: '1',
      durationUnits: 'minute',
      targetType: 'self',
      targetCount: '1',
      targetSpecial: '',
      rangeUnits: 'self',
      rangeValue: null,
      rangeSpecial: '',
      school: 'div',
      properties: ['vocal', 'somatic'],
      materials: 'a charcoal glyph of a half-open eye traced on skin',
      identifier: 'lotm-mystery-pryer-spirit-world-entry',
      activityId: 'pryerSeq8EntAct01',
      now: now + 3,
      existing: existingAbility1,
      sort: 1100100
    });

    const ability2 = buildAbilityDoc({
      id: ABILITY_2_ID,
      name: 'Arcane Marginalia',
      description:
        '<p><strong>Baseline (0 Spirituality):</strong> Bonus action. Annotate one creature, object, written passage, or active ritual you can see within 60 feet with an occult margin-note that lasts 1 minute. Ask one probing question about contradictions, intent, or hidden structure; the GM provides one concise clue. Then choose one rider:</p><ul><li><strong>Expose Flaw:</strong> the annotated target cannot gain advantage on its next roll before your next turn.</li><li><strong>Guided Reading:</strong> one ally who can hear you gains <strong>+1</strong> to their next check or save involving that target before your next turn.</li></ul><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Apply both riders instead of one, or annotate one additional target within 30 feet of the first.</li><li><strong>+2 Spirituality:</strong> Duration becomes 10 minutes, and Guided Reading bonus becomes <strong>+Potency</strong>.</li><li><strong>+4 Spirituality:</strong> Once during the duration, when an annotated target attempts deception, concealment, or a ritual cast, you may force an Intelligence save; on failure, its attempt is exposed and it takes psychic damage equal to <strong>Potency</strong>.</li></ul><p><em>Counterplay:</em> false symbology, anti-divination script, and intentional information noise can blur annotation quality.</p><p><em>Corruption Hook:</em> if you weaponize annotations to erase inconvenient truths rather than uncover them, gain 1 Corruption.</p>',
      img: 'icons/sundries/documents/document-symbol-circle-magenta.webp',
      activationType: 'bonus',
      durationValue: '1',
      durationUnits: 'minute',
      targetType: 'creature',
      targetCount: '1',
      targetSpecial: 'creature, object, text, or ongoing ritual under analysis',
      rangeUnits: 'ft',
      rangeValue: '60',
      rangeSpecial: '',
      school: 'div',
      properties: ['vocal', 'somatic', 'material'],
      materials: 'a marked notebook page or floating sigil-stroke of ink',
      identifier: 'lotm-mystery-pryer-arcane-marginalia',
      activityId: 'pryerSeq8MarAct02',
      now: now + 4,
      existing: existingAbility2,
      sort: 1100101
    });

    await abilitiesDb.put(`!items!${ABILITY_1_ID}`, JSON.stringify(ability1));
    await abilitiesDb.put(`!items!${ABILITY_2_ID}`, JSON.stringify(ability2));

    const verifyPathway = await getOptionalJson(pathwaysDb, pathwayKey);
    const verifyFolder = await getOptionalJson(abilitiesDb, folderKey);
    const verifyLegacy = await getOptionalJson(abilitiesDb, legacyKey);
    const verifyAbility1 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_1_ID}`);
    const verifyAbility2 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_2_ID}`);

    const legacyApplied = String(verifyLegacy?.system?.description?.value ?? '').includes(legacyHeader);

    console.log(
      JSON.stringify(
        {
          pathwayKey,
          pathwayId: verifyPathway?._id,
          pathwayIdentifier: verifyPathway?.system?.identifier,
          folderKey,
          folderId: verifyFolder?._id,
          folderFlags: verifyFolder?.flags?.lotm,
          legacyKey,
          legacyApplied,
          abilityKeys: [`!items!${ABILITY_1_ID}`, `!items!${ABILITY_2_ID}`],
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
