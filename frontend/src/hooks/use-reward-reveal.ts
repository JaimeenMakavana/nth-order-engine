// Logic for managing the unboxing sequence
import { useEffect, useState } from "react";
import { useRewardStore } from "@/store/use-reward-store";
import type { Reward } from "@/types/ecommerce";

export function useRewardReveal() {
  const { reward, isVisible, showReward, hideReward, clearReward } =
    useRewardStore();
  const [isAnimating, setIsAnimating] = useState(false);

  const reveal = (newReward: Reward) => {
    setIsAnimating(true);
    showReward(newReward);
    
    // Auto-hide after animation completes
    setTimeout(() => {
      setIsAnimating(false);
    }, 3000);
  };

  const close = () => {
    hideReward();
    setIsAnimating(false);
  };

  const reset = () => {
    clearReward();
    setIsAnimating(false);
  };

  return {
    reward,
    isVisible,
    isAnimating,
    reveal,
    close,
    reset,
  };
}
