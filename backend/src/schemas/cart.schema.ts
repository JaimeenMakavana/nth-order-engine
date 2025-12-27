import { z } from "zod";

/**
 * Zod schema for adding item to cart
 */
export const addCartItemSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  quantity: z.number().int().positive("Quantity must be a positive integer"),
});

/**
 * Type inference from add cart item schema
 */
export type AddCartItemRequest = z.infer<typeof addCartItemSchema>;


