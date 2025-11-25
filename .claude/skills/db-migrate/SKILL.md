---
name: db-migrate
description: Управление миграциями PostgreSQL через Prisma ORM
---

# DB Migrate

Управление миграциями базы данных.

## Команды

### Создать миграцию
```bash
cd apps/web && pnpm prisma migrate dev --name <migration_name>
```

### Применить миграции
```bash
cd apps/web && pnpm prisma migrate deploy
```

### Статус миграций
```bash
cd apps/web && pnpm prisma migrate status
```

### Сбросить БД (ОСТОРОЖНО!)
```bash
cd apps/web && pnpm prisma migrate reset
```

## После изменения schema.prisma

1. Отредактируй `apps/web/prisma/schema.prisma`
2. Создай миграцию: `pnpm prisma migrate dev --name add_new_field`
3. Сгенерируй клиент: `pnpm prisma generate`

## Troubleshooting

**Migration failed:**
```bash
docker ps | grep postgres
cd apps/web && pnpm prisma db pull
```

## GUI
```bash
cd apps/web && pnpm prisma studio
```
Откроется на http://localhost:5555
