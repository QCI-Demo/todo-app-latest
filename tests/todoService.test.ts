import { isHttpError } from "http-errors";
import {
  createTodoService,
  getDefaultTodoService,
  type TodoRepository,
} from "../src/services/todoService";
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

describe("getDefaultTodoService", () => {
  it("returns a service wired to the repository factory", () => {
    const s = getDefaultTodoService();
    expect(s).toHaveProperty("createTodo");
    expect(s).toHaveProperty("getTodos");
  });
});

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
    it("creates a todo with trimmed title", async () => {
      const saved = makeTodo({ title: "Buy milk" });
      repo.add.mockResolvedValue(saved);

      const todo = await service.createTodo({ title: "  Buy milk  " });
      expect(todo.title).toBe("Buy milk");
      expect(todo.completed).toBe(false);
      expect(todo.id).toBeDefined();
      expect(repo.add).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Buy milk" })
      );
    });

    it("throws 400 when title is empty string", async () => {
      await expect(service.createTodo({ title: "" })).rejects.toThrow("Title cannot be empty");
      expect(repo.add).not.toHaveBeenCalled();
    });

    it("throws 400 when title is undefined", async () => {
      await expect(
        service.createTodo({ title: undefined as unknown as string })
      ).rejects.toThrow("Title is required");
    });

    it("throws 400 when title is whitespace only", async () => {
      await expect(service.createTodo({ title: "   " })).rejects.toThrow(
        "Title cannot be empty"
      );
    });

    it("stores optional description trimmed", async () => {
      const saved = makeTodo({ title: "A", description: "notes" });
      repo.add.mockResolvedValue(saved);

      const todo = await service.createTodo({
        title: "A",
        description: "  notes  ",
      });
      expect(todo.description).toBe("notes");
    });

    it("omits description when empty after trim", async () => {
      const saved = makeTodo({ title: "A" });
      repo.add.mockResolvedValue(saved);

      const todo = await service.createTodo({ title: "A", description: "   " });
      expect(todo.description).toBeUndefined();
    });

    it("honors completed on create", async () => {
      const saved = makeTodo({ title: "A", completed: true });
      repo.add.mockResolvedValue(saved);

      const todo = await service.createTodo({ title: "A", completed: true });
      expect(todo.completed).toBe(true);
    });
  });

  describe("getTodos", () => {
    it("returns repository findAll result", async () => {
      const list = [makeTodo()];
      repo.findAll.mockResolvedValue(list);
      expect(await service.getTodos()).toBe(list);
    });
  });

  describe("getTodoById", () => {
    it("returns todo when found", async () => {
      const todo = makeTodo();
      repo.findById.mockResolvedValue(todo);
      expect(await service.getTodoById("id-1")).toBe(todo);
    });

    it("throws 404 when missing", async () => {
      repo.findById.mockResolvedValue(undefined);
      await expect(service.getTodoById("missing")).rejects.toThrow("Todo not found");
    });
  });

  describe("updateTodo", () => {
    it("merges fields and updates timestamps", async () => {
      const existing = makeTodo({ title: "Old" });
      repo.findById.mockResolvedValue(existing);
      repo.update.mockImplementation(async (_id, t) => t as Todo);

      const result = await service.updateTodo("id-1", { title: " New " });
      expect(result.title).toBe("New");
      expect(repo.update).toHaveBeenCalled();
      expect(result.updatedAt.getTime()).toBeGreaterThanOrEqual(
        existing.updatedAt.getTime()
      );
    });

    it("updates description and clears when blank", async () => {
      const existing = makeTodo({ description: "old" });
      repo.findById.mockResolvedValue(existing);
      repo.update.mockImplementation(async (_id, t) => t as Todo);

      const cleared = await service.updateTodo("id-1", { description: "   " });
      expect(cleared.description).toBeUndefined();

      const next = makeTodo({ description: undefined });
      repo.findById.mockResolvedValue(next);
      const withDesc = await service.updateTodo("id-1", { description: " hi " });
      expect(withDesc.description).toBe("hi");
    });

    it("preserves title and completed when omitted from payload", async () => {
      const existing = makeTodo({
        title: "Keep",
        completed: false,
        description: "note",
      });
      repo.findById.mockResolvedValue(existing);
      repo.update.mockImplementation(async (_id, t) => t as Todo);

      const result = await service.updateTodo("id-1", { completed: true });
      expect(result.title).toBe("Keep");
      expect(result.completed).toBe(true);
      expect(result.description).toBe("note");
    });

    it("throws 400 when title is empty string", async () => {
      repo.findById.mockResolvedValue(makeTodo());
      await expect(service.updateTodo("id-1", { title: "" })).rejects.toThrow(
        "Title cannot be empty"
      );
    });

    it("throws 400 when title is whitespace only", async () => {
      repo.findById.mockResolvedValue(makeTodo());
      await expect(service.updateTodo("id-1", { title: "  " })).rejects.toThrow(
        "Title cannot be empty"
      );
    });

    it("throws 404 when todo missing", async () => {
      repo.findById.mockResolvedValue(undefined);
      await expect(service.updateTodo("x", {})).rejects.toThrow("Todo not found");
    });

    it("throws 404 when repository update returns undefined", async () => {
      repo.findById.mockResolvedValue(makeTodo());
      repo.update.mockResolvedValue(undefined);
      await expect(service.updateTodo("id-1", { completed: true })).rejects.toThrow(
        "Todo not found"
      );
    });
  });

  describe("deleteTodo", () => {
    it("removes when present", async () => {
      repo.remove.mockResolvedValue(true);
      await expect(service.deleteTodo("id-1")).resolves.toBeUndefined();
      expect(repo.remove).toHaveBeenCalledWith("id-1");
    });

    it("throws 404 when missing", async () => {
      repo.remove.mockResolvedValue(false);
      await expect(service.deleteTodo("missing")).rejects.toThrow("Todo not found");
    });
  });

  describe("http error shape", () => {
    it("uses http-errors status codes for validation", async () => {
      let caught: unknown;
      try {
        await service.createTodo({ title: "" });
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
