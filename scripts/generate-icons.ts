import { readdirSync } from 'node:fs';
import { isBrandAssetName } from '../src/lib/icon-assets';

// SVG本体は複製せず、原本へのraw importと公開名の型だけを生成する。
const root = new URL('../icons/', import.meta.url);
const names = readdirSync(root).filter(name => !isBrandAssetName(name) && readdirSync(new URL(`${name}/`, root)).includes(`${name}.svg`)).sort();
const source = `// bun run generate:icons で生成。SVGの編集元は icons/<公開名>/<公開名>.svg。\n${names.map((name, index) => `import icon${index} from '../../icons/${name}/${name}.svg?raw';`).join('\n')}\n\nexport const iconSources = {\n${names.map((name, index) => `  '${name}': icon${index},`).join('\n')}\n} as const;\n\nexport type IconName = keyof typeof iconSources;\nexport const iconNames = Object.keys(iconSources) as IconName[];\nexport function isIconName(name: string): name is IconName {\n  return Object.hasOwn(iconSources, name);\n}\n`;
await Bun.write(new URL('../src/lib/icon-sources.ts', import.meta.url), source);
