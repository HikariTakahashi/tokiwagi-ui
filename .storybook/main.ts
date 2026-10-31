import type { StorybookConfig } from '@storybook/html-vite';
import { readFileSync } from 'node:fs';
import tailwindcss from '@tailwindcss/vite';
import remarkGfm from 'remark-gfm';
import { astroPreviewsPlugin } from './astro-previews.ts';
import { astroLogoPreviewsPlugin } from './astro-logo-previews.ts';
import { astroBrandPreviewsPlugin } from './astro-brand-previews.ts';
import { astroHeaderPreviewsPlugin } from './astro-header-previews.ts';
import { iconSearchIndexPlugin } from './icon-search-index.ts';

const config: StorybookConfig = {
  framework: '@storybook/html-vite',
  // The manager runs outside the preview iframe; inject the same token source there.
  managerHead: head => `${head}<style>${readFileSync(new URL('../tokens/typography.css', import.meta.url), 'utf8')}</style>`,
  staticDirs: [{ from: '../icons', to: '/icon-assets' }],
  stories: ['../src/stories/**/*.mdx', '../src/icons/*.mdx', '../src/stories/**/*.stories.@(ts|tsx)'],
  addons: [{
    name: '@storybook/addon-docs',
    options: {
      mdxPluginOptions: {
        mdxCompileOptions: { remarkPlugins: [remarkGfm] },
      },
    },
  }],
  async viteFinal(config) {
    config.plugins = [...(config.plugins ?? []), tailwindcss(), iconSearchIndexPlugin(), astroPreviewsPlugin(), astroLogoPreviewsPlugin(), astroBrandPreviewsPlugin(), astroHeaderPreviewsPlugin()];
    // HTML版StorybookでVueを直接マウントするため、Vueプラグインが設定する既定フラグを明示する。
    config.define = {
      __VUE_OPTIONS_API__: 'true',
      __VUE_PROD_DEVTOOLS__: 'false',
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'false',
      ...config.define,
    };
    return config;
  },
};

export default config;
