"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { StatisticsShimmer } from "@/components/ui/shimmer";
import { BarChart3, Gift } from "lucide-react";
import { toast } from "sonner";

export default function StatsPage() {
  const queryClient = useQueryClient();

  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: () => apiClient.getStats(),
  });

  const generateCouponMutation = useMutation({
    mutationFn: () => apiClient.generateCoupon(),
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to generate coupon");
    },
  });

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8" />
            Statistics
          </h1>
          <Button
            onClick={() => generateCouponMutation.mutate()}
            disabled={generateCouponMutation.isPending}
            className="w-full sm:w-auto"
          >
            <Gift className="h-4 w-4 mr-2" />
            {generateCouponMutation.isPending
              ? "Generating..."
              : "Generate Coupon"}
          </Button>
        </div>

        {isLoading ? (
          <StatisticsShimmer />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="border border-borders rounded-lg p-4 sm:p-6 bg-grid-surface">
              <h3 className="text-xs sm:text-sm text-muted-foreground mb-2">
                Total Items Purchased
              </h3>
              <p className="text-2xl sm:text-3xl font-bold text-primary-accent">
                {stats?.totalItemsPurchased || 0}
              </p>
            </div>
            <div className="border border-borders rounded-lg p-4 sm:p-6 bg-grid-surface">
              <h3 className="text-xs sm:text-sm text-muted-foreground mb-2">
                Total Purchase Amount
              </h3>
              <p className="text-2xl sm:text-3xl font-bold text-secondary-accent">
                ${(stats?.totalPurchaseAmount || 0).toFixed(2)}
              </p>
            </div>
            <div className="border border-borders rounded-lg p-4 sm:p-6 bg-grid-surface sm:col-span-2 md:col-span-1">
              <h3 className="text-xs sm:text-sm text-muted-foreground mb-2">
                Total Discount Given
              </h3>
              <p className="text-2xl sm:text-3xl font-bold text-premium-glow">
                ${(stats?.totalDiscountAmount || 0).toFixed(2)}
              </p>
            </div>
          </div>
        )}

        <div className="border border-borders rounded-lg p-4 sm:p-6 bg-grid-surface">
          <h2 className="text-base sm:text-lg font-semibold mb-4">
            Discount Codes
          </h2>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading...
            </div>
          ) : stats?.discountCodes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No discount codes generated yet
            </div>
          ) : (
            <div className="space-y-2">
              {stats?.discountCodes.map((code, index) => (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 sm:p-4 border border-borders rounded-md"
                >
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                    <code className="font-mono text-xs sm:text-sm text-primary-accent break-all">
                      {code.code}
                    </code>
                    <span className="text-xs sm:text-sm text-muted-foreground">
                      {code.discountPercent}% off
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        code.tier === "LEGENDARY"
                          ? "bg-premium-glow/20 text-premium-glow"
                          : code.tier === "RARE"
                          ? "bg-secondary-accent/20 text-secondary-accent"
                          : "bg-primary-accent/20 text-primary-accent"
                      }`}
                    >
                      {code.tier}
                    </span>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      code.isUsed
                        ? "bg-destructive/20 text-destructive"
                        : "bg-primary-accent/20 text-primary-accent"
                    }`}
                  >
                    {code.isUsed ? "Used" : "Available"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
