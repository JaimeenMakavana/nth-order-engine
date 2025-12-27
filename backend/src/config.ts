// Application Configuration
// Reads from environment variables with sensible defaults

export const config = {
  PORT: Number(process.env.PORT) || 3000,
  DISCOUNT_N: Number(process.env.DISCOUNT_N) || 4,
  REWARD_WEIGHTS: {
    COMMON: 90,
    RARE: 8,
    LEGENDARY: 2,
  } as const,
} as const;
