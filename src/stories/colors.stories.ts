import type { Meta, StoryObj } from '@storybook/html-vite';
import rawPrimary from '../../tokens/colors.css?raw';
import rawSecondary from '../../tokens/secondary.css?raw';
import rawSemantic from '../../tokens/semantic.css?raw';
import rawNeutral from '../../tokens/neutrals.css?raw';
import {
  colors, contrast, neutrals, neutralTokenName, parseNeutralTokens,
  parseSecondaryTokens, parseSemanticTokens, parseTokens, secondaryColors,
  secondaryTokenName, semanticColors, semanticTokenName, tokenName, variants,
} from '../lib/palette';

const primary = parseTokens(rawPrimary);
const secondary = parseSecondaryTokens(rawSecondary);
const semantic = parseSemanticTokens(rawSemantic);
const neutral = parseNeutralTokens(rawNeutral);

type Family = 'primary' | 'secondary' | 'semantic';
type TokenMap = Record<string, string>;
type ColorRow = { key: string; name: string; purpose: string; example?: string; description?: string; icon?: string };

const nameFor: Record<Family, (key: string, suffix?: string) => string> = {
  primary: tokenName,
  secondary: secondaryTokenName,
  semantic: semanticTokenName,
};

const meta = {
  title: 'カラー/トークンと使用例',
  parameters: {
    docs: {
      description: {
        component: '値の定義元は tokens/ の CSS です。各見本とコントラスト比は同じ定義を読み込んで表示します。',
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function page(title: string, lead: string, body: string): HTMLElement {
  const root = document.createElement('main');
  root.className = 'tkw-story';
  root.innerHTML = `<header class="tkw-story-header"><p class="tkw-eyebrow">TOKIWAGI UI / COLORS</p><h1>${title}</h1><p>${lead}</p></header>${body}`;
  return root;
}

function variantCard(family: Family, key: string, tokens: TokenMap, suffix: string, label: string): string {
  const token = nameFor[family](key, suffix);
  const foreground = nameFor[family](key, suffix === '-subtle' ? '-on-subtle' : '-on');
  const ratio = contrast(tokens[token]!, tokens[foreground]!);
  const result = ratio >= 4.5 ? '適合' : '要確認';
  return `<div class="tkw-variant">
    <div class="tkw-variant-swatch" style="background:var(${token});color:var(${foreground})">
      <span>${label}</span><strong>Aa あいう</strong><code>${tokens[token]}</code>
    </div>
    <div class="tkw-variant-meta"><code>${token}</code><span class="${ratio < 4.5 ? 'tkw-fail' : ''}">${ratio.toFixed(2)}:1 · ${result}</span></div>
    <div class="tkw-foreground"><span>文字・アイコン</span><code>${foreground} = ${tokens[foreground]}</code></div>
  </div>`;
}

function colorCard(family: Family, row: ColorRow, tokens: TokenMap): string {
  const base = nameFor[family](row.key);
  const on = nameFor[family](row.key, '-on');
  const subtle = nameFor[family](row.key, '-subtle');
  const onSubtle = nameFor[family](row.key, '-on-subtle');
  const hover = nameFor[family](row.key, '-hover');
  const active = nameFor[family](row.key, '-active');
  return `<article class="tkw-color-card">
    <div class="tkw-color-heading"><div><span class="tkw-key">${row.key}</span><h2>${row.name}</h2><p>${row.purpose}</p></div><code>${base}</code></div>
    <div class="tkw-variant-grid">${variants.map(([suffix, label]) => variantCard(family, row.key, tokens, suffix, label)).join('')}</div>
    <div class="tkw-demo" style="--tkw-demo-bg:var(${base});--tkw-demo-hover:var(${hover});--tkw-demo-active:var(${active});--tkw-demo-on:var(${on});--tkw-demo-subtle:var(${subtle});--tkw-demo-on-subtle:var(${onSubtle})">
      <span class="tkw-demo-label">使用例</span>
      <button type="button">${row.icon ?? '＋'} ${row.example ?? 'タスクを追加'}</button>
      <span class="tkw-demo-tag">${row.name}のラベル</span>
      <div class="tkw-demo-panel"><strong>${row.example ?? '次のアイデアをまとめる'}</strong><span>${row.description ?? row.purpose}</span></div>
    </div>
  </article>`;
}

function familyPage(title: string, lead: string, family: Family, rows: ColorRow[], tokens: TokenMap, note: string): HTMLElement {
  const ratios = rows.flatMap(row => variants.map(([suffix]) => {
    const background = nameFor[family](row.key, suffix);
    const foreground = nameFor[family](row.key, suffix === '-subtle' ? '-on-subtle' : '-on');
    return contrast(tokens[background]!, tokens[foreground]!);
  }));
  const failures = ratios.filter(ratio => ratio < 4.5).length;
  const summary = `<div class="tkw-summary ${failures ? 'tkw-fail' : ''}"><strong>${failures ? `要確認：${failures}組が4.5:1未満` : `${ratios.length} / ${ratios.length} 組が4.5:1以上`}</strong><span>通常サイズの文字に対する背景と文字の組み合わせ</span></div>`;
  return page(title, lead, `<p class="tkw-rule">${note}</p>${summary}<div class="tkw-color-list">${rows.map(row => colorCard(family, row, tokens)).join('')}</div>`);
}

export const Primary: Story = {
  name: 'プライマリー · 42トークン',
  render: () => familyPage(
    '7色、それぞれが主役。',
    '7色 × 6トークン。プロジェクトやカテゴリに応じて色を選び、同じ対象には画面間で同じ色を使います。',
    'primary',
    colors.map(([key, name]) => ({ key, name, purpose: '主要操作・カテゴリ・選択状態。広い背景には淡い色を使う。' })),
    primary,
    '7色に優先順位はありません。主要操作の色は文脈に応じて選び、文字とアイコンには対応する on / on-subtle を組み合わせます。',
  ),
};

export const Secondary: Story = {
  name: 'セカンダリー · 18トークン',
  render: () => familyPage(
    '主役を支える3色。',
    '3色 × 6トークン。装飾、分類、補助的な強調に使用します。',
    'secondary',
    secondaryColors.map(([key, name, purpose]) => ({ key, name, purpose })),
    secondary,
    '3色に優先順位はありません。成功・警告・エラー・情報など、意味の固定された状態にはセマンティックカラーを使います。',
  ),
};

export const Semantic: Story = {
  name: 'セマンティック · 24トークン',
  render: () => familyPage(
    '状態を、色とことばで伝える。',
    '4状態 × 6トークン。通常・ホバー・押下は操作に、淡い背景は通知やバナーに使います。',
    'semantic',
    semanticColors.map(([key, name, purpose, icon, title, description]) => ({ key, name, purpose, icon, example: title, description })),
    semantic,
    '状態を色だけで伝えず、アイコン・見出し・説明文を併用します。同じ状態には画面間で同じ意味と色を使います。',
  ),
};

export const Neutrals: Story = {
  name: 'ニュートラル · 9トークン',
  render: () => page(
    '画面を支える9段階。',
    '白とニュートラルグレーを画面の土台に使います。ライトモードを対象とします。',
    `<div class="tkw-neutral-grid">${neutrals.map(([step, usage]) => {
      const token = neutralTokenName(step);
      const ink = Number(step) >= 600 ? 'var(--tkw-color-neutral-0)' : 'var(--tkw-color-neutral-900)';
      return `<article class="tkw-neutral-card"><div class="tkw-neutral-swatch" style="background:var(${token});color:${ink}"><span>${step}</span><strong>Aa</strong><code>${neutral[token]}</code></div><h2>${usage}</h2><code>${token}</code></article>`;
    }).join('')}</div><div class="tkw-neutral-example"><div><span>見出し / 900</span><strong>今日のタスク</strong></div><div><span>本文 / 800</span><p>優先度の高いタスクから進めましょう。</p></div><div><span>補助 / 600</span><p>最終更新 10分前</p></div><button type="button" disabled>無効状態 / 400</button></div><p class="tkw-rule">通常の見出しには900、本文には800を使います。1000は最大コントラストが必要な場合に限ります。</p>`,
  ),
};
