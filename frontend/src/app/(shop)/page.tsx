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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <ProductCardSkeleton key={index} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
