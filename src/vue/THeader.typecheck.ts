import { THeader, THeaderSection, THeaderButton, type THeaderSectionProps, type HeaderSectionPosition, type THeaderProps, type THeaderButtonProps, type THeaderButtonGroupProps } from 'tokiwagi-ui/vue';
const header: THeaderProps = { class: ['header'], scrollLabel: '操作', id: 'header' };
const button: THeaderButtonProps = { tone: 'blue', selected: true, disabled: false, 'aria-label': '共有', type: 'button' };
const group: THeaderButtonGroupProps = { 'aria-label': '表示形式' };
const headerProps: InstanceType<typeof THeader>['$props'] = header;
const buttonProps: InstanceType<typeof THeaderButton>['$props'] = button;
// @ts-expect-error toneは定義済みの8種類。
const invalidTone: THeaderButtonProps = { tone: 'red' };
// @ts-expect-error 選択状態はboolean。
const invalidSelected: THeaderButtonProps = { selected: 'true' };
void [group, headerProps, buttonProps, invalidTone, invalidSelected];

const sectionPosition: HeaderSectionPosition = 'center';
const section: THeaderSectionProps = { position: sectionPosition, id: 'section' };
// @ts-expect-error 配置先は必須。
const missingSectionPosition: THeaderSectionProps = {};
// @ts-expect-error left/center/right以外の配置先は受け取らない。
const invalidSectionPosition: THeaderSectionProps = { position: 'start' };
// @ts-expect-error start/end APIはTHeaderSectionによる構成へ置き換えた。
const oldHeader: THeaderProps = { start: '左', end: '右' };
void [section, missingSectionPosition, invalidSectionPosition, oldHeader];
const sectionProps: InstanceType<typeof THeaderSection>['$props'] = section;
void sectionProps;

import { headerBackgroundColors, type HeaderBackgroundColor } from 'tokiwagi-ui/vue';
const backgroundColor: HeaderBackgroundColor = '--tkw-color-secondary-navy';
const coloredHeader: THeaderProps = { backgroundColor };
// @ts-expect-error 任意の色や未定義トークンは指定できない。
const invalidBackground: THeaderProps = { backgroundColor: '#FFFFFF' };
void [headerBackgroundColors, coloredHeader, invalidBackground];
const inferredBackground: InstanceType<typeof THeader>['$props'] = coloredHeader;
// @ts-expect-error Vueの推論型でも未定義トークンを拒否する。
const invalidInferredBackground: InstanceType<typeof THeader>['$props'] = { backgroundColor: 'red' };
void [inferredBackground, invalidInferredBackground];
