import { useId, useState, type CSSProperties } from 'react';
import { iconCatalog, iconsByName } from '../../lib/icon-catalog';
import { filterIcons, iconCategories, iconSizes, originalIconUrl, renderIconSvg, type IconAsset, type IconCategory } from '../../lib/icon-assets';
import { colors, secondaryColors, semanticColors } from '../../lib/palette';

const colorPairs = [
  { label: 'ニュートラル', foreground: '--tkw-color-neutral-900', background: '--tkw-color-neutral-0' },
  ...([
    ['primary', colors], ['secondary', secondaryColors], ['semantic', semanticColors],
  ] as const).flatMap(([family, rows]) => rows.flatMap(([key, label]) => [
    { label: `${label} / 通常`, foreground: `--tkw-color-${family}-${key}-on`, background: `--tkw-color-${family}-${key}` },
    { label: `${label} / 淡い背景`, foreground: `--tkw-color-${family}-${key}-on-subtle`, background: `--tkw-color-${family}-${key}-subtle` },
  ])),
];

function pairStyle(index: number): CSSProperties {
  const pair = colorPairs[index]!;
  return { color: `var(${pair.foreground})`, backgroundColor: `var(${pair.background})` };
}

function ColorSelect({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  return <label>色と背景<select value={value} onChange={event => onChange(Number(event.target.value))}>
    {colorPairs.map((pair, index) => <option key={pair.background} value={index}>{pair.label}</option>)}
  </select></label>;
}

function ColorTokens({ value }: { value: number }) {
  return <p className="tkw-icon-token-note">前景：<code>{colorPairs[value]!.foreground}</code><br />背景：<code>{colorPairs[value]!.background}</code></p>;
}

function IconImage({ icon, size = 32 }: { icon: IconAsset; size?: number }) {
  const id = useId();
  const prefix = `tkw-${id.replace(/[^\w-]/g, char => `_${char.charCodeAt(0).toString(16)}_`)}`;
  return <span className="tkw-icon-image" aria-hidden="true" dangerouslySetInnerHTML={{ __html: renderIconSvg(icon.svg, prefix, size) }} />;
}

export function IconBrowser() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<IconCategory | 'all'>('all');
  const [size, setSize] = useState(32);
  const [color, setColor] = useState(0);
  const matches = filterIcons(iconCatalog, query, category);
  return <div className="tkw-icon-browser">
    <div className="tkw-icon-controls">
      <label className="tkw-icon-search">公開名で検索<input type="search" placeholder="例：bell、calendar、off" value={query} onChange={event => setQuery(event.target.value)} /></label>
      <label>分類<select value={category} onChange={event => setCategory(event.target.value as IconCategory | 'all')}>
        <option value="all">すべて（{iconCatalog.length}）</option>
        {iconCategories.map(([key, label]) => <option key={key} value={key}>{label}（{iconCatalog.filter(icon => icon.category === key).length}）</option>)}
      </select></label>
      <label>サイズ<select value={size} onChange={event => setSize(Number(event.target.value))}>
        {iconSizes.map(value => <option key={value} value={value}>{value}px</option>)}
      </select></label>
      <ColorSelect value={color} onChange={setColor} />
    </div>
    <div className="tkw-icon-result-bar"><p role="status" aria-live="polite">{matches.length} / {iconCatalog.length}個</p>
      <button type="button" onClick={() => { setQuery(''); setCategory('all'); }}>絞り込みを解除</button>
    </div>
    <ColorTokens value={color} />
    {matches.length === 0 ? <p className="tkw-icon-empty">該当するアイコンはありません。公開名や分類を変更してください。</p> :
      <ul className="tkw-icon-grid">{matches.map(icon => <li key={icon.name}>
        <a href={`./${icon.href}`} target="_top" className="tkw-icon-card">
          <span className="tkw-icon-swatch" style={pairStyle(color)}><IconImage icon={icon} size={size} /></span>
          <code>{icon.name}</code>
        </a>
      </li>)}</ul>}
  </div>;
}

export function IconPreview({ name }: { name: string }) {
  const icon = iconsByName.get(name);
  const [color, setColor] = useState(0);
  const [message, setMessage] = useState('');
  if (!icon) throw new Error(`アイコンが見つかりません: ${name}`);
  async function copyName() {
    try {
      await navigator.clipboard.writeText(name);
      setMessage(`「${name}」をコピーしました。`);
    } catch {
      setMessage(`コピーできませんでした。公開名「${name}」を選択してコピーしてください。`);
    }
  }
  return <div className="tkw-icon-preview">
    <div className="tkw-icon-controls"><ColorSelect value={color} onChange={setColor} /></div>
    <div className="tkw-icon-sizes">{iconSizes.map(size => <figure key={size}>
      <div className="tkw-icon-swatch" style={pairStyle(color)}><IconImage icon={icon} size={size} /></div>
      <figcaption>{size}px</figcaption>
    </figure>)}</div>
    <ColorTokens value={color} />
    <div className="tkw-icon-actions">
      <button type="button" onClick={copyName}>公開名をコピー</button>
      <a href={originalIconUrl(icon)} download={`${name}.svg`}>原本SVGをダウンロード</a>
    </div>
    <p role="status" aria-live="polite" className="tkw-icon-feedback">{message}</p>
    <p className="tkw-icon-size-note">16〜32pxは比較用です。細部が見分けにくい場合は大きいサイズを選び、ラベルを併記してください。</p>
  </div>;
}
