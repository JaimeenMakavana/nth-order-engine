// Zustand store for tracking route exploration (7/7 route progress)
import { create } from "zustand";
import type { ExplorationState } from "@/types/ecommerce";

interface ExplorationStore extends ExplorationState {
  visitRoute: (route: string) => void;
  reset: () => void;
}

// Routes to track for decryption progress
const ROUTES = [
  "/",
  "/checkout",
  "/admin",
  // Add more routes as needed
];

const decodeBinary = (binary: string): string => {
  return binary
    .split(" ")
    .map((bin) => String.fromCharCode(parseInt(bin, 2)))
    .join("");
};

export const useExplorationStore = create<ExplorationStore>((set, get) => ({
  visitedRoutes: new Set(),
  decodedText: "",
  progress: 0,

  visitRoute: (route: string) => {
    const state = get();
    const newVisitedRoutes = new Set(state.visitedRoutes);
    
    if (!newVisitedRoutes.has(route)) {
      newVisitedRoutes.add(route);
      
      // Generate binary representation based on visited routes
      const binaryArray = ROUTES.map((r) => (newVisitedRoutes.has(r) ? "1" : "0"));
      const binaryString = binaryArray.join(" ");
      const decoded = decodeBinary(binaryString);
      
      const progress = Math.min(
        (newVisitedRoutes.size / ROUTES.length) * 100,
        100
      );

      set({
        visitedRoutes: newVisitedRoutes,
        decodedText: decoded || binaryString,
        progress: Math.floor(progress),
      });
    }
  },

  reset: () => {
    set({
      visitedRoutes: new Set(),
      decodedText: "",
      progress: 0,
    });
  },
}));
