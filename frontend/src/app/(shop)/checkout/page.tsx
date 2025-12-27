"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckoutForm } from "@/components/features/checkout/checkout-form";
import { useCartStore } from "@/store/use-cart-store";
import { useProducts } from "@/hooks/use-cart-actions";
import { Button } from "@/components/ui/button";

export default function CheckoutPage() {
  const router = useRouter();
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
          <div className="flex flex-col items-center justify-center py-12 sm:py-16 px-4 border border-borders rounded-lg bg-grid-surface">
            {/* Shopping Basket Illustration */}
            <div className="relative mb-6 sm:mb-8">
              <svg
                width="120"
                height="120"
                viewBox="0 0 120 120"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="mx-auto"
              >
                {/* Sparkles */}
                <path
                  d="M25 20 L27 16 L29 20 L33 18 L29 22 L33 26 L27 24 L25 28 L23 24 L17 26 L21 22 L17 18 L23 20 Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="text-foreground"
                />
                <path
                  d="M95 25 L96.5 22.5 L98 25 L100.5 23.5 L98 26.5 L100.5 29 L96.5 27.5 L95 30 L93.5 27.5 L89.5 29 L92 26.5 L89.5 23.5 Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="text-foreground"
                />
                <path
                  d="M105 15 L106 13.5 L107 15 L108.5 14 L107 16 L108.5 17.5 L106 16.5 L105 18 L104 16.5 L101.5 17.5 L103 16 L101.5 14 Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="text-foreground"
                />

                {/* Basket Body - Primary Accent Green */}
                <path
                  d="M30 50 L30 85 Q30 90 35 90 L85 90 Q90 90 90 85 L90 50 L30 50 Z"
                  fill="#00ff41"
                  stroke="#00ff41"
                  strokeWidth="2"
                />

                {/* Basket Weave Lines */}
                <line
                  x1="35"
                  y1="55"
                  x2="35"
                  y2="85"
                  stroke="#050505"
                  strokeWidth="2"
                  opacity="0.6"
                />
                <line
                  x1="45"
                  y1="55"
                  x2="45"
                  y2="85"
                  stroke="#050505"
                  strokeWidth="2"
                  opacity="0.6"
                />
                <line
                  x1="55"
                  y1="55"
                  x2="55"
                  y2="85"
                  stroke="#050505"
                  strokeWidth="2"
                  opacity="0.6"
                />
                <line
                  x1="65"
                  y1="55"
                  x2="65"
                  y2="85"
                  stroke="#050505"
                  strokeWidth="2"
                  opacity="0.6"
                />
                <line
                  x1="75"
                  y1="55"
                  x2="75"
                  y2="85"
                  stroke="#050505"
                  strokeWidth="2"
                  opacity="0.6"
                />
                <line
                  x1="85"
                  y1="55"
                  x2="85"
                  y2="85"
                  stroke="#050505"
                  strokeWidth="2"
                  opacity="0.6"
                />

                {/* Basket Rim - Secondary Accent */}
                <path
                  d="M25 50 Q25 45 30 45 L90 45 Q95 45 95 50"
                  fill="#ffb000"
                  stroke="#ffb000"
                  strokeWidth="3"
                />

                {/* Left Handle */}
                <path
                  d="M35 45 Q25 35 25 25 Q25 15 35 15"
                  fill="none"
                  stroke="#00ff41"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <circle cx="25" cy="25" r="2" fill="#8b5cf6" />

                {/* Right Handle */}
                <path
                  d="M85 45 Q95 35 95 25 Q95 15 85 15"
                  fill="none"
                  stroke="#00ff41"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <circle cx="95" cy="25" r="2" fill="#8b5cf6" />

                {/* Badge with "0" */}
                <circle
                  cx="95"
                  cy="20"
                  r="12"
                  fill="#050505"
                  stroke="#00ff41"
                  strokeWidth="2"
                />
                <text
                  x="95"
                  y="25"
                  textAnchor="middle"
                  fill="#00ff41"
                  fontSize="14"
                  fontWeight="bold"
                  fontFamily="Arial, sans-serif"
                >
                  0
                </text>
              </svg>
            </div>

            {/* Text Content */}
            <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 text-foreground">
              Nothing is in your bag.
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 max-w-md">
              There's nothing in your bag. Add items to continue.
            </p>

            {/* Add Items Button */}
            <Button
              onClick={() => router.push("/")}
              className="bg-primary-accent hover:bg-primary-accent/90 text-background-main font-bold px-6 sm:px-8 py-2 sm:py-3 rounded-lg text-sm sm:text-base transition-colors"
            >
              Add items
            </Button>
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
