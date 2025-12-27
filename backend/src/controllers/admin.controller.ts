import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { store } from "../repository/store.repository.js";
import { generateVariableDiscount } from "../services/reward.service.js";
import { config } from "../config.js";
import type { Coupon } from "../types/index.js";

/**
 * Admin Controller
 * Handles admin endpoints for statistics and manual coupon generation
 */

/**
 * Stats response type
 */
interface StatsResponse {
  totalItemsPurchased: number;
  totalPurchaseAmount: number;
  totalDiscountAmount: number;
  discountCodes: Array<{
    code: string;
    discountPercent: number;
    tier: string;
    isUsed: boolean;
  }>;
}

/**
 * Generate coupon response type
 */
interface GenerateCouponResponse {
  success: boolean;
  message: string;
  coupon?: {
    code: string;
    discountPercent: number;
    tier: string;
  };
}

/**
 * Register admin routes with Fastify
 */
export async function adminRoutes(fastify: FastifyInstance) {
  /**
   * GET /api/admin/stats
   * Returns comprehensive statistics about purchases and discounts
   */
  fastify.get<{ Reply: StatsResponse }>(
    "/api/admin/stats",
    {
      schema: {
        response: {
          200: {
            type: "object",
            properties: {
              totalItemsPurchased: { type: "number" },
              totalPurchaseAmount: { type: "number" },
              totalDiscountAmount: { type: "number" },
              discountCodes: { type: "array" },
            },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const orders = store.getOrders();
        
        // Calculate total items purchased (sum of all quantities)
        let totalItemsPurchased = 0;
        for (const order of orders) {
          for (const item of order.items) {
            totalItemsPurchased += item.quantity;
          }
        }

        // Calculate total purchase amount (sum of finalAmount)
        const totalPurchaseAmount = orders.reduce(
          (sum, order) => sum + order.finalAmount,
          0
        );

        // Calculate total discount amount given (sum of discountApplied)
        const totalDiscountAmount = orders.reduce(
          (sum, order) => sum + order.discountApplied,
          0
        );

        // Get all discount codes
        const allCoupons = store.getAllCoupons();
        const discountCodes = allCoupons.map((coupon) => ({
          code: coupon.code,
          discountPercent: coupon.discountPercent,
          tier: coupon.tier,
          isUsed: coupon.isUsed,
        }));

        const response: StatsResponse = {
          totalItemsPurchased,
          totalPurchaseAmount,
          totalDiscountAmount,
          discountCodes,
        };

        return reply.status(200).send(response);
      } catch (error: any) {
        request.log.error(error);
        return reply.status(500).send({
          error: "Internal Server Error",
          message: "Failed to retrieve statistics",
        });
      }
    }
  );

  /**
   * POST /api/admin/generate-coupon
   * Manually trigger the N-logic check and return a coupon if condition is met
   */
  fastify.post<{ Reply: GenerateCouponResponse }>(
    "/api/admin/generate-coupon",
    {
      schema: {
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              message: { type: "string" },
              coupon: { type: "object" },
            },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        // N-Logic: Check if (current_order_count + 1) % DISCOUNT_N === 0
        const currentOrderCount = store.getOrders().length;
        const isNthOrder = (currentOrderCount + 1) % config.DISCOUNT_N === 0;

        if (!isNthOrder) {
          const nextNthOrder =
            Math.ceil((currentOrderCount + 1) / config.DISCOUNT_N) *
              config.DISCOUNT_N;
          const ordersNeeded = nextNthOrder - currentOrderCount;

          return reply.status(200).send({
            success: false,
            message: `N-logic condition not met. Need ${ordersNeeded} more order(s) before the next reward. Current order count: ${currentOrderCount}, N: ${config.DISCOUNT_N}`,
          });
        }

        // Condition met - generate reward coupon
        const reward = generateVariableDiscount();

        // Save the coupon to the store (marked as unused)
        const newCoupon: Coupon = {
          code: reward.code,
          discountPercent: reward.discountPercent,
          isUsed: false,
          tier: reward.tier,
        };
        store.addCoupon(newCoupon);

        const response: GenerateCouponResponse = {
          success: true,
          message: `Reward coupon generated! This is order #${currentOrderCount + 1}, which is a multiple of N=${config.DISCOUNT_N}.`,
          coupon: {
            code: reward.code,
            discountPercent: reward.discountPercent,
            tier: reward.tier,
          },
        };

        return reply.status(200).send(response);
      } catch (error: any) {
        request.log.error(error);
        return reply.status(500).send({
          error: "Internal Server Error",
          message: "Failed to generate coupon",
        });
      }
    }
  );
}

