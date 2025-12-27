import { describe, it, expect, beforeEach, vi } from "vitest";
import { apiClient } from "@/lib/api-client";

// Mock fetch globally
global.fetch = vi.fn();

describe("ApiClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getProducts", () => {
    it("should fetch products successfully", async () => {
      const mockProducts = {
        products: [
          { id: "1", name: "Product 1", price: 10 },
          { id: "2", name: "Product 2", price: 20 },
        ],
      };

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockProducts,
      });

      const result = await apiClient.getProducts();

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/products"),
        expect.objectContaining({
          headers: expect.objectContaining({
            "Content-Type": "application/json",
          }),
        })
      );
      expect(result).toEqual(mockProducts);
    });

    it("should handle API errors", async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
        json: async () => ({ message: "Server error" }),
      });

      await expect(apiClient.getProducts()).rejects.toThrow("Server error");
    });

    it("should handle network errors", async () => {
      (fetch as any).mockRejectedValueOnce(new Error("Network error"));

      await expect(apiClient.getProducts()).rejects.toThrow("Network error");
    });
  });

  describe("getCart", () => {
    it("should fetch cart successfully", async () => {
      const mockCart = {
        items: [{ productId: "1", quantity: 2 }],
        subtotal: 20,
      };

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockCart,
      });

      const result = await apiClient.getCart();

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/cart"),
        expect.any(Object)
      );
      expect(result).toEqual(mockCart);
    });
  });

  describe("addCartItem", () => {
    it("should add item to cart with POST request", async () => {
      const mockCart = {
        items: [{ productId: "1", quantity: 2 }],
        subtotal: 20,
      };

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockCart,
      });

      const result = await apiClient.addCartItem("product-1", 2);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/cart/items"),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ productId: "product-1", quantity: 2 }),
        })
      );
      expect(result).toEqual(mockCart);
    });
  });

  describe("clearCart", () => {
    it("should clear cart with DELETE request", async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => undefined,
      });

      await apiClient.clearCart();

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/cart"),
        expect.objectContaining({
          method: "DELETE",
        })
      );
    });
  });

  describe("checkout", () => {
    it("should submit checkout with POST request", async () => {
      const checkoutData = {
        items: [{ productId: "1", quantity: 1 }],
        discountCode: "SAVE10",
      };

      const mockResponse = {
        order: {
          finalAmount: 10,
          discountApplied: 2,
        },
        reward: null,
      };

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await apiClient.checkout(checkoutData);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/checkout"),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify(checkoutData),
        })
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe("getStats", () => {
    it("should fetch stats successfully", async () => {
      const mockStats = {
        discountCodes: [
          { code: "SAVE10", isUsed: false },
          { code: "SAVE20", isUsed: true },
        ],
      };

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockStats,
      });

      const result = await apiClient.getStats();

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/admin/stats"),
        expect.any(Object)
      );
      expect(result).toEqual(mockStats);
    });
  });

  describe("generateCoupon", () => {
    it("should generate coupon with POST request", async () => {
      const mockResponse = {
        message: "Coupon generated successfully",
      };

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await apiClient.generateCoupon();

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/admin/generate-coupon"),
        expect.objectContaining({
          method: "POST",
        })
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe("Error Handling", () => {
    it("should handle JSON parse errors gracefully", async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
        json: async () => {
          throw new Error("Invalid JSON");
        },
      });

      await expect(apiClient.getProducts()).rejects.toThrow();
    });

    it("should use default error message when error response has no message", async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
        json: async () => ({}),
      });

      await expect(apiClient.getProducts()).rejects.toThrow(
        "Request failed"
      );
    });
  });
});

