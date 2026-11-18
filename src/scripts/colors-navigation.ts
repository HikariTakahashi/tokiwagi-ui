function initializeColorsNavigation() {
  const toc = document.querySelector<HTMLDetailsElement>('[data-colors-toc]');
  const main = document.getElementById('main');
  if (!toc || !main) return;

  const entries = [...toc.querySelectorAll<HTMLElement>('[data-toc-target], a[href^="#"]')].map(control => ({
    control,
    target: document.getElementById(control.dataset.tocTarget ?? control.getAttribute('href')!.slice(1))!,
  }));
  const groups = [...toc.querySelectorAll<HTMLElement>('[data-toc-group]')];
  const disclosures = [...toc.querySelectorAll<HTMLDetailsElement>('[data-toc-disclosure]')];
  const desktop = window.matchMedia('(min-width: 1024px)');
  const manuallyOpened = new Set<HTMLDetailsElement>();
  let previousDisclosure: HTMLDetailsElement | null = null;
  let hashNavigationPending = false;

  function updateCurrentLocation() {
    // LPと同じく画面上から1/3を基準にし、親項目より後に並ぶ色の見出しを優先する。
    const position = window.innerHeight / 3;
    // 最終セクションが短く基準位置まで上がらない場合も、ページ末尾では最後の項目を示す。
    const atBottom = window.scrollY > 0 && Math.ceil(window.scrollY + window.innerHeight) >= document.documentElement.scrollHeight;
    const current = atBottom ? entries.at(-1) : entries.findLast(({ target }) => target.getBoundingClientRect().top <= position);
    const disclosure = current?.control.closest<HTMLDetailsElement>('[data-toc-disclosure]') ?? null;
    const focusedElement = document.activeElement;
    const keyboardInMenu = focusedElement instanceof HTMLElement
      && toc!.contains(focusedElement)
      && focusedElement.matches(':focus-visible');
    const automaticChangesPaused = (!desktop.matches && toc!.open) || keyboardInMenu;

    // 系統を移動したときだけ開閉し、同じ系統での手動クローズを尊重する。
    if (!automaticChangesPaused && (disclosure !== previousDisclosure || hashNavigationPending)) {
      for (const group of disclosures) {
        const shouldOpen = manuallyOpened.has(group) || group === disclosure;
        if (group.open !== shouldOpen) group.open = shouldOpen;
      }
      previousDisclosure = disclosure;
      hashNavigationPending = false;
    }

    const currentControl = disclosure && !disclosure.open ? disclosure.querySelector('summary') : current?.control;

    for (const { control } of entries) {
      if (control === currentControl) control.setAttribute('aria-current', 'location');
      else control.removeAttribute('aria-current');
    }
    for (const group of groups) {
      group.toggleAttribute('data-current-group', Boolean(currentControl && group.contains(currentControl)));
    }
  }

  let scheduled = false;
  function scheduleUpdate() {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(() => {
      scheduled = false;
      updateCurrentLocation();
    });
  }

  function updateDisclosure() {
    toc!.open = desktop.matches;
    scheduleUpdate();
  }

  function handleHashNavigation() {
    const entry = entries.find(({ target }) => target.id === window.location.hash.slice(1));
    hashNavigationPending = Boolean(entry?.control.closest('[data-toc-disclosure]'));
    scheduleUpdate();
  }

  for (const link of toc.querySelectorAll<HTMLAnchorElement>('a[href^="#"]')) {
    link.addEventListener('click', () => {
      if (!desktop.matches) toc.open = false;
    });
  }

  desktop.addEventListener('change', updateDisclosure);
  toc.addEventListener('toggle', scheduleUpdate);
  toc.addEventListener('focusin', scheduleUpdate);
  toc.addEventListener('focusout', scheduleUpdate);
  toc.addEventListener('keydown', scheduleUpdate);
  for (const disclosure of disclosures) {
    // 自動開閉でもtoggleが発生するため、手動操作はsummaryのクリックで記録する。
    disclosure.querySelector('summary')!.addEventListener('click', () => {
      if (disclosure.open) manuallyOpened.delete(disclosure);
      else manuallyOpened.add(disclosure);
    });
    disclosure.addEventListener('toggle', scheduleUpdate);
  }
  document.addEventListener('pointerdown', scheduleUpdate);
  window.addEventListener('scroll', scheduleUpdate, { passive: true });
  window.addEventListener('resize', scheduleUpdate);
  window.addEventListener('hashchange', handleHashNavigation);
  window.addEventListener('pageshow', scheduleUpdate);
  new ResizeObserver(scheduleUpdate).observe(main);
  updateDisclosure();
  handleHashNavigation();
}

initializeColorsNavigation();
