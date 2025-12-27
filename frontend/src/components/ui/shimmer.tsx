import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const shimmerVariants = cva(
  "relative overflow-hidden rounded-md bg-grid-surface",
  {
    variants: {
      variant: {
        default: "bg-grid-surface",
        card: "border border-borders rounded-lg p-6 bg-grid-surface",
        text: "bg-grid-surface",
      },
      size: {
        default: "h-4",
        sm: "h-3",
        lg: "h-6",
        xl: "h-8",
        card: "h-24",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ShimmerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof shimmerVariants> {
  width?: string;
}

const Shimmer = React.forwardRef<HTMLDivElement, ShimmerProps>(
  ({ className, variant, size, width, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(shimmerVariants({ variant, size }), className)}
        style={{ width }}
        {...props}
      >
        <div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-borders/50 to-transparent"
          style={{
            animation: "shimmer 2s infinite",
          }}
        />
      </div>
    );
  }
);
Shimmer.displayName = "Shimmer";

// Statistics Card Shimmer - for admin dashboard
export interface StatisticsShimmerProps
  extends React.HTMLAttributes<HTMLDivElement> {
  count?: number;
}

const StatisticsShimmer = React.forwardRef<
  HTMLDivElement,
  StatisticsShimmerProps
>(({ className, count = 3, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("grid grid-cols-1 md:grid-cols-3 gap-6 mb-8", className)}
      {...props}
    >
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="border border-borders rounded-lg p-6 bg-grid-surface relative overflow-hidden"
        >
          <Shimmer variant="text" size="sm" className="mb-2 w-32" />
          <Shimmer variant="text" size="xl" className="w-24" />
        </div>
      ))}
    </div>
  );
});
StatisticsShimmer.displayName = "StatisticsShimmer";

export { Shimmer, StatisticsShimmer, shimmerVariants };
