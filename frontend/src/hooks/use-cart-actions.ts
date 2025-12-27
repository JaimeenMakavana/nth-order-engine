// Wrappers for TanStack Query mutations
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useCartStore } from "@/store/use-cart-store";
import { toast } from "sonner";

// Query keys
export const cartKeys = {
  all: ["cart"] as const,
  cart: () => [...cartKeys.all, "current"] as const,
};

export const productKeys = {
  all: ["products"] as const,
  products: () => [...productKeys.all, "list"] as const,
};

// Products query
export function useProducts() {
  return useQuery({
    queryKey: productKeys.products(),
    queryFn: () => apiClient.getProducts(),
    select: (data) => data.products,
  });
}

// Cart query
export function useCart() {
  return useQuery({
    queryKey: cartKeys.cart(),
    queryFn: () => apiClient.getCart(),
  });
}

// Add item mutation
export function useAddCartItem() {
  const queryClient = useQueryClient();
  const addItem = useCartStore((state) => state.addItem);

  return useMutation({
    mutationFn: ({
      productId,
      quantity,
    }: {
      productId: string;
      quantity: number;
    }) => apiClient.addCartItem(productId, quantity),
    onSuccess: (data) => {
      queryClient.setQueryData(cartKeys.cart(), data);
      addItem(data.items[data.items.length - 1]?.productId || "", 0);
      toast.success("Item added to cart");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to add item");
    },
  });
}

// Clear cart mutation
export function useClearCart() {
  const queryClient = useQueryClient();
  const clearCart = useCartStore((state) => state.clearCart);

  return useMutation({
    mutationFn: () => apiClient.clearCart(),
    onSuccess: () => {
      queryClient.setQueryData(cartKeys.cart(), { items: [], subtotal: 0 });
      clearCart();
      toast.success("Cart cleared");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to clear cart");
    },
  });
}
