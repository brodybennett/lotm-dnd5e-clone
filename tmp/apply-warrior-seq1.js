const { ClassicLevel } = require('./node-tools/node_modules/classic-level');

const CORE_VERSION = '13.351';
const SYSTEM_ID = 'lotm';
const SYSTEM_VERSION = '5.2.6';
const MODIFIER = '0000000000000000';

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

function buildActivity({ id, activationType, durationUnits }) {
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
        units: 'ft'
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

function buildSeq1Ability({
  id,
  name,
  img,
  description,
  activationType,
  durationValue,
  durationUnits,
  targetType,
  targetCount,
  targetSpecial,
  templateType,
  templateUnits,
  rangeUnits,
  rangeValue,
  rangeSpecial,
  school,
  properties,
  materials,
  identifier,
  activityId,
  sort,
  existing,
  now
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
          units: templateUnits,
          contiguous: false,
          type: templateType
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
      level: 8,
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
      sourceClass: 'lotm-warrior'
    },
    effects: [],
    folder: 'HU7eK5t0hJEd93Ug',
    flags: {
      dnd5e: {
        riders: {
          activity: [],
          effect: []
        }
      },
      lotm: {
        sourceBook: 'LoTM Core',
        grantedSequence: 1
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
    const pathwayKey = '!items!lotmPathway00011';
    const pathway = await getOptionalJson(pathwaysDb, pathwayKey);
    if (!pathway) throw new Error('Warrior pathway (lotmPathway00011) not found.');

    pathway.system = pathway.system ?? {};
    pathway.system.description = pathway.system.description ?? { value: '', chat: '' };
    pathway.system.description.value =
      '<p><strong>Pathway Vector:</strong> stoic frontline command through trained violence, iron resolve, and twilight-forged endurance.</p>' +
      '<p><strong>Sequence 9 Package (Total Budget 2):</strong> Combat Mastery, Physical Enhancement.</p>' +
      '<p><strong>Sequence 8 Package (Gain Budget +3):</strong> Supernatural Resistance, Close-Quarters Mastery, plus one legacy scope upgrade to Combat Mastery.</p>' +
      '<p><strong>Sequence 7 Package (Gain Budget +13):</strong> Weapon Mastery, Iron Body Discipline, Twilight Reversal, plus two legacy upgrades (Close-Quarters Mastery and Supernatural Resistance).</p>' +
      '<p><strong>Sequence 6 Package (Gain Budget +9):</strong> Light of Dawn, Dawn Armour, Sword of Dawn, plus two legacy upgrades (Weapon Mastery and Iron Body Discipline).</p>' +
      '<p><strong>Sequence 5 Package (Gain Budget +13):</strong> Protection, Illusion Immunity, Unbreakable Defense, plus two legacy upgrades (Light of Dawn and Dawn Armour).</p>' +
      '<p><strong>Sequence 4 Package (Gain Budget +33):</strong> Eye of Demon Hunting, Weapon Ointment Mastery, Mind Concealment, Incomplete Mythical Creature Form, plus two legacy upgrades (Protection and Light of Dawn).</p>' +
      '<p><strong>Sequence 3 Package (Gain Budget +20):</strong> Mercury Liquefaction, Silver Rapier, Light Concealment, Hurricane of Light, plus two legacy upgrades (Eye of Demon Hunting and Weapon Ointment Mastery).</p>' +
      '<p><strong>Sequence 2 Package (Gain Budget +50):</strong> Twilight Greatsword, Cage of Glory, Passage of Twilight, Purifying Devastation, plus two legacy upgrades (Silver Rapier and Hurricane of Light).</p>' +
      '<p><strong>Sequence 1 Package (Gain Budget +74):</strong> Proxy Manifestation, Right Hand of Twilight, Unyielding Glory Cage, Delegated Godmark, plus two legacy upgrades (Twilight Greatsword and Cage of Glory).</p>' +
      '<p><strong>Sequence 0 Status:</strong> Pending authoring in a later sequence-focused run.</p>' +
      '<p><strong>Continuity Anchor:</strong> At Sequence 1 (Hand of God), prior Glory authorities are not replaced but compressed into delegated judgment: the right hand channels patron-aligned punishment, cages become angel-grade boundaries, and marked allies carry fragments of that command.</p>';
    pathway._stats = buildStats(now, pathway._stats);
    await pathwaysDb.put(pathwayKey, JSON.stringify(pathway));

    const folderKey = '!folders!HU7eK5t0hJEd93Ug';
    const folder = await getOptionalJson(abilitiesDb, folderKey);
    if (!folder) throw new Error('Warrior folder (HU7eK5t0hJEd93Ug) not found.');

    folder.description = 'Sequence abilities for the Warrior pathway (authored through Sequence 1).';
    folder.flags = folder.flags ?? {};
    folder.flags.lotm = {
      ...(folder.flags.lotm ?? {}),
      pathwayIdentifier: 'lotm-warrior',
      latestAuthoredSequence: 1
    };
    folder._stats = buildStats(now + 1, folder._stats);
    await abilitiesDb.put(folderKey, JSON.stringify(folder));

    const greatswordKey = '!items!lotmAbilityW2001';
    const greatsword = await getOptionalJson(abilitiesDb, greatswordKey);
    if (!greatsword) throw new Error('Legacy target lotmAbilityW2001 not found.');
    const greatswordHeader = '<h3>Legacy Upgrade (Sequence 1 - Potency)</h3>';
    if (!String(greatsword.system?.description?.value ?? '').includes(greatswordHeader)) {
      greatsword.system.description.value +=
        `${greatswordHeader}<p>At Sequence 1, Twilight Greatsword carries proxy-borne weight. Increase baseline damage by <strong>+Potency</strong>. ` +
        `If cast with +2 Spirituality or higher, the first failed target each round is marked by delayed dusk, taking Potency damage at end of its next turn.</p>`;
    }
    greatsword._stats = buildStats(now + 2, greatsword._stats);
    await abilitiesDb.put(greatswordKey, JSON.stringify(greatsword));

    const gloryCageKey = '!items!lotmAbilityW2002';
    const gloryCage = await getOptionalJson(abilitiesDb, gloryCageKey);
    if (!gloryCage) throw new Error('Legacy target lotmAbilityW2002 not found.');
    const gloryCageHeader = '<h3>Legacy Upgrade (Sequence 1 - Scope)</h3>';
    if (!String(gloryCage.system?.description?.value ?? '').includes(gloryCageHeader)) {
      gloryCage.system.description.value +=
        `${gloryCageHeader}<p>At Sequence 1, Cage of Glory manifests an outer unyielding radiance ring. Increase baseline radius by 5 feet. ` +
        `Hostile creatures that attempt to teleport, phase, or shadow-cross the boundary must make a save; on failure, the crossing is canceled and they are restrained until end of turn.</p>`;
    }
    gloryCage._stats = buildStats(now + 3, gloryCage._stats);
    await abilitiesDb.put(gloryCageKey, JSON.stringify(gloryCage));

    const w1001Existing = await getOptionalJson(abilitiesDb, '!items!lotmAbilityW1001');
    const w1002Existing = await getOptionalJson(abilitiesDb, '!items!lotmAbilityW1002');
    const w1003Existing = await getOptionalJson(abilitiesDb, '!items!lotmAbilityW1003');
    const w1004Existing = await getOptionalJson(abilitiesDb, '!items!lotmAbilityW1004');

    const abilities = [
      buildSeq1Ability({
        id: 'lotmAbilityW1001',
        name: 'Proxy Manifestation',
        img: 'icons/magic/light/explosion-star-large-orange.webp',
        description:
          '<p><strong>Baseline (0 Spirituality):</strong> Bonus action. Manifest delegated authority for 1 round and choose one mode: <em>Punishment</em> (+Potency damage on your attacks/Warrior abilities), <em>Bulwark</em> (resistance to weapon damage and +Potency to one save), or <em>Pursuit</em> (+20 speed and no opportunity attacks against your movement).</p>' +
          '<p><strong>Higher Spend (upcast):</strong></p>' +
          '<ul><li><strong>+1 Spirituality:</strong> Duration becomes 2 rounds.</li>' +
          '<li><strong>+2 Spirituality:</strong> Choose two modes instead of one.</li>' +
          '<li><strong>+4 Spirituality:</strong> Once during duration, cast one Warrior ability of Sequence 3 or lower as a free rider (still pay its Spirituality spend).</li></ul>' +
          '<p><em>Backlash:</em> After effect ends, make a sanity check; on failure, you suffer one round of confusion and gain 1 Corruption.</p>' +
          '<p><em>Counterplay:</em> Authority-suppression zones and anti-proxy seals can end this effect early.</p>',
        activationType: 'bonus',
        durationValue: '1',
        durationUnits: 'round',
        targetType: 'self',
        targetCount: '1',
        targetSpecial: '',
        templateType: '',
        templateUnits: '',
        rangeUnits: 'self',
        rangeValue: null,
        rangeSpecial: '',
        school: 'trs',
        properties: ['somatic'],
        materials: 'a vow-script signed in blood',
        identifier: 'lotm-warrior-proxy-manifestation',
        activityId: 'warriorSeq1Act001',
        sort: 800800,
        existing: w1001Existing,
        now: now + 4
      }),
      buildSeq1Ability({
        id: 'lotmAbilityW1002',
        name: 'Right Hand of Twilight',
        img: 'icons/magic/unholy/hand-weapon-glow-orange.webp',
        description:
          '<p><strong>Baseline (0 Spirituality):</strong> Action. Condense orange twilight into your right hand and strike one creature within 60 feet. On a failed Constitution save, it takes <strong>4 x Potency</strong> damage, loses reactions, and has speed reduced by 10 feet until start of your next turn; on success, half damage only.</p>' +
          '<p><strong>Higher Spend (upcast):</strong></p>' +
          '<ul><li><strong>+1 Spirituality:</strong> Chain to one additional target within 15 feet of the first.</li>' +
          '<li><strong>+2 Spirituality:</strong> Failed targets also lose one active non-conceptual defensive rider.</li>' +
          '<li><strong>+4 Spirituality:</strong> Failed targets already under slow/decay cannot teleport and have speed 0 until end of their next turn.</li></ul>' +
          '<p><em>Counterplay:</em> Hard cover and displacement effects before impact can reduce connection reliability.</p>' +
          '<p><em>Corruption Hook:</em> Repeated use for indiscriminate punishment adds 1 Corruption.</p>',
        activationType: 'action',
        durationValue: '',
        durationUnits: 'inst',
        targetType: 'creature',
        targetCount: '1',
        targetSpecial: 'one creature within 60 feet',
        templateType: '',
        templateUnits: '',
        rangeUnits: 'ft',
        rangeValue: '60',
        rangeSpecial: '',
        school: 'evc',
        properties: ['vocal', 'somatic'],
        materials: 'a burned strip of orange cloth',
        identifier: 'lotm-warrior-right-hand-of-twilight',
        activityId: 'warriorSeq1Act002',
        sort: 800801,
        existing: w1002Existing,
        now: now + 5
      }),
      buildSeq1Ability({
        id: 'lotmAbilityW1003',
        name: 'Unyielding Glory Cage',
        img: 'icons/magic/defensive/barrier-shield-dome-deflect-orange.webp',
        description:
          '<p><strong>Baseline (0 Spirituality):</strong> Action. Raise a dense-light cage with an outer unyielding shell in a 20-foot radius within 90 feet for 1 minute. Hostile creatures cannot cross the boundary by movement, short teleport, or phasing unless they pass a save. Allies inside gain <strong>+Potency</strong> on saves against control and corruption.</p>' +
          '<p><strong>Higher Spend (upcast):</strong></p>' +
          '<ul><li><strong>+1 Spirituality:</strong> Radius becomes 30 feet.</li>' +
          '<li><strong>+2 Spirituality:</strong> While you remain within 120 feet, the cage seals one active ritual or sealed-artifact influence inside it.</li>' +
          '<li><strong>+4 Spirituality:</strong> Once per round, when the cage absorbs a hostile ability, you may repair it as a reaction and force one triggering hostile to save or become restrained until end of its turn.</li></ul>' +
          '<p><em>Counterplay:</em> Forcing the caster unconscious or beyond maintenance range collapses advanced sealing riders.</p>' +
          '<p><em>Corruption Hook:</em> Using cage authority for cruelty imprisonment adds 1 Corruption.</p>',
        activationType: 'action',
        durationValue: '1',
        durationUnits: 'minute',
        targetType: 'sphere',
        targetCount: '1',
        targetSpecial: '20-foot-radius cage centered on a point in range',
        templateType: 'radius',
        templateUnits: 'ft',
        rangeUnits: 'ft',
        rangeValue: '90',
        rangeSpecial: '',
        school: 'abj',
        properties: ['vocal', 'somatic'],
        materials: 'a bent silver chain link',
        identifier: 'lotm-warrior-unyielding-glory-cage',
        activityId: 'warriorSeq1Act003',
        sort: 800802,
        existing: w1003Existing,
        now: now + 6
      }),
      buildSeq1Ability({
        id: 'lotmAbilityW1004',
        name: 'Delegated Godmark',
        img: 'icons/magic/symbols/runes-star-pentagon-orange.webp',
        description:
          '<p><strong>Baseline (0 Spirituality):</strong> Action. Condense your power into a mark and place it on yourself or one ally for 10 minutes. Once each round, the marked target can gain <strong>+Potency</strong> on one attack roll, check, or save DC tied to a Warrior ability.</p>' +
          '<p><strong>Higher Spend (upcast):</strong></p>' +
          '<ul><li><strong>+1 Spirituality:</strong> Mark one additional ally within 30 feet.</li>' +
          '<li><strong>+2 Spirituality:</strong> Each marked target gains one use of stand-fast (when reduced to 0 HP, remain at 1 HP instead).</li>' +
          '<li><strong>+4 Spirituality:</strong> As a bonus action, trigger one active mark to emit a 10-foot pulse: enemies take Potency damage and allies end one fear or charm effect.</li></ul>' +
          '<p><em>Counterplay:</em> Marked targets under anti-divine suppression lose benefits until suppression ends.</p>' +
          '<p><em>Corruption Hook:</em> Bestowing marks on oath-breakers for profit adds 1 Corruption.</p>',
        activationType: 'action',
        durationValue: '10',
        durationUnits: 'minute',
        targetType: 'ally',
        targetCount: '1',
        targetSpecial: 'you or one ally within 30 feet',
        templateType: '',
        templateUnits: '',
        rangeUnits: 'ft',
        rangeValue: '30',
        rangeSpecial: '',
        school: 'div',
        properties: ['vocal', 'somatic'],
        materials: 'ink made from ash and dawn oil',
        identifier: 'lotm-warrior-delegated-godmark',
        activityId: 'warriorSeq1Act004',
        sort: 800803,
        existing: w1004Existing,
        now: now + 7
      })
    ];

    for (const ability of abilities) {
      await abilitiesDb.put(`!items!${ability._id}`, JSON.stringify(ability));
    }

    console.log(JSON.stringify({
      pathwayUpdated: pathwayKey,
      folderUpdated: folderKey,
      legacyUpdated: [greatswordKey, gloryCageKey],
      abilitiesWritten: abilities.map((a) => `!items!${a._id}`)
    }, null, 2));
  } finally {
    await pathwaysDb.close();
    await abilitiesDb.close();
  }
})();
