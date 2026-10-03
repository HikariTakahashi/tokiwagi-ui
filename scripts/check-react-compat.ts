import { cpSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const repository = new URL('../', import.meta.url).pathname;
const development = (await Bun.file(new URL('../package.json', import.meta.url)).json()).devDependencies;
const bunTypes = (await Bun.file(new URL('../node_modules/@types/bun/package.json', import.meta.url)).json()).version;
const matrix = [
  { react: '18.3.1', reactTypes: '18.3.18', domTypes: '18.3.5' },
  { react: development.react, reactTypes: development['@types/react'], domTypes: development['@types/react-dom'] },
];

// 各系列のReactと型定義を分離し、通常のnode_modules・ロックファイルを変更せず検証する。
for (const version of matrix) {
  const directory = mkdtempSync(join(tmpdir(), 'tkw-react-compat-'));
  try {
    for (const path of ['icons', 'src/react', 'src/lib']) cpSync(join(repository, path), join(directory, path), { recursive: true });
    await Bun.write(join(directory, 'package.json'), JSON.stringify({
      name: 'tokiwagi-ui', private: true, type: 'module',
      exports: { './react': './src/react/index.ts' },
      devDependencies: {
        react: version.react, 'react-dom': version.react,
        '@types/react': version.reactTypes, '@types/react-dom': version.domTypes,
        '@types/bun': bunTypes, typescript: development.typescript, 'happy-dom': development['happy-dom'],
      },
    }, null, 2));
    await Bun.write(join(directory, 'raw-svg.d.ts'), "declare module '*.svg?raw' { const source: string; export default source; }\n");
    await Bun.write(join(directory, 'tsconfig.json'), JSON.stringify({
      compilerOptions: {
        target: 'ES2022', module: 'ESNext', moduleResolution: 'Bundler', jsx: 'react-jsx',
        strict: true, noEmit: true, types: ['bun', 'react', 'react-dom'],
      },
      files: ['src/react/TIcon.typecheck.tsx', 'raw-svg.d.ts'],
    }, null, 2));
    console.log(`\nReact ${version.react}: 公開型・全原本・SSR・ハイドレーションを検証`);
    for (const args of [
      ['install'],
      ['run', 'node_modules/typescript/bin/tsc', '--project', 'tsconfig.json'],
      ['test', 'src/react'],
    ]) {
      const process = Bun.spawn([Bun.which('bun')!, ...args], { cwd: directory, stdout: 'inherit', stderr: 'inherit' });
      if (await process.exited !== 0) throw new Error(`React ${version.react} の検証に失敗しました: bun ${args.join(' ')}`);
    }
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}
