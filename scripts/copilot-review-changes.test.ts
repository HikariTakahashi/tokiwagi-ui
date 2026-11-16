import { expect, test } from 'bun:test';
import { planCopilotReview } from './copilot-review-changes';

// 一般文書やテスト専用の差分ではCopilotへのレビュー依頼を省略する。
test('一般文書・PRテンプレート・テストのみなら省略する', () => {
  expect(planCopilotReview([
    'README.md',
    'docs/wiki/Testing.md',
    '.github/PULL_REQUEST_TEMPLATE.md',
    'src/react/TIcon.test.tsx',
    'scripts/ci-changes.test.ts',
    'e2e/icons.visual.ts',
  ])).toEqual({ run: false, reasons: [] });
});

// 表示される文書を一般文書と区別し、無関係の差分が混ざっても対象の変更を拾う。
test('表示・読み込みに関係する差分が1つあれば対象にする', () => {
  for (const path of [
    'src/pages/index.astro',
    'src/styles/header.css',
    'components/TIcon/README.md',
    'icons/bell/README.md',
    'src/stories/components/IconBrowser.tsx',
    'tokens/colors.css',
    'bun.lock',
  ]) {
    expect(planCopilotReview(['README.md', path])).toEqual({ run: true, reasons: [path] });
  }
});

// 未分類や差分を取得できない場合は、根拠を添えてレビューへ回す。
test('影響が分からない差分ではレビューを省略しない', () => {
  expect(planCopilotReview(['new-rendering-config.json']).run).toBe(true);
  expect(planCopilotReview([], '比較対象を取得できない')).toEqual({
    run: true,
    reasons: ['比較対象を取得できない'],
  });
});
