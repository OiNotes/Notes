"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

import type { PersonFrontmatter } from "@/lib/content-schema";

type Era = {
  id: string;
  years: string;
  title: string;
  events: string[];
};

const ERAS: Era[] = [
  {
    id: "1916-1927",
    years: "1916–1927",
    title: "Строительство",
    events: ["Проект «Святогор»", "Затопление", "Поднятие", "Выкуп", "Переименование"],
  },
  {
    id: "1928",
    years: "1928",
    title: "Подвиг Нобиле",
    events: ["Спасение экспедиции", "Помощь «Монте-Сервантес»"],
  },
  {
    id: "1930s",
    years: "1930е",
    title: "Арктика",
    events: ["Караваны", "Исследования", "Ледовый рекорд"],
  },
  {
    id: "1941-1945",
    years: "1941–1945",
    title: "Великая война",
    events: ["Вооружение", "Конвой PQ‑15", "Боевые эпизоды"],
  },
  {
    id: "1946-1971",
    years: "1946–1971",
    title: "Модернизация",
    events: ["Капремонт в ГДР", "Возвращение в строй", "Последние рейсы"],
  },
  {
    id: "1970-1980s",
    years: "1970–1980е",
    title: "Наука",
    events: ["НИС", "Плавэлектростанция", "Консервация"],
  },
  {
    id: "1990-2000s",
    years: "1990–2000е",
    title: "Сохранение",
    events: ["Борьба за сохранение", "Передача музею"],
  },
  {
    id: "2010s-2025",
    years: "2010е–2025",
    title: "Музей",
    events: ["Ремонт 2014", "Музей‑ледокол", "Современность"],
  },
];

type PointLayout = { x: number; y: number; t: number };

type GlobalTimelineProps = {
  items: PersonFrontmatter[];
  onEraSelect?: (eraId: string | null) => void;
};

export function GlobalTimeline({ items, onEraSelect }: GlobalTimelineProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const pathRef = useRef<SVGPathElement | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [rippleKey, setRippleKey] = useState<number>(0);

  // Compute positions along the curve (evenly spaced by length)
  const points: PointLayout[] = useMemo(() => {
    const p: PointLayout[] = [];
    const el = pathRef.current;
    if (!el) return p;
    const total = el.getTotalLength();
    const count = ERAS.length;
    for (let i = 0; i < count; i++) {
      const t = (i + 0.5) / count;
      const pt = el.getPointAtLength(total * t);
      p.push({ x: pt.x, y: pt.y, t });
    }
    return p;
  }, [svgRef.current, pathRef.current, revealed]);

  // Origin (start) point
  const origin = useMemo(() => {
    const el = pathRef.current;
    if (!el) return null as null | { x: number; y: number };
    const total = el.getTotalLength();
    const pt = el.getPointAtLength(total * 0.02);
    return { x: pt.x, y: pt.y };
  }, [pathRef.current, revealed]);

  // Intersection reveal for path draw
  useEffect(() => {
    const node = svgRef.current;
    if (!node) return;
    const io = new IntersectionObserver(
      (entries) => {
        const e = entries[0];
        if (e.isIntersecting) setRevealed(true);
      },
      { threshold: 0.2 }
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  // Measure path length
  useEffect(() => {
    const el = pathRef.current;
    if (!el) return;
    const L = Math.max(1, Math.round(el.getTotalLength()));
    el.style.setProperty("--path-length", String(L));
    el.style.strokeDasharray = String(L);
    el.style.strokeDashoffset = revealed ? "0" : String(L);
  }, [revealed]);

  // Escape closes details
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelected(null);
        onEraSelect?.(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const onSelect = (id: string) => {
    const newSelected = selected === id ? null : id;
    setSelected(newSelected);
    onEraSelect?.(newSelected);
    setRippleKey((k) => k + 1);
  };

  // Simple proximity highlight
  const [nearestIdx, setNearestIdx] = useState<number | null>(null);
  const onMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    if (!points.length) return;
    let best = 0;
    let bestD = Infinity;
    points.forEach((pt, i) => {
      const dx = pt.x - mx;
      const dy = pt.y - my;
      const d = dx * dx + dy * dy;
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    });
    setNearestIdx(best);
  };

  // Get profiles for selected era
  const profilesForEra = useMemo(() => {
    if (!selected) return [];
    return items.filter((item) => item.timelineEraId === selected);
  }, [selected, items]);

  return (
    <section className="global-timeline" aria-labelledby="global-timeline-heading">
      <div className="container">
        <header className="global-timeline__head">
          <h2 id="global-timeline-heading" className="global-timeline__title">
            История всех историй
          </h2>
          <p className="global-timeline__subtitle">
            1916–2025 · Выберите эпоху, чтобы увидеть связанные истории
          </p>
        </header>

        <div className="global-timeline__viewport" role="group" aria-label="Исторические эпохи">
          <svg
            ref={svgRef}
            className="global-timeline__svg"
            viewBox="0 0 1600 320"
            onMouseMove={onMove}
            onMouseLeave={() => setNearestIdx(null)}
          >
            <defs>
              <filter id="glow-global" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="goldGlow-global" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="gblur" />
                <feMerge>
                  <feMergeNode in="gblur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Base path - толще чем в обычной версии */}
            <path
              ref={pathRef}
              className={`global-timeline__path ${revealed ? "is-revealed" : ""}`}
              d="M 16 200 C 200 120, 320 240, 480 160 S 760 100, 920 180 S 1200 260, 1360 140 S 1520 80, 1584 160"
              vectorEffect="non-scaling-stroke"
            />

            {/* Shimmer layer */}
            <path
              className="global-timeline__path global-timeline__path--shimmer"
              d="M 16 200 C 200 120, 320 240, 480 160 S 760 100, 920 180 S 1200 260, 1360 140 S 1520 80, 1584 160"
              vectorEffect="non-scaling-stroke"
            />

            {/* Big origin marker */}
            {origin && (
              <g className="global-timeline__origin" transform={`translate(${origin.x}, ${origin.y})`}>
                <circle className="global-timeline__origin-halo" r={36} />
                <circle className="global-timeline__origin-ring" r={26} />
                <circle className="global-timeline__origin-core" r={8.2} />
                <text className="global-timeline__origin-label" x={0} y={-38} textAnchor="middle">
                  1916
                </text>
              </g>
            )}

            {/* Points - больше и выразительнее */}
            {points.length === ERAS.length &&
              ERAS.map((era, i) => {
                const pt = points[i];
                const isActive = selected === era.id;
                const isNear = nearestIdx === i;
                return (
                  <g
                    key={era.id}
                    className={
                      "global-timeline__point" +
                      (isActive ? " is-active" : "") +
                      (isNear ? " is-near" : "")
                    }
                    transform={`translate(${pt.x}, ${pt.y})`}
                  >
                    {/* Ripple ring */}
                    <circle
                      key={`${era.id}-r-${rippleKey}`}
                      className="global-timeline__ripple"
                      r={0.01}
                      aria-hidden="true"
                    />
                    
                    {/* Hit area button */}
                    <foreignObject
                      x={-28}
                      y={-28}
                      width={56}
                      height={56}
                      requiredExtensions="http://www.w3.org/1999/xhtml"
                    >
                      <button
                        type="button"
                        className="global-timeline__dot"
                        aria-label={`${era.years} — ${era.title}`}
                        aria-pressed={isActive}
                        title={`${era.years} — ${era.title}`}
                        onClick={() => onSelect(era.id)}
                        onFocus={() => setNearestIdx(i)}
                        onMouseEnter={() => setNearestIdx(i)}
                      />
                    </foreignObject>

                    {/* Visual dot */}
                    <circle
                      className="global-timeline__dot-core"
                      r={isNear || isActive ? 5.2 : 3.8}
                      filter={isNear || isActive ? "url(#glow-global)" : undefined}
                    />

                    {/* Ring */}
                    <circle className="global-timeline__dot-ring" r={13} />

                    {/* Extra ring for active */}
                    {isActive && (
                      <>
                        <circle className="global-timeline__dot-halo" r={26} />
                        <circle className="global-timeline__dot-ring-active" r={18} />
                      </>
                    )}

                    {/* Year label */}
                    <text className="global-timeline__label" x={0} y={-24} textAnchor="middle">
                      {era.years}
                    </text>
                  </g>
                );
              })}
          </svg>
        </div>

        {/* Details section with filtered profiles */}
        <div className="global-timeline__details">
          {selected ? (
            <div className="global-timeline__selection">
              <DetailsPanel 
                era={ERAS.find((e) => e.id === selected)!} 
                profiles={profilesForEra}
                onClose={() => {
                  setSelected(null);
                  onEraSelect?.(null);
                }}
              />
            </div>
          ) : (
            <div className="global-timeline__hint" aria-hidden="true">
              <span className="global-timeline__hint-icon">✨</span>
              <span>Выберите эпоху, чтобы увидеть истории этого периода</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function DetailsPanel({
  era,
  profiles,
  onClose,
}: {
  era: Era;
  profiles: PersonFrontmatter[];
  onClose: () => void;
}) {
  return (
    <div className="global-timeline__card">
      <div className="global-timeline__card-head">
        <div>
          <div className="global-timeline__card-years">{era.years}</div>
          <h3 className="global-timeline__card-title">{era.title}</h3>
        </div>
        <button
          className="global-timeline__close"
          type="button"
          aria-label="Закрыть"
          onClick={onClose}
        >
          ✕
        </button>
      </div>

      <ul className="global-timeline__list">
        {era.events.map((ev) => (
          <li key={ev} className="global-timeline__item">
            {ev}
          </li>
        ))}
      </ul>

      {profiles.length > 0 && (
        <div className="global-timeline__profiles">
          <p className="global-timeline__profiles-label">Истории этого периода:</p>
          <div className="global-timeline__profiles-list">
            {profiles.map((profile) => (
              <Link
                key={profile.slug}
                href={`/notes/${profile.slug}`}
                className="global-timeline__profile-link"
              >
                {profile.title}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
