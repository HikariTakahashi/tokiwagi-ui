import { TButton, type TButtonProps, type ButtonTone } from 'tokiwagi-ui/vue';

const tone: ButtonTone = 'blue';
const props: TButtonProps = { tone, leadingIcon: 'save', type: 'submit', disabled: false,
  form: 'editor', class: 'save', onClick: event => { void event.currentTarget; } };
const inferred: InstanceType<typeof TButton>['$props'] = props;
// @ts-expect-error 存在するアイコン名だけを受け付ける。
const invalidIcon: TButtonProps = { leadingIcon: 'missing-icon' };
// @ts-expect-error 推論型も不正な色を拒否する。
const invalidTone: InstanceType<typeof TButton>['$props'] = { tone: 'red' };
void [inferred, invalidIcon, invalidTone];
