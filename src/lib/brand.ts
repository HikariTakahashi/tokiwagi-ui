/** 既存のロゴ併記見本に合わせた名称と配置。ロゴ周囲の余白はTLogoが担う。 */
export const brandName = 'Tokiwagi UI';

/** 空の名称では装飾ロゴだけになるため、読み上げ可能なテキストを必須とする。 */
export function resolveBrandText(text: string = brandName): string {
  if (typeof text !== 'string' || text.trim().length === 0) {
    throw new Error('ブランドのtextには空白だけではない文字列を指定してください');
  }
  return text;
}
export const brandStyle = {
  display: 'inline-flex', alignItems: 'center', gap: '8px',
  verticalAlign: 'middle', whiteSpace: 'nowrap' as const,
};
export const brandNameStyle = {
  fontFamily: 'var(--tkw-font-family-sans)',
  fontSize: '16px', fontWeight: 600, lineHeight: 1.5, letterSpacing: 'normal',
  color: 'inherit', flexShrink: 0,
};
