const fs = require("fs");
const path = require("path");
const { trace } = require("../dist/index.js");

const envPath = path.join(__dirname, "..", ".env");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    if (!(key in process.env)) process.env[key] = val;
  }
}

const DELAY = parseInt(process.env.DEMO_DELAY_MS ?? "400", 10);
const LOOP = process.env.DEMO_LOOP === "true";

const wait = (ms = DELAY) => new Promise((resolve) => setTimeout(resolve, ms));

async function runAuthFlow() {
  const auth = trace.group("AUTH_FLOW");

  auth.info("OAuth redirect received", {
    provider: "google",
    state: "a8f3c2e1",
  });
  await wait();

  auth.info("Exchanging authorization code", {
    method: "POST",
    path: "/api/auth/token",
    grantType: "authorization_code",
  });
  await wait();

  auth.success("JWT issued", {
    method: "POST",
    path: "/api/auth/token",
    status: 200,
    expiresIn: 3600,
    userId: "usr_8k2m9x",
  });
  await wait();

  auth.warning("Refresh token expiring soon", {
    remaining: 300,
    userId: "usr_8k2m9x",
  });
  await wait();

  auth.success("Session established", { userId: "usr_8k2m9x", role: "admin" });
}

async function runUserApiFlow() {
  const api = trace.group("GET /api/users");

  api.info("Cache miss — fetching from database", { cacheKey: "users:list" });
  await wait();

  api.info("Query executed", {
    method: "GET",
    path: "/api/users",
    query: { page: 1, limit: 20 },
  });
  await wait();

  api.success("Users loaded", {
    method: "GET",
    path: "/api/users",
    status: 200,
    count: 20,
    durationMs: 142,
  });
}

async function runCheckoutFlow() {
  const checkout = trace.group("CHECKOUT");

  checkout.info("Cart validated", { items: 3, subtotal: 149.97 });
  await wait();

  checkout.info("Creating payment intent", {
    method: "POST",
    path: "/api/payments/intent",
    amount: 149.97,
    currency: "USD",
  });
  await wait();

  checkout.success("Payment authorized", {
    method: "POST",
    path: "/api/payments/intent",
    status: 200,
    paymentId: "pi_3Nx8k2m",
  });
  await wait();

  checkout.info("Placing order", {
    method: "POST",
    path: "/api/orders",
    paymentId: "pi_3Nx8k2m",
  });
  await wait();

  checkout.success("Order confirmed", {
    method: "POST",
    path: "/api/orders",
    status: 201,
    orderId: "ord_7p4q1w",
  });
}

async function runBackgroundJob() {
  const job = trace.group("EMAIL_QUEUE");

  job.info("Job picked up", { jobId: "job_92hf", type: "order_confirmation" });
  await wait();

  job.info("Rendering template", { template: "order-confirmation-v2" });
  await wait();

  job.error("SMTP connection failed", {
    method: "POST",
    path: "/api/internal/email/send",
    status: 503,
    retryIn: 30,
    error: { name: "Error", message: "Connection timeout after 5000ms" },
  });
  await wait();

  job.warning("Retry scheduled", { jobId: "job_92hf", attempt: 2, maxAttempts: 3 });
  await wait();

  job.success("Email delivered", {
    method: "POST",
    path: "/api/internal/email/send",
    status: 200,
    messageId: "msg_4k8j2n",
  });
}

async function runScenario() {
  trace.info("Application started", {
    env: "development",
    version: "0.1.0",
    port: 3000,
  });
  await wait();

  await runAuthFlow();
  await wait(200);

  await runUserApiFlow();
  await wait(200);

  await runCheckoutFlow();
  await wait(200);

  await runBackgroundJob();
  await wait();

  trace.success("Demo scenario complete", {
    traces: ["AUTH_FLOW", "GET /api/users", "CHECKOUT", "EMAIL_QUEUE"],
  });
}

async function main() {
  console.log("\n  traceboard demo — logs streaming to the dashboard\n");
  console.log(`  delay: ${DELAY}ms  |  loop: ${LOOP}\n`);

  do {
    await runScenario();
    if (LOOP) {
      await wait(1500);
      trace.info("Restarting demo loop…");
      await wait(800);
    }
  } while (LOOP);

  if (!LOOP) {
    console.log("  Done. Open http://localhost:4287 to view logs.\n");
  }
}

main().catch((err) => {
  console.error("Demo failed:", err);
  process.exit(1);
});
