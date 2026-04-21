import createError from "http-errors";
import { randomUUID } from "node:crypto";
import type { CreateTodoPayload, Todo, UpdateTodoPayload } from "../models/todo";
import type * as TodoRepository from "../repository/inMemoryTodoRepository";

export type TodoRepositoryApi = {
  add: typeof TodoRepository.add;
  findAll: typeof TodoRepository.findAll;
  findById: typeof TodoRepository.findById;
  update: typeof TodoRepository.update;
  remove: typeof TodoRepository.remove;
};

export function createTodoService(repository: TodoRepositoryApi) {
  function createTodo(payload: CreateTodoPayload): Todo {
    const title = payload.title?.trim();
    if (!title) {
      throw createError(400, "Title is required");
    }

    const now = new Date();
    const todo: Todo = {
      id: randomUUID(),
      title,
      description: payload.description?.trim() || undefined,
      completed: false,
      createdAt: now,
      updatedAt: now
    };

    repository.add(todo);
    return todo;
  }

  function getTodos(): Todo[] {
    return repository.findAll();
  }

  function getTodoById(id: string): Todo {
    const todo = repository.findById(id);
    if (!todo) {
      throw createError(404, "Todo not found");
    }
    return todo;
  }

  function updateTodo(id: string, payload: UpdateTodoPayload): Todo {
    const existing = repository.findById(id);
    if (!existing) {
      throw createError(404, "Todo not found");
    }

    if (payload.title !== undefined) {
      const title = payload.title.trim();
      if (!title) {
        throw createError(400, "Title cannot be empty");
      }
    }

    const updatedAt = new Date();
    const next: Todo = {
      ...existing,
      title: payload.title !== undefined ? payload.title.trim() : existing.title,
      description:
        payload.description !== undefined
          ? payload.description.trim() || undefined
          : existing.description,
      completed:
        payload.completed !== undefined ? payload.completed : existing.completed,
      updatedAt
    };

    const saved = repository.update(id, next);
    if (!saved) {
      throw createError(404, "Todo not found");
    }
    return saved;
  }

  function deleteTodo(id: string): void {
    const removed = repository.remove(id);
    if (!removed) {
      throw createError(404, "Todo not found");
    }
  }

  return {
    createTodo,
    getTodos,
    getTodoById,
    updateTodo,
    deleteTodo
  };
}

export type TodoService = ReturnType<typeof createTodoService>;
