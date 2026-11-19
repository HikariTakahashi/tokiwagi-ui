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

const neutralTones = ['neutral-0', 'neutral-600', 'neutral-800', 'neutral-900'] as const;
const neutralProps: TButtonProps[] = neutralTones.map(tone => ({ tone }));
// @ts-expect-error 無効状態用の400は通常のtoneに公開しない。
const disabledTone: TButtonProps = { tone: 'neutral-400' };
void [neutralProps, disabledTone];
const inferredNeutralProps: InstanceType<typeof TButton>['$props'][] = neutralTones.map(tone => ({ tone }));
void inferredNeutralProps;

// TTextと同じ4段階の公開型を受け付け、未指定と文字列inheritを区別する。
const weightedProps: TButtonProps[] = (['normal', 'medium', 'semibold', 'bold'] as const)
  .map(weight => ({ weight }));
// @ts-expect-error 継承する場合はweightを省略する。
const invalidWeight: TButtonProps = { weight: 'inherit' };
// @ts-expect-error 太さの指定は数値ではなくTText共通の名前を使う。
const numericWeight: TButtonProps = { weight: 700 };
void [weightedProps, invalidWeight, numericWeight];
const inferredWeights: InstanceType<typeof TButton>['$props'][] = weightedProps;
// @ts-expect-error Vueの推論型も4段階以外の値を拒否する。
const invalidInferredWeight: InstanceType<typeof TButton>['$props'] = { weight: 'inherit' };
void [inferredWeights, invalidInferredWeight];
