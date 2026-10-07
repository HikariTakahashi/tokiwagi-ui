/** 既存のロゴ併記見本に合わせた名称と配置。ロゴ周囲の余白はTLogoが担う。 */
export const brandName = 'Tokiwagi UI';
export const brandStyle = {
  display: 'inline-flex', alignItems: 'center', gap: '8px',
  verticalAlign: 'middle', whiteSpace: 'nowrap' as const,
};
export const brandNameStyle = {
  fontFamily: 'Inter, "Noto Sans JP", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  fontSize: '16px', fontWeight: 600, lineHeight: 1.5, letterSpacing: 'normal',
  color: 'inherit', flexShrink: 0,
};
