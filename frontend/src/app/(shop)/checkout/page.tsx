"use client";

import { useEffect } from "react";
import { CheckoutForm } from "@/components/features/checkout/checkout-form";
import { useCartStore } from "@/store/use-cart-store";
import { useProducts } from "@/hooks/use-cart-actions";
import { ShoppingBag } from "lucide-react";

export default function CheckoutPage() {
  const items = useCartStore((state) => state.items);
  const { data: products } = useProducts();
  const setProducts = useCartStore((state) => state.setProducts);

  // Update products cache in useEffect to avoid render-time state updates
  useEffect(() => {
    if (products && products.length > 0) {
      setProducts(products);
    }
  }, [products, setProducts]);

  const cartItems = items
    .map((item) => {
      const product = products?.find((p) => p.id === item.productId);
      return product ? { ...item, product } : null;
    })
    .filter((item) => item !== null);

  const subtotal = cartItems.reduce(
    (sum, item) => sum + (item?.product?.price || 0) * item.quantity,
    0
  );

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">
          Checkout
        </h1>

        {items.length === 0 ? (
          <div className="text-center py-8 sm:py-12 border border-borders rounded-lg bg-grid-surface">
            <ShoppingBag className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Your cart is empty</p>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            <div className="border border-borders rounded-lg p-4 sm:p-6 bg-grid-surface">
              <h2 className="text-base sm:text-lg font-semibold mb-4">
                Order Summary
              </h2>
              <div className="space-y-3">
                {cartItems.map((item) => (
                  <div
                    key={item.productId}
                    className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 py-2 border-b border-borders last:border-0"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-sm sm:text-base">
                        {item.product?.name}
                      </p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {item.quantity} × ${item.product?.price.toFixed(2)}
                      </p>
                    </div>
                    <p className="font-semibold text-sm sm:text-base">
                      ${((item.product?.price || 0) * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-borders">
                <div className="flex justify-between items-center">
                  <span className="text-base sm:text-lg font-semibold">
                    Total
                  </span>
                  <span className="text-xl sm:text-2xl font-bold text-primary-accent">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="border border-borders rounded-lg p-4 sm:p-6 bg-grid-surface">
              <h2 className="text-base sm:text-lg font-semibold mb-4">
                Payment Details
              </h2>
              <CheckoutForm />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
