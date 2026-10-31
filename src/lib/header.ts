export const headerTones = ['neutral', 'green', 'teal', 'blue', 'violet', 'rose', 'coral', 'amber'] as const;
export type HeaderTone = typeof headerTones[number];
export type HeaderButtonOptions = {
  tone?: HeaderTone; iconOnly?: boolean; selected?: boolean; disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
};

/** 型を迂回した設定も、3方式で同じ条件で拒否する。 */
export function headerButtonState({ tone = 'neutral', iconOnly = false, selected, disabled = false, type = 'button' }: HeaderButtonOptions) {
  if (!headerTones.includes(tone)) throw new Error('ヘッダーのtoneにはneutralまたは7色のプライマリーを指定してください');
  for (const [name, value] of Object.entries({ iconOnly, selected, disabled })) {
    if (value !== undefined && typeof value !== 'boolean') throw new Error(`${name}にはbooleanを指定してください`);
  }
  if (!['button', 'submit', 'reset'].includes(type)) throw new Error('typeにはbutton/submit/resetを指定してください');
  return { tone, iconOnly, selected, disabled, type };
}

export const headerSectionPositions = ['left', 'center', 'right'] as const;
export type HeaderSectionPosition = typeof headerSectionPositions[number];

export function resolveHeaderSectionPosition(position: unknown): HeaderSectionPosition {
  if (!headerSectionPositions.includes(position as HeaderSectionPosition)) {
    throw new Error('THeaderSectionのpositionにはleft/center/rightを指定してください');
  }
  return position as HeaderSectionPosition;
}
