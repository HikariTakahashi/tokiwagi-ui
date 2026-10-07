import { createContext, useContext, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import './component-documentation.css';

export type Framework = 'react' | 'vue' | 'astro';
const frameworks: readonly Framework[] = ['react', 'vue', 'astro'];
const frameworkLabels = { react: 'React', vue: 'Vue', astro: 'Astro' };
const frameworkSupport = { react: 'React 18・19', vue: 'Vue 3.5以上 / Nuxt', astro: 'Astro / 静的HTML' };
const sections = {
  preview: ['プレビュー', 'プレビュー'],
  basic: ['基本的な使い方', '使い方'],
  api: ['Props・公開API', 'API'],
  rules: ['表示と利用のルール', '表示ルール'],
  accessibility: ['アクセシビリティと使用例', 'アクセシビリティ'],
  advanced: ['導入・応用', '導入・応用'],
  related: ['関連資料', '関連資料'],
} as const;
type SectionName = keyof typeof sections;
const PagePrefix = createContext('component');

// Storybook専用。実コンポーネントの公開入口へはexportしない。
export function DocumentationPage({ name, description, framework, onFrameworkChange, supportedFrameworks = frameworks, children }: {
  name: string; description: ReactNode; framework: Framework; onFrameworkChange: (value: Framework) => void;
  supportedFrameworks?: readonly Framework[]; children: ReactNode;
}) {
  const prefix = name.toLowerCase();
  return <PagePrefix.Provider value={prefix}><article className="tkw-component-doc sb-unstyled" aria-labelledby={`${prefix}-heading`}>
    <header>
      <p className="tkw-doc-eyebrow">コンポーネント</p>
      <h1 id={`${prefix}-heading`}>{name}</h1>
      <p>{description}</p>
      <FrameworkSelector value={framework} onChange={onFrameworkChange} supportedFrameworks={supportedFrameworks} />
      <p className="tkw-doc-support">{frameworkSupport[framework]} · <code>tokiwagi-ui/{framework}</code></p>
    </header>
    <nav className="tkw-doc-nav" aria-label="ページ内の目次">
      {(Object.keys(sections) as SectionName[]).map(key => <a key={key} href={`#${prefix}-${key}`} target="_self">{sections[key][1]}</a>)}
    </nav>
    {children}
  </article></PagePrefix.Provider>;
}

export function FrameworkSelector({ value, onChange, supportedFrameworks = frameworks }: {
  value: Framework; onChange: (value: Framework) => void; supportedFrameworks?: readonly Framework[];
}) {
  return <div className="tkw-doc-frameworks" role="group" aria-label="フレームワーク">
    {frameworks.filter(item => supportedFrameworks.includes(item)).map(item =>
      <button type="button" key={item} aria-pressed={value === item} onClick={() => onChange(item)}>{frameworkLabels[item]}</button>)}
  </div>;
}

export function DocumentationSection({ name, children }: { name: SectionName; children: ReactNode }) {
  const id = `${useContext(PagePrefix)}-${name}`;
  return <section id={id} aria-labelledby={`${id}-heading`}><h2 id={`${id}-heading`}>{sections[name][0]}</h2>{children}</section>;
}

export function PreviewControls({ children }: { children: ReactNode }) {
  return <div className="tkw-doc-controls">{children}</div>;
}

export function ControlField({ label, children }: { label: string; children: ReactNode }) {
  return <label className="tkw-doc-field"><span>{label}</span>{children}</label>;
}

export function CheckboxField({ heading, label, checked, onChange }: { heading: string; label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return <div className="tkw-doc-field"><span>{heading}</span>
    <label className="tkw-doc-checkbox"><input type="checkbox" checked={checked} onChange={event => onChange(event.target.checked)} /><span>{label}</span></label>
  </div>;
}

export function PreviewStage({ label, children, style }: { label: string; children: ReactNode; style?: CSSProperties }) {
  return <div className="tkw-doc-stage" role="region" aria-label={label} tabIndex={0} style={style}>
    <div className="tkw-doc-stage-content">{children}</div>
  </div>;
}

export function CodeBlock({ code }: { code: string }) {
  const [message, setMessage] = useState('');
  const currentCode = useRef(code);
  currentCode.current = code;
  const request = useRef(0);
  const mounted = useRef(false);
  useEffect(() => {
    mounted.current = true;
    request.current++;
    setMessage('');
    return () => { mounted.current = false; };
  }, [code]);
  async function copy() {
    const attempt = ++request.current;
    let result: string;
    try {
      await navigator.clipboard.writeText(code);
      result = 'コードをコピーしました。';
    } catch {
      result = 'コピーできませんでした。コードを選択してコピーしてください。';
    }
    if (mounted.current && currentCode.current === code && request.current === attempt) setMessage(result);
  }
  return <div className="tkw-doc-code">
    <div className="tkw-doc-code-toolbar"><button type="button" onClick={copy}>コードをコピー</button><span role="status">{message}</span></div>
    <pre tabIndex={0} aria-label="使用コード"><code>{code}</code></pre>
  </div>;
}

export function PropsTable({ rows }: { rows: readonly { name: string; description: ReactNode; defaultValue: ReactNode }[] }) {
  return <div className="tkw-doc-table" role="region" aria-label="Props・公開APIの表" tabIndex={0}>
    <table><thead><tr><th scope="col">Props</th><th scope="col">型・用途</th><th scope="col">既定値</th></tr></thead><tbody>
      {rows.map(row => <tr key={row.name}><td><code>{row.name}</code></td><td>{row.description}</td><td>{row.defaultValue}</td></tr>)}
    </tbody></table>
  </div>;
}

export function useAstroPreviews<T>(framework: Framework, load: () => Promise<T>) {
  const [previews, setPreviews] = useState<T | null>(null);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (framework !== 'astro' || previews !== null) return;
    let active = true;
    setError('');
    load().then(value => { if (active) setPreviews(value); }).catch(() => {
      if (active) setError('Astroのプレビューを読み込めませんでした。');
    });
    return () => { active = false; };
  }, [framework, previews, attempt, load]);
  return { previews, error, retry: () => setAttempt(value => value + 1) };
}

export function AstroPreviewStatus({ framework, ready, error, retry }: {
  framework: Framework; ready: boolean; error: string; retry: () => void;
}) {
  if (framework !== 'astro') return null;
  return <>
    <p>Astro版は実コンポーネントが生成した静的HTMLを表示します。</p>
    {!ready && (error
      ? <p role="alert">{error} <button type="button" onClick={retry}>再試行</button></p>
      : <p role="status">Astroのプレビューを読み込んでいます。</p>)}
  </>;
}

// コピーしたコードをその方式のファイルへ貼り付けられる形で生成する。
export function componentExample(framework: Framework, name: string, body: string, tokenFiles: readonly string[] = []) {
  const imports = [`import { ${name} } from 'tokiwagi-ui/${framework}';`, ...tokenFiles.map(file => `import 'tokiwagi-ui/tokens/${file}.css';`)].join('\n');
  const indent = (value: string, spaces: number) => value.split('\n').map(line => `${' '.repeat(spaces)}${line}`).join('\n');
  if (framework === 'astro') return `---\n${imports}\n---\n${body}`;
  if (framework === 'vue') return `<script setup lang="ts">\n${imports}\n</script>\n\n<template>\n${indent(body, 2)}\n</template>`;
  return `${imports}\n\nexport function Example() {\n  return (\n${indent(body, 4)}\n  );\n}`;
}
