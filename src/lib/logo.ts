import source from '../../icons/logo/logo.svg?raw';

export const logoSizes = [32, 64, 128] as const;
export type LogoSize = typeof logoSizes[number];
export type LogoOptions = { size?: LogoSize; decorative?: boolean };

// 原本を画像として使い、文字色の継承やSVG内部の書き換えを避ける。
// data URLにすることでSSRとクライアントが同じsrcを使い、配信先パスに依存しない。
const logoSrc = `data:image/svg+xml,${encodeURIComponent(source)}`;

export function logoPresentation(size: LogoSize = 32, decorative: boolean = false) {
  if (!logoSizes.includes(size)) throw new Error(`ロゴのサイズは32/64/128pxから選択してください: ${size}`);
  if (typeof decorative !== 'boolean') throw new Error('ロゴのdecorativeはbooleanで指定してください');
  return {
    src: logoSrc,
    alt: decorative ? '' : 'Tokiwagi UI',
    frameStyle: {
      display: 'inline-flex', flexShrink: 0, verticalAlign: 'middle',
      boxSizing: 'content-box' as const, width: `${size}px`, height: `${size}px`,
      padding: `${size / 4}px`, backgroundColor: 'var(--tkw-color-neutral-0)', lineHeight: 0,
    },
    imageStyle: { display: 'block', width: `${size}px`, height: `${size}px`, maxWidth: 'none', flexShrink: 0 },
  };
}
