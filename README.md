<p align="center">
  <img src="./public/images/logo.png" alt="traceboard" width="120" />
</p>

<h1 align="center">traceboard</h1>

<p align="center">
  A lightweight local debugging dashboard for Node.js — stream structured trace logs to a realtime browser UI.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/traceboard"><img src="https://img.shields.io/npm/v/traceboard.svg" alt="npm version" /></a>
  <a href="https://www.npmjs.com/package/traceboard"><img src="https://img.shields.io/npm/l/traceboard.svg" alt="license" /></a>
  <a href="https://nodejs.org"><img src="https://img.shields.io/node/v/traceboard.svg" alt="node version" /></a>
</p>

---

## Table of contents

- [Installation](#installation)
- [Usage](#usage)
- [Results](#results)
- [Configuration](#configuration)
- [Contributing](#contributing)
- [License](#license)

---

## Installation

traceboard has two parts:

1. **Dashboard** — a local server + browser UI (run separately)
2. **SDK** — import `trace` in your Node.js app to send logs

You install the package **once in your project**. The dashboard runs alongside your app during development.

### Prerequisites

- [Node.js](https://nodejs.org/) **18** or later

### Step 1 — Add traceboard to your project

In your existing Node.js app:

```bash
npm install traceboard
```

```bash
yarn add traceboard
```

```bash
pnpm add traceboard
```

### Step 2 — Start the dashboard

Open a **separate terminal** and run:

```bash
npx traceboard
```

This starts the dashboard at **http://localhost:4287** and opens it in your browser. Keep this terminal running while you develop.

Alternatively, install the CLI globally:

```bash
npm install -g traceboard
traceboard
```

### Step 3 — Import and log from your app

In your project code, import `trace` and start logging. Logs stream to the dashboard in realtime — nothing prints to your terminal.

**ESM:**

```ts
import { trace } from "traceboard";

trace.info("Server started", { port: 3000 });
```

**CommonJS:**

```js
const { trace } = require("traceboard");

trace.info("Server started", { port: 3000 });
```

### Step 4 — Run your app

Start your app as you normally would:

```bash
node server.js
# or
npm run dev
```

Open **http://localhost:4287** and your logs appear live.

### Example: Express API

```ts
import express from "express";
import { trace } from "traceboard";

const app = express();

async function fetchUsers() {
  return [
    { id: 1, name: "Alice" },
    { id: 2, name: "Bob" },
  ];
}

app.get("/api/users", async (req, res) => {
  const t = trace.group("GET /api/users");

  t.info("Request received", { method: "GET", path: "/api/users" });

  const users = await fetchUsers();

  t.success("Users returned", {
    method: "GET",
    path: "/api/users",
    status: 200,
    count: users.length,
  });

  res.json(users);
});

app.listen(3000, () => {
  console.log("API server running at http://localhost:3000");
  trace.info("Server listening", { port: 3000 });
});

```

> **Note:** If the dashboard is not running, your app continues normally — logs are silently dropped. The SDK never throws or crashes your app.

---

## Usage

### Log levels

```ts
import { trace } from "traceboard";

trace.info("Processing request");
trace.success("Request completed", { status: 200 });
trace.warning("Deprecated API used", { endpoint: "/v1/users" });
trace.error("Database connection failed", { code: "ECONNREFUSED" });
```

| Method | Type | Use for |
|---|---|---|
| `trace.info()` | Info | General events, debugging context |
| `trace.success()` | Success | Completed operations, happy paths |
| `trace.warning()` | Warning | Deprecations, retries, soft failures |
| `trace.error()` | Error | Exceptions, failed requests, hard errors |

---

### Message only

```ts
trace.info("Application started");
trace.success("Build completed");
trace.warning("Using fallback cache");
trace.error("Connection refused");
```

---

### Message with data

Attach any JSON-serializable object. Click a log in the dashboard to see the full payload in the detail drawer.

```ts
trace.info("User loaded", {
  userId: 42,
  email: "dev@example.com",
  roles: ["admin", "editor"],
});

trace.success("Order placed", {
  orderId: "ord_7p4q1w",
  total: 149.97,
  currency: "USD",
});
```

---

### Trace groups

Group related logs under a shared trace ID — ideal for auth flows, API handlers, or background jobs.

```ts
const auth = trace.group("AUTH_FLOW");

auth.info("OAuth redirect received", { provider: "google" });
auth.info("Exchanging authorization code");
auth.success("JWT issued", { expiresIn: 3600 });
auth.warning("Refresh token expiring soon", { remaining: 300 });
auth.success("Session established", { userId: "usr_8k2m9x" });
```

Nested groups:

```ts
const checkout = trace.group("CHECKOUT");
const payment = checkout.group("PAYMENT");

payment.info("Creating payment intent", { amount: 149.97 });
payment.success("Payment authorized", { paymentId: "pi_3Nx8k2m" });
checkout.success("Order confirmed", { orderId: "ord_7p4q1w" });
```

---

### HTTP / API tracing

Pass `method` and `path` in the data object to show an **endpoint badge** on the log row and an **API Endpoint** field in the detail drawer when clicked.

```ts
const auth = trace.group("AUTH_FLOW");

auth.info("Exchanging authorization code", {
  method: "POST",
  path: "/api/auth/token",
  grantType: "authorization_code",
});

auth.success("JWT issued", {
  method: "POST",
  path: "/api/auth/token",
  status: 200,
  expiresIn: 3600,
  userId: "usr_8k2m9x",
});
```

Clicking a log in the dashboard opens the detail drawer with message, endpoint, trace ID, source file/line, and full JSON data:

```json
{
  "method": "POST",
  "path": "/api/auth/token",
  "grantType": "authorization_code"
}
```

#### Supported endpoint fields

| Key | Example |
|---|---|
| `method` + `path` | `{ method: "GET", path: "/api/users" }` |
| `method` + `url` | `{ method: "POST", url: "/api/orders" }` |
| `method` + `endpoint` | `{ method: "PUT", endpoint: "/api/users/1" }` |
| `method` + `route` | `{ method: "DELETE", route: "/api/session" }` |
| `httpMethod` + `path` | `{ httpMethod: "PATCH", path: "/api/profile" }` |
| nested `request` | `{ request: { method: "GET", path: "/api/health" } }` |

---

### Errors and complex objects

Errors, circular references, functions, and bigints are serialized safely.

```ts
try {
  await processPayment(order);
} catch (err) {
  trace.error("Payment processing failed", {
    error: err,
    orderId: order.id,
    attempt: 2,
  });
}
```

---

## Results

### Groups view — timeline by trace ID

Logs grouped by trace with a visual timeline, relative timing, and endpoint badges.

<p align="center">
  <img src="./public/example/1.png" alt="traceboard Groups view showing timeline traces for EMAIL_QUEUE and CHECKOUT" width="800" />
</p>

### Flat view — chronological log stream

A single chronological list with trace IDs, source file locations, and filterable log levels.

<p align="center">
  <img src="./public/example/2.png" alt="traceboard Flat view showing chronological logs with filters and search" width="800" />
</p>

### Detail drawer — click any log to inspect

Click a log to see the API endpoint, trace ID, source location, and full JSON payload.

<p align="center">
  <img src="./public/example/3.png" alt="traceboard detail drawer showing API endpoint, trace ID, source, and JSON data" width="800" />
</p>

---

## Configuration

| Variable | Default | Description |
|---|---|---|
| `TRACEBOARD_PORT` | `4287` | Port the dashboard server listens on |
| `TRACEBOARD_HOST` | `http://localhost` | Host the SDK connects to |

Change the dashboard port:

```bash
TRACEBOARD_PORT=5000 npx traceboard
```

Point your app at a custom host/port:

```bash
TRACEBOARD_PORT=5000 TRACEBOARD_HOST=http://localhost node server.js
```

### Log entry shape

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

---

## Contributing

Contributions are welcome.

### 1. Fork and clone

```bash
git clone https://github.com/<your-username>/traceboard.git
cd traceboard
npm install
cd dashboard && npm install && cd ..
```

### 2. Create a branch

```bash
git checkout -b feat/your-feature
```

### 3. Make your changes

- **Server / SDK** — `src/`
- **Dashboard UI** — `dashboard/src/`

### 4. Build and verify

```bash
npm run build
```

For dashboard UI development with hot reload:

```bash
npm run dev:dashboard   # Terminal 1 — Vite on :5173
npm run dev             # Terminal 2 — server on :4287
```

### 5. Open a pull request

1. Push your branch to your fork
2. Open a PR against `main` on [iabdullahshahid/traceboard](https://github.com/iabdullahshahid/traceboard)
3. Describe what changed and why
4. Ensure CI passes

### Guidelines

- Keep changes focused — one feature or fix per PR
- Match existing code style and naming conventions
- Do not commit `.env` files or `node_modules/`
- Update the README if you add user-facing features

### Reporting issues

[Open an issue](https://github.com/iabdullahshahid/traceboard/issues) with steps to reproduce or a clear description of the proposed change.

---

## License

MIT
