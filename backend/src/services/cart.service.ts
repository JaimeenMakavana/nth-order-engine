import type { CartItem } from "../types/index.js";
import { store } from "../repository/store.repository.js";

/**
 * Cart service result
 */
export interface CartResult {
  items: CartItem[];
  subtotal: number;
}

/**
 * Cart Service - Business logic for cart management
 * Handles cart operations independently from checkout
 */
export class CartService {
  /**
   * Get current cart with subtotal
   * @returns CartResult with items and calculated subtotal
   */
  getCart(): CartResult {
    const items = store.getCart();
    const subtotal = this.calculateSubtotal(items);

    return {
      items,
      subtotal,
    };
  }

  /**
   * Add item to cart
   * If item already exists, increments quantity
   * @param productId - Product ID to add
   * @param quantity - Quantity to add
   * @throws Error if product doesn't exist
   */
  addItem(productId: string, quantity: number): CartResult {
    // Validate product exists
    const product = store.getProductById(productId);
    if (!product) {
      throw new Error(`Product with ID ${productId} not found`);
    }

    // Add to cart (will increment if exists)
    store.addToCart(productId, quantity);

    // Return updated cart
    return this.getCart();
  }

  /**
   * Clear the cart
   */
  clearCart(): void {
    store.clearCart();
  }

  /**
   * Calculate subtotal from cart items
   * Looks up product prices from the store
   * @param items - Cart items
   * @returns Total subtotal amount
   */
  private calculateSubtotal(items: CartItem[]): number {
    let subtotal = 0;

    for (const item of items) {
      const product = store.getProductById(item.productId);
      if (product) {
        subtotal += product.price * item.quantity;
      }
    }

    return subtotal;
  }
}

// Export singleton instance
export const cartService = new CartService();


