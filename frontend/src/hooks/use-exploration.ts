// Logic for tracking visited routes (Decryption)
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useExplorationStore } from "@/store/use-exploration-store";

export function useExploration() {
  const pathname = usePathname();
  const visitRoute = useExplorationStore((state) => state.visitRoute);

  const lastPathnameRef = useRef<string | null>(null);

  useEffect(() => {
    // Only visit route once per pathname change
    if (pathname && pathname !== lastPathnameRef.current) {
      lastPathnameRef.current = pathname;
      visitRoute(pathname);
    }
  }, [pathname, visitRoute]);

  // Return selective subscriptions to prevent unnecessary re-renders
  return {
    visitedRoutes: useExplorationStore((state) => state.visitedRoutes),
    progress: useExplorationStore((state) => state.progress),
    reset: useExplorationStore((state) => state.reset),
  };
}
