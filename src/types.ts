export type TodoStatus = "pending" | "in_progress" | "completed"

export type TodoItem = {
  id: string
  title: string
  status: TodoStatus
}
