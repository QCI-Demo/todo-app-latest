import {
  __clearForTests,
  add,
  findAll,
  findById,
  remove,
  update,
} from "../src/repository/inMemoryTodoRepository";
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

describe("inMemoryTodoRepository", () => {
  beforeEach(() => {
    __clearForTests();
  });

  it("add, findAll, findById, update, remove", () => {
    const todo = sampleTodo("a");
    add(todo);
    expect(findAll()).toHaveLength(1);
    expect(findById("a")).toEqual(todo);

    const next: Todo = { ...todo, title: "X" };
    expect(update("a", next)).toEqual(next);
    expect(findById("a")?.title).toBe("X");

    expect(remove("a")).toBe(true);
    expect(findById("a")).toBeUndefined();
  });

  it("update returns undefined when id is missing", () => {
    expect(update("missing", { title: "x" })).toBeUndefined();
  });

  it("remove returns false when id is missing", () => {
    expect(remove("nope")).toBe(false);
  });

  it("update uses patch.updatedAt when provided", () => {
    const t: Todo = {
      id: "1",
      title: "a",
      completed: false,
      createdAt: new Date("2020-01-01"),
      updatedAt: new Date("2020-01-02"),
    };
    add(t);
    const fixed = new Date("2025-06-01T00:00:00.000Z");
    const next = update("1", { title: "b", updatedAt: fixed });
    expect(next?.updatedAt).toEqual(fixed);
  });
});
