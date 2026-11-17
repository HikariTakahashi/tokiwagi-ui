import type { Meta, StoryObj } from '@storybook/html-vite';
import rawSemantic from '../../tokens/semantic.css?raw';
import rawNeutral from '../../tokens/neutrals.css?raw';
import {
  colors, contrast, neutrals, neutralTokenName, parseNeutralTokens,
  parseSemanticTokens, primaryForegroundTokenName, secondaryColors, secondaryForegroundTokenName,
  secondaryTokenName, semanticColors, semanticTokenName, tokenName, variants,
} from '../lib/palette';

const semantic = parseSemanticTokens(rawSemantic);
const neutral = parseNeutralTokens(rawNeutral);

type SwatchArgs = { color: string; state: string };
type SwatchColor = readonly [key: string, label: string, ...details: string[]];
type SwatchTokenName = (key: string, suffix: typeof variants[number][0]) => string;

const swatchStates = variants.map(([suffix, label]) => ({
  key: suffix.slice(1) || 'normal',
  suffix,
  label,
}));

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

function semanticVariantCard(key: string, suffix: string, label: string): string {
  const token = semanticTokenName(key, suffix);
  const foreground = semanticTokenName(key, suffix === '-subtle' ? '-on-subtle' : '-on');
  const ratio = contrast(semantic[token]!, semantic[foreground]!);
  const result = ratio >= 4.5 ? '適合' : '要確認';
  return `<div class="tkw-variant">
    <div class="tkw-variant-swatch" style="background:var(${token});color:var(${foreground})">
      <span>${label}</span><strong>Aa あいう</strong><code>${semantic[token]}</code>
    </div>
    <div class="tkw-variant-meta"><code>${token}</code><span class="${ratio < 4.5 ? 'tkw-fail' : ''}">${ratio.toFixed(2)}:1 · ${result}</span></div>
    <div class="tkw-foreground"><span>文字・アイコン</span><code>${foreground} = ${semantic[foreground]}</code></div>
  </div>`;
}

function semanticColorCard([key, name, purpose, icon, title, description]: typeof semanticColors[number]): string {
  const base = semanticTokenName(key);
  const on = semanticTokenName(key, '-on');
  const subtle = semanticTokenName(key, '-subtle');
  const onSubtle = semanticTokenName(key, '-on-subtle');
  const hover = semanticTokenName(key, '-hover');
  const active = semanticTokenName(key, '-active');
  return `<article class="tkw-color-card">
    <div class="tkw-color-heading"><div><span class="tkw-key">${key}</span><h2>${name}</h2><p>${purpose}</p></div><code>${base}</code></div>
    <div class="tkw-variant-grid">${variants.map(([suffix, label]) => semanticVariantCard(key, suffix, label)).join('')}</div>
    <div class="tkw-demo" style="--tkw-demo-bg:var(${base});--tkw-demo-hover:var(${hover});--tkw-demo-active:var(${active});--tkw-demo-on:var(${on});--tkw-demo-subtle:var(${subtle});--tkw-demo-on-subtle:var(${onSubtle})">
      <span class="tkw-demo-label">使用例</span>
      <button type="button">${icon} ${title}</button>
      <span class="tkw-demo-tag">${name}のラベル</span>
      <div class="tkw-demo-panel"><strong>${title}</strong><span>${description}</span></div>
    </div>
  </article>`;
}

function semanticPage(title: string, lead: string, note: string): HTMLElement {
  const ratios = semanticColors.flatMap(([key]) => variants.map(([suffix]) => {
    const background = semanticTokenName(key, suffix);
    const foreground = semanticTokenName(key, suffix === '-subtle' ? '-on-subtle' : '-on');
    return contrast(semantic[background]!, semantic[foreground]!);
  }));
  const failures = ratios.filter(ratio => ratio < 4.5).length;
  const summary = `<div class="tkw-summary ${failures ? 'tkw-fail' : ''}"><strong>${failures ? `要確認：${failures}組が4.5:1未満` : `${ratios.length} / ${ratios.length} 組が4.5:1以上`}</strong><span>通常サイズの文字に対する背景と文字の組み合わせ</span></div>`;
  return page(title, lead, `<p class="tkw-rule">${note}</p>${summary}<div class="tkw-color-list">${semanticColors.map(semanticColorCard).join('')}</div>`);
}

function swatchStory(
  palette: readonly [SwatchColor, ...SwatchColor[]],
  backgroundName: SwatchTokenName,
  foregroundName: SwatchTokenName,
) {
  const defaultColor = palette[0];
  return {
    parameters: {
      layout: 'centered',
      controls: { disable: false, include: ['色', '状態'], disableSaveFromUI: true },
      options: { layout: { showPanel: true } },
    },
    args: { color: defaultColor[0], state: 'normal' },
    argTypes: {
      color: {
        name: '色',
        options: palette.map(([key]) => key),
        control: { type: 'select', labels: Object.fromEntries(palette.map(([key, label]) => [key, label])) },
      },
      state: {
        name: '状態',
        options: swatchStates.map(({ key }) => key),
        control: { type: 'select', labels: Object.fromEntries(swatchStates.map(({ key, label }) => [key, label])) },
      },
    },
    render: ({ color, state }) => {
      const [key, colorLabel] = palette.find(([value]) => value === color) ?? defaultColor;
      const { suffix, label } = swatchStates.find(({ key }) => key === state) ?? swatchStates[0]!;
      const background = backgroundName(key, suffix);
      const foreground = foregroundName(key, suffix);
      return `<div class="tkw-color-swatch" role="img" aria-label="${colorLabel}・${label}" style="background-color:var(${background});color:var(${foreground})">Aa あいう</div>`;
    },
  } satisfies StoryObj<SwatchArgs>;
}

export const Primary = {
  ...swatchStory(colors, tokenName, primaryForegroundTokenName),
  name: 'プライマリー · 42トークン',
  tags: ['!autodocs'],
};

export const Secondary = {
  ...swatchStory(secondaryColors, secondaryTokenName, secondaryForegroundTokenName),
  name: 'セカンダリー · 18トークン',
  tags: ['!autodocs'],
};

export const Semantic: Story = {
  name: 'セマンティック · 24トークン',
  render: () => semanticPage(
    '状態を、色とことばで伝える。',
    '4状態 × 6トークン。通常・ホバー・押下は操作に、淡い背景は通知やバナーに使います。',
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
