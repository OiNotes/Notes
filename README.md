# Oi/Notes

Monorepo with `@oi/web` (Next.js) and shared config.

## Quick start

```bash
pnpm install
cp apps/web/.env.example apps/web/.env.local
pnpm --filter @oi/web db:push
pnpm dev --filter @oi/web
```

Open: `http://localhost:4311`

## Build

```bash
pnpm --filter @oi/web build
```
