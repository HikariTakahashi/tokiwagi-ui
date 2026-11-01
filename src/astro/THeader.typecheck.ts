import type { THeaderSectionProps, HeaderSectionPosition, THeaderProps, THeaderButtonProps, THeaderButtonGroupProps } from 'tokiwagi-ui/astro';
const header: THeaderProps = { class: 'header', scrollLabel: '操作', id: 'header' };
const button: THeaderButtonProps = { active: true, tone: 'amber', iconOnly: true, selected: false, disabled: true, 'aria-label': '共有' };
const group: THeaderButtonGroupProps = { 'aria-label': '期間' };
// @ts-expect-error toneは定義済みの8種類。
const invalidTone: THeaderButtonProps = { tone: 'red' };
// @ts-expect-error 選択状態はboolean。
const invalidSelected: THeaderButtonProps = { selected: 'true' };
void [header, button, group, invalidTone, invalidSelected];

const sectionPosition: HeaderSectionPosition = 'center';
const section: THeaderSectionProps = { position: sectionPosition, id: 'section' };
// @ts-expect-error 配置先は必須。
const missingSectionPosition: THeaderSectionProps = {};
// @ts-expect-error left/center/right以外の配置先は受け取らない。
const invalidSectionPosition: THeaderSectionProps = { position: 'start' };
// @ts-expect-error start/end APIはTHeaderSectionによる構成へ置き換えた。
const oldHeader: THeaderProps = { start: '左', end: '右' };
void [section, missingSectionPosition, invalidSectionPosition, oldHeader];

import { headerBackgroundColors, type HeaderBackgroundColor } from 'tokiwagi-ui/astro';
const backgroundColor: HeaderBackgroundColor = '--tkw-color-secondary-navy';
const coloredHeader: THeaderProps = { backgroundColor };
// @ts-expect-error 任意の色や未定義トークンは指定できない。
const invalidBackground: THeaderProps = { backgroundColor: '#FFFFFF' };
void [headerBackgroundColors, coloredHeader, invalidBackground];

// @ts-expect-error activeはbooleanだけを受け付ける。
const invalidActive: THeaderButtonProps = { active: 'true' };
void invalidActive;
