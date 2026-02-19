# Oi Notes Web

Next.js app for notes + music player.

## Local start

```bash
pnpm install
cp apps/web/.env.example apps/web/.env.local
pnpm --filter @oi/web db:push
pnpm dev --filter @oi/web
```

Open: `http://localhost:4311`

## Required env

Create `apps/web/.env.local` with:

```bash
POSTGRES_PRISMA_URL="postgresql://sile@localhost:5432/oi_notes?schema=public"
POSTGRES_URL_NON_POOLING="postgresql://sile@localhost:5432/oi_notes?schema=public"
```

## Local Postgres

If PostgreSQL is not running locally:

```bash
docker compose up -d postgres
```

Then create DB once:

```bash
createdb -h localhost oi_notes
```

## Vercel

Production requires these env vars in Vercel project:

- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`

Deploy:

```bash
vercel deploy --prod
```
