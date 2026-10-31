import type { Preview } from '@storybook/html-vite';
import '../src/styles/global.css';
import '../src/styles/storybook.css';
import { theme } from './theme';

const preview: Preview = {
  parameters: {
    docs: { theme },
    layout: 'fullscreen',
    backgrounds: { disable: true },
    controls: { disable: true },
    options: { showPanel: false },
  },
};

export default preview;
