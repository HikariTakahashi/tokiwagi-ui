import { cardState, cardActionAreaState, type CardOptions } from '../lib/card';

export const cardViews = ['basic', 'task', 'media', 'link'] as const;
export type CardPreviewOptions = Required<CardOptions> & {
  component: 'TCard'; view: typeof cardViews[number]; title: string; description: string; text: string; href: string;
};
export type AstroCardPreviews = Record<typeof cardViews[number], Record<NonNullable<CardOptions['as']>, string>>;
export const cardExampleDefaults = {
  title: 'デザインシステムを整える', description: 'Tokiwagi UI / コンポーネント設計',
  text: 'チームで使うUIの見た目と振る舞いを揃え、使いやすい画面をつくります。', href: '#tcard-details',
};

/** 実コンポーネントのHTMLを使い、文字列はHTMLとして解釈せず、参照IDを見本ごとに分離する。 */
export function astroCardPreviewHtml(previews: AstroCardPreviews, options: CardPreviewOptions, prefix: string) {
  const state = cardState(options);
  const template = document.createElement('template');
  template.innerHTML = previews[options.view][state.tag];
  const card = template.content.querySelector('.tkw-card');
  if (!card) throw new Error('AstroのTCard見本がありません');
  for (const [key, value] of Object.entries(state.attributes)) card.setAttribute(key, value);
  const title = card.querySelector('.tkw-card-title');
  if (!title) throw new Error('AstroのTCard見本に見出しがありません');
  title.id = `${prefix}-title`;
  title.textContent = options.title;
  card.setAttribute('aria-labelledby', title.id);
  for (const [selector, text] of [['.tkw-card-description', options.description], ['.tkw-card-example-copy', options.text]]) {
    const node = card.querySelector(selector!);
    if (!node) throw new Error('AstroのTCard見本に文言の配置先がありません');
    node.textContent = text!;
  }
  const { href } = cardActionAreaState({ href: options.href });
  for (const link of card.querySelectorAll('a')) link.setAttribute('href', href);
  return template.innerHTML;
}
