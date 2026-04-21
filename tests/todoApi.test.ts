/**
 * @jest-environment node
 */
import request from "supertest";
import { createApp } from "../src/app";
import { __clearForTests } from "../src/repository/inMemoryTodoRepository";

describe("Todo API", () => {
  beforeEach(() => {
    __clearForTests();
  });

  const app = createApp();

  function expectTodoShape(body: Record<string, unknown>): void {
    expect(body).toMatchObject({
      id: expect.any(String),
      title: expect.any(String),
      completed: expect.any(Boolean),
      createdAt: expect.any(String),
      updatedAt: expect.any(String)
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
      completed: false
    });
  });

  it("POST /todos returns 400 for invalid title", async () => {
    const res = await request(app).post("/todos").send({ title: "" }).expect(400);

    expect(res.body).toEqual({ error: "Title is required" });
  });

  it("GET /todos lists todos", async () => {
    await request(app).post("/todos").send({ title: "A" }).expect(201);

    const res = await request(app).get("/todos").expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(1);
    expectTodoShape(res.body[0]);
  });

  it("GET /todos/:id returns a todo", async () => {
    const created = await request(app)
      .post("/todos")
      .send({ title: "One" })
      .expect(201);

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
    const created = await request(app)
      .post("/todos")
      .send({ title: "Old" })
      .expect(201);
    const id = (created.body as { id: string }).id;

    const res = await request(app)
      .put(`/todos/${id}`)
      .send({ title: "New", completed: true })
      .expect(200);

    expectTodoShape(res.body as Record<string, unknown>);
    expect(res.body).toMatchObject({
      id,
      title: "New",
      completed: true
    });
  });

  it("PUT /todos/:id returns 400 for empty title", async () => {
    const created = await request(app)
      .post("/todos")
      .send({ title: "Ok" })
      .expect(201);
    const id = (created.body as { id: string }).id;

    const res = await request(app)
      .put(`/todos/${id}`)
      .send({ title: "   " })
      .expect(400);
    expect(res.body).toEqual({ error: "Title cannot be empty" });
  });

  it("DELETE /todos/:id removes a todo", async () => {
    const created = await request(app)
      .post("/todos")
      .send({ title: "Gone" })
      .expect(201);
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
