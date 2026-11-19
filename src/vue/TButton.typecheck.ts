import { TButton, buttonSizes, type TButtonProps, type ButtonTone, type ButtonSize, type ButtonOptions } from 'tokiwagi-ui/vue';

const tone: ButtonTone = 'blue';
const size: ButtonSize = buttonSizes[1];
const options: ButtonOptions = { size, leadingIcon: 'save', trailingIcon: 'tool' };
const props: TButtonProps = { ...options, tone, type: 'submit', disabled: false,
  form: 'editor', class: 'save', onClick: event => { void event.currentTarget; } };
const inferred: InstanceType<typeof TButton>['$props'] = props;
// @ts-expect-error 存在するアイコン名だけを受け付ける。
const invalidIcon: TButtonProps = { leadingIcon: 'missing-icon' };
// @ts-expect-error 推論型も不正な色を拒否する。
const invalidTone: InstanceType<typeof TButton>['$props'] = { tone: 'red' };
// @ts-expect-error 公開型は未登録の末尾アイコンを拒否する。
const invalidTrailingIcon: TButtonProps = { trailingIcon: 'missing-icon' };
// @ts-expect-error 推論型も未登録の末尾アイコンを拒否する。
const invalidInferredIcon: InstanceType<typeof TButton>['$props'] = { trailingIcon: 'missing-icon' };
// @ts-expect-error 公開型はinheritサイズを受け付けない。
const invalidSize: TButtonProps = { size: 'inherit' };
// @ts-expect-error 推論型も未定義サイズを拒否する。
const invalidInferredSize: InstanceType<typeof TButton>['$props'] = { size: 'xl' };
void [inferred, invalidIcon, invalidTone, invalidTrailingIcon, invalidInferredIcon, invalidSize, invalidInferredSize];
