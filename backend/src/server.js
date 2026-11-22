import "dotenv/config";
import app from "./app.js";
import { pool, checkDatabaseConnection } from "./config/database.js";

const PORT = Number(process.env.PORT) || 3002;

async function startServer() {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error("JWT_SECRET must be configured with a strong secret of at least 32 characters");
  }
  if (!process.env.JWT_ISSUER || !process.env.JWT_AUDIENCE) {
    throw new Error("JWT_ISSUER and JWT_AUDIENCE must be configured");
  }

  await checkDatabaseConnection();
  console.log("PostgreSQL connected successfully");

  const server = app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });

  const shutdown = (signal) => {
    console.log(`${signal} received. Shutting down...`);
    server.close(async () => {
      await pool.end();
      process.exit(0);
    });
  };

  process.once("SIGINT", () => shutdown("SIGINT"));
  process.once("SIGTERM", () => shutdown("SIGTERM"));
}

startServer().catch(async (error) => {
  console.error("Application startup failed:", error);
  await pool.end();
  process.exit(1);
});
