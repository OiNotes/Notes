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
    years: "1930",
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
    years: "1970–1980",
    title: "Наука",
    events: ["НИС", "Плавэлектростанция", "Консервация"],
  },
  {
    id: "1990-2000s",
    years: "1990–2000",
    title: "Сохранение",
    events: ["Борьба за сохранение", "Передача музею"],
  },
  {
    id: "2010-2025",
    years: "2010–2025",
    title: "Музей",
    events: ["Ремонт 2014", "Музей‑ледокол", "Современность"],
  },
];

type PointLayout = { x: number; y: number; t: number };

export function LuxTimeline({ showHeroPoint }: { showHeroPoint?: boolean }) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const pathRef = useRef<SVGPathElement | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [rippleKey, setRippleKey] = useState<number>(0);
  const [hoveredLineIdx, setHoveredLineIdx] = useState<number | null>(null);

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
      p.push({
        x: pt.x,
        y: pt.y,
        t
      });
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
    const target = e.target as HTMLElement | null;
    if (target?.dataset?.timelineIndex) {
      setNearestIdx(Number(target.dataset.timelineIndex));
      return;
    }
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
              <radialGradient id="goldRadialGlow">
                <stop offset="0%" stopColor="rgba(202, 165, 122, 1)" />
                <stop offset="50%" stopColor="rgba(202, 165, 122, 0.4)" />
                <stop offset="100%" stopColor="rgba(202, 165, 122, 0)" />
              </radialGradient>
              <linearGradient id="goldLineGradient">
                <stop offset="0%" stopColor="rgba(202, 165, 122, 0.8)" />
                <stop offset="100%" stopColor="rgba(202, 165, 122, 0)" />
              </linearGradient>
              <linearGradient id="lineGradientFade">
                <stop offset="0%" stopColor="rgba(202, 165, 122, 0.95)" />
                <stop offset="65%" stopColor="rgba(202, 165, 122, 0.6)" />
                <stop offset="90%" stopColor="rgba(202, 165, 122, 0.1)" />
                <stop offset="100%" stopColor="rgba(202, 165, 122, 0)" />
              </linearGradient>

              {/* MINIMAL PREMIUM Gradients - Apple Inspired */}
              <radialGradient id="goldCoreGradient">
                <stop offset="0%" stopColor="rgba(255, 248, 235, 1)" />
                <stop offset="25%" stopColor="rgba(245, 220, 190, 1)" />
                <stop offset="50%" stopColor="rgba(222, 185, 142, 1)" />
                <stop offset="75%" stopColor="rgba(202, 165, 122, 1)" />
                <stop offset="100%" stopColor="rgba(182, 145, 102, 0.98)" />
              </radialGradient>

              <linearGradient id="energyRingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(222, 185, 142, 0.7)" />
                <stop offset="50%" stopColor="rgba(202, 165, 122, 0.6)" />
                <stop offset="100%" stopColor="rgba(182, 145, 102, 0.4)" />
              </linearGradient>

              <filter id="deepGlow" x="-150%" y="-150%" width="400%" height="400%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="blur" />
                <feColorMatrix in="blur" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 2 0" result="glow" />
                <feMerge>
                  <feMergeNode in="glow" />
                  <feMergeNode in="glow" />
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
                return (
                  <g
                    key={era.id}
                    className={
                      "timeline-lux__point" +
                      (isActive ? " is-active" : "") +
                      (isNear ? " is-near" : "")
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
                        title={`${era.years} — ${era.title}`}
                        data-timeline-index={i}
                        onClick={() => onSelect(era.id)}
                        onFocus={() => setNearestIdx(i)}
                        onMouseEnter={() => setNearestIdx(i)}
                        onMouseLeave={() => setNearestIdx(null)}
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

                    {/* Year label */}
                    <text className="timeline-lux__label" x={0} y={-18} textAnchor="middle">
                      {era.years}
                    </text>
                  </g>
                );
              })}

            {/* MINIMAL PREMIUM Hero Nucleus - Apple Watch Inspired */}
            {showHeroPoint && points.length === ERAS.length && (
              <g transform="translate(700, 30)" className="hero-nucleus">
                {/* LAYER 1: Deep Ambient Glow */}
                <circle
                  className="hero-nucleus__glow-deep"
                  r={40}
                  fill="url(#goldRadialGlow)"
                  filter="url(#deepGlow)"
                  opacity={0.06}
                />

                {/* LAYER 2: Mid Glow */}
                <circle
                  className="hero-nucleus__glow-mid"
                  r={26}
                  fill="url(#goldRadialGlow)"
                  opacity={0.12}
                />

                {/* LAYER 3: Constellation Lines */}
                {points.map((pt, i) => {
                  const dx = pt.x - 700;
                  const dy = pt.y - 30;
                  const length = Math.sqrt(dx * dx + dy * dy);
                  const shortenBy = 35;
                  const ratio = shortenBy / length;
                  const x1 = dx * ratio;
                  const y1 = dy * ratio;
                  const isHovered = hoveredLineIdx === i;
                  return (
                    <line
                      key={`hero-line-${i}`}
                      x1={x1}
                      y1={y1}
                      x2={dx}
                      y2={dy}
                      stroke="url(#lineGradientFade)"
                      strokeWidth={isHovered ? 1.8 : 1.2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      opacity={isHovered ? 0.8 : 0.5}
                      strokeDasharray="5 8"
                      filter="url(#goldGlow)"
                      vectorEffect="non-scaling-stroke"
                      className="hero-nucleus__constellation"
                      onMouseEnter={() => setHoveredLineIdx(i)}
                      onMouseLeave={() => setHoveredLineIdx(null)}
                      style={{
                        animation: `line-draw 800ms ease-out ${i * 80}ms both`,
                        transition: 'stroke-width 300ms ease, opacity 300ms ease'
                      }}
                    />
                  );
                })}

                {/* LAYER 4: Optional Orbital Ring */}
                <circle
                  className="hero-nucleus__orbital"
                  r={32}
                  fill="none"
                  stroke="url(#energyRingGradient)"
                  strokeWidth={1.2}
                  strokeDasharray="6 10"
                  opacity={0.4}
                />

                {/* LAYER 5: Core Shadow (3D depth) */}
                <circle
                  className="hero-nucleus__core-shadow"
                  r={17}
                  fill="rgba(142, 105, 62, 0.25)"
                  filter="url(#deepGlow)"
                />

                {/* LAYER 6: Main Core */}
                <circle
                  className="hero-nucleus__core"
                  r={16}
                  fill="url(#goldCoreGradient)"
                  filter="url(#goldGlow)"
                />

                {/* LAYER 7: Specular Highlight */}
                <ellipse
                  className="hero-nucleus__specular"
                  cx={0}
                  cy={-5}
                  rx={8}
                  ry={5}
                  fill="rgba(255, 255, 255, 0.7)"
                  filter="url(#glow)"
                />
              </g>
            )}
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
