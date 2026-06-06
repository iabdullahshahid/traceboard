import type { LogEntry } from "../types";
import {
  LOG_TYPE_CONFIG,
  extractApiEndpoint,
  formatTime,
  normalizeLogType,
} from "../utils";

interface DetailDrawerProps {
  log: LogEntry | null;
  onClose: () => void;
}

export function DetailDrawer({ log, onClose }: DetailDrawerProps) {
  if (!log) return null;

  const config = LOG_TYPE_CONFIG[normalizeLogType(log.type)];
  const endpoint = extractApiEndpoint(log.data);

  return (
    <>
      <div
        className="fixed inset-0 bg-black/20 dark:bg-black/40 z-40"
        onClick={onClose}
      />
      <aside className="fixed right-0 top-0 bottom-0 w-1/2 min-w-[360px] bg-[var(--surface-elevated)] border-l border-[var(--border)] z-50 animate-slide-in flex flex-col shadow-2xl">
        <div className="container !max-w-none flex items-center justify-between py-4 border-b border-[var(--border)]">
          <h2 className="text-base font-semibold">Log Details</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-[var(--surface-hover)] text-[var(--muted)] transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="container !max-w-none py-5 space-y-5">
            <div>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${config.bg} ${config.color}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
                {config.label}
              </span>
            </div>

            <Field label="Message" value={log.message} />

            {endpoint && (
              <Field label="API Endpoint" value={endpoint} mono highlight />
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Trace ID" value={log.traceId} mono />
              <Field label="Log ID" value={log.id} mono />
            </div>

            <Field label="Timestamp" value={formatTime(log.timestamp)} mono />

            <Field
              label="Source"
              value={`${log.source.file}:${log.source.line}`}
              mono
            />

            {log.data !== undefined && (
              <div>
                <label className="text-[11px] font-medium text-[var(--muted)] uppercase tracking-wider">
                  Data
                </label>
                <pre className="mt-1.5 p-4 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-sm font-mono overflow-x-auto leading-relaxed max-h-[50vh]">
                  {JSON.stringify(log.data, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

function Field({
  label,
  value,
  mono = false,
  highlight = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
  highlight?: boolean;
}) {
  return (
    <div>
      <label className="text-[11px] font-medium text-[var(--muted)] uppercase tracking-wider">
        {label}
      </label>
      <p
        className={`mt-1.5 break-all ${
          mono ? "font-mono text-sm" : "text-sm"
        } ${highlight ? "text-[var(--accent)] font-medium" : ""}`}
      >
        {value}
      </p>
    </div>
  );
}
