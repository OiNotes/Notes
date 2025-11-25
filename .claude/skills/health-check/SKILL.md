---
name: health-check
description: Проверка здоровья всех сервисов проекта - Docker, TypeScript, тесты, сборка
---

# Health Check

Полная проверка состояния проекта.

## Проверки

### 1. Docker
```bash
docker ps --format "table {{.Names}}\t{{.Status}}"
```
Ожидается: postgres running

### 2. TypeScript
```bash
pnpm type-check
```
Ожидается: 0 ошибок

### 3. Lint
```bash
pnpm lint
```
Ожидается: 0 warnings

### 4. Tests
```bash
pnpm test
```
Ожидается: все тесты проходят

### 5. Build
```bash
pnpm build
```
Ожидается: успешная сборка

### 6. Порты
```bash
lsof -i :4311 -i :5432 | head -10
```

## Результат

- Всё зелёное = проект здоров
- Есть ошибки = исправить перед продолжением
