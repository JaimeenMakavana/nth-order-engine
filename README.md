## 1. Backend Technology Selection

## My Thought Process

I had four options to consider:

1. Next.js API Route
2. Express.js
3. Fastify.js
4. Nest.js

## How I Reached the Conclusion

I started a conversation with Gemini/Claude regarding the assignment requirements. Based on the assignment, I found out the pros and cons of the above four options.

## Why Fastify?

I chose Fastify because:

- **Built-in Validation (Zod/JSON Schema)**: The assignment requires validating checkout data and coupon codes. Fastify has industry-leading support for schema validation, which prevents "bad data" from ever reaching my logic.
- **Performance & Low Overhead**: It is significantly faster than Express and has a smaller footprint than NestJS.
- **For Development**: It has a "plugin" architecture that makes structuring my "In-Memory Store" as a shared resource very clean.

## Why Not the Others?

- **Express**: I think it's old school and needs extra setup.
- **Nest.js**: Setup is slower. I would have chosen Nest if I needed to develop an actual project, but this was for an assignment, so I am choosing Fastify.

---

## 2. My Nth Order Logic Thinking

- So first I try to understand the exact requirement using Gemini/Claude to identify what is the pain point.
- Using this business logic, I have to implement intermittent reinforcement (basically it should trigger users to buy items frequently using discount strategy on nth order).
- But I was facing a few issues:

  - If I set it static, for example n=5, so every user will identify this loophole and it becomes predictable → but it should be a psychological hook.

- So I have to make this logic in such a way that it should be personalized and unpredictable.

- I have tried three approaches:
  - a. The "Personalized Momentum" (Individual 'n')
  - b. The "Weighted Randomness" (Range-based 'n')
  - c. The "Behavioral Nudge" (Engagement-based 'n')

But I don't find these worth it because these are not solving the Variable-Ratio Reinforcement problem for each user.

So I researched for case studies I am aware about:

1. **When I used to play PUBG or COC, there were "the loot box"** → So under the hood what they do, they give me a guarantee after 10 boxes I open I will get something for sure + but I also find some legendary item between (unpredictability).

2. **The "Infinite Scroll" (Social Media)**

   - Instagram, LinkedIn → The "reward" (dopamine-inducing content) is distributed randomly.

3. **The "Surprise & Delight" Discount (E-commerce)**
   - Spinning wheel coupon.

So I have decided to go with "the loot box" because it will implement intermittent (Variable-Ratio) reinforcement more effectively for this use case.

### Reward System

| Result       | Probability | Technical Name   |
| ------------ | ----------- | ---------------- |
| 10% Discount | 90%         | Standard Reward  |
| 15% Discount | 8%          | System Overclock |
| 20% Discount | 2%          | Critical Success |

In this model, the action is predictable (every 4th order), but the outcome is a mystery. This is exactly how "Pity Systems" work in gaming—the user knows exactly when they are guaranteed a "pull," but they don't know if the result will be a Standard, Rare, or Legendary reward.

### Why 10%, 15%, 20%?

The assignment asks for a "10% discount." By setting 10% as  base reward (the most common drop), I am following the rules while adding "Surprise and Delight" for the rare 15% or 25% drops.

---

## 3. backend architecture deciding 

so for backend, i decided the best practices used in deciding folder structure for fastify 

src/
├── app.ts                  # Bootstraps the server (Fastify) & connects middleware
├── config.ts               # Environment variables (N=4, port, etc.)
│
├── controllers/            # Entry points: Extracts data from Request -> Service
│   ├── cart.controller.ts     # Handles adding/removing items
│   ├── checkout.controller.ts # Handles order placement & reward triggers
│   └── admin.controller.ts   # Handles stats & manual coupon generation
│
├── services/               # The "Brain": Business logic & N-logic calculations
│   ├── cart.service.ts       # Logic for totals and item management
│   ├── checkout.service.ts   # Coordinates order saving and reward eligibility
│   └── reward.service.ts     # EXCLUSIVE: Weighted random logic for variable discount
│
├── repository/             # The "Memory": Direct interaction with In-Memory store
│   └── store.repository.ts   # Singleton class holding Orders[], Cart[], Coupons[]
│
├── schemas/                # The "Guard": Data validation using Zod
│   ├── checkout.schema.ts    # Validates correct coupon and user data format
│   └── product.schema.ts     # Validates item structure
│
├── middleware/             # Interceptors
│   ├── error.handler.ts      # Global catch for 400/500 errors
│   └── logger.ts             # Logs API requests (important for evaluation)
│
├── types/                  # Shared TypeScript Interfaces
│   └── index.ts              # Definitions for Order, Coupon, RewardTier
│
└── __tests__/              # Proof of Quality
    ├── nth-logic.test.ts     # Specifically tests if N=4 triggers a reward
    └── probability.test.ts   # Verifies the 80/15/5 distribution split


---

## 4. code implementation

- once the folder structure created and logic what i want for this backend, i have explain to gemini, based on that I generated prompt for each of the functionality.
- so my thought process build while working with cursor, antigravity and other ai coding tools is that so they are like jr developer with vast knowledge of the coding, so i provide proper roadmap, then i just have to look the code it generate and add patches where it distracted from the expected roadmap.
- so I have gave core logic for backend, like checkout, discount , cart etc + most importantly full folder structure , it cursor generated the 80% code based on the requirement.
- othr 20%, i got it through the iterations. 


=> so apart from requirement mention in doc, i have found out that there is requirement of integration testing for coupen double spend , so i need to ensure that once a coupon is used in a successful checkout, it cannot be reused for a subsequent order. so I have implement this test.


---

## 5. what am i thinking write now for further implementation

- so in current implementation, i feel there are few changes required like user friendly messags, some response schema might need to change but for now, its good to go and ready for the frontend implementation.