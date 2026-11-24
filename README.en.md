# opencode-todo

[Português](README.md) · [English](README.en.md) · [Español](README.es.md) · [Français](README.fr.md) · [Italiano](README.it.md) · [Русский](README.ru.md) · [हिन्दी](README.hi.md) · [中文](README.zh.md) · [日本語](README.ja.md)

An [OpenCode](https://opencode.ai) plugin with a per-session todo list. The agent creates and updates items using the `todo_write` and `todo_list` tools; the TUI shows progress in the sidebar and in a panel opened with `/todos`.

![Preview of the todo list in the sidebar](docs/todo-preview.svg)

## Features

- Per-session list, persisted in OpenCode storage.
- Subagents update the root session's list.
- Real-time updates over RPC.
- Status-specific icons and colors, with aligned line wrapping.
- `/todos` panel to view and clear the list.

## Installation

Clone the repository into the OpenCode plugins folder and install the dependencies:

```bash
git clone https://github.com/juliano340/opencode-todo.git ~/.config/opencode/plugins/opencode-todo
cd ~/.config/opencode/plugins/opencode-todo
npm install
```

On Windows, use an equivalent folder, for example:

```powershell
git clone https://github.com/juliano340/opencode-todo.git "$env:USERPROFILE\.config\opencode\plugins\opencode-todo"
cd "$env:USERPROFILE\.config\opencode\plugins\opencode-todo"
npm install
```

Add the folder's absolute path to `plugins` in your global `opencode.json`:

```jsonc
{
  "plugins": [
    "C:/Users/<usuario>/.config/opencode/plugins/opencode-todo"
  ]
}
```

Reload OpenCode or use `/reload`. If the sidebar does not update automatically, run `/reload` again.

## Usage

The agent maintains the list automatically while working. You can also:

- Open the panel with `/todos`.
- Press `c` to clear the list, with confirmation.
- Press `Esc` to close the panel.

### Statuses

| Status | Icon | Appearance |
| --- | --- | --- |
| `pending` | `•` | Neutral marker, regular text |
| `in_progress` | `▸` | Marker and text in the theme's warning color |
| `completed` | `✓` | Marker in the success color, muted text |

Long text wraps below the title without returning to the icon column.

## Behavior

- Data is stored in `todos/<sessionID>` and survives restarts.
- When a subagent writes, the list is saved to the root session so it appears in the main sidebar.
- Items with the same title keep their `id` across updates.
- When all items are completed, the next prompt clears the list to reflect only the current task.
- The TUI reads over RPC (`todo.list`) and listens for the `todo.changed` event.

## Model tools

### `todo_write`

Replaces the entire list. Always send all items, not just the changes.

```json
{
  "todos": [
    { "title": "Implement endpoint", "status": "completed" },
    { "title": "Validate integration", "status": "in_progress" },
    { "title": "Publish release", "status": "pending" }
  ]
}
```

### `todo_list`

Reads the current session's list.

## Structure

| File | Responsibility |
| --- | --- |
| `src/rpc.ts` | RPC contract: `todo.list`, `todo.clear`, and the `todo.changed` event |
| `src/index.ts` | Tools, storage, RPC, and automatic cleanup |
| `src/tui.tsx` | Sidebar block and `/todos` panel |

## Development

```bash
npm install
npx tsc --noEmit
```

Requirements: OpenCode's TUI plugin API and a Bun-compatible runtime, as specified in `package.json`.

## License

[MIT](LICENSE) © 2026 Juliano Pereira.
