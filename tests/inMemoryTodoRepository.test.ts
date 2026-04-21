import {
  InMemoryTodoRepository,
  __clearInMemoryStoreForTests,
} from "../src/storage/InMemoryTodoRepository";
import type { Todo } from "../src/models/todo";

function sampleTodo(id: string): Todo {
  const t = new Date();
  return {
    id,
    title: "T",
    completed: false,
    createdAt: t,
    updatedAt: t,
  };
}

describe("InMemoryTodoRepository (module)", () => {
  let repo: InMemoryTodoRepository;

  beforeEach(() => {
    __clearInMemoryStoreForTests();
    repo = new InMemoryTodoRepository();
  });

  it("add, findAll, findById, update, remove", async () => {
    const todo = sampleTodo("a");
    await repo.add(todo);
    expect(await repo.findAll()).toHaveLength(1);
    expect(await repo.findById("a")).toEqual(todo);

    const next: Todo = { ...todo, title: "X" };
    expect(await repo.update("a", next)).toEqual(next);
    expect((await repo.findById("a"))?.title).toBe("X");

    expect(await repo.remove("a")).toBe(true);
    expect(await repo.findById("a")).toBeUndefined();
  });

  it("update returns undefined when id is missing", async () => {
    expect(await repo.update("missing", { title: "x" })).toBeUndefined();
  });

  it("remove returns false when id is missing", async () => {
    expect(await repo.remove("nope")).toBe(false);
  });

  it("update uses patch.updatedAt when provided", async () => {
    const t: Todo = {
      id: "1",
      title: "a",
      completed: false,
      createdAt: new Date("2020-01-01"),
      updatedAt: new Date("2020-01-02"),
    };
    await repo.add(t);
    const fixed = new Date("2025-06-01T00:00:00.000Z");
    const next = await repo.update("1", { title: "b", updatedAt: fixed });
    expect(next?.updatedAt).toEqual(fixed);
  });
});
