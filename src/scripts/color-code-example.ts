import { EditorView, minimalSetup } from 'codemirror';
import { css } from '@codemirror/lang-css';
import { colorExampleCss, colorExampleDocument, type ColorExample, type ColorExampleVariant, type SemanticColor } from '../lib/color-code-example';
import { initializeColorExamples } from '../lib/color-example-initialization';

async function writeClipboard(value: string) {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    const previousFocus = document.activeElement;
    const field = document.createElement('textarea');
    field.value = value;
    field.style.position = 'fixed';
    field.style.insetInlineStart = '-10000px';
    document.body.append(field);
    field.select();
    try {
      return document.execCommand('copy');
    } catch {
      return false;
    } finally {
      field.remove();
      if (previousFocus instanceof HTMLElement) previousFocus.focus({ preventScroll: true });
    }
  }
}

function setupColorExample(panel: HTMLElement) {
  const variants = JSON.parse(panel.dataset.variants!) as ColorExampleVariant[];
  const semantic = panel.dataset.semantic as SemanticColor | undefined;
  const swatches = panel.querySelectorAll<HTMLButtonElement>('[data-color-state]');
  const sample = panel.querySelector<HTMLElement>('[data-color-sample]')!;
  const sampleName = sample.querySelector<HTMLElement>('[data-color-name]')!;
  const sampleEnglish = sample.querySelector<HTMLElement>('[data-color-english]')!;
  const samplePurpose = sample.querySelector<HTMLElement>('[data-color-purpose]');
  const sampleContrast = sample.querySelector<HTMLElement>('[data-color-contrast]')!;
  const hex = panel.querySelector<HTMLElement>('[data-color-hex]')!;
  const token = panel.querySelector<HTMLElement>('[data-color-token]')!;
  const exampleSelect = panel.querySelector<HTMLSelectElement>('[data-example]')!;
  const formatSelect = panel.querySelector<HTMLSelectElement>('[data-format]')!;
  const editorHost = panel.querySelector<HTMLElement>('[data-editor]')!;
  const focusEditor = panel.ownerDocument.activeElement === editorHost;
  editorHost.removeAttribute('tabindex');
  const preview = panel.querySelector<HTMLIFrameElement>('[data-preview]')!;
  const feedback = panel.querySelector<HTMLElement>('[data-copy-feedback]')!;
  const codeCopyLabel = panel.querySelector<HTMLElement>('[data-code-copy-label]')!;
  const drafts = new Map<string, string>();
  let selected = Number(panel.dataset.initialIndex ?? 0);
  let editor: EditorView;
  let previewTimer: ReturnType<typeof setTimeout> | undefined;
  let copyAttempt = 0;

  function setCopyResult(button: HTMLButtonElement, copied: boolean) {
    button.dataset.copied = String(copied);
  }

  function resetCopyResults() {
    for (const button of panel.querySelectorAll<HTMLButtonElement>('[data-copy]')) {
      setCopyResult(button, false);
    }
  }

  function updateExample() {
    const variant = variants[selected]!;
    const example = exampleSelect.value as ColorExample;
    const useHex = formatSelect.value === 'hex';
    const key = [selected, example, formatSelect.value].join('/');
    const source = drafts.get(key) ?? colorExampleCss(variant, example, useHex);

    copyAttempt++;
    clearTimeout(previewTimer);
    feedback.textContent = '';
    codeCopyLabel.textContent = 'コードをコピー';
    resetCopyResults();

    editor?.destroy();
    editorHost.replaceChildren();
    editor = new EditorView({
      parent: editorHost,
      doc: source,
      extensions: [
        minimalSetup,
        css(),
        EditorView.lineWrapping,
        EditorView.contentAttributes.of({ 'aria-label': panel.dataset.editorLabel!, spellcheck: 'false' }),
        EditorView.updateListener.of(update => {
          if (!update.docChanged) return;
          const code = update.state.doc.toString();
          drafts.set(key, code);
          copyAttempt++;
          codeCopyLabel.textContent = 'コードをコピー';
          resetCopyResults();
          clearTimeout(previewTimer);
          previewTimer = setTimeout(() => {
            preview.srcdoc = colorExampleDocument(example, code, semantic);
          }, 120);
        }),
      ],
    });
    preview.srcdoc = colorExampleDocument(example, source, semantic);
    return editor;
  }

  swatches.forEach((button, index) => button.addEventListener('click', () => {
    if (selected === index) return;

    swatches[selected]!.setAttribute('aria-pressed', 'false');
    button.setAttribute('aria-pressed', 'true');
    selected = index;

    const variant = variants[selected]!;
    sample.style.backgroundColor = 'var(' + variant.token + ')';
    sample.style.color = 'var(' + variant.foreground + ')';
    sampleName.textContent = variant.label;
    sampleEnglish.textContent = variant.english;
    if (samplePurpose) samplePurpose.textContent = variant.purpose!;
    sampleContrast.textContent = variant.contrastRatio;
    hex.textContent = variant.hex;
    token.textContent = variant.token;
    updateExample();
  }));
  exampleSelect.addEventListener('change', updateExample);
  formatSelect.addEventListener('change', updateExample);

  for (const button of panel.querySelectorAll<HTMLButtonElement>('[data-copy]')) {
    button.addEventListener('click', async () => {
      const attempt = ++copyAttempt;
      const variant = variants[selected]!;
      if (button.dataset.copy === 'code') {
        const copied = await writeClipboard(editor.state.doc.toString());
        if (attempt === copyAttempt) {
          codeCopyLabel.textContent = copied ? 'コードをコピーしました' : 'コピーできませんでした';
          setCopyResult(button, copied);
        }
        return;
      }

      const copiesHex = button.dataset.copy === 'hex';
      const copied = await writeClipboard(copiesHex ? variant.hex : variant.token);
      if (attempt !== copyAttempt) return;
      setCopyResult(button, copied);
      feedback.textContent = copied
        ? (copiesHex ? 'カラーコードをコピーしました！' : 'CSSトークンをコピーしました！')
        : 'コピーできませんでした';
    });
  }

  const initialEditor = updateExample();
  if (focusEditor) initialEditor.focus();
}

initializeColorExamples(document.querySelectorAll<HTMLElement>('[data-color-code-example]'), setupColorExample);
