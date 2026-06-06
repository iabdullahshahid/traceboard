import { io, Socket } from "socket.io-client";
import type { LogEntry, LogType, TraceLogger } from "./types";
import { generateId, getCaller, safeSerialize } from "./utils";

const DEFAULT_PORT = 4287;
const DEFAULT_HOST = "http://localhost";

let socket: Socket | null = null;
let connecting = false;

function getServerUrl(): string {
  const port = process.env.TRACEBOARD_PORT ?? DEFAULT_PORT;
  const host = process.env.TRACEBOARD_HOST ?? DEFAULT_HOST;
  return `${host}:${port}`;
}

function ensureConnection(): void {
  if (socket?.connected || connecting) return;

  connecting = true;
  socket = io(getServerUrl(), {
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 500,
    reconnectionDelayMax: 3000,
    transports: ["websocket", "polling"],
  });

  socket.on("connect", () => {
    connecting = false;
  });

  socket.on("connect_error", () => {
    connecting = false;
  });
}

function emitLog(
  type: LogType,
  message: string,
  data: unknown,
  traceId: string
): void {
  ensureConnection();

  const entry: LogEntry = {
    id: generateId(),
    traceId,
    timestamp: Date.now(),
    type,
    message,
    data: safeSerialize(data),
    source: getCaller(),
  };

  try {
    if (socket?.connected) {
      socket.emit("log", entry);
    } else if (socket) {
      socket.once("connect", () => {
        socket?.emit("log", entry);
      });
    }
  } catch {
    // Never crash the host app if serialization or transport fails
  }
}

function createLogger(traceId: string): TraceLogger {
  return {
    info: (message: string, data?: unknown) =>
      emitLog("info", message, data, traceId),
    success: (message: string, data?: unknown) =>
      emitLog("success", message, data, traceId),
    warning: (message: string, data?: unknown) =>
      emitLog("warning", message, data, traceId),
    error: (message: string, data?: unknown) =>
      emitLog("error", message, data, traceId),
    group: (name: string) => createLogger(name),
  };
}

export const trace: TraceLogger = createLogger("default");

export type { LogEntry, LogType, TraceLogger };
