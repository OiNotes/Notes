# План: Полнофункциональная система Claude Code с максимумом автоматизации

## Анализ текущего состояния

### Существующая инфраструктура
- **Monorepo**: pnpm + Turborepo
- **Stack**: Next.js 15, React 19, TypeScript, Prisma + SQLite (docker-compose для PostgreSQL)
- **Музыкальный плеер**: Полнофункциональный с Workshop для синхронизации лирики
- **5 агентов** в `.claude/agents/`:
  - `admin-lab-builder.md` - Timing calibration (CRITICAL)
  - `player-enhancer.md` - Waveform и touch gestures (HIGH)
  - `data-integrator.md` - Backend интеграция (HIGH)
  - `test-engineer.md` - TDD и тесты (MEDIUM)
  - `design-polisher.md` - UX и accessibility (MEDIUM)

### Текущие MCP серверы
- `mcp__filesystem` - файловые операции
- `mcp__git` - git операции

---

## 1. ДОПОЛНИТЕЛЬНЫЕ СУБАГЕНТЫ

### 1.1 Новые агенты для полного покрытия

#### `devops-engineer.md` (HIGH Priority)
**Назначение**: Docker, CI/CD, деплой, мониторинг
```
Файл: .claude/agents/devops-engineer.md

Задачи:
- Docker Compose конфигурация (PostgreSQL, Redis)
- GitHub Actions для CI/CD
- Vercel/Railway деплой
- Healthchecks и мониторинг
- Environment management (.env.example)
```

#### `security-auditor.md` (MEDIUM Priority)
**Назначение**: Аудит безопасности, валидация, санитизация
```
Файл: .claude/agents/security-auditor.md

Задачи:
- Проверка API routes на уязвимости
- Валидация inputs (Zod schemas)
- CORS и CSP настройки
- Rate limiting
- Secure file uploads
```

#### `performance-optimizer.md` (MEDIUM Priority)
**Назначение**: Оптимизация производительности
```
Файл: .claude/agents/performance-optimizer.md

Задачи:
- Bundle size анализ
- Image optimization
- Lazy loading
- Caching strategies
- Core Web Vitals
- Database query optimization
```

#### `documentation-writer.md` (LOW Priority)
**Назначение**: Автогенерация документации
```
Файл: .claude/agents/documentation-writer.md

Задачи:
- API документация (OpenAPI/Swagger)
- Компонентная документация
- README updates
- JSDoc комментарии
- Changelog generation
```

#### `migration-specialist.md` (LOW Priority)
**Назначение**: Database миграции и data transformations
```
Файл: .claude/agents/migration-specialist.md

Задачи:
- Prisma migrations
- Data seeding
- Schema changes
- Backup/restore procedures
```

---

## 2. SKILLS (Типовые операции)

### 2.1 Структура Skills
```
.claude/skills/
├── dev/
│   ├── quick-start.md        # Быстрый запуск проекта
│   ├── health-check.md       # Проверка состояния сервисов
│   └── restart-all.md        # Перезапуск всех сервисов
├── test/
│   ├── run-tests.md          # Запуск unit тестов
│   ├── test-coverage.md      # Coverage report
│   └── test-e2e.md           # E2E тесты
├── debug/
│   ├── analyze-logs.md       # Анализ логов
│   ├── fix-errors.md         # Автоисправление ошибок
│   └── check-ports.md        # Проверка занятых портов
├── db/
│   ├── db-migrate.md         # Применение миграций
│   ├── db-seed.md            # Заполнение тестовыми данными
│   └── db-reset.md           # Полный сброс БД
├── deploy/
│   ├── build-check.md        # Проверка сборки
│   ├── deploy-preview.md     # Деплой превью
│   └── deploy-prod.md        # Деплой в продакшн
└── git/
    ├── pr-create.md          # Создание PR
    ├── branch-cleanup.md     # Очистка старых веток
    └── sync-main.md          # Синхронизация с main
```

### 2.2 Примеры Skills

#### `dev/quick-start.md`
```markdown
---
description: Быстрый запуск dev окружения
---

# Quick Start

## Шаги
1. Проверить Docker (docker ps)
2. Запустить PostgreSQL (docker-compose up -d postgres)
3. Применить миграции (npx prisma migrate dev)
4. Запустить dev server (pnpm dev)
5. Проверить http://localhost:4311

## Проверки
- [ ] PostgreSQL доступен на 5432
- [ ] Dev server на 4311
- [ ] Нет ошибок в логах
```

#### `debug/analyze-logs.md`
```markdown
---
description: Анализ логов для поиска ошибок
---

# Analyze Logs

## Источники логов
1. Next.js dev server: `apps/web/.next/`
2. Docker logs: `docker logs oi-notes-db`
3. Prisma: `npx prisma studio`

## Паттерны ошибок
- `[error]` - критические ошибки
- `[warn]` - предупреждения
- `ECONNREFUSED` - проблемы подключения
- `P2002` - Prisma unique constraint

## Действия
1. Найти последние ошибки
2. Классифицировать по типу
3. Предложить решения
```

#### `db/db-migrate.md`
```markdown
---
description: Применение Prisma миграций
---

# Database Migration

## Pre-checks
1. Проверить DATABASE_URL в .env
2. Убедиться что PostgreSQL запущен
3. Сделать backup если продакшн

## Команды
- Создать миграцию: npx prisma migrate dev --name <name>
- Применить миграции: npx prisma migrate deploy
- Проверить статус: npx prisma migrate status

## Post-checks
- [ ] Миграция применена успешно
- [ ] Prisma Client сгенерирован
- [ ] Тесты проходят
```

---

## 3. CUSTOM COMMANDS

### 3.1 Структура Commands
```
.claude/commands/
├── project/
│   ├── init.md               # /project:init - Инициализация нового модуля
│   ├── status.md             # /project:status - Полный статус проекта
│   └── cleanup.md            # /project:cleanup - Очистка временных файлов
├── feature/
│   ├── add.md                # /feature:add <name> - Добавить новую фичу
│   ├── test.md               # /feature:test <name> - Протестировать фичу
│   └── deploy.md             # /feature:deploy <name> - Задеплоить фичу
├── music/
│   ├── sync.md               # /music:sync <track> - Синхронизация лирики
│   ├── import.md             # /music:import <file> - Импорт трека
│   └── export.md             # /music:export <track> - Экспорт трека
└── review/
    ├── pr.md                 # /review:pr <number> - Ревью PR
    ├── code.md               # /review:code <file> - Ревью кода
    └── security.md           # /review:security - Аудит безопасности
```

### 3.2 Примеры Commands

#### `/project:status`
```markdown
---
description: Полный статус проекта
allowed-tools: Bash(read-only), Read, Grep, Glob, mcp__git
---

# Project Status Check

Выполни комплексную проверку состояния проекта:

## 1. Git Status
- Текущая ветка
- Незакоммиченные изменения
- Upstream status

## 2. Dependencies
- Проверить outdated packages
- Security vulnerabilities (npm audit)

## 3. Services
- Docker containers status
- Database connectivity
- Dev server status

## 4. Tests
- Последний test run status
- Coverage percentage

## 5. Build
- TypeScript errors
- Lint errors
- Build status

Вывести summary в формате таблицы.
```

#### `/feature:add`
```markdown
---
description: Создание новой фичи по шаблону
args: name
---

# Add Feature: $ARGUMENTS

## Создать структуру

1. **Компонент**: `apps/web/src/components/$ARGUMENTS/`
   - `index.tsx` - основной компонент
   - `$ARGUMENTS.module.css` - стили
   - `__tests__/$ARGUMENTS.test.tsx` - тесты

2. **API Route** (если нужно): `apps/web/src/app/api/$ARGUMENTS/`
   - `route.ts` - CRUD endpoints

3. **Types**: `apps/web/src/types/$ARGUMENTS.ts`

## Шаблоны
- Использовать существующие паттерны из проекта
- Следовать дизайн системе (CSS Custom Properties)
- TDD подход (тесты первыми)
```

#### `/music:sync`
```markdown
---
description: Синхронизация лирики для трека
args: trackId
allowed-tools: Bash, Read, mcp__filesystem
---

# Sync Lyrics for Track: $ARGUMENTS

## Workflow

1. Загрузить трек из БД по ID
2. Открыть Workshop (/music с PIN 1234)
3. Использовать Spacebar capture для тайминга
4. Сохранить timestamps в БД

## Автоматизация
- Предложить авто-детект BPM
- Предложить интерполяцию между markers
```

---

## 4. MCP СЕРВЕРЫ

### 4.1 Рекомендуемые MCP серверы

#### Уже подключены:
- `@anthropic/mcp-filesystem` - файловые операции
- `@anthropic/mcp-git` - git операции

#### Рекомендуется добавить:

**1. PostgreSQL MCP** (HIGH Priority)
```json
{
  "mcpServers": {
    "postgres": {
      "command": "npx",
      "args": ["-y", "@anthropic/mcp-server-postgres", "postgresql://oi_user:oi_password_dev@localhost:5432/oi_notes"]
    }
  }
}
```
**Возможности**:
- Прямые SQL запросы
- Schema inspection
- Data exploration
- Query optimization hints

**2. Puppeteer MCP** (MEDIUM Priority)
```json
{
  "mcpServers": {
    "puppeteer": {
      "command": "npx",
      "args": ["-y", "@anthropic/mcp-puppeteer"]
    }
  }
}
```
**Возможности**:
- Visual regression testing
- Screenshot comparison
- E2E automation
- PDF generation

**3. Memory MCP** (MEDIUM Priority)
```json
{
  "mcpServers": {
    "memory": {
      "command": "npx",
      "args": ["-y", "@anthropic/mcp-memory"]
    }
  }
}
```
**Возможности**:
- Persistent context между сессиями
- Project-specific knowledge
- Learning from past interactions

**4. Fetch MCP** (LOW Priority)
```json
{
  "mcpServers": {
    "fetch": {
      "command": "npx",
      "args": ["-y", "@anthropic/mcp-fetch"]
    }
  }
}
```
**Возможности**:
- API testing
- External service integration
- Webhook testing

### 4.2 Конфигурация MCP

Обновить файл: `.claude/settings.local.json`
```json
{
  "permissions": {
    "allow": [
      "WebFetch(domain:github.com)",
      "WebFetch(domain:api.anthropic.com)",
      "mcp__filesystem__*",
      "mcp__git__*",
      "mcp__postgres__query",
      "mcp__postgres__schema",
      "mcp__puppeteer__screenshot",
      "mcp__puppeteer__navigate",
      "mcp__memory__*",
      "WebSearch"
    ],
    "deny": [
      "mcp__postgres__drop_*",
      "mcp__postgres__truncate"
    ],
    "ask": [
      "mcp__postgres__insert",
      "mcp__postgres__update",
      "mcp__postgres__delete"
    ]
  },
  "mcpServers": {
    "postgres": {
      "command": "npx",
      "args": ["-y", "@anthropic/mcp-server-postgres", "postgresql://oi_user:oi_password_dev@localhost:5432/oi_notes"]
    }
  }
}
```

---

## 5. ИЕРАРХИЯ CLAUDE.md

### 5.1 Структура файлов

```
/Users/sile/
├── CLAUDE.md                           # Глобальные правила (уже есть)
│
└── Documents/Oi/Notes/
    ├── CLAUDE.md                       # Проектные правила (создать)
    │
    └── apps/
        └── web/
            ├── CLAUDE.md               # Web app правила (создать)
            │
            ├── src/
            │   ├── components/
            │   │   └── CLAUDE.md       # Компонентные правила (создать)
            │   │
            │   └── app/
            │       ├── api/
            │       │   └── CLAUDE.md   # API правила (создать)
            │       │
            │       └── music/
            │           └── CLAUDE.md   # Music module правила (создать)
            │
            └── prisma/
                └── CLAUDE.md           # Database правила (создать)
```

### 5.2 Содержание CLAUDE.md файлов

#### Root Project CLAUDE.md (`/Users/sile/Documents/Oi/Notes/CLAUDE.md`)
```markdown
# Oi/Notes Project Rules

## Архитектура
- Monorepo: pnpm workspaces + Turborepo
- Apps: `apps/web` (Next.js 15)
- Packages: `packages/config` (shared configs)

## Команды
- `pnpm dev` - запуск dev server (port 4311)
- `pnpm build` - production build
- `pnpm lint` - линтинг

## База данных
- Prisma + SQLite (dev) / PostgreSQL (prod)
- Миграции: `npx prisma migrate dev`
- Schema: `apps/web/prisma/schema.prisma`

## Деплой
- Vercel (автоматический из main)

## Секреты
- НЕ коммитить .env файлы
- DATABASE_URL в .env.local
```

#### Web App CLAUDE.md (`apps/web/CLAUDE.md`)
```markdown
# Web App Rules

## Структура
- App Router (Next.js 15)
- React 19 + TypeScript
- Tailwind CSS v4

## Страницы
- `/` - главная (split-screen)
- `/music` - музыкальный плеер
- `/notes` - заметки (MDX)
- `/branch`, `/dive`, `/signal` - разделы

## API Routes
- `/api/tracks` - CRUD для треков
- `/api/upload` - загрузка файлов

## Компоненты
- Использовать существующие паттерны
- Mobile-first responsive
- Accessibility (WCAG 2.1 AA)
```

#### Components CLAUDE.md (`apps/web/src/components/CLAUDE.md`)
```markdown
# Components Rules

## Паттерны
- Функциональные компоненты + hooks
- TypeScript strict mode
- CSS Modules или inline styles

## Naming
- PascalCase для компонентов
- camelCase для функций и переменных
- kebab-case для CSS классов

## Тестирование
- Jest + React Testing Library
- Тесты в `__tests__/` рядом с компонентом
- Coverage >80%

## Accessibility
- Semantic HTML
- ARIA labels для интерактивных элементов
- Keyboard navigation
```

#### API CLAUDE.md (`apps/web/src/app/api/CLAUDE.md`)
```markdown
# API Routes Rules

## Структура
- Route handlers в `route.ts`
- Валидация через Zod
- Error handling с proper status codes

## Методы
- GET - чтение данных
- POST - создание
- PUT - обновление
- DELETE - удаление

## Безопасность
- Валидировать все inputs
- Санитизировать outputs
- Rate limiting для публичных endpoints

## Ответы
// Success
return NextResponse.json({ success: true, data: ... });

// Error
return NextResponse.json(
  { success: false, error: "..." },
  { status: 400 }
);
```

#### Music Module CLAUDE.md (`apps/web/src/app/music/CLAUDE.md`)
```markdown
# Music Module Rules

## Функционал
- Музыкальный плеер с синхронизированной лирикой
- Workshop для создания/редактирования треков
- Strobe markers для визуальных эффектов

## Доступ к Workshop
- PIN: 1234 (5 кликов на заголовок)
- Admin mode для редактирования

## Audio
- HTML5 Audio API
- Web Audio API для анализа
- MediaSession API для controls

## Синхронизация
- Spacebar capture для timestamps
- Precision: ±50ms
- JSON export/import
```

#### Prisma CLAUDE.md (`apps/web/prisma/CLAUDE.md`)
```markdown
# Database Rules

## Schema
- `Track` - музыкальные треки
- `Lyric` - строки лирики с timestamps
- `StrobeMarker` - маркеры для визуальных эффектов

## Миграции
1. Изменить schema.prisma
2. `npx prisma migrate dev --name <description>`
3. `npx prisma generate`

## Seed данные
- `npx prisma db seed`

## Backup
- Перед деструктивными изменениями делать backup
- SQLite: копировать файл БД
- PostgreSQL: `pg_dump`
```

---

## 6. ФАЙЛЫ ДЛЯ СОЗДАНИЯ

### Приоритет HIGH (создать первыми)

| Файл | Назначение |
|------|------------|
| `.claude/agents/devops-engineer.md` | Docker, CI/CD, деплой |
| `.claude/skills/dev/quick-start.md` | Быстрый запуск проекта |
| `.claude/skills/dev/health-check.md` | Проверка сервисов |
| `.claude/skills/db/db-migrate.md` | Prisma миграции |
| `.claude/commands/project/status.md` | Статус проекта |
| `apps/web/CLAUDE.md` | Правила web app |
| `apps/web/src/app/api/CLAUDE.md` | Правила API |
| `CLAUDE.md` (root project) | Проектные правила |

### Приоритет MEDIUM

| Файл | Назначение |
|------|------------|
| `.claude/agents/security-auditor.md` | Аудит безопасности |
| `.claude/agents/performance-optimizer.md` | Оптимизация |
| `.claude/skills/debug/analyze-logs.md` | Анализ логов |
| `.claude/skills/test/run-tests.md` | Запуск тестов |
| `.claude/commands/feature/add.md` | Добавление фичи |
| `.claude/commands/music/sync.md` | Синхронизация лирики |
| `apps/web/src/components/CLAUDE.md` | Правила компонентов |
| `apps/web/src/app/music/CLAUDE.md` | Правила музыкального модуля |

### Приоритет LOW

| Файл | Назначение |
|------|------------|
| `.claude/agents/documentation-writer.md` | Документация |
| `.claude/agents/migration-specialist.md` | Миграции данных |
| `.claude/skills/deploy/build-check.md` | Проверка сборки |
| `.claude/skills/git/pr-create.md` | Создание PR |
| `.claude/commands/review/pr.md` | Ревью PR |
| `apps/web/prisma/CLAUDE.md` | Правила БД |

---

## 7. ИТОГОВАЯ КАРТА СИСТЕМЫ

```
Claude Code Ecosystem
├── CLAUDE.md (Global Rules)
│   └── Оркестратор, MCP обязателен, субагенты, skills
│
├── MCP Servers
│   ├── filesystem (файлы)
│   ├── git (версионирование)
│   └── postgres (база данных) [NEW]
│
├── Agents (10 total)
│   ├── admin-lab-builder (CRITICAL)
│   ├── player-enhancer (HIGH)
│   ├── data-integrator (HIGH)
│   ├── devops-engineer (HIGH) [NEW]
│   ├── test-engineer (MEDIUM)
│   ├── design-polisher (MEDIUM)
│   ├── security-auditor (MEDIUM) [NEW]
│   ├── performance-optimizer (MEDIUM) [NEW]
│   ├── documentation-writer (LOW) [NEW]
│   └── migration-specialist (LOW) [NEW]
│
├── Skills (15+ total)
│   ├── dev/ (3 skills)
│   ├── test/ (3 skills)
│   ├── debug/ (3 skills)
│   ├── db/ (3 skills)
│   ├── deploy/ (3 skills)
│   └── git/ (3 skills)
│
├── Commands (10+ total)
│   ├── /project:status, /project:init, /project:cleanup
│   ├── /feature:add, /feature:test, /feature:deploy
│   ├── /music:sync, /music:import, /music:export
│   └── /review:pr, /review:code, /review:security
│
└── Per-Directory CLAUDE.md (7 files)
    ├── /Notes/CLAUDE.md (project root)
    ├── apps/web/CLAUDE.md
    ├── apps/web/src/components/CLAUDE.md
    ├── apps/web/src/app/api/CLAUDE.md
    ├── apps/web/src/app/music/CLAUDE.md
    └── apps/web/prisma/CLAUDE.md
```

---

## Критичные файлы для реализации

1. **`/Users/sile/Documents/Oi/Notes/CLAUDE.md`** - Корневые правила проекта (архитектура, команды, деплой)
2. **`/Users/sile/Documents/Oi/Notes/.claude/agents/devops-engineer.md`** - DevOps агент для автоматизации инфраструктуры
3. **`/Users/sile/Documents/Oi/Notes/.claude/skills/dev/quick-start.md`** - Skill для быстрого запуска dev окружения
4. **`/Users/sile/Documents/Oi/Notes/.claude/commands/project/status.md`** - Command для проверки состояния проекта
5. **`/Users/sile/Documents/Oi/Notes/.claude/settings.local.json`** - Обновленная конфигурация с MCP серверами
