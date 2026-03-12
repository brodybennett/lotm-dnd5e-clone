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
  pathway.system.description.value = '<p><strong>Pathway Vector:</strong> solemn stewardship of corpses, spirit perception, and measured decay that treats death as inevitable order rather than panic or spectacle.</p><p><strong>Sequence 9 Package (Total Budget 2):</strong> Undead Physique, Spirit Vision.</p><p><strong>Sequence 8 Package (Gain Budget +3):</strong> Death Eyes, Grave Whisper, plus one legacy scope upgrade to Spirit Vision.</p><p><strong>Sequence 7 Package (Gain Budget +13):</strong> Spirit Channelling, Spirit Affinity, Zombie Disguise, plus two legacy upgrades (Undead Physique and Grave Whisper).</p><p><strong>Sequence 6 Package (Gain Budget +9):</strong> Language of the Dead, Resurrection, Knowledge of Spirit World, plus two legacy upgrades (Spirit Channelling and Death Eyes).</p><p><strong>Sequence 5 Package (Gain Budget +13):</strong> Door to the Underworld, Internal Underworld, Death Envoy, plus two legacy upgrades (Resurrection and Knowledge of Spirit World).</p><p><strong>Sequence 4 Package (Gain Budget +33):</strong> Reincarnation, Underworld Authority, Spirit World Traversal, Sealing Edict, plus two legacy upgrades (Door to the Underworld and Language of the Dead).</p><p><strong>Sequence 3 Package (Gain Budget +20):</strong> Hands of Life and Death, Ferryman, Death Gaze, Styx Afloat, plus two legacy upgrades (Reincarnation and Underworld Authority).</p><p><strong>Sequence 2 Package (Gain Budget +50):</strong> Nation of the Dead, King of the Dead, Death Consul\'s Decree, Soul Shepherding, plus two legacy upgrades (Ferryman and Death Gaze).</p><p><strong>Sequence 1 Package (Gain Budget +74):</strong> Pale World, Sovereign of Spirits, Death Decree, Final Judgment Sigil, plus two legacy upgrades (Death Consul\'s Decree and Soul Shepherding).</p><p><strong>Sequence 0 Status:</strong> Pending authoring in a later sequence-focused run.</p><p><strong>Continuity Anchor:</strong> At Sequence 1 (Pale Emperor), Death Consul jurisdiction condenses into absolute decree and weathering sovereignty: color, vitality, and resistance are stripped away with ritual calm until only finality remains.</p>';
  pathway._stats = touchStats(pathway._stats, now + 1);
  await pathwaysDb.put(pathwayKey, JSON.stringify(pathway));

  const folderKey = '!folders!zFhCGCq7OxUkeaTp';
  const folder = JSON.parse(await abilitiesDb.get(folderKey));
  folder.description = 'Sequence abilities for the Corpse Collector pathway (authored through Sequence 1).';
  folder.flags = folder.flags ?? {};
  folder.flags.lotm = {
    ...(folder.flags.lotm ?? {}),
    pathwayIdentifier: 'lotm-corpse-collector',
    latestAuthoredSequence: 1
  };
  folder._stats = touchStats(folder._stats, now + 2);
  await abilitiesDb.put(folderKey, JSON.stringify(folder));

  const decreeKey = '!items!lotmAbilityC2003';
  const decree = JSON.parse(await abilitiesDb.get(decreeKey));
  appendLegacyBlock(
    decree,
    '<h3>Legacy Upgrade (Sequence 1 - Potency)</h3>',
    '<p>At Sequence 1, Death Consul\'s Decree becomes a prelude to imperial judgment. If this ability reduces a target to 0 HP, choose one creature within 30 feet of that target: it must make a Constitution save or suffer necrotic damage equal to your Potency and lose reactions until the end of its next turn. In addition, when cast with at least <strong>+4 Spirituality</strong>, the decree ignores one instance of death-prevention below True Deity tier (such as a single substitution, revival trigger, or guard effect), converting it into one failed death save instead.</p>'
  );
  decree._stats = touchStats(decree._stats, now + 3);
  await abilitiesDb.put(decreeKey, JSON.stringify(decree));

  const shepherdingKey = '!items!lotmAbilityC2004';
  const shepherding = JSON.parse(await abilitiesDb.get(shepherdingKey));
  appendLegacyBlock(
    shepherding,
    '<h3>Legacy Upgrade (Sequence 1 - Efficiency)</h3>',
    '<p>At Sequence 1, Soul Shepherding can be enacted in battlefield cadence. You may perform the baseline rite as an action if the corpse died within the last 10 minutes (instead of 1 minute), and you may maintain up to <strong>Potency</strong> active grave-prayer links at once. Once per short rest, when a linked supplicant would fail a death save, you may convert the failure into a success and immediately grant that supplicant temporary HP equal to your Potency.</p>'
  );
  shepherding._stats = touchStats(shepherding._stats, now + 4);
  await abilitiesDb.put(shepherdingKey, JSON.stringify(shepherding));

  const docs = [
    {
      _id: 'lotmAbilityC1001',
      name: 'Pale World',
      type: 'spell',
      img: 'icons/magic/death/undead-ghost-scream-teal.webp',
      system: {
        description: {
          value: '<p><strong>Baseline (0 Spirituality):</strong> As an action, create a 90-foot-radius Pale World centered on a point within 180 feet for 1 minute (concentration). Hostile creatures of your choice entering or starting their turn in the zone make a Wisdom save. On a failure, they take necrotic damage equal to <strong>2 x Potency</strong>, suffer disadvantage on ability checks relying on vision or color distinction, and the first Beyonder power they activate before the start of their next turn has its save DC reduced by 2.</p><p>Within the zone, bright light becomes dim and dim light becomes darkness, and non-artifact colored magical manifestations flicker and weaken.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+4 Spirituality:</strong> Radius becomes 150 feet and duration becomes 10 minutes.</li><li><strong>+8 Spirituality:</strong> A creature that fails by 5 or more also has its movement halved and cannot benefit from advantage on d20 tests until end of its next turn.</li><li><strong>+12 Spirituality:</strong> Once per round while the zone persists, you may choose one non-artifact ongoing effect in the zone that visibly manifests color or aura; its duration immediately decreases by 1 round (minimum 1).</li></ul><p><em>Counterplay:</em> pure-light sanctuaries, line-of-effect breaks, and anti-domain anchors can puncture Pale World pressure.</p><p><em>Corruption Hook:</em> spreading weathering over civilians or funerary sanctums for intimidation adds 1 Corruption.</p>',
          chat: ''
        },
        source: { custom: '', rules: '2024', revision: 1, license: '', book: 'LoTM Core' },
        activation: { type: 'action', condition: '', value: null },
        duration: { value: '1', units: 'minute' },
        target: {
          affects: { choice: false, count: '1', type: 'self', special: '' },
          template: { units: 'ft', contiguous: false, type: 'radius' }
        },
        range: { units: 'ft', value: '180', special: '' },
        uses: { max: '', spent: 0, recovery: [] },
        level: 8,
        school: 'nec',
        properties: ['vocal', 'somatic', 'concentration'],
        materials: { value: 'powdered bone ash sealed in pale wax', consumed: false, cost: 0, supply: 0 },
        preparation: { mode: 'always', prepared: false },
        activities: {
          corpseSeq1Act001: {
            type: 'utility',
            _id: 'corpseSeq1Act001',
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
        identifier: 'lotm-corpse-collector-pale-world',
        method: 'spell',
        prepared: 1,
        spiritualityCost: null,
        sourceClass: 'lotm-corpse-collector'
      },
      effects: [],
      folder: 'zFhCGCq7OxUkeaTp',
      flags: { dnd5e: { riders: { activity: [], effect: [] } }, lotm: { sourceBook: 'LoTM Core', grantedSequence: 1 } },
      _stats: newStats(now + 5),
      sort: 2100800,
      ownership: { default: 0 }
    },
    {
      _id: 'lotmAbilityC1002',
      name: 'Sovereign of Spirits',
      type: 'spell',
      img: 'icons/magic/control/silhouette-hold-change-blue.webp',
      system: {
        description: {
          value: '<p><strong>Baseline (0 Spirituality):</strong> As a bonus action, unveil sovereign aura for 1 minute (concentration). Hostile creatures with souls that start their turns within 60 feet make a Wisdom save. On a failure, they become <strong>Subdued</strong> until end of turn: they cannot take reactions, their speed is reduced by 15 feet, and they have disadvantage on attacks not targeting you. If they fail by 5 or more, they are also charmed by you until the start of your next turn.</p><p>Undead and spirits under your control within the aura gain bonus damage equal to your Potency once per turn.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+4 Spirituality:</strong> Aura radius becomes 90 feet and allies you choose gain advantage on saves against fear and charm while inside it.</li><li><strong>+8 Spirituality:</strong> Once per round, choose one subdued creature; it must immediately make a second Wisdom save or become <strong>Enslaved</strong> until end of your next turn (cannot willingly move farther from you and must use its action as you command, excluding self-harm orders).</li><li><strong>+12 Spirituality:</strong> Once during the duration, attempt <strong>Soul Control</strong> on one creature within 30 feet. On failed Wisdom save, extract and bind its spirit-body echo for 1 minute; the target is incapacitated while bound but repeats the save at end of each turn.</li></ul><p><em>Counterplay:</em> soulless constructs, anti-charm sanctification, and distance pressure reduce enslavement uptime.</p><p><em>Corruption Hook:</em> reducing living captives to disposable spiritual chattel adds 1 Corruption.</p>',
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
        level: 8,
        school: 'enc',
        properties: ['vocal', 'somatic', 'concentration'],
        materials: { value: 'a pale cord tied in nine knots', consumed: false, cost: 0, supply: 0 },
        preparation: { mode: 'always', prepared: false },
        activities: {
          corpseSeq1Act002: {
            type: 'utility',
            _id: 'corpseSeq1Act002',
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
        identifier: 'lotm-corpse-collector-sovereign-of-spirits',
        method: 'spell',
        prepared: 1,
        spiritualityCost: null,
        sourceClass: 'lotm-corpse-collector'
      },
      effects: [],
      folder: 'zFhCGCq7OxUkeaTp',
      flags: { dnd5e: { riders: { activity: [], effect: [] } }, lotm: { sourceBook: 'LoTM Core', grantedSequence: 1 } },
      _stats: newStats(now + 6),
      sort: 2100801,
      ownership: { default: 0 }
    },
    {
      _id: 'lotmAbilityC1003',
      name: 'Death Decree',
      type: 'spell',
      img: 'icons/magic/death/skull-energy-light-purple.webp',
      system: {
        description: {
          value: '<p><strong>Baseline (0 Spirituality):</strong> As an action, point at one creature you can clearly see within 300 feet and issue a final decree. The target makes a Constitution save. On a failure, it takes necrotic damage equal to <strong>5 x Potency</strong>, cannot regain hit points until end of your next turn, and if it is at or below <strong>6 x Potency</strong> HP after damage, it drops to 0 HP. On a success, it takes half damage and ignores the collapse clause.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+4 Spirituality:</strong> Choose up to two targets you can see; resolve saves separately.</li><li><strong>+8 Spirituality:</strong> One failed target of your choice also suffers two failed death saves if it drops to 0 HP from this decree.</li><li><strong>+12 Spirituality:</strong> Once per long rest, if one target fails by 5 or more and is below <strong>8 x Potency</strong> HP after damage, it dies instantly unless protected by equal-tier death authority or True Deity intervention.</li></ul><p><em>Counterplay:</em> breaking line of sight, obscuring pointer line, substitution mechanisms, and anti-decree seals can prevent execution.</p><p><em>Corruption Hook:</em> issuing decrees for pride or convenience rather than grave necessity adds 1 Corruption.</p>',
          chat: ''
        },
        source: { custom: '', rules: '2024', revision: 1, license: '', book: 'LoTM Core' },
        activation: { type: 'action', condition: '', value: null },
        duration: { value: '1', units: 'inst' },
        target: {
          affects: { choice: false, count: '1', type: 'creature', special: 'creature you can clearly see and point at' },
          template: { units: '', contiguous: false, type: '' }
        },
        range: { units: 'ft', value: '300', special: '' },
        uses: { max: '', spent: 0, recovery: [] },
        level: 8,
        school: 'nec',
        properties: ['vocal', 'somatic'],
        materials: { value: 'an ink-black decree needle', consumed: false, cost: 0, supply: 0 },
        preparation: { mode: 'always', prepared: false },
        activities: {
          corpseSeq1Act003: {
            type: 'utility',
            _id: 'corpseSeq1Act003',
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
        identifier: 'lotm-corpse-collector-death-decree',
        method: 'spell',
        prepared: 1,
        spiritualityCost: null,
        sourceClass: 'lotm-corpse-collector'
      },
      effects: [],
      folder: 'zFhCGCq7OxUkeaTp',
      flags: { dnd5e: { riders: { activity: [], effect: [] } }, lotm: { sourceBook: 'LoTM Core', grantedSequence: 1 } },
      _stats: newStats(now + 7),
      sort: 2100802,
      ownership: { default: 0 }
    },
    {
      _id: 'lotmAbilityC1004',
      name: 'Final Judgment Sigil',
      type: 'spell',
      img: 'icons/magic/symbols/symbol-skull-brown.webp',
      system: {
        description: {
          value: '<p><strong>Baseline (0 Spirituality):</strong> As an action, inscribe a flying serpent sigil that locks onto one creature within 180 feet for 1 minute (concentration). The target makes a Wisdom save. On failure, it is <strong>Sealed</strong>: speed becomes 0 until the start of its next turn, it cannot teleport or turn incorporeal, and it takes necrotic damage equal to your Potency whenever it attempts to cast or activate a Beyonder power. The sigil follows the target within range and line of effect.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+4 Spirituality:</strong> You may place sigils on up to two targets; each target saves separately.</li><li><strong>+8 Spirituality:</strong> The sealing duration on failed targets extends to 1 minute (repeat Wisdom save at end of each turn).</li><li><strong>+12 Spirituality:</strong> Once during the duration, force one sealed target to make an immediate Wisdom save; on failure, it is stunned until the end of your next turn and suffers weathering damage equal to <strong>2 x Potency</strong>.</li></ul><p><em>Counterplay:</em> high-tier sealing resistance, anti-mark purification, and hard cover can break sigil pursuit.</p><p><em>Corruption Hook:</em> branding surrendered or noncombatant souls with final judgment marks adds 1 Corruption.</p>',
          chat: ''
        },
        source: { custom: '', rules: '2024', revision: 1, license: '', book: 'LoTM Core' },
        activation: { type: 'action', condition: '', value: null },
        duration: { value: '1', units: 'minute' },
        target: {
          affects: { choice: false, count: '1', type: 'creature', special: 'creature within line of effect' },
          template: { units: '', contiguous: false, type: '' }
        },
        range: { units: 'ft', value: '180', special: '' },
        uses: { max: '', spent: 0, recovery: [] },
        level: 8,
        school: 'abj',
        properties: ['vocal', 'somatic', 'concentration'],
        materials: { value: 'a feather stained with pale oil', consumed: false, cost: 0, supply: 0 },
        preparation: { mode: 'always', prepared: false },
        activities: {
          corpseSeq1Act004: {
            type: 'utility',
            _id: 'corpseSeq1Act004',
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
        identifier: 'lotm-corpse-collector-final-judgment-sigil',
        method: 'spell',
        prepared: 1,
        spiritualityCost: null,
        sourceClass: 'lotm-corpse-collector'
      },
      effects: [],
      folder: 'zFhCGCq7OxUkeaTp',
      flags: { dnd5e: { riders: { activity: [], effect: [] } }, lotm: { sourceBook: 'LoTM Core', grantedSequence: 1 } },
      _stats: newStats(now + 8),
      sort: 2100803,
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
    updatedLegacy: [decreeKey, shepherdingKey],
    wroteAbilities: docs.map(d => `!items!${d._id}`)
  }, null, 2));
})();
