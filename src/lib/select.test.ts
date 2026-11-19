import { expect, test } from 'bun:test';
import { selectDescribedBy, selectState, selectValue, type SelectOptions } from './select';
const options = [{ value: 'button', label: 'ボタン' }, { value: 'card', label: 'カード', disabled: true }];

// 候補を変更せず未選択を先頭に置き、必須検証で使う空文字を一意に保つ。
test('TSelectは未選択候補を追加し候補の重複を拒否する', () => {
  const state = selectState({ options, placeholder: '選択してください' });
  expect(state.options.map(option => option.value)).toEqual(['', 'button', 'card']);
  expect(options).toHaveLength(2);
  expect(() => selectState({ options: [...options, options[0]!] })).toThrow('重複');
  expect(() => selectState({ options: [{ value: '', label: '空' }], placeholder: '未選択' })).toThrow('重複');
});
// 型検査を通さない利用側でも不正な色・サイズ・候補・複数値を曖昧に描画しない。
test('TSelectは不正な設定を日本語エラーにする', () => {
  for (const value of [{ tone: 'red' }, { size: 'wide' }, { options: null }, { label: 3 },
    { options: [{ value: 1, label: '数値' }] }, { options: [{ value: 'x', label: ' ' }] },
    { options: [{ value: 'x', label: '候補', disabled: 'false' }] }]) {
    expect(() => selectState({ options, ...value } as SelectOptions)).toThrow('TSelect');
  }
  expect(() => selectValue(['button'] as unknown as string)).toThrow('単一の文字列');
});
// 利用側の説明と補足・エラーの参照を重複させず、説明がない場合は属性を省略する。
test('TSelectは外部の説明参照と補足・エラーを併記する', () => {
  expect(selectDescribedBy('field', '説明', '必須です', 'hint hint')).toBe('hint field-description field-error');
  expect(selectDescribedBy('field')).toBeUndefined();
});
