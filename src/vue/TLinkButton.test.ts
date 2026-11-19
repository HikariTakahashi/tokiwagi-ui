import { expect, test } from 'bun:test';

// 無効状態でSSR・hydrateし、属性やイベントを抑止した後に元のリンクへ戻せることを確認する。
test('VueのTLinkButtonはautofocusを転送し無効化と再有効化に対応する', () => {
  const script = `
    import assert from 'node:assert/strict';
    import { Window } from 'happy-dom';
    const browser = new Window();
    for (const [key,value] of Object.entries({window:browser,document:browser.document,
      HTMLElement:browser.HTMLElement,Element:browser.Element,SVGElement:browser.SVGElement,Node:browser.Node})) {
      Object.defineProperty(globalThis,key,{configurable:true,writable:true,value});
    }
    const {createSSRApp,h,nextTick,ref}=await import('vue');
    const {renderToString}=await import('@vue/server-renderer');
    const {TLinkButton}=await import('tokiwagi-ui/vue');
    const disabled=ref(true), warnings=[]; let actions=0, parentClicks=0;
    console.warn=(...args)=>warnings.push(args);console.error=(...args)=>warnings.push(args);
    const page={render:()=>h('div',{onClick:()=>parentClicks++},[h(TLinkButton,{
      href:'#restored',disabled:disabled.value,target:'_blank',rel:'external opener',download:'file',
      tabindex:3,autofocus:true,contenteditable:true,accesskey:'x','aria-disabled':'false',role:'button',
      'aria-describedby':'hint',leadingIcon:'moon',
      onClick:event=>{actions++;event.preventDefault();},onClickCapture:()=>actions++,onAuxclick:()=>actions++,onDblclick:()=>actions++,
      onKeydown:()=>actions++,onPointerdown:()=>actions++,
    },()=> '準備中')])};
    const host=document.createElement('div');document.body.append(host);
    host.innerHTML=await renderToString(createSSRApp(page));
    const anchor=host.querySelector('a'), icon=anchor.querySelector('svg');
    for(const name of ['href','target','rel','download','tabindex','autofocus','contenteditable','accesskey','disabled']) assert.equal(anchor.hasAttribute(name),false);
    assert.equal(anchor.getAttribute('role'),'link');assert.equal(anchor.getAttribute('aria-disabled'),'true');
    const app=createSSRApp(page);app.mount(host);
    for(const type of ['click','auxclick','dblclick','pointerdown']) anchor.dispatchEvent(new browser.MouseEvent(type,{bubbles:true,cancelable:true}));
    anchor.dispatchEvent(new browser.KeyboardEvent('keydown',{key:'Enter',bubbles:true,cancelable:true}));
    assert.deepEqual([actions,parentClicks],[0,0]);
    disabled.value=false;await nextTick();
    assert.equal(host.querySelector('a'),anchor);assert.equal(anchor.querySelector('svg'),icon);
    assert.equal(anchor.getAttribute('href'),'#restored');assert.equal(anchor.rel,'external noopener');
    assert.equal(anchor.getAttribute('download'),'file');assert.equal(anchor.tabIndex,3);
    assert.equal(anchor.hasAttribute('autofocus'),true);assert.equal(anchor.hasAttribute('data-disabled'),false);
    assert.equal(anchor.getAttribute('aria-disabled'),'false');
    anchor.click();assert.deepEqual([actions,parentClicks],[2,1]);
    disabled.value=true;await nextTick();anchor.click();assert.deepEqual([actions,parentClicks],[2,1]);
    assert.deepEqual(warnings,[]);app.unmount();await browser.happyDOM.close();
  `;
  const result = Bun.spawnSync([process.execPath, '-e', script], { cwd: new URL('../../', import.meta.url).pathname });
  expect(result.stderr.toString()).toBe('');
  expect(result.exitCode).toBe(0);
});

// VueがDOMを捕捉する前にwindowを作り、SSR後の属性・イベント・アイコン削除を独立したプロセスで確認する。
test('VueのTLinkButtonはSSR後も属性とイベントをa要素へ転送する', () => {
  const script = `
    import assert from 'node:assert/strict';
    import { Window } from 'happy-dom';
    const browser = new Window();
    for (const [key,value] of Object.entries({window:browser,document:browser.document,
      HTMLElement:browser.HTMLElement,Element:browser.Element,SVGElement:browser.SVGElement,Node:browser.Node})) {
      Object.defineProperty(globalThis,key,{configurable:true,writable:true,value});
    }
    const {createSSRApp,h,nextTick,ref}=await import('vue');
    const {renderToString}=await import('@vue/server-renderer');
    const {TLinkButton}=await import('tokiwagi-ui/vue');
    const updated=ref(false), clicked=[], warnings=[];
    console.warn=(...args)=>warnings.push(args);
    console.error=(...args)=>warnings.push(args);
    const page={render:()=>h(TLinkButton,{
      size:updated.value?'lg':'sm',href:updated.value?'#next':'/予定',target:'_blank',rel:'opener external',
      leadingIcon:'moon',trailingIcon:updated.value?undefined:'tool',class:['details'],
      'aria-current':updated.value?'page':undefined,'aria-describedby':'hint',
      onClick:event=>{clicked.push(event.currentTarget);assert.equal(event.defaultPrevented,false);event.preventDefault();},
    },()=>h('em','予定の詳細'))};
    const host=document.createElement('div');document.body.append(host);
    host.innerHTML=await renderToString(createSSRApp(page));
    const anchor=host.querySelector('a'),icons=[...anchor.querySelectorAll('svg')];
    assert.equal(anchor.className,'tkw-button tkw-link-button details');
    assert.equal(anchor.getAttribute('aria-describedby'),'hint');
    assert.equal(anchor.rel,'external noopener');
    assert.equal(anchor.querySelector('em').textContent,'予定の詳細');
    assert.equal(new Set([...anchor.querySelectorAll('[id]')].map(el=>el.id)).size,2);
    const app=createSSRApp(page);app.mount(host);
    assert.equal(host.querySelector('a'),anchor);
    assert.deepEqual([...anchor.querySelectorAll('svg')],icons);
    anchor.click();assert.deepEqual(clicked,[anchor]);
    updated.value=true;await nextTick();
    assert.equal(anchor.getAttribute('href'),'#next');
    assert.equal(anchor.getAttribute('data-size'),'lg');
    assert.equal(anchor.querySelector('svg').getAttribute('width'),'32');
    assert.equal(anchor.querySelector('svg'),icons[0]);
    assert.equal(anchor.hasAttribute('data-current'),true);
    assert.equal(anchor.getAttribute('aria-current'),'page');
    assert.equal(anchor.querySelector('.tkw-link-button__trailing-icon'),null);
    assert.deepEqual(warnings,[]);
    app.unmount();await browser.happyDOM.close();
  `;
  const result = Bun.spawnSync([process.execPath, '-e', script], { cwd: new URL('../../', import.meta.url).pathname });
  expect(result.stderr.toString()).toBe('');
  expect(result.exitCode).toBe(0);
});

// Vueの公開入口から両部品を描画し、追加色がpropsとして解決されdata-toneまで保持されることを確認する。
test('Vueの両ボタンは全toneをSSRで保持する', async () => {
  const { createSSRApp, h } = await import('vue');
  const { renderToString } = await import('@vue/server-renderer');
  const { TButton, TLinkButton, buttonTones } = await import('tokiwagi-ui/vue');
  for (const tone of buttonTones) for (const disabled of [false, true]) {
    const html = await renderToString(createSSRApp({ render: () => h('div', [
      h(TButton, { tone, disabled }, () => '保存'), h(TLinkButton, { href: '/', tone, disabled }, () => '予定'),
    ]) }));
    expect(html.match(new RegExp(`data-tone="${tone}"`, 'g'))).toHaveLength(2);
  }
});
