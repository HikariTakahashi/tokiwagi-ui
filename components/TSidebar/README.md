# TSidebarの利用ルール

## 概要

情報を配置するサイドバーです。sideでleft/rightを指定します。React・Vue・Astroの同名公開入口から利用し、sidebar.cssを一度読み込みます。

## 使用場面

説明ページの目次、設定画面の補足情報などを配置します。リンクやボタン、情報の内容は利用側がchildren／既定slotで組み立てます。

## 状態の表し方

sideは必須のleft/right、openは既定true、widthは既定280pxの正の有限数、asはaside/div（既定aside）です。openを外から更新すると占有幅と間隔が変化し、中央も伸縮します。閉じた内容はinertとaria-hiddenで操作・読み上げ対象から外し、アニメーション後に不可視にします。Astroのopenは描画時の初期値で、利用側scriptがdata-open・inert・aria-hiddenを更新します。利用側から閉じる前に内部にフォーカスがある場合は、外側の開閉ボタン等へ戻してください。

## 使用しない場面

リンク先の決定、ルーター連携、現在地判定、開閉ボタンと状態更新は利用側が担当します。画面上への固定やモバイル配置も利用側で指定します。単独の情報カードにはTCardを使います。

## 表示とアクセシビリティ

色と書体は既存トークンを参照します。ReactのclassName、Vue・Astroのclass、style・id・data属性・aria属性・標準属性は外側の要素へ転送します。React・Vueはネイティブイベントを転送し、Astroは利用側scriptから接続します。左右のサイドバーには用途の分かるaria-labelまたはaria-labelledbyを指定します。利用側の開閉ボタンにはaria-controlsとaria-expandedを指定し、閉じても操作できる位置に置きます。動きを減らす設定では遷移を省略します。狭い画面で左右の指定幅が収まらない場合は、利用側で幅・表示状態・配置を調整してください。

## 関連コンポーネントと使い分け

[使用例を見る](../../src/stories/TSidebar.stories.ts)

[TSidebarLayout](../TSidebarLayout/README.md) / [TSidebarMain](../TSidebarMain/README.md) / [TSidebarHeader](../TSidebarHeader/README.md) / [TSidebarBody](../TSidebarBody/README.md) / [TSidebarFooter](../TSidebarFooter/README.md) / [TCard](../TCard/README.md) / [TButton](../TButton/README.md)
