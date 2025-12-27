// API client configuration with TanStack Query
import type {
  CartResponse,
  ProductsResponse,
  CheckoutRequest,
  CheckoutResponse,
  StatsResponse,
  GenerateCouponResponse,
} from "@/types/ecommerce";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        error: "Unknown error",
        message: `HTTP ${response.status}: ${response.statusText}`,
      }));
      throw new Error(error.message || error.error || "Request failed");
    }

    return response.json();
  }

  // Products
  async getProducts(): Promise<ProductsResponse> {
    return this.request<ProductsResponse>("/api/products");
  }

  // Cart
  async getCart(): Promise<CartResponse> {
    return this.request<CartResponse>("/api/cart");
  }

  async addCartItem(
    productId: string,
    quantity: number
  ): Promise<CartResponse> {
    return this.request<CartResponse>("/api/cart/items", {
      method: "POST",
      body: JSON.stringify({ productId, quantity }),
    });
  }

  async clearCart(): Promise<void> {
    return this.request<void>("/api/cart", {
      method: "DELETE",
    });
  }

  // Checkout
  async checkout(data: CheckoutRequest): Promise<CheckoutResponse> {
    return this.request<CheckoutResponse>("/api/checkout", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Statistics & Coupons
  async getStats(): Promise<StatsResponse> {
    return this.request<StatsResponse>("/api/admin/stats");
  }

  async generateCoupon(): Promise<GenerateCouponResponse> {
    return this.request<GenerateCouponResponse>("/api/admin/generate-coupon", {
      method: "POST",
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
