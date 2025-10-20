"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";

import type { PersonFrontmatter } from "@/lib/content-schema";

type FeatureCarouselProps = {
  items: PersonFrontmatter[];
  headline?: string;
};

export function FeatureCarousel({ items, headline = "Выбор тем" }: FeatureCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(-1); // -1 = нет активной карточки по умолчанию
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  if (items.length === 0) return null;

  const handleScroll = () => {
    if (!trackRef.current || isDragging) return;
    const track = trackRef.current;
    const slideWidth = track.children[0]?.clientWidth || 0;
    const gap = 24; // clamp gap approximation
    const newIndex = Math.round(track.scrollLeft / (slideWidth + gap));
    setActiveIndex(Math.min(newIndex, items.length - 1));
  };

  const scrollToSlide = (index: number) => {
    if (!trackRef.current) return;
    const track = trackRef.current;
    const slideWidth = track.children[0]?.clientWidth || 0;
    const gap = 24;
    track.scrollTo({
      left: index * (slideWidth + gap),
      behavior: "smooth",
    });
    setActiveIndex(index);
  };

  const handlePrev = () => {
    const newIndex = Math.max(0, activeIndex - 3);
    scrollToSlide(newIndex);
  };

  const handleNext = () => {
    const newIndex = Math.min(items.length - 1, activeIndex + 3);
    scrollToSlide(newIndex);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!trackRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - trackRef.current.offsetLeft);
    setScrollLeft(trackRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !trackRef.current) return;
    e.preventDefault();
    const x = e.pageX - trackRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    trackRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    track.addEventListener("scroll", handleScroll);
    return () => track.removeEventListener("scroll", handleScroll);
  }, [isDragging]);

  return (
    <section className="feature-carousel" aria-label={headline}>
      <div className="feature-carousel__heading">
        <span className="feature-carousel__kicker">Коллекция</span>
        <h2 className="feature-carousel__title">{headline}</h2>
      </div>

      <div className="feature-carousel__wrapper">
        {/* Навигационные кнопки */}
        <button
          onClick={handlePrev}
          className="feature-carousel__nav feature-carousel__nav--prev"
          aria-label="Предыдущий слайд"
          disabled={activeIndex === 0}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <div
          ref={trackRef}
          className="feature-carousel__track"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        >
          {items.map((item, index) => {
            const accent = item.hero?.accent ?? "#a77a4d";
            const poster = item.hero?.poster ?? "/posters/organize-video-notes.svg";
            const backgroundImage = `linear-gradient(140deg, rgba(6, 7, 12, 0.15), rgba(6, 7, 12, 0.72)), url(${poster})`;

            type MediaStyle = CSSProperties & {
              "--card-accent"?: string;
              "--card-index"?: number;
              "--active-index"?: number;
            };

            const mediaStyle: MediaStyle = {
              backgroundImage,
              borderColor: accent,
              "--card-accent": accent,
              "--card-index": index,
              "--active-index": activeIndex,
            };

            const distance = Math.abs(index - activeIndex);
            const isActive = distance === 0;
            const slideClass = `feature-slide ${isActive ? "feature-slide--active" : ""} ${distance > 0 ? "feature-slide--inactive" : ""}`;

            return (
              <Link
                key={item.slug}
                href={`/notes/${item.slug}`}
                className={slideClass}
                data-distance={distance}
              >
                <div
                  className="feature-slide__media"
                  style={mediaStyle}
                />
                <div className="feature-slide__overlay" />
                <div className="feature-slide__content">
                  <span className="feature-slide__kicker">{item.tags?.[0] ?? "Notes"}</span>
                  <h3 className="feature-slide__title">{item.title}</h3>
                  {item.summary ? (
                    <p className="feature-slide__summary">{item.summary}</p>
                  ) : null}
                  <span className="feature-slide__cta">discover</span>
                </div>
              </Link>
            );
          })}
        </div>

        <button
          onClick={handleNext}
          className="feature-carousel__nav feature-carousel__nav--next"
          aria-label="Следующий слайд"
          disabled={activeIndex === items.length - 1}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </section>
  );
}
