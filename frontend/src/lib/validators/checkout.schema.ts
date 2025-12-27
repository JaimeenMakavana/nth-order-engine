// Zod schemas for frontend validation
import { z } from "zod";

export const cartItemSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  quantity: z.number().int().positive("Quantity must be a positive integer"),
});

export const checkoutSchema = z.object({
  items: z
    .array(cartItemSchema)
    .min(1, "At least one item is required in the cart"),
  discountCode: z.string().optional(),
});

export type CheckoutRequest = z.infer<typeof checkoutSchema>;

