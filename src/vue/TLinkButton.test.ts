import { expect, test } from 'bun:test';

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
