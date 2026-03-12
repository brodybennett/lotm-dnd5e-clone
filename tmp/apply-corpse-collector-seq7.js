const { ClassicLevel } = require('./node-tools/node_modules/classic-level');

const CORE_VERSION = '13.351';
const SYSTEM_ID = 'lotm';
const SYSTEM_VERSION = '5.2.6';
const MODIFIER = 'codex';

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
  pathway.system.description.value = '<p><strong>Pathway Vector:</strong> solemn stewardship of corpses, spirit perception, and measured decay that treats death as inevitable order rather than panic or spectacle.</p><p><strong>Sequence 9 Package (Total Budget 2):</strong> Undead Physique, Spirit Vision.</p><p><strong>Sequence 8 Package (Gain Budget +3):</strong> Death Eyes, Grave Whisper, plus one legacy scope upgrade to Spirit Vision.</p><p><strong>Sequence 7 Package (Gain Budget +13):</strong> Spirit Channelling, Spirit Affinity, Zombie Disguise, plus two legacy upgrades (Undead Physique and Grave Whisper).</p><p><strong>Sequence 6-0 Status:</strong> Pending authoring in later sequence-focused runs.</p><p><strong>Continuity Anchor:</strong> At Sequence 7 (Spirit Medium), the pathway stabilizes active communion and command over spirits while retaining grave discipline and corpse-derived battlefield control.</p>';
  pathway._stats = touchStats(pathway._stats, now + 1);
  await pathwaysDb.put(pathwayKey, JSON.stringify(pathway));

  const folderKey = '!folders!zFhCGCq7OxUkeaTp';
  const folder = JSON.parse(await abilitiesDb.get(folderKey));
  folder.description = 'Sequence abilities for the Corpse Collector pathway (authored through Sequence 7).';
  folder.flags = folder.flags ?? {};
  folder.flags.lotm = {
    ...(folder.flags.lotm ?? {}),
    pathwayIdentifier: 'lotm-corpse-collector',
    latestAuthoredSequence: 7
  };
  folder._stats = touchStats(folder._stats, now + 2);
  await abilitiesDb.put(folderKey, JSON.stringify(folder));

  const undeadPhysiqueKey = '!items!lotmAbilityC9001';
  const undeadPhysique = JSON.parse(await abilitiesDb.get(undeadPhysiqueKey));
  appendLegacyBlock(
    undeadPhysique,
    '<h3>Legacy Upgrade (Sequence 7 - Efficiency)</h3>',
    '<p>At Sequence 7, Undead Physique becomes more economical in sustained fights. Once per short rest, when initiative is rolled, you may activate the baseline corpse-calm state without spending a bonus action. In addition, while Undead Physique is active, the baseline once-per-turn necrotic rider can be applied to a successful damaging pathway ability (not only weapon hits). If cast with at least <strong>+1 Spirituality</strong>, you gain resistance to forced movement from undead and spirit effects until the state ends.</p>'
  );
  undeadPhysique._stats = touchStats(undeadPhysique._stats, now + 3);
  await abilitiesDb.put(undeadPhysiqueKey, JSON.stringify(undeadPhysique));

  const graveWhisperKey = '!items!lotmAbilityC8002';
  const graveWhisper = JSON.parse(await abilitiesDb.get(graveWhisperKey));
  appendLegacyBlock(
    graveWhisper,
    '<h3>Legacy Upgrade (Sequence 7 - Scope)</h3>',
    '<p>At Sequence 7, Grave Whisper can interrogate linked remnants in one invocation. When you cast Grave Whisper with at least <strong>+1 Spirituality</strong>, choose one secondary residue point within 15 feet of the primary target and resolve a second read. If both reads succeed, extract one comparative clue (tampering seam, transit mismatch, or identity contradiction) and grant the resulting <strong>+1d4</strong> tracking die to yourself and one ally within 30 feet. Once per short rest, this comparative rider can be used without paying the +1 surcharge.</p>'
  );
  graveWhisper._stats = touchStats(graveWhisper._stats, now + 4);
  await abilitiesDb.put(graveWhisperKey, JSON.stringify(graveWhisper));

  const abilityDocs = [
    {
      _id: 'lotmAbilityC7001',
      name: 'Spirit Channelling',
      type: 'spell',
      img: 'icons/magic/death/undead-ghost-blue.webp',
      system: {
        description: {
          value: '<p><strong>Baseline (0 Spirituality):</strong> As an action, establish a 1-minute channel with one nearby spirit remnant within 30 feet (concentration). Choose one channel mode on cast: <strong>Guide</strong> (learn the safest route toward one named location within 120 feet if the spirit knows it), <strong>Disturb</strong> (one creature in range makes a Wisdom save or has disadvantage on its next attack before end of its turn), or <strong>Anchor</strong> (one minor spirit or incorporeal undead in range loses 10 feet movement and cannot move through solid walls until start of your next turn).</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Range becomes 60 feet and you may switch channel mode once during duration without ending the effect.</li><li><strong>+2 Spirituality:</strong> Affect up to two spirits/targets with the same mode; if both checks/saves resolve in your favor, one ally within 30 feet gains <strong>+1d4</strong> on its next Insight, Religion, or attack roll against undead.</li><li><strong>+4 Spirituality:</strong> Duration becomes 10 minutes. Once during duration, force one spirit-linked creature to make a Charisma save; on failure it cannot benefit from invisibility or incorporeal phasing until end of your next turn.</li></ul><p><em>Counterplay:</em> spirit contracts, sanctified boundaries, and anti-necromancy seals can block available remnant channels.</p><p><em>Corruption Hook:</em> compelling unwilling dead to relive trauma for convenience may add 1 Corruption.</p>',
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
            special: 'spirit remnant, spirit-linked creature, or minor incorporeal undead'
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
        level: 2,
        school: 'nec',
        properties: ['vocal', 'somatic', 'concentration'],
        materials: {
          value: 'a marked funerary token',
          consumed: false,
          cost: 0,
          supply: 0
        },
        preparation: {
          mode: 'always',
          prepared: false
        },
        activities: {
          corpseSeq7Act001: {
            type: 'utility',
            _id: 'corpseSeq7Act001',
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
        identifier: 'lotm-corpse-collector-spirit-channelling',
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
          grantedSequence: 7
        }
      },
      _stats: newStats(now + 5),
      sort: 2100200,
      ownership: {
        default: 0
      }
    },
    {
      _id: 'lotmAbilityC7002',
      name: 'Spirit Affinity',
      type: 'spell',
      img: 'icons/magic/spirit/ghost-figure-blue.webp',
      system: {
        description: {
          value: '<p><strong>Baseline (0 Spirituality):</strong> As a bonus action, align your breath and pulse to the spirit tide for 10 minutes (concentration). You gain advantage on Charisma checks made to calm, negotiate with, or identify intent from spirits and undead. Once per round when a spirit or undead forces you to make a fear, charm, or possession-related save, you gain a <strong>+1</strong> bonus to that save.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Extend the baseline save bonus to one ally within 30 feet while they remain in line of sight.</li><li><strong>+2 Spirituality:</strong> Gain temporary HP equal to your Potency and advantage on checks to resist incorporeal grapples or life-drain effects.</li><li><strong>+4 Spirituality:</strong> For 1 minute, establish a 15-foot aura. Non-elite undead entering the aura must pass a Wisdom save or treat you and your chosen ally as low-priority targets until they are directly harmed by either of you.</li></ul><p><em>Counterplay:</em> high-authority undead, consecration inversions, and direct anti-spirit suppression can ignore or dispel affinity effects.</p><p><em>Corruption Hook:</em> if you rely on spirit sympathy to manipulate mourners or exploit funerary rites, gain 1 Corruption.</p>',
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
        level: 2,
        school: 'abj',
        properties: ['vocal', 'somatic', 'concentration'],
        materials: {
          value: 'a silver-thread mourning knot',
          consumed: false,
          cost: 0,
          supply: 0
        },
        preparation: {
          mode: 'always',
          prepared: false
        },
        activities: {
          corpseSeq7Act002: {
            type: 'utility',
            _id: 'corpseSeq7Act002',
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
        identifier: 'lotm-corpse-collector-spirit-affinity',
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
          grantedSequence: 7
        }
      },
      _stats: newStats(now + 6),
      sort: 2100201,
      ownership: {
        default: 0
      }
    },
    {
      _id: 'lotmAbilityC7003',
      name: 'Zombie Disguise',
      type: 'spell',
      img: 'icons/magic/death/undead-zombie-glow-purple.webp',
      system: {
        description: {
          value: '<p><strong>Baseline (0 Spirituality):</strong> As an action, shroud yourself in corpse aura for 10 minutes (concentration). You appear and read spiritually as a shambling undead to casual perception. Non-elite undead must pass a Wisdom save to identify you as living while you remain non-hostile to them. You gain advantage on Stealth checks made in graveyards, catacombs, and corpse-littered battlefields, and resistance to environmental nausea from rot, blood, or miasma.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Choose one ally within 10 feet when cast; they receive the disguise effect for 1 minute while they stay within 30 feet of you.</li><li><strong>+2 Spirituality:</strong> Gain temporary HP equal to your Potency and ignore difficult terrain caused by corpse piles, loose remains, or bone-strewn ground.</li><li><strong>+4 Spirituality:</strong> Once during duration, as a reaction when targeted by an undead attack, force the attacker to make a Wisdom save. On failure, it must choose a new target or lose the attack.</li></ul><p><em>Counterplay:</em> intelligent undead commanders, sanctified detection rites, and truesight-level perception bypass the disguise.</p><p><em>Corruption Hook:</em> habitual identity erosion through prolonged corpse-masquerade may add 1 Corruption after repeated scenes.</p>',
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
        level: 2,
        school: 'ill',
        properties: ['vocal', 'somatic', 'concentration'],
        materials: {
          value: 'grave ash pressed on the brow',
          consumed: false,
          cost: 0,
          supply: 0
        },
        preparation: {
          mode: 'always',
          prepared: false
        },
        activities: {
          corpseSeq7Act003: {
            type: 'utility',
            _id: 'corpseSeq7Act003',
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
        identifier: 'lotm-corpse-collector-zombie-disguise',
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
          grantedSequence: 7
        }
      },
      _stats: newStats(now + 7),
      sort: 2100202,
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
    updatedPathway: pathwayKey,
    updatedFolder: folderKey,
    legacyUpdated: [undeadPhysiqueKey, graveWhisperKey],
    wroteAbilities: abilityDocs.map(a => `!items!${a._id}`)
  }, null, 2));
})();
