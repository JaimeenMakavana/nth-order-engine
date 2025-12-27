"use client";

import { useProducts, useAddCartItem } from "@/hooks/use-cart-actions";
import { useCartStore } from "@/store/use-cart-store";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CartModal } from "@/components/features/cart/cart-modal";
import { ProductCard } from "@/components/features/cart/product-card";
import { ProductCardSkeleton } from "@/components/features/cart/product-card-skeleton";

export default function ShopPage() {
  const { data: products, isLoading } = useProducts();
  const addCartItemMutation = useAddCartItem();
  const [cartOpen, setCartOpen] = useState(false);
  const router = useRouter();
  const itemCount = useCartStore((state) =>
    state.items.reduce((sum, item) => sum + item.quantity, 0)
  );

  const handleAddToCart = (productId: string) => {
    addCartItemMutation.mutate({ productId, quantity: 1 });
  };

  const handleCartClose = () => {
    setCartOpen(false);
    router.push("/checkout");
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">Products</h1>
        <Button
          variant="outline"
          onClick={() => setCartOpen(true)}
          className="relative w-full sm:w-auto"
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <ProductCardSkeleton key={index} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {products?.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={handleAddToCart}
              isAdding={addCartItemMutation.isPending}
              index={index}
            />
          ))}
        </div>
      )}

      <CartModal isOpen={cartOpen} onClose={handleCartClose} />
    </div>
  );
}
