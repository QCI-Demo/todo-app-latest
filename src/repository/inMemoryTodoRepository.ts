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

export function update(id: string, todo: Todo): Todo | undefined {
  if (!store.has(id)) {
    return undefined;
  }
  store.set(id, todo);
  return todo;
}

export function remove(id: string): boolean {
  return store.delete(id);
}

/** Test helper: clear all todos (integration tests). */
export function __clearForTests(): void {
  store.clear();
}
