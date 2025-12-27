import { describe, it, expect, beforeEach } from "vitest";
import { buildApp } from "../app.js";
import { store } from "../repository/store.repository.js";
import { checkoutService } from "../services/checkout.service.js";
import { generateVariableDiscount } from "../services/reward.service.js";
import type { Product, CartItem } from "../types/index.js";

/**
 * Robustness Test Suite
 * Tests security, input validation, accuracy, and probability distribution
 */

describe("Robustness Tests", () => {
  beforeEach(() => {
    // Reset store before each test
    store.reset();
  });

  describe("Coupon Security", () => {
    it("should invalidate a coupon code immediately after one successful checkout", async () => {
      // Arrange: Create a product and coupon
      const product: Product = {
        id: "prod-1",
        name: "Test Product",
        price: 100,
      };
      store.addProduct(product);

      const couponCode = "SECURE10";
      store.addCoupon({
        code: couponCode,
        discountPercent: 10,
        isUsed: false,
        tier: "COMMON",
      });

      // Verify coupon is valid initially
      const initialCoupon = store.getValidCoupon(couponCode);
      expect(initialCoupon).toBeDefined();
      expect(initialCoupon?.isUsed).toBe(false);

      // Act: Use the coupon in a checkout
      const cartItems: CartItem[] = [{ productId: "prod-1", quantity: 1 }];
      await checkoutService.processCheckout(cartItems, couponCode);

      // Assert: Coupon should be invalid after use
      const usedCoupon = store.getValidCoupon(couponCode);
      expect(usedCoupon).toBeUndefined(); // Should not find valid coupon

      // Verify the coupon exists but is marked as used
      const allCoupons = store.getAllCoupons();
      const coupon = allCoupons.find((c) => c.code === couponCode);
      expect(coupon).toBeDefined();
      expect(coupon?.isUsed).toBe(true);

      // Assert: Attempting to use the same coupon again should fail
      await expect(
        checkoutService.processCheckout(cartItems, couponCode)
      ).rejects.toThrow("Invalid or already used discount code");
    });

    it("should prevent double-spending of the same coupon", async () => {
      // Arrange
      const product: Product = {
        id: "prod-1",
        name: "Test Product",
        price: 100,
      };
      store.addProduct(product);

      const couponCode = "DOUBLE10";
      store.addCoupon({
        code: couponCode,
        discountPercent: 10,
        isUsed: false,
        tier: "COMMON",
      });

      const cartItems: CartItem[] = [{ productId: "prod-1", quantity: 1 }];

      // Act: Use coupon first time
      const firstCheckout = await checkoutService.processCheckout(
        cartItems,
        couponCode
      );
      expect(firstCheckout.discountApplied).toBe(10);

      // Assert: Second attempt should fail
      await expect(
        checkoutService.processCheckout(cartItems, couponCode)
      ).rejects.toThrow("Invalid or already used discount code");
    });
  });

  describe("Input Integrity", () => {
    it("should return 400 error when given an empty cart", async () => {
      const app = await buildApp({ logger: false });

      const response = await app.inject({
        method: "POST",
        url: "/api/checkout",
        payload: {
          items: [],
        },
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.error || body.message).toBeDefined();
      
      await app.close();
    });

    it("should return 400 error when cart items array is missing", async () => {
      const app = await buildApp({ logger: false });

      const response = await app.inject({
        method: "POST",
        url: "/api/checkout",
        payload: {},
      });

      expect(response.statusCode).toBe(400);
      
      await app.close();
    });

    it("should return 400 error when given invalid product IDs", async () => {
      const app = await buildApp({ logger: false });

      // Add a valid product
      const validProduct: Product = {
        id: "valid-prod",
        name: "Valid Product",
        price: 100,
      };
      store.addProduct(validProduct);

      // Try to checkout with invalid product ID
      const response = await app.inject({
        method: "POST",
        url: "/api/checkout",
        payload: {
          items: [
            { productId: "invalid-prod-id", quantity: 1 },
          ],
        },
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.message || body.error).toBeDefined();
      if (body.message) {
        expect(body.message).toContain("not found");
      }
      
      await app.close();
    });

    it("should return 400 error when quantity is invalid (zero or negative)", async () => {
      const app = await buildApp({ logger: false });

      const product: Product = {
        id: "prod-1",
        name: "Test Product",
        price: 100,
      };
      store.addProduct(product);

      // Test with zero quantity
      const responseZero = await app.inject({
        method: "POST",
        url: "/api/checkout",
        payload: {
          items: [{ productId: "prod-1", quantity: 0 }],
        },
      });
      expect(responseZero.statusCode).toBe(400);

      // Test with negative quantity
      const responseNegative = await app.inject({
        method: "POST",
        url: "/api/checkout",
        payload: {
          items: [{ productId: "prod-1", quantity: -1 }],
        },
      });
      expect(responseNegative.statusCode).toBe(400);
      
      await app.close();
    });

    it("should return 400 error when productId is missing", async () => {
      const app = await buildApp({ logger: false });

      const response = await app.inject({
        method: "POST",
        url: "/api/checkout",
        payload: {
          items: [{ quantity: 1 }],
        },
      });

      expect(response.statusCode).toBe(400);
      
      await app.close();
    });
  });

  describe("Admin Accuracy", () => {
    it("should correctly sum up total discounts after multiple varied orders", async () => {
      // Arrange: Create multiple products
      const products: Product[] = [
        { id: "prod-1", name: "Product 1", price: 100 },
        { id: "prod-2", name: "Product 2", price: 50 },
        { id: "prod-3", name: "Product 3", price: 200 },
      ];
      products.forEach((p) => store.addProduct(p));

      // Create coupons with different discount percentages
      const coupons = [
        { code: "COUPON10", discountPercent: 10, isUsed: false, tier: "COMMON" as const },
        { code: "COUPON15", discountPercent: 15, isUsed: false, tier: "RARE" as const },
        { code: "COUPON20", discountPercent: 20, isUsed: false, tier: "LEGENDARY" as const },
      ];
      coupons.forEach((c) => store.addCoupon(c));

      // Act: Create multiple varied orders with different discounts
      const orders = [
        {
          items: [{ productId: "prod-1", quantity: 2 }] as CartItem[], // 200 total
          coupon: "COUPON10", // 20 discount
        },
        {
          items: [{ productId: "prod-2", quantity: 3 }] as CartItem[], // 150 total
          coupon: "COUPON15", // 22.5 discount
        },
        {
          items: [{ productId: "prod-3", quantity: 1 }] as CartItem[], // 200 total
          coupon: "COUPON20", // 40 discount
        },
        {
          items: [{ productId: "prod-1", quantity: 1 }] as CartItem[], // 100 total, no coupon
        },
      ];

      let expectedTotalDiscount = 0;
      let expectedTotalPurchase = 0;
      let expectedTotalItems = 0;

      for (const order of orders) {
        const result = await checkoutService.processCheckout(
          order.items,
          order.coupon
        );
        expectedTotalDiscount += result.discountApplied;
        expectedTotalPurchase += result.finalAmount;
        expectedTotalItems += order.items.reduce(
          (sum, item) => sum + item.quantity,
          0
        );
      }

      // Get admin stats
      const app = await buildApp({ logger: false });
      const response = await app.inject({
        method: "GET",
        url: "/api/admin/stats",
      });

      expect(response.statusCode).toBe(200);
      const stats = JSON.parse(response.body);

      // Assert: Verify all calculations are correct
      expect(stats.totalItemsPurchased).toBe(expectedTotalItems);
      expect(stats.totalPurchaseAmount).toBe(expectedTotalPurchase);
      expect(stats.totalDiscountAmount).toBe(expectedTotalDiscount);

      // Verify the math: totalPurchaseAmount should equal sum of finalAmounts
      // totalDiscountAmount should equal sum of discountApplied
      const ordersFromStore = store.getOrders();
      const calculatedTotalPurchase = ordersFromStore.reduce(
        (sum, order) => sum + order.finalAmount,
        0
      );
      const calculatedTotalDiscount = ordersFromStore.reduce(
        (sum, order) => sum + order.discountApplied,
        0
      );

      expect(stats.totalPurchaseAmount).toBe(calculatedTotalPurchase);
      expect(stats.totalDiscountAmount).toBe(calculatedTotalDiscount);
      
      await app.close();
    });

    it("should correctly calculate total items purchased across all orders", async () => {
      // Arrange
      const product: Product = {
        id: "prod-1",
        name: "Test Product",
        price: 100,
      };
      store.addProduct(product);

      // Act: Create orders with different quantities
      await checkoutService.processCheckout([
        { productId: "prod-1", quantity: 2 },
      ]);
      await checkoutService.processCheckout([
        { productId: "prod-1", quantity: 5 },
      ]);
      await checkoutService.processCheckout([
        { productId: "prod-1", quantity: 3 },
      ]);

      // Get stats
      const app = await buildApp({ logger: false });
      const response = await app.inject({
        method: "GET",
        url: "/api/admin/stats",
      });

      const stats = JSON.parse(response.body);

      // Assert: Total items should be 2 + 5 + 3 = 10
      expect(stats.totalItemsPurchased).toBe(10);
      
      await app.close();
    });
  });

  describe("Probability Audit", () => {
    it("should verify 90/8/2 distribution with 1000 iterations and log results", () => {
      const iterations = 1000;
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

      // Log the distribution
      console.log("\n=== Probability Distribution Audit ===");
      console.log(`Total iterations: ${iterations}`);
      console.log(`COMMON:   ${tierCounts.COMMON} (${commonPercent.toFixed(2)}%) - Expected: 90%`);
      console.log(`RARE:     ${tierCounts.RARE} (${rarePercent.toFixed(2)}%) - Expected: 8%`);
      console.log(`LEGENDARY: ${tierCounts.LEGENDARY} (${legendaryPercent.toFixed(2)}%) - Expected: 2%`);
      console.log("========================================\n");

      // Assert: Verify distribution is within acceptable tolerance
      // COMMON: 90% ± 5%
      expect(commonPercent).toBeGreaterThanOrEqual(85);
      expect(commonPercent).toBeLessThanOrEqual(95);

      // RARE: 8% ± 3%
      expect(rarePercent).toBeGreaterThanOrEqual(5);
      expect(rarePercent).toBeLessThanOrEqual(12);

      // LEGENDARY: 2% ± 2%
      expect(legendaryPercent).toBeGreaterThanOrEqual(0);
      expect(legendaryPercent).toBeLessThanOrEqual(5);

      // Verify all rewards sum to 100%
      expect(
        tierCounts.COMMON + tierCounts.RARE + tierCounts.LEGENDARY
      ).toBe(iterations);
      expect(commonPercent + rarePercent + legendaryPercent).toBeCloseTo(100, 1);
    });

    it("should maintain consistent distribution across multiple runs", () => {
      const iterations = 500;
      const runs = 5;
      const distributions: Array<{
        common: number;
        rare: number;
        legendary: number;
      }> = [];

      // Act: Run multiple distribution tests
      for (let run = 0; run < runs; run++) {
        const tierCounts: Record<string, number> = {
          COMMON: 0,
          RARE: 0,
          LEGENDARY: 0,
        };

        for (let i = 0; i < iterations; i++) {
          const reward = generateVariableDiscount();
          tierCounts[reward.tier]++;
        }

        distributions.push({
          common: (tierCounts.COMMON / iterations) * 100,
          rare: (tierCounts.RARE / iterations) * 100,
          legendary: (tierCounts.LEGENDARY / iterations) * 100,
        });
      }

      // Calculate average distribution across runs
      const avgCommon =
        distributions.reduce((sum, d) => sum + d.common, 0) / runs;
      const avgRare = distributions.reduce((sum, d) => sum + d.rare, 0) / runs;
      const avgLegendary =
        distributions.reduce((sum, d) => sum + d.legendary, 0) / runs;

      console.log("\n=== Multi-Run Distribution Consistency ===");
      console.log(`Runs: ${runs}, Iterations per run: ${iterations}`);
      console.log(`Average COMMON:   ${avgCommon.toFixed(2)}% (Expected: 90%)`);
      console.log(`Average RARE:     ${avgRare.toFixed(2)}% (Expected: 8%)`);
      console.log(`Average LEGENDARY: ${avgLegendary.toFixed(2)}% (Expected: 2%)`);
      console.log("==========================================\n");

      // Assert: Average should be close to expected values
      expect(avgCommon).toBeGreaterThan(85);
      expect(avgCommon).toBeLessThan(95);
      expect(avgRare).toBeGreaterThan(5);
      expect(avgRare).toBeLessThan(12);
      expect(avgLegendary).toBeGreaterThan(0);
      expect(avgLegendary).toBeLessThan(5);
    });
  });
});

