import type { ComponentProps } from 'react';
import 'tokiwagi-ui/header.css';
import { THeader, THeaderSection, THeaderButton, THeaderButtonGroup, type THeaderSectionProps, type HeaderSectionPosition, type THeaderProps, type THeaderButtonProps, type THeaderButtonGroupProps, type HeaderTone } from 'tokiwagi-ui/react';
const tone: HeaderTone = 'violet';
const header: THeaderProps = { scrollLabel: '操作', id: 'header', className: 'header' };
const button: THeaderButtonProps = { tone, disabled: false, selected: true, 'aria-expanded': false, onClick: event => event.currentTarget.focus() };
const group: THeaderButtonGroupProps = { 'aria-label': '表示形式' };
const inferred: ComponentProps<typeof THeaderButton> = button;
const example = <THeader {...header}><THeaderSection position="right"><THeaderButtonGroup {...group}><THeaderButton {...button}>月</THeaderButton></THeaderButtonGroup></THeaderSection></THeader>;
// @ts-expect-error 定義済みのtoneだけを許可する。
const invalidTone = <THeaderButton tone="red" />;
// @ts-expect-error 選択状態はboolean。
const invalidSelected = <THeaderButton selected="true" />;
// @ts-expect-error ボタンをリンクに変更するAPIは持たない。
const invalidHref = <THeaderButton href="/" />;
// @ts-expect-error グループの役割は固定。
const invalidRole = <THeaderButtonGroup role="tablist" />;
void [inferred, example, invalidTone, invalidSelected, invalidHref, invalidRole];

const sectionPosition: HeaderSectionPosition = 'center';
const section: THeaderSectionProps = { position: sectionPosition, id: 'section' };
// @ts-expect-error 配置先は必須。
const missingSectionPosition: THeaderSectionProps = {};
// @ts-expect-error left/center/right以外の配置先は受け取らない。
const invalidSectionPosition: THeaderSectionProps = { position: 'start' };
// @ts-expect-error start/end APIはTHeaderSectionによる構成へ置き換えた。
const oldHeader: THeaderProps = { start: '左', end: '右' };
void [section, missingSectionPosition, invalidSectionPosition, oldHeader];
