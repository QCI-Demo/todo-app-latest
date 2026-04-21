import type { Todo } from "../models/todo";
import type { ITodoRepository } from "./ITodoRepository";

const store = new Map<string, Todo>();

export class InMemoryTodoRepository implements ITodoRepository {
  async add(todo: Todo): Promise<Todo> {
    store.set(todo.id, todo);
    return todo;
  }

  async findAll(): Promise<Todo[]> {
    return [...store.values()];
  }

  async findById(id: string): Promise<Todo | undefined> {
    return store.get(id);
  }

  async update(id: string, patch: Partial<Todo>): Promise<Todo | undefined> {
    const existing = store.get(id);
    if (!existing) return undefined;
    const next: Todo = {
      ...existing,
      ...patch,
      id: existing.id,
      updatedAt: patch.updatedAt ?? new Date(),
    };
    store.set(id, next);
    return next;
  }

  async remove(id: string): Promise<boolean> {
    return store.delete(id);
  }
}

/** Test helper: clear all todos (integration tests). */
export function __clearInMemoryStoreForTests(): void {
  store.clear();
}
