import Fastify from "fastify";
import { config } from "./config.js";
import { errorHandler } from "./middleware/error.handler.js";
import { logger } from "./middleware/logger.js";
import { checkoutRoutes } from "./controllers/checkout.controller.js";
import { adminRoutes } from "./controllers/admin.controller.js";

/**
 * Bootstrap the Fastify server
 */
async function buildApp(options?: { logger?: boolean }) {
  const app = Fastify({
    logger: options?.logger ?? true, // Enable Fastify's built-in logger by default
  });

  // Set schema error formatter to return 400 for validation errors
  app.setSchemaErrorFormatter((errors, dataVar) => {
    return new Error(
      `Validation error: ${errors.map((e) => e.message).join(", ")}`
    ) as any;
  });

  // Register global error handler
  app.setErrorHandler(errorHandler);

  // Register request logger middleware (only if logger is enabled)
  if (options?.logger !== false) {
    app.addHook("onRequest", logger);
  }

  // Health check endpoint
  app.get("/health", async (request, reply) => {
    return { status: "ok", timestamp: new Date().toISOString() };
  });

  // Register routes
  await app.register(checkoutRoutes);
  await app.register(adminRoutes);
  // TODO: Register other routes
  // app.register(cartRoutes);

  return app;
}

/**
 * Start the server
 */
async function start() {
  try {
    const app = await buildApp();

    await app.listen({
      port: config.PORT,
      host: "0.0.0.0",
    });

    console.log(`🚀 Server running on http://localhost:${config.PORT}`);
    console.log(`📊 Configuration: DISCOUNT_N=${config.DISCOUNT_N}`);
    console.log(
      `🎁 Reward Weights: COMMON=${config.REWARD_WEIGHTS.COMMON}%, RARE=${config.REWARD_WEIGHTS.RARE}%, LEGENDARY=${config.REWARD_WEIGHTS.LEGENDARY}%`
    );
  } catch (err) {
    console.error("Error starting server:", err);
    process.exit(1);
  }
}

// Start the server
start();

export { buildApp };
