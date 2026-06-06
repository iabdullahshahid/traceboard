import express from "express";
import { createServer } from "http";
import path from "path";
import { Server } from "socket.io";
import type { LogEntry } from "../types";
import { store } from "./store";

export const DEFAULT_PORT = 4287;

export function createTraceboardServer(port = DEFAULT_PORT) {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: { origin: "*" },
  });

  const dashboardPath = path.join(__dirname, "..", "dashboard");
  app.use(express.static(dashboardPath));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(dashboardPath, "index.html"));
  });

  io.on("connection", (socket) => {
    socket.emit("init", store.getAll());

    socket.on("log", (entry: LogEntry) => {
      const stored = store.add(entry);
      io.emit("log", stored);
    });

    socket.on("clear", () => {
      store.clear();
      io.emit("clear");
    });
  });

  return {
    start: () =>
      new Promise<number>((resolve) => {
        httpServer.listen(port, () => resolve(port));
      }),
    stop: () =>
      new Promise<void>((resolve) => {
        io.close();
        httpServer.close(() => resolve());
      }),
    getLogCount: () => store.size,
  };
}
