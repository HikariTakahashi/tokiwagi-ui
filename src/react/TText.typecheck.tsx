import { TText, type TTextProps, type TextResponsiveSize } from 'tokiwagi-ui/react';
const size: TextResponsiveSize = { base: 'sm', sm: 'md', lg: 'lg' };
const props: TTextProps = { as: 'p', size, weight: 'bold', lineHeight: 1.7, tone: 'error',
  align: 'end', whiteSpace: 'pre-wrap', inherit: true, italic: true, decoration: 'underline',
  id: 'description', 'aria-live': 'polite', 'data-test': 'text', style: { maxWidth: 320 }, onClick: event => event.currentTarget.focus() };
const text = <TText {...props}>保存に<strong>失敗しました</strong></TText>;
// @ts-expect-error 見出しタグはTTextに含めない。
const tag = <TText as="h1" />;
// @ts-expect-error レスポンシブサイズにはbaseが必要。
const missingBase = <TText size={{ sm: 'md' }} />;
// @ts-expect-error 許可したサイズだけを受け付ける。
const invalidSize = <TText size="xl" />;
// @ts-expect-error 行数には数値を指定する。
const lines = <TText lineClamp="2" />;
void [text, tag, missingBase, invalidSize, lines];
