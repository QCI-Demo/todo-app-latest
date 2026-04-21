import { describe, it, expect, beforeEach } from "vitest";
import { InMemoryTodoRepository, __clearInMemoryStoreForTests } from "../src/storage/InMemoryTodoRepository";
import type { Todo } from "../src/models/todo";

describe("InMemoryTodoRepository", () => {
  let repo: InMemoryTodoRepository;

  beforeEach(() => {
    __clearInMemoryStoreForTests();
    repo = new InMemoryTodoRepository();
  });

  function sample(id: string): Todo {
    const t = new Date("2020-01-01T00:00:00.000Z");
    return {
      id,
      title: "a",
      completed: false,
      createdAt: t,
      updatedAt: t,
    };
  }

  it("adds and returns a todo", async () => {
    const t = sample("1");
    const out = await repo.add(t);
    expect(out).toEqual(t);
  });

  it("findAll returns all todos", async () => {
    await repo.add(sample("1"));
    await repo.add(sample("2"));
    const all = await repo.findAll();
    expect(all).toHaveLength(2);
  });

  it("findById returns undefined when missing", async () => {
    expect(await repo.findById("missing")).toBeUndefined();
  });

  it("update returns undefined when missing", async () => {
    expect(
      await repo.update("nope", { title: "t", updatedAt: new Date() })
    ).toBeUndefined();
  });

  it("update merges fields", async () => {
    const created = await repo.add(sample("x"));
    const next = await repo.update(created.id, {
      title: "new",
      completed: true,
      updatedAt: new Date("2025-01-01T00:00:00.000Z"),
    });
    expect(next).toMatchObject({
      id: created.id,
      title: "new",
      completed: true,
    });
  });

  it("remove returns false when missing", async () => {
    expect(await repo.remove("nope")).toBe(false);
  });

  it("remove deletes and returns true", async () => {
    const created = await repo.add(sample("d"));
    expect(await repo.remove(created.id)).toBe(true);
    expect(await repo.findById(created.id)).toBeUndefined();
  });
});
