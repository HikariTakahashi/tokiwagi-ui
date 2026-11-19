import { TSelect, type TSelectProps, type SelectOption, type SelectSize, type SelectTone } from 'tokiwagi-ui/react';
const options: SelectOption[] = [{ value: 'button', label: 'ボタン' }];
const size: SelectSize = 'md'; const tone: SelectTone = 'blue';
const props: TSelectProps = { options, size, tone, name: 'example', required: true, value: 'button',
  onChange: event => { const value: string = event.currentTarget.value; void value; } };
const select = <TSelect {...props} aria-label="見本" />;
// @ts-expect-error 複数選択は公開しない。
const multiple = <TSelect options={options} multiple />;
// @ts-expect-error 値は単一の文字列に限定する。
const array = <TSelect options={options} value={['button']} />;
// @ts-expect-error childrenではなくoptionsを使う。
const child = <TSelect options={options}><option>候補</option></TSelect>;
// @ts-expect-error ネイティブの複数行sizeを受け付けない。
const list = <TSelect options={options} size={4} />;
void [select, multiple, array, child, list];
