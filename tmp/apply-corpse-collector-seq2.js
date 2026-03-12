const { ClassicLevel } = require('./node-tools/node_modules/classic-level');

const CORE_VERSION = '13.351';
const SYSTEM_ID = 'lotm';
const SYSTEM_VERSION = '5.2.6';
const MODIFIER = '0000000000000000';

function touchStats(existing, now) {
  return {
    ...(existing ?? {}),
    duplicateSource: existing?.duplicateSource ?? null,
    coreVersion: CORE_VERSION,
    systemId: SYSTEM_ID,
    systemVersion: SYSTEM_VERSION,
    modifiedTime: now,
    lastModifiedBy: MODIFIER,
    exportSource: existing?.exportSource ?? null
  };
}

function newStats(now) {
  return {
    duplicateSource: null,
    coreVersion: CORE_VERSION,
    systemId: SYSTEM_ID,
    systemVersion: SYSTEM_VERSION,
    createdTime: now,
    modifiedTime: now,
    lastModifiedBy: MODIFIER,
    exportSource: null
  };
}

function appendLegacyBlock(doc, header, html) {
  const text = String(doc.system?.description?.value ?? '');
  if (!text.includes(header)) {
    doc.system.description.value = text + header + html;
  }
}

(async () => {
  const now = Date.now();

  const pathwaysDb = new ClassicLevel('packs/lotm_pathways', { valueEncoding: 'utf8' });
  const abilitiesDb = new ClassicLevel('packs/lotm_abilities', { valueEncoding: 'utf8' });

  await pathwaysDb.open();
  await abilitiesDb.open();

  const pathwayKey = '!items!lotmPathway00010';
  const pathway = JSON.parse(await pathwaysDb.get(pathwayKey));
  pathway.system.description.value = '<p><strong>Pathway Vector:</strong> solemn stewardship of corpses, spirit perception, and measured decay that treats death as inevitable order rather than panic or spectacle.</p><p><strong>Sequence 9 Package (Total Budget 2):</strong> Undead Physique, Spirit Vision.</p><p><strong>Sequence 8 Package (Gain Budget +3):</strong> Death Eyes, Grave Whisper, plus one legacy scope upgrade to Spirit Vision.</p><p><strong>Sequence 7 Package (Gain Budget +13):</strong> Spirit Channelling, Spirit Affinity, Zombie Disguise, plus two legacy upgrades (Undead Physique and Grave Whisper).</p><p><strong>Sequence 6 Package (Gain Budget +9):</strong> Language of the Dead, Resurrection, Knowledge of Spirit World, plus two legacy upgrades (Spirit Channelling and Death Eyes).</p><p><strong>Sequence 5 Package (Gain Budget +13):</strong> Door to the Underworld, Internal Underworld, Death Envoy, plus two legacy upgrades (Resurrection and Knowledge of Spirit World).</p><p><strong>Sequence 4 Package (Gain Budget +33):</strong> Reincarnation, Underworld Authority, Spirit World Traversal, Sealing Edict, plus two legacy upgrades (Door to the Underworld and Language of the Dead).</p><p><strong>Sequence 3 Package (Gain Budget +20):</strong> Hands of Life and Death, Ferryman, Death Gaze, Styx Afloat, plus two legacy upgrades (Reincarnation and Underworld Authority).</p><p><strong>Sequence 2 Package (Gain Budget +50):</strong> Nation of the Dead, King of the Dead, Death Consul\'s Decree, Soul Shepherding, plus two legacy upgrades (Ferryman and Death Gaze).</p><p><strong>Sequence 1-0 Status:</strong> Pending authoring in later sequence-focused runs.</p><p><strong>Continuity Anchor:</strong> At Sequence 2 (Death Consul), ferryman guidance matures into sovereign jurisdiction over death, souls, and underworld territory, enforcing calm finality at army and ritual scale.</p>';
  pathway._stats = touchStats(pathway._stats, now + 1);
  await pathwaysDb.put(pathwayKey, JSON.stringify(pathway));

  const folderKey = '!folders!zFhCGCq7OxUkeaTp';
  const folder = JSON.parse(await abilitiesDb.get(folderKey));
  folder.description = 'Sequence abilities for the Corpse Collector pathway (authored through Sequence 2).';
  folder.flags = folder.flags ?? {};
  folder.flags.lotm = {
    ...(folder.flags.lotm ?? {}),
    pathwayIdentifier: 'lotm-corpse-collector',
    latestAuthoredSequence: 2
  };
  folder._stats = touchStats(folder._stats, now + 2);
  await abilitiesDb.put(folderKey, JSON.stringify(folder));

  const ferrymanKey = '!items!lotmAbilityC3002';
  const ferryman = JSON.parse(await abilitiesDb.get(ferrymanKey));
  appendLegacyBlock(
    ferryman,
    '<h3>Legacy Upgrade (Sequence 2 - Scope)</h3>',
    '<p>At Sequence 2, Ferryman can extend its passage to a full funerary procession. When Ferryman is active, choose up to <strong>Potency</strong> allies at activation; they inherit your water-and-spirit traversal and gain +10 movement while they stay within 30 feet of you. Once per round, when one chosen ally would be reduced to 0 HP, you may move that ally up to 15 feet along a visible spirit-current and leave it at 1 HP instead. If cast with at least <strong>+3 Spirituality</strong>, that ally also gains temporary HP equal to your Potency.</p>'
  );
  ferryman._stats = touchStats(ferryman._stats, now + 3);
  await abilitiesDb.put(ferrymanKey, JSON.stringify(ferryman));

  const deathGazeKey = '!items!lotmAbilityC3003';
  const deathGaze = JSON.parse(await abilitiesDb.get(deathGazeKey));
  appendLegacyBlock(
    deathGaze,
    '<h3>Legacy Upgrade (Sequence 2 - Potency)</h3>',
    '<p>At Sequence 2, Death Gaze carries a consul\'s sentence. The first creature each round that fails against your gaze by 5 or more also suffers <strong>Mortal Deterioration</strong> until end of your next turn: it cannot gain advantage on saves, and the next time it takes necrotic damage, it takes extra necrotic damage equal to your Potency. If Death Gaze is cast with at least <strong>+3 Spirituality</strong>, you may spread Mortal Deterioration to a second failed target in the same round.</p>'
  );
  deathGaze._stats = touchStats(deathGaze._stats, now + 4);
  await abilitiesDb.put(deathGazeKey, JSON.stringify(deathGaze));

  const docs = [
    {
      _id: 'lotmAbilityC2001',
      name: 'Nation of the Dead',
      type: 'spell',
      img: 'icons/magic/death/undead-zombie-grave-green.webp',
      system: {
        description: {
          value: '<p><strong>Baseline (0 Spirituality):</strong> As an action, establish a 60-foot-radius underworld jurisdiction centered on a point within 120 feet for 10 minutes (concentration). Hostile creatures of your choice must make a Wisdom save when they enter or start their turn in the zone. On a failure, they take necrotic damage equal to your Potency, lose 15 feet of speed, and cannot take reactions until the start of their next turn. Undead or spirit creatures you command in the zone gain temporary HP equal to your Potency at the start of their turns (once per round per creature).</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+3 Spirituality:</strong> Radius becomes 90 feet, and allies you choose ignore difficult terrain and corpse-hazard penalties inside the zone.</li><li><strong>+6 Spirituality:</strong> Failed saves by 5 or more also impose silence until the end of the target\'s next turn (the target cannot provide verbal spell components).</li><li><strong>+9 Spirituality:</strong> Once per round, when a creature fails the zone save, draw a soul-echo: either heal one ally in the zone for <strong>2 x Potency</strong> HP or impose disadvantage on one target\'s next save before your next turn.</li></ul><p><em>Counterplay:</em> consecrated terrain, forced displacement, and anti-domain seals can fracture the jurisdiction.</p><p><em>Corruption Hook:</em> claiming intact funerary ground for personal authority can add 1 Corruption.</p>',
          chat: ''
        },
        source: {
          custom: '',
          rules: '2024',
          revision: 1,
          license: '',
          book: 'LoTM Core'
        },
        activation: { type: 'action', condition: '', value: null },
        duration: { value: '10', units: 'minute' },
        target: {
          affects: { choice: false, count: '1', type: 'self', special: '' },
          template: { units: 'ft', contiguous: false, type: 'radius' }
        },
        range: { units: 'ft', value: '120', special: '' },
        uses: { max: '', spent: 0, recovery: [] },
        level: 7,
        school: 'nec',
        properties: ['vocal', 'somatic', 'concentration'],
        materials: {
          value: 'a coin taken from a sealed grave urn',
          consumed: false,
          cost: 0,
          supply: 0
        },
        preparation: { mode: 'always', prepared: false },
        activities: {
          corpseSeq2Act001: {
            type: 'utility',
            _id: 'corpseSeq2Act001',
            sort: 0,
            activation: { type: 'action', value: null, override: false },
            consumption: { scaling: { allowed: false }, spellSlot: true, targets: [] },
            description: { chatFlavor: '' },
            duration: { units: 'minute', concentration: false, override: false },
            effects: [],
            range: { override: false },
            target: {
              template: { contiguous: false, units: 'ft' },
              affects: { choice: false },
              override: false,
              prompt: true
            },
            uses: { spent: 0, recovery: [], max: '' },
            roll: { prompt: false, visible: false, name: '', formula: '' },
            name: '',
            img: '',
            appliedEffects: []
          }
        },
        identifier: 'lotm-corpse-collector-nation-of-the-dead',
        method: 'spell',
        prepared: 1,
        spiritualityCost: null,
        sourceClass: 'lotm-corpse-collector'
      },
      effects: [],
      folder: 'zFhCGCq7OxUkeaTp',
      flags: {
        dnd5e: { riders: { activity: [], effect: [] } },
        lotm: { sourceBook: 'LoTM Core', grantedSequence: 2 }
      },
      _stats: newStats(now + 5),
      sort: 2100700,
      ownership: { default: 0 }
    },
    {
      _id: 'lotmAbilityC2002',
      name: 'King of the Dead',
      type: 'spell',
      img: 'icons/magic/death/lich-king-staff-horned-white.webp',
      system: {
        description: {
          value: '<p><strong>Baseline (0 Spirituality):</strong> As an action, issue a sovereign command over corpses and wandering spirits within 60 feet for 1 hour. You may animate or bind up to <strong>Potency</strong> corpses/spirits as attendants (GM chooses suitable stat blocks). Bound attendants obey calm verbal commands and cannot willingly target your designated allies.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+3 Spirituality:</strong> Maximum attendants becomes <strong>2 x Potency</strong>, and you may issue one command to all bound attendants as a bonus action each round.</li><li><strong>+6 Spirituality:</strong> You may raise one <strong>Lieutenant</strong> from a corpse or spirit whose original sequence did not exceed Sequence 4; the lieutenant gains bonus damage equal to your Potency and advantage on saves against turning.</li><li><strong>+9 Spirituality:</strong> While this ability lasts, once per round you may cast one corpse-collector utility ability through an attendant as though you occupied its space (range and line of effect measured from it).</li></ul><p><em>Counterplay:</em> high-grade exorcism, saint-tier command suppression, and consecrated circles can sever your command links.</p><p><em>Corruption Hook:</em> binding unwilling souls for convenience instead of necessity can add 1 Corruption.</p>',
          chat: ''
        },
        source: {
          custom: '',
          rules: '2024',
          revision: 1,
          license: '',
          book: 'LoTM Core'
        },
        activation: { type: 'action', condition: '', value: null },
        duration: { value: '1', units: 'hour' },
        target: {
          affects: {
            choice: false,
            count: '1',
            type: 'creature',
            special: 'corpse or spirit creature in range'
          },
          template: { units: '', contiguous: false, type: '' }
        },
        range: { units: 'ft', value: '60', special: '' },
        uses: { max: '', spent: 0, recovery: [] },
        level: 7,
        school: 'nec',
        properties: ['vocal', 'somatic'],
        materials: {
          value: 'a wax seal stamped with a funerary sigil',
          consumed: false,
          cost: 0,
          supply: 0
        },
        preparation: { mode: 'always', prepared: false },
        activities: {
          corpseSeq2Act002: {
            type: 'utility',
            _id: 'corpseSeq2Act002',
            sort: 0,
            activation: { type: 'action', value: null, override: false },
            consumption: { scaling: { allowed: false }, spellSlot: true, targets: [] },
            description: { chatFlavor: '' },
            duration: { units: 'hour', concentration: false, override: false },
            effects: [],
            range: { override: false },
            target: {
              template: { contiguous: false, units: 'ft' },
              affects: { choice: false },
              override: false,
              prompt: true
            },
            uses: { spent: 0, recovery: [], max: '' },
            roll: { prompt: false, visible: false, name: '', formula: '' },
            name: '',
            img: '',
            appliedEffects: []
          }
        },
        identifier: 'lotm-corpse-collector-king-of-the-dead',
        method: 'spell',
        prepared: 1,
        spiritualityCost: null,
        sourceClass: 'lotm-corpse-collector'
      },
      effects: [],
      folder: 'zFhCGCq7OxUkeaTp',
      flags: {
        dnd5e: { riders: { activity: [], effect: [] } },
        lotm: { sourceBook: 'LoTM Core', grantedSequence: 2 }
      },
      _stats: newStats(now + 6),
      sort: 2100701,
      ownership: { default: 0 }
    },
    {
      _id: 'lotmAbilityC2003',
      name: 'Death Consul\'s Decree',
      type: 'spell',
      img: 'icons/magic/death/skull-beam-blue.webp',
      system: {
        description: {
          value: '<p><strong>Baseline (0 Spirituality):</strong> As an action, pronounce final judgment on one creature you can see within 120 feet. The target makes a Constitution save. On a failure, it takes necrotic damage equal to <strong>4 x Potency</strong> and cannot regain hit points until the end of your next turn. On a success, it takes half damage and no heal-lock.</p><p>If the failed target is reduced to current HP at or below <strong>3 x Potency</strong> after damage, it immediately falls to 0 HP and begins death saves with one failed death save marked.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+3 Spirituality:</strong> Target up to two creatures; resolve saves separately.</li><li><strong>+6 Spirituality:</strong> A target that fails by 5 or more also loses one active magical enhancement or stance effect until the end of your next turn.</li><li><strong>+9 Spirituality:</strong> Once per long rest, if a target fails by 5 or more and is at or below <strong>5 x Potency</strong> HP after damage, the target dies instantly unless protected by explicit fate-substitution or equal-tier death authority.</li></ul><p><em>Counterplay:</em> line-of-sight denial, fate-transfer effects, and anti-necrotic sanctuary can blunt the decree.</p><p><em>Corruption Hook:</em> using decrees as political convenience rather than funerary necessity can add 1 Corruption.</p>',
          chat: ''
        },
        source: {
          custom: '',
          rules: '2024',
          revision: 1,
          license: '',
          book: 'LoTM Core'
        },
        activation: { type: 'action', condition: '', value: null },
        duration: { value: '1', units: 'inst' },
        target: {
          affects: {
            choice: false,
            count: '1',
            type: 'creature',
            special: 'creature you can see'
          },
          template: { units: '', contiguous: false, type: '' }
        },
        range: { units: 'ft', value: '120', special: '' },
        uses: { max: '', spent: 0, recovery: [] },
        level: 7,
        school: 'nec',
        properties: ['vocal', 'somatic'],
        materials: {
          value: 'a black decree tablet wrapped in linen',
          consumed: false,
          cost: 0,
          supply: 0
        },
        preparation: { mode: 'always', prepared: false },
        activities: {
          corpseSeq2Act003: {
            type: 'utility',
            _id: 'corpseSeq2Act003',
            sort: 0,
            activation: { type: 'action', value: null, override: false },
            consumption: { scaling: { allowed: false }, spellSlot: true, targets: [] },
            description: { chatFlavor: '' },
            duration: { units: 'inst', concentration: false, override: false },
            effects: [],
            range: { override: false },
            target: {
              template: { contiguous: false, units: 'ft' },
              affects: { choice: false },
              override: false,
              prompt: true
            },
            uses: { spent: 0, recovery: [], max: '' },
            roll: { prompt: false, visible: false, name: '', formula: '' },
            name: '',
            img: '',
            appliedEffects: []
          }
        },
        identifier: 'lotm-corpse-collector-death-consuls-decree',
        method: 'spell',
        prepared: 1,
        spiritualityCost: null,
        sourceClass: 'lotm-corpse-collector'
      },
      effects: [],
      folder: 'zFhCGCq7OxUkeaTp',
      flags: {
        dnd5e: { riders: { activity: [], effect: [] } },
        lotm: { sourceBook: 'LoTM Core', grantedSequence: 2 }
      },
      _stats: newStats(now + 7),
      sort: 2100702,
      ownership: { default: 0 }
    },
    {
      _id: 'lotmAbilityC2004',
      name: 'Soul Shepherding',
      type: 'spell',
      img: 'icons/magic/symbols/runes-star-pentagon-black.webp',
      system: {
        description: {
          value: '<p><strong>Baseline (0 Spirituality):</strong> Perform a 10-minute funerary rite over one corpse within reach. You may ask the soul up to <strong>Potency</strong> questions it knew in life (it must answer plainly unless blocked by superior authority). After questioning, choose one boon for one ally within 30 feet for 10 minutes: <strong>Funeral Ward</strong> (advantage on death saves and resistance to necrotic damage) or <strong>Grave Oath</strong> (the ally\'s next hit against a creature tied to the death of the questioned soul deals extra necrotic damage equal to your Potency).</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+3 Spirituality:</strong> If the corpse died within the last minute, casting time becomes 1 action and question count increases by +Potency.</li><li><strong>+6 Spirituality:</strong> Summon the questioned soul as a shade scout for 1 hour (cannot attack, can pass through cracks, shares senses with you out to 1 mile).</li><li><strong>+9 Spirituality:</strong> Bind a grave-prayer link for 24 hours. Once during that time, when a linked supplicant calls your title in prayer within 5 miles, you may answer with a whisper and grant either temporary HP equal to <strong>2 x Potency</strong> or end frightened/charmed on that supplicant.</li></ul><p><em>Counterplay:</em> sealed tomb wards, soul-silencing contracts, and rival death authority can block the rite.</p><p><em>Corruption Hook:</em> repeatedly delaying a soul\'s repose for personal convenience can add 1 Corruption.</p>',
          chat: ''
        },
        source: {
          custom: '',
          rules: '2024',
          revision: 1,
          license: '',
          book: 'LoTM Core'
        },
        activation: { type: 'minute', condition: '', value: 10 },
        duration: { value: '10', units: 'minute' },
        target: {
          affects: {
            choice: false,
            count: '1',
            type: 'creature',
            special: 'corpse and one allied beneficiary'
          },
          template: { units: '', contiguous: false, type: '' }
        },
        range: { units: 'touch', value: null, special: '' },
        uses: { max: '', spent: 0, recovery: [] },
        level: 7,
        school: 'div',
        properties: ['vocal', 'somatic'],
        materials: {
          value: 'a grave candle made from funeral wax',
          consumed: false,
          cost: 0,
          supply: 0
        },
        preparation: { mode: 'always', prepared: false },
        activities: {
          corpseSeq2Act004: {
            type: 'utility',
            _id: 'corpseSeq2Act004',
            sort: 0,
            activation: { type: 'minute', value: 10, override: false },
            consumption: { scaling: { allowed: false }, spellSlot: true, targets: [] },
            description: { chatFlavor: '' },
            duration: { units: 'minute', concentration: false, override: false },
            effects: [],
            range: { override: false },
            target: {
              template: { contiguous: false, units: 'ft' },
              affects: { choice: false },
              override: false,
              prompt: true
            },
            uses: { spent: 0, recovery: [], max: '' },
            roll: { prompt: false, visible: false, name: '', formula: '' },
            name: '',
            img: '',
            appliedEffects: []
          }
        },
        identifier: 'lotm-corpse-collector-soul-shepherding',
        method: 'spell',
        prepared: 1,
        spiritualityCost: null,
        sourceClass: 'lotm-corpse-collector'
      },
      effects: [],
      folder: 'zFhCGCq7OxUkeaTp',
      flags: {
        dnd5e: { riders: { activity: [], effect: [] } },
        lotm: { sourceBook: 'LoTM Core', grantedSequence: 2 }
      },
      _stats: newStats(now + 8),
      sort: 2100703,
      ownership: { default: 0 }
    }
  ];

  for (const doc of docs) {
    await abilitiesDb.put(`!items!${doc._id}`, JSON.stringify(doc));
  }

  await pathwaysDb.close();
  await abilitiesDb.close();

  console.log(JSON.stringify({
    updatedPathway: pathwayKey,
    updatedFolder: folderKey,
    updatedLegacy: [ferrymanKey, deathGazeKey],
    wroteAbilities: docs.map(d => `!items!${d._id}`)
  }, null, 2));
})();
