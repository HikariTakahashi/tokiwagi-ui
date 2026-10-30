import { test, expect } from '@playwright/test';

// 線のbell、塗りのgrip-vertical、クリッピングのmoon・toolを実コンポーネントで比較する。
for (const framework of ['react', 'vue']) {
  for (const name of ['bell', 'grip-vertical', 'moon', 'tool']) {
    for (const size of [16, 20, 24, 32]) {
      // 各方式・図柄・サイズを読み込み、空の画面でないことを確認して基準画像と比較する。
      test(`${framework}の${name}を${size}pxで表示する`, async ({ page }) => {
        const query = new URLSearchParams({
          id: 'components-ticon--default',
          viewMode: 'story',
          args: `framework:${framework};name:${name};size:${size}`,
        });
        await page.goto(`/iframe.html?${query}`);

        const root = page.locator('#storybook-root');
        const icon = root.locator('svg');
        await expect(icon).toHaveCount(1);
        await expect(icon).toBeVisible();
        await expect(icon).toHaveAttribute('width', String(size));
        await expect(icon).toHaveAttribute('height', String(size));
        await expect(icon.locator('path, circle, rect').first()).toBeAttached();

        // 小サイズでも余白と背景を含めて欠けを確認する。色は既存のトークンを参照する。
        await page.addStyleTag({ content: `
          #storybook-root {
            display: inline-flex;
            padding: 16px;
            line-height: 0;
            color: var(--tkw-color-neutral-900);
            background: var(--tkw-color-neutral-0);
          }
        ` });
        await page.evaluate(() => document.fonts.ready);
        await expect(root).toHaveScreenshot(`${framework}-${name}-${size}.png`);
      });
    }
  }
}
