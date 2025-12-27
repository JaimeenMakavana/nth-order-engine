import type { Order, Product, Coupon } from "../types/index.js";

/**
 * Thread-safe Singleton Repository for In-Memory Data Storage
 * Acts as the single source of truth for orders, products, and coupons
 */
class StoreRepository {
  private static instance: StoreRepository | null = null;

  private orders: Order[] = [];
  private products: Product[] = [];
  private coupons: Coupon[] = [];

  /**
   * Private constructor to prevent direct instantiation
   */
  private constructor() {
    // Singleton pattern: prevent external instantiation
  }

  /**
   * Get the singleton instance
   * Thread-safe: ensures only one instance exists
   */
  public static getInstance(): StoreRepository {
    if (!StoreRepository.instance) {
      StoreRepository.instance = new StoreRepository();
    }
    return StoreRepository.instance;
  }

  /**
   * Add a new order to the store
   */
  public addOrder(order: Order): void {
    this.orders.push(order);
  }

  /**
   * Get all orders
   */
  public getOrders(): Order[] {
    return [...this.orders]; // Return a copy to prevent external mutation
  }

  /**
   * Add a new coupon to the store
   */
  public addCoupon(coupon: Coupon): void {
    this.coupons.push(coupon);
  }

  /**
   * Get a valid (unused) coupon by code
   * Returns undefined if coupon doesn't exist or is already used
   */
  public getValidCoupon(code: string): Coupon | undefined {
    return this.coupons.find(
      (coupon) => coupon.code === code && !coupon.isUsed
    );
  }

  /**
   * Mark a coupon as used by its code
   * Returns true if coupon was found and marked, false otherwise
   */
  public markCouponAsUsed(code: string): boolean {
    const coupon = this.coupons.find((c) => c.code === code);
    if (coupon && !coupon.isUsed) {
      coupon.isUsed = true;
      return true;
    }
    return false;
  }

  /**
   * Get all products
   */
  public getProducts(): Product[] {
    return [...this.products]; // Return a copy to prevent external mutation
  }

  /**
   * Add a product to the store
   */
  public addProduct(product: Product): void {
    this.products.push(product);
  }

  /**
   * Get a product by ID
   */
  public getProductById(id: string): Product | undefined {
    return this.products.find((product) => product.id === id);
  }
}

// Export as a single instance
export const store = StoreRepository.getInstance();
