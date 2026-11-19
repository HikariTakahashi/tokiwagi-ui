import { buttonDisabledState, buttonToneState, buttonWeightState } from './button';
import { linkState, type LinkButtonOptions, type LinkCurrent } from './link';

export function linkButtonState({ tone, weight, disabled, ...options }: LinkButtonOptions & {
  target?: string; rel?: string; 'aria-current'?: LinkCurrent;
}) {
  return { ...linkState(options, 'TLinkButton'), tone: buttonToneState(tone, 'TLinkButton'),
    weight: buttonWeightState(weight, 'TLinkButton'),
    disabled: buttonDisabledState(disabled, 'TLinkButton') };
}

/** 静的HTMLでも利用側から渡された遷移・操作・フォーカス設定を無効化する。 */
export function linkButtonAttributes<T extends object>(attributes: T, disabled: boolean): Partial<T> {
  if (!disabled) return attributes;
  return Object.fromEntries(Object.entries(attributes).filter(([name]) => {
    const key = name.toLowerCase();
    return !['href', 'target', 'rel', 'download', 'ping', 'hreflang', 'referrerpolicy', 'type',
      'tabindex', 'autofocus', 'accesskey', 'contenteditable', 'role', 'aria-disabled', 'data-disabled'].includes(key)
      && !/^on(click|dblclick|doubleclick|auxclick|keydown|keypress|keyup|mousedown|mouseup|pointerdown|pointerup|touchstart|touchend)/.test(key);
  })) as Partial<T>;
}

/** 無効時に利用側のクリック処理へ伝播させない。TabやEscapeなどの操作は妨げない。 */
export function stopDisabledLinkActivation(event: {
  type: string; key?: string; preventDefault(): void; stopPropagation(): void;
}) {
  if (event.type.startsWith('key') && !['Enter', ' ', 'Spacebar'].includes(event.key ?? '')) return;
  event.preventDefault();
  event.stopPropagation();
}
