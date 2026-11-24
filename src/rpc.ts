import { Rpc } from "@opencode/plugin/rpc"

const item = {
  type: "object",
  properties: {
    id: { type: "string" },
    title: { type: "string" },
    status: { type: "string", enum: ["pending", "in_progress", "completed"] },
  },
  required: ["id", "title", "status"],
  additionalProperties: false,
}

export const Todo = Rpc.define({
  id: "todo",
  methods: {
    list: {
      input: {
        type: "object",
        properties: { sessionID: { type: "string" } },
        required: ["sessionID"],
        additionalProperties: false,
      },
      output: {
        type: "object",
        properties: { todos: { type: "array", items: item } },
        required: ["todos"],
        additionalProperties: false,
      },
    },
    clear: {
      input: {
        type: "object",
        properties: { sessionID: { type: "string" } },
        required: ["sessionID"],
        additionalProperties: false,
      },
      output: { type: "object", properties: {}, additionalProperties: false },
    },
  },
  events: {
    changed: {
      schema: {
        type: "object",
        properties: { sessionID: { type: "string" } },
        required: ["sessionID"],
        additionalProperties: false,
      },
    },
  },
})
