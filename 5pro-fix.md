# 5pro fix — просьба помочь с Theater Mode у видеоплеера

Проект: Next.js 15 (App Router, Turbopack), страница заметки `/notes/[slug]`.

Нужно добиться трех вещей:
1) В режиме кинотеатра вокруг видео не должно оставаться «следов» рамок/тени/фона фрейма.
2) Выход из режима кинотеатра по клику/тапу в любом месте вне проигрывателя (по всему тёмному фону).
3) При воспроизведении в режиме кинотеатра верхняя обложка страницы (Hero) не должна быть видна.

Симптомы, которые наблюдаем сейчас:
- Плеер остаётся с визуальными «краями»/рамками у сторон (видно на скриншоте слева).
- Клик по пустому месту вокруг видео не закрывает режим (срабатывает только внутри области плеера).
- Верхняя обложка (Hero) остаётся видимой поверх/рядом во время режима кинотеатра.

---

## Краткая хронология попыток

1) Масштаб через `transform: scale(1.25)` у `.video-card--theater`.
   - Минус: ломает контекст позиционирования, бекдроп с `position: fixed` визуально оказывается под фреймом и не перекрывает экран, клики не доходят.

2) Перенос бекдропа выше/ниже по DOM и игра с `z-index`.
   - Минус: при `z-index` фрейма выше — бекдроп не кликается; при `z-index` бекдропа выше — перекрывает и контролы. Одновременно обеспечить клики по фону и работоспособность контролов не получилось.

3) Полноэкранный режим через `position: fixed; inset: 0` для контейнера театра.
   - Пробовали задавать `max-width/max-height` и `object-fit: contain` для видео, меняли фон фрейма и тени. Но на части размеров/видео всё равно остаются «светлые следы» (тень, границы, зазоры).
   - Клик по пустому месту всё ещё ведёт себя нестабильно.

Итог: в совокупности — не достигли всех трёх целей сразу.

---

## Релевантный код (фрагменты)

Компонент плеера: `apps/web/src/components/video-card.tsx`

```tsx
export function VideoCard({ source, poster, title, caption }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isTheaterMode, setIsTheaterMode] = useState(false);

  // Выход по Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isTheaterMode) {
        setIsTheaterMode(false);
        videoRef.current?.pause();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isTheaterMode]);

  // Разметка (упрощённо)
  return (
    <figure className={`video-card ${isTheaterMode ? 'video-card--theater' : ''}`}>
      {/* Бекдроп должен закрывать режим по клику */}
      {isTheaterMode && (
        <div className="video-card__backdrop" onClick={() => {
          setIsTheaterMode(false);
          videoRef.current?.pause();
        }} />
      )}

      <div className="video-card__frame">
        <video ref={videoRef} className="video-card__video" src={source} poster={poster} playsInline preload="metadata" />
        {!isPlaying && <div className="video-card__poster" />}
        {/* ...кнопка Play, кастом‑контролы... */}
      </div>
    </figure>
  );
}
```

Стили: `apps/web/src/styles/globals.css` (вырезка)

```css
.video-card {
  position: relative;
  z-index: 1;
}

/* Театр */
.video-card--theater {
  position: fixed; /* пробовали также scale() */
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.video-card__frame {
  position: relative;
  width: min(100%, 940px);
  border-radius: var(--radius-2xl);
  background: var(--color-surface); /* здесь и появляются «следы/края» */
  border: 1px solid color-mix(in srgb, var(--color-border) 80%, transparent);
  box-shadow: var(--shadow-md);
  overflow: hidden;
}

/* В режиме театра пробовали разные варианты */
.video-card--theater .video-card__frame {
  /* Вариант A */
  max-width: 90vw;
  max-height: 90vh;
  /* Вариант B */
  /* width: min(100vw, calc(100vh * var(--video-aspect)));
     height: min(100vh, calc(100vw / var(--video-aspect))); */
  border: none; /* пробовали убирать */
  background: transparent; /* и так, и #000 */
  box-shadow: none; /* пробовали убирать тени */
}

.video-card__backdrop {
  position: fixed;
  inset: 0;
  background: rgba(6,7,12,0.96);
  z-index: 9998; /* ниже фрейма, выше остального */
}

.video-card__video {
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

/* Оверлей‑постер (чтобы скрыть нативный) */
.video-card__poster {
  position: absolute;
  inset: 0;
  background: #000;
  z-index: 1;
}

/* Хотим скрывать Hero во время theater */
.theater-mode-active .hero-teaser {
  opacity: 0;
  pointer-events: none;
}
```

---

## Что именно не заработало
- Даже без `border` и `box-shadow` у `.video-card__frame` остаются визуальные «следы»/края по бокам на темном фоне, когда видео вписывается `object-fit: contain` (возможно, из‑за фонового цвета или несовпадения радиусов рамки/видео и/или из‑за рендеринга на разных DPR).
- Клик по пустому месту вне видео не всегда закрывает театр: при разных комбинациях `z-index` либо перекрываются контролы, либо клики не доходят до бекдропа.
- Hero остаётся видимым (возможно, специфичность стилей/слои или порядок монтирования компонента).

---

## Просьба к 5pro: как правильно сделать
1) Схема слоёв для стабильного закрытия по клику
   - Как лучше организовать DOM: `figure` → `backdrop` (слой N) → `frame` (слой N+1) → `video`/контролы, чтобы:
     - клики по бекдропу закрывали режим;
     - клики по контролам не перехватывались бекдропом;
     - фрейм не давал «просветов» (никаких box‑shadow/border/фона, кроме самого видео).
   - Корректные значения `z-index` и `pointer-events`?

2) Вписывание без «следов»
   - Как корректно вычислять размеры фрейма, чтобы точно соответствовать видео и не оставлять зазоров/фона: формула `width = min(100vw, 100vh * aspect)` и `height = min(100vh, 100vw / aspect)` подойдёт?
   - Нужно ли подменять фон у `.video-card__frame` на `transparent` и указывать фон только у самого `<video>`? Стоит ли синхронизировать `border-radius` у `frame` и `video`?

3) Скрытие Hero
   - Достаточно ли класса на `<body>` (например, `theater-mode-active`) с простым правилом `.theater-mode-active .hero-teaser { opacity: 0; pointer-events: none; }`?
   - Или лучше условно не монтировать `HeroTeaser` в дереве при активном театре?

4) Edge‑кейсы
   - Нужна ли специальная обработка для iOS Safari (слои, backdrop, inline‑воспроизведение)?
   - Есть ли рекомендуемый способ для «escape on background click» без конфликтов с мобильными событиями (tap/scroll)?

Если дадите эталонный порядок слоёв и точные CSS/JS‑правила, мы быстро внедрим. Спасибо!


---

## Предлагаемое эталонное решение (через портал в `<body>`)

Ниже — вариант, который, по идее, закрывает три цели: без «следов», стабильный выход по клику в пустое место и гарантированное скрытие Hero. Ключевая идея — вынести театральный слой в портал (в самый конец `<body>`), чтобы исключить проблемы с локальными stacking‑context’ами и `z-index`.

### 1) Схема слоёв и DOM

Оверлей и «сцена» рендерятся через портал:

```tsx
<body>
  …страница (Hero, контент)…
  {/* Появляется только при isTheater === true */}
  <div class="theater-overlay" role="dialog" aria-modal="true">
    <div class="theater-stage">
      {/* тут плеер без теней/рамок */}
    </div>
  </div>
</body>
```

— `.theater-overlay` принимает клики/тапы для закрытия, `.theater-stage` останавливает всплытие (контролы кликабельны).

### 2) Компонент с порталом (TSX)

```tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

type Props = { source: string; poster?: string; title?: string; caption?: string };

function Player({
  videoRef,
  source,
  poster,
  isTheater,
  onLoadedMeta,
  onPlay,
  onPause,
}: {
  videoRef: React.RefObject<HTMLVideoElement>;
  source: string;
  poster?: string;
  isTheater: boolean;
  onLoadedMeta: (v: HTMLVideoElement) => void;
  onPlay: () => void;
  onPause: () => void;
}) {
  return (
    <div className={isTheater ? 'video-stage__frame' : 'video-card__frame'}>
      <video
        ref={videoRef}
        className={isTheater ? 'video-stage__video' : 'video-card__video'}
        src={source}
        poster={poster}
        playsInline
        // @ts-expect-error iOS
        webkit-playsinline="true"
        preload="metadata"
        onLoadedMetadata={(e) => onLoadedMeta(e.currentTarget)}
        onPlay={onPlay}
        onPause={onPause}
      />
      {/* постер-оверлей нужен только в inline-режиме */}
      {!isTheater && <div className="video-card__poster" />}
    </div>
  );
}

function TheaterPortal({ isOpen, aspect, onClose, children }: { isOpen: boolean; aspect: number; onClose: () => void; children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Esc закрывает
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div
      className="theater-overlay"
      role="dialog"
      aria-modal="true"
      onPointerDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      tabIndex={-1}
    >
      <div
        className="theater-stage"
        style={{ '--v-aspect': String(aspect) } as React.CSSProperties}
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}

export function VideoCard({ source, poster }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isTheater, setIsTheater] = useState(false);
  const [aspect, setAspect] = useState(16 / 9);

  const onLoadedMeta = (v: HTMLVideoElement) => {
    const w = v.videoWidth || 16; const h = v.videoHeight || 9;
    if (w && h) setAspect(w / h);
  };

  const onClose = () => { setIsTheater(false); videoRef.current?.pause(); };

  // Класс на <html> чтобы скрыть Hero и блокировать скролл
  useEffect(() => {
    const root = document.documentElement;
    if (isTheater) root.classList.add('is-theater-open');
    else root.classList.remove('is-theater-open');
    return () => root.classList.remove('is-theater-open');
  }, [isTheater]);

  return (
    <figure className="video-card">
      {!isTheater && (
        <Player
          videoRef={videoRef}
          source={source}
          poster={poster}
          isTheater={false}
          onLoadedMeta={onLoadedMeta}
          onPlay={() => {}}
          onPause={() => {}}
        />
      )}

      <button type="button" className="video-card__theater-btn" onClick={() => setIsTheater(true)}>
        Theater
      </button>

      <TheaterPortal isOpen={isTheater} aspect={aspect} onClose={onClose}>
        <Player
          videoRef={videoRef}
          source={source}
          poster={poster}
          isTheater
          onLoadedMeta={onLoadedMeta}
          onPlay={() => {}}
          onPause={() => {}}
        />
      </TheaterPortal>
    </figure>
  );
}
```

### 3) CSS (без «следов»; корректная подгонка; клики)

```css
/* Базовый card для inline */
.video-card { position: relative; z-index: 1; }
.video-card__frame {
  position: relative;
  width: min(100%, 940px);
  border-radius: var(--radius-2xl);
  background: var(--color-surface);
  border: 1px solid color-mix(in srgb, var(--color-border) 80%, transparent);
  box-shadow: var(--shadow-md);
  overflow: hidden;
}

/* Театр — «голая» сцена */
.video-stage__frame {
  position: relative;
  width: 100%;
  height: 100%;
  background: #000;
  border: none;
  border-radius: 0; /* исключаем антиалиас по краям */
  box-shadow: none;
  overflow: hidden;
}

.video-card__video, .video-stage__video { display: block; width: 100%; background: #000; }
.video-card__video { aspect-ratio: 16/9; }
.video-stage__video { height: 100%; aspect-ratio: auto; object-fit: contain; }

.video-card__poster { position: absolute; inset: 0; background: #000; z-index: 1; }

/* Оверлей через портал */
:root { --theater-z: 2147483647; --theater-bg: rgba(0,0,0,0.96); }
.theater-overlay {
  position: fixed; inset: 0; z-index: var(--theater-z);
  background: var(--theater-bg);
  display: grid; place-items: center;
  overscroll-behavior: contain; touch-action: manipulation;
  padding: env(safe-area-inset-top) env(safe-area-inset-right)
           env(safe-area-inset-bottom) env(safe-area-inset-left);
}

/* Центрирование по аспекту */
.theater-stage {
  position: relative;
  width: min(100dvw, calc(100dvh * var(--v-aspect, 16/9)));
  height: min(100dvh, calc(100dvw / var(--v-aspect, 16/9)));
  background: #000;
}

/* Скрыть Hero и заблокировать скролл страницы */
html.is-theater-open { overflow: hidden; }
html.is-theater-open .hero-teaser { opacity: 0 !important; pointer-events: none !important; }
```

### Почему тут нет «следов»
— В театре нет рамок/теней/радиусов; чёрное поле — фон оверлея/сцены, не «фрейма». Нет субпиксельных просветов между слоями.
— `<video>` — `display:block`, убран inline‑gap по низу.

### Закрытие по клику по фону
— Ловим `onPointerDown`/`onClick` на `.theater-overlay` и закрываем только если `e.target === e.currentTarget`.
— На `.theater-stage` делаем `stopPropagation()` и клики по контролам не закрывают модалку.

### Формула вписывания
— `width: min(100dvw, 100dvh * aspect)`, `height: min(100dvh, 100dvw / aspect)`; `aspect` берём из `videoWidth/videoHeight`.

### Edge‑кейсы
— iOS: `playsInline` + `webkit-playsinline`, `100dvh/dvw`, safe‑area паддинги.
— Доступность: `role="dialog"`, `aria-modal="true"`.
