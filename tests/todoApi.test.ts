/**
 * Vitest integration suite: run twice via npm (STORAGE_MODE=IN_MEMORY | LOCAL_PROXY).
 * STORAGE_MODE is read when modules load; set it in the test runner env.
 */
import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import request from "supertest";
import type { Application } from "express";
import type { Server } from "node:http";
import { startLocalStorageStub, stopLocalStorageStub } from "./helpers/localStorageStub";
import { __clearInMemoryStoreForTests } from "../src/storage/InMemoryTodoRepository";

const storageMode = process.env.STORAGE_MODE?.toUpperCase() ?? "IN_MEMORY";

describe(`Todo API (STORAGE_MODE=${storageMode})`, () => {
  let app: Application;
  let stubServer: Server | undefined;

  beforeAll(async () => {
    if (storageMode === "LOCAL_PROXY") {
      const { server, baseUrl } = await startLocalStorageStub();
      stubServer = server;
      process.env.LOCAL_STORAGE_PROXY_BASE_URL = baseUrl;
    }

    const { createApp } = await import("../src/app");
    app = createApp();
  });

  afterAll(async () => {
    if (stubServer) {
      await stopLocalStorageStub(stubServer);
    }
  });

  beforeEach(() => {
    if (storageMode === "IN_MEMORY") {
      __clearInMemoryStoreForTests();
    }
  });

  function expectTodoShape(body: Record<string, unknown>): void {
    expect(body).toMatchObject({
      id: expect.any(String),
      title: expect.any(String),
      completed: expect.any(Boolean),
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });
    if (body.description !== undefined) {
      expect(typeof body.description).toBe("string");
    }
  }

  it("POST /todos creates a todo", async () => {
    const res = await request(app)
      .post("/todos")
      .send({ title: "First", description: "Note" })
      .expect(201);

    expectTodoShape(res.body as Record<string, unknown>);
    expect(res.body).toMatchObject({
      title: "First",
      description: "Note",
      completed: false,
    });
  });

  it("POST /todos accepts completed", async () => {
    const res = await request(app)
      .post("/todos")
      .send({ title: "With flag", completed: true })
      .expect(201);
    expect(res.body).toMatchObject({ completed: true });
  });

  it("POST /todos returns 400 for invalid title", async () => {
    const res = await request(app).post("/todos").send({ title: "" }).expect(400);
    expect(res.body).toEqual({ error: "Title cannot be empty" });
  });

  it("POST /todos returns 400 for whitespace-only title", async () => {
    const res = await request(app).post("/todos").send({ title: "   " }).expect(400);
    expect(res.body).toEqual({ error: "Title cannot be empty" });
  });

  it("GET /todos lists todos", async () => {
    await request(app).post("/todos").send({ title: "A" }).expect(201);

    const res = await request(app).get("/todos").expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(1);
    expectTodoShape(res.body[0]);
  });

  it("GET /todos/:id returns a todo", async () => {
    const created = await request(app).post("/todos").send({ title: "One" }).expect(201);

    const id = (created.body as { id: string }).id;
    const res = await request(app).get(`/todos/${id}`).expect(200);
    expectTodoShape(res.body as Record<string, unknown>);
    expect(res.body).toMatchObject({ id, title: "One" });
  });

  it("GET /todos/:id returns 404 for unknown id", async () => {
    const res = await request(app)
      .get("/todos/00000000-0000-4000-8000-000000000000")
      .expect(404);
    expect(res.body).toEqual({ error: "Todo not found" });
  });

  it("PUT /todos/:id updates a todo", async () => {
    const created = await request(app).post("/todos").send({ title: "Old" }).expect(201);
    const id = (created.body as { id: string }).id;

    const res = await request(app)
      .put(`/todos/${id}`)
      .send({ title: "New", completed: true })
      .expect(200);

    expectTodoShape(res.body as Record<string, unknown>);
    expect(res.body).toMatchObject({
      id,
      title: "New",
      completed: true,
    });
  });

  it("PUT /todos/:id returns 400 for empty title", async () => {
    const created = await request(app).post("/todos").send({ title: "Ok" }).expect(201);
    const id = (created.body as { id: string }).id;

    const res = await request(app).put(`/todos/${id}`).send({ title: "   " }).expect(400);
    expect(res.body).toEqual({ error: "Title cannot be empty" });
  });

  it("PUT /todos/:id returns 404 when missing", async () => {
    const res = await request(app)
      .put("/todos/00000000-0000-4000-8000-000000000000")
      .send({ title: "X" })
      .expect(404);
    expect(res.body).toEqual({ error: "Todo not found" });
  });

  it("DELETE /todos/:id removes a todo", async () => {
    const created = await request(app).post("/todos").send({ title: "Gone" }).expect(201);
    const id = (created.body as { id: string }).id;

    await request(app).delete(`/todos/${id}`).expect(204);

    await request(app).get(`/todos/${id}`).expect(404);
  });

  it("DELETE /todos/:id returns 404 when missing", async () => {
    const res = await request(app)
      .delete("/todos/00000000-0000-4000-8000-000000000000")
      .expect(404);
    expect(res.body).toEqual({ error: "Todo not found" });
  });
});
