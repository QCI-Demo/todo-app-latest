import type { Todo } from "../models/todo";

const store = new Map<string, Todo>();

export function add(todo: Todo): void {
  store.set(todo.id, todo);
}

export function findAll(): Todo[] {
  return [...store.values()];
}

export function findById(id: string): Todo | undefined {
  return store.get(id);
}

export function update(id: string, patch: Partial<Todo>): Todo | undefined {
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

export function remove(id: string): boolean {
  return store.delete(id);
}

/** Test helper: clear all todos (integration tests). */
export function __clearForTests(): void {
  store.clear();
}
