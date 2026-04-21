import createError from "http-errors";
import { randomUUID } from "node:crypto";
import type { CreateTodoPayload, Todo, UpdateTodoPayload } from "../models/todo";
import type { ITodoRepository } from "../storage/ITodoRepository";
import { RepositoryFactory } from "../storage/RepositoryFactory";

export interface TodoRepository {
  add(todo: Todo): Promise<Todo>;
  findAll(): Promise<Todo[]>;
  findById(id: string): Promise<Todo | undefined>;
  update(id: string, patch: Partial<Todo>): Promise<Todo | undefined>;
  remove(id: string): Promise<boolean>;
}

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

export function createTodoService(repo: TodoRepository) {
  async function createTodo(payload: CreateTodoPayload): Promise<Todo> {
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
    return repo.add(todo);
  }

  async function getTodos(): Promise<Todo[]> {
    return repo.findAll();
  }

  async function getTodoById(id: string): Promise<Todo> {
    const todo = await repo.findById(id);
    if (!todo) {
      throw createError(404, "Todo not found");
    }
    return todo;
  }

  async function updateTodo(id: string, payload: UpdateTodoPayload): Promise<Todo> {
    const existing = await repo.findById(id);
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

    const updated = await repo.update(id, {
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

  async function deleteTodo(id: string): Promise<void> {
    const removed = await repo.remove(id);
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

export function getDefaultTodoService(): TodoService {
  return createTodoService(RepositoryFactory.getRepository());
}
