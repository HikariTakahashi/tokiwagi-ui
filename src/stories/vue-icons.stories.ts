import type { Meta, StoryObj } from '@storybook/html-vite';
import { createApp, h, ref } from 'vue';
import { TIcon, iconNames, type IconName } from 'tokiwagi-ui/vue';
import { iconSizes } from '../lib/icon-assets';
import { colors } from '../lib/palette';
import './vue-icons.css';

const meta = {
  title: 'アイコン/Vueコンポーネント',
  parameters: { docs: { description: { component: '実際のTIconをVueでマウントします。利用方法は「Vueでの利用」を参照してください。' } } },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  name: 'サイズ・色・複数表示・操作',
  render: () => {
    const root = document.createElement('main');
    root.className = 'tkw-vue-demo';
    const app = createApp({
      setup() {
        const selected = ref<IconName>('moon');
        const count = ref(0);
        return () => h('div', [
          h('h1', 'Vueアイコンの動作確認'),
          h('p', '公開名・4サイズ・トークン色を確認できます。moonとtoolは同じ図柄を繰り返し表示しています。'),
          h('label', { class: 'tkw-vue-picker' }, [
            '公開名 ',
            h('select', { value: selected.value, onChange: (event: Event) => { selected.value = (event.target as HTMLSelectElement).value as IconName; } }, iconNames.map(name => h('option', { value: name }, name))),
          ]),
          h('div', { class: 'tkw-vue-sizes' }, iconSizes.map(size => h('figure', [
            h(TIcon, { name: selected.value, size, color: 'var(--tkw-color-primary-blue-on-subtle)', class: 'tkw-vue-selected' }),
            h('figcaption', `${size}px`),
          ]))),
          h('h2', '7色のプライマリー'),
          h('div', { class: 'tkw-vue-colors' }, colors.map(([color]) => h('div', {
            style: { background: `var(--tkw-color-primary-${color})`, color: `var(--tkw-color-primary-${color}-on)` },
          }, [h(TIcon, { name: selected.value }), h('span', color)]))),
          h('h2', 'クリッピングと線・塗り'),
          h('div', { class: 'tkw-vue-repeated' }, ['moon', 'tool', 'like'].map(name => h('div', [
            h('span', name),
            ...iconSizes.map(size => h(TIcon, { name: name as IconName, size, color: 'var(--tkw-color-primary-violet-on-subtle)' })),
          ]))),
          h('h2', 'キーボード操作と読み上げ名'),
          h('div', { class: 'tkw-vue-actions' }, [
            h('button', { type: 'button', onClick: () => count.value++ }, [h(TIcon, { name: 'plus', size: 20 }), 'タスクを追加']),
            h('button', { type: 'button', 'aria-label': '通知一覧を開く', onClick: () => count.value++ }, [h(TIcon, { name: 'bell' })]),
            h('button', { type: 'button', disabled: true }, [h(TIcon, { name: 'save', size: 20 }), '保存済み']),
          ]),
          h('p', { role: 'status' }, `操作回数: ${count.value}`),
          h('p', [h(TIcon, { name: 'check', size: 20, color: 'var(--tkw-color-semantic-success-on-subtle)' }), ' 完了：状態は文言でも伝えます。']),
        ]);
      },
    });
    // Storybookに別のVue rootが存在してもuseIdのID空間を共有しない。
    app.config.idPrefix = `vue-icons-${crypto.randomUUID()}`;
    app.mount(root);
    const observer = new MutationObserver(() => {
      if (!root.isConnected) { app.unmount(); observer.disconnect(); }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return root;
  },
};
