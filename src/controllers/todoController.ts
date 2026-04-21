import type { Request, Response } from "express";
import type { TodoService } from "../services/todoService";

function paramId(req: Request): string {
  const raw = req.params.id;
  return Array.isArray(raw) ? raw[0] : raw;
}

export function createTodoHandlers(service: TodoService) {
  function createTodo(req: Request, res: Response): void {
    const todo = service.createTodo(req.body ?? {});
    res.status(201).json(todo);
  }

  function listTodos(_req: Request, res: Response): void {
    const todos = service.getTodos();
    res.json(todos);
  }

  function getTodoById(req: Request, res: Response): void {
    const id = paramId(req);
    const todo = service.getTodoById(id);
    res.json(todo);
  }

  function updateTodo(req: Request, res: Response): void {
    const id = paramId(req);
    const todo = service.updateTodo(id, req.body ?? {});
    res.json(todo);
  }

  function deleteTodo(req: Request, res: Response): void {
    const id = paramId(req);
    service.deleteTodo(id);
    res.status(204).send();
  }

  return {
    createTodo,
    listTodos,
    getTodoById,
    updateTodo,
    deleteTodo,
  };
}
