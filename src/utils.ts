import { randomUUID } from "crypto";

export function generateId(): string {
  return randomUUID().slice(0, 8);
}

export function safeSerialize(value: unknown): unknown {
  if (value === undefined) return undefined;

  const seen = new WeakSet<object>();

  try {
    return JSON.parse(
      JSON.stringify(value, (_key, val) => {
        if (val instanceof Error) {
          return {
            name: val.name,
            message: val.message,
            stack: val.stack,
          };
        }

        if (typeof val === "bigint") return val.toString();
        if (typeof val === "function") return `[Function: ${val.name || "anonymous"}]`;
        if (typeof val === "symbol") return val.toString();

        if (val !== null && typeof val === "object") {
          if (seen.has(val)) return "[Circular]";
          seen.add(val);
        }

        return val;
      })
    );
  } catch {
    return String(value);
  }
}

export function getCaller(): { file: string; line: number } {
  const err = new Error();
  const stack = err.stack?.split("\n") ?? [];

  for (const line of stack) {
    if (
      line.includes("node_modules/traceboard") ||
      line.includes("node:internal") ||
      line.includes("getCaller") ||
      line.includes("emitLog") ||
      line.includes("Object.info") ||
      line.includes("Object.success") ||
      line.includes("Object.warning") ||
      line.includes("Object.error")
    ) {
      continue;
    }

    const match =
      line.match(/\((.+):(\d+):\d+\)/) ?? line.match(/at (.+):(\d+):\d+/);
    if (match) {
      const file = match[1].replace(/^file:\/\//, "");
      const lineNum = parseInt(match[2], 10);
      return { file, line: lineNum };
    }
  }

  return { file: "unknown", line: 0 };
}
