import path from "node:path";
import swaggerJSDoc from "swagger-jsdoc";

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "Todo API",
      version: "1.0.0",
      description: "REST API for todo items",
    },
    servers: [{ url: "/", description: "Current server" }],
    components: {
      schemas: {
        Todo: {
          type: "object",
          required: [
            "id",
            "title",
            "completed",
            "createdAt",
            "updatedAt",
          ],
          properties: {
            id: { type: "string", format: "uuid" },
            title: { type: "string" },
            description: { type: "string" },
            completed: { type: "boolean" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        CreateTodoRequest: {
          type: "object",
          required: ["title"],
          properties: {
            title: { type: "string" },
            description: { type: "string" },
            completed: { type: "boolean" },
          },
        },
        UpdateTodoRequest: {
          type: "object",
          properties: {
            title: { type: "string" },
            description: { type: "string" },
            completed: { type: "boolean" },
          },
        },
        Error: {
          type: "object",
          required: ["error"],
          properties: {
            error: { type: "string" },
          },
        },
      },
    },
  },
  apis: [
    path.join(__dirname, "../controllers/todoController.ts"),
    path.join(__dirname, "../controllers/todoController.js"),
  ],
};

export const swaggerSpec = swaggerJSDoc(options);
