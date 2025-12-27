"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { BarChart3, Gift, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export default function AdminPage() {
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
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="h-8 w-8" />
            Admin Dashboard
          </h1>
          <Button
            onClick={() => generateCouponMutation.mutate()}
            disabled={generateCouponMutation.isPending}
          >
            <Gift className="h-4 w-4 mr-2" />
            {generateCouponMutation.isPending ? "Generating..." : "Generate Coupon"}
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">
            Loading statistics...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="border border-borders rounded-lg p-6 bg-grid-surface">
              <h3 className="text-sm text-muted-foreground mb-2">
                Total Items Purchased
              </h3>
              <p className="text-3xl font-bold text-primary-accent">
                {stats?.totalItemsPurchased || 0}
              </p>
            </div>
            <div className="border border-borders rounded-lg p-6 bg-grid-surface">
              <h3 className="text-sm text-muted-foreground mb-2">
                Total Purchase Amount
              </h3>
              <p className="text-3xl font-bold text-secondary-accent">
                ${(stats?.totalPurchaseAmount || 0).toFixed(2)}
              </p>
            </div>
            <div className="border border-borders rounded-lg p-6 bg-grid-surface">
              <h3 className="text-sm text-muted-foreground mb-2">
                Total Discount Given
              </h3>
              <p className="text-3xl font-bold text-premium-glow">
                ${(stats?.totalDiscountAmount || 0).toFixed(2)}
              </p>
            </div>
          </div>
        )}

        <div className="border border-borders rounded-lg p-6 bg-grid-surface">
          <h2 className="text-lg font-semibold mb-4">Discount Codes</h2>
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
                  className="flex items-center justify-between p-4 border border-borders rounded-md"
                >
                  <div className="flex items-center gap-4">
                    <code className="font-mono text-primary-accent">
                      {code.code}
                    </code>
                    <span className="text-sm text-muted-foreground">
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
