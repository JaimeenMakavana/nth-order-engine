"use client";

import { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useCartStore } from "@/store/use-cart-store";
import { useRewardReveal } from "@/hooks/use-reward-reveal";
import { cartKeys, couponKeys } from "@/hooks/use-cart-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { CheckoutRequest } from "@/lib/validators/checkout.schema";

export function CheckoutForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { items } = useCartStore();
  const { reveal } = useRewardReveal();
  const [discountCode, setDiscountCode] = useState("");
  const setItems = useCartStore((state) => state.setItems);

  // Fetch stats to get available coupons
  const { data: stats } = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: () => apiClient.getStats(),
  });

  // Auto-apply the first available (unused) coupon
  useEffect(() => {
    if (stats?.discountCodes && discountCode === "") {
      const availableCoupon = stats.discountCodes.find((code) => !code.isUsed);
      if (availableCoupon) {
        setDiscountCode(availableCoupon.code);
      }
    }
  }, [stats, discountCode]);

  const checkoutMutation = useMutation({
    mutationFn: (data: CheckoutRequest) => apiClient.checkout(data),
    onSuccess: async (data) => {
      // Build user-friendly success message
      const orderAmount = `$${data.order.finalAmount.toFixed(2)}`;
      const discountAmount =
        data.order.discountApplied > 0
          ? ` (Saved $${data.order.discountApplied.toFixed(2)})`
          : "";

      // Show primary success toast
      toast.success(
        <div className="space-y-1">
          <div className="font-semibold">🎉 Order Confirmed!</div>
          <div className="text-sm opacity-90">
            Total: <span className="font-medium">{orderAmount}</span>
            {discountAmount && (
              <span className="text-primary-accent ml-1">{discountAmount}</span>
            )}
          </div>
          {data.reward && (
            <div className="text-sm text-premium-glow font-medium mt-1">
              🎁 {data.reward.message}
            </div>
          )}
        </div>,
        {
          duration: 5000,
        }
      );

      // Show reward if available
      if (data.reward) {
        reveal(data.reward);
      }

      // Clear cart in frontend store
      setItems([]);

      // Sync with backend - fetch empty cart to ensure consistency
      try {
        const emptyCart = await apiClient.getCart();
        queryClient.setQueryData(cartKeys.cart(), emptyCart);
        setItems(emptyCart.items);
      } catch (error) {
        // If fetch fails, still clear local state
        queryClient.setQueryData(cartKeys.cart(), { items: [], subtotal: 0 });
      }

      // Invalidate coupon message query to refresh the reward status
      queryClient.invalidateQueries({ queryKey: couponKeys.message() });

      // Invalidate admin and stats queries to refresh statistics
      queryClient.invalidateQueries({ queryKey: ["admin"] });

      // Redirect to home
      setTimeout(() => {
        router.push("/");
      }, 2000);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Checkout failed. Please try again.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    checkoutMutation.mutate({
      items,
      discountCode: discountCode || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">
          Discount Code (Optional)
        </label>
        <Input
          value={discountCode}
          onChange={(e) => setDiscountCode(e.target.value)}
          placeholder="Enter discount code"
          className="w-full"
        />
      </div>

      <div className="border-t border-borders pt-4">
        <div className="flex justify-between items-center mb-4">
          <span className="text-xs sm:text-sm text-muted-foreground">
            Items in cart:
          </span>
          <span className="font-semibold text-sm sm:text-base">
            {items.length}
          </span>
        </div>
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={checkoutMutation.isPending || items.length === 0}
      >
        {checkoutMutation.isPending ? "Processing..." : "Complete Order"}
      </Button>
    </form>
  );
}
