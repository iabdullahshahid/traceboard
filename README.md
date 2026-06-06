# traceboard

Lightweight local developer debugging dashboard with realtime trace logs.

## Install

```bash
npm install traceboard
```

## Start the dashboard

```bash
npx traceboard
```

Opens a dashboard at `http://localhost:4287`.

## Usage

```ts
import { trace } from "traceboard";

trace.info("User loaded", { userId: 42 });
trace.success("Cache hit");
trace.warning("Rate limit approaching", { remaining: 5 });
trace.error("Payment failed", { code: "CARD_DECLINED" });

const t = trace.group("AUTH_FLOW");

t.info("Initiate Auth");
t.success("JWT Generated", { expiresIn: 3600 });
t.error("Token refresh failed");
```

Logs stream to the dashboard in realtime — nothing prints to your terminal.

## Configuration

| Variable | Default | Description |
|---|---|---|
| `TRACEBOARD_PORT` | `4287` | Dashboard server port |
| `TRACEBOARD_HOST` | `http://localhost` | Dashboard server host |

## Dashboard

- Realtime log streaming via WebSocket
- Search across messages, trace IDs, files, and JSON data
- Filter by type (info / success / warning / error)
- Group logs by trace ID with timeline visualization
- Detail drawer for full JSON payloads
- Dark / light mode
- In-memory storage (resets on server restart)

## Log shape

Each log entry includes:

```ts
{
  id: string;
  traceId: string;
  timestamp: number;
  type: "info" | "success" | "warning" | "error";
  message: string;
  data?: unknown;
  source: { file: string; line: number };
}
```

## License

MIT
