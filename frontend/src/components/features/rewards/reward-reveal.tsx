"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useRewardReveal } from "@/hooks/use-reward-reveal";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, Trophy, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const tierConfig = {
  COMMON: {
    color: "text-primary-accent",
    bgColor: "bg-primary-accent/10",
    borderColor: "border-primary-accent",
    icon: Sparkles,
    label: "Standard Reward",
  },
  RARE: {
    color: "text-secondary-accent",
    bgColor: "bg-secondary-accent/10",
    borderColor: "border-secondary-accent",
    icon: Zap,
    label: "System Overclock",
  },
  LEGENDARY: {
    color: "text-premium-glow",
    bgColor: "bg-premium-glow/10",
    borderColor: "border-premium-glow",
    icon: Trophy,
    label: "Critical Success",
  },
};

export function RewardReveal() {
  const { reward, isVisible, close } = useRewardReveal();

  if (!reward) return null;

  const config = tierConfig[reward.tier];
  const Icon = config.icon;

  return (
    <AnimatePresence>
      {isVisible && (
        <Dialog open={isVisible} onOpenChange={close}>
          <DialogContent className={cn("border-2", config.borderColor)}>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", duration: 0.5 }}
            >
              <DialogHeader>
                <motion.div
                  className={cn(
                    "flex items-center justify-center gap-2 mb-4",
                    config.color
                  )}
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.5, repeat: 2 }}
                >
                    <Icon className="h-8 w-8" />
                    <DialogTitle className={config.color}>
                      {config.label}
                    </DialogTitle>
                  </motion.div>
              </DialogHeader>

              <div className={cn("p-6 rounded-lg text-center", config.bgColor)}>
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <p className="text-2xl font-bold mb-2">{reward.message}</p>
                  <p className="text-4xl font-bold mb-4">
                    {reward.discountPercent}% OFF
                  </p>
                  <div className="bg-background-main p-4 rounded border border-borders">
                    <p className="text-sm text-muted-foreground mb-2">
                      Your discount code:
                    </p>
                    <p className="text-xl font-mono font-bold text-primary-accent">
                      {reward.code}
                    </p>
                  </div>
                </motion.div>
              </div>

              <div className="mt-4">
                <Button onClick={close} className="w-full">
                  Claim Reward
                </Button>
              </div>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}

