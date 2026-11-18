import primaryCss from '../../tokens/colors.css?raw';
import secondaryCss from '../../tokens/secondary.css?raw';
import semanticCss from '../../tokens/semantic.css?raw';
import neutralCss from '../../tokens/neutrals.css?raw';
import typographyCss from '../../tokens/typography.css?raw';
import { neutralTokenName, parseNeutralTokens, semanticColors } from './palette';

export type SemanticColor = typeof semanticColors[number][0];
type SemanticContent = typeof semanticColors[number];

export interface ColorExampleVariant {
  label: string;
  english: string;
  token: string;
  hex: string;
  foreground: string;
  foregroundHex: string;
  contrastRatio: string;
  purpose?: string;
}

export const colorExamples = {
  button: { label: 'ボタン', selector: '.button', markup: () => '<button type="button" class="button">追加</button>' },
  label: { label: 'ラベル', selector: '.label', markup: () => '<span class="label">カテゴリ</span>' },
  card: { label: 'カード', selector: '.sample-card', markup: () => '<article class="sample-card">今週の予定</article>' },
} as const;

const inputMessages: Record<SemanticColor, string> = {
  success: '入力内容を確認しました',
  warning: '入力内容をご確認ください',
  error: '必須項目です',
  info: '半角英数字で入力してください',
};

export const semanticColorExamples = {
  banner: {
    label: '通知バナー',
    selector: '.notification-banner',
    markup: ([, , , icon, title, description]: SemanticContent) =>
      '<div class="notification-banner" role="status"><span class="semantic-icon" aria-hidden="true">' + icon
      + '</span><div><strong>' + title + '</strong><p class="banner-description">' + description + '</p></div></div>',
  },
  toast: {
    label: 'トースト',
    selector: '.notification-toast',
    markup: ([, , , icon, title]: SemanticContent) =>
      '<div class="notification-toast" role="status"><span class="semantic-icon" aria-hidden="true">' + icon
      + '</span><span>' + title + '</span></div>',
  },
  input: {
    label: '入力メッセージ',
    selector: '.input-message',
    markup: ([key, , , icon]: SemanticContent) =>
      '<div class="input-example"><label for="example-input">プロジェクトID</label>'
      + '<input id="example-input" type="text" readonly aria-describedby="input-feedback" value="'
      + (key === 'error' ? '' : 'weekly_meeting') + '"'
      + (key === 'error' ? ' aria-invalid="true"' : '')
      + '><div class="input-message" id="input-feedback" role="status"><span class="semantic-icon" aria-hidden="true">'
      + icon + '</span><span>' + inputMessages[key] + '</span></div></div>',
  },
} as const;

export const neutralColorExamples = {
  background: {
    label: '背景',
    selector: '.neutral-background',
    markup: () => '<section class="neutral-background"><strong>今週の予定</strong><p>今日のタスクを確認しましょう。</p></section>',
  },
  text: {
    label: 'テキスト',
    selector: '.neutral-text',
    markup: () => '<p class="neutral-text">タスクを確認する</p>',
  },
  border: {
    label: '境界線',
    selector: '.neutral-border',
    markup: () => '<div class="neutral-border"><p>午前の予定</p><hr><p>午後の予定</p></div>',
  },
} as const;

const examples = { ...colorExamples, ...semanticColorExamples, ...neutralColorExamples };
const neutralTokens = parseNeutralTokens(neutralCss);
export type ColorExample = keyof typeof examples;

export function colorExampleCss(variant: ColorExampleVariant, example: ColorExample, useHex: boolean) {
  const selectedColor = useHex ? variant.hex : 'var(' + variant.token + ')';
  const counterpart = useHex ? variant.foregroundHex : 'var(' + variant.foreground + ')';
  let background = selectedColor;
  let color = counterpart;
  const borderDeclarations: string[] = [];

  if (example === 'text' || example === 'border') {
    background = counterpart;
    color = selectedColor;
  }
  if (example === 'border') {
    const ink = neutralTokenName(variant.foreground === neutralTokenName('0') ? '900' : '0');
    color = useHex ? neutralTokens[ink]! : 'var(' + ink + ')';
    borderDeclarations.push('  border-color: ' + selectedColor + ';');
  }

  return [
    examples[example].selector + ' {',
    '  background: ' + background + ';',
    '  color: ' + color + ';',
    ...borderDeclarations,
    '  font-size: 24px;',
    '  font-weight: 700;',
    '}',
  ].join('\n');
}

const previewStyles = [
  primaryCss, secondaryCss, semanticCss, neutralCss, typographyCss,
  'body { margin: 0; display: grid; place-items: center; min-height: 100vh; color: var(--tkw-color-neutral-900); font: 14px var(--tkw-font-family-sans); }',
  '.button, .label, .sample-card { font: inherit; border: 0; border-radius: 6px; margin: 8px; padding: 6px 12px; overflow-wrap: anywhere; }',
  '.label { border-radius: 999px; }',
  '.sample-card { padding: 10px; text-align: center; }',
  '.notification-banner, .notification-toast, .input-message { display: flex; align-items: flex-start; gap: 8px; min-width: 0; padding: 12px; border-radius: 6px; line-height: 1.5; overflow-wrap: anywhere; }',
  '.notification-banner { box-sizing: border-box; width: calc(100% - 24px); margin: 12px; }',
  '.notification-toast { box-sizing: border-box; max-width: calc(100% - 24px); margin: 12px; border-radius: 10px; }',
  '.semantic-icon { flex-shrink: 0; }',
  '.banner-description { margin: 4px 0 0; font-size: 14px; font-weight: 400; }',
  '.input-example { box-sizing: border-box; display: grid; gap: 8px; width: 100%; padding: 12px; }',
  '.input-example label { font-weight: 600; }',
  '.input-example input { box-sizing: border-box; width: 100%; min-width: 0; padding: 8px; border: 1px solid var(--tkw-color-neutral-200); border-radius: 6px; background: var(--tkw-color-neutral-0); color: var(--tkw-color-neutral-900); font: inherit; }',
  '.neutral-background, .neutral-text, .neutral-border { box-sizing: border-box; width: calc(100% - 24px); margin: 12px; padding: 12px; border-radius: 6px; line-height: 1.5; overflow-wrap: anywhere; }',
  '.neutral-background strong { font-weight: inherit; }',
  '.neutral-background p { margin: 8px 0 0; }',
  '.neutral-border p { margin: 0; }',
  '.neutral-border hr { margin: 12px 0; border: 0; border-top: 2px solid; border-color: inherit; }',
].join('\n');

export function colorExampleDocument(example: ColorExample, source: string, semantic: SemanticColor = 'success') {
  const content = semanticColors.find(([key]) => key === semantic)!;
  // Keep edited CSS inside the raw-text style element, even if it contains a closing tag.
  const escapedCss = source.replace(/<\/style/gi, match => '\\3c ' + match.slice(1));
  return [
    '<!doctype html><html lang="ja"><meta charset="utf-8">',
    '<meta http-equiv="Content-Security-Policy" content="default-src \'none\'; style-src \'unsafe-inline\'; base-uri \'none\'; form-action \'none\'">',
    '<style>' + previewStyles + '</style>',
    '<style>' + escapedCss + '</style>',
    examples[example].markup(content),
    '</html>',
  ].join('\n');
}
