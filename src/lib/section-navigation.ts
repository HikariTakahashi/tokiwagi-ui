/** Astroの静的リンクに、閲覧中のセクションとTHeaderLinkのactive状態を接続する。 */
export function initializeSectionNavigation(document: Document, window: Window) {
  const links = [...document.querySelectorAll<HTMLAnchorElement>('[data-section-navigation] a[href^="#"]')];
  const sections = [...document.querySelectorAll<HTMLElement>('main > section')];
  if (!links.length || !sections.length) return;

  const update = () => {
    // 画面上から1/3の位置にあるセクションを現在地とする。
    // Heroや末尾のセクションも調べ、対象外では両方のactiveを解除する。
    const position = window.innerHeight / 3;
    const current = sections.find(section => {
      const bounds = section.getBoundingClientRect();
      return bounds.top <= position && bounds.bottom > position;
    });

    for (const link of links) {
      const active = Boolean(current?.id && link.hash === `#${current.id}`);
      // Astro部品は静的HTMLを出力するため、active propが出力する属性を更新する。
      // 背景・下線・フォーカスの描画はTokiwagi UIの共有CSSに任せる。
      link.toggleAttribute('data-active', active);
      if (active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    }
  };

  // スクロール中の連続通知を、描画フレームごとに1回へまとめる。
  let scheduled = false;
  const scheduleUpdate = () => {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(() => {
      scheduled = false;
      update();
    });
  };

  window.addEventListener('scroll', scheduleUpdate, { passive: true });
  window.addEventListener('resize', scheduleUpdate);
  window.addEventListener('hashchange', scheduleUpdate);
  window.addEventListener('pageshow', scheduleUpdate);
  update();
}
