import rawPrimary from '../../../tokens/colors.css?raw';
import {
  colors, contrast, parseTokens, primaryForegroundTokenName, primaryTextContrastMinimum, tokenName, variants,
} from '../../lib/palette';

const tokens = parseTokens(rawPrimary);

export function PrimaryColorTokenTable() {
  return (
    <div className="tkw-primary-color-table-scroll" role="region" aria-label="プライマリーの配色表" tabIndex={0}>
      <table className="tkw-primary-color-table" aria-label="プライマリーの配色トークン">
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
            const background = tokenName(key, suffix);
            const foreground = primaryForegroundTokenName(key, suffix);
            const ratio = contrast(tokens[background]!, tokens[foreground]!);
            return (
              <tr key={background}>
                <th scope="row">{name}<br />{label}</th>
                <td><code>{tokens[background]}</code><br /><code>{background}</code></td>
                <td><code>{tokens[foreground]}</code><br /><code>{foreground}</code></td>
                <td>{ratio.toFixed(2)}:1{ratio < primaryTextContrastMinimum[suffix] && <strong className="tkw-fail"> 要確認</strong>}</td>
              </tr>
            );
          }))}
        </tbody>
      </table>
    </div>
  );
}
