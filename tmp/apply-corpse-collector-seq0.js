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
  pathway.system.description.value = '<p><strong>Pathway Vector:</strong> solemn stewardship of corpses, spirit perception, and measured decay that treats death as inevitable order rather than panic or spectacle.</p><p><strong>Sequence 9 Package (Total Budget 2):</strong> Undead Physique, Spirit Vision.</p><p><strong>Sequence 8 Package (Gain Budget +3):</strong> Death Eyes, Grave Whisper, plus one legacy scope upgrade to Spirit Vision.</p><p><strong>Sequence 7 Package (Gain Budget +13):</strong> Spirit Channelling, Spirit Affinity, Zombie Disguise, plus two legacy upgrades (Undead Physique and Grave Whisper).</p><p><strong>Sequence 6 Package (Gain Budget +9):</strong> Language of the Dead, Resurrection, Knowledge of Spirit World, plus two legacy upgrades (Spirit Channelling and Death Eyes).</p><p><strong>Sequence 5 Package (Gain Budget +13):</strong> Door to the Underworld, Internal Underworld, Death Envoy, plus two legacy upgrades (Resurrection and Knowledge of Spirit World).</p><p><strong>Sequence 4 Package (Gain Budget +33):</strong> Reincarnation, Underworld Authority, Spirit World Traversal, Sealing Edict, plus two legacy upgrades (Door to the Underworld and Language of the Dead).</p><p><strong>Sequence 3 Package (Gain Budget +20):</strong> Hands of Life and Death, Ferryman, Death Gaze, Styx Afloat, plus two legacy upgrades (Reincarnation and Underworld Authority).</p><p><strong>Sequence 2 Package (Gain Budget +50):</strong> Nation of the Dead, King of the Dead, Death Consul\'s Decree, Soul Shepherding, plus two legacy upgrades (Ferryman and Death Gaze).</p><p><strong>Sequence 1 Package (Gain Budget +74):</strong> Pale World, Sovereign of Spirits, Death Decree, Final Judgment Sigil, plus two legacy upgrades (Death Consul\'s Decree and Soul Shepherding).</p><p><strong>Sequence 0 Package (Gain Budget +114):</strong> Conceptual Extinction, Endpoint Dominion, Pallor of Eternal Rest, Throne of the Dead, plus two legacy upgrades (Death Decree and Final Judgment Sigil).</p><p><strong>Sequence Track Status:</strong> Authored through Sequence 0 (complete standard pathway progression).</p><p><strong>Continuity Anchor:</strong> At Sequence 0 (Death, Eternal Sleeper), all prior tools become conceptual law: decrees define endings, pallor enforces stillness, and endpoint authority decides where every death ultimately rests.</p>';
  pathway._stats = touchStats(pathway._stats, now + 1);
  await pathwaysDb.put(pathwayKey, JSON.stringify(pathway));

  const folderKey = '!folders!zFhCGCq7OxUkeaTp';
  const folder = JSON.parse(await abilitiesDb.get(folderKey));
  folder.description = 'Sequence abilities for the Corpse Collector pathway (authored through Sequence 0).';
  folder.flags = folder.flags ?? {};
  folder.flags.lotm = {
    ...(folder.flags.lotm ?? {}),
    pathwayIdentifier: 'lotm-corpse-collector',
    latestAuthoredSequence: 0
  };
  folder._stats = touchStats(folder._stats, now + 2);
  await abilitiesDb.put(folderKey, JSON.stringify(folder));

  const deathDecreeKey = '!items!lotmAbilityC1003';
  const deathDecree = JSON.parse(await abilitiesDb.get(deathDecreeKey));
  appendLegacyBlock(
    deathDecree,
    '<h3>Legacy Upgrade (Sequence 0 - Potency)</h3>',
    '<p>At Sequence 0, Death Decree inherits conceptual certainty. If a target fails this decree and would trigger a substitution effect (marionette transfer, figurine stand-in, mirror body, or comparable proxy), that proxy also receives the decree\'s full damage and cannot prevent the original target from taking the result. If cast with at least <strong>+5 Spirituality</strong>, the first failed target each casting also suffers <strong>Connection Death</strong> until end of your next turn: healing links, protection links, and remote buff links attached to it are severed.</p>'
  );
  deathDecree._stats = touchStats(deathDecree._stats, now + 3);
  await abilitiesDb.put(deathDecreeKey, JSON.stringify(deathDecree));

  const sigilKey = '!items!lotmAbilityC1004';
  const sigil = JSON.parse(await abilitiesDb.get(sigilKey));
  appendLegacyBlock(
    sigil,
    '<h3>Legacy Upgrade (Sequence 0 - Scope)</h3>',
    '<p>At Sequence 0, Final Judgment Sigil may propagate through fate-adjacent traces. When the initial sealed target fails its save by 5 or more, choose one additional creature within 30 feet of it: that creature must also make a Wisdom save against a secondary sigil. In addition, while at least one target is sealed, you may spend <strong>+5 Spirituality</strong> as a reaction to force one sealed target attempting teleportation, planar transit, or substitution to fail that attempt and take necrotic damage equal to your Potency.</p>'
  );
  sigil._stats = touchStats(sigil._stats, now + 4);
  await abilitiesDb.put(sigilKey, JSON.stringify(sigil));

  const docs = [
    {
      _id: 'lotmAbilityC0001',
      name: 'Conceptual Extinction',
      type: 'spell',
      img: 'icons/magic/death/skull-horned-worn-fire-blue.webp',
      system: {
        description: {
          value: '<p><strong>Baseline (0 Spirituality):</strong> As an action, target one creature or manifested spirit-construct you can clearly perceive within 300 feet. It makes a Constitution save. On a failure, it takes necrotic damage equal to <strong>6 x Potency</strong>, cannot regain hit points until the end of your next turn, and any one active substitution/proxy effect on it is suppressed until the start of your next turn. If it drops to 0 HP from this damage, it cannot be revived by effects below equal-tier death authority for 1 minute.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+5 Spirituality:</strong> Target up to two creatures; resolve saves separately.</li><li><strong>+10 Spirituality:</strong> A target that fails by 5 or more also loses one active clone/proxy body immediately (destroyed or rendered inert).</li><li><strong>+15 Spirituality:</strong> Once per long rest, if one target fails by 5 or more and has current HP at or below <strong>10 x Potency</strong> after damage, it dies instantly unless protected by equal-tier authority or explicit deity-grade intervention.</li></ul><p><em>Counterplay:</em> line-of-sight denial, anti-necrotic sanctums, and equivalent-tier endpoint protections can block or soften this judgment.</p><p><em>Corruption Hook:</em> using conceptual execution for convenience or political terror adds 1 Corruption.</p>',
          chat: ''
        },
        source: { custom: '', rules: '2024', revision: 1, license: '', book: 'LoTM Core' },
        activation: { type: 'action', condition: '', value: null },
        duration: { value: '1', units: 'inst' },
        target: {
          affects: { choice: false, count: '1', type: 'creature', special: 'creature or spirit construct you can clearly perceive' },
          template: { units: '', contiguous: false, type: '' }
        },
        range: { units: 'ft', value: '300', special: '' },
        uses: { max: '', spent: 0, recovery: [] },
        level: 9,
        school: 'nec',
        properties: ['vocal', 'somatic'],
        materials: { value: 'a shard of black funerary stone wrapped in white feather thread', consumed: false, cost: 0, supply: 0 },
        preparation: { mode: 'always', prepared: false },
        activities: {
          corpseSeq0Act001: {
            type: 'utility',
            _id: 'corpseSeq0Act001',
            sort: 0,
            activation: { type: 'action', value: null, override: false },
            consumption: { scaling: { allowed: false }, spellSlot: true, targets: [] },
            description: { chatFlavor: '' },
            duration: { units: 'inst', concentration: false, override: false },
            effects: [],
            range: { override: false },
            target: { template: { contiguous: false, units: 'ft' }, affects: { choice: false }, override: false, prompt: true },
            uses: { spent: 0, recovery: [], max: '' },
            roll: { prompt: false, visible: false, name: '', formula: '' },
            name: '',
            img: '',
            appliedEffects: []
          }
        },
        identifier: 'lotm-corpse-collector-conceptual-extinction',
        method: 'spell',
        prepared: 1,
        spiritualityCost: null,
        sourceClass: 'lotm-corpse-collector'
      },
      effects: [],
      folder: 'zFhCGCq7OxUkeaTp',
      flags: { dnd5e: { riders: { activity: [], effect: [] } }, lotm: { sourceBook: 'LoTM Core', grantedSequence: 0 } },
      _stats: newStats(now + 5),
      sort: 2100900,
      ownership: { default: 0 }
    },
    {
      _id: 'lotmAbilityC0002',
      name: 'Endpoint Dominion',
      type: 'spell',
      img: 'icons/magic/death/grave-tombstone-glow-teal.webp',
      system: {
        description: {
          value: '<p><strong>Baseline (0 Spirituality):</strong> As an action, establish an Endpoint Dominion centered on a point within 300 feet for 10 minutes (concentration), radius 300 feet. In this domain, each hostile creature that starts its turn there must make a Wisdom save. On failure, it takes necrotic damage equal to <strong>2 x Potency</strong>, its speed becomes 0 until end of turn, and it cannot use teleportation or planar transit before the start of its next turn. Any creature that dies in the domain cannot be restored by effects below equal-tier death authority until the domain ends.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+5 Spirituality:</strong> Radius becomes 600 feet and duration becomes 1 hour.</li><li><strong>+10 Spirituality:</strong> You may detain up to <strong>Potency</strong> newly-dead souls in the domain; detained souls cannot be summoned or extracted by lower-tier effects.</li><li><strong>+15 Spirituality:</strong> Once per round, choose up to two hostile creatures in the domain; each must make a Constitution save or take necrotic damage equal to <strong>3 x Potency</strong> and become unable to benefit from substitution effects until end of your next turn.</li></ul><p><em>Counterplay:</em> breaking concentration, leaving domain bounds, and equivalent endpoint authorities can contest dominion control.</p><p><em>Corruption Hook:</em> claiming neutral grave-space as personal endpoint territory adds 1 Corruption.</p>',
          chat: ''
        },
        source: { custom: '', rules: '2024', revision: 1, license: '', book: 'LoTM Core' },
        activation: { type: 'action', condition: '', value: null },
        duration: { value: '10', units: 'minute' },
        target: {
          affects: { choice: false, count: '1', type: 'self', special: '' },
          template: { units: 'ft', contiguous: false, type: 'radius' }
        },
        range: { units: 'ft', value: '300', special: '' },
        uses: { max: '', spent: 0, recovery: [] },
        level: 9,
        school: 'nec',
        properties: ['vocal', 'somatic', 'concentration'],
        materials: { value: 'a funerary standard marked with an endpoint spiral', consumed: false, cost: 0, supply: 0 },
        preparation: { mode: 'always', prepared: false },
        activities: {
          corpseSeq0Act002: {
            type: 'utility',
            _id: 'corpseSeq0Act002',
            sort: 0,
            activation: { type: 'action', value: null, override: false },
            consumption: { scaling: { allowed: false }, spellSlot: true, targets: [] },
            description: { chatFlavor: '' },
            duration: { units: 'minute', concentration: false, override: false },
            effects: [],
            range: { override: false },
            target: { template: { contiguous: false, units: 'ft' }, affects: { choice: false }, override: false, prompt: true },
            uses: { spent: 0, recovery: [], max: '' },
            roll: { prompt: false, visible: false, name: '', formula: '' },
            name: '',
            img: '',
            appliedEffects: []
          }
        },
        identifier: 'lotm-corpse-collector-endpoint-dominion',
        method: 'spell',
        prepared: 1,
        spiritualityCost: null,
        sourceClass: 'lotm-corpse-collector'
      },
      effects: [],
      folder: 'zFhCGCq7OxUkeaTp',
      flags: { dnd5e: { riders: { activity: [], effect: [] } }, lotm: { sourceBook: 'LoTM Core', grantedSequence: 0 } },
      _stats: newStats(now + 6),
      sort: 2100901,
      ownership: { default: 0 }
    },
    {
      _id: 'lotmAbilityC0003',
      name: 'Pallor of Eternal Rest',
      type: 'spell',
      img: 'icons/magic/light/explosion-star-small-pink.webp',
      system: {
        description: {
          value: '<p><strong>Baseline (0 Spirituality):</strong> As a bonus action, release absolute pallor in a 120-foot aura around you for 1 minute (concentration). Hostile creatures in the aura make a Wisdom save at the start of their turns. On failure, they take necrotic damage equal to your Potency, have disadvantage on concentration checks and perception checks relying on sight, and the first ability they use before the start of their next turn has its save DC reduced by 2. Colored magical manifestations in the aura become visibly drained and unstable.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+5 Spirituality:</strong> Aura radius becomes 240 feet and duration becomes 10 minutes.</li><li><strong>+10 Spirituality:</strong> A creature that fails by 5 or more is also silenced until end of its next turn (cannot provide verbal components) and has speed halved.</li><li><strong>+15 Spirituality:</strong> Once per round while active, you may choose one non-artifact ongoing effect within the aura that has visible manifestation; reduce its remaining duration by one round (minimum one round remaining).</li></ul><p><em>Counterplay:</em> purification authority, hard-cover sight denial, and anti-aura warding can weaken pallor spread.</p><p><em>Corruption Hook:</em> weathering sacred funerary relics or civilian memory-sites for leverage adds 1 Corruption.</p>',
          chat: ''
        },
        source: { custom: '', rules: '2024', revision: 1, license: '', book: 'LoTM Core' },
        activation: { type: 'bonus', condition: '', value: null },
        duration: { value: '1', units: 'minute' },
        target: {
          affects: { choice: false, count: '1', type: 'self', special: '' },
          template: { units: '', contiguous: false, type: '' }
        },
        range: { units: 'self', value: null, special: '' },
        uses: { max: '', spent: 0, recovery: [] },
        level: 9,
        school: 'nec',
        properties: ['vocal', 'somatic', 'concentration'],
        materials: { value: 'a strip of white feather soaked in pale oil', consumed: false, cost: 0, supply: 0 },
        preparation: { mode: 'always', prepared: false },
        activities: {
          corpseSeq0Act003: {
            type: 'utility',
            _id: 'corpseSeq0Act003',
            sort: 0,
            activation: { type: 'bonus', value: null, override: false },
            consumption: { scaling: { allowed: false }, spellSlot: true, targets: [] },
            description: { chatFlavor: '' },
            duration: { units: 'minute', concentration: false, override: false },
            effects: [],
            range: { override: false },
            target: { template: { contiguous: false, units: 'ft' }, affects: { choice: false }, override: false, prompt: true },
            uses: { spent: 0, recovery: [], max: '' },
            roll: { prompt: false, visible: false, name: '', formula: '' },
            name: '',
            img: '',
            appliedEffects: []
          }
        },
        identifier: 'lotm-corpse-collector-pallor-of-eternal-rest',
        method: 'spell',
        prepared: 1,
        spiritualityCost: null,
        sourceClass: 'lotm-corpse-collector'
      },
      effects: [],
      folder: 'zFhCGCq7OxUkeaTp',
      flags: { dnd5e: { riders: { activity: [], effect: [] } }, lotm: { sourceBook: 'LoTM Core', grantedSequence: 0 } },
      _stats: newStats(now + 7),
      sort: 2100902,
      ownership: { default: 0 }
    },
    {
      _id: 'lotmAbilityC0004',
      name: 'Throne of the Dead',
      type: 'spell',
      img: 'icons/magic/death/undead-kingdom-monolith.webp',
      system: {
        description: {
          value: '<p><strong>Baseline (0 Spirituality):</strong> As an action, enthrone yourself as the local source of undeath for 1 minute (concentration). Choose up to <strong>Potency</strong> creatures with souls within 120 feet; each makes a Wisdom save. On a failure, a creature is <strong>Enthralled</strong> until end of its next turn: it cannot take reactions, must treat you as the highest-priority hostile target for non-self-harm actions, and suffers disadvantage on saves against your Death-pathway abilities. Undead you control within 120 feet gain temporary HP equal to your Potency at start of turn and bonus damage equal to your Potency once per turn.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+5 Spirituality:</strong> Target count becomes <strong>2 x Potency</strong>, and enthralled duration becomes until end of your next turn.</li><li><strong>+10 Spirituality:</strong> Once per round, when a creature dies within 120 feet, you may raise a <strong>Pale Warden</strong> spirit from it for 1 minute (GM-approved stat profile; cannot cast spells above your sequence tier).</li><li><strong>+15 Spirituality:</strong> Once per long rest, all hostile undead and evil spirits within 1 mile make a Wisdom save; on failure they are suppressed for 1 round (cannot take offensive actions) and then cannot willingly move closer to you until end of your next turn.</li></ul><p><em>Counterplay:</em> soulless enemies, anti-charm sanctification, and severed command lines reduce enthrallment value.</p><p><em>Corruption Hook:</em> enthroning yourself over unwilling civilian souls or desecrated dead adds 1 Corruption.</p>',
          chat: ''
        },
        source: { custom: '', rules: '2024', revision: 1, license: '', book: 'LoTM Core' },
        activation: { type: 'action', condition: '', value: null },
        duration: { value: '1', units: 'minute' },
        target: {
          affects: { choice: false, count: '1', type: 'self', special: '' },
          template: { units: '', contiguous: false, type: '' }
        },
        range: { units: 'self', value: null, special: '' },
        uses: { max: '', spent: 0, recovery: [] },
        level: 9,
        school: 'enc',
        properties: ['vocal', 'somatic', 'concentration'],
        materials: { value: 'a miniature pale bone throne anointed with grave oil', consumed: false, cost: 0, supply: 0 },
        preparation: { mode: 'always', prepared: false },
        activities: {
          corpseSeq0Act004: {
            type: 'utility',
            _id: 'corpseSeq0Act004',
            sort: 0,
            activation: { type: 'action', value: null, override: false },
            consumption: { scaling: { allowed: false }, spellSlot: true, targets: [] },
            description: { chatFlavor: '' },
            duration: { units: 'minute', concentration: false, override: false },
            effects: [],
            range: { override: false },
            target: { template: { contiguous: false, units: 'ft' }, affects: { choice: false }, override: false, prompt: true },
            uses: { spent: 0, recovery: [], max: '' },
            roll: { prompt: false, visible: false, name: '', formula: '' },
            name: '',
            img: '',
            appliedEffects: []
          }
        },
        identifier: 'lotm-corpse-collector-throne-of-the-dead',
        method: 'spell',
        prepared: 1,
        spiritualityCost: null,
        sourceClass: 'lotm-corpse-collector'
      },
      effects: [],
      folder: 'zFhCGCq7OxUkeaTp',
      flags: { dnd5e: { riders: { activity: [], effect: [] } }, lotm: { sourceBook: 'LoTM Core', grantedSequence: 0 } },
      _stats: newStats(now + 8),
      sort: 2100903,
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
    updatedLegacy: [deathDecreeKey, sigilKey],
    wroteAbilities: docs.map(d => `!items!${d._id}`)
  }, null, 2));
})();
