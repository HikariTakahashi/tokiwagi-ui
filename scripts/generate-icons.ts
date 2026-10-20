import { mkdirSync, readFileSync, readdirSync, unlinkSync } from 'node:fs';
import { createIconCatalog, isBrandAssetName } from '../src/lib/icon-assets';
import { generatedStoryMarker, iconStorySource } from './icon-story-generation';

// SVG本体は複製せず、原本へのraw importと公開名の型だけを生成する。
const root = new URL('../icons/', import.meta.url);
const names = readdirSync(root).filter(name => !isBrandAssetName(name) && readdirSync(new URL(`${name}/`, root)).includes(`${name}.svg`)).sort();
const catalog = createIconCatalog(
  Object.fromEntries(names.map(name => [`${name}/${name}.svg`, readFileSync(new URL(`${name}/${name}.svg`, root), 'utf8')])),
  Object.fromEntries(names.map(name => [`${name}/README.md`, readFileSync(new URL(`${name}/README.md`, root), 'utf8')])),
);
const source = `// bun run generate:icons で生成。SVGの編集元は icons/<公開名>/<公開名>.svg。\n${names.map((name, index) => `import icon${index} from '../../icons/${name}/${name}.svg?raw';`).join('\n')}\n\nexport const iconSources = {\n${names.map((name, index) => `  '${name}': icon${index},`).join('\n')}\n} as const;\n\nexport type IconName = keyof typeof iconSources;\nexport const iconNames = Object.keys(iconSources) as IconName[];\nexport function isIconName(name: string): name is IconName {\n  return Object.hasOwn(iconSources, name);\n}\n`;
await Bun.write(new URL('../src/lib/icon-sources.ts', import.meta.url), source);

const stories = new URL('../src/stories/icon-examples/', import.meta.url);
mkdirSync(stories, { recursive: true });
const expected = new Set(names.map(name => `${name}.stories.ts`));
for (const file of readdirSync(stories)) {
  if (file.endsWith('.stories.ts') && !expected.has(file) && readFileSync(new URL(file, stories), 'utf8').startsWith(generatedStoryMarker)) {
    unlinkSync(new URL(file, stories));
  }
}
for (const icon of catalog) await Bun.write(new URL(`${icon.name}.stories.ts`, stories), iconStorySource(icon));
