import { filterIcons, iconCategories, iconSizes, renderIconSvg, type IconCategory, type IconSearchEntry } from '../lib/icon-assets';

/** LPのサーバー描画済み一覧を使い、検索・表示サイズ・詳細表示だけを拡張する。 */
export function initializeIconCatalog(document: Document, window: Window) {
  const catalog = document.querySelector<HTMLElement>('[data-icon-catalog]');
  if (!catalog) return;
  const search = catalog.querySelector<HTMLInputElement>('[data-icon-search]')!;
  const sizeSelect = catalog.querySelector<HTMLSelectElement>('[data-icon-size]')!;
  const buttons = [...catalog.querySelectorAll<HTMLButtonElement>('[data-icon-category]')];
  const entries = [...catalog.querySelectorAll<HTMLElement>('[data-icon-entry]')];
  const count = catalog.querySelector<HTMLElement>('[data-icon-count]')!;
  const title = catalog.querySelector<HTMLElement>('[data-icon-category-title]')!;
  const empty = catalog.querySelector<HTMLElement>('[data-icon-empty]')!;
  const dialog = catalog.querySelector<HTMLDialogElement>('[data-icon-dialog]')!;
  const items = entries.map(entry => ({
    name: entry.dataset.name!, category: entry.dataset.category as IconCategory,
    searchLabels: JSON.parse(entry.dataset.searchLabels!) as string[], href: entry.querySelector<HTMLAnchorElement>('[data-icon-card]')!.href,
    entry,
  } satisfies IconSearchEntry & { entry: HTMLElement }));
  let category: IconCategory | 'all' = 'all';
  let opener: HTMLAnchorElement | undefined;

  const render = () => {
    const matches = new Set(filterIcons(items, search.value, category).map(item => item.name));
    for (const item of items) item.entry.hidden = !matches.has(item.name);
    for (const button of buttons) button.setAttribute('aria-pressed', String(button.dataset.iconCategory === category));
    const label = iconCategories.find(([key]) => key === category)?.[1];
    title.textContent = label ?? 'すべてのアイコン';
    count.textContent = `${matches.size} / ${items.length}件`;
    empty.hidden = matches.size !== 0;
    // 原本のviewBox・座標・線幅・色を変えず、実寸だけを更新する。
    for (const svg of catalog.querySelectorAll<SVGElement>('.icons-glyph > svg')) {
      svg.setAttribute('width', sizeSelect.value);
      svg.setAttribute('height', sizeSelect.value);
    }
  };
  const restore = () => {
    const params = new URL(window.location.href).searchParams;
    search.value = params.get('q') ?? '';
    const requestedCategory = params.get('category');
    category = iconCategories.find(([key]) => key === requestedCategory)?.[0] ?? 'all';
    const requestedSize = Number(params.get('size'));
    sizeSelect.value = iconSizes.some(size => size === requestedSize) ? String(requestedSize) : '24';
    render();
  };
  const update = () => {
    render();
    const url = new URL(window.location.href);
    for (const [key, value] of [['q', search.value.trim()], ['category', category === 'all' ? '' : category], ['size', sizeSelect.value === '24' ? '' : sizeSelect.value]] as const) {
      if (value) url.searchParams.set(key, value);
      else url.searchParams.delete(key);
    }
    window.history.replaceState(null, '', url);
  };
  search.addEventListener('input', update);
  sizeSelect.addEventListener('change', update);
  for (const button of buttons) button.addEventListener('click', () => {
    category = button.dataset.iconCategory as IconCategory | 'all';
    update();
  });
  catalog.querySelector('[data-icon-reset]')!.addEventListener('click', () => {
    search.value = '';
    category = 'all';
    update();
    search.focus();
  });

  // 未対応ブラウザーやJS無効時は、各カードの使用ルールへの通常リンクをそのまま使う。
  if (typeof dialog.showModal === 'function') {
    for (const item of items) {
      const card = item.entry.querySelector<HTMLAnchorElement>('[data-icon-card]')!;
      card.setAttribute('aria-haspopup', 'dialog');
      card.setAttribute('aria-controls', 'icon-detail');
      card.addEventListener('click', event => {
        if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        opener = card;
        dialog.querySelector('[data-icon-detail-name]')!.textContent = item.name;
        dialog.querySelector('[data-icon-detail-description]')!.textContent = item.entry.dataset.description!;
        dialog.querySelector('[data-icon-detail-status]')!.textContent = item.name === 'bell' ? '詳細ルール：確定' : '詳細ルール：案';
        dialog.querySelector<HTMLAnchorElement>('[data-icon-detail-link]')!.href = card.href;
        // 共通レンダラーで参照IDを分離し、一覧とmoon/tool等を同時表示しても干渉させない。
        const svg = card.querySelector('svg')!;
        dialog.querySelector('[data-icon-detail-preview]')!.innerHTML = renderIconSvg(svg.outerHTML, `catalog-detail-${item.name}`, 32);
        dialog.showModal();
      });
    }
    dialog.id = 'icon-detail';
    dialog.addEventListener('close', () => opener?.focus());
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
    });
  }
  window.addEventListener('popstate', restore);
  window.addEventListener('pageshow', restore);
  restore();
  for (const controls of catalog.querySelectorAll<HTMLElement>('[data-icon-controls]')) controls.hidden = false;
}
