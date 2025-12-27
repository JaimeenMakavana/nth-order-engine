// TypeScript Definitions for E-commerce System
// Shared with backend types

export interface Product {
  id: string;
  name: string;
  price: number;
}

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface Order {
  id: string;
  items: CartItem[];
  totalAmount: number;
  discountApplied: number;
  finalAmount: number;
  timestamp: string | Date;
}

export type CouponTier = "COMMON" | "RARE" | "LEGENDARY";

export interface Coupon {
  code: string;
  discountPercent: number;
  isUsed: boolean;
  tier: CouponTier;
}

// API Response Types
export interface CartResponse {
  items: CartItem[];
  subtotal: number;
}

export interface ProductsResponse {
  products: Product[];
}

export interface CheckoutRequest {
  items: CartItem[];
  discountCode?: string;
}

export interface Reward {
  code: string;
  discountPercent: number;
  tier: CouponTier;
  message: string;
}

export interface CheckoutResponse {
  success: boolean;
  order: Order;
  reward?: Reward;
}

export interface StatsResponse {
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

export interface GenerateCouponResponse {
  success: boolean;
  message: string;
  coupon?: {
    code: string;
    discountPercent: number;
    tier: string;
  };
}

// Frontend-specific types
export interface CartItemWithProduct extends CartItem {
  product: Product;
}

export interface ExplorationState {
  visitedRoutes: Set<string>;
  decodedText: string;
  progress: number; // 0-7 for 7 routes
}
