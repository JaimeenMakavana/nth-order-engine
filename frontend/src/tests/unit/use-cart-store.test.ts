import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useCartStore } from "@/store/use-cart-store";
import type { Product } from "@/types/ecommerce";

describe("useCartStore", () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    const store = useCartStore.getState();
    store.clearCart();
    store.setProducts([]);
  });

  describe("addItem", () => {
    it("should add a new item to empty cart", () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addItem("product-1", 2);
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0]).toEqual({
        productId: "product-1",
        quantity: 2,
      });
    });

    it("should increment quantity when adding existing product", () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addItem("product-1", 2);
        result.current.addItem("product-1", 3);
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].quantity).toBe(5);
    });

    it("should add multiple different products", () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addItem("product-1", 1);
        result.current.addItem("product-2", 2);
        result.current.addItem("product-3", 3);
      });

      expect(result.current.items).toHaveLength(3);
    });
  });

  describe("removeItem", () => {
    it("should remove item from cart", () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addItem("product-1", 1);
        result.current.addItem("product-2", 2);
        result.current.removeItem("product-1");
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].productId).toBe("product-2");
    });

    it("should handle removing non-existent item", () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addItem("product-1", 1);
        result.current.removeItem("non-existent");
      });

      expect(result.current.items).toHaveLength(1);
    });
  });

  describe("updateQuantity", () => {
    it("should update item quantity", () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addItem("product-1", 2);
        result.current.updateQuantity("product-1", 5);
      });

      expect(result.current.items[0].quantity).toBe(5);
    });

    it("should remove item when quantity is set to 0", () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addItem("product-1", 2);
        result.current.updateQuantity("product-1", 0);
      });

      expect(result.current.items).toHaveLength(0);
    });

    it("should remove item when quantity is negative", () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addItem("product-1", 2);
        result.current.updateQuantity("product-1", -1);
      });

      expect(result.current.items).toHaveLength(0);
    });
  });

  describe("clearCart", () => {
    it("should remove all items from cart", () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addItem("product-1", 1);
        result.current.addItem("product-2", 2);
        result.current.addItem("product-3", 3);
        result.current.clearCart();
      });

      expect(result.current.items).toHaveLength(0);
    });
  });

  describe("setItems", () => {
    it("should replace all items with new items", () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addItem("product-1", 1);
        result.current.setItems([
          { productId: "product-2", quantity: 5 },
          { productId: "product-3", quantity: 3 },
        ]);
      });

      expect(result.current.items).toHaveLength(2);
      expect(result.current.items[0].productId).toBe("product-2");
      expect(result.current.items[1].productId).toBe("product-3");
    });
  });

  describe("setProducts", () => {
    it("should set products cache", () => {
      const { result } = renderHook(() => useCartStore());
      const mockProducts: Product[] = [
        {
          id: "product-1",
          name: "Test Product",
          price: 10.99,
        },
      ];

      act(() => {
        result.current.setProducts(mockProducts);
      });

      expect(result.current.products).toEqual(mockProducts);
    });
  });

  describe("getItemCount", () => {
    it("should return total quantity of all items", () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addItem("product-1", 2);
        result.current.addItem("product-2", 3);
        result.current.addItem("product-3", 1);
      });

      expect(result.current.getItemCount()).toBe(6);
    });

    it("should return 0 for empty cart", () => {
      const { result } = renderHook(() => useCartStore());

      expect(result.current.getItemCount()).toBe(0);
    });
  });
});

