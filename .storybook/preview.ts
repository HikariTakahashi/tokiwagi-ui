import type { Preview } from '@storybook/html-vite';
import '../src/styles/global.css';
import '../src/styles/storybook.css';

const preview: Preview = {
  parameters: {
    layout: 'fullscreen',
    backgrounds: { disable: true },
    controls: { disable: true },
    options: { showPanel: false },
  },
};

export default preview;
