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
  pathway.system.description.value = '<p><strong>Pathway Vector:</strong> solemn stewardship of corpses, spirit perception, and measured decay that treats death as inevitable order rather than panic or spectacle.</p><p><strong>Sequence 9 Package (Total Budget 2):</strong> Undead Physique, Spirit Vision.</p><p><strong>Sequence 8 Package (Gain Budget +3):</strong> Death Eyes, Grave Whisper, plus one legacy scope upgrade to Spirit Vision.</p><p><strong>Sequence 7 Package (Gain Budget +13):</strong> Spirit Channelling, Spirit Affinity, Zombie Disguise, plus two legacy upgrades (Undead Physique and Grave Whisper).</p><p><strong>Sequence 6 Package (Gain Budget +9):</strong> Language of the Dead, Resurrection, Knowledge of Spirit World, plus two legacy upgrades (Spirit Channelling and Death Eyes).</p><p><strong>Sequence 5 Package (Gain Budget +13):</strong> Door to the Underworld, Internal Underworld, Death Envoy, plus two legacy upgrades (Resurrection and Knowledge of Spirit World).</p><p><strong>Sequence 4 Package (Gain Budget +33):</strong> Reincarnation, Underworld Authority, Spirit World Traversal, Sealing Edict, plus two legacy upgrades (Door to the Underworld and Language of the Dead).</p><p><strong>Sequence 3-0 Status:</strong> Pending authoring in later sequence-focused runs.</p><p><strong>Continuity Anchor:</strong> At Sequence 4 (Undying), the pathway enters saint-level authority: death no longer ends your role cleanly, Underworld passage becomes controllable terrain, and sealing judgments can lock spiritual vectors in place.</p>';
  pathway._stats = touchStats(pathway._stats, now + 1);
  await pathwaysDb.put(pathwayKey, JSON.stringify(pathway));

  const folderKey = '!folders!zFhCGCq7OxUkeaTp';
  const folder = JSON.parse(await abilitiesDb.get(folderKey));
  folder.description = 'Sequence abilities for the Corpse Collector pathway (authored through Sequence 4).';
  folder.flags = folder.flags ?? {};
  folder.flags.lotm = {
    ...(folder.flags.lotm ?? {}),
    pathwayIdentifier: 'lotm-corpse-collector',
    latestAuthoredSequence: 4
  };
  folder._stats = touchStats(folder._stats, now + 2);
  await abilitiesDb.put(folderKey, JSON.stringify(folder));

  const doorKey = '!items!lotmAbilityC5001';
  const door = JSON.parse(await abilitiesDb.get(doorKey));
  appendLegacyBlock(
    door,
    '<h3>Legacy Upgrade (Sequence 4 - Scope)</h3>',
    '<p>At Sequence 4, Door to the Underworld can shape a favorable battlefield around the threshold. When cast with at least <strong>+4 Spirituality</strong>, designate a 20-foot gatefield: enemies treat it as difficult terrain and take a -2 penalty to checks to escape forced movement from your Death Pathway abilities, while your controlled undead ignore that difficult terrain. Once per short rest, if ambient remains or grave-soil is present, you may call one minor underworld attendant to occupy one space in the gatefield for 3 rounds as a blocker and scout.</p>'
  );
  door._stats = touchStats(door._stats, now + 3);
  await abilitiesDb.put(doorKey, JSON.stringify(door));

  const languageKey = '!items!lotmAbilityC6001';
  const language = JSON.parse(await abilitiesDb.get(languageKey));
  appendLegacyBlock(
    language,
    '<h3>Legacy Upgrade (Sequence 4 - Potency)</h3>',
    '<p>At Sequence 4, Language of the Dead gains a withering command pattern. When a target fails its save against Language of the Dead, you may inflict one wither rider until the end of its next turn: -10 feet speed, disadvantage on Strength checks, or reduced healing received by an amount equal to your Potency (minimum 1). If cast with at least <strong>+2 Spirituality</strong>, choose two different wither riders instead of one. Undead and spirit targets failing by 5 or more also lose resistance to necrotic damage until start of your next turn.</p>'
  );
  language._stats = touchStats(language._stats, now + 4);
  await abilitiesDb.put(languageKey, JSON.stringify(language));

  const docs = [
    {
      _id: 'lotmAbilityC4001',
      name: 'Reincarnation',
      type: 'spell',
      img: 'icons/magic/death/ghosts-trio-blue.webp',
      system: {
        description: {
          value: '<p><strong>Baseline (0 Spirituality):</strong> As a reaction when you would drop to 0 HP, trigger a delayed return state instead of falling unconscious. You remain standing as a spirit-threaded shell until the end of your next turn; during this state you cannot regain HP but you can move up to half speed and take one action or bonus action (not both). At the end of that turn, if your body remains intact, you return to 1 HP and gain temporary HP equal to your Potency. This reaction can trigger once per long rest.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+2 Spirituality:</strong> Return HP becomes Potency instead of 1, and you may move full speed during the delayed return state.</li><li><strong>+4 Spirituality:</strong> If an ally is within 30 feet when you return, that ally may immediately end one fear or charm effect on itself.</li><li><strong>+6 Spirituality:</strong> If your body is reduced to 0 HP again before your next short rest, you may make one final spirit-action before collapse, then stabilize automatically at the end of the turn.</li></ul><p><em>Counterplay:</em> total body destruction, anti-resurrection seals, or underworld severance effects can prevent return.</p><p><em>Corruption Hook:</em> repeatedly treating death as disposable and neglecting ritual closure can add 1 Corruption.</p>',
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
          type: 'reaction',
          condition: 'when reduced to 0 HP',
          value: null
        },
        duration: {
          value: '1',
          units: 'round'
        },
        target: {
          affects: {
            choice: false,
            count: '1',
            type: 'self',
            special: ''
          },
          template: {
            units: '',
            contiguous: false,
            type: ''
          }
        },
        range: {
          units: 'self',
          value: null,
          special: ''
        },
        uses: {
          max: '1',
          spent: 0,
          recovery: [{ period: 'lr', type: 'recoverAll' }]
        },
        level: 5,
        school: 'nec',
        properties: ['vocal', 'somatic'],
        materials: {
          value: 'a death-mark talisman keyed to your spirit',
          consumed: false,
          cost: 0,
          supply: 0
        },
        preparation: {
          mode: 'always',
          prepared: false
        },
        activities: {
          corpseSeq4Act001: {
            type: 'utility',
            _id: 'corpseSeq4Act001',
            sort: 0,
            activation: {
              type: 'reaction',
              value: null,
              override: false
            },
            consumption: {
              scaling: { allowed: false },
              spellSlot: true,
              targets: []
            },
            description: { chatFlavor: '' },
            duration: {
              units: 'round',
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
            roll: {
              prompt: false,
              visible: false,
              name: '',
              formula: ''
            },
            name: '',
            img: '',
            appliedEffects: []
          }
        },
        identifier: 'lotm-corpse-collector-reincarnation',
        method: 'spell',
        prepared: 1,
        spiritualityCost: null,
        sourceClass: 'lotm-corpse-collector'
      },
      effects: [],
      folder: 'zFhCGCq7OxUkeaTp',
      flags: {
        dnd5e: { riders: { activity: [], effect: [] } },
        lotm: { sourceBook: 'LoTM Core', grantedSequence: 4 }
      },
      _stats: newStats(now + 5),
      sort: 2100500,
      ownership: { default: 0 }
    },
    {
      _id: 'lotmAbilityC4002',
      name: 'Underworld Authority',
      type: 'spell',
      img: 'icons/magic/death/skull-portal-purple.webp',
      system: {
        description: {
          value: '<p><strong>Baseline (0 Spirituality):</strong> As an action, proclaim local underworld jurisdiction in a 20-foot radius within 60 feet for 1 minute (concentration). Choose one authority stance on cast: <strong>Seize</strong> (hostile spirits/undead in zone make Wisdom save or have speed halved), <strong>Silence</strong> (creatures in zone have disadvantage on checks to cast or sustain spirit-linked magic), or <strong>Escort</strong> (allies you designate ignore difficult terrain and gain advantage on checks to resist fear while in zone).</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+2 Spirituality:</strong> Radius increases to 30 feet and you may switch stance once during duration.</li><li><strong>+4 Spirituality:</strong> Apply two stances at once; each target only rolls once per round against both effects.</li><li><strong>+6 Spirituality:</strong> Once during duration, force all hostile spirits/undead in zone to make a Charisma save. On failure, they are restrained by underworld chains until start of your next turn.</li></ul><p><em>Counterplay:</em> superior authority, sanctified territory, and anti-domain effects can contest or collapse your jurisdiction zone.</p><p><em>Corruption Hook:</em> imposing authority to dominate neutral spirits rather than maintain order can add 1 Corruption.</p>',
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
        duration: { value: '1', units: 'minute' },
        target: {
          affects: {
            choice: false,
            count: '1',
            type: 'creature',
            special: 'creatures in declared jurisdiction'
          },
          template: { units: 'ft', contiguous: false, type: 'radius' }
        },
        range: { units: 'ft', value: '60', special: '' },
        uses: { max: '', spent: 0, recovery: [] },
        level: 5,
        school: 'nec',
        properties: ['vocal', 'somatic', 'concentration'],
        materials: {
          value: 'a black warrant sigil',
          consumed: false,
          cost: 0,
          supply: 0
        },
        preparation: { mode: 'always', prepared: false },
        activities: {
          corpseSeq4Act002: {
            type: 'utility',
            _id: 'corpseSeq4Act002',
            sort: 0,
            activation: { type: 'action', value: null, override: false },
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
            roll: {
              prompt: false,
              visible: false,
              name: '',
              formula: ''
            },
            name: '',
            img: '',
            appliedEffects: []
          }
        },
        identifier: 'lotm-corpse-collector-underworld-authority',
        method: 'spell',
        prepared: 1,
        spiritualityCost: null,
        sourceClass: 'lotm-corpse-collector'
      },
      effects: [],
      folder: 'zFhCGCq7OxUkeaTp',
      flags: {
        dnd5e: { riders: { activity: [], effect: [] } },
        lotm: { sourceBook: 'LoTM Core', grantedSequence: 4 }
      },
      _stats: newStats(now + 6),
      sort: 2100501,
      ownership: { default: 0 }
    },
    {
      _id: 'lotmAbilityC4003',
      name: 'Spirit World Traversal',
      type: 'spell',
      img: 'icons/magic/movement/trail-streak-zigzag-purple.webp',
      system: {
        description: {
          value: '<p><strong>Baseline (0 Spirituality):</strong> As a bonus action, step through the overlapping Spirit World and reappear in an unoccupied space you can see within 60 feet. This movement does not provoke opportunity attacks. Until start of your next turn, you gain advantage on checks to avoid difficult terrain and environmental hazards linked to grave fog, darkness, or spirit residue.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+2 Spirituality:</strong> Range becomes 120 feet. You may carry one willing ally within 5 feet to a space within 10 feet of your destination.</li><li><strong>+4 Spirituality:</strong> After reappearing, choose one creature within 10 feet. It makes a Wisdom save or loses reactions until the start of your next turn.</li><li><strong>+6 Spirituality:</strong> For 1 minute, you may repeat the baseline traversal once per round as a bonus action (concentration).</li></ul><p><em>Counterplay:</em> sealed spirit barriers, anti-teleport fields, and active underworld interdiction can block traversal points.</p><p><em>Corruption Hook:</em> repeated spirit-skipping through protected funerary grounds for convenience may add 1 Corruption.</p>',
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
        duration: { value: '1', units: 'round' },
        target: {
          affects: {
            choice: false,
            count: '1',
            type: 'self',
            special: ''
          },
          template: { units: '', contiguous: false, type: '' }
        },
        range: { units: 'ft', value: '60', special: '' },
        uses: { max: '', spent: 0, recovery: [] },
        level: 5,
        school: 'con',
        properties: ['vocal', 'somatic', 'concentration'],
        materials: {
          value: 'a spirit-road compass',
          consumed: false,
          cost: 0,
          supply: 0
        },
        preparation: { mode: 'always', prepared: false },
        activities: {
          corpseSeq4Act003: {
            type: 'utility',
            _id: 'corpseSeq4Act003',
            sort: 0,
            activation: { type: 'bonus', value: null, override: false },
            consumption: {
              scaling: { allowed: false },
              spellSlot: true,
              targets: []
            },
            description: { chatFlavor: '' },
            duration: {
              units: 'round',
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
            roll: {
              prompt: false,
              visible: false,
              name: '',
              formula: ''
            },
            name: '',
            img: '',
            appliedEffects: []
          }
        },
        identifier: 'lotm-corpse-collector-spirit-world-traversal',
        method: 'spell',
        prepared: 1,
        spiritualityCost: null,
        sourceClass: 'lotm-corpse-collector'
      },
      effects: [],
      folder: 'zFhCGCq7OxUkeaTp',
      flags: {
        dnd5e: { riders: { activity: [], effect: [] } },
        lotm: { sourceBook: 'LoTM Core', grantedSequence: 4 }
      },
      _stats: newStats(now + 7),
      sort: 2100502,
      ownership: { default: 0 }
    },
    {
      _id: 'lotmAbilityC4004',
      name: 'Sealing Edict',
      type: 'spell',
      img: 'icons/magic/symbols/rune-sigil-black-purple.webp',
      system: {
        description: {
          value: '<p><strong>Baseline (0 Spirituality):</strong> As an action, place an underworld seal on one creature, object, or doorway within 60 feet for 1 minute (concentration). Choose one seal mode: <strong>Transit Seal</strong> (target cannot teleport or phase through barriers), <strong>Voice Seal</strong> (target cannot use verbal components), or <strong>Spirit Seal</strong> (target cannot summon or command new spirits/undead). The target may make a Charisma save at the end of each of its turns to end the seal.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+2 Spirituality:</strong> Apply two different seal modes to the same target.</li><li><strong>+4 Spirituality:</strong> Affect up to two targets within 20 feet of each other.</li><li><strong>+6 Spirituality:</strong> Seal duration becomes 10 minutes; each target only repeats its end-of-turn save every other round instead of every round.</li></ul><p><em>Counterplay:</em> superior sequence authority, seal-breaking rituals, or sacred adjudication effects can nullify the edict.</p><p><em>Corruption Hook:</em> indiscriminate sealing of neutral souls or sanctuaries for control can add 1 Corruption.</p>',
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
        duration: { value: '1', units: 'minute' },
        target: {
          affects: {
            choice: false,
            count: '1',
            type: 'creature',
            special: 'creature, object, or doorway'
          },
          template: { units: '', contiguous: false, type: '' }
        },
        range: { units: 'ft', value: '60', special: '' },
        uses: { max: '', spent: 0, recovery: [] },
        level: 5,
        school: 'abj',
        properties: ['vocal', 'somatic', 'concentration'],
        materials: {
          value: 'a wax seal stamped with your pathway mark',
          consumed: false,
          cost: 0,
          supply: 0
        },
        preparation: { mode: 'always', prepared: false },
        activities: {
          corpseSeq4Act004: {
            type: 'utility',
            _id: 'corpseSeq4Act004',
            sort: 0,
            activation: { type: 'action', value: null, override: false },
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
            roll: {
              prompt: false,
              visible: false,
              name: '',
              formula: ''
            },
            name: '',
            img: '',
            appliedEffects: []
          }
        },
        identifier: 'lotm-corpse-collector-sealing-edict',
        method: 'spell',
        prepared: 1,
        spiritualityCost: null,
        sourceClass: 'lotm-corpse-collector'
      },
      effects: [],
      folder: 'zFhCGCq7OxUkeaTp',
      flags: {
        dnd5e: { riders: { activity: [], effect: [] } },
        lotm: { sourceBook: 'LoTM Core', grantedSequence: 4 }
      },
      _stats: newStats(now + 8),
      sort: 2100503,
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
    updatedLegacy: [doorKey, languageKey],
    wroteAbilities: docs.map(d => `!items!${d._id}`)
  }, null, 2));
})();
