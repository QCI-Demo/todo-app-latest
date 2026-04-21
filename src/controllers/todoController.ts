import type { Request, Response } from "express";
import type { TodoService } from "../services/todoService";

function paramId(req: Request): string {
  const raw = req.params.id;
  return Array.isArray(raw) ? raw[0] : raw;
}

export function createTodoHandlers(service: TodoService) {
  /**
   * @swagger
   * /todos:
   *   post:
   *     tags:
   *       - Todos
   *     summary: Create a todo
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CreateTodoRequest'
   *     responses:
   *       "201":
   *         description: Created
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Todo'
   *       "400":
   *         description: Bad Request
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  function createTodo(req: Request, res: Response): void {
    const todo = service.createTodo(req.body ?? {});
    res.status(201).json(todo);
  }

  /**
   * @swagger
   * /todos:
   *   get:
   *     tags:
   *       - Todos
   *     summary: List all todos
   *     responses:
   *       "200":
   *         description: OK
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Todo'
   */
  function listTodos(_req: Request, res: Response): void {
    const todos = service.getTodos();
    res.json(todos);
  }

  /**
   * @swagger
   * /todos/{id}:
   *   get:
   *     tags:
   *       - Todos
   *     summary: Get a todo by id
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     responses:
   *       "200":
   *         description: OK
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Todo'
   *       "404":
   *         description: Not Found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  function getTodoById(req: Request, res: Response): void {
    const id = paramId(req);
    const todo = service.getTodoById(id);
    res.json(todo);
  }

  /**
   * @swagger
   * /todos/{id}:
   *   put:
   *     tags:
   *       - Todos
   *     summary: Update a todo
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/UpdateTodoRequest'
   *     responses:
   *       "200":
   *         description: OK
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Todo'
   *       "400":
   *         description: Bad Request
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       "404":
   *         description: Not Found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  function updateTodo(req: Request, res: Response): void {
    const id = paramId(req);
    const todo = service.updateTodo(id, req.body ?? {});
    res.json(todo);
  }

  /**
   * @swagger
   * /todos/{id}:
   *   delete:
   *     tags:
   *       - Todos
   *     summary: Delete a todo
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     responses:
   *       "204":
   *         description: No Content
   *       "404":
   *         description: Not Found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
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
