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

- `GET /health` - Health check endpoint

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
