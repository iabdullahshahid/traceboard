import { useEffect, useState, useCallback, useRef } from "react";
import { io, Socket } from "socket.io-client";
import type { LogEntry } from "../types";
import { normalizeLogType } from "../utils";

function normalizeEntry(entry: LogEntry): LogEntry {
  return {
    ...entry,
    type: normalizeLogType(entry.type),
  };
}

export function useSocket() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket: Socket = io(window.location.origin, {
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 500,
      transports: ["websocket", "polling"],
    });

    socketRef.current = socket;

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    socket.on("init", (entries: LogEntry[]) => {
      setLogs(entries.map(normalizeEntry));
    });

    socket.on("log", (entry: LogEntry) => {
      setLogs((prev) => [...prev, normalizeEntry(entry)]);
    });

    socket.on("clear", () => {
      setLogs([]);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  const clearLogs = useCallback(() => {
    socketRef.current?.emit("clear");
    setLogs([]);
  }, []);

  return { logs, connected, clearLogs };
}
