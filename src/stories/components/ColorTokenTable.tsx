import rawPrimary from '../../../tokens/colors.css?raw';
import rawSecondary from '../../../tokens/secondary.css?raw';
import rawSemantic from '../../../tokens/semantic.css?raw';
import rawNeutral from '../../../tokens/neutrals.css?raw';
import {
  colors, contrast, neutrals, neutralTokenName, parseNeutralTokens, parseSecondaryTokens, parseSemanticTokens,
  parseTokens, primaryForegroundTokenName, primaryTextContrastMinimum, secondaryColors, secondaryForegroundTokenName,
  secondaryTokenName, semanticColors, semanticForegroundTokenName, semanticTokenName, tokenName, variants,
} from '../../lib/palette';

const standardTextMinimum = { '': 4.5, '-hover': 4.5, '-active': 4.5, '-subtle': 4.5 };

const palettes = {
  primary: {
    label: 'プライマリー',
    colors,
    tokens: parseTokens(rawPrimary),
    backgroundName: tokenName,
    foregroundName: primaryForegroundTokenName,
    minimum: primaryTextContrastMinimum,
  },
  secondary: {
    label: 'セカンダリー',
    colors: secondaryColors,
    tokens: parseSecondaryTokens(rawSecondary),
    backgroundName: secondaryTokenName,
    foregroundName: secondaryForegroundTokenName,
    minimum: standardTextMinimum,
  },
  semantic: {
    label: 'セマンティック',
    colors: semanticColors,
    tokens: parseSemanticTokens(rawSemantic),
    backgroundName: semanticTokenName,
    foregroundName: semanticForegroundTokenName,
    minimum: standardTextMinimum,
  },
};
const neutralTokens = parseNeutralTokens(rawNeutral);

export function ColorTokenTable({ family }: { family: keyof typeof palettes }) {
  const { label: familyLabel, colors, tokens, backgroundName, foregroundName, minimum } = palettes[family];
  return (
    <div className="tkw-color-table-scroll" role="region" aria-label={`${familyLabel}の配色表`} tabIndex={0}>
      <table className="tkw-color-table" aria-label={`${familyLabel}の配色トークン`}>
        <thead>
          <tr>
            <th scope="col">色・状態</th>
            <th scope="col">背景</th>
            <th scope="col">文字・アイコン</th>
            <th scope="col">コントラスト比</th>
          </tr>
        </thead>
        <tbody>
          {colors.flatMap(([key, name]) => variants.map(([suffix, label]) => {
            const background = backgroundName(key, suffix);
            const foreground = foregroundName(key, suffix);
            const ratio = contrast(tokens[background]!, tokens[foreground]!);
            return (
              <tr key={background}>
                <th scope="row">{name}<br />{label}</th>
                <td><code>{tokens[background]}</code><br /><code>{background}</code></td>
                <td><code>{tokens[foreground]}</code><br /><code>{foreground}</code></td>
                <td>{ratio.toFixed(2)}:1{ratio < minimum[suffix] && <strong className="tkw-fail"> 要確認</strong>}</td>
              </tr>
            );
          }))}
        </tbody>
      </table>
    </div>
  );
}

export function NeutralTokenTable() {
  return (
    <div className="tkw-color-table-scroll" role="region" aria-label="ニュートラルの配色表" tabIndex={0}>
      <table className="tkw-color-table tkw-neutral-token-table" aria-label="ニュートラルの配色トークン">
        <thead>
          <tr>
            <th scope="col">段階</th>
            <th scope="col">色</th>
            <th scope="col">用途</th>
          </tr>
        </thead>
        <tbody>
          {neutrals.map(([step, usage]) => {
            const token = neutralTokenName(step);
            return (
              <tr key={step}>
                <th scope="row">{step}</th>
                <td><code>{neutralTokens[token]}</code><br /><code>{token}</code></td>
                <td>{usage}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
