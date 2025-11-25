---
name: run-tests
description: Запуск unit и integration тестов проекта Notes
---

# Run Tests

Запуск тестов проекта.

## Команды

### Все тесты
```bash
pnpm test
```

### Конкретный файл
```bash
pnpm test -- path/to/file.test.ts
```

### Watch mode
```bash
pnpm test -- --watch
```

### С coverage
```bash
pnpm test:coverage
```

## Интерпретация

```
✓ passed - тест прошёл
✗ failed - тест упал (нужно исправить)
○ skipped - тест пропущен
```

## При падении тестов

1. Прочитай сообщение об ошибке
2. Найди строку с `Expected` vs `Received`
3. Определи: баг в коде или устаревший тест
4. Исправь и перезапусти
