/** 個別READMEを管理元として、一覧の詳細表示に使う概要の最初の段落を取り出す。 */
export function iconOverview(source: string, name: string): string {
  const overview = source.split(/^## 概要[ \t]*\r?$/m)[1]?.split(/^## /m)[0] ?? '';
  const paragraph = overview.replace(/^別名[^\r\n]*$/gm, '').trim().split(/\r?\n\s*\r?\n/)[0];
  if (!paragraph) throw new Error(`アイコンの概要がありません: ${name}`);
  return paragraph.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/[`*]/g, '').replace(/\r?\n/g, ' ');
}
