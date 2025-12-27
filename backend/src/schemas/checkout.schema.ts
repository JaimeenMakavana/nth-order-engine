import { z } from "zod";

/**
 * Zod schema for cart item validation
 */
export const cartItemSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  quantity: z.number().int().positive("Quantity must be a positive integer"),
});

/**
 * Zod schema for checkout request validation
 */
export const checkoutSchema = z.object({
  items: z
    .array(cartItemSchema)
    .min(1, "At least one item is required in the cart"),
  discountCode: z.string().optional(),
});

/**
 * Type inference from checkout schema
 */
export type CheckoutRequest = z.infer<typeof checkoutSchema>;

