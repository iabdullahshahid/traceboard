import type { TraceGroup } from "../types";
import { EndpointBadge } from "./EndpointBadge";
import {
  LOG_TYPE_CONFIG,
  formatDuration,
  formatTime,
  normalizeLogType,
} from "../utils";

interface TimelineProps {
  group: TraceGroup;
  onSelectLog: (id: string) => void;
  selectedId: string | null;
}

export function Timeline({ group, onSelectLog, selectedId }: TimelineProps) {
  const duration = group.endTime - group.startTime;

  return (
    <div className="px-4 py-3">
      <div className="flex items-center gap-3 mb-3">
        <span className="text-xs font-mono font-medium text-[var(--accent)]">
          {group.traceId}
        </span>
        <span className="text-[11px] text-[var(--muted)]">
          {group.logs.length} events · {formatDuration(duration)}
        </span>
        <span className="text-[11px] text-[var(--muted)] font-mono">
          {formatTime(group.startTime)}
        </span>
      </div>

      <div className="relative pl-6">
        <div className="absolute left-[7px] top-2 bottom-2 w-px bg-[var(--border)]" />

        {group.logs.map((log, i) => {
          const config = LOG_TYPE_CONFIG[normalizeLogType(log.type)];
          const isSelected = selectedId === log.id;
          const offset =
            duration > 0
              ? ((log.timestamp - group.startTime) / duration) * 100
              : (i / Math.max(group.logs.length - 1, 1)) * 100;

          return (
            <button
              key={log.id}
              onClick={() => onSelectLog(log.id)}
              className={`relative flex items-start gap-3 w-full text-left py-2 px-2 -ml-2 rounded-lg transition-colors hover:bg-[var(--surface-hover)] ${
                isSelected ? "bg-[var(--accent-muted)]/30" : ""
              }`}
            >
              <div className="absolute left-[3px] top-[14px] z-10">
                <span
                  className={`block w-[9px] h-[9px] rounded-full ring-2 ring-[var(--surface-elevated)] ${config.dot}`}
                />
              </div>

              <div className="flex-1 min-w-0 ml-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${config.bg} ${config.color}`}
                  >
                    {config.label}
                  </span>
                  <span className="text-sm font-medium">{log.message}</span>
                  <EndpointBadge data={log.data} />
                  {log.data !== undefined && (
                    <span className="text-[10px] text-[var(--muted)] px-1 py-0.5 rounded bg-[var(--surface)]">
                      data
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[11px] text-[var(--muted)] font-mono">
                    {formatTime(log.timestamp)}
                  </span>
                  {duration > 0 && (
                    <span className="text-[10px] text-[var(--muted)]">
                      +{formatDuration(log.timestamp - group.startTime)}
                    </span>
                  )}
                </div>
              </div>

              {duration > 0 && group.logs.length > 1 && (
                <div className="hidden sm:block w-16 shrink-0">
                  <div className="h-1 rounded-full bg-[var(--border)] overflow-hidden">
                    <div
                      className={`h-full rounded-full ${config.dot}`}
                      style={{ width: `${Math.max(offset, 8)}%` }}
                    />
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
