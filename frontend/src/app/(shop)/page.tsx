"use client";

import { useProducts, useAddCartItem } from "@/hooks/use-cart-actions";
import { useCartStore } from "@/store/use-cart-store";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Plus } from "lucide-react";
import { useState } from "react";
import { CartDrawer } from "@/components/features/cart/cart-drawer";
import { motion } from "framer-motion";

export default function ShopPage() {
  const { data: products, isLoading } = useProducts();
  const addCartItemMutation = useAddCartItem();
  const [cartOpen, setCartOpen] = useState(false);
  const itemCount = useCartStore((state) => 
    state.items.reduce((sum, item) => sum + item.quantity, 0)
  );

  const handleAddToCart = (productId: string) => {
    addCartItemMutation.mutate({ productId, quantity: 1 });
  };

  return (
    <div className="min-h-screen p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Products</h1>
        <Button
          variant="outline"
          onClick={() => setCartOpen(true)}
          className="relative"
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          Cart
          {itemCount > 0 && (
            <span className="ml-2 bg-primary-accent text-background-main text-xs font-bold px-2 py-1 rounded-full">
              {itemCount}
            </span>
          )}
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">
          Loading products...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products?.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="border border-borders rounded-lg p-6 bg-grid-surface hover:border-primary-accent/50 transition-colors"
            >
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
                <p className="text-2xl font-bold text-primary-accent">
                  ${product.price.toFixed(2)}
                </p>
              </div>
              <Button
                className="w-full"
                onClick={() => handleAddToCart(product.id)}
                disabled={addCartItemMutation.isPending}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add to Cart
              </Button>
            </motion.div>
          ))}
        </div>
      )}

      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}
