import { iconSizes, originalIconUrl, renderIconSvg, type IconAsset } from '../../lib/icon-assets';
import { colorPairs, pairStyle } from './icon-colors';

let instance = 0;

/** HTML版Storybookの使用例。イベントと状態は返す要素内に閉じる。 */
export function renderIconPreview(icon: IconAsset): HTMLElement {
  const root = document.createElement('main');
  root.className = 'tkw-story tkw-icon-doc tkw-icon-example';
  const prefix = `tkw-example-${++instance}`;
  root.innerHTML = `<header class="tkw-story-header"><p class="tkw-eyebrow">TOKIWAGI UI / ICONS</p><h1>${icon.name}</h1></header>
    <nav class="tkw-icon-example-links" aria-label="関連資料">
      <a href="./${icon.href}" target="_top">個別ルール</a>
      <a href="./?path=/docs/アイコン-アイコン名および用途--docs" target="_top">アイコン一覧へ戻る</a>
      <a href="./?path=/docs/icons-display--docs" target="_top">共通表示ルール</a>
    </nav>
    <div class="tkw-icon-preview">
      <div class="tkw-icon-controls"><label>色と背景<select>${colorPairs.map((pair, index) => `<option value="${index}">${pair.label}</option>`).join('')}</select></label></div>
      <div class="tkw-icon-sizes">${iconSizes.map(size => `<figure><div class="tkw-icon-swatch"><span class="tkw-icon-image" aria-hidden="true">${renderIconSvg(icon.svg, `${prefix}-${size}`, size)}</span></div><figcaption>${size}px</figcaption></figure>`).join('')}</div>
      <p class="tkw-icon-token-note">前景：<code></code><br />背景：<code></code></p>
      <div class="tkw-icon-actions"><button type="button">公開名をコピー</button><a href="${originalIconUrl(icon)}" download="${icon.name}.svg">原本SVGをダウンロード</a></div>
      <p role="status" aria-live="polite" class="tkw-icon-feedback"></p>
      <p class="tkw-icon-size-note">16〜32pxは比較用です。細部が見分けにくい場合は大きいサイズを選び、ラベルを併記してください。</p>
    </div>`;
  const select = root.querySelector('select')!;
  const tokens = root.querySelectorAll('.tkw-icon-token-note code');
  function updateColor() {
    const index = Number(select.value);
    const pair = colorPairs[index]!;
    for (const swatch of root.querySelectorAll<HTMLElement>('.tkw-icon-swatch')) Object.assign(swatch.style, pairStyle(index));
    tokens[0]!.textContent = pair.foreground;
    tokens[1]!.textContent = pair.background;
  }
  select.addEventListener('change', updateColor);
  updateColor();
  const feedback = root.querySelector<HTMLElement>('[role="status"]')!;
  root.querySelector('button')!.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(icon.name);
      feedback.textContent = `「${icon.name}」をコピーしました。`;
    } catch {
      feedback.textContent = `コピーできませんでした。公開名「${icon.name}」を選択してコピーしてください。`;
    }
  });
  return root;
}
