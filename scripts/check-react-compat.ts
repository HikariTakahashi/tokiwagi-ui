import { cpSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repository = fileURLToPath(new URL('../', import.meta.url));
const development = (await Bun.file(new URL('../package.json', import.meta.url)).json()).devDependencies;
const bunTypes = (await Bun.file(new URL('../node_modules/@types/bun/package.json', import.meta.url)).json()).version;
const matrix = [
  // SSRのidentifierPrefixまで型検査できる18系の型定義を使う（実行時の下限とは別）。
  { react: '18.0.0', reactTypes: '18.3.18', domTypes: '18.3.5' },
  { react: '18.3.1', reactTypes: '18.3.18', domTypes: '18.3.5' },
  { react: '19.0.0', reactTypes: '19.0.0', domTypes: '19.0.0' },
  { react: development.react, reactTypes: development['@types/react'], domTypes: development['@types/react-dom'] },
];

// 各系列のReactと型定義を分離し、通常のnode_modules・ロックファイルを変更せず検証する。
for (const version of matrix) {
  const directory = mkdtempSync(join(tmpdir(), 'tkw-react-compat-'));
  try {
    for (const path of ['icons', 'src/react', 'src/lib', 'src/styles', 'tokens']) cpSync(join(repository, path), join(directory, path), { recursive: true });
    await Bun.write(join(directory, 'package.json'), JSON.stringify({
      name: 'tokiwagi-ui', private: true, type: 'module',
      exports: { './react': './src/react/index.ts', './header.css': './src/styles/header.css' },
      devDependencies: {
        react: version.react, 'react-dom': version.react,
        '@types/react': version.reactTypes, '@types/react-dom': version.domTypes,
        '@types/bun': bunTypes, typescript: development.typescript, 'happy-dom': development['happy-dom'],
      },
      overrides: { '@types/react': version.reactTypes },
    }, null, 2));
    await Bun.write(join(directory, 'raw-svg.d.ts'), "declare module '*.svg?raw' { const source: string; export default source; }\n");
    await Bun.write(join(directory, 'tsconfig.json'), JSON.stringify({
      compilerOptions: {
        target: 'ES2022', module: 'ESNext', moduleResolution: 'Bundler', jsx: 'react-jsx',
        strict: true, noEmit: true, types: ['bun', 'react', 'react-dom'],
      },
      files: ['src/react/TIcon.typecheck.tsx', 'src/react/TLogo.typecheck.tsx', 'src/react/TBrand.typecheck.tsx', 'src/react/THeader.typecheck.tsx', 'raw-svg.d.ts'],
    }, null, 2));
    // 公開型の検証と、テスト用API（act等）の型検証を分けて診断する。
    await Bun.write(join(directory, 'tsconfig.tests.json'), JSON.stringify({
      extends: './tsconfig.json', files: ['raw-svg.d.ts'], include: ['src/react/**/*.test.tsx'],
    }, null, 2));
    console.log(`\nReact / React DOM ${version.react}・@types/react ${version.reactTypes}・@types/react-dom ${version.domTypes}`);
    for (const [label, args] of [
      ['一時環境の依存導入', ['install']],
      ['公開型', ['run', 'node_modules/typescript/bin/tsc', '--project', 'tsconfig.json']],
      ['テスト用APIの型', ['run', 'node_modules/typescript/bin/tsc', '--project', 'tsconfig.tests.json']],
      ['全原本・SSR・ハイドレーション・props更新', ['test', 'src/react']],
    ] as const) {
      console.log(`React ${version.react}: ${label}`);
      const process = Bun.spawn([Bun.which('bun')!, ...args], { cwd: directory, stdout: 'inherit', stderr: 'inherit' });
      if (await process.exited !== 0) throw new Error(`React ${version.react} の検証に失敗しました: bun ${args.join(' ')}`);
    }
    console.log(`React ${version.react}: 公開型・テスト用APIの型・全原本・SSR・ハイドレーション・props更新が成功`);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}
