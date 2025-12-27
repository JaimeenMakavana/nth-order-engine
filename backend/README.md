# Nth Order Engine - Backend

E-commerce backend with Nth-order reward system built with Fastify and TypeScript.

## Features

- 🚀 Fastify-based REST API
- 🎁 Nth-order reward system (Loot Box mechanics)
- 🔒 Type-safe with TypeScript
- ✅ Schema validation with Zod
- 📝 Request logging
- 🛡️ Global error handling

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env` file in the `backend` directory:

```env
PORT=3000
DISCOUNT_N=4
NODE_ENV=development
```

### 3. Development

Run the development server with hot reload:

```bash
npm run dev
```

### 4. Build

Compile TypeScript to JavaScript:

```bash
npm run build
```

### 5. Production

Start the production server:

```bash
npm start
```

## Project Structure

```
src/
├── app.ts                  # Server bootstrap
├── config.ts               # Environment configuration
├── controllers/            # Request handlers
├── services/               # Business logic
├── repository/             # In-memory data store
├── schemas/                # Zod validation schemas
├── middleware/             # Error handling & logging
└── types/                  # TypeScript interfaces
```

## API Endpoints

### Health Check

**GET** `/health`

Health check endpoint to verify server is running.

**Response:**

```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

### Products

**GET** `/api/products`

List all available products in the store.

**Response:**

```json
{
  "products": [
    {
      "id": "prod-1",
      "name": "Wireless Mouse",
      "price": 29.99
    }
  ]
}
```

**Note:** Products are automatically seeded on server startup with 8 sample products.

---

### Cart

**GET** `/api/cart`

Get current cart items and subtotal.

**Response:**

```json
{
  "items": [
    {
      "productId": "prod-1",
      "quantity": 2
    }
  ],
  "subtotal": 59.98
}
```

**POST** `/api/cart/items`

Add item to cart. If item already exists, quantity is incremented.

**Request Body:**

```json
{
  "productId": "prod-1",
  "quantity": 1
}
```

**Response:**

```json
{
  "items": [
    {
      "productId": "prod-1",
      "quantity": 1
    }
  ],
  "subtotal": 29.99
}
```

**DELETE** `/api/cart`

Clear all items from the cart.

**Response:**

```json
{
  "success": true,
  "message": "Cart cleared successfully"
}
```

---

### Checkout

**POST** `/api/checkout`

Process checkout with cart items and optional discount code. Validates discount code before applying. Every nth order (configurable via `DISCOUNT_N`) automatically generates a reward coupon.

**Request Body:**

```json
{
  "items": [
    {
      "productId": "prod-1",
      "quantity": 2
    }
  ],
  "discountCode": "SAVE10" // Optional
}
```

**Response (with reward):**

```json
{
  "success": true,
  "order": {
    "id": "uuid-here",
    "items": [
      {
        "productId": "prod-1",
        "quantity": 2
      }
    ],
    "totalAmount": 59.98,
    "discountApplied": 5.998,
    "finalAmount": 53.982,
    "timestamp": "2024-01-01T00:00:00.000Z"
  },
  "reward": {
    "code": "ABC123XY",
    "discountPercent": 10,
    "tier": "COMMON",
    "message": "Standard Reward Unlocked!"
  }
}
```

**Error Responses:**

- `400` - Invalid discount code or already used
- `400` - Product not found
- `400` - Validation error

**Note:**

- Discount codes can only be used once
- Discount applies to the entire order
- Reward coupons are generated on every nth order (default: 4th, 8th, 12th, etc.)
- Reward tiers: COMMON (10%), RARE (15%), LEGENDARY (25%)

---

### Admin

**GET** `/api/admin/stats`

Get comprehensive statistics about purchases and discounts.

**Response:**

```json
{
  "totalItemsPurchased": 25,
  "totalPurchaseAmount": 1250.5,
  "totalDiscountAmount": 125.05,
  "discountCodes": [
    {
      "code": "ABC123XY",
      "discountPercent": 10,
      "tier": "COMMON",
      "isUsed": false
    },
    {
      "code": "XYZ789AB",
      "discountPercent": 15,
      "tier": "RARE",
      "isUsed": true
    }
  ]
}
```

**POST** `/api/admin/generate-coupon`

Manually generate a discount coupon if the nth-order condition is met. Checks if `(current_order_count + 1) % DISCOUNT_N === 0`.

**Response (success):**

```json
{
  "success": true,
  "message": "🎁 Congratulations! You've unlocked a 10% discount code!",
  "coupon": {
    "code": "ABC123XY",
    "discountPercent": 10,
    "tier": "COMMON"
  }
}
```

**Response (condition not met):**

```json
{
  "success": false,
  "message": "Keep shopping! Complete 2 more orders to unlock your next reward."
}
```

## Configuration

- `PORT`: Server port (default: 3000)
- `DISCOUNT_N`: Nth order for reward trigger (default: 4)
- `REWARD_WEIGHTS`: Probability distribution for rewards (90/8/2)

## Testing

Run tests:

```bash
npm test
```

Watch mode:

```bash
npm run test:watch
```
