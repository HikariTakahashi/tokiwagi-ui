export const checkboxTones = ['green', 'teal', 'blue', 'violet', 'rose', 'coral', 'amber'] as const;
export type CheckboxTone = typeof checkboxTones[number];
export type CheckboxOptions = {
  label?: string;
  description?: string;
  error?: string;
  tone?: CheckboxTone;
  defaultChecked?: boolean;
  indeterminate?: boolean;
  value?: string;
};

export function checkboxState(id: string, options: CheckboxOptions, checked?: boolean, describedBy?: string | null) {
  const { label, description, error, tone = 'blue', defaultChecked, indeterminate = false, value } = options;
  if (!checkboxTones.includes(tone)) throw new Error('TCheckboxのtoneには7色のプライマリーを指定してください');
  for (const [name, flag] of Object.entries({ checked, defaultChecked: options.defaultChecked, indeterminate })) {
    if (flag !== undefined && typeof flag !== 'boolean') throw new Error(`TCheckboxの${name}にはbooleanを指定してください`);
  }
  for (const [name, text] of Object.entries({ label, description, error, value })) {
    if (text !== undefined && typeof text !== 'string') throw new Error(`TCheckboxの${name}には文字列を指定してください`);
  }
  const descriptionId = description ? `${id}-description` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const descriptions = [describedBy, descriptionId, errorId].filter(Boolean).join(' ').trim().split(/\s+/);
  return { tone, checked, defaultChecked, indeterminate, descriptionId, errorId,
    describedBy: [...new Set(descriptions)].join(' ') || undefined };
}
