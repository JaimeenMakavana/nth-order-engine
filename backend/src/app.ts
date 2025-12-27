import Fastify from "fastify";
import cors from "@fastify/cors";
import { config } from "./config.js";
import { errorHandler } from "./middleware/error.handler.js";
import { logger, responseLogger } from "./middleware/logger.js";
import { checkoutRoutes } from "./controllers/checkout.controller.js";
import { adminRoutes } from "./controllers/admin.controller.js";
import { cartRoutes } from "./routes/cart.routes.js";
import { store } from "./repository/store.repository.js";
import type { Product } from "./types/index.js";

/**
 * Seed initial products into the store
 * This ensures the API has products available for cart and checkout operations
 */
function seedProducts(): void {
  const initialProducts: Product[] = [
    { id: "prod-1", name: "Wireless Mouse", price: 29.99 },
    { id: "prod-2", name: "Mechanical Keyboard", price: 89.99 },
    { id: "prod-3", name: "USB-C Hub", price: 49.99 },
    { id: "prod-4", name: "Laptop Stand", price: 39.99 },
    { id: "prod-5", name: "Webcam HD", price: 79.99 },
    { id: "prod-6", name: "Wireless Headphones", price: 129.99 },
    { id: "prod-7", name: "Monitor Stand", price: 34.99 },
    { id: "prod-8", name: "Desk Mat", price: 24.99 },
  ];

  // Only seed if store is empty (prevents duplicate seeding in tests)
  if (store.getProducts().length === 0) {
    initialProducts.forEach((product) => store.addProduct(product));
    console.log(`📦 Seeded ${initialProducts.length} products into store`);
  }
}

/**
 * Bootstrap the Fastify server
 */
async function buildApp(options?: {
  logger?: boolean;
  seedProducts?: boolean;
}) {
  // Seed products on app initialization (skip during tests)
  if (options?.seedProducts !== false) {
    seedProducts();
  }
  const app = Fastify({
    logger: options?.logger ?? true, // Enable Fastify's built-in logger by default
  });

  // Register CORS plugin
  await app.register(cors, {
    origin: (
      origin: string | undefined,
      cb: (err: Error | null, allow: boolean) => void
    ) => {
      // Allow requests from localhost (any port) in development
      if (
        !origin ||
        origin.includes("localhost") ||
        origin.includes("127.0.0.1")
      ) {
        cb(null, true);
        return;
      }
      // In production, you can add specific allowed origins here
      cb(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  });

  // Configure content type parser to allow empty JSON bodies
  app.addContentTypeParser(
    "application/json",
    { parseAs: "string" },
    (_req, body, done) => {
      try {
        const json = body === "" ? {} : JSON.parse(body as string);
        done(null, json);
      } catch (err) {
        done(err as Error, undefined);
      }
    }
  );

  // Set schema error formatter to return 400 for validation errors
  app.setSchemaErrorFormatter((errors, _dataVar) => {
    return new Error(
      `Validation error: ${errors.map((e) => e.message).join(", ")}`
    ) as any;
  });

  // Register global error handler
  app.setErrorHandler(errorHandler);

  // Register request logger middleware (only if logger is enabled)
  if (options?.logger !== false) {
    app.addHook("onRequest", logger);
    app.addHook("onSend", responseLogger);
  }

  // Health check endpoint
  app.get("/health", async (_request, _reply) => {
    return { status: "ok", timestamp: new Date().toISOString() };
  });

  // Products endpoint - List all available products
  app.get(
    "/api/products",
    {
      schema: {
        response: {
          200: {
            type: "object",
            properties: {
              products: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    name: { type: "string" },
                    price: { type: "number" },
                  },
                },
              },
            },
          },
        },
      },
    },
    async (_request, reply) => {
      const products = store.getProducts();
      return reply.status(200).send({ products });
    }
  );

  // Register routes
  await app.register(checkoutRoutes);
  await app.register(adminRoutes);
  await app.register(cartRoutes);

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
