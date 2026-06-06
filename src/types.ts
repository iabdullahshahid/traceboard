export type LogType = "info" | "success" | "warning" | "error";

export interface LogEntry {
  id: string;
  traceId: string;
  timestamp: number;
  type: LogType;
  message: string;
  data?: unknown;
  source: {
    file: string;
    line: number;
  };
}

export interface TraceLogger {
  info(message: string, data?: unknown): void;
  success(message: string, data?: unknown): void;
  warning(message: string, data?: unknown): void;
  error(message: string, data?: unknown): void;
  group(name: string): TraceLogger;
}
