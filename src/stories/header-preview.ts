import type { HeaderTone, HeaderSectionPosition } from '../lib/header';
import type { IconName } from '../lib/icon-sources';

export type HeaderButtonContent = 'text' | 'icon' | 'icon-text';

export type HeaderComponent = 'THeader' | 'THeaderButton' | 'THeaderButtonGroup' | 'THeaderSection';
export type HeaderPreviewOptions = {
  tone: HeaderTone; disabled: boolean;
  iconOnly?: boolean; selected?: boolean; view?: 'year' | 'month' | 'week';
  position?: HeaderSectionPosition; content?: HeaderButtonContent; text?: string; icon?: IconName;
} & ({ component: 'THeader' } | { component: 'THeaderButton' } | { component: 'THeaderButtonGroup' } | { component: 'THeaderSection' });
export type AstroHeaderPreviews = Record<string, string>;
export function headerButtonContent(options: HeaderPreviewOptions): HeaderButtonContent {
  return options.content ?? (options.iconOnly ? 'icon' : 'icon-text');
}
export function headerButtonText(options: HeaderPreviewOptions): string {
  return options.text?.trim() ? options.text : '操作';
}
export function headerPreviewKey(options: HeaderPreviewOptions) {
  if (options.component === 'THeaderSection') return `THeaderSection:${options.position ?? 'left'}`;
  const iconOnly = options.component === 'THeaderButton' ? headerButtonContent(options) === 'icon' : options.iconOnly ?? false;
  return [options.component, options.tone, options.disabled, iconOnly, options.selected ?? 'unset', options.view ?? 'month'].join(':');
}

/** 見本の構成だけを共有し、React/Vueの公開部品をそれぞれ直接描画する。 */
export function renderHeaderExample<Node>(options: HeaderPreviewOptions, create: (
  name: HeaderComponent | 'TIcon' | 'a' | 'span' | 'div', props: Record<string, unknown>, children?: (Node | string)[],
) => Node): Node {
  const icon = (name: string, size = 24) => create('TIcon', { name, size });
  const button = (children: (Node | string)[], attributes: Record<string, unknown> = {}) =>
    create('THeaderButton', { tone: options.tone, disabled: options.disabled, ...attributes }, children);
  const group = (label: string, children: Node[]) => create('THeaderButtonGroup', { 'aria-label': label }, children);
  const views = () => group('カレンダーの表示形式', (['year', 'month', 'week'] as const).map((view, i) =>
    button([['年', '月', '週'][i]!], { selected: (options.view ?? 'month') === view })));
  if (options.component === 'THeaderButton') {
    const content = headerButtonContent(options);
    const text = headerButtonText(options);
    return button([
      ...(content === 'text' ? [] : [icon(options.icon ?? 'share')]),
      ...(content === 'icon' ? [] : [text]),
    ], { iconOnly: content === 'icon', selected: options.selected, ...(content === 'icon' ? { 'aria-label': text } : {}) });
  }
  if (options.component === 'THeaderButtonGroup') return views();
  if (options.component === 'THeaderSection') return create('THeader', { className: 'tkw-header-sample' }, [
    create('THeaderSection', { position: options.position ?? 'left' }, ['セクション']),
  ]);
  const left = create('THeaderSection', { position: 'left' }, [
    button([icon('menu')], { iconOnly: true, 'aria-label': 'メニューを開く', 'aria-expanded': false }),
    create('a', { href: '#home', className: 'tkw-header-sample__brand', 'aria-label': 'TokiWa Calendar ホーム' }, [
      create('span', { className: 'tkw-header-sample__toki' }, ['Toki']),
      create('span', { className: 'tkw-header-sample__wa' }, ['Wa']), ' Calendar',
    ]),
    button([icon('dashboard'), '予定調整モード', icon('chevron-bottom', 16)], { 'aria-expanded': false, 'aria-label': 'モードを選択、現在は予定調整モード' }),
  ]);
  const right = create('THeaderSection', { position: 'right' }, [
    group('日程調整', [button(['候補を見る', icon('calendar-check')]), button(['共有設定', icon('share')])]),
    button(['2026年1月1日', icon('chevron-bottom')], { 'aria-expanded': false, 'aria-label': '表示日付を選択、2026年1月1日' }),
    views(),
    group('表示期間の移動', [
      button([icon('chevron-left', 16)], { iconOnly: true, 'aria-label': '前の期間へ' }),
      button(['今日']),
      button([icon('chevron-right', 16)], { iconOnly: true, 'aria-label': '次の期間へ' }),
    ]),
  ]);
  const center = create('THeaderSection', { position: 'center' }, [
    create('span', { className: 'tkw-header-sample__dot', 'aria-hidden': true }),
    create('span', { className: 'tkw-header-sample__title' }, ['カレンダー名']),
    button([icon('edit', 16)], { iconOnly: true, 'aria-label': 'カレンダー名を編集' }),
  ]);
  return create('THeader', { className: 'tkw-header-sample' }, [left, center, right]);
}
