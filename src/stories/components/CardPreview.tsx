import * as ReactCard from 'tokiwagi-ui/react';
import * as VueCard from 'tokiwagi-ui/vue';
import { h } from 'vue';
import type { CardPreviewOptions } from '../card-preview';

export function ReactCardPreview(options: CardPreviewOptions & { prefix: string }) {
  const { TCard, TCardHeader, TCardTitle, TCardDescription, TCardBody, TCardFooter, TCardMedia, TCardActionArea } = ReactCard;
  const titleId = `${options.prefix}-title`;
  const header = <TCardHeader>
    <div className="tkw-card-example-eyebrow">{options.view === 'task' ? 'デザイン / タスク' : options.view === 'media' ? 'デザインノート' : options.view === 'link' ? 'スタートガイド' : 'プロジェクト'}{options.view === 'task' && <span className="tkw-card-example-status">進行中</span>}</div>
    <TCardTitle id={titleId}>{options.title}</TCardTitle>
    <TCardDescription>{options.description}</TCardDescription>
  </TCardHeader>;
  const body = <TCardBody><p className="tkw-card-example-copy">{options.text}</p></TCardBody>;
  const footer = <TCardFooter><span className="tkw-card-example-meta">{options.view === 'task' ? '今日 18:00' : '更新：今日'}</span>
    {options.view === 'link' ? <span>導入ガイドを開く →</span> : <a className="tkw-card-example-action" href={options.href}>詳細を見る →</a>}
  </TCardFooter>;
  return <TCard as={options.as} variant={options.variant} size={options.size} aria-labelledby={titleId}>
    {options.view === 'media' && <TCardMedia><div className="tkw-card-example-media" role="img" aria-label="余白を取って並べた2枚のカードのイラスト"><span /><span /></div></TCardMedia>}
    {options.view === 'link' ? <TCardActionArea href={options.href}>{header}{body}{footer}</TCardActionArea> : <>{header}{body}{footer}</>}
  </TCard>;
}

export function vueCardPreview(options: CardPreviewOptions, prefix: string) {
  const { TCard, TCardHeader, TCardTitle, TCardDescription, TCardBody, TCardFooter, TCardMedia, TCardActionArea } = VueCard;
  const titleId = `${prefix}-title`;
  const content = () => [
    h(TCardHeader, null, () => [
      h('div', { class: 'tkw-card-example-eyebrow' }, [
        options.view === 'task' ? 'デザイン / タスク' : options.view === 'media' ? 'デザインノート' : options.view === 'link' ? 'スタートガイド' : 'プロジェクト',
        options.view === 'task' ? h('span', { class: 'tkw-card-example-status' }, '進行中') : null,
      ]),
      h(TCardTitle, { id: titleId }, () => options.title),
      h(TCardDescription, null, () => options.description),
    ]),
    h(TCardBody, null, () => h('p', { class: 'tkw-card-example-copy' }, options.text)),
    h(TCardFooter, null, () => [
      h('span', { class: 'tkw-card-example-meta' }, options.view === 'task' ? '今日 18:00' : '更新：今日'),
      options.view === 'link' ? h('span', '導入ガイドを開く →') : h('a', { class: 'tkw-card-example-action', href: options.href }, '詳細を見る →'),
    ]),
  ];
  return h(TCard, { as: options.as, variant: options.variant, size: options.size, 'aria-labelledby': titleId }, () => [
    options.view === 'media' ? h(TCardMedia, null, () => h('div', { class: 'tkw-card-example-media', role: 'img', 'aria-label': '余白を取って並べた2枚のカードのイラスト' }, [h('span'), h('span')])) : null,
    options.view === 'link' ? h(TCardActionArea, { href: options.href }, content) : content(),
  ]);
}
