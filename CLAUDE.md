# Notes - Музыкальный проект

## Стек
- Next.js 15 (App Router), React 19, TypeScript 5
- Prisma + PostgreSQL (Docker)
- pnpm monorepo + Turbo

## Структура
- `apps/web/src/app/music/` - музыкальный плеер
- `apps/web/src/app/api/` - API routes
- `apps/web/prisma/` - схема БД

## Команды
```bash
pnpm dev          # dev server (port 4311)
pnpm test         # тесты
pnpm build        # сборка
pnpm lint         # линтинг
pnpm type-check   # проверка типов
```

## Правила Claude Code

### MCP File System обязателен
```
✅ Использовать:
- Read(file_path) - чтение файлов
- Grep(pattern, path) - поиск в коде
- Glob(pattern) - поиск файлов
- Write(file_path, content) - создание файлов
- Edit(file_path, old, new) - редактирование

❌ НЕ использовать Bash для:
- cat, head, tail → Read()
- grep, rg → Grep()
- find, ls → Glob()
- echo > → Write()
```

### Workflow оркестратора
1. **Plan Mode** → анализ через Read/Grep/Glob
2. **ExitPlanMode** → запросить approval
3. **Task tool** → делегация субагентам
4. **Verify** → логи + тесты
5. **Report** → устно в чат (НЕ .md файлы!)

### Субагенты (.claude/agents/)
| Агент | Назначение | Приоритет |
|-------|------------|-----------|
| admin-lab-builder | Timing calibration tool | CRITICAL |
| player-enhancer | Waveform, animations | HIGH |
| data-integrator | API, dynamic routing | HIGH |
| test-engineer | Test suite >80% | MEDIUM |
| design-polisher | Accessibility, polish | MEDIUM |

### Skills (.claude/skills/)
- `quick-start` - запуск dev окружения
- `health-check` - проверка всех сервисов
- `run-tests` - запуск тестов
- `db-migrate` - миграции Prisma

### Safety Rules
- НЕ редактировать `.env` и секреты
- НЕ создавать `.md` отчёты (только устно!)
- Минимальные diffs
- Всегда через Plan → Approve → Delegate

## Дизайн система
```css
--color-accent: #caa57a      /* золотистый акцент */
--dur-base: 220ms            /* базовая анимация */
--ease-elegant: cubic-bezier(0.25, 0.46, 0.45, 0.94)
```
