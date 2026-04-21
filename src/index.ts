import { createApp } from "./app";

export function scaffoldMessage(): string {
  return "Backend scaffold ready";
}

export function main(): void {
  console.log(scaffoldMessage());
}

export function startServer(): void {
  const port = Number(process.env.PORT) || 3000;
  const app = createApp();
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}

/* istanbul ignore next: entrypoint only */
if (require.main === module) {
  startServer();
}
