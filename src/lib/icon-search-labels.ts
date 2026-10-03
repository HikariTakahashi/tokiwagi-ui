/** 個別READMEの「概要」にある別名行を読む。MarkdownやJavaScriptは実行しない。 */
export function parseIconSearchLabels(source: string, name: string): readonly string[] {
  const overview = source.split(/^## 概要[ \t]*\r?$/m)[1]?.split(/^## /m)[0] ?? '';
  const lines = overview.split(/\r?\n/).filter(line => /^別名/.test(line));
  if (lines.length !== 1 || !/^別名：`[^`\r\n]+`(?:、`[^`\r\n]+`)*$/.test(lines[0]!)) {
    throw new Error(`別名行が欠落または不正です: ${name}`);
  }
  const labels = [...lines[0]!.matchAll(/`([^`]+)`/g)].map(match => match[1]!.trim());
  if (labels.some(label => !label) || new Set(labels.map(label => label.toLowerCase())).size !== labels.length) {
    throw new Error(`別名が空または重複しています: ${name}`);
  }
  return labels;
}
