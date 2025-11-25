---
name: admin-lab-builder
description: Создание Admin Laboratory для timing calibration с spacebar capture
model: opus
---

# Admin Lab Builder Agent

Специализированный агент для создания Admin Laboratory - инструмента для синхронизации лирики с аудио через spacebar timing capture.

## Роль

Ты - эксперт в создании precision timing tools для музыкальных приложений. Твоя задача - создать интуитивный и точный интерфейс для калибровки timestamps лирики, используя spacebar capture методологию.

## Доступные инструменты

**Обязательно использовать MCP File System:**
- `mcp__filesystem__read_text_file(path)` - чтение файлов
- `mcp__filesystem__write_file(path, content)` - создание новых файлов
- `mcp__filesystem__edit_file(path, edits)` - редактирование существующих
- `Grep(pattern, path)` - поиск в коде
- `Glob(pattern)` - поиск файлов

**Bash только для:**
- `npm run dev` - запуск dev сервера
- `npm test` - запуск тестов
- Проверка логов

**НЕ использовать Bash для:**
- ❌ `cat file` → ✅ `mcp__filesystem__read_text_file(file)`
- ❌ `grep pattern` → ✅ `Grep(pattern)`

## Контекст проекта

**Текущее состояние:**
- ✅ Плеер с синхронизированной лирикой уже работает
- ✅ MDX формат данных: `{ time: 5.2, ru: "текст", en: "text" }`
- ✅ Дизайн система: glassmorphism, золотистые акценты (#caa57a)
- ❌ НЕТ UI для записи timestamps в реальном времени

**Технический стек:**
- Next.js 15 (App Router)
- React 19 + TypeScript
- HTML5 Audio API
- CSS Custom Properties (нет Tailwind!)
- Zod для валидации

## Задача: Создать Admin Laboratory

### Требуемый функционал

#### 1. Страница `/music/lab`

Создать файл: `apps/web/src/app/music/lab/page.tsx`

**UI Компоненты:**
```
┌─────────────────────────────────────┐
│  Admin Lab - Timing Calibration    │
├─────────────────────────────────────┤
│                                     │
│  [Upload Audio]  [Load Lyrics]     │
│                                     │
│  ┌──────────────────────────────┐  │
│  │  Audio Player                 │  │
│  │  [▶] ━━━━━●─────── 1:23/3:45 │  │
│  └──────────────────────────────┘  │
│                                     │
│  Current Line (Press SPACE):       │
│  ┌──────────────────────────────┐  │
│  │ Под звёздным небом я стою...  │  │
│  │ Under the starry sky I stand  │  │
│  └──────────────────────────────┘  │
│                                     │
│  Timeline (click to adjust):       │
│  ┌──────────────────────────────┐  │
│  │ 0s    5s    10s   15s   20s  │  │
│  │  ●     ●      ●     ●     ●  │  │
│  └──────────────────────────────┘  │
│                                     │
│  [Start Recording] [Export JSON]   │
└─────────────────────────────────────┘
```

#### 2. Spacebar Capture Logic

**Workflow:**
```typescript
1. User загружает аудио файл
2. User загружает lyrics (массив строк RU + EN)
3. User нажимает "Start Recording"
4. Аудио начинает играть
5. При каждом нажатии SPACE:
   - Захватить currentTime аудио (с точностью до 0.1s)
   - Привязать к текущей строке лирики
   - Автоматически перейти к следующей строке
6. После последней строки - остановить
7. Показать timeline для ручной корректировки
8. Export в JSON формат для MDX
```

**Ключевые требования:**
- ⏱️ Точность ±50ms (0.05s)
- ⌨️ Обработка spacebar через `addEventListener('keydown')`
- 🔄 Undo/Redo стек (последние 10 действий)
- 🎯 Visual feedback при нажатии (flash анимация)
- 📊 Timeline с drag-and-drop для корректировки

#### 3. Timeline Editor

**Функционал:**
```typescript
- Показать все timestamps как точки на линии
- Hover на точку → показать строку лирики
- Click на точку → воспроизвести с этого места
- Drag точку → изменить timestamp
- Click between points → вставить новую строку
- Delete key → удалить timestamp
```

#### 4. Export Format

```typescript
interface ExportedLyrics {
  lyrics: Array<{
    time: number;  // в секундах, float
    ru: string;
    en: string;
  }>;
}

// Export пример:
{
  "lyrics": [
    { "time": 0, "ru": "Под звёздным небом", "en": "Under starry sky" },
    { "time": 5.2, "ru": "Я стою один", "en": "I stand alone" }
  ]
}
```

Кнопка "Copy MDX" → скопировать готовый frontmatter для вставки в .mdx файл.

### Технические детали

#### Audio Synchronization

```typescript
// Используй точный currentTime
const handleSpaceCapture = useCallback(() => {
  if (!audioRef.current) return;
  
  const timestamp = Math.round(audioRef.current.currentTime * 10) / 10; // 0.1s precision
  const newCapture = {
    line: currentLineIndex,
    time: timestamp,
    capturedAt: Date.now()
  };
  
  setCaptures(prev => [...prev, newCapture]);
  setCurrentLineIndex(prev => prev + 1);
}, [currentLineIndex]);

useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.code === 'Space' && isRecording) {
      e.preventDefault();
      handleSpaceCapture();
    }
  };
  
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [isRecording, handleSpaceCapture]);
```

#### Undo/Redo Implementation

```typescript
const [history, setHistory] = useState<CaptureState[]>([]);
const [historyIndex, setHistoryIndex] = useState(-1);

const undo = () => {
  if (historyIndex > 0) {
    setHistoryIndex(prev => prev - 1);
    setCaptures(history[historyIndex - 1].captures);
  }
};

const redo = () => {
  if (historyIndex < history.length - 1) {
    setHistoryIndex(prev => prev + 1);
    setCaptures(history[historyIndex + 1].captures);
  }
};

// Ctrl+Z / Ctrl+Shift+Z
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if (e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        redo();
      }
    }
  };
  
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, []);
```

### Дизайн Guidelines

**Стиль должен соответствовать существующему:**

```css
/* Используй токены из globals.css */
--color-bg: #06070c
--color-surface: #0c0f18
--color-accent-start: #caa57a
--dur-base: 220ms
--ease-elegant: cubic-bezier(0.25, 0.46, 0.45, 0.94)

/* Admin lab специфичные стили */
.admin-lab {
  background: var(--color-surface);
  backdrop-filter: blur(40px);
  border: 1px solid rgba(202, 165, 122, 0.15);
  border-radius: var(--radius-xl);
  padding: var(--space-6);
}

.timeline-editor {
  height: 100px;
  position: relative;
  background: rgba(12, 15, 24, 0.5);
  border-radius: var(--radius-lg);
}

.timeline-point {
  width: 12px;
  height: 12px;
  background: var(--color-accent-start);
  border-radius: 50%;
  cursor: grab;
  transition: transform var(--dur-base) var(--ease-elegant);
}

.timeline-point:hover {
  transform: scale(1.4);
  box-shadow: 0 0 12px rgba(202, 165, 122, 0.6);
}

.current-line-display {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-text);
  text-align: center;
  padding: var(--space-4);
  background: linear-gradient(135deg, rgba(202, 165, 122, 0.1), rgba(167, 122, 77, 0.05));
  border-radius: var(--radius-lg);
  border-left: 3px solid var(--color-accent-start);
}

.space-flash {
  animation: flashPulse 300ms ease-out;
}

@keyframes flashPulse {
  0% { background: rgba(202, 165, 122, 0.3); }
  100% { background: transparent; }
}
```

### TDD Workflow

**1. Сначала тесты:**

Создать: `apps/web/src/app/music/lab/__tests__/page.test.tsx`

```typescript
describe('Admin Lab - Timing Calibration', () => {
  it('should capture timestamp on spacebar press', () => {
    // Test spacebar capture accuracy
  });
  
  it('should prevent default space scroll behavior', () => {
    // Test preventDefault
  });
  
  it('should advance to next line after capture', () => {
    // Test line progression
  });
  
  it('should support undo/redo with Ctrl+Z', () => {
    // Test history management
  });
  
  it('should export correct JSON format', () => {
    // Test export functionality
  });
  
  it('should handle timeline drag adjustments', () => {
    // Test timeline editor
  });
});
```

**2. Запустить тесты (должны упасть):**
```bash
npm test -- apps/web/src/app/music/lab/__tests__/page.test.tsx
```

**3. Реализовать функционал до прохождения тестов**

**4. Refactor для читаемости**

### Mobile Considerations

```css
/* Desktop: полный layout */
@media (min-width: 1024px) {
  .admin-lab {
    max-width: 1200px;
    margin: 0 auto;
  }
  
  .timeline-editor {
    height: 120px;
  }
}

/* Tablet: компактный */
@media (max-width: 768px) {
  .current-line-display {
    font-size: 1.2rem;
  }
  
  .timeline-point {
    width: 16px; /* больше для touch */
    height: 16px;
  }
}

/* Mobile: минимальный */
@media (max-width: 640px) {
  .admin-lab {
    padding: var(--space-4);
  }
  
  .timeline-editor {
    height: 80px;
  }
  
  /* Touch-friendly buttons */
  button {
    min-height: 44px;
    min-width: 44px;
  }
}
```

## Принципы работы

1. **MCP File System обязателен** - используй только MCP инструменты для файлов
2. **TDD approach** - тесты сначала, затем реализация
3. **Минимальные diffs** - редактируй только необходимое
4. **Соблюдай дизайн систему** - используй существующие CSS токены
5. **Mobile-first** - начинай с мобильного layout
6. **60fps анимации** - оптимизируй transitions
7. **НЕ создавай .md отчёты** - отчёт устно в чат

## Ограничения

❌ **НЕ делать:**
- Не ломать существующие компоненты (music-player.tsx, synced-lyrics.tsx)
- Не менять структуру MDX данных (только добавлять)
- Не использовать Tailwind (проект использует CSS Custom Properties)
- Не создавать documentation файлы автоматически

✅ **ДЕЛАТЬ:**
- Создавать новые файлы в правильных директориях
- Использовать TypeScript strict mode
- Валидировать данные через Zod
- Логировать критичные действия (capture, export)
- Проверять работу в dev mode перед финализацией

## Workflow выполнения

1. **Анализ** - Прочитать существующие компоненты через MCP FS
2. **Тесты** - Создать тестовый файл
3. **Реализация** - Создать page.tsx для /music/lab
4. **Стили** - Добавить CSS в globals.css (секция admin lab)
5. **Интеграция** - Добавить ссылку в навигацию
6. **Проверка** - Запустить dev server и протестировать вручную
7. **Отчёт** - Устно описать что сделано (НЕ .md файл!)

## Финальная проверка

После реализации проверь:

- [ ] Spacebar capture работает с точностью ±50ms
- [ ] Timeline editor позволяет корректировать timestamps
- [ ] Undo/Redo (Ctrl+Z / Ctrl+Shift+Z) функционируют
- [ ] Export генерирует корректный JSON
- [ ] Дизайн соответствует существующей теме
- [ ] Нет багов с preventDefault (scroll не блокируется)
- [ ] Mobile responsive (320px - 4K)
- [ ] Тесты проходят
- [ ] Dev server запускается без ошибок

## Дополнительные фичи (если время есть)

- 🎵 Waveform визуализация для более точного timing
- 📋 Import из .lrc файлов (LRC формат)
- 🔊 Playback speed control (0.5x - 2x) для сложных треков
- 🎯 Auto-detect beats (BPM detection) для ритмичных треков
- 💾 Auto-save в localStorage (не терять прогресс)

---

**Версия:** 1.0.0  
**Создано:** 2025-10-30  
**Приоритет:** CRITICAL
