export const openApiDocument = {
  openapi: "3.0.3",
  info: {
    title: "Todo API",
    version: "1.0.0"
  },
  paths: {
    "/todos": {
      get: {
        summary: "List todos",
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Todo" }
                }
              }
            }
          }
        }
      },
      post: {
        summary: "Create todo",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateTodoRequest" }
            }
          }
        },
        responses: {
          "201": {
            description: "Created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Todo" }
              }
            }
          },
          "400": {
            description: "Bad Request",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" }
              }
            }
          }
        }
      }
    },
    "/todos/{id}": {
      get: {
        summary: "Get todo by id",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" }
          }
        ],
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Todo" }
              }
            }
          },
          "404": {
            description: "Not Found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" }
              }
            }
          }
        }
      },
      put: {
        summary: "Update todo",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" }
          }
        ],
        requestBody: {
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateTodoRequest" }
            }
          }
        },
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Todo" }
              }
            }
          },
          "400": {
            description: "Bad Request",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" }
              }
            }
          },
          "404": {
            description: "Not Found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" }
              }
            }
          }
        }
      },
      delete: {
        summary: "Delete todo",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" }
          }
        ],
        responses: {
          "204": { description: "No Content" },
          "404": {
            description: "Not Found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" }
              }
            }
          }
        }
      }
    }
  },
  components: {
    schemas: {
      Todo: {
        type: "object",
        required: [
          "id",
          "title",
          "completed",
          "createdAt",
          "updatedAt"
        ],
        properties: {
          id: { type: "string", format: "uuid" },
          title: { type: "string" },
          description: { type: "string" },
          completed: { type: "boolean" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" }
        }
      },
      CreateTodoRequest: {
        type: "object",
        required: ["title"],
        properties: {
          title: { type: "string" },
          description: { type: "string" }
        }
      },
      UpdateTodoRequest: {
        type: "object",
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          completed: { type: "boolean" }
        }
      },
      Error: {
        type: "object",
        required: ["error"],
        properties: {
          error: { type: "string" }
        }
      }
    }
  }
} as const;
