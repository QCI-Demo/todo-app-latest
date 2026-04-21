import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { LocalStorageProxyRepository } from "../src/storage/LocalStorageProxyRepository";

describe("LocalStorageProxyRepository", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    delete process.env.LOCAL_STORAGE_PROXY_BASE_URL;
  });

  const fullTodo = {
    id: "1",
    title: "t",
    completed: false,
    createdAt: "2020-01-01T00:00:00.000Z",
    updatedAt: "2020-01-01T00:00:00.000Z",
  };

  it("add forwards POST and maps response", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      text: async () => JSON.stringify(fullTodo),
    } as Response);

    const repo = new LocalStorageProxyRepository();
    const result = await repo.add({
      id: "1",
      title: "t",
      completed: false,
      createdAt: new Date(fullTodo.createdAt),
      updatedAt: new Date(fullTodo.updatedAt),
    });

    expect(result.id).toBe("1");
    expect(result.title).toBe("t");
    expect(globalThis.fetch).toHaveBeenCalledWith(
      "http://localhost:3000/local-storage/todos",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("add throws StorageError on network failure", async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error("ECONNREFUSED"));

    const repo = new LocalStorageProxyRepository();
    await expect(
      repo.add({
        id: "1",
        title: "x",
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    ).rejects.toMatchObject({
      code: "NETWORK_ERROR",
    });
  });

  it("add throws on upstream error", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => "bad",
    } as Response);

    const repo = new LocalStorageProxyRepository();
    await expect(
      repo.add({
        id: "1",
        title: "x",
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    ).rejects.toMatchObject({
      code: "UPSTREAM_ERROR",
    });
  });

  it("findAll returns array from GET", async () => {
    const list = [fullTodo];
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify(list),
    } as Response);

    const repo = new LocalStorageProxyRepository();
    const out = await repo.findAll();
    expect(out).toHaveLength(1);
    expect(out[0].id).toBe("1");
    expect(globalThis.fetch).toHaveBeenCalledWith(
      "http://localhost:3000/local-storage/todos",
      { method: "GET" }
    );
  });

  it("findById returns undefined on 404", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      text: async () => "",
    } as Response);

    const repo = new LocalStorageProxyRepository();
    expect(await repo.findById("x")).toBeUndefined();
  });

  it("update returns undefined on 404", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      text: async () => "",
    } as Response);

    const repo = new LocalStorageProxyRepository();
    expect(await repo.update("x", { title: "t", updatedAt: new Date() })).toBeUndefined();
  });

  it("remove returns false on 404", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      text: async () => "",
    } as Response);

    const repo = new LocalStorageProxyRepository();
    expect(await repo.remove("x")).toBe(false);
  });

  it("uses LOCAL_STORAGE_PROXY_BASE_URL when set", async () => {
    process.env.LOCAL_STORAGE_PROXY_BASE_URL = "http://127.0.0.1:9999";
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify([]),
    } as Response);

    const repo = new LocalStorageProxyRepository();
    await repo.findAll();
    expect(globalThis.fetch).toHaveBeenCalledWith(
      "http://127.0.0.1:9999/local-storage/todos",
      { method: "GET" }
    );
  });
});
