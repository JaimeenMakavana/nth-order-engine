import { describe, it, expect } from "vitest";
import { generateVariableDiscount } from "../services/reward.service.js";
import { config } from "../config.js";

/**
 * Probability Distribution Tests
 * Verifies that the reward generation follows the configured probability distribution
 */
describe("Probability Distribution Tests", () => {
  it("should generate rewards with correct probability distribution (90/8/2)", () => {
    const iterations = 1000; // Use 1000 for better statistical accuracy
    const tierCounts: Record<string, number> = {
      COMMON: 0,
      RARE: 0,
      LEGENDARY: 0,
    };

    // Act: Generate many rewards
    for (let i = 0; i < iterations; i++) {
      const reward = generateVariableDiscount();
      tierCounts[reward.tier]++;
    }

    // Calculate percentages
    const commonPercent = (tierCounts.COMMON / iterations) * 100;
    const rarePercent = (tierCounts.RARE / iterations) * 100;
    const legendaryPercent = (tierCounts.LEGENDARY / iterations) * 100;

    // Assert: COMMON should be around 90% (config.REWARD_WEIGHTS.COMMON)
    // Allow tolerance of ±5% for statistical variance
    expect(commonPercent).toBeGreaterThanOrEqual(85);
    expect(commonPercent).toBeLessThanOrEqual(95);

    // Assert: RARE should be around 8% (config.REWARD_WEIGHTS.RARE)
    expect(rarePercent).toBeGreaterThanOrEqual(5);
    expect(rarePercent).toBeLessThanOrEqual(12);

    // Assert: LEGENDARY should be around 2% (config.REWARD_WEIGHTS.LEGENDARY)
    // Allow tolerance of ±2% for statistical variance
    expect(legendaryPercent).toBeGreaterThanOrEqual(0);
    expect(legendaryPercent).toBeLessThanOrEqual(5);

    // Verify all rewards were generated and sum to 100%
    expect(
      tierCounts.COMMON + tierCounts.RARE + tierCounts.LEGENDARY
    ).toBe(iterations);
    expect(commonPercent + rarePercent + legendaryPercent).toBeCloseTo(100, 1);
  });

  it("should verify the distribution matches configured weights", () => {
    const iterations = 10000; // Larger sample for more accurate distribution
    const tierCounts: Record<string, number> = {
      COMMON: 0,
      RARE: 0,
      LEGENDARY: 0,
    };

    // Act: Generate many rewards
    for (let i = 0; i < iterations; i++) {
      const reward = generateVariableDiscount();
      tierCounts[reward.tier]++;
    }

    // Calculate actual percentages
    const commonPercent = (tierCounts.COMMON / iterations) * 100;
    const rarePercent = (tierCounts.RARE / iterations) * 100;
    const legendaryPercent = (tierCounts.LEGENDARY / iterations) * 100;

    // Expected percentages from config
    const expectedCommon = config.REWARD_WEIGHTS.COMMON;
    const expectedRare = config.REWARD_WEIGHTS.RARE;
    const expectedLegendary = config.REWARD_WEIGHTS.LEGENDARY;

    // Assert: Actual percentages should be close to expected (within 5% absolute tolerance)
    // For statistical tests, we allow ±5% deviation from expected values
    const tolerance = 5;
    expect(commonPercent).toBeGreaterThanOrEqual(expectedCommon - tolerance);
    expect(commonPercent).toBeLessThanOrEqual(expectedCommon + tolerance);
    
    expect(rarePercent).toBeGreaterThanOrEqual(expectedRare - tolerance);
    expect(rarePercent).toBeLessThanOrEqual(expectedRare + tolerance);
    
    expect(legendaryPercent).toBeGreaterThanOrEqual(expectedLegendary - tolerance);
    expect(legendaryPercent).toBeLessThanOrEqual(expectedLegendary + tolerance);
  });
});

describe("Reward Tier Discount Percentages", () => {
  it("should assign correct discount percentages to each tier", () => {
    const iterations = 1000; // Increased to ensure all tiers appear
    const tierDiscountMap: Record<string, Set<number>> = {
      COMMON: new Set(),
      RARE: new Set(),
      LEGENDARY: new Set(),
    };

    // Act: Generate rewards and collect discount percentages by tier
    for (let i = 0; i < iterations; i++) {
      const reward = generateVariableDiscount();
      tierDiscountMap[reward.tier].add(reward.discountPercent);
    }

    // Assert: COMMON tier should always appear and have 10% discount
    expect(tierDiscountMap.COMMON.size).toBeGreaterThan(0);
    expect(tierDiscountMap.COMMON.has(10)).toBe(true);
    expect(tierDiscountMap.COMMON.size).toBe(1); // Only one discount value

    // Assert: RARE tier should appear (with 1000 iterations) and have 15% discount
    expect(tierDiscountMap.RARE.size).toBeGreaterThan(0);
    expect(tierDiscountMap.RARE.has(15)).toBe(true);
    expect(tierDiscountMap.RARE.size).toBe(1); // Only one discount value

    // Assert: LEGENDARY tier should appear (with 1000 iterations) and have 25% discount
    expect(tierDiscountMap.LEGENDARY.size).toBeGreaterThan(0);
    expect(tierDiscountMap.LEGENDARY.has(25)).toBe(true);
    expect(tierDiscountMap.LEGENDARY.size).toBe(1); // Only one discount value
  });
});

