export const selectTones = ['neutral', 'green', 'teal', 'blue', 'violet', 'rose', 'coral', 'amber'] as const;
export const selectSizes = ['sm', 'md', 'lg'] as const;
export type SelectTone = typeof selectTones[number];
export type SelectSize = typeof selectSizes[number];
export type SelectOption = { value: string; label: string; disabled?: boolean };
export type SelectOptions = {
  options: readonly SelectOption[];
  placeholder?: string;
  label?: string;
  description?: string;
  error?: string;
  tone?: SelectTone;
  size?: SelectSize;
};

/** 3方式で候補と見た目の指定を検証し、未選択候補を同じ順に配置する。 */
export function selectState({ options, placeholder, label, description, error, tone = 'neutral', size = 'md' }: SelectOptions) {
  if (!selectTones.includes(tone)) throw new Error('TSelectのtoneにはneutralまたは7色のプライマリーを指定してください');
  if (!selectSizes.includes(size)) throw new Error('TSelectのsizeにはsm/md/lgを指定してください');
  for (const [name, value] of Object.entries({ placeholder, label, description, error })) {
    if (value !== undefined && typeof value !== 'string') throw new Error(`TSelectの${name}には文字列を指定してください`);
  }
  if (!Array.isArray(options)) throw new Error('TSelectのoptionsには候補の配列を指定してください');
  const values = new Set<string>(placeholder === undefined ? [] : ['']);
  for (const option of options) {
    if (!option || typeof option.value !== 'string' || typeof option.label !== 'string' || !option.label.trim()) {
      throw new Error('TSelectの候補には文字列のvalueと空白だけではないlabelを指定してください');
    }
    if (values.has(option.value)) throw new Error(`TSelectの候補のvalueが重複しています: ${option.value || '空文字（未選択）'}`);
    if (option.disabled !== undefined && typeof option.disabled !== 'boolean') throw new Error('TSelectの候補のdisabledにはbooleanを指定してください');
    values.add(option.value);
  }
  return {
    tone, size, label, description, error,
    options: placeholder === undefined ? options : [{ value: '', label: placeholder }, ...options],
  };
}

/** 複数選択や非文字列が実行時に渡された場合も単一選択のAPIに限定する。 */
export function selectValue(value: string | undefined) {
  if (value !== undefined && typeof value !== 'string') throw new Error('TSelectの値には単一の文字列を指定してください');
  return value;
}

/** 利用側の説明を保持し、部品自身の補足・エラーも同じ入力へ関連付ける。 */
export function selectDescribedBy(id: string, description?: string, error?: string, external?: string) {
  return [...new Set([external, description ? `${id}-description` : '', error ? `${id}-error` : ''].filter(Boolean).join(' ').split(/\s+/).filter(Boolean))].join(' ') || undefined;
}
