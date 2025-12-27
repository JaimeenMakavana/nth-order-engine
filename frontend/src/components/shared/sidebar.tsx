"use client";

import Link from "next/link";
import { ShoppingCart, Package, Settings } from "lucide-react";
import { useCartStore } from "@/store/use-cart-store";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

export function Sidebar() {
  const itemCount = useCartStore((state) => 
    state.items.reduce((sum, item) => sum + item.quantity, 0)
  );
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Shop", icon: Package },
    { href: "/checkout", label: "Checkout", icon: ShoppingCart },
    { href: "/admin", label: "Admin", icon: Settings },
  ];

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-64 border-r border-borders bg-grid-surface p-4">
      <nav className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
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
          🎁 Every 4th order unlocks a reward!
        </p>
      </div>
    </aside>
  );
}
