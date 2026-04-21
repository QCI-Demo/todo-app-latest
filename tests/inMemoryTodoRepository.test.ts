import {
  __clearForTests,
  add,
  findAll,
  findById,
  remove,
  update
} from "../src/repository/inMemoryTodoRepository";
import type { Todo } from "../src/models/todo";

function sampleTodo(id: string): Todo {
  const t = new Date();
  return {
    id,
    title: "T",
    completed: false,
    createdAt: t,
    updatedAt: t
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
    expect(update("missing", sampleTodo("missing"))).toBeUndefined();
  });

  it("remove returns false when id is missing", () => {
    expect(remove("nope")).toBe(false);
  });
});
