import { extractApiEndpoint } from "../utils";

export function EndpointBadge({ data }: { data: unknown }) {
  const endpoint = extractApiEndpoint(data);
  if (!endpoint) return null;

  return (
    <span
      className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--accent-muted)] text-[var(--accent)] truncate max-w-[220px]"
      title={endpoint}
    >
      {endpoint}
    </span>
  );
}
