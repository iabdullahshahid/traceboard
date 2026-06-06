const { trace } = require("../dist/index.js");

trace.info("Hello from traceboard", { version: "0.1.0" });
trace.success("Server connected");

const auth = trace.group("AUTH_FLOW");
auth.info("Initiate Auth", { provider: "oauth" });
auth.success("JWT Generated", { expiresIn: 3600 });
auth.warning("Token expiring soon", { remaining: 300 });
auth.error("Refresh failed", { code: "INVALID_TOKEN" });

trace.info("Test complete — check the dashboard");

setTimeout(() => process.exit(0), 1000);
