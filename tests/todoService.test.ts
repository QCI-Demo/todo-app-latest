import { isHttpError } from "http-errors";
import { createTodoService, type TodoRepository } from "../src/services/todoService";
import type { Todo } from "../src/models/todo";

function makeTodo(overrides: Partial<Todo> = {}): Todo {
  const now = new Date("2020-01-01T00:00:00.000Z");
  return {
    id: "id-1",
    title: "Test",
    completed: false,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

describe("todoService", () => {
  let repo: jest.Mocked<TodoRepository>;
  let service: ReturnType<typeof createTodoService>;

  beforeEach(() => {
    repo = {
      add: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };
    service = createTodoService(repo);
  });

  describe("createTodo", () => {
    it("creates a todo with trimmed title", () => {
      const todo = service.createTodo({ title: "  Buy milk  " });
      expect(todo.title).toBe("Buy milk");
      expect(todo.completed).toBe(false);
      expect(todo.id).toBeDefined();
      expect(repo.add).toHaveBeenCalledWith(todo);
    });

    it("throws 400 when title is empty string", () => {
      expect(() => service.createTodo({ title: "" })).toThrow("Title cannot be empty");
      expect(repo.add).not.toHaveBeenCalled();
    });

    it("throws 400 when title is undefined", () => {
      expect(() =>
        service.createTodo({ title: undefined as unknown as string })
      ).toThrow("Title is required");
    });

    it("throws 400 when title is whitespace only", () => {
      expect(() => service.createTodo({ title: "   " })).toThrow("Title cannot be empty");
    });

    it("stores optional description trimmed", () => {
      const todo = service.createTodo({
        title: "A",
        description: "  notes  ",
      });
      expect(todo.description).toBe("notes");
    });

    it("omits description when empty after trim", () => {
      const todo = service.createTodo({ title: "A", description: "   " });
      expect(todo.description).toBeUndefined();
    });

    it("honors completed on create", () => {
      const todo = service.createTodo({ title: "A", completed: true });
      expect(todo.completed).toBe(true);
    });
  });

  describe("getTodos", () => {
    it("returns repository findAll result", () => {
      const list = [makeTodo()];
      repo.findAll.mockReturnValue(list);
      expect(service.getTodos()).toBe(list);
    });
  });

  describe("getTodoById", () => {
    it("returns todo when found", () => {
      const todo = makeTodo();
      repo.findById.mockReturnValue(todo);
      expect(service.getTodoById("id-1")).toBe(todo);
    });

    it("throws 404 when missing", () => {
      repo.findById.mockReturnValue(undefined);
      expect(() => service.getTodoById("missing")).toThrow("Todo not found");
    });
  });

  describe("updateTodo", () => {
    it("merges fields and updates timestamps", () => {
      const existing = makeTodo({ title: "Old" });
      repo.findById.mockReturnValue(existing);
      repo.update.mockImplementation((_id, t) => t as Todo);

      const result = service.updateTodo("id-1", { title: " New " });
      expect(result.title).toBe("New");
      expect(repo.update).toHaveBeenCalled();
      expect(result.updatedAt.getTime()).toBeGreaterThanOrEqual(
        existing.updatedAt.getTime()
      );
    });

    it("updates description and clears when blank", () => {
      const existing = makeTodo({ description: "old" });
      repo.findById.mockReturnValue(existing);
      repo.update.mockImplementation((_id, t) => t as Todo);

      const cleared = service.updateTodo("id-1", { description: "   " });
      expect(cleared.description).toBeUndefined();

      const next = makeTodo({ description: undefined });
      repo.findById.mockReturnValue(next);
      const withDesc = service.updateTodo("id-1", { description: " hi " });
      expect(withDesc.description).toBe("hi");
    });

    it("preserves title and completed when omitted from payload", () => {
      const existing = makeTodo({
        title: "Keep",
        completed: false,
        description: "note",
      });
      repo.findById.mockReturnValue(existing);
      repo.update.mockImplementation((_id, t) => t as Todo);

      const result = service.updateTodo("id-1", { completed: true });
      expect(result.title).toBe("Keep");
      expect(result.completed).toBe(true);
      expect(result.description).toBe("note");
    });

    it("throws 400 when title is empty string", () => {
      repo.findById.mockReturnValue(makeTodo());
      expect(() => service.updateTodo("id-1", { title: "" })).toThrow(
        "Title cannot be empty"
      );
    });

    it("throws 400 when title is whitespace only", () => {
      repo.findById.mockReturnValue(makeTodo());
      expect(() => service.updateTodo("id-1", { title: "  " })).toThrow(
        "Title cannot be empty"
      );
    });

    it("throws 404 when todo missing", () => {
      repo.findById.mockReturnValue(undefined);
      expect(() => service.updateTodo("x", {})).toThrow("Todo not found");
    });

    it("throws 404 when repository update returns undefined", () => {
      repo.findById.mockReturnValue(makeTodo());
      repo.update.mockReturnValue(undefined);
      expect(() => service.updateTodo("id-1", { completed: true })).toThrow(
        "Todo not found"
      );
    });
  });

  describe("deleteTodo", () => {
    it("removes when present", () => {
      repo.remove.mockReturnValue(true);
      expect(() => service.deleteTodo("id-1")).not.toThrow();
      expect(repo.remove).toHaveBeenCalledWith("id-1");
    });

    it("throws 404 when missing", () => {
      repo.remove.mockReturnValue(false);
      expect(() => service.deleteTodo("missing")).toThrow("Todo not found");
    });
  });

  describe("http error shape", () => {
    it("uses http-errors status codes for validation", () => {
      let caught: unknown;
      try {
        service.createTodo({ title: "" });
      } catch (e) {
        caught = e;
      }
      expect(isHttpError(caught)).toBe(true);
      if (isHttpError(caught)) {
        expect(caught.status).toBe(400);
      }
    });
  });
});
