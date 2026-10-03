import type { TIconProps } from 'tokiwagi-ui/vue';
import { TIcon } from 'tokiwagi-ui/vue';

// check時に公開コンポーネント自身のprops型も検査する。誤った値が受理されるとexpect-errorが失敗する。
const valid: TIconProps = { name: 'moon', size: 20, color: 'currentColor', class: ['icon', { active: true }] };
const props: InstanceType<typeof TIcon>['$props'] = valid;
// @ts-expect-error 未収録の公開名は使用できない。
const invalidName: InstanceType<typeof TIcon>['$props'] = { name: 'not-an-icon' };
// @ts-expect-error 対応する4サイズ以外は使用できない。
const invalidSize: InstanceType<typeof TIcon>['$props'] = { name: 'bell', size: 18 };
// @ts-expect-error 公開名は必須。
const missingName: InstanceType<typeof TIcon>['$props'] = {};
void [props, invalidName, invalidSize, missingName];
