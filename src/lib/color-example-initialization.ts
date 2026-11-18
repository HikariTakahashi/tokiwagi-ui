// 表示直前か最初の操作時に初期化し、画面外のエディターとプレビューの生成を避ける。
export function initializeColorExamples(panels: Iterable<HTMLElement>, setup: (panel: HTMLElement) => void) {
  const initialized = new WeakSet<HTMLElement>();
  const observer = typeof IntersectionObserver === 'undefined' ? undefined : new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting) initialize(entry.target as HTMLElement);
    }
  }, { rootMargin: '200px 0px' });

  function initialize(panel: HTMLElement) {
    if (initialized.has(panel)) return;
    initialized.add(panel);
    observer?.unobserve(panel);
    panel.removeEventListener('focusin', onInteraction);
    panel.removeEventListener('pointerdown', onInteraction, true);
    setup(panel);
  }

  function onInteraction(event: Event) {
    initialize(event.currentTarget as HTMLElement);
  }

  for (const panel of panels) {
    if (!observer || panel.contains(panel.ownerDocument.activeElement)) {
      initialize(panel);
    } else {
      panel.addEventListener('focusin', onInteraction);
      panel.addEventListener('pointerdown', onInteraction, true);
      observer.observe(panel);
    }
  }
}
