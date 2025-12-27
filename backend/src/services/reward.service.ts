import { randomBytes } from "crypto";
import type { CouponTier } from "../types/index.js";
import { config } from "../config.js";

/**
 * Reward generation result
 */
export interface RewardResult {
  code: string;
  discountPercent: number;
  tier: CouponTier;
}

/**
 * Reward tier configuration
 */
const REWARD_TIERS: Record<
  CouponTier,
  { discountPercent: number; weight: number }
> = {
  COMMON: { discountPercent: 10, weight: config.REWARD_WEIGHTS.COMMON },
  RARE: { discountPercent: 15, weight: config.REWARD_WEIGHTS.RARE },
  LEGENDARY: { discountPercent: 25, weight: config.REWARD_WEIGHTS.LEGENDARY },
} as const;

/**
 * Generates a crypto-secure random 8-character alphanumeric code
 */
function generateSecureCode(): string {
  // Generate 6 random bytes (48 bits of entropy)
  const bytes = randomBytes(6);

  // Convert to base36 (0-9, a-z) for alphanumeric characters
  // Use uppercase for better readability
  const code = bytes
    .toString("base64")
    .replace(/[^A-Za-z0-9]/g, "") // Remove non-alphanumeric
    .substring(0, 8)
    .toUpperCase();

  // If we got less than 8 chars (unlikely), pad with more random bytes
  if (code.length < 8) {
    const additionalBytes = randomBytes(2);
    return (
      code +
      additionalBytes
        .toString("base64")
        .replace(/[^A-Za-z0-9]/g, "")
        .substring(0, 8 - code.length)
        .toUpperCase()
    );
  }

  return code;
}

/**
 * Weighted random selection algorithm
 * Selects a tier based on configured weights
 */
function selectTierByWeight(): CouponTier {
  const totalWeight =
    REWARD_TIERS.COMMON.weight +
    REWARD_TIERS.RARE.weight +
    REWARD_TIERS.LEGENDARY.weight;

  // Generate random number between 0 and totalWeight
  const random = Math.random() * totalWeight;

  let cumulativeWeight = 0;

  // Check COMMON tier (0-90)
  cumulativeWeight += REWARD_TIERS.COMMON.weight;
  if (random <= cumulativeWeight) {
    return "COMMON";
  }

  // Check RARE tier (90-98)
  cumulativeWeight += REWARD_TIERS.RARE.weight;
  if (random <= cumulativeWeight) {
    return "RARE";
  }

  // Default to LEGENDARY (98-100)
  return "LEGENDARY";
}

/**
 * Generates a variable discount coupon using weighted random "Loot Box" logic
 *
 * Probability distribution:
 * - 90% chance for 10% discount (COMMON)
 * - 8% chance for 15% discount (RARE)
 * - 2% chance for 25% discount (LEGENDARY)
 *
 * @returns RewardResult containing unique code, discountPercent, and tier
 */
export function generateVariableDiscount(): RewardResult {
  const tier = selectTierByWeight();
  const tierConfig = REWARD_TIERS[tier];
  const code = generateSecureCode();

  return {
    code,
    discountPercent: tierConfig.discountPercent,
    tier,
  };
}
