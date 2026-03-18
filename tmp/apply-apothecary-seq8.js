const { ClassicLevel } = require('./node-tools/node_modules/classic-level');

const CORE_VERSION = '13.351';
const SYSTEM_ID = 'lotm';
const SYSTEM_VERSION = '5.2.6';
const MODIFIER = '0000000000000000';

const PATHWAY_KEY = '!items!lotmPathway00018';
const FOLDER_KEY = '!folders!y19Aib8B9WnjpCGl';
const LEGACY_KEY = '!items!lotmAbilityY9002';
const ABILITY_1_KEY = '!items!lotmAbilityY8001';
const ABILITY_2_KEY = '!items!lotmAbilityY8002';
const PATHWAY_IDENTIFIER = 'lotm-apothecary';

function buildStats(now, existing = null) {
  const createdTime = existing?.createdTime ?? now;
  return {
    ...(existing ?? {}),
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
    folder: 'y19Aib8B9WnjpCGl',
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
    const pathway = await getOptionalJson(pathwaysDb, PATHWAY_KEY);
    if (!pathway) throw new Error('Apothecary pathway (lotmPathway00018) not found. Author Sequence 9 first.');

    pathway.system = pathway.system ?? {};
    pathway.system.description = pathway.system.description ?? { value: '', chat: '' };
    pathway.system.description.value =
      '<p><strong>Pathway Vector:</strong> serene moonlit alchemy through diagnosis, gentle stabilization, and quiet control of medicinal flora.</p>' +
      '<p><strong>Sequence 9 Package (Total Budget 2):</strong> Moonlit Distillation, Vital Herb Sight.</p>' +
      '<p><strong>Sequence 8 Package (Gain Budget +3):</strong> Beast Communion, Tranquil Menagerie, plus one legacy scope upgrade to Vital Herb Sight.</p>' +
      '<p><strong>Sequence 7-0 Status:</strong> Pending authoring in later sequence-focused runs.</p>' +
      '<p><strong>Continuity Anchor:</strong> At Sequence 8 (Beast Tamer), Apothecary broadens from bedside diagnosis into moon-guided animal rapport, turning beasts into calm scouts, assistants, and controllable vectors for treatment logistics.</p>';
    pathway._stats = buildStats(now, pathway._stats);
    await pathwaysDb.put(PATHWAY_KEY, JSON.stringify(pathway));

    const folder = await getOptionalJson(abilitiesDb, FOLDER_KEY);
    if (!folder) throw new Error('Apothecary folder (y19Aib8B9WnjpCGl) not found.');

    folder.name = 'Apothecary';
    folder.description = 'Sequence abilities for the Apothecary pathway (authored through Sequence 8).';
    folder.flags = folder.flags ?? {};
    folder.flags.lotm = {
      ...(folder.flags.lotm ?? {}),
      pathwayIdentifier: 'lotm-apothecary',
      latestAuthoredSequence: 8
    };
    folder._stats = buildStats(now + 1, folder._stats);
    await abilitiesDb.put(FOLDER_KEY, JSON.stringify(folder));

    const legacyAbility = await getOptionalJson(abilitiesDb, LEGACY_KEY);
    if (!legacyAbility) throw new Error('Legacy target lotmAbilityY9002 not found.');

    const legacyHeader = '<h3>Legacy Upgrade (Sequence 8 - Scope)</h3>';
    const legacyText =
      '<p>At Sequence 8, your diagnosis can ride through tamed lifeforms. ' +
      'When you use <strong>Vital Herb Sight</strong>, you may anchor the reading to one willing tamed beast within 60 feet. ' +
      'For the duration, you can perceive through that beast&apos;s mundane senses while keeping your own awareness, and the read may apply to one target within 10 feet of that beast even if outside your line of sight. ' +
      'If you spend at least <strong>+1 Spirituality</strong>, the anchored beast also gains advantage on one save against poison, fear, or charm before the effect ends.</p>';
    const existingLegacyDescription = String(legacyAbility.system?.description?.value ?? '');
    if (!existingLegacyDescription.includes(legacyHeader)) {
      legacyAbility.system.description.value = `${existingLegacyDescription}${legacyHeader}${legacyText}`;
    }
    legacyAbility._stats = buildStats(now + 2, legacyAbility._stats);
    await abilitiesDb.put(LEGACY_KEY, JSON.stringify(legacyAbility));

    const ability1Existing = await getOptionalJson(abilitiesDb, ABILITY_1_KEY);
    const ability2Existing = await getOptionalJson(abilitiesDb, ABILITY_2_KEY);

    const ability1 = buildAbilityDoc({
      id: 'lotmAbilityY8001',
      name: 'Beast Communion',
      description:
        '<p><strong>Baseline (1 Spirituality):</strong> Action. Choose one Beast within 60 feet that can see or hear you. It makes a Wisdom save. On a failed save (or if naturally friendly), establish a moon-calm bond for 10 minutes: you can communicate simple intent, sense its surface emotional state, and issue one short command per round (move, watch, carry, fetch, harry). The beast will not perform overtly suicidal acts.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Bond one additional Beast, or extend range to 120 feet.</li><li><strong>+2 Spirituality:</strong> During the bond, you may use your bonus action to perceive through one bonded beast&apos;s senses until the start of your next turn. While doing so, you and that beast gain <strong>+Potency</strong> on Perception checks.</li><li><strong>+4 Spirituality:</strong> Duration becomes 1 hour. Once each round, when a bonded beast hits a creature, you may force that creature to make a Wisdom save or suffer disadvantage on its next attack roll before the end of its next turn.</li></ul><p><em>Counterplay:</em> Mindless creatures, anti-charm effects, or overwhelming fear/pain can break command reliability.</p><p><em>Corruption Hook:</em> If you repeatedly inflict suffering on bonded beasts as disposable tools, gain 1 Corruption.</p>',
      img: 'icons/creatures/abilities/paw-print-pair-purple.webp',
      activationType: 'action',
      durationValue: '10',
      durationUnits: 'minute',
      targetType: 'creature',
      targetCount: '1',
      targetSpecial: 'Beast that can see or hear you',
      rangeUnits: 'ft',
      rangeValue: '60',
      rangeSpecial: '',
      school: 'enc',
      properties: ['vocal', 'somatic'],
      materials: 'a strip of treated leather marked with moon-ink',
      identifier: 'lotm-apothecary-beast-communion',
      activityId: 'apothSeq8BeastAct01',
      now: now + 3,
      existing: ability1Existing,
      sort: 1800100
    });

    const ability2 = buildAbilityDoc({
      id: 'lotmAbilityY8002',
      name: 'Tranquil Menagerie',
      description:
        '<p><strong>Baseline (0 Spirituality):</strong> Bonus action. Choose a 20-foot-radius area within 60 feet where at least one natural beast, tamed creature, or herbal specimen is present. For 1 minute, the area gains a soft lunar hush. Allies in the zone gain advantage on Medicine and Animal Handling checks, and hostile Beasts entering the area must make a Wisdom save or become unable to take reactions until the start of their next turn.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Radius becomes 30 feet, and you may exempt up to <strong>Potency</strong> hostile creatures from the hush trigger if you are covertly passing through.</li><li><strong>+2 Spirituality:</strong> When an ally in the zone uses an item, herb, or potion to restore HP or cure a condition, increase restored HP or save bonus by <strong>Potency</strong>.</li><li><strong>+4 Spirituality:</strong> Once per round, when a creature in the zone fails a save against poison, disease, fear, or charm, you may use your reaction to grant an immediate reroll with <strong>+Potency</strong>. On success, that creature gains temporary HP equal to <strong>Potency</strong>.</li></ul><p><em>Counterplay:</em> Silence fields, sudden loud trauma, barren environments, or anti-magic pressure can collapse the menagerie cadence.</p><p><em>Corruption Hook:</em> If you weaponize trust in your sanctuary to stage betrayal, gain 1 Corruption.</p>',
      img: 'icons/environment/settlement/garden-topiary.webp',
      activationType: 'bonus',
      durationValue: '1',
      durationUnits: 'minute',
      targetType: 'space',
      targetCount: '1',
      targetSpecial: 'localized moon-hush zone',
      rangeUnits: 'ft',
      rangeValue: '60',
      rangeSpecial: '',
      school: 'abj',
      properties: ['vocal', 'somatic', 'material'],
      materials: 'powdered moonflower and a drop of diluted animal blood',
      identifier: 'lotm-apothecary-tranquil-menagerie',
      activityId: 'apothSeq8ZoneAct02',
      now: now + 4,
      existing: ability2Existing,
      sort: 1800101
    });

    await abilitiesDb.put(ABILITY_1_KEY, JSON.stringify(ability1));
    await abilitiesDb.put(ABILITY_2_KEY, JSON.stringify(ability2));

    const verifyPathway = await getOptionalJson(pathwaysDb, PATHWAY_KEY);
    const verifyFolder = await getOptionalJson(abilitiesDb, FOLDER_KEY);
    const verifyLegacy = await getOptionalJson(abilitiesDb, LEGACY_KEY);
    const verifyAbility1 = await getOptionalJson(abilitiesDb, ABILITY_1_KEY);
    const verifyAbility2 = await getOptionalJson(abilitiesDb, ABILITY_2_KEY);

    console.log(
      JSON.stringify(
        {
          pathwayKey: PATHWAY_KEY,
          pathwayId: verifyPathway?._id,
          pathwayIdentifier: verifyPathway?.system?.identifier,
          folderKey: FOLDER_KEY,
          folderId: verifyFolder?._id,
          folderName: verifyFolder?.name,
          legacyUpdated: {
            key: LEGACY_KEY,
            id: verifyLegacy?._id,
            name: verifyLegacy?.name,
            hasLegacyHeader: String(verifyLegacy?.system?.description?.value ?? '').includes(
              legacyHeader
            ),
            grantedSequence: verifyLegacy?.flags?.lotm?.grantedSequence,
            level: verifyLegacy?.system?.level
          },
          abilityKeys: [ABILITY_1_KEY, ABILITY_2_KEY],
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
