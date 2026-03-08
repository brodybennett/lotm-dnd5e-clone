const {Level}=require('level');

const TARGET_HEADERS = new Set([
  'Character Classes',
  'Character Origins',
  'Feats',
  'Equipment',
  'Spells',
  'Magic Items',
  'Monsters',
  'Monsters A to Z',
  'Tracking Sheets',
  'Legal Information'
]);

const RENAME_HEADERS = new Map([
  ['Spells', 'Abilities'],
  ['Magic Items', 'Beyonder Items']
]);

(async () => {
  const db = new Level('tmp/lotm_rules_new', { valueEncoding: 'utf8' });
  await db.open();

  const summary = [];

  for await (const [key, value] of db.iterator({ gte: '!journal!', lt: '!journal!~' })) {
    const journal = JSON.parse(value);
    const title = journal.flags?.dnd5e?.title;
    const header = title ?? journal.name;

    if (!TARGET_HEADERS.has(header)) continue;

    const newHeader = RENAME_HEADERS.get(header);
    if (newHeader) {
      journal.name = newHeader;
      if (journal.flags?.dnd5e?.title !== undefined) {
        journal.flags.dnd5e.title = newHeader;
      }
    }

    await db.put(key, JSON.stringify(journal));

    let pageEdits = 0;
    for (const pageId of journal.pages ?? []) {
      const pageKey = `!journal.pages!${journal._id}.${pageId}`;
      let pageValue;
      try {
        pageValue = await db.get(pageKey);
      } catch {
        continue;
      }
      const page = JSON.parse(pageValue);

      if (page.type === 'text') {
        page.text ??= { format: 1, content: '' };
        page.text.content = '';
        pageEdits++;
      } else if (page.type === 'spells') {
        page.system ??= {};
        page.system.spells = [];
        page.system.description ??= { value: '' };
        page.system.description.value = '';
        pageEdits++;
      }

      await db.put(pageKey, JSON.stringify(page));
    }

    summary.push({
      key,
      oldHeader: header,
      newHeader: newHeader ?? header,
      pageCount: journal.pages?.length ?? 0,
      pageEdits
    });
  }

  await db.close();

  console.log(JSON.stringify(summary, null, 2));
})();
