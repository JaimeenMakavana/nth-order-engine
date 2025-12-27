"use client";

export function ProductCardSkeleton() {
  return (
    <div className="border border-borders rounded-lg p-6 bg-grid-surface animate-pulse">
      {/* Image Skeleton */}
      <div className="w-full h-48 mb-4 rounded-md bg-background-main/50" />

      {/* Content Skeleton */}
      <div className="flex-1 mb-4 space-y-3">
        {/* Title Skeleton */}
        <div className="h-5 bg-background-main/50 rounded w-3/4" />

        {/* Price Skeleton */}
        <div className="h-8 bg-background-main/50 rounded w-1/2" />
      </div>

      {/* Button Skeleton */}
      <div className="h-10 bg-background-main/50 rounded w-full" />
    </div>
  );
}
