# Кастомные Субагенты для Музыкального Проекта

Специализированные агенты для разработки premium музыкального streaming experience с синхронизированными билингвальными текстами.

## Доступные Агенты

### 1. **admin-lab-builder** (CRITICAL Priority)
**Задача:** Создание Admin Laboratory для timing calibration с spacebar capture

**Ключевые фичи:**
- Spacebar timing capture (±50ms точность)
- Timeline editor для корректировки timestamps
- Undo/Redo функционал
- Export/Import JSON формата
- Play from specific line

**Использование:**
```
Запусти admin-lab-builder чтобы создать timing calibration tool
```

**Создаст:**
- `apps/web/src/app/music/lab/page.tsx`
- `apps/web/src/app/music/lab/__tests__/page.test.tsx`
- CSS стили в `globals.css`

---

### 2. **player-enhancer** (HIGH Priority)
**Задача:** Улучшение плеера до уровня превосходящего Apple Music

**Ключевые фичи:**
- Waveform visualization (Web Audio API)
- Touch gestures (swipe для next/prev)
- Микро-анимации и transitions
- Haptic-like feedback
- Performance оптимизация (60fps)

**Использование:**
```
Запусти player-enhancer для waveform visualization и touch gestures
```

**Улучшит:**
- `apps/web/src/components/music-player.tsx`
- `apps/web/src/components/synced-lyrics.tsx`

---

### 3. **data-integrator** (HIGH Priority)
**Задача:** Backend интеграция, API routes и dynamic routing

**Ключевые фичи:**
- Fix hardcoded данных в `[slug]/page.tsx`
- API routes для CRUD операций
- File upload для audio и covers
- Интеграция Studio с backend
- Zod validation

**Использование:**
```
Запусти data-integrator для backend интеграции и API routes
```

**Создаст:**
- `apps/web/src/app/api/music/route.ts`
- `apps/web/src/app/api/music/[slug]/route.ts`
- `apps/web/src/app/api/music/upload/route.ts`

---

### 4. **test-engineer** (MEDIUM Priority)
**Задача:** TDD подход и comprehensive test suite (>80% coverage)

**Ключевые фичи:**
- Unit tests для всех компонентов
- Integration tests для workflows
- API tests для routes
- Performance tests
- E2E tests (опционально Playwright)

**Использование:**
```
Запусти test-engineer для создания test suite
```

**Создаст:**
- `apps/web/src/components/__tests__/*.test.tsx`
- `apps/web/src/app/api/music/__tests__/*.test.ts`
- `jest.config.js` и `jest.setup.js`

---

### 5. **design-polisher** (MEDIUM Priority)
**Задача:** Финальный polish дизайна, UX и accessibility

**Ключевые фичи:**
- Visual hierarchy refinement
- Responsive breakpoints (320px - 4K)
- WCAG 2.1 AA accessibility
- Keyboard navigation
- ARIA labels и semantic HTML
- Loading/error states

**Использование:**
```
Запусти design-polisher для финального polish дизайна и accessibility
```

**Улучшит:**
- `apps/web/src/styles/globals.css`
- Все компоненты (ARIA, keyboard nav)

---

## Рекомендуемый Порядок Работы

### Фаза 1: Foundation (Критично)
```bash
1. Запусти data-integrator  # Fix dynamic routing, API routes
2. Запусти test-engineer    # Setup test infrastructure
```

### Фаза 2: Core Features (Высокий приоритет)
```bash
3. Запусти admin-lab-builder  # Timing calibration tool
4. Запусти player-enhancer    # Waveform и touch gestures
```

### Фаза 3: Polish (Средний приоритет)
```bash
5. Запусти design-polisher    # Финальный polish
6. Запусти test-engineer      # Добавить недостающие тесты
```

---

## Общие Принципы Всех Агентов

### 1. MCP File System обязателен
```typescript
✅ ИСПОЛЬЗОВАТЬ:
- mcp__filesystem__read_text_file(path)
- mcp__filesystem__write_file(path, content)
- mcp__filesystem__edit_file(path, edits)
- Grep(pattern, path)
- Glob(pattern)

❌ НЕ ИСПОЛЬЗОВАТЬ Bash для:
- cat file → использовать Read(file)
- grep pattern → использовать Grep(pattern)
- find -name → использовать Glob(pattern)
```

### 2. TDD Methodology
```
1. Написать тесты сначала
2. Убедиться что тесты падают
3. Реализовать функционал
4. Тесты проходят
5. Refactor для читаемости
```

### 3. Минимальные Diffs
- Редактировать только необходимое
- Не трогать работающий функционал
- Точечные улучшения

### 4. Соблюдение Дизайн Системы
```css
/* Используй существующие токены */
--color-accent-start: #caa57a
--dur-base: 220ms
--ease-elegant: cubic-bezier(0.25, 0.46, 0.45, 0.94)
```

### 5. Mobile-First
- Начинать с 320px
- Progressive enhancement
- Touch targets 44x44px minimum

### 6. 60fps Performance
- RequestAnimationFrame для анимаций
- Debounce для resize
- Виртуализация для длинных списков

### 7. НЕ создавать .md отчёты
- Отчёт устно в чат
- Без REPORT.md, SUMMARY.md и т.д.

---

## Технический Стек

**Frontend:**
- Next.js 15 (App Router)
- React 19
- TypeScript 5

**Audio:**
- HTML5 Audio API
- Web Audio API (для waveform)
- MediaSession API

**Testing:**
- Jest + React Testing Library
- Playwright (E2E, опционально)

**Styling:**
- CSS Custom Properties
- НЕТ Tailwind (используй globals.css)

**Validation:**
- Zod для схем данных

---

## Структура Проекта

```
apps/web/
├── src/
│   ├── app/
│   │   ├── music/
│   │   │   ├── page.tsx                # Каталог
│   │   │   ├── [slug]/page.tsx         # Трек (нужен fix)
│   │   │   ├── studio/page.tsx         # Студия
│   │   │   └── lab/page.tsx            # Lab (создаст admin-lab-builder)
│   │   └── api/
│   │       └── music/                  # API routes (создаст data-integrator)
│   ├── components/
│   │   ├── music-player.tsx            # Плеер (улучшит player-enhancer)
│   │   ├── synced-lyrics.tsx           # Лирика
│   │   └── music-catalog.tsx           # Каталог
│   ├── lib/
│   │   ├── mdx.ts                      # MDX loader
│   │   └── content-schema.ts           # Zod схемы
│   └── styles/
│       └── globals.css                 # Все стили (3625 строк)
└── __tests__/                          # Тесты (создаст test-engineer)
```

---

## Примеры Использования

### Создать Admin Lab
```
Запусти admin-lab-builder чтобы создать /music/lab страницу с spacebar capture
```

Агент:
1. Прочитает существующие компоненты
2. Создаст тесты в `__tests__/`
3. Реализует page.tsx для /music/lab
4. Добавит CSS стили
5. Протестирует в dev mode
6. Отчитается устно

### Добавить Waveform
```
Запусти player-enhancer для добавления waveform visualization
```

Агент:
1. Добавит Web Audio API анализ
2. Создаст waveform компонент
3. Интегрирует с music-player.tsx
4. Добавит touch gestures
5. Оптимизирует performance
6. Отчитается устно

### Исправить Dynamic Routing
```
Запусти data-integrator чтобы исправить hardcoded данные в [slug]/page.tsx
```

Агент:
1. Прочитает текущий [slug]/page.tsx
2. Создаст API routes
3. Исправит dynamic routing
4. Добавит file upload
5. Интегрирует Studio
6. Отчитается устно

---

## Проверка После Выполнения

После работы каждого агента проверь:

```bash
# 1. Dev server запускается
npm run dev

# 2. Тесты проходят
npm test

# 3. Нет TypeScript ошибок
npm run type-check

# 4. Coverage достаточный
npm run test:coverage
```

---

## Дополнительная Информация

**Анализ проекта показал:**
- ✅ 70% готово (плеер, лирика, дизайн)
- ❌ 30% нужно (admin lab, backend, тесты)

**Критичные задачи:**
1. Admin Lab (spacebar capture) - CRITICAL
2. Dynamic routing fix - HIGH
3. Waveform visualization - HIGH

**Средние задачи:**
4. Test coverage >80% - MEDIUM
5. Accessibility polish - MEDIUM

---

**Создано:** 2025-10-30  
**Версия:** 1.0.0  
**Автор:** Claude Code Orchestrator
