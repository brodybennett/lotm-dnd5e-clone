const { ClassicLevel } = require('./node-tools/node_modules/classic-level');

const CORE_VERSION = '13.351';
const SYSTEM_ID = 'lotm';
const SYSTEM_VERSION = '5.2.6';
const MODIFIER = 'codex';

function stats(now) {
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

  const pathwayId = 'lotmPathway00010';
  const pathwayKey = `!items!${pathwayId}`;

  const pathwayDoc = {
    _id: pathwayId,
    name: 'Corpse Collector',
    type: 'class',
    img: 'icons/magic/death/undead-skeleton-figure-glow-pink.webp',
    system: {
      description: {
        value: '<p><strong>Pathway Vector:</strong> solemn stewardship of corpses, spirit perception, and measured decay that treats death as inevitable order rather than panic or spectacle.</p><p><strong>Sequence 9 Package (Total Budget 2):</strong> Undead Physique, Spirit Vision.</p><p><strong>Sequence 8-0 Status:</strong> Pending authoring in later sequence-focused runs.</p><p><strong>Continuity Anchor:</strong> Corpse Collector begins as a grave attendant who reads spiritual residue and channels restrained deathly force with ritual calm.</p>',
        chat: ''
      },
      source: {
        custom: '',
        rules: '2024',
        revision: 1,
        license: '',
        book: 'LoTM Core'
      },
      startingEquipment: [],
      identifier: 'lotm-corpse-collector',
      levels: 1,
      advancement: [],
      spellcasting: {
        progression: 'full',
        ability: 'wis',
        preparation: {
          formula: ''
        }
      },
      wealth: '4d4*10',
      primaryAbility: {
        value: ['wis'],
        all: false
      },
      hd: {
        denomination: 'd8',
        spent: 0,
        additional: ''
      }
    },
    effects: [],
    folder: null,
    flags: {
      lotm: {
        sourceBook: 'LoTM Core'
      }
    },
    _stats: stats(now),
    sort: 1000000,
    ownership: {
      default: 0
    }
  };

  await pathwaysDb.put(pathwayKey, JSON.stringify(pathwayDoc));

  const folderKey = '!folders!zFhCGCq7OxUkeaTp';
  const rawFolder = await abilitiesDb.get(folderKey);
  const folderDoc = JSON.parse(rawFolder);
  folderDoc.description = 'Sequence abilities for the Corpse Collector pathway.';
  folderDoc.flags = folderDoc.flags ?? {};
  folderDoc.flags.lotm = {
    ...(folderDoc.flags.lotm ?? {}),
    pathwayIdentifier: 'lotm-corpse-collector',
    latestAuthoredSequence: 9
  };
  folderDoc._stats = {
    ...(folderDoc._stats ?? {}),
    duplicateSource: folderDoc._stats?.duplicateSource ?? null,
    coreVersion: CORE_VERSION,
    systemId: SYSTEM_ID,
    systemVersion: SYSTEM_VERSION,
    modifiedTime: now + 1,
    lastModifiedBy: MODIFIER,
    exportSource: folderDoc._stats?.exportSource ?? null
  };
  await abilitiesDb.put(folderKey, JSON.stringify(folderDoc));

  const abilityDocs = [
    {
      _id: 'lotmAbilityC9001',
      name: 'Undead Physique',
      type: 'spell',
      img: 'icons/magic/death/undead-skeleton-rags-blue.webp',
      system: {
        description: {
          value: '<p><strong>Baseline (0 Spirituality):</strong> As a bonus action, enter a corpse-calm state for 10 minutes. Your pulse and temperature drop, your movements become rigidly efficient, and you gain advantage on checks to feign death or handle remains without contamination. You also gain advantage on saving throws against fear effects caused by undead or spirits. Once per turn when you hit a creature with a melee attack, you may add <strong>+1 necrotic damage</strong> as restrained rotting force.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Necrotic rider becomes <strong>+Potency</strong> (still once per turn), and you gain advantage on saves versus disease or toxic corpse-miasma while the state lasts.</li><li><strong>+2 Spirituality:</strong> Unintelligent undead that start their turn within 10 feet of you must pass a Wisdom save against your ability DC or treat you as non-hostile until the end of your next turn (ends immediately if you damage them).</li><li><strong>+4 Spirituality:</strong> Once while active, force one creature within 10 feet to make a Constitution save. On a failure, it cannot regain hit points and its speed is reduced by 10 feet until the start of your next turn.</li></ul><p><em>Counterplay:</em> radiant sanctification, anti-necrotic wards, and consecrated ground can suppress the rot rider at GM discretion.</p><p><em>Corruption Hook:</em> if you use this state to profane a burial rite or corpse entrusted to your care, gain 1 Corruption.</p>',
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
          type: 'bonus',
          condition: '',
          value: null
        },
        duration: {
          value: '10',
          units: 'minute'
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
          max: '',
          spent: 0,
          recovery: []
        },
        level: 0,
        school: 'nec',
        properties: ['vocal', 'somatic'],
        materials: {
          value: 'a strip of burial cloth',
          consumed: false,
          cost: 0,
          supply: 0
        },
        preparation: {
          mode: 'always',
          prepared: false
        },
        activities: {
          corpseSeq9Act001: {
            type: 'utility',
            _id: 'corpseSeq9Act001',
            sort: 0,
            activation: {
              type: 'bonus',
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
        identifier: 'lotm-corpse-collector-undead-physique',
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
          grantedSequence: 9
        }
      },
      _stats: stats(now + 2),
      sort: 2100000,
      ownership: {
        default: 0
      }
    },
    {
      _id: 'lotmAbilityC9002',
      name: 'Spirit Vision',
      type: 'spell',
      img: 'icons/magic/perception/eye-ringed-green.webp',
      system: {
        description: {
          value: '<p><strong>Baseline (0 Spirituality):</strong> As an action, open your spirit sight for 1 minute (concentration). Within 30 feet, you sense incorporeal spirits, undead, and death residue. You can identify whether a corpse died within the last 24 hours and discern one dominant emotional trace left at death. After a successful read, gain <strong>+1d4</strong> to your next Medicine, Investigation, or Insight check tied to that scene before the end of 1 hour.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Range becomes 60 feet and duration becomes 10 minutes.</li><li><strong>+2 Spirituality:</strong> If a corpse or death-site remnant is present within range, ask one tightly-bounded question and receive a brief yes/no or one-word impression.</li><li><strong>+4 Spirituality:</strong> Choose one sensed undead or spirit. Until the end of the scene, the first attack roll or save DC you force against it gains <strong>+Potency</strong>, and it cannot benefit from invisibility against you.</li></ul><p><em>Counterplay:</em> consecrated barriers, anti-divination effects, and higher-sequence concealment can blur or block death traces.</p><p><em>Corruption Hook:</em> if you invade a dead person\'s final memories for greed rather than duty, gain 1 Corruption.</p>',
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
            special: 'spirit, undead, corpse, or death-site remnant in sight'
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
        level: 0,
        school: 'div',
        properties: ['vocal', 'somatic', 'concentration'],
        materials: {
          value: 'a black candle wick or funerary ash',
          consumed: false,
          cost: 0,
          supply: 0
        },
        preparation: {
          mode: 'always',
          prepared: false
        },
        activities: {
          corpseSeq9Act002: {
            type: 'utility',
            _id: 'corpseSeq9Act002',
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
        identifier: 'lotm-corpse-collector-spirit-vision',
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
          grantedSequence: 9
        }
      },
      _stats: stats(now + 3),
      sort: 2100001,
      ownership: {
        default: 0
      }
    }
  ];

  for (const doc of abilityDocs) {
    await abilitiesDb.put(`!items!${doc._id}`, JSON.stringify(doc));
  }

  await pathwaysDb.close();
  await abilitiesDb.close();

  console.log(JSON.stringify({
    pathwayWritten: pathwayKey,
    folderUpdated: folderKey,
    abilitiesWritten: abilityDocs.map(d => `!items!${d._id}`)
  }, null, 2));
})();
