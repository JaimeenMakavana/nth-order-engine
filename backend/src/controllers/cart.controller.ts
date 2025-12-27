import type { FastifyRequest, FastifyReply } from "fastify";
import { addCartItemSchema } from "../schemas/cart.schema.js";
import { cartService } from "../services/cart.service.js";

/**
 * Cart Controller
 * Handles cart management requests
 */

/**
 * Request body type for adding item to cart
 */
interface AddCartItemRequestBody {
  productId: string;
  quantity: number;
}

/**
 * Response type for cart endpoints
 */
interface CartResponse {
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  subtotal: number;
}

/**
 * Get cart handler
 */
export async function getCart(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    const result = cartService.getCart();

    const response: CartResponse = {
      items: result.items,
      subtotal: result.subtotal,
    };

    return reply.status(200).send(response);
  } catch (error: any) {
    if (request.log) {
      request.log.error(error);
    }
    return reply.status(500).send({
      error: "Internal Server Error",
      message: "Failed to retrieve cart",
    });
  }
}

/**
 * Add item to cart handler
 */
export async function addCartItem(
  request: FastifyRequest<{ Body: AddCartItemRequestBody }>,
  reply: FastifyReply
): Promise<void> {
  try {
    // Validate request body using Zod schema
    const validatedData = addCartItemSchema.parse(request.body);

    // Add item to cart
    const result = cartService.addItem(
      validatedData.productId,
      validatedData.quantity
    );

    const response: CartResponse = {
      items: result.items,
      subtotal: result.subtotal,
    };

    return reply.status(200).send(response);
  } catch (error: any) {
    // Handle validation errors
    if (error.name === "ZodError") {
      return reply.status(400).send({
        error: "Validation Error",
        message: "Invalid request data",
        details: error.errors,
      });
    }

    // Handle business logic errors (like product not found)
    if (error.message) {
      if (error.message.includes("not found")) {
        return reply.status(404).send({
          error: "Not Found",
          message: error.message,
        });
      }
      return reply.status(400).send({
        error: "Cart Error",
        message: error.message,
      });
    }

    // Handle unexpected errors
    if (request.log) {
      request.log.error(error);
    }
    return reply.status(500).send({
      error: "Internal Server Error",
      message: "Failed to add item to cart",
    });
  }
}

/**
 * Clear cart handler
 */
export async function clearCart(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    cartService.clearCart();

    return reply.status(200).send({
      success: true,
      message: "Cart cleared successfully",
    });
  } catch (error: any) {
    if (request.log) {
      request.log.error(error);
    }
    return reply.status(500).send({
      error: "Internal Server Error",
      message: "Failed to clear cart",
    });
  }
}


