# Анализ Структуры Проекта Oi/Notes

**Дата анализа:** 2025-11-25  
**Статус:** Исследование завершено (план режим)

---

## 1. ТИП ПРОЕКТА: MONOREPO

### Структура:
```
Oi/Notes/ (root)
├── apps/
│   └── web/              # Next.js 15 приложение
├── packages/
│   └── config/           # Общие конфиги (ESLint, TypeScript)
├── backend/              # Backend логика
├── content/              # Контент (markdown, данные)
├── assets/               # Статические ресурсы
└── scripts/              # Утилиты и скрипты
```

**Тип монорепо:** pnpm workspaces + Turbo для build orchestration

---

## 2. ТЕХНОЛОГИЧЕСКИЙ СТЕК

### Frontend (Apps/Web):
- **Framework:** Next.js 15.5.5 (App Router)
- **UI Library:** React 19.1.0
- **Language:** TypeScript 5
- **Styling:** 
  - CSS Custom Properties (globals.css)
  - Tailwind CSS 4.1.17 (@tailwindcss/postcss)
  - PostCSS 8.5.6
- **Icons:** lucide-react 0.554.0
- **Content:** 
  - next-mdx-remote 5.0.0
  - remark-gfm 4.0.0
  - rehype-slug 6.0.0
  - rehype-autolink-headings 7.1.0

### Database:
- **ORM:** Prisma 5.22.0
- **Database:** PostgreSQL 16 (Docker)
- **Connection:** @prisma/client 5.22.0

### Validation:
- **Schema:** Zod 4.1.12

### Build & Development:
- **Package Manager:** pnpm 10.11.0
- **Monorepo Tool:** Turbo 2.3.3
- **Build Tool:** Next.js with Turbopack
- **Linting:** ESLint 9 + Next.js ESLint config
- **Dev Port:** 4311 (PORT=4311 next dev --turbopack)

### DevOps:
- **Git:** gitflow (main branch, feature branches)
- **CI/CD:** Vercel (.vercel/project.json)
- **Containerization:** Docker (docker-compose.yml с PostgreSQL)
- **Node Version:** Compatible with turbo 2.3.3

---

## 3. СТРУКТУРА ПАПОК И НАЗНАЧЕНИЕ

### Root Level:
```
/Users/sile/Documents/Oi/Notes/
├── apps/
│   └── web/                    # Основное Next.js приложение
├── packages/
│   └── config/                 # Общие конфиги для всего монорепо
├── backend/                    # Backend логика (Python/Node?)
├── content/                    # Контент для статьей/документов
├── assets/                     # Изображения, иконки и т.д.
├── scripts/                    # Утилиты автоматизации
├── styles/                     # Глобальные стили?
├── patches/                    # Git patch для Next.js 15.5.5
├── node_modules/               # Dependencies (pnpm)
├── .turbo/                     # Turbo кеш
├── .vercel/                    # Vercel конфиг
├── .claude/                    # Claude Code агенты и настройки
├── pnpm-lock.yaml              # Lock файл pnpm
├── pnpm-workspace.yaml         # Workspace конфиг
├── turbo.json                  # Turbo конфиг
├── docker-compose.yml          # PostgreSQL контейнер
└── README.md, ROADMAP.md, VISION.md, 5pro-fix.md
```

### apps/web/ структура:

```
apps/web/
├── src/
│   ├── app/
│   │   ├── page.tsx                # Главная страница (/)
│   │   ├── layout.tsx              # Root layout
│   │   ├── api/
│   │   │   ├── upload/route.ts      # File upload endpoint
│   │   │   └── tracks/
│   │   │       ├── route.ts         # GET/POST /api/tracks
│   │   │       └── [id]/
│   │   │           └── route.ts     # GET/PUT /api/tracks/[id]
│   │   ├── music/
│   │   │   ├── page.tsx             # Каталог музыки
│   │   │   ├── [slug]/page.tsx      # Трек (нужен fix для dynamic routing)
│   │   │   ├── studio/page.tsx      # Studio для редактирования
│   │   │   └── lab/page.tsx         # Lab для timing calibration
│   │   ├── notes/
│   │   │   ├── page.tsx             # Список заметок
│   │   │   └── [slug]/page.tsx      # Отдельная заметка
│   │   ├── branch/page.tsx
│   │   ├── dive/page.tsx
│   │   └── signal/page.tsx
│   ├── components/
│   │   ├── music-player.tsx
│   │   ├── split-screen.tsx
│   │   ├── catalog-grid.tsx
│   │   ├── feature-carousel.tsx
│   │   ├── video-card.tsx
│   │   ├── icons/
│   │   └── ... (14+ компонентов)
│   ├── lib/
│   │   ├── mdx.ts
│   │   ├── content-schema.ts
│   │   └── prisma.ts (планируется)
│   └── styles/
│       └── globals.css             # 3625 строк CSS
├── prisma/
│   └── schema.prisma               # DB schema
├── public/
│   └── uploads/                    # User uploads
├── .env & .env.local
├── next.config.ts
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
├── eslint.config.mjs
└── package.json
```

---

## 4. КОНФИГУРАЦИОННЫЕ ФАЙЛЫ

### В корне проекта:
1. **pnpm-workspace.yaml** - Workspace конфиг
2. **turbo.json** - Build оркестрация
3. **docker-compose.yml** - PostgreSQL 16
4. **.vercel/project.json** - Vercel deployment
5. **package.json** (root) - Scripts для dev/build/lint/format

### В apps/web/:
1. **next.config.ts** - Next.js конфигурация
2. **tsconfig.json** - TypeScript конфигурация
3. **tailwind.config.ts** - Tailwind CSS
4. **postcss.config.js** - PostCSS
5. **.env & .env.local** - Environment переменные
6. **eslint.config.mjs** - ESLint конфиг

### В packages/config/:
1. **eslint.config.js** - Shared ESLint config
2. **tsconfig.base.json** - Shared TypeScript base

---

## 5. CLAUDE ПАПКА С АГЕНТАМИ

### Структура .claude/:
```
.claude/
├── agents/
│   ├── README.md                    # Главная инструкция для всех агентов
│   ├── admin-lab-builder.md         # Timing calibration tool (CRITICAL)
│   ├── player-enhancer.md           # Waveform + touch gestures (HIGH)
│   ├── data-integrator.md           # Backend API routes (HIGH)
│   ├── test-engineer.md             # Test suite (MEDIUM)
│   └── design-polisher.md           # UI/UX polish (MEDIUM)
└── settings.local.json              # Permissions для agents
```

### Агенты (5 специализированных субагентов):

1. **admin-lab-builder** (CRITICAL Priority)
   - Создание Lab страницы с spacebar timing capture (±50ms)
   - Timeline editor, Undo/Redo, Export/Import JSON
   - Play from specific line

2. **player-enhancer** (HIGH Priority)
   - Waveform visualization (Web Audio API)
   - Touch gestures (swipe для next/prev)
   - Микро-анимации и transitions

3. **data-integrator** (HIGH Priority)
   - Fix hardcoded данных в [slug]/page.tsx
   - API routes для CRUD операций
   - File upload для audio и covers
   - Zod validation

4. **test-engineer** (MEDIUM Priority)
   - Unit tests (Jest + RTL)
   - Integration tests
   - E2E tests (Playwright опционально)
   - Target: >80% coverage

5. **design-polisher** (MEDIUM Priority)
   - Accessibility (WCAG 2.1 AA)
   - Responsive (320px-4K)
   - Keyboard navigation
   - Loading/error states

---

## 6. ТЕХНИЧЕСКИЕ ОСОБЕННОСТИ

### Дизайн система:
```css
--color-accent-start: #caa57a (золотистый)
--dur-base: 220ms
--ease-elegant: cubic-bezier(0.25, 0.46, 0.45, 0.94)
```

### Audio API:
- HTML5 `<audio>` элемент
- Web Audio API для waveform анализа
- MediaSession API для controls

### Главные фичи:
- Split-screen дизайн (винтажный)
- Music player с синхронизацией лирик
- Notes/articles с MDX
- Dynamic routing по slug
- PostgreSQL с Prisma ORM

---

## 7. СТАТУС ПРОЕКТА

### Готово (70%):
✅ Next.js 15 App Router  
✅ Prisma + PostgreSQL  
✅ Music player компонент  
✅ Split-screen UI  
✅ Styling система  
✅ MDX для контента  
✅ Основные страницы  

### Нужно (30%):
❌ Admin Lab (timing calibration)  
❌ Waveform visualization  
❌ Touch gestures  
❌ Dynamic routing fix  
❌ API routes CRUD  
❌ File upload  
❌ Test suite (>80% coverage)  
❌ Accessibility polish  

---

## 8. GIT СТРУКТУРА

### Branches:
- **main** - production branch (текущая)
- **feat-music-lyrics-player-Quw6Q**
- **feat-music-translate-6W8cc**
- **feat-music-translate-lmIWS**

### Последние коммиты:
```
5f63ea1 Исправлено: добавлены lucide-react иконки
4f9f9f6 Обновлён дизайн музыкального плеера
6f8b547 Добавлен полнофункциональный музыкальный плеер
ae04d31 Редизайн дашборда: новый сплит-скрин
0976d75 Добавлен интерактивный сплит-скрин
```

---

## ИТОГОВАЯ АРХИТЕКТУРА

```
Oi/Notes (Monorepo)
│
├─ pnpm workspaces + Turbo 2.3.3
│
├─ apps/web (Next.js 15 + React 19)
│  ├─ PostgreSQL + Prisma ORM
│  ├─ Tailwind CSS 4 + Custom CSS
│  ├─ TypeScript 5
│  └─ lucide-react icons
│
├─ packages/config
│  ├─ ESLint 9
│  └─ TypeScript base
│
├─ .claude/agents (5 субагентов)
│  ├─ admin-lab-builder (CRITICAL)
│  ├─ player-enhancer (HIGH)
│  ├─ data-integrator (HIGH)
│  ├─ test-engineer (MEDIUM)
│  └─ design-polisher (MEDIUM)
│
└─ DevOps
   ├─ Docker (PostgreSQL 16)
   ├─ Vercel deployment
   └─ Git workflow
```

---

## КЛЮЧЕВЫЕ ВЫВОДЫ

1. **Монорепо с pnpm + Turbo** - готово для масштабирования
2. **Полная технологическая база** - Next.js 15, React 19, PostgreSQL готовы
3. **Хорошо организованная структура** - четкое разделение concerns
4. **5 специализированных агентов** - для разных областей
5. **70% функционала готово** - остается 30% для завершения
6. **Критичные задачи** - Admin Lab (CRITICAL), API routes + Waveform (HIGH)

---

**Анализ завершен. Готово к утверждению плана и делегированию задач.**
