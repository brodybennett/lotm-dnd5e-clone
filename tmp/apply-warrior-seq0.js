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

function buildSeq0Ability({
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
      '<p><strong>Sequence 0 Package (Gain Budget +114):</strong> Land of Twilight, Decay Verdict, Purifying End, Proxy of War, plus two legacy upgrades (Twilight Greatsword and Delegated Godmark).</p>' +
      '<p><strong>Sequence Track Status:</strong> Authored through Sequence 0 (complete standard pathway progression).</p>' +
      '<p><strong>Continuity Anchor:</strong> At Sequence 0 (Twilight Giant), simplified authorities become partial divine authority: twilight domain freezes time-flow, decay law erodes matter and will, holiness purifies through ending, and proxy war-command strips skill from foes while empowering vowed allies.</p>';
    pathway._stats = buildStats(now, pathway._stats);
    await pathwaysDb.put(pathwayKey, JSON.stringify(pathway));

    const folderKey = '!folders!HU7eK5t0hJEd93Ug';
    const folder = await getOptionalJson(abilitiesDb, folderKey);
    if (!folder) throw new Error('Warrior folder (HU7eK5t0hJEd93Ug) not found.');

    folder.description = 'Sequence abilities for the Warrior pathway (authored through Sequence 0).';
    folder.flags = folder.flags ?? {};
    folder.flags.lotm = {
      ...(folder.flags.lotm ?? {}),
      pathwayIdentifier: 'lotm-warrior',
      latestAuthoredSequence: 0
    };
    folder._stats = buildStats(now + 1, folder._stats);
    await abilitiesDb.put(folderKey, JSON.stringify(folder));

    const greatswordKey = '!items!lotmAbilityW2001';
    const greatsword = await getOptionalJson(abilitiesDb, greatswordKey);
    if (!greatsword) throw new Error('Legacy target lotmAbilityW2001 not found.');
    const greatswordHeader = '<h3>Legacy Upgrade (Sequence 0 - Potency)</h3>';
    if (!String(greatsword.system?.description?.value ?? '').includes(greatswordHeader)) {
      greatsword.system.description.value +=
        `${greatswordHeader}<p>At Sequence 0, Twilight Greatsword carries end-state authority. ` +
        `Increase baseline damage by <strong>+2 x Potency</strong>. ` +
        `If cast with +4 Spirituality or higher, failed targets cannot benefit from finite-lifespan resurrection effects until the end of the current scene.</p>`;
    }
    greatsword._stats = buildStats(now + 2, greatsword._stats);
    await abilitiesDb.put(greatswordKey, JSON.stringify(greatsword));

    const godmarkKey = '!items!lotmAbilityW1004';
    const godmark = await getOptionalJson(abilitiesDb, godmarkKey);
    if (!godmark) throw new Error('Legacy target lotmAbilityW1004 not found.');
    const godmarkHeader = '<h3>Legacy Upgrade (Sequence 0 - Efficiency)</h3>';
    if (!String(godmark.system?.description?.value ?? '').includes(godmarkHeader)) {
      godmark.system.description.value +=
        `${godmarkHeader}<p>At Sequence 0, Delegated Godmark stabilizes into a law-mark. ` +
        `Once per round, one marked ally may activate one mark rider without paying additional Spirituality surcharge. ` +
        `If you maintain at least two active marks, each marked ally gains +10 feet movement and resistance to fear.</p>`;
    }
    godmark._stats = buildStats(now + 3, godmark._stats);
    await abilitiesDb.put(godmarkKey, JSON.stringify(godmark));

    const w0001Existing = await getOptionalJson(abilitiesDb, '!items!lotmAbilityW0001');
    const w0002Existing = await getOptionalJson(abilitiesDb, '!items!lotmAbilityW0002');
    const w0003Existing = await getOptionalJson(abilitiesDb, '!items!lotmAbilityW0003');
    const w0004Existing = await getOptionalJson(abilitiesDb, '!items!lotmAbilityW0004');

    const abilities = [
      buildSeq0Ability({
        id: 'lotmAbilityW0001',
        name: 'Land of Twilight',
        img: 'icons/magic/time/clock-stopwatch-orange.webp',
        description:
          '<p><strong>Baseline (0 Spirituality):</strong> Action. Establish a 60-foot-radius twilight domain centered on a point within 120 feet for 1 minute. Enemies inside have speed halved, suffer disadvantage on concentration checks, and their teleportation or spirit-shift exits are delayed until the end of their turn. Allies you acknowledge ignore domain penalties and gain <strong>+Potency</strong> on one save each round.</p>' +
          '<p><strong>Higher Spend (upcast):</strong></p>' +
          '<ul><li><strong>+1 Spirituality:</strong> Domain radius becomes 90 feet.</li>' +
          '<li><strong>+2 Spirituality:</strong> Duration becomes 2 minutes, and you can acknowledge up to Potency allies for reaction movement through the domain without opportunity attacks.</li>' +
          '<li><strong>+4 Spirituality:</strong> Once per round, choose one hostile in the domain; on a failed save it suffers age-strain, reducing max HP by Potency until purified or long rest.</li></ul>' +
          '<p><em>Counterplay:</em> Equal-rank domain conflict, hard anti-authority seals, or breaking line maintenance can collapse advanced riders.</p>' +
          '<p><em>Backlash:</em> If the domain is forcefully shattered, gain one stage of temporal dissonance until short rest.</p>',
        activationType: 'action',
        durationValue: '1',
        durationUnits: 'minute',
        targetType: 'sphere',
        targetCount: '1',
        targetSpecial: '60-foot-radius twilight domain centered on a point in range',
        templateType: 'radius',
        templateUnits: 'ft',
        rangeUnits: 'ft',
        rangeValue: '120',
        rangeSpecial: '',
        school: 'abj',
        properties: ['vocal', 'somatic'],
        materials: 'a shard from a shattered sundial',
        identifier: 'lotm-warrior-land-of-twilight',
        activityId: 'warriorSeq0Act001',
        sort: 800900,
        existing: w0001Existing,
        now: now + 4
      }),
      buildSeq0Ability({
        id: 'lotmAbilityW0002',
        name: 'Decay Verdict',
        img: 'icons/magic/death/skull-energy-drain-purple.webp',
        description:
          '<p><strong>Baseline (0 Spirituality):</strong> Action. Issue a decay verdict to one creature within 120 feet or creatures in a 20-foot radius. Failed saves take <strong>5 x Potency</strong> damage, lose one active defensive rider, and become weakened (minus Potency to physical checks) until end of next turn. Successful saves take half damage.</p>' +
          '<p><strong>Higher Spend (upcast):</strong></p>' +
          '<ul><li><strong>+1 Spirituality:</strong> Radius becomes 30 feet or single-target range becomes 180 feet.</li>' +
          '<li><strong>+2 Spirituality:</strong> Also decays one conjured barrier, wall, or ward segment in the area.</li>' +
          '<li><strong>+4 Spirituality:</strong> Failed targets cannot regain hit points by mundane or finite-lifespan regeneration effects until the end of your next turn.</li></ul>' +
          '<p><em>Counterplay:</em> Spatial displacement before resolution and conceptual anti-decay effects can blunt this verdict.</p>' +
          '<p><em>Corruption Hook:</em> Using decay law for wanton extermination adds 1 Corruption.</p>',
        activationType: 'action',
        durationValue: '',
        durationUnits: 'inst',
        targetType: 'creature',
        targetCount: '1',
        targetSpecial: 'one creature within 120 feet or creatures in a 20-foot radius',
        templateType: 'radius',
        templateUnits: 'ft',
        rangeUnits: 'ft',
        rangeValue: '120',
        rangeSpecial: '',
        school: 'nec',
        properties: ['vocal', 'somatic'],
        materials: 'powder from rusted giant-war armor',
        identifier: 'lotm-warrior-decay-verdict',
        activityId: 'warriorSeq0Act002',
        sort: 800901,
        existing: w0002Existing,
        now: now + 5
      }),
      buildSeq0Ability({
        id: 'lotmAbilityW0003',
        name: 'Purifying End',
        img: 'icons/magic/light/explosion-star-glow-silhouette.webp',
        description:
          '<p><strong>Baseline (0 Spirituality):</strong> Action. Release a solemn dawn-through-twilight pulse in a 30-foot radius centered on you or a point within 60 feet. Allies in the pulse remove one fear, charm, or corruption-stage effect and heal Potency HP. Corrupted or undead enemies must save or take <strong>4 x Potency</strong> radiant-decay damage and lose one corruption-based rider.</p>' +
          '<p><strong>Higher Spend (upcast):</strong></p>' +
          '<ul><li><strong>+1 Spirituality:</strong> Radius becomes 40 feet.</li>' +
          '<li><strong>+2 Spirituality:</strong> You may purify one tainted Beyonder characteristic, ritual residue, or cursed anchor in the area (GM adjudicated).</li>' +
          '<li><strong>+4 Spirituality:</strong> A second pulse occurs at start of your next turn, repeating baseline effects at Potency damage/healing.</li></ul>' +
          '<p><em>Counterplay:</em> Anti-holiness veils or protected corruption cores can resist full purification.</p>' +
          '<p><em>Backlash:</em> Each cast after the first in a scene imposes cumulative minus 1 on sanity checks until short rest.</p>',
        activationType: 'action',
        durationValue: '',
        durationUnits: 'inst',
        targetType: 'creature',
        targetCount: '1',
        targetSpecial: 'creatures in a 30-foot radius',
        templateType: 'radius',
        templateUnits: 'ft',
        rangeUnits: 'ft',
        rangeValue: '60',
        rangeSpecial: '',
        school: 'div',
        properties: ['vocal', 'somatic'],
        materials: 'ash from a burned oath tablet',
        identifier: 'lotm-warrior-purifying-end',
        activityId: 'warriorSeq0Act003',
        sort: 800902,
        existing: w0003Existing,
        now: now + 6
      }),
      buildSeq0Ability({
        id: 'lotmAbilityW0004',
        name: 'Proxy of War',
        img: 'icons/magic/symbols/runes-star-orange.webp',
        description:
          '<p><strong>Baseline (0 Spirituality):</strong> Bonus action. Invoke proxy authority for 1 minute. Choose up to Potency enemies within 120 feet; failed saves are stripped of practiced rhythm and cannot add proficiency to weapon attacks until end of your next turn. Choose up to Potency allies; they gain +Potency on one attack or save each round while they can see you.</p>' +
          '<p><strong>Higher Spend (upcast):</strong></p>' +
          '<ul><li><strong>+1 Spirituality:</strong> Enemy strip duration becomes 2 rounds.</li>' +
          '<li><strong>+2 Spirituality:</strong> Stripped enemies also lose one reaction option and suffer disadvantage on one concentration check per round.</li>' +
          '<li><strong>+4 Spirituality:</strong> Once during duration, issue a war edict as a free action: either force all stripped enemies to make immediate movement of your choice up to 10 feet, or let all marked allies move 10 feet and make one weapon attack as a reaction.</li></ul>' +
          '<p><em>Counterplay:</em> Line-of-sight breaks and anti-proxy suppression reduce command coverage.</p>' +
          '<p><em>Corruption Hook:</em> If used to enthrall oath-bound allies against their vows, gain 1 Corruption.</p>',
        activationType: 'bonus',
        durationValue: '1',
        durationUnits: 'minute',
        targetType: 'creature',
        targetCount: '1',
        targetSpecial: 'up to Potency allies and enemies within 120 feet',
        templateType: '',
        templateUnits: '',
        rangeUnits: 'ft',
        rangeValue: '120',
        rangeSpecial: '',
        school: 'enc',
        properties: ['vocal', 'somatic'],
        materials: 'a sealed military oath strip',
        identifier: 'lotm-warrior-proxy-of-war',
        activityId: 'warriorSeq0Act004',
        sort: 800903,
        existing: w0004Existing,
        now: now + 7
      })
    ];

    for (const ability of abilities) {
      await abilitiesDb.put(`!items!${ability._id}`, JSON.stringify(ability));
    }

    console.log(JSON.stringify({
      pathwayUpdated: pathwayKey,
      folderUpdated: folderKey,
      legacyUpdated: [greatswordKey, godmarkKey],
      abilitiesWritten: abilities.map((a) => `!items!${a._id}`)
    }, null, 2));
  } finally {
    await pathwaysDb.close();
    await abilitiesDb.close();
  }
})();
