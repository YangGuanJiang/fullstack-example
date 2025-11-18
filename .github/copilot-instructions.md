## Repo overview

- Monorepo with `client/` and `server/` workspaces (root `package.json` uses Yarn workspaces).
- Server is a TypeScript Express API located in `server/`. Key entry: `server/src/index.ts`.
- Database: Prisma with schema at `server/prisma/schema.prisma` and config at `server/prisma.config.ts`.

## Key patterns & conventions (copy/paste friendly)

- Environment: load via `dotenv`; canonical env values live in `server/src/env.ts`.
  - Important env vars: `JWT_SECRET`, `DATABASE_URL`, `PORT`.
- Authentication:
  - `server/src/middlewares/auth.ts` implements `requireAuth` which expects `Authorization: Bearer <token>` and sets `req.userId`.
  - JWT secret is read from `env` (`env.JWT_SECRET`).
- Validation: the codebase uses `zod` for request validation (see `server/src/index.ts` login example and `server/src/modules/auth/routes.ts`).
- Error handling: use Express-style `next(error)` in routes and the central `server/src/middlewares/error.ts` error handler.
- Database: Prisma client used via `@prisma/client`. Generator output is configured in `server/prisma/schema.prisma` (client output path: `src/generated/prisma`).

## File/route examples to reference

- Login endpoint example: `server/src/index.ts` — shows zod validation, bcrypt, jwt signing and `/api/login` route structure.
- Auth module example: `server/src/modules/auth/routes.ts` — shows register flow, Zod schema, Prisma usage and bcrypt hashing.
- Middleware examples: `server/src/middlewares/auth.ts` (auth), `server/src/middlewares/error.ts` (error handling).

## Developer workflows (commands)

From repository root (Yarn workspaces):

- Run both client and server in dev: `yarn dev` (root script runs both workspaces concurrently).
- Run server only: `yarn workspace server run dev` or `cd server; yarn dev`.
- Build server: `yarn workspace server run build` (runs `tsc -p tsconfig.json`).
- Start built server: `yarn workspace server run start` (runs `node dist/index.js`).
- Prisma:
  - Open Studio: `yarn workspace server run prisma:studio`
  - Apply migrations (local dev): `yarn workspace server run prisma:migrate`

Notes for terminals: this repo uses Yarn and the `yarn workspace` pattern — run workspace scripts from the monorepo root to keep things consistent.

## Coding conventions & gotchas (observed)

- Use Zod for request parsing/validation (do not rely on ad-hoc checks). See `loginSchema` pattern in `server/src/index.ts`.
- Routes tend to call `next(error)` for errors; central error handler will format responses — follow that pattern.
- Auth middleware extracts bearer token using `Authorization` header and attaches `userId` to the request object (`AuthRequest`). Use that field when authorizing actions.
- Prisma client usage is local to modules (e.g., `new PrismaClient()` in `server/src/modules/auth/routes.ts`). Be mindful of connection lifecycle in long-lived processes (prefer a shared client if adding many modules).

## What to change or extend (if you plan edits)

- When adding new endpoints, follow the pattern: validate with Zod, call DB via Prisma, wrap with try/catch and `next(error)`, and rely on the `errorHandler` middleware.
- Add new env variables to `server/src/env.ts` and provide sensible defaults for local dev.

## Where to look for more context

- Root workspace config: `package.json` (workspaces, dev scripts)
- Server scripts and deps: `server/package.json`
- Prisma schema & config: `server/prisma/schema.prisma`, `server/prisma.config.ts`
- Example auth flow: `server/src/modules/auth/routes.ts`

---
If any of the above is incomplete or you want this to target a more specific agent persona (e.g., “make tests”, “refactor prisma usage”, “add OpenAPI”), tell me which focus and I’ll iterate.
