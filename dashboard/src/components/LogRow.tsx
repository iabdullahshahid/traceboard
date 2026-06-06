import type { LogEntry } from "../types";
import { EndpointBadge } from "./EndpointBadge";
import {
  LOG_TYPE_CONFIG,
  formatTime,
  normalizeLogType,
  shortenPath,
} from "../utils";

interface LogRowProps {
  log: LogEntry;
  onSelect: (log: LogEntry) => void;
  isSelected: boolean;
  showTraceId?: boolean;
}

export function LogRow({
  log,
  onSelect,
  isSelected,
  showTraceId = false,
}: LogRowProps) {
  const config = LOG_TYPE_CONFIG[normalizeLogType(log.type)];

  return (
    <button
      onClick={() => onSelect(log)}
      className={`log-enter w-full text-left px-4 py-2.5 flex items-start gap-3 border-b border-[var(--border)] transition-colors hover:bg-[var(--surface-hover)] ${
        isSelected ? "bg-[var(--accent-muted)]/30" : ""
      }`}
    >
      <span className="text-[var(--muted)] font-mono text-xs pt-0.5 w-[90px] shrink-0">
        {formatTime(log.timestamp)}
      </span>

      <span
        className={`shrink-0 mt-1 w-2 h-2 rounded-full ${config.dot}`}
        title={config.label}
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          {showTraceId && (
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--surface-elevated)] text-[var(--accent)]">
              {log.traceId}
            </span>
          )}
          <span className="text-sm font-medium">{log.message}</span>
          <EndpointBadge data={log.data} />
          {log.data !== undefined && (
            <span className="text-[10px] text-[var(--muted)] px-1.5 py-0.5 rounded bg-[var(--surface-elevated)]">
              JSON
            </span>
          )}
        </div>
        <div className="text-[11px] text-[var(--muted)] font-mono mt-0.5 truncate">
          {shortenPath(log.source.file)}:{log.source.line}
        </div>
      </div>
    </button>
  );
}
