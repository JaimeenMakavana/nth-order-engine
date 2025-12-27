import type { FastifyInstance } from "fastify";
import { getCart, addCartItem, clearCart } from "../controllers/cart.controller.js";

/**
 * Register cart routes with Fastify
 */
export async function cartRoutes(fastify: FastifyInstance) {
  /**
   * GET /api/cart
   * Returns the current items in the cart and the subtotal
   */
  fastify.get("/api/cart", {
    schema: {
      response: {
        200: {
          type: "object",
          properties: {
            items: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  productId: { type: "string" },
                  quantity: { type: "number" },
                },
              },
            },
            subtotal: { type: "number" },
          },
        },
      },
    },
  }, getCart);

  /**
   * POST /api/cart/items
   * Adds a product to the cart
   * Expects productId and quantity in the body
   */
  fastify.post("/api/cart/items", {
    schema: {
      body: {
        type: "object",
        required: ["productId", "quantity"],
        properties: {
          productId: { type: "string" },
          quantity: { type: "number", minimum: 1 },
        },
      },
      response: {
        200: {
          type: "object",
          properties: {
            items: { type: "array" },
            subtotal: { type: "number" },
          },
        },
        400: {
          type: "object",
          properties: {
            error: { type: "string" },
            message: { type: "string" },
          },
        },
        404: {
          type: "object",
          properties: {
            error: { type: "string" },
            message: { type: "string" },
          },
        },
      },
    },
  }, addCartItem);

  /**
   * DELETE /api/cart
   * Clears the cart
   */
  fastify.delete("/api/cart", {
    schema: {
      response: {
        200: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            message: { type: "string" },
          },
        },
      },
    },
  }, clearCart);
}


