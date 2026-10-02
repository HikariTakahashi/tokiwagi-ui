import { createIconCatalog } from './icon-assets';

const sources = import.meta.glob<string>('../../icons/*.svg', { query: '?raw', import: 'default', eager: true });
export const iconCatalog = createIconCatalog(sources);
export const iconsByName = new Map(iconCatalog.map(icon => [icon.name, icon]));
