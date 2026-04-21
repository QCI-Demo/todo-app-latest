import createError from "http-errors";
import { randomUUID } from "node:crypto";
import type { CreateTodoPayload, Todo, UpdateTodoPayload } from "../models/todo";

export interface TodoRepository {
  add(todo: Todo): void;
  findAll(): Todo[];
  findById(id: string): Todo | undefined;
  update(id: string, patch: Partial<Todo>): Todo | undefined;
  remove(id: string): boolean;
}

export function createTodoService(repo: TodoRepository) {
  function assertNonEmptyTitle(title: string | undefined, fieldName: string): string {
    if (title === undefined) {
      throw createError(400, `${fieldName} is required`);
    }
    const trimmed = title.trim();
    if (!trimmed) {
      throw createError(400, `${fieldName} cannot be empty`);
    }
    return trimmed;
  }

  function createTodo(payload: CreateTodoPayload): Todo {
    const title = assertNonEmptyTitle(payload.title, "Title");
    const now = new Date();
    const todo: Todo = {
      id: randomUUID(),
      title,
      description:
        payload.description === undefined
          ? undefined
          : payload.description.trim() || undefined,
      completed: payload.completed ?? false,
      createdAt: now,
      updatedAt: now,
    };
    repo.add(todo);
    return todo;
  }

  function getTodos(): Todo[] {
    return repo.findAll();
  }

  function getTodoById(id: string): Todo {
    const todo = repo.findById(id);
    if (!todo) {
      throw createError(404, "Todo not found");
    }
    return todo;
  }

  function updateTodo(id: string, payload: UpdateTodoPayload): Todo {
    const existing = repo.findById(id);
    if (!existing) {
      throw createError(404, "Todo not found");
    }

    let title = existing.title;
    if (payload.title !== undefined) {
      title = assertNonEmptyTitle(payload.title, "Title");
    }

    const description =
      payload.description === undefined
        ? existing.description
        : payload.description.trim() || undefined;

    const completed =
      payload.completed === undefined ? existing.completed : payload.completed;

    const updated = repo.update(id, {
      title,
      description,
      completed,
      updatedAt: new Date(),
    });
    if (!updated) {
      throw createError(404, "Todo not found");
    }
    return updated;
  }

  function deleteTodo(id: string): void {
    const removed = repo.remove(id);
    if (!removed) {
      throw createError(404, "Todo not found");
    }
  }

  return {
    createTodo,
    getTodos,
    getTodoById,
    updateTodo,
    deleteTodo,
  };
}

export type TodoService = ReturnType<typeof createTodoService>;
