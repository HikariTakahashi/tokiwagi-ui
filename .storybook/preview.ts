import type { Preview } from '@storybook/html-vite';
import '../src/styles/global.css';
import 'tokiwagi-ui/header.css';
import 'tokiwagi-ui/text.css';
import '../src/stories/components/header-preview.css';
import '../src/styles/storybook.css';
import { theme } from './theme';

const preview: Preview = {
  parameters: {
    a11y: { test: 'error' },
    docs: { theme },
    layout: 'fullscreen',
    backgrounds: { disable: true },
    controls: { disable: true },
    options: { showPanel: false },
  },
};

export default preview;
