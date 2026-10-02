import { createIconCatalog } from './icon-assets';

const sources = import.meta.glob<string>('../../icons/*.svg', { query: '?raw', import: 'default', eager: true });
const documents = import.meta.glob<string>('../stories/icons/*.mdx', { query: '?raw', import: 'default', eager: true });
export const iconCatalog = createIconCatalog(sources, documents);
export const iconsByName = new Map(iconCatalog.map(icon => [icon.name, icon]));
