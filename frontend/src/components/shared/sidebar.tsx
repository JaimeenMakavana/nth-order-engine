"use client";

import Link from "next/link";
import { ShoppingCart, Package, Settings } from "lucide-react";
import { useCartStore } from "@/store/use-cart-store";
import { useCouponMessage } from "@/hooks/use-cart-actions";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/providers/sidebar-provider";

export function Sidebar() {
  const { isOpen, setIsOpen } = useSidebar();
  const itemCount = useCartStore((state) =>
    state.items.reduce((sum, item) => sum + item.quantity, 0)
  );
  const pathname = usePathname();
  const { data: couponMessage, isLoading: isLoadingMessage } =
    useCouponMessage();

  const navItems = [
    { href: "/", label: "Shop", icon: Package },
    { href: "/checkout", label: "Checkout", icon: ShoppingCart },
    { href: "/stats", label: "Statistics", icon: Settings },
  ];

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-background-main/80 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-14 sm:top-16 bottom-0 w-64 border-r border-borders bg-grid-surface p-3 sm:p-4 z-40 transition-transform duration-300",
          "lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleLinkClick}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-md transition-colors",
                  isActive
                    ? "bg-primary-accent/10 text-primary-accent border border-primary-accent/20"
                    : "text-foreground hover:bg-grid-surface hover:text-primary-accent"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
                {item.href === "/checkout" && itemCount > 0 && (
                  <span className="ml-auto bg-primary-accent text-background-main text-xs font-bold px-2 py-1 rounded-full">
                    {itemCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-4 left-4 right-4 p-4 bg-background-main/50 rounded-md border border-borders">
          <p className="text-xs text-muted-foreground">
            {isLoadingMessage ? (
              "Loading..."
            ) : (
              <>🎁 {couponMessage || "Every 4th order unlocks a reward!"}</>
            )}
          </p>
        </div>
      </aside>
    </>
  );
}
