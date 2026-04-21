import express from "express";
import swaggerUi from "swagger-ui-express";
import { createTodoService } from "./services/todoService";
import * as inMemoryTodoRepository from "./repository/inMemoryTodoRepository";
import { createTodoRouter } from "./routes/todoRoutes";
import { errorHandler } from "./middleware/errorHandler";
import { openApiDocument } from "./openapi";

export function createApp() {
  const app = express();

  app.use(express.json());

  const todoService = createTodoService(inMemoryTodoRepository);
  app.use("/todos", createTodoRouter(todoService));

  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));

  app.use(errorHandler);

  return app;
}
