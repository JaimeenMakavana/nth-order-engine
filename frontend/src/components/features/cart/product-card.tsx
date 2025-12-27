"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import type { Product } from "@/types/ecommerce";

interface ProductCardProps {
  product: Product;
  onAddToCart: (productId: string) => void;
  isAdding?: boolean;
  index?: number;
}

// Placeholder image data URL (1x1 transparent PNG)
const PLACEHOLDER_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect fill='%23121212' width='400' height='300'/%3E%3Ctext fill='%23333333' font-family='sans-serif' font-size='18' x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle'%3EProduct Image%3C/text%3E%3C/svg%3E";

export function ProductCard({
  product,
  onAddToCart,
  isAdding = false,
  index = 0,
}: ProductCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="border border-borders rounded-lg p-6 bg-grid-surface hover:border-primary-accent/50 transition-colors flex flex-col"
    >
      {/* Product Image */}
      <div className="relative w-full h-48 mb-4 rounded-md overflow-hidden bg-background-main">
        <Image
          src={PLACEHOLDER_IMAGE}
          alt={product.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
        />
      </div>

      {/* Product Info */}
      <div className="flex-1 mb-4">
        <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
        <p className="text-2xl font-bold text-primary-accent">
          ${product.price.toFixed(2)}
        </p>
      </div>

      {/* Add to Cart Button */}
      <Button
        className="w-full"
        onClick={() => onAddToCart(product.id)}
        disabled={isAdding}
      >
        <Plus className="h-4 w-4 mr-2" />
        {isAdding ? "Adding..." : "Add to Cart"}
      </Button>
    </motion.div>
  );
}
