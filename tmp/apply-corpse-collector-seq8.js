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

(async () => {
  const now = Date.now();

  const pathwaysDb = new ClassicLevel('packs/lotm_pathways', { valueEncoding: 'utf8' });
  const abilitiesDb = new ClassicLevel('packs/lotm_abilities', { valueEncoding: 'utf8' });

  await pathwaysDb.open();
  await abilitiesDb.open();

  const pathwayKey = '!items!lotmPathway00010';
  const rawPathway = await pathwaysDb.get(pathwayKey);
  const pathway = JSON.parse(rawPathway);
  pathway.system.description.value = '<p><strong>Pathway Vector:</strong> solemn stewardship of corpses, spirit perception, and measured decay that treats death as inevitable order rather than panic or spectacle.</p><p><strong>Sequence 9 Package (Total Budget 2):</strong> Undead Physique, Spirit Vision.</p><p><strong>Sequence 8 Package (Gain Budget +3):</strong> Death Eyes, Grave Whisper, plus one legacy scope upgrade to Spirit Vision.</p><p><strong>Sequence 7-0 Status:</strong> Pending authoring in later sequence-focused runs.</p><p><strong>Continuity Anchor:</strong> At Sequence 8 (Gravedigger), the pathway moves from sensing death into deliberate interaction with wandering spirits and targeted exploitation of deathly weak points.</p>';
  pathway._stats = touchStats(pathway._stats, now + 1);
  await pathwaysDb.put(pathwayKey, JSON.stringify(pathway));

  const folderKey = '!folders!zFhCGCq7OxUkeaTp';
  const rawFolder = await abilitiesDb.get(folderKey);
  const folder = JSON.parse(rawFolder);
  folder.description = 'Sequence abilities for the Corpse Collector pathway (authored through Sequence 8).';
  folder.flags = folder.flags ?? {};
  folder.flags.lotm = {
    ...(folder.flags.lotm ?? {}),
    pathwayIdentifier: 'lotm-corpse-collector',
    latestAuthoredSequence: 8
  };
  folder._stats = touchStats(folder._stats, now + 2);
  await abilitiesDb.put(folderKey, JSON.stringify(folder));

  const spiritVisionKey = '!items!lotmAbilityC9002';
  const rawSpiritVision = await abilitiesDb.get(spiritVisionKey);
  const spiritVision = JSON.parse(rawSpiritVision);
  const legacyHeader = '<h3>Legacy Upgrade (Sequence 8 - Scope)</h3>';
  if (!String(spiritVision.system?.description?.value ?? '').includes(legacyHeader)) {
    spiritVision.system.description.value += `${legacyHeader}<p>At Sequence 8, Spirit Vision can compare linked death traces in one pass. When you cast Spirit Vision with at least <strong>+1 Spirituality</strong>, choose one secondary linked target within 10 feet of the primary target (corpse-object, spirit-remnant, or dual scene marker) and resolve a second read. If both reads succeed, extract one comparative deduction (tampered timeline, planted residue seam, or route contradiction). You and one ally within 30 feet each gain the resulting <strong>+1d4</strong> follow-up die. Once per short rest, this comparative rider can be applied without paying the +1 surcharge.</p>`;
  }
  spiritVision._stats = touchStats(spiritVision._stats, now + 3);
  await abilitiesDb.put(spiritVisionKey, JSON.stringify(spiritVision));

  const abilities = [
    {
      _id: 'lotmAbilityC8001',
      name: 'Death Eyes',
      type: 'spell',
      img: 'icons/magic/perception/eye-ringed-red.webp',
      system: {
        description: {
          value: '<p><strong>Baseline (0 Spirituality):</strong> As an action, focus your gaze on one creature within 60 feet for up to 1 minute (concentration). You perceive death-aligned fractures in flesh, spirit shell, or animating force. The first time each turn you or an ally hits that target, add <strong>+1 necrotic damage</strong>. If the target is undead or an incorporeal spirit, the attacker gains advantage on one check this turn to resist that target\'s fear, possession, or paralysis effects.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Mark up to two creatures; against undead/spirits, the damage rider becomes <strong>+Potency</strong>.</li><li><strong>+2 Spirituality:</strong> Once during duration, force one marked target to make a Constitution save. On failure, it loses resistance to necrotic damage until the start of your next turn.</li><li><strong>+4 Spirituality:</strong> Duration becomes 10 minutes, and once per round when a marked target would turn invisible or enter incorporeal movement, you may use your reaction to reveal its outline until end of turn.</li></ul><p><em>Counterplay:</em> heavy radiant sanctification, anti-divination veils, and targets with no biological/spiritual weak-point anatomy can reduce efficacy.</p><p><em>Corruption Hook:</em> if you repeatedly use Death Eyes to desecrate the dying rather than finish battle quickly, gain 1 Corruption.</p>',
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
          type: 'action',
          condition: '',
          value: null
        },
        duration: {
          value: '1',
          units: 'minute'
        },
        target: {
          affects: {
            choice: false,
            count: '1',
            type: 'creature',
            special: 'creature in sight'
          },
          template: {
            units: '',
            contiguous: false,
            type: ''
          }
        },
        range: {
          units: 'ft',
          value: '60',
          special: ''
        },
        uses: {
          max: '',
          spent: 0,
          recovery: []
        },
        level: 1,
        school: 'nec',
        properties: ['vocal', 'somatic', 'concentration'],
        materials: {
          value: 'a polished obsidian shard',
          consumed: false,
          cost: 0,
          supply: 0
        },
        preparation: {
          mode: 'always',
          prepared: false
        },
        activities: {
          corpseSeq8Act001: {
            type: 'utility',
            _id: 'corpseSeq8Act001',
            sort: 0,
            activation: {
              type: 'action',
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
              units: 'minute',
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
          }
        },
        identifier: 'lotm-corpse-collector-death-eyes',
        method: 'spell',
        prepared: 1,
        spiritualityCost: null,
        sourceClass: 'lotm-corpse-collector'
      },
      effects: [],
      folder: 'zFhCGCq7OxUkeaTp',
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
      _stats: newStats(now + 4),
      sort: 2100100,
      ownership: {
        default: 0
      }
    },
    {
      _id: 'lotmAbilityC8002',
      name: 'Grave Whisper',
      type: 'spell',
      img: 'icons/magic/death/undead-ghost-scream-teal.webp',
      system: {
        description: {
          value: '<p><strong>Baseline (0 Spirituality):</strong> As an action, address nearby lingering spirits, corpse echoes, or death-site murmurs within 30 feet for up to 1 minute (concentration). Choose one effect: (a) ask one bounded question about a death event in this area and receive a brief symbolic impression, or (b) pacify one hostile minor spirit so it cannot take reactions until the start of your next turn. If no spirit is present, you still detect whether spiritual residue has been disturbed in the last day.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Ask two bounded questions or pacify up to two minor spirits.</li><li><strong>+2 Spirituality:</strong> Duration becomes 10 minutes. While active, you and one ally gain <strong>+1d4</strong> on checks to track undead movement, hidden graves, or ritual disturbance.</li><li><strong>+4 Spirituality:</strong> Once during duration, compel one minor spirit within range to manifest and point toward a relevant corpse, hidden tunnel, or ritual implement within 120 feet (if any exist).</li></ul><p><em>Counterplay:</em> sealed tomb sigils, spirit-binding contracts, and anti-necromancy barriers can prevent reliable answers.</p><p><em>Corruption Hook:</em> forcing grieving spirits into repeated interrogation for convenience can add 1 Corruption at GM discretion.</p>',
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
          type: 'action',
          condition: '',
          value: null
        },
        duration: {
          value: '1',
          units: 'minute'
        },
        target: {
          affects: {
            choice: false,
            count: '1',
            type: 'creature',
            special: 'lingering spirit, corpse echo, or death-site remnant'
          },
          template: {
            units: '',
            contiguous: false,
            type: ''
          }
        },
        range: {
          units: 'ft',
          value: '30',
          special: ''
        },
        uses: {
          max: '',
          spent: 0,
          recovery: []
        },
        level: 1,
        school: 'div',
        properties: ['vocal', 'somatic', 'concentration'],
        materials: {
          value: 'grave-soil wrapped in linen',
          consumed: false,
          cost: 0,
          supply: 0
        },
        preparation: {
          mode: 'always',
          prepared: false
        },
        activities: {
          corpseSeq8Act002: {
            type: 'utility',
            _id: 'corpseSeq8Act002',
            sort: 0,
            activation: {
              type: 'action',
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
              units: 'minute',
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
          }
        },
        identifier: 'lotm-corpse-collector-grave-whisper',
        method: 'spell',
        prepared: 1,
        spiritualityCost: null,
        sourceClass: 'lotm-corpse-collector'
      },
      effects: [],
      folder: 'zFhCGCq7OxUkeaTp',
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
      _stats: newStats(now + 5),
      sort: 2100101,
      ownership: {
        default: 0
      }
    }
  ];

  for (const a of abilities) {
    await abilitiesDb.put(`!items!${a._id}`, JSON.stringify(a));
  }

  await pathwaysDb.close();
  await abilitiesDb.close();

  console.log(JSON.stringify({
    updatedPathway: pathwayKey,
    updatedFolder: folderKey,
    updatedLegacyAbility: spiritVisionKey,
    wroteAbilities: abilities.map(a => `!items!${a._id}`)
  }, null, 2));
})();
