import type { CartItem, Order, Coupon } from "../types/index.js";
import { store } from "../repository/store.repository.js";
import { generateVariableDiscount } from "./reward.service.js";
import { config } from "../config.js";
import { randomUUID } from "crypto";

/**
 * Checkout processing result
 */
export interface CheckoutResult {
  order: Order;
  discountApplied: number;
  finalAmount: number;
  rewardCoupon?: {
    code: string;
    discountPercent: number;
    tier: string;
  };
}

/**
 * Checkout Service - Core business logic for order processing
 * Handles cart calculation, discount validation, and Nth-order reward system
 */
export class CheckoutService {
  /**
   * Process checkout with cart items and optional discount code
   *
   * @param cartItems - Array of cart items with productId and quantity
   * @param discountCode - Optional discount coupon code
   * @returns CheckoutResult with order details and optional reward coupon
   */
  async processCheckout(
    cartItems: CartItem[],
    discountCode?: string
  ): Promise<CheckoutResult> {
    // Calculate subtotal
    const subtotal = this.calculateSubtotal(cartItems);

    // Validate and apply discount if code provided
    let discountApplied = 0;
    let coupon: Coupon | undefined;

    if (discountCode) {
      coupon = store.getValidCoupon(discountCode);
      if (!coupon) {
        throw new Error("Invalid or already used discount code");
      }
      discountApplied = (subtotal * coupon.discountPercent) / 100;
      // Mark coupon as used
      store.markCouponAsUsed(discountCode);
    }

    const finalAmount = subtotal - discountApplied;

    // N-Logic: Check if this order qualifies for a reward
    // Formula: (current_order_count + 1) % DISCOUNT_N === 0
    const currentOrderCount = store.getOrders().length;
    const isNthOrder = (currentOrderCount + 1) % config.DISCOUNT_N === 0;

    let rewardCoupon: CheckoutResult["rewardCoupon"] | undefined;

    if (isNthOrder) {
      // Generate reward coupon using "Loot Box" logic
      const reward = generateVariableDiscount();

      // Save the coupon to the store (marked as unused)
      const newCoupon: Coupon = {
        code: reward.code,
        discountPercent: reward.discountPercent,
        isUsed: false,
        tier: reward.tier,
      };
      store.addCoupon(newCoupon);

      // Include reward in response for next purchase
      rewardCoupon = {
        code: reward.code,
        discountPercent: reward.discountPercent,
        tier: reward.tier,
      };
    }

    // Create the order
    const order: Order = {
      id: randomUUID(),
      items: cartItems,
      totalAmount: subtotal,
      discountApplied,
      finalAmount,
      timestamp: new Date().toISOString(),
    };

    // Save order to store
    store.addOrder(order);

    return {
      order,
      discountApplied,
      finalAmount,
      rewardCoupon,
    };
  }

  /**
   * Calculate subtotal from cart items
   * Looks up product prices from the store
   *
   * @param cartItems - Array of cart items
   * @returns Total subtotal amount
   * @throws Error if product not found
   */
  private calculateSubtotal(cartItems: CartItem[]): number {
    let subtotal = 0;

    for (const item of cartItems) {
      const product = store.getProductById(item.productId);
      if (!product) {
        throw new Error(`Product with ID ${item.productId} not found`);
      }
      subtotal += product.price * item.quantity;
    }

    return subtotal;
  }
}

// Export singleton instance
export const checkoutService = new CheckoutService();
