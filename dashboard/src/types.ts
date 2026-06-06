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

export interface TraceGroup {
  traceId: string;
  logs: LogEntry[];
  startTime: number;
  endTime: number;
}
