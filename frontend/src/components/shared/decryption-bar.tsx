"use client";

import { useState } from "react";
import { Menu, X, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/providers/sidebar-provider";
import { useCartStore } from "@/store/use-cart-store";
import { CartModal } from "@/components/features/cart/cart-modal";

export function DecryptionBar() {
  const { isOpen, toggle } = useSidebar();
  const [cartOpen, setCartOpen] = useState(false);
  const itemCount = useCartStore((state) =>
    state.items.reduce((sum, item) => sum + item.quantity, 0)
  );

  const handleCartClose = () => {
    setCartOpen(false);
  };

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 h-14 sm:h-16 border-b border-borders bg-grid-surface/95 backdrop-blur-sm">
        <div className="container mx-auto px-3 sm:px-4 py-2 h-full">
          <div className="flex items-center justify-between h-full">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                className="lg:hidden h-8 w-8 sm:h-9 sm:w-9"
                onClick={toggle}
              >
                {isOpen ? (
                  <X className="h-4 w-4 sm:h-5 sm:w-5" />
                ) : (
                  <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
                )}
              </Button>
              <div className="text-sm sm:text-base font-semibold">UniBlox</div>
            </div>
            <Button
              variant="outline"
              onClick={() => setCartOpen(true)}
              className="relative h-8 sm:h-9"
            >
              <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              <span className="hidden sm:inline">Cart</span>
              {itemCount > 0 && (
                <span className="ml-2 bg-primary-accent text-background-main text-xs font-bold px-2 py-1 rounded-full">
                  {itemCount}
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>
      <CartModal isOpen={cartOpen} onClose={handleCartClose} />
    </>
  );
}
