"use client";

import { useEffect } from "react";
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
            <div className="text-center py-8 text-muted-foreground">
              <p>Your cart is empty</p>
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
