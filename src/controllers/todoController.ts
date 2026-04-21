import type { Request, Response } from "express";
import type { TodoService } from "../services/todoService";

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
    const { id } = req.params;
    const todo = service.getTodoById(id);
    res.json(todo);
  }

  function updateTodo(req: Request, res: Response): void {
    const { id } = req.params;
    const todo = service.updateTodo(id, req.body ?? {});
    res.json(todo);
  }

  function deleteTodo(req: Request, res: Response): void {
    const { id } = req.params;
    service.deleteTodo(id);
    res.status(204).send();
  }

  return {
    createTodo,
    listTodos,
    getTodoById,
    updateTodo,
    deleteTodo
  };
}
