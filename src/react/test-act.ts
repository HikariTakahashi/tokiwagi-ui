import * as React from 'react';

// React 18.0.0にはReact.actがないため、テストだけ旧APIを使う。
// React.actがある系列ではそちらを使い、旧APIの非推奨警告を発生させない。
const reactWithAct: typeof React & { act?: typeof import('react-dom/test-utils').act } = React;
export const act = reactWithAct.act ?? (await import('react-dom/test-utils')).act;
