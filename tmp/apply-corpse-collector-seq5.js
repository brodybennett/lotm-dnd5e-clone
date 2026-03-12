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
  pathway.system.description.value = '<p><strong>Pathway Vector:</strong> solemn stewardship of corpses, spirit perception, and measured decay that treats death as inevitable order rather than panic or spectacle.</p><p><strong>Sequence 9 Package (Total Budget 2):</strong> Undead Physique, Spirit Vision.</p><p><strong>Sequence 8 Package (Gain Budget +3):</strong> Death Eyes, Grave Whisper, plus one legacy scope upgrade to Spirit Vision.</p><p><strong>Sequence 7 Package (Gain Budget +13):</strong> Spirit Channelling, Spirit Affinity, Zombie Disguise, plus two legacy upgrades (Undead Physique and Grave Whisper).</p><p><strong>Sequence 6 Package (Gain Budget +9):</strong> Language of the Dead, Resurrection, Knowledge of Spirit World, plus two legacy upgrades (Spirit Channelling and Death Eyes).</p><p><strong>Sequence 5 Package (Gain Budget +13):</strong> Door to the Underworld, Internal Underworld, Death Envoy, plus two legacy upgrades (Resurrection and Knowledge of Spirit World).</p><p><strong>Sequence 4-0 Status:</strong> Pending authoring in later sequence-focused runs.</p><p><strong>Continuity Anchor:</strong> At Sequence 5 (Gatekeeper), the pathway turns from guiding spirits into governing passage between life and Underworld, with portable spirit-hosting authority and dangerous gate control.</p>';
  pathway._stats = touchStats(pathway._stats, now + 1);
  await pathwaysDb.put(pathwayKey, JSON.stringify(pathway));

  const folderKey = '!folders!zFhCGCq7OxUkeaTp';
  const folder = JSON.parse(await abilitiesDb.get(folderKey));
  folder.description = 'Sequence abilities for the Corpse Collector pathway (authored through Sequence 5).';
  folder.flags = folder.flags ?? {};
  folder.flags.lotm = {
    ...(folder.flags.lotm ?? {}),
    pathwayIdentifier: 'lotm-corpse-collector',
    latestAuthoredSequence: 5
  };
  folder._stats = touchStats(folder._stats, now + 2);
  await abilitiesDb.put(folderKey, JSON.stringify(folder));

  const resurrectionKey = '!items!lotmAbilityC6002';
  const resurrection = JSON.parse(await abilitiesDb.get(resurrectionKey));
  appendLegacyBlock(
    resurrection,
    '<h3>Legacy Upgrade (Sequence 5 - Scope)</h3>',
    '<p>At Sequence 5, Resurrection scales into procession-level corpse command. When cast with at least <strong>+2 Spirituality</strong>, you may sustain one additional mindless servant beyond the normal cap for 10 minutes. If both active servants are within 30 feet of you, they gain coordinated movement: when one uses Dash, the other may move up to half speed as a reaction. Once per short rest, you may transfer your reinforced frame rider between active servants without recasting.</p>'
  );
  resurrection._stats = touchStats(resurrection._stats, now + 3);
  await abilitiesDb.put(resurrectionKey, JSON.stringify(resurrection));

  const spiritWorldKey = '!items!lotmAbilityC6003';
  const spiritWorld = JSON.parse(await abilitiesDb.get(spiritWorldKey));
  appendLegacyBlock(
    spiritWorld,
    '<h3>Legacy Upgrade (Sequence 5 - Efficiency)</h3>',
    '<p>At Sequence 5, Knowledge of Spirit World becomes faster to deploy in active scenes. Once per short rest, activate the baseline scan as a bonus action instead of an action. In addition, when the scan succeeds, you may bank its <strong>+1d4</strong> support die for up to 1 hour (instead of immediate scene use). If cast with at least <strong>+1 Spirituality</strong>, one designated ally can hold that banked die instead.</p>'
  );
  spiritWorld._stats = touchStats(spiritWorld._stats, now + 4);
  await abilitiesDb.put(spiritWorldKey, JSON.stringify(spiritWorld));

  const docs = [
    {
      _id: 'lotmAbilityC5001',
      name: 'Door to the Underworld',
      type: 'spell',
      img: 'icons/magic/death/gate-skull-black.webp',
      system: {
        description: {
          value: '<p><strong>Baseline (0 Spirituality):</strong> As an action, manifest a temporary Underworld Door at a point within 60 feet for up to 1 round. Choose one creature within 10 feet of the door when it appears; it must make a Strength save. On a failure, it is pulled up to 15 feet toward the door and has disadvantage on its next attack roll before end of its turn. Creatures adjacent to the door treat the area as difficult terrain until your next turn.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+2 Spirituality:</strong> Door radius increases to 15 feet, pull increases to 25 feet, and you may affect up to two targets.</li><li><strong>+4 Spirituality:</strong> Door persists for 1 minute (concentration). Once per round, choose one target in the aura to repeat the pull/save sequence.</li><li><strong>+6 Spirituality:</strong> On a failed save by 5 or more, the primary target is dragged behind the threshold until the start of your next turn (banished to a hostile underworld edge-state and returns prone in nearest unoccupied space).</li></ul><p><em>Counterplay:</em> immovable anchors, teleport negation, and consecrated gate wards reduce pull or prevent threshold displacement.</p><p><em>Corruption Hook:</em> opening gates recklessly near civilians or allies to force outcomes can add 1 Corruption.</p>',
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
          units: 'round'
        },
        target: {
          affects: {
            choice: false,
            count: '1',
            type: 'creature',
            special: 'creature near manifested door'
          },
          template: {
            units: 'ft',
            contiguous: false,
            type: 'radius'
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
        level: 4,
        school: 'nec',
        properties: ['vocal', 'somatic', 'concentration'],
        materials: {
          value: 'a palm-marked obsidian token',
          consumed: false,
          cost: 0,
          supply: 0
        },
        preparation: {
          mode: 'always',
          prepared: false
        },
        activities: {
          corpseSeq5Act001: {
            type: 'utility',
            _id: 'corpseSeq5Act001',
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
              units: 'round',
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
        identifier: 'lotm-corpse-collector-door-to-the-underworld',
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
          grantedSequence: 5
        }
      },
      _stats: newStats(now + 5),
      sort: 2100400,
      ownership: {
        default: 0
      }
    },
    {
      _id: 'lotmAbilityC5002',
      name: 'Internal Underworld',
      type: 'spell',
      img: 'icons/magic/death/coffin-closed-glow-blue.webp',
      system: {
        description: {
          value: '<p><strong>Baseline (0 Spirituality):</strong> As a bonus action, open your internal spirit-cage for 10 minutes (concentration). You may keep a roster of up to 3 minor housed spirits. While active, you can command one housed spirit each round to perform a simple task: scout within 60 feet, harry one enemy (impose -1d4 on its next perception check), or shield one ally (+1 AC against one incoming attack).</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+2 Spirituality:</strong> Increase housed roster capacity to 5 for this cast and command two spirits per round.</li><li><strong>+4 Spirituality:</strong> Duration becomes 1 hour. Once during duration, deploy a housed spirit as a temporary helper with HP equal to your Potency for 3 rounds.</li><li><strong>+6 Spirituality:</strong> For 1 minute, all commands from this ability gain enhanced precision: scouting ignores mundane darkness, harry applies to saving throws, and shield can protect up to two allies within 30 feet.</li></ul><p><em>Counterplay:</em> exorcism rites, spirit-binding contracts, and anti-possession zones can eject or mute housed spirits.</p><p><em>Corruption Hook:</em> hoarding unwilling souls or refusing proper release rites can add 1 Corruption per scene.</p>',
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
        level: 4,
        school: 'nec',
        properties: ['vocal', 'somatic', 'concentration'],
        materials: {
          value: 'a ring of black iron engraved with grave marks',
          consumed: false,
          cost: 0,
          supply: 0
        },
        preparation: {
          mode: 'always',
          prepared: false
        },
        activities: {
          corpseSeq5Act002: {
            type: 'utility',
            _id: 'corpseSeq5Act002',
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
        identifier: 'lotm-corpse-collector-internal-underworld',
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
          grantedSequence: 5
        }
      },
      _stats: newStats(now + 6),
      sort: 2100401,
      ownership: {
        default: 0
      }
    },
    {
      _id: 'lotmAbilityC5003',
      name: 'Death Envoy',
      type: 'spell',
      img: 'icons/magic/death/undead-ghosts-trio-blue.webp',
      system: {
        description: {
          value: '<p><strong>Baseline (0 Spirituality):</strong> As an action, manifest one housed envoy-spirit within 30 feet for 1 round. The envoy releases a low sobbing wail; one creature that can hear it must make a Constitution save. On failure, the creature\'s body goes numb: speed is reduced by 15 feet and it has disadvantage on weapon attack rolls until the end of its next turn.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+2 Spirituality:</strong> Affect up to two creatures in a 10-foot radius around the envoy.</li><li><strong>+4 Spirituality:</strong> Duration becomes 1 minute (concentration). Once per round, you may force one target in range to repeat the save against numbness.</li><li><strong>+6 Spirituality:</strong> On a failed save by 5 or more, the target additionally takes necrotic damage equal to your Potency at the start of its next turn (once per cast per target).</li></ul><p><em>Counterplay:</em> silence effects, auditory immunity, and strong anti-spirit wards can block the envoy\'s influence.</p><p><em>Corruption Hook:</em> repeatedly using the envoy to prolong fear and suffering rather than end conflict can add 1 Corruption.</p>',
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
          units: 'round'
        },
        target: {
          affects: {
            choice: false,
            count: '1',
            type: 'creature',
            special: 'creature that can hear the envoy'
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
        level: 4,
        school: 'nec',
        properties: ['vocal', 'somatic', 'concentration'],
        materials: {
          value: 'a token bound to one internal spirit helper',
          consumed: false,
          cost: 0,
          supply: 0
        },
        preparation: {
          mode: 'always',
          prepared: false
        },
        activities: {
          corpseSeq5Act003: {
            type: 'utility',
            _id: 'corpseSeq5Act003',
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
              units: 'round',
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
        identifier: 'lotm-corpse-collector-death-envoy',
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
          grantedSequence: 5
        }
      },
      _stats: newStats(now + 7),
      sort: 2100402,
      ownership: {
        default: 0
      }
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
    updatedLegacy: [resurrectionKey, spiritWorldKey],
    wroteAbilities: docs.map(d => `!items!${d._id}`)
  }, null, 2));
})();
