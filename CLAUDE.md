# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start development server (http://localhost:3000)
npm run build        # Production build
npm run lint         # ESLint
npm test             # Run all tests
npm run test:watch   # Tests in watch mode
npm run test:coverage # Tests with coverage report

# Run a single test file
npx jest __tests__/lib/avatar.test.ts

# Prisma
npx prisma migrate dev   # Apply migrations (uses prisma.config.ts)
npx prisma generate      # Regenerate client to generated/prisma/
npx prisma studio        # Open Prisma Studio
```

## Architecture

**Stack:** Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · shadcn/ui · PostgreSQL · Prisma · Better Auth · Firebase

### Dual Authentication System

This app has two parallel auth providers that must both be supported:

1. **Firebase** — handles Google OAuth and Firebase email/password sign-in. The client sends a Firebase ID token to `POST /api/auth/firebase`, which verifies it via `firebase-admin`, upserts the user in Prisma, then sets a `session` cookie containing the raw ID token.

2. **Better Auth** — handles email/password registration via the `/register` page. Mounted at `POST /api/auth/[...all]`. Uses its own session cookies.

**`getSession()` in [src/lib/auth.ts](src/lib/auth.ts)** is the single source of truth for server-side session resolution. It first attempts to verify the `session` cookie as a Firebase ID token; if that fails, it falls back to checking Better Auth session headers. Either way, the resolved user is always re-fetched from Prisma.

### Prisma Client Location

The Prisma client is generated to `generated/prisma/` (not `node_modules/.prisma/client`). Import it as:
```ts
import { PrismaClient } from "../../generated/prisma/client";
```
The singleton is exported from [src/lib/prisma.ts](src/lib/prisma.ts) using `@prisma/adapter-pg` (the Pg driver adapter, not the default ORM mode).

Migration configuration lives in [prisma.config.ts](prisma.config.ts) and reads `DATABASE_URL` from environment.

### API Routes

| Route | Purpose |
|---|---|
| `POST /api/auth/firebase` | Exchange Firebase ID token for session cookie + upsert user |
| `/api/auth/[...all]` | Better Auth handler |
| `GET/POST /api/todos` | List / create todos (session-gated) |
| `GET/PATCH/DELETE /api/todos/[id]` | Single-todo operations |
| `GET /api/session` | Current session info |
| `POST /api/logout` | Clear session |
| `GET /api/docs/openapi` | OpenAPI JSON spec |
| `GET /docs` | Swagger UI |

### Testing

Tests live in `__tests__/` and match `**/__tests__/**/*.test.[jt]s?(x)`. The test environment is `node`. Mocks for auth and Prisma are in `__tests__/mocks/`.

### Environment Variables

Firebase client vars are `NEXT_PUBLIC_FIREBASE_*`. Firebase Admin requires `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, and `FIREBASE_PRIVATE_KEY` (with literal `\n` escape for the private key). Better Auth URL: `NEXT_PUBLIC_BETTER_AUTH_URL`. Database: `DATABASE_URL`.
