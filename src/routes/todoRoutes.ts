import { Router } from "express";
import type { TodoService } from "../services/todoService";
import { createTodoHandlers } from "../controllers/todoController";
import { wrapRoute } from "../middleware/wrapRoute";

export function createTodoRouter(service: TodoService): Router {
  const router = Router();
  const handlers = createTodoHandlers(service);

  router.post("/", wrapRoute(handlers.createTodo));
  router.get("/", wrapRoute(handlers.listTodos));
  router.get("/:id", wrapRoute(handlers.getTodoById));
  router.put("/:id", wrapRoute(handlers.updateTodo));
  router.delete("/:id", wrapRoute(handlers.deleteTodo));

  return router;
}
