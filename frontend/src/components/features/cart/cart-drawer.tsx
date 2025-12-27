"use client";

import { useEffect } from "react";
import { useCartStore } from "@/store/use-cart-store";
import { useProducts } from "@/hooks/use-cart-actions";
import { Button } from "@/components/ui/button";
import { X, Plus, Minus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CartItemWithProduct } from "@/types/ecommerce";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div
        className="flex-1 bg-background-main/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="w-96 bg-grid-surface border-l border-borders shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-borders">
          <h2 className="text-lg font-semibold">Shopping Cart</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cartItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Your cart is empty</p>
            </div>
          ) : (
            cartItems.map((item) => (
              <div
                key={item.productId}
                className="flex gap-4 p-4 border border-borders rounded-md"
              >
                <div className="flex-1">
                  <h3 className="font-medium">{item.product.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    ${item.product.price.toFixed(2)} each
                  </p>
                  <p className="text-sm font-semibold text-primary-accent mt-1">
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => removeItem(item.productId)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="p-4 border-t border-borders space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Subtotal</span>
              <span className="text-lg font-semibold text-primary-accent">
                ${subtotal.toFixed(2)}
              </span>
            </div>
            <Button className="w-full" onClick={onClose}>
              Proceed to Checkout
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

