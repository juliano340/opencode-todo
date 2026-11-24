import { For, Show, createEffect, createSignal, onCleanup } from "solid-js"
import type { PanelInput } from "@opencode/plugin/tui/context"
import { Plugin, usePlugin } from "@opencode/plugin/tui"
import { Todo } from "./rpc.js"
import type { TodoItem, TodoStatus } from "./types.js"

const MARK: Record<TodoStatus, string> = {
  pending: "•",
  in_progress: "▸",
  completed: "✓",
}

const RETRY_MS = 250
const MAX_RETRIES = 40

type TodosStore = {
  readonly todos: () => TodoItem[]
  readonly refresh: () => Promise<boolean>
  readonly clear: () => Promise<void>
}

/** Reads the list over RPC, retries while the server part is still loading, and follows changes. */
function createTodos(sessionID: () => string | undefined): TodosStore {
  const context = usePlugin()
  const [todos, setTodos] = createSignal<TodoItem[]>([])
  const options = () => ({ location: context.location ?? context.data.location.default() })
  const client = () => context.client.rpc(Todo)

  const refresh = async () => {
    const id = sessionID()
    if (!id) {
      setTodos([])
      return true
    }
    try {
      const result = (await client().list({ sessionID: id }, options())) as { todos: TodoItem[] }
      setTodos(result.todos)
      return true
    } catch {
      return false
    }
  }

  createEffect(() => {
    sessionID()
    setTodos([])

    let live = true
    let attempts = 0
    let timer: ReturnType<typeof setTimeout> | undefined
    let unsubscribe: (() => void) | undefined

    const attempt = async () => {
      if (!live) return
      if (await refresh()) return
      if (attempts++ >= MAX_RETRIES) return
      timer = setTimeout(() => void attempt(), RETRY_MS)
    }

    try {
      unsubscribe = client().events.on("changed", () => {
        if (live) void refresh()
      })
    } catch {
      unsubscribe = undefined
    }

    void attempt()

    onCleanup(() => {
      live = false
      clearTimeout(timer)
      unsubscribe?.()
    })
  })

  const clear = async () => {
    const id = sessionID()
    if (!id) return
    await client().clear({ sessionID: id }, options())
    await refresh()
  }

  return { todos, refresh, clear }
}

function todoColor(context: ReturnType<typeof usePlugin>, status: TodoStatus) {
  if (status === "completed") return context.theme.text.muted
  if (status === "in_progress") return context.theme.text.feedback.warning.base
  return context.theme.text.base
}

function markerColor(context: ReturnType<typeof usePlugin>, status: TodoStatus) {
  if (status === "completed") return context.theme.text.feedback.success.base
  if (status === "in_progress") return context.theme.text.feedback.warning.base
  return context.theme.text.muted
}

/** One line of the list: a colored status glyph in its own gutter, title wraps under itself. */
function TodoLine(props: { todo: TodoItem }) {
  const context = usePlugin()
  return (
    <box flexDirection="row">
      <text fg={markerColor(context, props.todo.status)}>{`${MARK[props.todo.status]} `}</text>
      <box flexGrow={1} flexShrink={1} minWidth={0}>
        <text fg={todoColor(context, props.todo.status)} wrapMode="word">
          {props.todo.title}
        </text>
      </box>
    </box>
  )
}

/** Sidebar block, right below the MCP list. */
function TodoSidebar(props: { sessionID: string }) {
  const context = usePlugin()
  const store = createTodos(() => props.sessionID)
  const done = () => store.todos().filter((todo) => todo.status === "completed").length

  return (
    <Show when={store.todos().length > 0}>
      <box flexDirection="column" paddingTop={1}>
        <text fg={context.theme.text.base}>{`Todos ${done()}/${store.todos().length}`}</text>
        <For each={store.todos()}>
          {(todo) => <TodoLine todo={todo} />}
        </For>
      </box>
    </Show>
  )
}

/** Session panel opened by /todos: full list, `c` clears after confirmation. */
function TodoPanel(props: { panel: PanelInput }) {
  const context = usePlugin()
  const store = createTodos(() => props.panel.sessionID)

  context.keymap.layer(() => ({
    commands: [
      {
        id: "todo.panel.close",
        bind: "escape",
        run: () => props.panel.close(),
      },
      {
        id: "todo.panel.clear",
        bind: "c",
        title: "Limpar lista",
        run: async () => {
          const confirmed = await context.ui.dialog.confirm({
            title: "Limpar todos?",
            message: "Remove todos os itens da lista desta sessão.",
            label: { confirm: "Limpar", cancel: "Cancelar" },
          })
          if (confirmed) await store.clear()
        },
      },
    ],
  }))

  return (
    <box flexDirection="column" paddingLeft={1} paddingRight={1}>
      <text fg={context.theme.text.base}>Todos da sessão · c limpa · Esc fecha</text>
      <Show when={store.todos().length === 0}>
        <text fg={context.theme.text.muted}>Nenhuma tarefa. O agente cria com a ferramenta todo_write.</text>
      </Show>
      <For each={store.todos()}>
        {(todo) => <TodoLine todo={todo} />}
      </For>
    </box>
  )
}

export default Plugin.define({
  id: "todo.tui",
  setup(context) {
    context.ui.slot({
      append: "sidebar.content",
      render: (input) => <TodoSidebar sessionID={input.sessionID} />,
    })

    context.ui.slot({
      append: "session.panel",
      render: (panel) => (
        <Show when={panel.name === "todo.list"}>
          <TodoPanel panel={panel} />
        </Show>
      ),
    })

    context.keymap.layer(() => ({
      mode: "global",
      commands: [
        {
          id: "todo.open",
          title: "Ver lista de tarefas",
          group: "Todo",
          palette: true,
          slash: { name: "todos" },
          enabled: () => true,
          run: () => {
            context.ui.panel.open("todo.list")
          },
        },
      ],
    }))
  },
})
