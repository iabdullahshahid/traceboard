import type { LogEntry } from "../types";

const MAX_LOGS = 10_000;

class LogStore {
  private logs: LogEntry[] = [];

  add(entry: LogEntry): LogEntry {
    this.logs.push(entry);
    if (this.logs.length > MAX_LOGS) {
      this.logs = this.logs.slice(-MAX_LOGS);
    }
    return entry;
  }

  getAll(): LogEntry[] {
    return [...this.logs];
  }

  clear(): void {
    this.logs = [];
  }

  get size(): number {
    return this.logs.length;
  }
}

export const store = new LogStore();
