import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { checkoutSchema } from "../schemas/checkout.schema.js";
import { checkoutService } from "../services/checkout.service.js";

/**
 * Checkout Controller
 * Handles checkout requests and reward notifications
 */

/**
 * Request body type for checkout endpoint
 */
interface CheckoutRequestBody {
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  discountCode?: string;
}

/**
 * Response type for checkout endpoint
 */
interface CheckoutResponse {
  success: boolean;
  order: {
    id: string;
    items: Array<{
      productId: string;
      quantity: number;
    }>;
    totalAmount: number;
    discountApplied: number;
    finalAmount: number;
    timestamp: string;
  };
  reward?: {
    code: string;
    discountPercent: number;
    tier: string;
    message: string;
  };
}

/**
 * Register checkout routes with Fastify
 */
export async function checkoutRoutes(fastify: FastifyInstance) {
  /**
   * POST /api/checkout
   * Process checkout with cart items and optional discount code
   */
  fastify.post<{
    Body: CheckoutRequestBody;
    Reply: CheckoutResponse;
  }>(
    "/api/checkout",
    {
      schema: {
        body: {
          type: "object",
          required: ["items"],
          properties: {
            items: {
              type: "array",
              minItems: 1,
              items: {
                type: "object",
                required: ["productId", "quantity"],
                properties: {
                  productId: { type: "string" },
                  quantity: { type: "number", minimum: 1 },
                },
              },
            },
            discountCode: { type: "string" },
          },
        },
        response: {
          201: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              order: {
                type: "object",
                properties: {
                  id: { type: "string" },
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
                  totalAmount: { type: "number" },
                  discountApplied: { type: "number" },
                  finalAmount: { type: "number" },
                  timestamp: { type: "string" },
                },
              },
              reward: {
                type: "object",
                properties: {
                  code: { type: "string" },
                  discountPercent: { type: "number" },
                  tier: { type: "string" },
                  message: { type: "string" },
                },
              },
            },
          },
        },
      },
    },
    async (
      request: FastifyRequest<{ Body: CheckoutRequestBody }>,
      reply: FastifyReply
    ) => {
      try {
        // Validate request body using Zod schema
        const validatedData = checkoutSchema.parse(request.body);

        // Process checkout
        const result = await checkoutService.processCheckout(
          validatedData.items,
          validatedData.discountCode
        );

        // Build response
        const response: CheckoutResponse = {
          success: true,
          order: {
            id: result.order.id,
            items: result.order.items,
            totalAmount: result.order.totalAmount,
            discountApplied: result.discountApplied,
            finalAmount: result.finalAmount,
            timestamp:
              typeof result.order.timestamp === "string"
                ? result.order.timestamp
                : result.order.timestamp.toISOString(),
          },
        };

        // Include reward object if reward was triggered
        // This allows the frontend to trigger the "System Overclock" animation
        if (result.rewardCoupon) {
          const tierMessages: Record<string, string> = {
            COMMON: "Standard Reward Unlocked!",
            RARE: "System Overclock Activated!",
            LEGENDARY: "Critical Success Achieved!",
          };

          response.reward = {
            code: result.rewardCoupon.code,
            discountPercent: result.rewardCoupon.discountPercent,
            tier: result.rewardCoupon.tier,
            message:
              tierMessages[result.rewardCoupon.tier] || "Reward Unlocked!",
          };
        }

        // Return 201 Created status
        return reply.status(201).send(response);
      } catch (error: any) {
        // Handle validation errors
        if (error.name === "ZodError") {
          return reply.status(400).send({
            error: "Validation Error",
            message: "Invalid request data",
            details: error.errors,
          });
        }

        // Handle business logic errors (like invalid product, invalid coupon)
        if (error.message) {
          return reply.status(400).send({
            error: "Checkout Error",
            message: error.message,
          });
        }

        // Handle unexpected errors
        if (request.log) {
          request.log.error(error);
        }
        return reply.status(500).send({
          error: "Internal Server Error",
          message: "An unexpected error occurred during checkout",
        });
      }
    }
  );
}
