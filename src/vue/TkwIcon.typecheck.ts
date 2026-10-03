import type { TkwIconProps } from 'tokiwagi-ui/vue';
import { TkwIcon } from 'tokiwagi-ui/vue';

// check時に公開コンポーネント自身のprops型も検査する。誤った値が受理されるとexpect-errorが失敗する。
const valid: TkwIconProps = { name: 'moon', size: 20, color: 'currentColor', class: ['icon', { active: true }] };
const props: InstanceType<typeof TkwIcon>['$props'] = valid;
// @ts-expect-error 未収録の公開名は使用できない。
const invalidName: InstanceType<typeof TkwIcon>['$props'] = { name: 'not-an-icon' };
// @ts-expect-error 対応する4サイズ以外は使用できない。
const invalidSize: InstanceType<typeof TkwIcon>['$props'] = { name: 'bell', size: 18 };
// @ts-expect-error 公開名は必須。
const missingName: InstanceType<typeof TkwIcon>['$props'] = {};
void [props, invalidName, invalidSize, missingName];
