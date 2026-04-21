import type { Todo } from "../models/todo";
import type { ITodoRepository } from "./ITodoRepository";
import { StorageError } from "../errors/StorageError";

const DEFAULT_BASE = "http://localhost:3000";

function baseUrl(): string {
  return process.env.LOCAL_STORAGE_PROXY_BASE_URL ?? DEFAULT_BASE;
}

function todosCollectionUrl(): string {
  return `${baseUrl().replace(/\/$/, "")}/local-storage/todos`;
}

function todoItemUrl(id: string): string {
  return `${todosCollectionUrl()}/${encodeURIComponent(id)}`;
}

function todoFromWire(raw: unknown): Todo {
  if (!raw || typeof raw !== "object") {
    throw new StorageError("Malformed todo from storage proxy", "UPSTREAM_ERROR");
  }
  const o = raw as Record<string, unknown>;
  const id = o.id;
  const title = o.title;
  const completed = o.completed;
  const createdAt = o.createdAt;
  const updatedAt = o.updatedAt;
  if (typeof id !== "string" || typeof title !== "string" || typeof completed !== "boolean") {
    throw new StorageError("Malformed todo from storage proxy", "UPSTREAM_ERROR");
  }
  let created: Date;
  let updated: Date;
  if (createdAt instanceof Date) {
    created = createdAt;
  } else if (typeof createdAt === "string") {
    created = new Date(createdAt);
  } else {
    throw new StorageError("Malformed todo from storage proxy", "UPSTREAM_ERROR");
  }
  if (updatedAt instanceof Date) {
    updated = updatedAt;
  } else if (typeof updatedAt === "string") {
    updated = new Date(updatedAt);
  } else {
    throw new StorageError("Malformed todo from storage proxy", "UPSTREAM_ERROR");
  }
  let description: string | undefined;
  if (o.description !== undefined && o.description !== null) {
    if (typeof o.description !== "string") {
      throw new StorageError("Malformed todo from storage proxy", "UPSTREAM_ERROR");
    }
    description = o.description;
  }
  return {
    id,
    title,
    description,
    completed,
    createdAt: created,
    updatedAt: updated,
  };
}

function todoToWire(todo: Todo): Record<string, unknown> {
  return {
    id: todo.id,
    title: todo.title,
    description: todo.description,
    completed: todo.completed,
    createdAt: todo.createdAt.toISOString(),
    updatedAt: todo.updatedAt.toISOString(),
  };
}

async function parseJsonBody(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new StorageError("Invalid JSON from storage proxy", "UPSTREAM_ERROR", {
      statusCode: res.status,
    });
  }
}

export class LocalStorageProxyRepository implements ITodoRepository {
  async add(todo: Todo): Promise<Todo> {
    let res: Response;
    try {
      res = await fetch(todosCollectionUrl(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(todoToWire(todo)),
      });
    } catch (err) {
      throw new StorageError("Storage proxy unreachable", "NETWORK_ERROR", {
        cause: err,
      });
    }

    if (!res.ok) {
      const payload = await parseJsonBody(res).catch(() => null);
      throw new StorageError(
        `Storage proxy rejected create (${res.status})`,
        "UPSTREAM_ERROR",
        { statusCode: res.status, cause: payload }
      );
    }

    const data = await parseJsonBody(res);
    return todoFromWire(data);
  }

  async findAll(): Promise<Todo[]> {
    let res: Response;
    try {
      res = await fetch(todosCollectionUrl(), { method: "GET" });
    } catch (err) {
      throw new StorageError("Storage proxy unreachable", "NETWORK_ERROR", {
        cause: err,
      });
    }

    if (!res.ok) {
      throw new StorageError(
        `Storage proxy list failed (${res.status})`,
        "UPSTREAM_ERROR",
        { statusCode: res.status }
      );
    }

    const data = await parseJsonBody(res);
    if (!Array.isArray(data)) {
      throw new StorageError("Malformed list from storage proxy", "UPSTREAM_ERROR", {
        statusCode: res.status,
      });
    }
    return data.map((item) => todoFromWire(item));
  }

  async findById(id: string): Promise<Todo | undefined> {
    let res: Response;
    try {
      res = await fetch(todoItemUrl(id), { method: "GET" });
    } catch (err) {
      throw new StorageError("Storage proxy unreachable", "NETWORK_ERROR", {
        cause: err,
      });
    }

    if (res.status === 404) return undefined;
    if (!res.ok) {
      throw new StorageError(
        `Storage proxy get failed (${res.status})`,
        "UPSTREAM_ERROR",
        { statusCode: res.status }
      );
    }

    const data = await parseJsonBody(res);
    return todoFromWire(data);
  }

  async update(id: string, patch: Partial<Todo>): Promise<Todo | undefined> {
    let res: Response;
    try {
      res = await fetch(todoItemUrl(id), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...patch,
          updatedAt:
            patch.updatedAt instanceof Date
              ? patch.updatedAt.toISOString()
              : patch.updatedAt,
        }),
      });
    } catch (err) {
      throw new StorageError("Storage proxy unreachable", "NETWORK_ERROR", {
        cause: err,
      });
    }

    if (res.status === 404) return undefined;
    if (!res.ok) {
      throw new StorageError(
        `Storage proxy update failed (${res.status})`,
        "UPSTREAM_ERROR",
        { statusCode: res.status }
      );
    }

    const data = await parseJsonBody(res);
    return todoFromWire(data);
  }

  async remove(id: string): Promise<boolean> {
    let res: Response;
    try {
      res = await fetch(todoItemUrl(id), { method: "DELETE" });
    } catch (err) {
      throw new StorageError("Storage proxy unreachable", "NETWORK_ERROR", {
        cause: err,
      });
    }

    if (res.status === 404) return false;
    if (!res.ok) {
      throw new StorageError(
        `Storage proxy delete failed (${res.status})`,
        "UPSTREAM_ERROR",
        { statusCode: res.status }
      );
    }
    return true;
  }
}
