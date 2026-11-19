/** 紹介ページ内だけで、分類と操作見本の状態を管理する。 */
export function initializeComponentGallery(document: Document) {
  const gallery = document.querySelector<HTMLElement>('[data-component-gallery]');
  if (!gallery) return;

  const filter = gallery.querySelector<HTMLSelectElement>('[data-component-filter]');
  const entries = [...gallery.querySelectorAll<HTMLElement>('[data-component-category]')];
  const count = gallery.querySelector<HTMLElement>('[data-component-count]');

  const applyFilter = () => {
    const category = filter?.value ?? 'all';
    for (const entry of entries) {
      entry.hidden = category !== 'all' && entry.dataset.componentCategory !== category;
    }
    const visibleCount = entries.filter(entry => !entry.hidden).length;
    if (count) count.textContent = category === 'all'
      ? `${visibleCount}種類のコンポーネントを表示`
      : `${filter?.selectedOptions[0]?.label}：${visibleCount}種類のコンポーネントを表示`;
  };
  filter?.addEventListener('change', applyFilter);
  // 履歴移動でブラウザーが選択値を復元した場合も、一覧と件数を揃える。
  document.defaultView?.addEventListener('pageshow', applyFilter);
  applyFilter();
  // JSが使えない場合も全見本とネイティブdetailsを読めるようにする。
  const controls = gallery.querySelector<HTMLElement>('[data-component-filters]');
  if (controls) controls.hidden = false;

  let additions = 0;
  const feedback = gallery.querySelector<HTMLElement>('[data-demo-feedback]');
  gallery.querySelector<HTMLButtonElement>('[data-demo-add]')?.addEventListener('click', () => {
    additions += 1;
    if (feedback) feedback.textContent = `追加しました（${additions}回）`;
  });
  gallery.querySelector<HTMLButtonElement>('[data-demo-reset]')?.addEventListener('click', () => {
    additions = 0;
    if (feedback) feedback.textContent = '操作を試せます';
  });

  const viewButtons = [...gallery.querySelectorAll<HTMLButtonElement>('[data-demo-view]')];
  const headerFeedback = gallery.querySelector<HTMLElement>('[data-header-feedback]');
  for (const button of viewButtons) {
    button.addEventListener('click', () => {
      for (const sibling of viewButtons) {
        const selected = sibling === button;
        sibling.toggleAttribute('data-selected', selected);
        sibling.setAttribute('aria-pressed', String(selected));
      }
      if (headerFeedback) headerFeedback.textContent = `${button.textContent?.trim()}を表示しています`;
    });
  }
}
