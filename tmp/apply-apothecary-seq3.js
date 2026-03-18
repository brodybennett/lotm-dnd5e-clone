const { ClassicLevel } = require('./node-tools/node_modules/classic-level');

const CORE_VERSION = '13.351';
const SYSTEM_ID = 'lotm';
const SYSTEM_VERSION = '5.2.6';
const MODIFIER = '0000000000000000';

const PATHWAY_KEY = '!items!lotmPathway00018';
const FOLDER_KEY = '!folders!y19Aib8B9WnjpCGl';
const PATHWAY_IDENTIFIER = 'lotm-apothecary';
const FOLDER_ID = 'y19Aib8B9WnjpCGl';

const LEGACY_A_KEY = '!items!lotmAbilityY5001';
const LEGACY_B_KEY = '!items!lotmAbilityY6001';

const ABILITY_1_KEY = '!items!lotmAbilityY3001';
const ABILITY_2_KEY = '!items!lotmAbilityY3002';
const ABILITY_3_KEY = '!items!lotmAbilityY3003';
const ABILITY_4_KEY = '!items!lotmAbilityY3004';

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
    const pathway = await getOptionalJson(pathwaysDb, PATHWAY_KEY);
    if (!pathway) throw new Error('Apothecary pathway (lotmPathway00018) not found.');

    pathway.system = pathway.system ?? {};
    pathway.system.description = pathway.system.description ?? { value: '', chat: '' };
    pathway.system.description.value =
      '<p><strong>Pathway Vector:</strong> serene moonlit alchemy through diagnosis, gentle stabilization, and quiet control of medicinal flora.</p>' +
      '<p><strong>Sequence 9 Package (Total Budget 2):</strong> Moonlit Distillation, Vital Herb Sight.</p>' +
      '<p><strong>Sequence 8 Package (Gain Budget +3):</strong> Beast Communion, Tranquil Menagerie, plus one legacy scope upgrade to Vital Herb Sight.</p>' +
      '<p><strong>Sequence 7 Package (Gain Budget +13):</strong> Wings of Darkness, Corrosive Claw, Abyss Shackles, plus two legacy upgrades (Vital Herb Sight and Beast Communion).</p>' +
      '<p><strong>Sequence 6 Package (Gain Budget +9):</strong> Discerning Spiritual Materials, Potion and Perfume Crafting, Crimson Pulse Reading, plus two legacy upgrades (Moonlit Distillation and Beast Communion).</p>' +
      '<p><strong>Sequence 5 Package (Gain Budget +13):</strong> Full Moon, Moonlight Transformation, Flash, plus two legacy upgrades (Wings of Darkness and Beast Communion).</p>' +
      '<p><strong>Sequence 4 Package (Gain Budget +33):</strong> Spirituality Manipulation, Moon Paper Figurine, Gaze of Darkness, Bat Swarm Transformation, plus two legacy upgrades (Abyss Shackles and Potion and Perfume Crafting).</p>' +
      '<p><strong>Sequence 3 Package (Gain Budget +20):</strong> Door of Summoning, Contract of the Crimson Court, Bat Wing Isolation, Crimson Full Moon Rite, plus two legacy upgrades (Full Moon and Discerning Spiritual Materials).</p>' +
      '<p><strong>Sequence 2-0 Status:</strong> Pending authoring in later sequence-focused runs.</p>' +
      '<p><strong>Continuity Anchor:</strong> At Sequence 3 (High Summoner), moon-apothecary ritual craft advances into stable spirit-gate command: summoned entities, contract law, and isolation fields are handled with calm cadence rather than frenzy.</p>';
    pathway._stats = buildStats(now, pathway._stats);
    await pathwaysDb.put(PATHWAY_KEY, JSON.stringify(pathway));

    const folder = await getOptionalJson(abilitiesDb, FOLDER_KEY);
    if (!folder) throw new Error('Apothecary folder (y19Aib8B9WnjpCGl) not found.');

    folder.name = 'Apothecary';
    folder.description = 'Sequence abilities for the Apothecary pathway (authored through Sequence 3).';
    folder.flags = folder.flags ?? {};
    folder.flags.lotm = {
      ...(folder.flags.lotm ?? {}),
      pathwayIdentifier: PATHWAY_IDENTIFIER,
      latestAuthoredSequence: 3
    };
    folder._stats = buildStats(now + 1, folder._stats);
    await abilitiesDb.put(FOLDER_KEY, JSON.stringify(folder));

    const legacyA = await getOptionalJson(abilitiesDb, LEGACY_A_KEY);
    const legacyB = await getOptionalJson(abilitiesDb, LEGACY_B_KEY);
    if (!legacyA) throw new Error('Legacy target lotmAbilityY5001 not found.');
    if (!legacyB) throw new Error('Legacy target lotmAbilityY6001 not found.');

    const legacyAHeader = '<h3>Legacy Upgrade (Sequence 3 - Scope)</h3>';
    const legacyAText =
      '<p>At Sequence 3, <strong>Full Moon</strong> can host summoned entities from Door of Summoning. ' +
      'When you cast Door of Summoning and its summon enters your Full Moon zone, choose one rider until the start of your next turn: ' +
      '<strong>Moon Shelter</strong> (summon gains resistance to one of necrotic, poison, or psychic) or ' +
      '<strong>Moon Pursuit</strong> (summon movement increases by 10 feet and its first successful hit each round adds damage equal to <strong>Potency</strong>). ' +
      'If Full Moon was cast with at least <strong>+2 Spirituality</strong>, one additional summon in the zone can receive the same rider.</p>';
    const legacyADesc = String(legacyA.system?.description?.value ?? '');
    if (!legacyADesc.includes(legacyAHeader)) {
      legacyA.system.description.value = `${legacyADesc}${legacyAHeader}${legacyAText}`;
    }
    legacyA._stats = buildStats(now + 2, legacyA._stats);
    await abilitiesDb.put(LEGACY_A_KEY, JSON.stringify(legacyA));

    const legacyBHeader = '<h3>Legacy Upgrade (Sequence 3 - Efficiency)</h3>';
    const legacyBText =
      '<p>At Sequence 3, <strong>Discerning Spiritual Materials</strong> can pre-index spirit gate reagents. ' +
      'When you successfully analyze summoning media (blood, bone ash, spirit herb, moonwater, or contract ink), mark one target reagent bundle for 8 hours. ' +
      'The first time you cast Door of Summoning or Contract of the Crimson Court using that bundle, reduce the first upcast surcharge by <strong>1</strong> (minimum 0) and add <strong>+Potency</strong> to one contested command check for that cast. ' +
      'Once per short rest, this rebate can apply to both abilities in the same round if both consume marked media.</p>';
    const legacyBDesc = String(legacyB.system?.description?.value ?? '');
    if (!legacyBDesc.includes(legacyBHeader)) {
      legacyB.system.description.value = `${legacyBDesc}${legacyBHeader}${legacyBText}`;
    }
    legacyB._stats = buildStats(now + 3, legacyB._stats);
    await abilitiesDb.put(LEGACY_B_KEY, JSON.stringify(legacyB));

    const ability1Existing = await getOptionalJson(abilitiesDb, ABILITY_1_KEY);
    const ability2Existing = await getOptionalJson(abilitiesDb, ABILITY_2_KEY);
    const ability3Existing = await getOptionalJson(abilitiesDb, ABILITY_3_KEY);
    const ability4Existing = await getOptionalJson(abilitiesDb, ABILITY_4_KEY);

    const ability1 = buildAbilityDoc({
      id: 'lotmAbilityY3001',
      name: 'Door of Summoning',
      description:
        '<p><strong>Baseline (2 Spirituality):</strong> Action. Open a calm moon gate at a point within 90 feet for 10 minutes (concentration). Summon one contracted spirit, beast, or shadow servant (GM stat baseline around your sequence band). It appears in an unoccupied space adjacent to the gate, acts on your initiative, and obeys one command each round. If not commanded, it takes Dodge and remains within 20 feet of the gate.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> summon one additional lesser servant, or extend gate range to 150 feet.</li><li><strong>+2 Spirituality:</strong> summoned entities gain temporary HP equal to <strong>Potency</strong> and add <strong>+Potency</strong> to one attack or utility check each round.</li><li><strong>+4 Spirituality:</strong> maintain two linked gates at once. Once per round, you may swap positions with one summon standing within 5 feet of either gate.</li></ul><p><em>Counterplay:</em> anti-summoning circles, forced concentration breaks, and severed line of command can collapse the gate.</p><p><em>Corruption Hook:</em> if you repeatedly bind unwilling sentient remnants as disposable tools, gain 1 Corruption.</p>',
      img: 'icons/magic/symbols/ring-circle-smoke-blue.webp',
      activationType: 'action',
      durationValue: '10',
      durationUnits: 'minute',
      targetType: 'space',
      targetCount: '1',
      targetSpecial: 'moon gate point for summoned entry',
      rangeUnits: 'ft',
      rangeValue: '90',
      rangeSpecial: '',
      school: 'con',
      properties: ['vocal', 'somatic', 'material', 'concentration'],
      materials: 'bone ash mixed with moonwater and a signed name-strip',
      identifier: 'lotm-apothecary-door-of-summoning',
      activityId: 'apothSeq3SummAct01',
      now: now + 4,
      existing: ability1Existing,
      sort: 1800600
    });

    const ability2 = buildAbilityDoc({
      id: 'lotmAbilityY3002',
      name: 'Contract of the Crimson Court',
      description:
        '<p><strong>Baseline (1 Spirituality):</strong> Bonus action. Seal a crimson moon contract with one summon you control within 60 feet for 10 minutes. While sealed, the summon gains advantage on one save each round and may relay sensory impressions (sight, scent, pulse rhythm) to you in real time. Once per round, when the summon succeeds on an attack or utility action, you may reposition one ally within 30 feet by 10 feet without provoking opportunity attacks.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> seal one additional summon or extend range to 120 feet.</li><li><strong>+2 Spirituality:</strong> contract grants one of your choices: the summon deals extra damage equal to <strong>Potency</strong> once per round, or it can impose disadvantage on one target save once per round.</li><li><strong>+4 Spirituality:</strong> if a contracted summon would be dismissed or destroyed, keep it stable at 1 HP for one additional round and immediately recover 1 spent Spirituality (once per cast).</li></ul><p><em>Counterplay:</em> contract-disruption sigils, silence at critical command timing, and charm break effects can void the relay.</p><p><em>Corruption Hook:</em> if you trap friendly spirits in contracts beyond agreed terms, gain 1 Corruption.</p>',
      img: 'icons/sundries/documents/document-sealed-red-tan.webp',
      activationType: 'bonus',
      durationValue: '10',
      durationUnits: 'minute',
      targetType: 'creature',
      targetCount: '1',
      targetSpecial: 'summoned entity you control',
      rangeUnits: 'ft',
      rangeValue: '60',
      rangeSpecial: '',
      school: 'enc',
      properties: ['vocal', 'somatic', 'material'],
      materials: 'red contract ink and a moon-silver stylus',
      identifier: 'lotm-apothecary-contract-of-the-crimson-court',
      activityId: 'apothSeq3ContractAct02',
      now: now + 5,
      existing: ability2Existing,
      sort: 1800601
    });

    const ability3 = buildAbilityDoc({
      id: 'lotmAbilityY3003',
      name: 'Bat Wing Isolation',
      description:
        '<p><strong>Baseline (1 Spirituality):</strong> Action. Spread a layered bat-wing darkness in a 20-foot radius centered on a point within 90 feet for 1 minute (concentration). Creatures of your choice in the zone have muffled voice range (reduced to 10 feet), and hostile creatures treat the area as difficult terrain. The first time each round a hostile creature starts its turn in the zone, it must pass a Wisdom save or lose reactions until end of turn.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> radius becomes 30 feet, or create one additional 10-foot satellite pocket within 20 feet of the main zone.</li><li><strong>+2 Spirituality:</strong> creatures that fail the save are also unable to benefit from advantage granted by allies until the start of their next turn.</li><li><strong>+4 Spirituality:</strong> once during duration, fold the zone inward for one round; hostile creatures inside make a Constitution save or become <strong>restrained</strong> until end of their next turn.</li></ul><p><em>Counterplay:</em> wind dispersal effects, anti-darkness wards, and forced movement out of the zone can blunt isolation pressure.</p><p><em>Corruption Hook:</em> if you isolate non-combatants to induce panic for experimentation, gain 1 Corruption.</p>',
      img: 'icons/magic/perception/shadow-stealth-eyes-purple.webp',
      activationType: 'action',
      durationValue: '1',
      durationUnits: 'minute',
      targetType: 'space',
      targetCount: '1',
      targetSpecial: 'bat-wing isolation zone',
      rangeUnits: 'ft',
      rangeValue: '90',
      rangeSpecial: '',
      school: 'ill',
      properties: ['vocal', 'somatic', 'concentration'],
      materials: 'a preserved bat wing dusted with moonflower powder',
      identifier: 'lotm-apothecary-bat-wing-isolation',
      activityId: 'apothSeq3IsolationAct03',
      now: now + 6,
      existing: ability3Existing,
      sort: 1800602
    });

    const ability4 = buildAbilityDoc({
      id: 'lotmAbilityY3004',
      name: 'Crimson Full Moon Rite',
      description:
        '<p><strong>Baseline (2 Spirituality):</strong> Action. Raise a crimson full-moon district in a 30-foot radius within 120 feet for 1 minute (concentration). Choose up to <strong>Potency</strong> allies when cast and at start of each of your turns; chosen allies gain temporary HP equal to <strong>Potency</strong> and advantage on saves against fear, charm, poison, and disease until start of your next turn. Hostile creatures that start in the district make a Wisdom save; on failure they take psychic damage equal to <strong>Potency</strong> and cannot take opportunity attacks until end of turn.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> radius becomes 40 feet, or include one additional ally each round in the chosen ally count.</li><li><strong>+2 Spirituality:</strong> one summoned entity in the district each round gains resistance to all damage except radiant until start of your next turn.</li><li><strong>+4 Spirituality:</strong> duration becomes 10 minutes. Once per round, when an ally in district fails a save, you may allow an immediate reroll with <strong>+Potency</strong>.</li></ul><p><em>Counterplay:</em> radiant flood, domain suppression effects, and concentration disruption can end the rite.</p><p><em>Corruption Hook:</em> if you enforce blood-price offerings to maintain the rite outside emergencies, gain 1 Corruption.</p>',
      img: 'icons/magic/light/orbs-firefly-hand-yellow.webp',
      activationType: 'action',
      durationValue: '1',
      durationUnits: 'minute',
      targetType: 'space',
      targetCount: '1',
      targetSpecial: 'crimson full-moon district',
      rangeUnits: 'ft',
      rangeValue: '120',
      rangeSpecial: '',
      school: 'abj',
      properties: ['vocal', 'somatic', 'material', 'concentration'],
      materials: 'a silvered bowl containing one drop of preserved blood',
      identifier: 'lotm-apothecary-crimson-full-moon-rite',
      activityId: 'apothSeq3RiteAct04',
      now: now + 7,
      existing: ability4Existing,
      sort: 1800603
    });

    await abilitiesDb.put(ABILITY_1_KEY, JSON.stringify(ability1));
    await abilitiesDb.put(ABILITY_2_KEY, JSON.stringify(ability2));
    await abilitiesDb.put(ABILITY_3_KEY, JSON.stringify(ability3));
    await abilitiesDb.put(ABILITY_4_KEY, JSON.stringify(ability4));

    const verifyPathway = await getOptionalJson(pathwaysDb, PATHWAY_KEY);
    const verifyFolder = await getOptionalJson(abilitiesDb, FOLDER_KEY);
    const verifyLegacyA = await getOptionalJson(abilitiesDb, LEGACY_A_KEY);
    const verifyLegacyB = await getOptionalJson(abilitiesDb, LEGACY_B_KEY);
    const verifyAbility1 = await getOptionalJson(abilitiesDb, ABILITY_1_KEY);
    const verifyAbility2 = await getOptionalJson(abilitiesDb, ABILITY_2_KEY);
    const verifyAbility3 = await getOptionalJson(abilitiesDb, ABILITY_3_KEY);
    const verifyAbility4 = await getOptionalJson(abilitiesDb, ABILITY_4_KEY);

    console.log(
      JSON.stringify(
        {
          pathwayKey: PATHWAY_KEY,
          pathwayId: verifyPathway?._id,
          pathwayIdentifier: verifyPathway?.system?.identifier,
          folderKey: FOLDER_KEY,
          folderId: verifyFolder?._id,
          folderName: verifyFolder?.name,
          legacyUpdated: [
            {
              key: LEGACY_A_KEY,
              id: verifyLegacyA?._id,
              name: verifyLegacyA?.name,
              hasLegacyHeader: String(verifyLegacyA?.system?.description?.value ?? '').includes(
                legacyAHeader
              ),
              grantedSequence: verifyLegacyA?.flags?.lotm?.grantedSequence,
              level: verifyLegacyA?.system?.level
            },
            {
              key: LEGACY_B_KEY,
              id: verifyLegacyB?._id,
              name: verifyLegacyB?.name,
              hasLegacyHeader: String(verifyLegacyB?.system?.description?.value ?? '').includes(
                legacyBHeader
              ),
              grantedSequence: verifyLegacyB?.flags?.lotm?.grantedSequence,
              level: verifyLegacyB?.system?.level
            }
          ],
          abilityKeys: [ABILITY_1_KEY, ABILITY_2_KEY, ABILITY_3_KEY, ABILITY_4_KEY],
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
