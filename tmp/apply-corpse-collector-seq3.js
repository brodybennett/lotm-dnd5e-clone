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
  pathway.system.description.value = '<p><strong>Pathway Vector:</strong> solemn stewardship of corpses, spirit perception, and measured decay that treats death as inevitable order rather than panic or spectacle.</p><p><strong>Sequence 9 Package (Total Budget 2):</strong> Undead Physique, Spirit Vision.</p><p><strong>Sequence 8 Package (Gain Budget +3):</strong> Death Eyes, Grave Whisper, plus one legacy scope upgrade to Spirit Vision.</p><p><strong>Sequence 7 Package (Gain Budget +13):</strong> Spirit Channelling, Spirit Affinity, Zombie Disguise, plus two legacy upgrades (Undead Physique and Grave Whisper).</p><p><strong>Sequence 6 Package (Gain Budget +9):</strong> Language of the Dead, Resurrection, Knowledge of Spirit World, plus two legacy upgrades (Spirit Channelling and Death Eyes).</p><p><strong>Sequence 5 Package (Gain Budget +13):</strong> Door to the Underworld, Internal Underworld, Death Envoy, plus two legacy upgrades (Resurrection and Knowledge of Spirit World).</p><p><strong>Sequence 4 Package (Gain Budget +33):</strong> Reincarnation, Underworld Authority, Spirit World Traversal, Sealing Edict, plus two legacy upgrades (Door to the Underworld and Language of the Dead).</p><p><strong>Sequence 3 Package (Gain Budget +20):</strong> Hands of Life and Death, Ferryman, Death Gaze, Styx Afloat, plus two legacy upgrades (Reincarnation and Underworld Authority).</p><p><strong>Sequence 2-0 Status:</strong> Pending authoring in later sequence-focused runs.</p><p><strong>Continuity Anchor:</strong> At Sequence 3 (Ferryman), death authority becomes immediate and directional: touch, gaze, and passage across the river of death are all enforceable under ritual calm.</p>';
  pathway._stats = touchStats(pathway._stats, now + 1);
  await pathwaysDb.put(pathwayKey, JSON.stringify(pathway));

  const folderKey = '!folders!zFhCGCq7OxUkeaTp';
  const folder = JSON.parse(await abilitiesDb.get(folderKey));
  folder.description = 'Sequence abilities for the Corpse Collector pathway (authored through Sequence 3).';
  folder.flags = folder.flags ?? {};
  folder.flags.lotm = {
    ...(folder.flags.lotm ?? {}),
    pathwayIdentifier: 'lotm-corpse-collector',
    latestAuthoredSequence: 3
  };
  folder._stats = touchStats(folder._stats, now + 2);
  await abilitiesDb.put(folderKey, JSON.stringify(folder));

  const reincarnationKey = '!items!lotmAbilityC4001';
  const reincarnation = JSON.parse(await abilitiesDb.get(reincarnationKey));
  appendLegacyBlock(
    reincarnation,
    '<h3>Legacy Upgrade (Sequence 3 - Efficiency)</h3>',
    '<p>At Sequence 3, Reincarnation no longer resets you into helpless amnesia in ordinary combat rhythm. When Reincarnation triggers, you retain tactical memory and pathway identity for the rest of the scene. In addition, once per long rest, if you would fail a death save while your return-state is active, you may instead count it as a success and immediately move up to 10 feet without provoking opportunity attacks. If cast with at least <strong>+2 Spirituality</strong>, one ally within 30 feet gains advantage on its next death save.</p>'
  );
  reincarnation._stats = touchStats(reincarnation._stats, now + 3);
  await abilitiesDb.put(reincarnationKey, JSON.stringify(reincarnation));

  const authorityKey = '!items!lotmAbilityC4002';
  const authority = JSON.parse(await abilitiesDb.get(authorityKey));
  appendLegacyBlock(
    authority,
    '<h3>Legacy Upgrade (Sequence 3 - Potency)</h3>',
    '<p>At Sequence 3, Underworld Authority can imprint ferryman death pressure into its zone. While your jurisdiction is active, hostile creatures that fail a save against your stance effects also suffer one ferryman mark until end of your next turn: they lose 10 feet speed and cannot regain hit points. If cast with at least <strong>+2 Spirituality</strong>, the first marked target each round also takes necrotic damage equal to your Potency when it starts its turn in the zone.</p>'
  );
  authority._stats = touchStats(authority._stats, now + 4);
  await abilitiesDb.put(authorityKey, JSON.stringify(authority));

  const docs = [
    {
      _id: 'lotmAbilityC3001',
      name: 'Hands of Life and Death',
      type: 'spell',
      img: 'icons/magic/death/hand-undead-skeleton-fire-green.webp',
      system: {
        description: {
          value: '<p><strong>Baseline (0 Spirituality):</strong> As an action, choose one creature within 10 feet and declare either the Left Hand (Death) or Right Hand (Life). Left Hand: target makes a Constitution save; on failure it takes necrotic damage equal to <strong>2 x Potency</strong> and cannot regain hit points until the start of your next turn. Right Hand: restore hit points to a living target equal to your Potency and end one mundane bleeding or poison effect.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+2 Spirituality:</strong> Range becomes 30 feet and you may resolve one Left Hand and one Right Hand effect in the same action against two different targets.</li><li><strong>+4 Spirituality:</strong> Left Hand additionally inflicts wither (-10 speed and disadvantage on Strength checks) until end of target\'s next turn. Right Hand additionally grants temporary HP equal to your Potency.</li><li><strong>+6 Spirituality:</strong> If a Left Hand target fails by 5 or more and is below <strong>3 x Potency</strong> HP after damage, it drops to 0 HP. If a Right Hand target is at 0 HP, it rises to 1 HP before receiving the heal.</li></ul><p><em>Counterplay:</em> purification powers, consecrated barriers, and anti-necrotic seals can blunt Left Hand effects.</p><p><em>Corruption Hook:</em> deciding life-or-death touch for vanity or cruelty instead of necessity can add 1 Corruption.</p>',
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
            special: 'living or spirit-bearing creature'
          },
          template: { units: '', contiguous: false, type: '' }
        },
        range: { units: 'ft', value: '10', special: '' },
        uses: { max: '', spent: 0, recovery: [] },
        level: 6,
        school: 'nec',
        properties: ['vocal', 'somatic'],
        materials: {
          value: 'a paired black-and-white grave ring',
          consumed: false,
          cost: 0,
          supply: 0
        },
        preparation: { mode: 'always', prepared: false },
        activities: {
          corpseSeq3Act001: {
            type: 'utility',
            _id: 'corpseSeq3Act001',
            sort: 0,
            activation: { type: 'action', value: null, override: false },
            consumption: {
              scaling: { allowed: false },
              spellSlot: true,
              targets: []
            },
            description: { chatFlavor: '' },
            duration: {
              units: 'inst',
              concentration: false,
              override: false
            },
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
        identifier: 'lotm-corpse-collector-hands-of-life-and-death',
        method: 'spell',
        prepared: 1,
        spiritualityCost: null,
        sourceClass: 'lotm-corpse-collector'
      },
      effects: [],
      folder: 'zFhCGCq7OxUkeaTp',
      flags: {
        dnd5e: { riders: { activity: [], effect: [] } },
        lotm: { sourceBook: 'LoTM Core', grantedSequence: 3 }
      },
      _stats: newStats(now + 5),
      sort: 2100600,
      ownership: { default: 0 }
    },
    {
      _id: 'lotmAbilityC3002',
      name: 'Ferryman',
      type: 'spell',
      img: 'icons/magic/death/boat-ferry-ghostly-blue.webp',
      system: {
        description: {
          value: '<p><strong>Baseline (0 Spirituality):</strong> As a bonus action, assume ferryman state for 10 minutes (concentration). You gain resistance to non-purification damage from mundane attacks, can stand and move across liquids or spirit currents without sinking, and ignore difficult terrain caused by corpse-mire, grave fog, and spirit residue. While active, you gain advantage on checks against forced movement.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+2 Spirituality:</strong> Gain +20 feet movement and you may bring one willing ally within 10 feet along your liquid/spirit-surface movement benefits.</li><li><strong>+4 Spirituality:</strong> Once per round when you move at least 15 feet, create a ferryman wake in your path. Enemies crossing that wake before your next turn must make a Strength save or have speed halved until end of turn.</li><li><strong>+6 Spirituality:</strong> Once during duration, become half-incorporeal until the end of your turn: move through occupied spaces and non-magical barriers as difficult terrain.</li></ul><p><em>Counterplay:</em> purification and sunlight-aligned authority can suppress ferryman resistances.</p><p><em>Corruption Hook:</em> repeatedly choosing the river over the living world to avoid accountability can add 1 Corruption.</p>',
          chat: ''
        },
        source: {
          custom: '',
          rules: '2024',
          revision: 1,
          license: '',
          book: 'LoTM Core'
        },
        activation: { type: 'bonus', condition: '', value: null },
        duration: { value: '10', units: 'minute' },
        target: {
          affects: { choice: false, count: '1', type: 'self', special: '' },
          template: { units: '', contiguous: false, type: '' }
        },
        range: { units: 'self', value: null, special: '' },
        uses: { max: '', spent: 0, recovery: [] },
        level: 6,
        school: 'nec',
        properties: ['vocal', 'somatic', 'concentration'],
        materials: {
          value: 'a coin for the dead tied with black thread',
          consumed: false,
          cost: 0,
          supply: 0
        },
        preparation: { mode: 'always', prepared: false },
        activities: {
          corpseSeq3Act002: {
            type: 'utility',
            _id: 'corpseSeq3Act002',
            sort: 0,
            activation: { type: 'bonus', value: null, override: false },
            consumption: {
              scaling: { allowed: false },
              spellSlot: true,
              targets: []
            },
            description: { chatFlavor: '' },
            duration: {
              units: 'minute',
              concentration: false,
              override: false
            },
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
        identifier: 'lotm-corpse-collector-ferryman',
        method: 'spell',
        prepared: 1,
        spiritualityCost: null,
        sourceClass: 'lotm-corpse-collector'
      },
      effects: [],
      folder: 'zFhCGCq7OxUkeaTp',
      flags: {
        dnd5e: { riders: { activity: [], effect: [] } },
        lotm: { sourceBook: 'LoTM Core', grantedSequence: 3 }
      },
      _stats: newStats(now + 6),
      sort: 2100601,
      ownership: { default: 0 }
    },
    {
      _id: 'lotmAbilityC3003',
      name: 'Death Gaze',
      type: 'spell',
      img: 'icons/magic/perception/eye-ringed-red.webp',
      system: {
        description: {
          value: '<p><strong>Baseline (0 Spirituality):</strong> As an action, fix your gaze on one creature within 60 feet that can see you. It makes a Constitution save. On a failure, it takes necrotic damage equal to <strong>2 x Potency</strong>, has speed reduced by 10 feet, and cannot regain hit points until the start of your next turn.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+2 Spirituality:</strong> Target up to two creatures that can see you; resolve saves separately.</li><li><strong>+4 Spirituality:</strong> Duration becomes 1 minute (concentration). Once per round, one marked target repeats the save; on failure, reapply baseline wither effects.</li><li><strong>+6 Spirituality:</strong> If a target fails by 5 or more and has current HP at or below <strong>3 x Potency</strong> after damage, it drops to 0 HP.</li></ul><p><em>Counterplay:</em> blinded sightlines, mirrored wards, and purification halos can disrupt the gaze lock.</p><p><em>Corruption Hook:</em> using this gaze for ritual execution outside just cause can add 1 Corruption.</p>',
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
            special: 'creature that can see you'
          },
          template: { units: '', contiguous: false, type: '' }
        },
        range: { units: 'ft', value: '60', special: '' },
        uses: { max: '', spent: 0, recovery: [] },
        level: 6,
        school: 'nec',
        properties: ['vocal', 'somatic', 'concentration'],
        materials: {
          value: 'a black-glass eye charm',
          consumed: false,
          cost: 0,
          supply: 0
        },
        preparation: { mode: 'always', prepared: false },
        activities: {
          corpseSeq3Act003: {
            type: 'utility',
            _id: 'corpseSeq3Act003',
            sort: 0,
            activation: { type: 'action', value: null, override: false },
            consumption: {
              scaling: { allowed: false },
              spellSlot: true,
              targets: []
            },
            description: { chatFlavor: '' },
            duration: {
              units: 'inst',
              concentration: false,
              override: false
            },
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
        identifier: 'lotm-corpse-collector-death-gaze',
        method: 'spell',
        prepared: 1,
        spiritualityCost: null,
        sourceClass: 'lotm-corpse-collector'
      },
      effects: [],
      folder: 'zFhCGCq7OxUkeaTp',
      flags: {
        dnd5e: { riders: { activity: [], effect: [] } },
        lotm: { sourceBook: 'LoTM Core', grantedSequence: 3 }
      },
      _stats: newStats(now + 7),
      sort: 2100602,
      ownership: { default: 0 }
    },
    {
      _id: 'lotmAbilityC3004',
      name: 'Styx Afloat',
      type: 'spell',
      img: 'icons/magic/water/waves-flowing-blue.webp',
      system: {
        description: {
          value: '<p><strong>Baseline (0 Spirituality):</strong> As a bonus action, conjure a narrow spectral current for 1 minute (concentration) connecting you to a point within 40 feet. You and one ally can move along that current as if walking stable ground over liquids, pits, or corpse-choked hazards. Crossing the current grants advantage on checks against being knocked prone or pulled by environmental suction.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+2 Spirituality:</strong> Current length becomes 80 feet and can support up to three allies at once.</li><li><strong>+4 Spirituality:</strong> Enemies crossing the current must make a Strength save or be pulled 10 feet toward your chosen endpoint.</li><li><strong>+6 Spirituality:</strong> For 1 minute, while the current exists, once per round you may shift one supported ally up to 20 feet along it as a reaction when they are targeted by an attack.</li></ul><p><em>Counterplay:</em> anti-mobility seals and broken line-of-effect can collapse portions of the spectral current.</p><p><em>Corruption Hook:</em> using Styx routes to bypass funerary sanctity for selfish gain can add 1 Corruption.</p>',
          chat: ''
        },
        source: {
          custom: '',
          rules: '2024',
          revision: 1,
          license: '',
          book: 'LoTM Core'
        },
        activation: { type: 'bonus', condition: '', value: null },
        duration: { value: '1', units: 'minute' },
        target: {
          affects: { choice: false, count: '1', type: 'self', special: '' },
          template: { units: 'ft', contiguous: false, type: 'line' }
        },
        range: { units: 'ft', value: '40', special: '' },
        uses: { max: '', spent: 0, recovery: [] },
        level: 6,
        school: 'con',
        properties: ['vocal', 'somatic', 'concentration'],
        materials: {
          value: 'a vial of dark river water',
          consumed: false,
          cost: 0,
          supply: 0
        },
        preparation: { mode: 'always', prepared: false },
        activities: {
          corpseSeq3Act004: {
            type: 'utility',
            _id: 'corpseSeq3Act004',
            sort: 0,
            activation: { type: 'bonus', value: null, override: false },
            consumption: {
              scaling: { allowed: false },
              spellSlot: true,
              targets: []
            },
            description: { chatFlavor: '' },
            duration: {
              units: 'minute',
              concentration: false,
              override: false
            },
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
        identifier: 'lotm-corpse-collector-styx-afloat',
        method: 'spell',
        prepared: 1,
        spiritualityCost: null,
        sourceClass: 'lotm-corpse-collector'
      },
      effects: [],
      folder: 'zFhCGCq7OxUkeaTp',
      flags: {
        dnd5e: { riders: { activity: [], effect: [] } },
        lotm: { sourceBook: 'LoTM Core', grantedSequence: 3 }
      },
      _stats: newStats(now + 8),
      sort: 2100603,
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
    updatedLegacy: [reincarnationKey, authorityKey],
    wroteAbilities: docs.map(d => `!items!${d._id}`)
  }, null, 2));
})();
