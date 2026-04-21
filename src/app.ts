import express from "express";
import swaggerUi from "swagger-ui-express";
import { getDefaultTodoService } from "./services/todoService";
import { createTodoRouter } from "./routes/todoRoutes";
import { errorHandler } from "./middleware/errorHandler";
import { swaggerSpec } from "./swagger/swaggerSpec";

export function createApp() {
  const app = express();

  app.use(express.json());

  const todoService = getDefaultTodoService();
  app.use("/todos", createTodoRouter(todoService));

  if (process.env.NODE_ENV !== "production") {
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  }

  app.use(errorHandler);

  return app;
}
