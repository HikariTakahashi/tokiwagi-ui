import type { TTextProps } from 'tokiwagi-ui/astro';
const props: TTextProps = { as: 'p', size: { base: 'sm', sm: 'md', lg: 'lg' }, weight: 'bold', tone: 'error',
  whiteSpace: 'pre-line', lineClamp: 2, id: 'description', 'data-test': 'text', 'aria-live': 'polite', style: { 'max-width': '320px' } };
// @ts-expect-error 見出しタグはTTextに含めない。
const tag: TTextProps = { as: 'h1' };
// @ts-expect-error レスポンシブサイズにはbaseが必要。
const missingBase: TTextProps = { size: { sm: 'md' } };
// @ts-expect-error 状態色は定義済みのtoneを使う。
const tone: TTextProps = { tone: 'red' };
void [props, tag, missingBase, tone];
