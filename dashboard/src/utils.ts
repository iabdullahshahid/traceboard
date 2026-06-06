import type { LogEntry, LogType, TraceGroup } from "./types";

export const LOG_TYPE_CONFIG: Record<
  LogType,
  { label: string; color: string; bg: string; dot: string }
> = {
  info: {
    label: "Info",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    dot: "bg-blue-500",
  },
  success: {
    label: "Success",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    dot: "bg-emerald-500",
  },
  warning: {
    label: "Warning",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    dot: "bg-amber-500",
  },
  error: {
    label: "Error",
    color: "text-red-500",
    bg: "bg-red-500/10",
    dot: "bg-red-500",
  },
};

export function formatTime(timestamp: number): string {
  const d = new Date(timestamp);
  const h = d.getHours().toString().padStart(2, "0");
  const m = d.getMinutes().toString().padStart(2, "0");
  const s = d.getSeconds().toString().padStart(2, "0");
  const ms = d.getMilliseconds().toString().padStart(3, "0");
  return `${h}:${m}:${s}.${ms}`;
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

export function shortenPath(file: string): string {
  const parts = file.split("/");
  if (parts.length <= 2) return file;
  return parts.slice(-2).join("/");
}

export function groupLogsByTrace(logs: LogEntry[]): TraceGroup[] {
  const groups = new Map<string, LogEntry[]>();

  for (const log of logs) {
    const existing = groups.get(log.traceId) ?? [];
    existing.push(log);
    groups.set(log.traceId, existing);
  }

  return Array.from(groups.entries())
    .map(([traceId, groupLogs]) => {
      const sorted = groupLogs.sort((a, b) => a.timestamp - b.timestamp);
      return {
        traceId,
        logs: sorted,
        startTime: sorted[0].timestamp,
        endTime: sorted[sorted.length - 1].timestamp,
      };
    })
    .sort((a, b) => b.startTime - a.startTime);
}

const LOG_TYPES: LogType[] = ["info", "success", "warning", "error"];

export function normalizeLogType(type: unknown): LogType {
  if (typeof type === "string") {
    const lower = type.toLowerCase();
    if (LOG_TYPES.includes(lower as LogType)) return lower as LogType;
  }
  return "info";
}

export function extractApiEndpoint(data: unknown): string | null {
  if (data == null) return null;

  if (typeof data === "string") {
    if (data.startsWith("/") || data.startsWith("http")) return data;
    return null;
  }

  if (typeof data !== "object") return null;

  const d = data as Record<string, unknown>;

  const method =
    typeof d.method === "string"
      ? d.method.toUpperCase()
      : typeof d.httpMethod === "string"
        ? d.httpMethod.toUpperCase()
        : null;

  const path =
    typeof d.endpoint === "string"
      ? d.endpoint
      : typeof d.url === "string"
        ? d.url
        : typeof d.path === "string"
          ? d.path
          : typeof d.route === "string"
            ? d.route
            : typeof d.api === "string"
              ? d.api
              : null;

  if (path) {
    return method ? `${method} ${path}` : path;
  }

  if (d.request && typeof d.request === "object") {
    return extractApiEndpoint(d.request);
  }

  return null;
}

export function filterLogs(
  logs: LogEntry[],
  search: string,
  types: Set<LogType>
): LogEntry[] {
  const query = search.toLowerCase().trim();

  return logs.filter((log) => {
    const logType = normalizeLogType(log.type);
    if (!types.has(logType)) return false;
    if (!query) return true;

    const endpoint = extractApiEndpoint(log.data);

    const haystack = [
      log.message,
      log.traceId,
      logType,
      log.source.file,
      endpoint ?? "",
      log.data ? JSON.stringify(log.data) : "",
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(query);
  });
}
