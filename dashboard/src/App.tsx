import { useState, useMemo, useEffect } from "react";
import type { LogEntry, LogType } from "./types";
import { useSocket } from "./hooks/useSocket";
import { FilterBar } from "./components/FilterBar";
import { LogRow } from "./components/LogRow";
import { DetailDrawer } from "./components/DetailDrawer";
import { Timeline } from "./components/Timeline";
import { filterLogs, groupLogsByTrace } from "./utils";

type ViewMode = "flat" | "grouped";

const ALL_TYPES: LogType[] = ["info", "success", "warning", "error"];

export default function App() {
  const { logs, connected, clearLogs } = useSocket();
  const [search, setSearch] = useState("");
  const [activeTypes, setActiveTypes] = useState<Set<LogType>>(
    () => new Set(ALL_TYPES)
  );
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("grouped");
  const [dark, setDark] = useState(() => {
    if (typeof window !== "undefined") {
      return (
        localStorage.getItem("traceboard-theme") === "dark" ||
        (!localStorage.getItem("traceboard-theme") &&
          window.matchMedia("(prefers-color-scheme: dark)").matches)
      );
    }
    return true;
  });

  const activeTypesKey = useMemo(
    () => ALL_TYPES.filter((t) => activeTypes.has(t)).join(","),
    [activeTypes]
  );

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    localStorage.setItem("traceboard-theme", next ? "dark" : "light");
    document.documentElement.classList.toggle("dark", next);
  };

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const showAllTypes = () => setActiveTypes(new Set(ALL_TYPES));

  const toggleType = (type: LogType) => {
    setActiveTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        if (next.size <= 1) return new Set(ALL_TYPES);
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  };

  const filtered = useMemo(
    () => filterLogs(logs, search, activeTypes),
    [logs, search, activeTypesKey]
  );

  const groups = useMemo(() => groupLogsByTrace(filtered), [filtered]);

  const handleSelectById = (id: string) => {
    const log = filtered.find((l) => l.id === id) ?? null;
    setSelectedLog(log);
  };

  return (
    <div className="h-screen flex flex-col">
      <header className="shrink-0 border-b border-[var(--border)] bg-[var(--surface-elevated)]">
        <div className="container">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[var(--accent)] flex items-center justify-center">
                  <span className="text-white text-xs font-bold">T</span>
                </div>
                <h1 className="text-base font-semibold tracking-tight">
                  traceboard
                </h1>
              </div>

              <div className="flex items-center gap-1.5 ml-2">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${connected ? "bg-emerald-500" : "bg-red-500 animate-pulse"}`}
                />
                <span className="text-[11px] text-[var(--muted)]">
                  {connected ? "Connected" : "Reconnecting…"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-[var(--muted)] font-mono mr-2">
                {filtered.length} / {logs.length} logs
              </span>

              <div className="flex rounded-lg border border-[var(--border)] overflow-hidden">
                <button
                  onClick={() => setViewMode("grouped")}
                  className={`px-2.5 py-1 text-xs font-medium transition-colors ${
                    viewMode === "grouped"
                      ? "bg-[var(--accent-muted)] text-[var(--accent)]"
                      : "text-[var(--muted)] hover:bg-[var(--surface-hover)]"
                  }`}
                >
                  Groups
                </button>
                <button
                  onClick={() => setViewMode("flat")}
                  className={`px-2.5 py-1 text-xs font-medium transition-colors ${
                    viewMode === "flat"
                      ? "bg-[var(--accent-muted)] text-[var(--accent)]"
                      : "text-[var(--muted)] hover:bg-[var(--surface-hover)]"
                  }`}
                >
                  Flat
                </button>
              </div>

              <button
                onClick={clearLogs}
                className="px-2.5 py-1 text-xs font-medium text-[var(--muted)] hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
              >
                Clear
              </button>

              <button
                onClick={toggleTheme}
                className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-[var(--surface-hover)] text-[var(--muted)] transition-colors"
                title="Toggle theme"
              >
                {dark ? "☀" : "☾"}
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3 pb-3">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)] text-sm">
                ⌕
              </span>
              <input
                type="text"
                placeholder="Search logs, endpoints, traces…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-sm rounded-lg bg-[var(--surface)] border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30 focus:border-[var(--accent)] placeholder:text-[var(--muted)]"
              />
            </div>
            <FilterBar
              activeTypes={activeTypes}
              onToggleType={toggleType}
              onShowAll={showAllTypes}
            />
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="container py-2">
          {filtered.length === 0 ? (
            <EmptyState hasLogs={logs.length > 0} connected={connected} />
          ) : viewMode === "grouped" ? (
            <div className="divide-y divide-[var(--border)] rounded-xl border border-[var(--border)] overflow-hidden bg-[var(--surface-elevated)]">
              {groups.map((group) => (
                <div
                  key={group.traceId}
                  className="bg-[var(--surface)] even:bg-[var(--surface-elevated)]/50"
                >
                  <Timeline
                    group={group}
                    onSelectLog={handleSelectById}
                    selectedId={selectedLog?.id ?? null}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-[var(--border)] overflow-hidden bg-[var(--surface-elevated)]">
              {filtered.map((log) => (
                <LogRow
                  key={log.id}
                  log={log}
                  onSelect={setSelectedLog}
                  isSelected={selectedLog?.id === log.id}
                  showTraceId
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <DetailDrawer log={selectedLog} onClose={() => setSelectedLog(null)} />
    </div>
  );
}

function EmptyState({
  hasLogs,
  connected,
}: {
  hasLogs: boolean;
  connected: boolean;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
      <div className="w-16 h-16 rounded-2xl bg-[var(--accent-muted)] flex items-center justify-center mb-4">
        <span className="text-2xl">📡</span>
      </div>
      <h2 className="text-lg font-semibold mb-1">
        {hasLogs ? "No matching logs" : "Waiting for traces"}
      </h2>
      <p className="text-sm text-[var(--muted)] max-w-sm">
        {hasLogs
          ? "Try adjusting your search or filters."
          : connected
            ? 'Import trace from your app and call trace.info("Hello") to get started.'
            : "Start the traceboard server with npx traceboard, then connect your app."}
      </p>
      {!hasLogs && (
        <pre className="mt-6 p-4 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border)] text-xs font-mono text-left text-[var(--text-secondary)] max-w-lg w-full">
          {`import { trace } from "traceboard"\n\ntrace.success("GET /api/users", {\n  method: "GET",\n  path: "/api/users",\n  status: 200\n})`}
        </pre>
      )}
    </div>
  );
}
