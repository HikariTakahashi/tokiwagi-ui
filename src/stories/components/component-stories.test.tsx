import { expect, mock, test } from 'bun:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { iconNames } from '../../lib/icon-sources';

mock.module('virtual:tkw-astro-icons', () => ({ default: '/astro-icons.json' }));
mock.module('virtual:tkw-astro-logos', () => ({ default: '/astro-logos.json' }));
mock.module('virtual:tkw-astro-brands', () => ({ default: '/astro-brands.json' }));
const icon = await import('../TIcon.stories');
const logo = await import('../TLogo.stories');
const brand = await import('../TBrand.stories');
const bellOff = await import('../icon-examples/bell-off.stories');
const { ComponentPreview } = await import('./ComponentPreview');

// 3ストーリーがbell-offと同じ中央表示・標準パネルを使い、必要な設定だけを公開することを確認する。
test('コンポーネントストーリーはbell-offと同じ最小構成を持つ', () => {
  for (const [name, story, controls] of [
    ['TIcon', icon, ['framework', 'name', 'size', 'color']],
    ['TLogo', logo, ['framework', 'size', 'decorative']],
    ['TBrand', brand, ['framework', 'size']],
  ] as const) {
    const meta = story.default;
    expect(meta.title).toBe(`コンポーネント/${name}`);
    expect(meta.id).toBe(`components-${name.toLowerCase()}`);
    expect(meta.tags).toEqual(['!autodocs']);
    expect(meta.parameters.layout).toBe(bellOff.default.parameters.layout);
    expect(meta.parameters.options).toEqual(bellOff.default.parameters.options);
    expect(meta.parameters.controls).toEqual({ disable: false, include: [...controls], disableSaveFromUI: true });
    expect(Object.keys(meta.argTypes)).toEqual([...controls]);
    expect(meta.argTypes.framework.options).toEqual(['react', 'vue', 'astro']);
    expect(story.Default.play).toBeUndefined();
  }
  expect(icon.default.args).toEqual({ framework: 'react', name: 'bell', size: 24, color: 'currentColor' });
  expect(logo.default.args).toEqual({ framework: 'react', size: 32, decorative: false });
  expect(brand.default.args).toEqual({ framework: 'react', size: 32 });
  expect(icon.default.argTypes.name.options).toEqual(iconNames);
  expect(icon.default.argTypes.size).toEqual(bellOff.default.argTypes.size);
  expect(icon.default.argTypes.color).toEqual(bellOff.default.argTypes.color);
});

// 公開入口を実描画し、説明用UIの混入や、TLogoの配色・余白・altの退行を検出する。
test('正常なReactプレビューには実コンポーネント以外のUIを追加しない', () => {
  const html = renderToStaticMarkup(createElement(ComponentPreview, { component: 'TIcon', ...icon.default.args }));
  expect(html).toMatch(/^<svg\b[\s\S]*<\/svg>$/);
  expect(html).toContain('width="24" height="24"');
  for (const size of [32, 64, 128] as const) {
    for (const decorative of [false, true]) {
      const logoHtml = renderToStaticMarkup(createElement(ComponentPreview, { component: 'TLogo', framework: 'react', size, decorative }));
      expect(logoHtml.match(/<img\b/g)).toHaveLength(1);
      expect(logoHtml).toContain(`alt="${decorative ? '' : 'Tokiwagi UI'}"`);
      expect(logoHtml).toContain(`padding:${size / 4}px`);
      expect(logoHtml).not.toMatch(/<(?:h1|h2|p|select|button|table|details|pre)\b/);
    }
    const brandHtml = renderToStaticMarkup(createElement(ComponentPreview, { component: 'TBrand', framework: 'react', size }));
    expect(brandHtml.match(/<img\b/g)).toHaveLength(1);
    expect(brandHtml).toContain('>Tokiwagi UI</span>');
    expect(brandHtml).not.toMatch(/<(?:h1|h2|p|select|button|table|details|pre)\b/);
  }
});

// DOM初期化前にVueが他のテストから読み込まれる影響を避け、独立したプロセスで実アプリの解放を確認する。
test('args更新ではVueアプリを再利用し、方式切り替えと離脱で解放する', () => {
  const script = `
    import assert from 'node:assert/strict';
    import { Window } from 'happy-dom';
    import { mock, spyOn } from 'bun:test';
    const window = new Window();
    for (const [key,value] of Object.entries({window,document:window.document,navigator:window.navigator,
      HTMLElement:window.HTMLElement,Element:window.Element,SVGElement:window.SVGElement,Node:window.Node,IS_REACT_ACT_ENVIRONMENT:true})) {
      Object.defineProperty(globalThis,key,{configurable:true,writable:true,value});
    }
    mock.module('virtual:tkw-astro-icons',()=>({default:'/icons.json'}));
    mock.module('virtual:tkw-astro-logos',()=>({default:'/logos.json'}));
    mock.module('virtual:tkw-astro-brands',()=>({default:'/brands.json'}));
    let memo, cleanup;
    mock.module('storybook/preview-api',()=>({
      useMemo:fn=>memo??=fn(),
      useEffect:(fn,deps)=>{const dispose=fn();if(deps.length===1)cleanup=dispose;},
    }));
    const {act}=await import('react');
    const vue=await import('vue');
    const createApp=vue.createApp;
    const unmounts=[];
    spyOn(vue,'createApp').mockImplementation((...args)=>{
      const app=createApp(...args); unmounts.push(spyOn(app,'unmount')); return app;
    });
    for (const name of ['TIcon','TLogo','TBrand']) {
      const {default:meta}=await import('./src/stories/'+name+'.stories.ts');
      let firstHost;
      for (const size of name==='TIcon'?[20,32]:[64,128]) {
        let host;
        await act(async()=>{host=meta.render({...meta.args,framework:'vue',size});document.body.append(host);});
        firstHost??=host;
        assert.equal(host,firstHost);
        const image=host.querySelector('svg,img');
        assert.equal(image.getAttribute('width'),String(size));
      }
      const unmount=unmounts.at(-1);
      assert.equal(unmount.mock.calls.length,0);
      await act(async()=>meta.render({...meta.args,framework:'react'}));
      assert.equal(unmount.mock.calls.length,1);
      await act(async()=>cleanup());
      assert.equal(firstHost.children.length,0);
      firstHost.remove();
      memo=undefined;
    }
    assert.equal(unmounts.length,3);
    await window.happyDOM.close();
  `;
  const result = Bun.spawnSync([process.execPath, '-e', script], { cwd: new URL('../../..', import.meta.url).pathname });
  expect(result.stderr.toString()).toBe('');
  expect(result.exitCode).toBe(0);
});
