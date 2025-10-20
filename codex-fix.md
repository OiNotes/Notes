# Задача для Codex: Исправление Theater Mode в VideoCard

## Контекст проекта
Next.js 15.5.5 (Turbopack) приложение - luxury fashion каталог с видео-плеером в стиле Apple Music Clips.

## Целевая функциональность
Создать "theater mode" для видео-плеера, который:
1. При нажатии Play видео должно расширяться в fullscreen overlay
2. Затемненный backdrop должен покрывать весь экран
3. Клик по backdrop (пустому месту) должен выходить из theater mode (ставить видео на паузу)
4. Escape должен выходить из theater mode
5. Видео должно быть центрировано без зазоров по бокам
6. Звук должен быть включен по умолчанию

## Хронология изменений и попыток

### Попытка 1: Базовая реализация
- Использовал `transform: scale(1.25)` на `.video-card--theater`
- **Проблема**: Transform ломает `position: fixed` у backdrop (делает его relative к родителю)
- **Результат**: Backdrop не покрывает экран, клик не работает

### Попытка 2: Вынос backdrop из frame
- Переместил `<div className="video-card__backdrop">` из `video-card__frame` в родительский `figure`
- Изменил backdrop `z-index: -1` → `z-index: 50`
- **Проблема**: `.video-card--theater` имеет `z-index: 100`, поэтому backdrop всё равно за видео
- **Результат**: Backdrop виден, но клик на него не срабатывает

### Попытка 3: Fullscreen через position fixed
- Убрал `transform: scale(1.25)` с `.video-card--theater`
- Добавил `position: fixed; inset: 0; display: flex; z-index: 9999`
- Поднял backdrop `z-index: 9998`
- Изменил frame на `max-width: 90vw; max-height: 90vh`
- Изменил video `object-fit: cover` → `object-fit: contain`
- **Проблема**: Пользователь сообщает что "не работает" (нужно проверить что именно)

## Текущее состояние кода

### video-card.tsx (lines 218-287)
```tsx
return (
  <figure className={`video-card ${isTheaterMode ? "video-card--theater" : ""}`} data-theater-mode={isTheaterMode}>
    {isTheaterMode && (
      <div
        className="video-card__backdrop"
        onClick={exitTheaterMode}
        aria-label="Выйти из режима кинотеатра"
      />
    )}
    <div
      className="video-card__frame"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={onUserActivity}
      onTouchStart={onUserActivity}
      onClick={onUserActivity}
    >
      <video
        ref={videoRef}
        className="video-card__video"
        src={source}
        playsInline
        preload="metadata"
      />
      {!isPlaying && <div className="video-card__poster" />}
      {!isPlaying && (
        <button
          type="button"
          className="video-card__play-btn"
          onClick={togglePlay}
          aria-label="Воспроизвести видео"
        >
          <PlayIcon />
        </button>
      )}
      <div
        className="video-card__controls"
        role="group"
        aria-label="Видео контролы"
        data-visible={showControls && isPlaying}
      >
        {/* ... controls ... */}
      </div>
    </div>
    {caption ? <figcaption className="video-card__caption">{caption}</figcaption> : null}
  </figure>
);
```

### globals.css (video-card styles)
```css
.video-card {
  display: grid;
  justify-items: center;
  gap: var(--space-3);
  margin: 0;
  position: relative;
  z-index: 1;
  transform-origin: center center;
  transition: transform var(--dur-elegant) var(--ease-smooth);
}

/* Режим кинотеатра - fullscreen overlay */
.video-card--theater {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: none;
}

.video-card__frame {
  position: relative;
  width: min(100%, 940px);
  border-radius: var(--radius-2xl);
  background: linear-gradient(160deg, color-mix(in oklab, var(--color-surface) 90%, var(--color-bg)), var(--color-surface-alt));
  border: 1px solid color-mix(in srgb, var(--color-border) 80%, transparent);
  box-shadow: var(--shadow-md);
  overflow: hidden;
  transition: all var(--dur-elegant) var(--ease-smooth);
  transform-origin: center center;
}

.video-card--theater .video-card__frame {
  max-width: 90vw;
  max-height: 90vh;
  width: auto;
  height: auto;
  border-radius: var(--radius-lg);
  background: transparent;
  border: none;
  box-shadow: 0 48px 140px rgba(0, 0, 0, 0.85), 0 0 0 1px rgba(202, 165, 122, 0.3);
}

/* Backdrop затемнение */
.video-card__backdrop {
  position: fixed;
  inset: 0;
  background: rgba(6, 7, 12, 0.96);
  z-index: 9998;
  cursor: pointer;
  animation: backdropFadeIn var(--dur-elegant) var(--ease-smooth);
}

.video-card__video {
  display: block;
  width: 100%;
  aspect-ratio: 16 / 9;
  background: #000;
}

.video-card--theater .video-card__video {
  aspect-ratio: unset;
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.video-card__poster {
  position: absolute;
  inset: 0;
  background: #000;
  z-index: 1;
  pointer-events: none;
}
```

## Известные проблемы (по скриншоту пользователя)
1. Видео poster виден поверх воспроизводящегося видео
2. Проигрыватель (frame) больше самого видео - зазоры слева и справа
3. Клик на пустое место (backdrop) не выходит из theater mode

## Возможные причины проблем

### Проблема 1: Poster не скрывается
- `{!isPlaying && <div className="video-card__poster" />}` должен скрывать poster при `isPlaying === true`
- Возможно, state `isPlaying` не обновляется корректно
- Или poster имеет слишком высокий z-index

### Проблема 2: Frame больше видео
- `max-width: 90vw; max-height: 90vh` на frame
- Но видео внутри имеет `aspect-ratio: unset` и `object-fit: contain`
- Frame не адаптируется под aspect ratio видео

### Проблема 3: Backdrop не кликабельный
- Backdrop должен иметь `z-index: 9998`, frame - внутри `.video-card--theater` с `z-index: 9999`
- Но backdrop ПРЕДШЕСТВУЕТ frame в DOM, значит он под ним!
- Нужно либо поднять backdrop выше через z-index, либо изменить порядок в DOM

## Референсы для вдохновения
- Apple Music Clips player
- YouTube theater mode
- Netflix fullscreen player

## Задача
Исправь theater mode, чтобы:
1. ✅ При клике Play видео расширялось в fullscreen overlay
2. ✅ Backdrop покрывал весь экран с затемнением
3. ❌ **Клик по backdrop закрывал theater mode (ГЛАВНОЕ)**
4. ✅ Escape закрывал theater mode
5. ❌ **Видео занимало максимум пространства без зазоров**
6. ❌ **Poster скрывался при воспроизведении**

## Технические детали
- Файлы: `/apps/web/src/components/video-card.tsx`, `/apps/web/src/styles/globals.css`
- Next.js 15.5.5 с Turbopack
- React 19
- Не используй внешние библиотеки

## Подсказки
1. Возможно, нужно изменить порядок backdrop и frame в DOM
2. Или использовать React Portal для backdrop
3. Или правильно настроить z-index так, чтобы backdrop был кликабельным поверх всего, но видео отрисовывалось выше визуально
4. Frame должен иметь aspect ratio видео, а не фиксированные max-width/max-height
5. Проверь логику условного рендеринга poster
