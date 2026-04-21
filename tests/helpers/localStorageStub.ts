import { createServer, type IncomingMessage, type Server } from "node:http";
import { randomUUID } from "node:crypto";

interface TodoRow {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

const store = new Map<string, TodoRow>();

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (c) => chunks.push(Buffer.from(c)));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

export async function startLocalStorageStub(): Promise<{
  server: Server;
  port: number;
  baseUrl: string;
}> {
  store.clear();

  const server = createServer(async (req, res) => {
    const url = new URL(req.url ?? "/", "http://localhost");
    const path = url.pathname;

    if (req.method === "GET" && path === "/local-storage/todos") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify([...store.values()]));
      return;
    }

    if (req.method === "POST" && path === "/local-storage/todos") {
      const raw = await readBody(req);
      let body: Partial<TodoRow> & { id?: string };
      try {
        body = JSON.parse(raw || "{}") as typeof body;
      } catch {
        res.writeHead(400);
        res.end();
        return;
      }
      const id = body.id ?? randomUUID();
      const now = new Date().toISOString();
      const row: TodoRow = {
        id,
        title: String(body.title ?? ""),
        description:
          body.description === undefined || body.description === null
            ? undefined
            : String(body.description),
        completed: Boolean(body.completed),
        createdAt: body.createdAt ?? now,
        updatedAt: body.updatedAt ?? now,
      };
      store.set(id, row);
      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(JSON.stringify(row));
      return;
    }

    const itemMatch = path.match(/^\/local-storage\/todos\/([^/]+)$/);
    if (itemMatch) {
      const id = decodeURIComponent(itemMatch[1]);

      if (req.method === "GET") {
        const row = store.get(id);
        if (!row) {
          res.writeHead(404);
          res.end();
          return;
        }
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(row));
        return;
      }

      if (req.method === "PUT") {
        const raw = await readBody(req);
        let body: Partial<TodoRow>;
        try {
          body = JSON.parse(raw || "{}") as Partial<TodoRow>;
        } catch {
          res.writeHead(400);
          res.end();
          return;
        }
        const existing = store.get(id);
        if (!existing) {
          res.writeHead(404);
          res.end();
          return;
        }
        const next: TodoRow = {
          id,
          title: body.title !== undefined ? String(body.title) : existing.title,
          description:
            body.description === undefined
              ? existing.description
              : body.description === null || body.description === ""
                ? undefined
                : String(body.description),
          completed:
            body.completed !== undefined ? Boolean(body.completed) : existing.completed,
          createdAt: existing.createdAt,
          updatedAt:
            typeof body.updatedAt === "string"
              ? body.updatedAt
              : new Date().toISOString(),
        };
        store.set(id, next);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(next));
        return;
      }

      if (req.method === "DELETE") {
        const existed = store.delete(id);
        if (!existed) {
          res.writeHead(404);
          res.end();
          return;
        }
        res.writeHead(204);
        res.end();
        return;
      }
    }

    res.writeHead(404);
    res.end();
  });

  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const addr = server.address();
  if (!addr || typeof addr === "string") {
    throw new Error("Failed to bind stub server");
  }
  const port = addr.port;
  return {
    server,
    port,
    baseUrl: `http://127.0.0.1:${port}`,
  };
}

export function stopLocalStorageStub(server: Server): Promise<void> {
  return new Promise((resolve, reject) => {
    server.close((err) => (err ? reject(err) : resolve()));
  });
}
