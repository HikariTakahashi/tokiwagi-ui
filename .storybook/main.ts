import type { StorybookConfig } from '@storybook/html-vite';
import tailwindcss from '@tailwindcss/vite';
import remarkGfm from 'remark-gfm';
import { astroPreviewsPlugin } from './astro-previews.ts';
import { astroLogoPreviewsPlugin } from './astro-logo-previews.ts';
import { astroBrandPreviewsPlugin } from './astro-brand-previews.ts';

const config: StorybookConfig = {
  framework: '@storybook/html-vite',
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
    config.plugins = [...(config.plugins ?? []), tailwindcss(), astroPreviewsPlugin(), astroLogoPreviewsPlugin(), astroBrandPreviewsPlugin()];
    // HTML版のDocsでVueを直接マウントするため、Vueプラグインが設定する既定フラグを明示する。
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
