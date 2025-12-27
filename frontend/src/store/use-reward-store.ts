// Zustand store for current "Loot Box" result & visibility
import { create } from "zustand";
import type { Reward } from "@/types/ecommerce";

interface RewardStore {
  reward: Reward | null;
  isVisible: boolean;
  showReward: (reward: Reward) => void;
  hideReward: () => void;
  clearReward: () => void;
}

export const useRewardStore = create<RewardStore>((set) => ({
  reward: null,
  isVisible: false,

  showReward: (reward: Reward) => {
    set({ reward, isVisible: true });
  },

  hideReward: () => {
    set({ isVisible: false });
  },

  clearReward: () => {
    set({ reward: null, isVisible: false });
  },
}));
