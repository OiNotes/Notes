#!/bin/bash
set -e

echo "Setting up Neon PostgreSQL..."

# Pull env vars from Vercel (if not already done)
if [ ! -f apps/web/.env ] && [ ! -f apps/web/.env.local ]; then
  echo "Pulling environment variables from Vercel..."
  vercel env pull apps/web/.env.local
fi

echo "Generating Prisma client..."
cd apps/web
npx prisma generate

echo "Syncing schema with database..."
npx prisma db push

echo ""
echo "Done! Database is ready."
echo "Prisma Studio: cd apps/web && npx prisma studio"
