import type { TSelectProps } from 'tokiwagi-ui/astro';
const props: TSelectProps = { options: [{ value: 'button', label: 'ボタン' }], value: 'button',
  name: 'example', form: 'editor', required: true, size: 'md', tone: 'blue', 'aria-label': '見本' };
// @ts-expect-error 複数選択は公開しない。
const multiple: TSelectProps = { options: [], multiple: true };
// @ts-expect-error 配列値は公開しない。
const array: TSelectProps = { options: [], value: ['button'] };
void [props, multiple, array];
