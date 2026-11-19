import { TSelect, type TSelectProps } from 'tokiwagi-ui/vue';
import { h } from 'vue';
const props: TSelectProps = { options: [{ value: 'button', label: 'ボタン' }], modelValue: 'button',
  'onUpdate:modelValue': value => value.toUpperCase(), name: 'example', required: true, size: 'md', tone: 'green' };
const select = h(TSelect, props);
// @ts-expect-error 値は単一の文字列に限定する。
const multiple: TSelectProps = { options: [], modelValue: ['button'] };
// @ts-expect-error 未定義の色は受け付けない。
const tone: TSelectProps = { options: [], tone: 'red' };
void [select, multiple, tone];
