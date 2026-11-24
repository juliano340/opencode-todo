# opencode-todo

[Português](README.md) · [English](README.en.md) · [Español](README.es.md) · [Français](README.fr.md) · [Italiano](README.it.md) · [Русский](README.ru.md) · [हिन्दी](README.hi.md) · [中文](README.zh.md) · [日本語](README.ja.md)

[OpenCode](https://opencode.ai) 用の、セッションごとの TODO リストを提供するプラグインです。エージェントは `todo_write` と `todo_list` ツールを使って項目を作成・更新し、TUI はサイドバーと `/todos` で開くパネルに進捗を表示します。

![サイドバーの TODO リストのプレビュー](docs/todo-preview.svg)

## 機能

- OpenCode のストレージに保存される、セッションごとのリスト。
- サブエージェントはルートセッションのリストを更新。
- RPC によるリアルタイム更新。
- ステータスごとのアイコンと色、および改行時の揃え。
- リストの確認やクリアができる `/todos` パネル。

## インストール

リポジトリを OpenCode のプラグインフォルダにクローンし、依存関係をインストールします。

```bash
git clone https://github.com/juliano340/opencode-todo.git ~/.config/opencode/plugins/opencode-todo
cd ~/.config/opencode/plugins/opencode-todo
npm install
```

Windows では、次のように同等のフォルダを使用してください。

```powershell
git clone https://github.com/juliano340/opencode-todo.git "$env:USERPROFILE\.config\opencode\plugins\opencode-todo"
cd "$env:USERPROFILE\.config\opencode\plugins\opencode-todo"
npm install
```

フォルダの絶対パスをグローバルの `opencode.json` の `plugins` に追加します。

```jsonc
{
  "plugins": [
    "C:/Users/<usuario>/.config/opencode/plugins/opencode-todo"
  ]
}
```

OpenCode を再読み込みするか、`/reload` を使用してください。サイドバーが自動的に更新されない場合は、もう一度 `/reload` を実行してください。

## 使い方

エージェントは作業中、リストを自動的に維持します。次の操作もできます。

- `/todos` でパネルを開く。
- `c` を押すと、確認後にリストをクリア。
- `Esc` を押すと、パネルを閉じる。

### ステータス

| ステータス | アイコン | 表示 |
| --- | --- | --- |
| `pending` | `•` | ニュートラルなマーカー、通常のテキスト |
| `in_progress` | `▸` | テーマの警告色のマーカーとテキスト |
| `completed` | `✓` | 成功色のマーカー、薄い色のテキスト |

長いテキストはタイトルの下で改行され、アイコンの列には戻りません。

## 動作

- データは `todos/<sessionID>` に保存され、再起動後も残ります。
- サブエージェントが書き込むと、リストはメインのサイドバーに表示されるようルートセッションに保存されます。
- 同じタイトルの項目は、更新しても `id` を維持します。
- すべての項目が完了すると、次のプロンプトでリストがクリアされ、現在のタスクだけが表示されます。
- TUI は RPC (`todo.list`) でリストを読み取り、`todo.changed` イベントを監視します。

## モデル向けツール

### `todo_write`

リスト全体を置き換えます。変更分だけでなく、必ずすべての項目を送信してください。

```json
{
  "todos": [
    { "title": "エンドポイントを実装する", "status": "completed" },
    { "title": "連携を検証する", "status": "in_progress" },
    { "title": "リリースを公開する", "status": "pending" }
  ]
}
```

### `todo_list`

現在のセッションのリストを読み取ります。

## 構成

| ファイル | 役割 |
| --- | --- |
| `src/rpc.ts` | RPC 契約: `todo.list`、`todo.clear`、および `todo.changed` イベント |
| `src/index.ts` | ツール、ストレージ、RPC、自動クリア |
| `src/tui.tsx` | サイドバーのブロックと `/todos` パネル |

## 開発

```bash
npm install
npx tsc --noEmit
```

要件: `package.json` に記載されている OpenCode の TUI プラグイン API と、Bun 互換のランタイム。

## ライセンス

[MIT](LICENSE) © 2026 Juliano Pereira.
