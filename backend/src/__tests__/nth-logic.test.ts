import { describe, it, expect, beforeEach } from "vitest";
import { CheckoutService } from "../services/checkout.service.js";
import { generateVariableDiscount } from "../services/reward.service.js";
import { store } from "../repository/store.repository.js";
import { config } from "../config.js";
import type { Order, Product, CartItem } from "../types/index.js";

/**
 * Helper function to reset the store for testing
 */
function resetStore() {
  store.reset();
}

/**
 * Helper function to create mock products
 */
function createMockProduct(id: string, price: number): Product {
  return {
    id,
    name: `Product ${id}`,
    price,
  };
}

/**
 * Helper function to create mock orders
 */
function createMockOrder(orderNumber: number): Order {
  return {
    id: `order-${orderNumber}`,
    items: [{ productId: "prod-1", quantity: 1 }],
    totalAmount: 100,
    discountApplied: 0,
    finalAmount: 100,
    timestamp: new Date().toISOString(),
  };
}

describe("Nth Order Logic Tests", () => {
  let checkoutService: CheckoutService;

  beforeEach(() => {
    // Reset store before each test
    resetStore();
    checkoutService = new CheckoutService();

    // Add a mock product for testing
    const product = createMockProduct("prod-1", 100);
    store.addProduct(product);
  });

  describe("4th Order Reward Generation", () => {
    it("should generate a reward coupon when 3 orders exist and 4th order is placed", async () => {
      // Arrange: Create 3 existing orders
      const order1 = createMockOrder(1);
      const order2 = createMockOrder(2);
      const order3 = createMockOrder(3);

      store.addOrder(order1);
      store.addOrder(order2);
      store.addOrder(order3);

      // Verify we have 3 orders
      expect(store.getOrders().length).toBe(3);

      // Act: Process the 4th checkout
      const cartItems: CartItem[] = [
        { productId: "prod-1", quantity: 1 },
      ];
      const result = await checkoutService.processCheckout(cartItems);

      // Assert: 4th order should trigger reward
      expect(result.rewardCoupon).toBeDefined();
      expect(result.rewardCoupon?.code).toBeDefined();
      expect(result.rewardCoupon?.discountPercent).toBeGreaterThan(0);
      expect(result.rewardCoupon?.tier).toBeDefined();
      expect(["COMMON", "RARE", "LEGENDARY"]).toContain(
        result.rewardCoupon?.tier
      );

      // Verify the coupon was saved to the store
      const allCoupons = store.getAllCoupons();
      expect(allCoupons.length).toBeGreaterThan(0);
      const savedCoupon = allCoupons.find(
        (c) => c.code === result.rewardCoupon?.code
      );
      expect(savedCoupon).toBeDefined();
      expect(savedCoupon?.isUsed).toBe(false);
    });

    it("should NOT generate a reward coupon when order count is not a multiple of N", async () => {
      // Arrange: Create 2 existing orders (not a multiple of 4)
      const order1 = createMockOrder(1);
      const order2 = createMockOrder(2);

      store.addOrder(order1);
      store.addOrder(order2);

      // Act: Process the 3rd checkout (not the 4th)
      const cartItems: CartItem[] = [
        { productId: "prod-1", quantity: 1 },
      ];
      const result = await checkoutService.processCheckout(cartItems);

      // Assert: 3rd order should NOT trigger reward
      expect(result.rewardCoupon).toBeUndefined();
    });

    it("should generate rewards at every Nth order (4th, 8th, 12th, etc.)", async () => {
      const cartItems: CartItem[] = [{ productId: "prod-1", quantity: 1 }];

      // Test 4th order
      for (let i = 0; i < 3; i++) {
        await checkoutService.processCheckout(cartItems);
      }
      const result4th = await checkoutService.processCheckout(cartItems);
      expect(result4th.rewardCoupon).toBeDefined();

      // Test 8th order
      for (let i = 0; i < 3; i++) {
        await checkoutService.processCheckout(cartItems);
      }
      const result8th = await checkoutService.processCheckout(cartItems);
      expect(result8th.rewardCoupon).toBeDefined();

      // Verify we have 8 orders
      expect(store.getOrders().length).toBe(8);
    });
  });

  describe("Coupon Application in Checkout", () => {
    it("should correctly apply coupon discount to total amount", async () => {
      // Arrange: Create a coupon with 10% discount
      const couponCode = "TEST10";
      store.addCoupon({
        code: couponCode,
        discountPercent: 10,
        isUsed: false,
        tier: "COMMON",
      });

      const cartItems: CartItem[] = [
        { productId: "prod-1", quantity: 2 }, // 2 * 100 = 200
      ];

      // Act: Process checkout with discount code
      const result = await checkoutService.processCheckout(
        cartItems,
        couponCode
      );

      // Assert: Discount should be applied correctly
      expect(result.order.totalAmount).toBe(200); // Subtotal
      expect(result.discountApplied).toBe(20); // 10% of 200
      expect(result.finalAmount).toBe(180); // 200 - 20

      // Verify coupon is marked as used
      const coupon = store.getValidCoupon(couponCode);
      expect(coupon).toBeUndefined(); // Should not find it (it's used)
    });

    it("should calculate final amount correctly with multiple items and discount", async () => {
      // Arrange: Add more products
      store.addProduct(createMockProduct("prod-2", 50));
      store.addProduct(createMockProduct("prod-3", 25));

      const couponCode = "SAVE15";
      store.addCoupon({
        code: couponCode,
        discountPercent: 15,
        isUsed: false,
        tier: "RARE",
      });

      const cartItems: CartItem[] = [
        { productId: "prod-1", quantity: 1 }, // 100
        { productId: "prod-2", quantity: 2 }, // 50 * 2 = 100
        { productId: "prod-3", quantity: 4 }, // 25 * 4 = 100
      ];
      // Total: 300

      // Act
      const result = await checkoutService.processCheckout(
        cartItems,
        couponCode
      );

      // Assert
      expect(result.order.totalAmount).toBe(300);
      expect(result.discountApplied).toBe(45); // 15% of 300
      expect(result.finalAmount).toBe(255); // 300 - 45
    });

    it("should throw error when invalid coupon code is provided", async () => {
      const cartItems: CartItem[] = [
        { productId: "prod-1", quantity: 1 },
      ];

      // Act & Assert
      await expect(
        checkoutService.processCheckout(cartItems, "INVALID")
      ).rejects.toThrow("Invalid or already used discount code");
    });
  });

  describe("Probability Distribution Tests", () => {
    it("should generate LEGENDARY tier roughly 2% of the time (within tolerance)", () => {
      const iterations = 1000; // Use 1000 for better statistical accuracy
      const tierCounts: Record<string, number> = {
        COMMON: 0,
        RARE: 0,
        LEGENDARY: 0,
      };

      // Act: Generate many rewards
      for (let i = 0; i < iterations; i++) {
        const reward = generateVariableDiscount();
        tierCounts[reward.tier]++;
      }

      // Calculate percentages
      const commonPercent = (tierCounts.COMMON / iterations) * 100;
      const rarePercent = (tierCounts.RARE / iterations) * 100;
      const legendaryPercent = (tierCounts.LEGENDARY / iterations) * 100;

      // Assert: LEGENDARY should be around 2% (config value)
      // Allow tolerance of ±2% for statistical variance
      expect(legendaryPercent).toBeGreaterThanOrEqual(0);
      expect(legendaryPercent).toBeLessThanOrEqual(5); // Max 5% tolerance

      // Assert: COMMON should be around 90%
      expect(commonPercent).toBeGreaterThan(85); // At least 85%
      expect(commonPercent).toBeLessThan(95); // At most 95%

      // Assert: RARE should be around 8%
      expect(rarePercent).toBeGreaterThan(5); // At least 5%
      expect(rarePercent).toBeLessThan(12); // At most 12%

      // Verify all rewards were generated
      expect(
        tierCounts.COMMON + tierCounts.RARE + tierCounts.LEGENDARY
      ).toBe(iterations);
    });

    it("should generate rewards with correct discount percentages for each tier", () => {
      const iterations = 100;
      const tierDiscounts: Record<string, number[]> = {
        COMMON: [],
        RARE: [],
        LEGENDARY: [],
      };

      // Act: Generate rewards and collect discount percentages
      for (let i = 0; i < iterations; i++) {
        const reward = generateVariableDiscount();
        tierDiscounts[reward.tier].push(reward.discountPercent);
      }

      // Assert: Each tier should have the correct discount percentage
      tierDiscounts.COMMON.forEach((discount) => {
        expect(discount).toBe(10);
      });

      tierDiscounts.RARE.forEach((discount) => {
        expect(discount).toBe(15);
      });

      tierDiscounts.LEGENDARY.forEach((discount) => {
        expect(discount).toBe(25);
      });
    });

    it("should generate unique coupon codes", () => {
      const iterations = 100;
      const codes = new Set<string>();

      // Act: Generate rewards
      for (let i = 0; i < iterations; i++) {
        const reward = generateVariableDiscount();
        codes.add(reward.code);
      }

      // Assert: All codes should be unique (or at least 95% unique to account for collisions)
      // With 8-character alphanumeric codes, collisions are extremely rare
      expect(codes.size).toBeGreaterThan(iterations * 0.95);
    });
  });

  describe("N-Logic Formula Verification", () => {
    it("should correctly identify Nth orders using the formula (count + 1) % N === 0", () => {
      // Test various order counts
      const testCases = [
        { orderCount: 3, shouldTrigger: true }, // 4th order
        { orderCount: 7, shouldTrigger: true }, // 8th order
        { orderCount: 11, shouldTrigger: true }, // 12th order
        { orderCount: 0, shouldTrigger: false }, // 1st order
        { orderCount: 1, shouldTrigger: false }, // 2nd order
        { orderCount: 2, shouldTrigger: false }, // 3rd order
        { orderCount: 4, shouldTrigger: false }, // 5th order
      ];

      testCases.forEach(({ orderCount, shouldTrigger }) => {
        const isNthOrder =
          (orderCount + 1) % config.DISCOUNT_N === 0;
        expect(isNthOrder).toBe(shouldTrigger);
      });
    });
  });
});

