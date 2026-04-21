import type { Request, Response } from "express";
import { createTodoHandlers } from "../src/controllers/todoController";
import type { TodoService } from "../src/services/todoService";

describe("todoController", () => {
  const service = {
    createTodo: jest.fn(),
    getTodos: jest.fn(),
    getTodoById: jest.fn(),
    updateTodo: jest.fn(),
    deleteTodo: jest.fn(),
  } as unknown as jest.Mocked<TodoService>;

  const handlers = createTodoHandlers(service);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("createTodo uses empty object when body is undefined", () => {
    service.createTodo.mockReturnValue({
      id: "1",
      title: "t",
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const req = { body: undefined } as unknown as Request;
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;

    handlers.createTodo(req, res);

    expect(service.createTodo).toHaveBeenCalledWith({});
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it("updateTodo uses empty object when body is undefined", () => {
    service.updateTodo.mockReturnValue({
      id: "1",
      title: "t",
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const req = {
      params: { id: "1" },
      body: undefined,
    } as unknown as Request;
    const res = { json: jest.fn() } as unknown as Response;

    handlers.updateTodo(req, res);

    expect(service.updateTodo).toHaveBeenCalledWith("1", {});
  });

  it("getTodoById uses first element when params.id is an array", () => {
    service.getTodoById.mockReturnValue({
      id: "from-array",
      title: "T",
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const req = { params: { id: ["from-array"] } } as unknown as Request;
    const res = { json: jest.fn() } as unknown as Response;

    handlers.getTodoById(req, res);

    expect(service.getTodoById).toHaveBeenCalledWith("from-array");
  });
});
