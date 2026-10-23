import { useEffect, useState, type ReactNode } from 'react';

export type Framework = 'react' | 'vue' | 'astro';

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
  if (framework !== 'astro' || ready) return null;
  return error
    ? <p role="alert">{error} <button type="button" onClick={retry}>再試行</button></p>
    : <p role="status">Astroのプレビューを読み込んでいます。</p>;
}

export function AstroComponentPreview<T>({ load, children }: {
  load: () => Promise<T>; children: (previews: T) => ReactNode;
}) {
  const { previews, error, retry } = useAstroPreviews('astro', load);
  return <>
    <AstroPreviewStatus framework="astro" ready={previews !== null} error={error} retry={retry} />
    {previews !== null && children(previews)}
  </>;
}
