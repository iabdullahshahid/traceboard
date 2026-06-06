import type { LogType } from "../types";
import { LOG_TYPE_CONFIG } from "../utils";

const ALL_TYPES: LogType[] = ["info", "success", "warning", "error"];

interface FilterBarProps {
  activeTypes: Set<LogType>;
  onToggleType: (type: LogType) => void;
  onShowAll: () => void;
}

export function FilterBar({
  activeTypes,
  onToggleType,
  onShowAll,
}: FilterBarProps) {
  const allActive = activeTypes.size === ALL_TYPES.length;

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <button
        onClick={onShowAll}
        className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
          allActive
            ? "bg-[var(--accent-muted)] text-[var(--accent)]"
            : "text-[var(--muted)] hover:bg-[var(--surface-hover)]"
        }`}
        title="Show all log types"
      >
        All
      </button>

      {ALL_TYPES.map((type) => {
        const config = LOG_TYPE_CONFIG[type];
        const visible = activeTypes.has(type);

        return (
          <button
            key={type}
            type="button"
            aria-pressed={visible}
            onClick={() => onToggleType(type)}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all border ${
              visible
                ? `${config.bg} ${config.color} border-transparent`
                : "text-[var(--muted)] border-[var(--border)] opacity-50 line-through hover:opacity-75"
            }`}
            title={
              visible
                ? `Hide ${config.label} logs`
                : `Show ${config.label} logs`
            }
          >
            {config.label}
          </button>
        );
      })}
    </div>
  );
}
