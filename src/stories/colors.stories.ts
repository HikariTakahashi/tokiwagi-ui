import type { Meta, StoryObj } from '@storybook/html-vite';
import {
  colors, neutrals, neutralTokenName, primaryForegroundTokenName, secondaryColors, secondaryForegroundTokenName,
  secondaryTokenName, semanticColors, semanticForegroundTokenName, semanticTokenName, tokenName, variants,
} from '../lib/palette';

type SwatchArgs = { color: string; state: string };
type SwatchColor = readonly [key: string, label: string, ...details: string[]];
type SwatchTokenName = (key: string, suffix: typeof variants[number][0]) => string;

const swatchStates = variants.map(([suffix, label]) => ({
  key: suffix.slice(1) || 'normal',
  suffix,
  label,
}));
const neutralColors = neutrals.map(([step, usage]) => [step, `${step}（${usage}）`] as const);

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

function swatchParameters(include: string[]) {
  return {
    layout: 'centered',
    controls: { disable: false, include, disableSaveFromUI: true },
    options: { layout: { showPanel: true } },
  };
}

function colorControl(palette: readonly SwatchColor[]) {
  return {
    name: '色',
    options: palette.map(([key]) => key),
    control: { type: 'select' as const, labels: Object.fromEntries(palette.map(([key, label]) => [key, label])) },
  };
}

function renderSwatch(label: string, background: string, foreground: string) {
  const outline = background === neutralTokenName('0') ? ' tkw-color-swatch-outlined' : '';
  return `<div class="tkw-color-swatch${outline}" role="img" aria-label="${label}" style="background-color:var(${background});color:var(${foreground})">Aa あいう</div>`;
}

function swatchStory(
  palette: readonly [SwatchColor, ...SwatchColor[]],
  backgroundName: SwatchTokenName,
  foregroundName: SwatchTokenName,
) {
  const defaultColor = palette[0];
  return {
    parameters: swatchParameters(['色', '状態']),
    args: { color: defaultColor[0], state: 'normal' },
    argTypes: {
      color: colorControl(palette),
      state: {
        name: '状態',
        options: swatchStates.map(({ key }) => key),
        control: { type: 'select', labels: Object.fromEntries(swatchStates.map(({ key, label }) => [key, label])) },
      },
    },
    render: ({ color, state }) => {
      const [key, colorLabel] = palette.find(([value]) => value === color) ?? defaultColor;
      const { suffix, label } = swatchStates.find(({ key }) => key === state) ?? swatchStates[0]!;
      return renderSwatch(`${colorLabel}・${label}`, backgroundName(key, suffix), foregroundName(key, suffix));
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

export const Semantic = {
  ...swatchStory(semanticColors, semanticTokenName, semanticForegroundTokenName),
  name: 'セマンティック · 24トークン',
  tags: ['!autodocs'],
};

const defaultNeutral = neutralColors[0]!;

export const Neutrals = {
  name: 'ニュートラル · 9トークン',
  tags: ['!autodocs'],
  parameters: swatchParameters(['色']),
  args: { color: defaultNeutral[0] },
  argTypes: { color: colorControl(neutralColors) },
  render: ({ color }) => {
    const [step, label] = neutralColors.find(([key]) => key === color) ?? defaultNeutral;
    return renderSwatch(label, neutralTokenName(step), neutralTokenName(Number(step) >= 600 ? '0' : '900'));
  },
} satisfies StoryObj<{ color: string }>;
