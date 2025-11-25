---
name: quick-start
description: Быстрый запуск dev окружения проекта Notes - Docker, Prisma, Next.js
---

# Quick Start

Запуск всех сервисов для разработки.

## Шаги

### 1. Docker (PostgreSQL)
```bash
docker-compose up -d
```

### 2. Prisma (если нужно)
```bash
cd apps/web && pnpm prisma generate
```

### 3. Dev server
```bash
pnpm dev
```

## Проверка

После запуска проверь:
- http://localhost:4311 - главная страница
- http://localhost:4311/music - музыкальный плеер
- Docker: `docker ps` показывает postgres running

## Troubleshooting

**Порт занят:**
```bash
lsof -i :4311
kill -9 <PID>
```

**Prisma ошибки:**
```bash
cd apps/web && pnpm prisma migrate reset
```
