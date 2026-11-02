import { TText, type TTextProps } from 'tokiwagi-ui/vue';
const props: TTextProps = { as: 'p', size: { base: 'sm', sm: 'md', lg: 'lg' }, weight: 'bold', tone: 'error',
  inherit: true, italic: true, decoration: 'underline', id: 'description', 'aria-live': 'polite', 'data-test': 'text',
  style: { maxWidth: '320px' }, onClick: event => { const target: EventTarget | null = event.currentTarget; void target; } };
const inferred: InstanceType<typeof TText>['$props'] = props;
// @ts-expect-error 見出しタグはTTextに含めない。
const tag: TTextProps = { as: 'h1' };
// @ts-expect-error レスポンシブサイズにはbaseが必要。
const missingBase: TTextProps = { size: { sm: 'md' } };
// @ts-expect-error 推論型でも無効なサイズを拒否する。
const invalidSize: InstanceType<typeof TText>['$props'] = { size: 'xl' };
void [inferred, tag, missingBase, invalidSize];
