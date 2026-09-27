export const colors = [
  ['green', 'グリーン'], ['teal', 'アクア'], ['blue', 'ブルー'],
  ['violet', 'バイオレット'], ['rose', 'ピンク'], ['coral', 'コーラル'], ['amber', 'イエロー'],
] as const;
export const suffixes = ['', '-hover', '-active', '-subtle', '-on', '-on-subtle'] as const;
export const variants = [
  ['', '通常'], ['-hover', 'ホバー'], ['-active', '押下'], ['-subtle', '淡い背景'],
] as const;
export const tokenName = (key: string, suffix = '') => `--tkw-color-primary-${key}${suffix}`;

export const neutrals = [
  ['0', 'カード・前景'],
  ['50', 'ページ背景'],
  ['100', '淡い背景'],
  ['200', '境界線'],
  ['400', '無効状態'],
  ['600', '補助テキスト'],
  ['800', '通常テキスト'],
  ['900', '見出し'],
  ['1000', '最大コントラスト'],
] as const;
export const neutralTokenName = (step: string) => `--tkw-color-neutral-${step}`;

export const secondaryColors = [
  ['lime', 'ライム', '発見やアイデアに軽快さを添える'],
  ['orange', 'オレンジ', '温かさと活気のある補助アクセント'],
  ['navy', 'ネイビー', '画面を引き締める落ち着いたアクセント'],
] as const;
export const secondaryTokenName = (key: string, suffix = '') => `--tkw-color-secondary-${key}${suffix}`;

export const semanticColors = [
  ['success', '成功', '完了・保存成功', '✓', '保存しました', '変更内容が反映されました。'],
  ['warning', '警告', '注意・要確認', '!', '期限が近づいています', '明日までのタスクがあります。'],
  ['error', 'エラー', '失敗・入力不備', '×', '保存できませんでした', '入力内容を確認してください。'],
  ['info', '情報', '案内・進行状況', 'i', '同期を開始しました', '完了までしばらくお待ちください。'],
] as const;
export const semanticTokenName = (key: string, suffix = '') => `--tkw-color-semantic-${key}${suffix}`;

/** Only literal six-digit HEX tokens are supported; CSS remains the source of truth. */
export function parseTokens(css: string): Record<string, string> {
  const tokens: Record<string, string> = {};
  const clean = css.replace(/\/\*[\s\S]*?\*\//g, '');
  for (const match of clean.matchAll(/(--tkw-color-primary-[\w-]+)\s*:\s*([^;}]+)\s*(?=[;}])/g)) {
    const [, name, raw] = match;
    const value = raw!.trim();
    if (name! in tokens) throw new Error(`重複したトークン: ${name}`);
    if (!/^#[\da-f]{6}$/i.test(value)) throw new Error(`不正なHEX: ${name} = ${value}（#RRGGBBで指定してください）`);
    tokens[name!] = value.toUpperCase();
  }
  for (const [key] of colors) for (const suffix of suffixes) {
    const name = tokenName(key, suffix);
    if (!(name in tokens)) throw new Error(`不足しているトークン: ${name}`);
  }
  return tokens;
}

export function parseNeutralTokens(css: string): Record<string, string> {
  const tokens: Record<string, string> = {};
  const clean = css.replace(/\/\*[\s\S]*?\*\//g, '');
  for (const match of clean.matchAll(/(--tkw-color-neutral-[\w-]+)\s*:\s*([^;}]+)\s*(?=[;}])/g)) {
    const [, name, raw] = match;
    const value = raw!.trim();
    if (name! in tokens) throw new Error(`重複したトークン: ${name}`);
    if (!/^#[\da-f]{6}$/i.test(value)) throw new Error(`不正なHEX: ${name} = ${value}（#RRGGBBで指定してください）`);
    tokens[name!] = value.toUpperCase();
  }
  for (const [step] of neutrals) {
    const name = neutralTokenName(step);
    if (!(name in tokens)) throw new Error(`不足しているトークン: ${name}`);
  }
  return tokens;
}

export function parseSecondaryTokens(css: string): Record<string, string> {
  const tokens: Record<string, string> = {};
  const clean = css.replace(/\/\*[\s\S]*?\*\//g, '');
  for (const match of clean.matchAll(/(--tkw-color-secondary-[\w-]+)\s*:\s*([^;}]+)\s*(?=[;}])/g)) {
    const [, name, raw] = match;
    const value = raw!.trim();
    if (name! in tokens) throw new Error(`重複したトークン: ${name}`);
    if (!/^#[\da-f]{6}$/i.test(value)) throw new Error(`不正なHEX: ${name} = ${value}（#RRGGBBで指定してください）`);
    tokens[name!] = value.toUpperCase();
  }
  for (const [key] of secondaryColors) for (const suffix of suffixes) {
    const name = secondaryTokenName(key, suffix);
    if (!(name in tokens)) throw new Error(`不足しているトークン: ${name}`);
  }
  return tokens;
}

export function parseSemanticTokens(css: string): Record<string, string> {
  const tokens: Record<string, string> = {};
  const clean = css.replace(/\/\*[\s\S]*?\*\//g, '');
  for (const match of clean.matchAll(/(--tkw-color-semantic-[\w-]+)\s*:\s*([^;}]+)\s*(?=[;}])/g)) {
    const [, name, raw] = match;
    const value = raw!.trim();
    if (name! in tokens) throw new Error(`重複したトークン: ${name}`);
    if (!/^#[\da-f]{6}$/i.test(value)) throw new Error(`不正なHEX: ${name} = ${value}（#RRGGBBで指定してください）`);
    tokens[name!] = value.toUpperCase();
  }
  for (const [key] of semanticColors) for (const suffix of suffixes) {
    const name = semanticTokenName(key, suffix);
    if (!(name in tokens)) throw new Error(`不足しているトークン: ${name}`);
  }
  return tokens;
}

function luminance(hex: string): number {
  if (!/^#[\da-f]{6}$/i.test(hex)) throw new Error(`不正なHEX: ${hex}`);
  const channels = [1, 3, 5].map(i => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return channels[0]! * 0.2126 + channels[1]! * 0.7152 + channels[2]! * 0.0722;
}
export function contrast(a: string, b: string): number {
  const [min, max] = [luminance(a), luminance(b)].sort((a, b) => a - b);
  return (max! + 0.05) / (min! + 0.05);
}
