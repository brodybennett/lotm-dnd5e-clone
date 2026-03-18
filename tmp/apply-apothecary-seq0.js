const { ClassicLevel } = require('./node-tools/node_modules/classic-level');

const CORE_VERSION = '13.351';
const SYSTEM_ID = 'lotm';
const SYSTEM_VERSION = '5.2.6';
const MODIFIER = '0000000000000000';

const PATHWAY_KEY = '!items!lotmPathway00018';
const FOLDER_KEY = '!folders!y19Aib8B9WnjpCGl';
const PATHWAY_IDENTIFIER = 'lotm-apothecary';
const FOLDER_ID = 'y19Aib8B9WnjpCGl';

const LEGACY_A_KEY = '!items!lotmAbilityY1004';
const LEGACY_B_KEY = '!items!lotmAbilityY2001';

const ABILITY_1_KEY = '!items!lotmAbilityY0001';
const ABILITY_2_KEY = '!items!lotmAbilityY0002';
const ABILITY_3_KEY = '!items!lotmAbilityY0003';
const ABILITY_4_KEY = '!items!lotmAbilityY0004';

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
      '<p><strong>Sequence 2 Package (Gain Budget +50):</strong> Creation Authority, Spirituality Tide Dominion, Moonlight Metamorphosis, Sovereign Summoning Gates, plus two legacy upgrades (Door of Summoning and Spirituality Manipulation).</p>' +
      '<p><strong>Sequence 1 Package (Gain Budget +74):</strong> Sublime Moon Visage, Living Miracle Atelier, Crimson Moon Sovereignty, Unrefused Summons, plus two legacy upgrades (Crimson Full Moon Rite and Sovereign Summoning Gates).</p>' +
      '<p><strong>Sequence 0 Package (Gain Budget +114):</strong> Blood Moon Companion, Origin of Fertility, Companion of All Life, Moon, plus two legacy upgrades (Unrefused Summons and Creation Authority).</p>' +
      '<p><strong>Sequence Track Status:</strong> Authored through Sequence 0 (complete standard progression).</p>' +
      '<p><strong>Continuity Anchor:</strong> At Sequence 0 (Moon), all previous moon-apothecary methods become symbolic law: blood moon cadence joins spirit and reality, life treatment becomes direct creation, and summons answer as companion-rhythm rather than coercive frenzy.</p>';
    pathway._stats = buildStats(now, pathway._stats);
    await pathwaysDb.put(PATHWAY_KEY, JSON.stringify(pathway));

    const folder = await getOptionalJson(abilitiesDb, FOLDER_KEY);
    if (!folder) throw new Error('Apothecary folder (y19Aib8B9WnjpCGl) not found.');

    folder.name = 'Apothecary';
    folder.description = 'Sequence abilities for the Apothecary pathway (authored through Sequence 0).';
    folder.flags = folder.flags ?? {};
    folder.flags.lotm = {
      ...(folder.flags.lotm ?? {}),
      pathwayIdentifier: PATHWAY_IDENTIFIER,
      latestAuthoredSequence: 0
    };
    folder._stats = buildStats(now + 1, folder._stats);
    await abilitiesDb.put(FOLDER_KEY, JSON.stringify(folder));

    const legacyA = await getOptionalJson(abilitiesDb, LEGACY_A_KEY);
    const legacyB = await getOptionalJson(abilitiesDb, LEGACY_B_KEY);
    if (!legacyA) throw new Error('Legacy target lotmAbilityY1004 not found.');
    if (!legacyB) throw new Error('Legacy target lotmAbilityY2001 not found.');

    const legacyAHeader = '<h3>Legacy Upgrade (Sequence 0 - Scope)</h3>';
    const legacyAText =
      '<p>At Sequence 0, <strong>Unrefused Summons</strong> inherits Moon symbolism over companions of life. ' +
      'When cast under natural moonlight or a Moon ability district, eligible targets can include one additional category chosen from plants, animals, humans, or supernatural beings regardless of prior mark exposure. ' +
      'Failed targets are guided by calm moon-cadence and can be routed to up to three linked rally points instead of one. ' +
      'If cast with at least <strong>+4 Spirituality</strong>, one lower-sequence target that fails may remain compliant for up to 10 minutes (save ends each minute).</p>';
    const legacyADesc = String(legacyA.system?.description?.value ?? '');
    if (!legacyADesc.includes(legacyAHeader)) {
      legacyA.system.description.value = `${legacyADesc}${legacyAHeader}${legacyAText}`;
    }
    legacyA._stats = buildStats(now + 2, legacyA._stats);
    await abilitiesDb.put(LEGACY_A_KEY, JSON.stringify(legacyA));

    const legacyBHeader = '<h3>Legacy Upgrade (Sequence 0 - Efficiency)</h3>';
    const legacyBText =
      '<p>At Sequence 0, <strong>Creation Authority</strong> no longer requires strict treatment sequencing. ' +
      'Once per round, when you apply baseline healing from Creation Authority, you may simultaneously end one additional eligible condition on the same target without extra cost. ' +
      'The first upcast surcharge of Creation Authority each round is reduced by <strong>1</strong> (minimum 0). ' +
      'If Creation Authority is cast with <strong>+4 Spirituality</strong>, you may apply its baseline start-of-turn healing to one additional creature each round for the duration.</p>';
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
      id: 'lotmAbilityY0001',
      name: 'Blood Moon Companion',
      description:
        '<p><strong>Baseline (6 Spirituality):</strong> Action. Raise a Blood Moon canopy in a 300-foot radius centered within 1 mile for 10 minutes (concentration). Spirit and reality lightly overlap in the area. Allies gain darkvision 120 feet, advantage on spiritual perception checks, and recover 1 spent Spirituality at the start of their turns. Hostiles starting their turn in the canopy make a Wisdom save; on failure they suffer disorientation, losing reactions and taking psychic damage equal to <strong>Potency</strong>.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> radius becomes 500 feet, or anchor one secondary canopy node within 300 feet of the first.</li><li><strong>+2 Spirituality:</strong> failed hostiles also suffer <strong>-Potency</strong> to concentration and perception checks until start of their next turn.</li><li><strong>+4 Spirituality:</strong> once per round, choose one ally in canopy to phase-step through spirit overlap up to 60 feet without provoking opportunity attacks; if the ally is a summon, it also gains resistance to all damage except radiant until start of its next turn.</li></ul><p><em>Counterplay:</em> anti-spirit barriers, divine daylight authority, and concentration disruption can collapse canopy intensity.</p><p><em>Corruption Hook:</em> using blood moon overlap to normalize civilian nightmare conditions adds 1 Corruption.</p>',
      img: 'icons/magic/light/orb-moon-runes-red.webp',
      activationType: 'action',
      durationValue: '10',
      durationUnits: 'minute',
      targetType: 'space',
      targetCount: '1',
      targetSpecial: 'blood moon canopy district',
      rangeUnits: 'mi',
      rangeValue: '1',
      rangeSpecial: '',
      school: 'ill',
      properties: ['vocal', 'somatic', 'material', 'concentration'],
      materials: 'a lunar chalice filled with moonwater and one drop of ancient blood',
      identifier: 'lotm-apothecary-blood-moon-companion',
      activityId: 'apothSeq0BloodAct01',
      now: now + 4,
      existing: ability1Existing,
      sort: 1800900
    });

    const ability2 = buildAbilityDoc({
      id: 'lotmAbilityY0002',
      name: 'Origin of Fertility',
      description:
        '<p><strong>Baseline (5 Spirituality):</strong> Action. Manifest origin-life flow for 10 minutes in a 120-foot radius centered within 300 feet (concentration). Choose up to <strong>Potency</strong> allied creatures each round: they regain HP equal to <strong>3 x Potency</strong>, end one of poisoned, diseased, frightened, charmed, or restrained, and gain advantage on Constitution saves until start of your next turn. Plants in the area rapidly flourish and can form soft cover or pathways at your direction.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> affect one additional Potency-sized allied group this round, or expand radius to 180 feet.</li><li><strong>+2 Spirituality:</strong> allies chosen this round also recover 1 spent Spirituality and become immune to poison and disease until start of your next turn.</li><li><strong>+4 Spirituality:</strong> once per creature during duration, when a chosen ally would drop to 0 HP, it instead drops to 1 HP, heals HP equal to <strong>2 x Potency</strong>, and may immediately stand up if prone.</li></ul><p><em>Counterplay:</em> anti-life authorities, decay curses, and concentration breaks reduce or terminate this flow.</p><p><em>Corruption Hook:</em> forcing fertility miracles as obedience contracts adds 1 Corruption.</p>',
      img: 'icons/magic/nature/tree-glowing-silhouette-green.webp',
      activationType: 'action',
      durationValue: '10',
      durationUnits: 'minute',
      targetType: 'space',
      targetCount: '1',
      targetSpecial: 'origin-life moon district',
      rangeUnits: 'ft',
      rangeValue: '300',
      rangeSpecial: '',
      school: 'abj',
      properties: ['vocal', 'somatic', 'material', 'concentration'],
      materials: 'seed pearls, blood-ink sigils, and a living branch of moonvine',
      identifier: 'lotm-apothecary-origin-of-fertility',
      activityId: 'apothSeq0OriginAct02',
      now: now + 5,
      existing: ability2Existing,
      sort: 1800901
    });

    const ability3 = buildAbilityDoc({
      id: 'lotmAbilityY0003',
      name: 'Companion of All Life',
      description:
        '<p><strong>Baseline (5 Spirituality):</strong> Action. Establish a universal companion pact for 1 minute with up to <strong>Potency</strong> targets within 240 feet chosen from plants, beasts, humans, and Beyonder creatures of eligible sequence band. Each hostile or unwilling target makes a Wisdom save. On failure, it cannot directly attack you or your designated companions and must obey one concise non-suicidal command each round. Willing targets gain advantage on checks made to carry out your directives.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> double target count or increase range to 500 feet.</li><li><strong>+2 Spirituality:</strong> failed targets are also marked with companion sigils; they suffer <strong>-Potency</strong> on attempts to resist your summons, charm, or command effects for 1 minute.</li><li><strong>+4 Spirituality:</strong> once per round, transfer one beneficial condition from a willing bound target to another bound target within range (fear/charm/poison protection or movement bonus), or suppress one hostile bound target reaction and movement for the round.</li></ul><p><em>Counterplay:</em> high-sequence mind protection, anti-command seals, and sequence superiority can resist or break the pact.</p><p><em>Corruption Hook:</em> flattening all relationship agency into forced companionship adds 1 Corruption.</p>',
      img: 'icons/creatures/mammals/wolf-shadow-black.webp',
      activationType: 'action',
      durationValue: '1',
      durationUnits: 'minute',
      targetType: 'creature',
      targetCount: '1',
      targetSpecial: 'multiple chosen creatures/plants/beings per cast',
      rangeUnits: 'ft',
      rangeValue: '240',
      rangeSpecial: '',
      school: 'enc',
      properties: ['vocal', 'somatic', 'material'],
      materials: 'a moon-silver thread braided with leaves, fur, and blood-script',
      identifier: 'lotm-apothecary-companion-of-all-life',
      activityId: 'apothSeq0CompanionAct03',
      now: now + 6,
      existing: ability3Existing,
      sort: 1800902
    });

    const ability4 = buildAbilityDoc({
      id: 'lotmAbilityY0004',
      name: 'Moon',
      description:
        '<p><strong>Baseline (6 Spirituality):</strong> Action. Invoke Moon symbolism as regional law for 1 minute (concentration) over a 500-foot radius centered within 1 mile. Choose two active laws at cast time and one additional law each round: <strong>Spirituality</strong> (allies recover 1 spent Spirituality each round), <strong>Beauty</strong> (hostiles that target allies make Wisdom save or take disadvantage), <strong>Summoning</strong> (your summons gain +Potency on one action each round), <strong>Life</strong> (allies regain HP equal to Potency at turn start), <strong>Darkness/Bizarreness</strong> (hostiles in dim areas have disadvantage on perception and concentration checks).</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> increase radius to 800 feet or activate one extra law immediately.</li><li><strong>+2 Spirituality:</strong> one chosen law can be intensified each round; intensified law doubles its numeric values (HP/spirituality/penalties/bonuses).</li><li><strong>+4 Spirituality:</strong> once during duration, issue a Moon verdict pulse. Hostile creatures in area make a Wisdom save; on failure they are unable to take reactions and have movement halved until end of their next turn, while allies may immediately move up to 20 feet without provoking opportunity attacks.</li></ul><p><em>Counterplay:</em> opposing high-sequence authorities, anti-domain null zones, and forced concentration failure can end Moon law.</p><p><em>Corruption Hook:</em> replacing local will and ecology with permanent personal Moon law adds 1 Corruption.</p>',
      img: 'icons/magic/light/orbs-moon-gray.webp',
      activationType: 'action',
      durationValue: '1',
      durationUnits: 'minute',
      targetType: 'space',
      targetCount: '1',
      targetSpecial: 'regional moon law field',
      rangeUnits: 'mi',
      rangeValue: '1',
      rangeSpecial: '',
      school: 'con',
      properties: ['vocal', 'somatic', 'material', 'concentration'],
      materials: 'crimson moon disk, spirit ash, and a complete sequence sigil array',
      identifier: 'lotm-apothecary-moon',
      activityId: 'apothSeq0MoonAct04',
      now: now + 7,
      existing: ability4Existing,
      sort: 1800903
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
              hasLegacyHeader: String(verifyLegacyA?.system?.description?.value ?? '').includes(legacyAHeader),
              grantedSequence: verifyLegacyA?.flags?.lotm?.grantedSequence,
              level: verifyLegacyA?.system?.level
            },
            {
              key: LEGACY_B_KEY,
              id: verifyLegacyB?._id,
              name: verifyLegacyB?.name,
              hasLegacyHeader: String(verifyLegacyB?.system?.description?.value ?? '').includes(legacyBHeader),
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
