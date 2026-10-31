import { create } from 'storybook/theming';

/** Manager and Docs share the same font tokens as the component previews. */
export const theme = create({
  base: 'light',
  fontBase: 'var(--tkw-font-family-sans)',
  fontCode: 'var(--tkw-font-family-mono)',
});
