"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/use-cart-store";
import { useProducts } from "@/hooks/use-cart-actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Minus, Trash2 } from "lucide-react";
import type { CartItemWithProduct } from "@/types/ecommerce";

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartModal({ isOpen, onClose }: CartModalProps) {
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const { data: products } = useProducts();
  const setProducts = useCartStore((state) => state.setProducts);

  // Update products cache in useEffect to avoid render-time state updates
  useEffect(() => {
    if (products && products.length > 0) {
      setProducts(products);
    }
  }, [products, setProducts]);

  const cartItems: CartItemWithProduct[] = items
    .map((item) => {
      const product = products?.find((p) => p.id === item.productId);
      return product ? { ...item, product } : null;
    })
    .filter((item): item is CartItemWithProduct => item !== null);

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] sm:max-h-[80vh] flex flex-col w-[95vw] sm:w-full">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">
            Shopping Cart
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-3 sm:space-y-4 min-h-0">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 sm:py-16 px-4">
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
                onClick={() => {
                  onClose();
                  router.push("/");
                }}
                className="bg-primary-accent hover:bg-primary-accent/90 text-background-main font-bold px-6 sm:px-8 py-2 sm:py-3 rounded-lg text-sm sm:text-base transition-colors"
              >
                Add items
              </Button>
            </div>
          ) : (
            cartItems.map((item) => (
              <div
                key={item.productId}
                className="flex flex-col sm:flex-row gap-3 sm:gap-4 p-3 sm:p-4 border border-borders rounded-md"
              >
                <div className="flex-1">
                  <h3 className="font-medium text-sm sm:text-base">
                    {item.product.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    ${item.product.price.toFixed(2)} each
                  </p>
                  <p className="text-sm sm:text-base font-semibold text-primary-accent mt-1">
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </p>
                </div>
                <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7 sm:h-8 sm:w-8"
                      onClick={() =>
                        updateQuantity(item.productId, item.quantity - 1)
                      }
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-6 sm:w-8 text-center text-sm sm:text-base">
                      {item.quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7 sm:h-8 sm:w-8"
                      onClick={() =>
                        updateQuantity(item.productId, item.quantity + 1)
                      }
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 sm:h-8 sm:w-8 text-destructive"
                    onClick={() => removeItem(item.productId)}
                  >
                    <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="border-t border-borders pt-3 sm:pt-4 space-y-3 sm:space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm sm:text-base text-muted-foreground">
                Subtotal
              </span>
              <span className="text-base sm:text-lg font-semibold text-primary-accent">
                ${subtotal.toFixed(2)}
              </span>
            </div>
            <Button className="w-full text-sm sm:text-base" onClick={onClose}>
              Proceed to Checkout
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
