# Backend Technology Selection

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

-------------------------------------------------------------