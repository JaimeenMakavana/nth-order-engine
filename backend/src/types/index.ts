// E-commerce System Type Definitions

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
  timestamp: Date | string;
}

export type CouponTier = "COMMON" | "RARE" | "LEGENDARY";

export interface Coupon {
  code: string;
  discountPercent: number;
  isUsed: boolean;
  tier: CouponTier;
}
