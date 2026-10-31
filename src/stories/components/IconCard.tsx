import { useEffect, useId, useRef, useState, type CSSProperties } from 'react';
import { renderIconSvg, type IconSearchEntry } from '../../lib/icon-assets';
import { loadIconSvg } from './icon-svg-loader';

export function IconCard({ icon, size, style, load = loadIconSvg }: {
  icon: IconSearchEntry; size: number; style: CSSProperties; load?: typeof loadIconSvg;
}) {
  const anchor = useRef<HTMLAnchorElement>(null);
  const [visible, setVisible] = useState(false);
  const [svg, setSvg] = useState<string>();
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const id = useId();
  const prefix = `tkw-${id.replace(/[^\w-]/g, char => `_${char.charCodeAt(0).toString(16)}_`)}`;

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') { setVisible(true); return; }
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      setVisible(true);
      observer.disconnect();
    }, { rootMargin: '200px' });
    observer.observe(anchor.current!);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    let active = true;
    setError(false);
    load(icon).then(value => { if (active) setSvg(value); })
      .catch(() => { if (active) setError(true); });
    return () => { active = false; };
  }, [visible, icon, attempt, load]);

  return <li>
    <a ref={anchor} href={`./${icon.href}`} target="_top" className="tkw-icon-card">
      <span className="tkw-icon-swatch" style={style}>
        {svg ? <span className="tkw-icon-image" aria-hidden="true" dangerouslySetInnerHTML={{ __html: renderIconSvg(svg, prefix, size) }} />
          : <span aria-hidden="true">{error ? '!' : '…'}</span>}
      </span>
      <code>{icon.name}</code>
    </a>
    {error && <div className="tkw-icon-load-error" role="alert"><span>{icon.name}の画像を読み込めませんでした。</span>
      <button type="button" onClick={() => setAttempt(value => value + 1)}>再試行</button>
    </div>}
  </li>;
}
