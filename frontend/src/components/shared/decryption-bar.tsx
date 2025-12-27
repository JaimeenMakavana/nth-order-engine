"use client";

import { useExploration } from "@/hooks/use-exploration";
import { motion } from "framer-motion";

export function DecryptionBar() {
  const { decodedText, progress } = useExploration();

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-[64px] border-b border-borders bg-grid-surface/95 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-2 h-full">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center gap-4">
            <span className="text-xs text-muted-foreground">
              SYSTEM STATUS:
            </span>
            <motion.div
              className="font-mono text-sm text-primary-accent"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {decodedText || "0000 0000"}
            </motion.div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">PROGRESS:</span>
            <div className="h-2 w-32 bg-borders rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary-accent"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <span className="text-xs text-primary-accent font-mono">
              {progress}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
