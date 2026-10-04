# CLAUDE.md

このファイルは、本プロジェクト（task-board）で Claude Code が作業する際のガイドラインです。

## プロジェクト概要

- プロジェクト名: task-board
- 目的: タスク管理ボード（タスクの追加・完了切り替え・削除。完了済みはグレー表示）

## デプロイ先

https://hohongu.github.io/task-board/

- `main` ブランチへのプッシュで、GitHub Actions（`.github/workflows/deploy.yml`）が自動的にビルド・デプロイする。
- Viteの `base` は `/task-board/` に設定している。変更しない（変更すると公開ページでアセットが読み込めなくなる）。

## 技術スタック

- React 18（関数コンポーネント + Hooks）
- Vite 5（ビルド・開発サーバー）/ `@vitejs/plugin-react`
- JavaScript（JSX）。TypeScriptは未使用
- スタイル: 素のCSS（`src/App.css`）
- データ保存: ブラウザの localStorage（キー: `task-board:tasks`）。サーバー・DBは無し
- ホスティング: GitHub Pages

### コマンド

- `npm install`: 依存関係のインストール
- `npm run dev`: 開発サーバー起動（http://localhost:5173/task-board/）
- `npm run build`: 本番ビルド（`dist/` に出力）
- `npm run preview`: ビルド結果の確認

## Git運用ルール

- **コードを変更するたびに、GitHubへプッシュする。**
  1. 変更をステージする（`git add <変更したファイル>`）
  2. 変更内容がわかるメッセージでコミットする
  3. リモートへプッシュする（`git push`）
- 1つの意味のある変更ごとにコミットし、複数の変更をまとめない。
- コミットメッセージは、何を・なぜ変更したかが分かるように簡潔に書く。
- `main` ブランチで作業している場合は、必要に応じて作業用ブランチを作成してからプッシュする。
- プッシュ前に、機密情報（APIキー、パスワード、`.env` など）が含まれていないか確認する。
- `git push --force` など履歴を書き換える操作は、明示的な指示がない限り行わない。
- リモートリポジトリが未設定の場合は、プッシュ前にユーザーへ確認する。

## コーディング規約

- 既存コードの命名・書式・コメント量に合わせる。
- 不要な機能追加や大規模なリファクタリングは、依頼がない限り行わない。

### コンポーネントの命名規約

- コンポーネント名は PascalCase（例: `App`, `TaskItem`）。
- 1ファイルに1コンポーネントとし、ファイル名はコンポーネント名と一致させる（例: `TaskItem.jsx`）。拡張子は `.jsx`。
- コンポーネントは `src/` 直下に置き、`export default` でエクスポートする。
- props名は camelCase。イベントハンドラを受け取る props は `on` + 動詞（例: `onToggle`, `onDelete`）。
- 親側でハンドラを定義する関数は動詞 + 対象（例: `addTask`, `toggleTask`, `deleteTask`）。
- state は `[値, set値]` の組で命名する（例: `tasks` / `setTasks`）。
- CSSクラス名は kebab-case（例: `task-list`, `add-form`）。状態を表すクラスは `done` のように短い形容詞で付ける。
- localStorage のキーは `task-board:` から始める。
- 表示を担当するコンポーネント（`TaskItem`）はデータを持たず、状態管理は親（`App`）が行う。

## コミュニケーション

- ユーザーへの返答は日本語で行う。
