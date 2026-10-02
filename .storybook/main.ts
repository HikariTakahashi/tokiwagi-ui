import type { StorybookConfig } from '@storybook/html-vite';
import tailwindcss from '@tailwindcss/vite';
import remarkGfm from 'remark-gfm';

const config: StorybookConfig = {
  framework: '@storybook/html-vite',
  staticDirs: [{ from: '../icons', to: '/icon-assets' }],
  stories: ['../src/stories/**/*.mdx', '../src/icons/*.mdx', '../src/stories/**/*.stories.ts'],
  addons: [{
    name: '@storybook/addon-docs',
    options: {
      mdxPluginOptions: {
        mdxCompileOptions: { remarkPlugins: [remarkGfm] },
      },
    },
  }],
  async viteFinal(config) {
    config.plugins = [...(config.plugins ?? []), tailwindcss()];
    return config;
  },
};

export default config;
