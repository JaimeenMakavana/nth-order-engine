import Fastify from "fastify";
import { config } from "./config.js";
import { errorHandler } from "./middleware/error.handler.js";
import { logger } from "./middleware/logger.js";

/**
 * Bootstrap the Fastify server
 */
async function buildApp() {
  const app = Fastify({
    logger: true, // Enable Fastify's built-in logger
  });

  // Register global error handler
  app.setErrorHandler(errorHandler);

  // Register request logger middleware
  app.addHook("onRequest", logger);

  // Health check endpoint
  app.get("/health", async (request, reply) => {
    return { status: "ok", timestamp: new Date().toISOString() };
  });

  // TODO: Register routes
  // app.register(cartRoutes, { prefix: "/api/cart" });
  // app.register(checkoutRoutes, { prefix: "/api/checkout" });
  // app.register(adminRoutes, { prefix: "/api/admin" });

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
