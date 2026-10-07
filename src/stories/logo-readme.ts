/** 原本READMEはローカル参照を保ち、Storybook表示時だけ閲覧先に合わせる。 */
export function logoReadmeForStorybook(readme: string): string {
  return readme
    .replaceAll('(./logo.svg)', '(./icon-assets/logo/logo.svg)')
    .replaceAll('(../../src/stories/tlogo.mdx)', '(./?path=/docs/components-tlogo--docs)')
    .replaceAll('(../../tokens/colors.css)', '(./?path=/docs/カラー-使用ルール--docs)')
    .replaceAll('(../../tokens/neutrals.css)', '(./?path=/docs/カラー-使用ルール--docs)')
    .replaceAll('(../calendar/README.md)', '(./?path=/docs/icons-calendar--docs)')
    .replaceAll('(../task/README.md)', '(./?path=/docs/icons-task--docs)')
    .replaceAll('(../bell/README.md)', '(./?path=/docs/icons-bell--docs)')
    // フィロソフィーは親プロジェクトの資料で、Storybookの配信対象には含まれない。
    .replaceAll('[TokiWa Calendarのフィロソフィー](../../../PHILOSOPHY.md)', 'TokiWa Calendarのフィロソフィー');
}
