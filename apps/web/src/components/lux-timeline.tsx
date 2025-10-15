"use client";

import { useEffect, useMemo, useRef, useState } from "react";

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

export function LuxTimeline({ currentEraId }: { currentEraId?: string }) {
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
      // avoid placing too close to the very ends
      const t = (i + 0.5) / count;
      const pt = el.getPointAtLength(total * t);
      p.push({ x: pt.x, y: pt.y, t });
    }
    return p;
  }, [svgRef.current, pathRef.current, revealed]);


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

  // Measure path length and set dash to prepare draw animation
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
      if (e.key === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const onSelect = (id: string) => {
    setSelected((prev) => (prev === id ? null : id));
    // retrigger ripple
    setRippleKey((k) => k + 1);
  };

  // Simple proximity highlight (nearest point) on mouse move
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

  return (
    <section className="timeline-lux" aria-labelledby="timeline-heading">
      <div className="container">
        <header className="timeline-lux__head">
          <p className="timeline-lux__kicker" id="timeline-heading">
            ВРЕМЕННАЯ ЛИНИЯ · 1916—2025
          </p>
          <h2 className="timeline-lux__title">След во льду</h2>
        </header>

        <div className="timeline-lux__viewport" role="group" aria-label="Ключевые вехи">
          <svg
            ref={svgRef}
            className="timeline-lux__svg"
            viewBox="0 0 1400 280"
            onMouseMove={onMove}
            onMouseLeave={() => setNearestIdx(null)}
          >
            <defs>
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="goldGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="gblur" />
                <feMerge>
                  <feMergeNode in="gblur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Base path */}
            <path
              ref={pathRef}
              className={`timeline-lux__path ${revealed ? "is-revealed" : ""}`}
              d="M 8 188 C 200 156, 320 198, 460 168 S 740 132, 880 170 S 1100 228, 1240 160 S 1340 124, 1392 164"
              vectorEffect="non-scaling-stroke"
            />

            {/* Shimmer layer (subtle dash drift) */}
            <path
              className="timeline-lux__path timeline-lux__path--shimmer"
              d="M 8 188 C 200 156, 320 198, 460 168 S 740 132, 880 170 S 1100 228, 1240 160 S 1340 124, 1392 164"
              vectorEffect="non-scaling-stroke"
            />

            {/* Start is represented typographically in the heading (1916–2025). */}

            {/* Points */}
            {points.length === ERAS.length &&
              ERAS.map((era, i) => {
                const pt = points[i];
                const isActive = selected === era.id;
                const isNear = nearestIdx === i;
                const isCurrent = currentEraId === era.id;
                return (
                  <g
                    key={era.id}
                    className={
                      "timeline-lux__point" +
                      (isActive ? " is-active" : "") +
                      (isNear ? " is-near" : "") +
                      (isCurrent ? " is-current" : "")
                    }
                    transform={`translate(${pt.x}, ${pt.y})`}
                  >
                    {/* Ripple ring */}
                    <circle
                      key={`${era.id}-r-${rippleKey}`}
                      className="timeline-lux__ripple"
                      r={0.01}
                      aria-hidden="true"
                    />
                    {/* Hit area button */}
                    <foreignObject x={-32} y={-32} width={64} height={64} requiredExtensions="http://www.w3.org/1999/xhtml">
                      <button
                        type="button"
                        className="timeline-lux__dot"
                        aria-label={`${era.years} — ${era.title}`}
                        aria-pressed={isActive}
                        aria-current={isCurrent ? "true" : undefined}
                        title={`${era.years} — ${era.title}`}
                        onClick={() => onSelect(era.id)}
                        onFocus={() => setNearestIdx(i)}
                        onMouseEnter={() => setNearestIdx(i)}
                      />
                    </foreignObject>

                    {/* Visual dot (separate from button for crispness) */}
                    <circle
                      className="timeline-lux__dot-core"
                      r={isNear || isActive ? 3.8 : 2.8}
                      filter={isNear || isActive ? "url(#glow)" : undefined}
                    />

                    {/* Always-visible subtle ring to suggest clickability */}
                    <circle className="timeline-lux__dot-ring" r={10} />

                    {/* Extra ring for current */}
                    {isCurrent && (
                      <>
                        <circle className="timeline-lux__dot-halo" r={20} />
                        <circle className="timeline-lux__dot-ring-current" r={14} />
                      </>
                    )}

                    {/* Year label */}
                    <text className="timeline-lux__label" x={0} y={-18} textAnchor="middle">
                      {era.years}
                    </text>
                  </g>
                );
              })}
          </svg>
        </div>

        {/* Details panel */}
        <div
          className="timeline-lux__details"
          role="region"
          aria-live="polite"
          aria-label="Детали периода"
        >
          {selected ? (
            <DetailsCard era={ERAS.find((e) => e.id === selected)!} onClose={() => setSelected(null)} />
          ) : (
            <div className="timeline-lux__hint" aria-hidden="true">
              Выберите точку на линии, чтобы увидеть события
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function DetailsCard({ era, onClose }: { era: Era; onClose: () => void }) {
  return (
    <div className="timeline-lux__card">
      <div className="timeline-lux__card-head">
        <div className="timeline-lux__card-years">{era.years}</div>
        <h3 className="timeline-lux__card-title">{era.title}</h3>
        <button className="timeline-lux__close" type="button" aria-label="Закрыть" onClick={onClose}>
          Закрыть
        </button>
      </div>
      <ul className="timeline-lux__list">
        {era.events.map((ev) => (
          <li key={ev} className="timeline-lux__item">
            {ev}
          </li>
        ))}
      </ul>
    </div>
  );
}
