#!/usr/bin/env node

import open from "open";
import { createTraceboardServer, DEFAULT_PORT } from "./server";

const port = parseInt(process.env.TRACEBOARD_PORT ?? String(DEFAULT_PORT), 10);

async function main() {
  const server = createTraceboardServer(port);
  const actualPort = await server.start();

  const url = `http://localhost:${actualPort}`;

  console.log(`\n  traceboard dashboard running at ${url}\n`);

  try {
    await open(url);
  } catch {
    // Browser open is best-effort
  }

  process.on("SIGINT", () => {
    server.stop().then(() => process.exit(0));
  });

  process.on("SIGTERM", () => {
    server.stop().then(() => process.exit(0));
  });
}

main().catch((err) => {
  console.error("Failed to start traceboard:", err);
  process.exit(1);
});
