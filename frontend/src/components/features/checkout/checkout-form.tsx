"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useCartStore } from "@/store/use-cart-store";
import { useRewardReveal } from "@/hooks/use-reward-reveal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { CheckoutRequest } from "@/lib/validators/checkout.schema";

export function CheckoutForm() {
  const router = useRouter();
  const { items } = useCartStore();
  const { reveal } = useRewardReveal();
  const [discountCode, setDiscountCode] = useState("");

  const checkoutMutation = useMutation({
    mutationFn: (data: CheckoutRequest) => apiClient.checkout(data),
    onSuccess: (data) => {
      toast.success("Order placed successfully!");
      
      // Show reward if available
      if (data.reward) {
        reveal(data.reward);
      }
      
      // Clear cart
      useCartStore.getState().clearCart();
      
      // Redirect to home
      setTimeout(() => {
        router.push("/");
      }, 2000);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Checkout failed");
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">
          Discount Code (Optional)
        </label>
        <Input
          value={discountCode}
          onChange={(e) => setDiscountCode(e.target.value)}
          placeholder="Enter discount code"
        />
      </div>

      <div className="border-t border-borders pt-4">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-muted-foreground">Items in cart:</span>
          <span className="font-semibold">{items.length}</span>
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

