import { Plugin } from "@opencode/plugin"
import { Todo } from "./rpc.js"
import type { TodoItem, TodoStatus } from "./types.js"

const STATUSES: readonly TodoStatus[] = ["pending", "in_progress", "completed"]
const MAX_ITEMS = 50

const key = (sessionID: string) => `todos/${sessionID}`

async function read(ctx: Plugin.Context, sessionID: string): Promise<TodoItem[]> {
  const stored = await ctx.storage.get(key(sessionID))
  if (!stored || typeof stored !== "object" || !Array.isArray((stored as { todos?: unknown }).todos)) return []
  return (stored as { todos: TodoItem[] }).todos
}

async function write(ctx: Plugin.Context, sessionID: string, todos: TodoItem[]) {
  await ctx.storage.set(key(sessionID), { todos })
}

/** Todos live on the session the user is watching, even when a subagent writes them. */
async function rootSession(ctx: Plugin.Context, sessionID: string): Promise<string> {
  let id = sessionID
  for (let depth = 0; depth < 16; depth++) {
    const session = await ctx.session.get({ sessionID: id }).catch(() => undefined)
    if (!session?.parentID) return id
    id = String(session.parentID)
  }
  return id
}

function normalize(input: readonly { title: string; status: TodoStatus }[], previous: TodoItem[]): TodoItem[] {
  const ids = new Map(previous.map((todo) => [todo.title.toLowerCase(), todo.id]))
  return input
    .map((todo) => ({ title: todo.title.trim(), status: todo.status }))
    .filter((todo) => todo.title.length > 0 && STATUSES.includes(todo.status))
    .slice(0, MAX_ITEMS)
    .map((todo) => ({ id: ids.get(todo.title.toLowerCase()) ?? crypto.randomUUID(), ...todo }))
}

function render(todos: TodoItem[]): string {
  if (todos.length === 0) return "The todo list is empty."
  const done = todos.filter((todo) => todo.status === "completed").length
  const lines = todos.map((todo) => {
    const mark = todo.status === "completed" ? "[x]" : todo.status === "in_progress" ? "[~]" : "[ ]"
    return `${mark} ${todo.title}`
  })
  return `Todos (${done}/${todos.length}):\n${lines.join("\n")}`
}

export default Plugin.define({
  id: "todo",
  async setup(ctx) {
    const rpc = await ctx.rpc.register(Todo, {
      list: async (input) => {
        const { sessionID } = input as { sessionID: string }
        return { todos: await read(ctx, await rootSession(ctx, sessionID)) }
      },
      clear: async (input) => {
        const { sessionID } = input as { sessionID: string }
        const root = await rootSession(ctx, sessionID)
        await write(ctx, root, [])
        await rpc.events.emit("changed", { sessionID: root })
        return {}
      },
    })

    const changed = (sessionID: string) => rpc.events.emit("changed", { sessionID })

    // Starting the next task clears what is finished: a new prompt on a session whose items are
    // all completed resets the list, so the sidebar follows the current work instead of adding up.
    await ctx.session.hook("prompt", async (event) => {
      const sessionID = String(event.sessionID)
      if ((await rootSession(ctx, sessionID)) !== sessionID) return
      const todos = await read(ctx, sessionID)
      if (todos.length === 0 || todos.some((todo) => todo.status !== "completed")) return
      await write(ctx, sessionID, [])
      await changed(sessionID)
    })

    await ctx.tool.transform((editor) => {
      editor.namespace({
        name: "todo",
        description: "Keep the session todo list the user watches in the sidebar.",
      })

      editor.add({
        name: "write",
        description:
          "Replace the todo list for this session. Always send the complete list, not just the changes, and keep completed items with status \"completed\" so the user sees progress. Mark the item being worked on as \"in_progress\".",
        input: {
          type: "object",
          properties: {
            todos: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string", description: "Short imperative task description" },
                  status: { type: "string", enum: STATUSES, description: "pending, in_progress or completed" },
                },
                required: ["title", "status"],
                additionalProperties: false,
              },
            },
          },
          required: ["todos"],
          additionalProperties: false,
        },
        options: { namespace: "todo", codemode: true },
        execute: async (input, context) => {
          const { todos } = input as { todos: { title: string; status: TodoStatus }[] }
          const sessionID = await rootSession(ctx, String(context.sessionID))
          const next = normalize(todos, await read(ctx, sessionID))
          await write(ctx, sessionID, next)
          await changed(sessionID)
          return { content: render(next) }
        },
      })

      editor.add({
        name: "list",
        description: "Read the todo list for this session.",
        input: { type: "object", properties: {}, additionalProperties: false },
        options: { namespace: "todo", codemode: true },
        execute: async (_input, context) => ({
          content: render(await read(ctx, await rootSession(ctx, String(context.sessionID)))),
        }),
      })
    })
  },
})
