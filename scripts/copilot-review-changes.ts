import { appendFileSync, readFileSync } from 'node:fs';
import { changedPaths, classifyPaths } from './ci-changes';

export function planCopilotReview(paths: readonly string[], forceReason?: string) {
  const productionPaths = paths.filter(path =>
    !/^(src|scripts|\.storybook)\/.+\.(test|spec)\.[cm]?[jt]sx?$/.test(path),
  );
  const plan = classifyPaths(productionPaths, forceReason);
  // Visual Testsだけに関係するテスト設定は表示・配信物を変更しない。
  const reasons = [...new Set([...plan.build.reasons, ...plan.storybook.reasons])];
  return { run: reasons.length > 0, reasons };
}

if (import.meta.main) {
  const event = JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH!, 'utf8'));
  // pull_request_targetでも比較対象はPRの分岐元と先端。実行するコードはベース側のみ。
  const { paths, forceReason } = changedPaths('pull_request', event, process.cwd());
  const plan = planCopilotReview(paths, forceReason);
  if (process.env.GITHUB_OUTPUT) {
    appendFileSync(process.env.GITHUB_OUTPUT, `review=${plan.run}\n`);
  }
  const summary = plan.run
    ? 'Copilotレビュー対象\n\n' + plan.reasons.map(reason => {
      const escaped = reason.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
      return `- <code>${escaped.replaceAll('\r', '&#13;').replaceAll('\n', '&#10;')}</code>\n`;
    }).join('')
    : 'Copilotレビューを省略：UI・パフォーマンスに関係する変更なし\n';
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary);
}
