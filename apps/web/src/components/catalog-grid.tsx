import Link from "next/link";

import type { PersonFrontmatter } from "@/lib/content-schema";

type CatalogGridProps = {
  items: PersonFrontmatter[];
  headline?: string;
  description?: string;
};

export function CatalogGrid({ items, headline = "Каталог", description }: CatalogGridProps) {
  if (items.length === 0) return null;

  return (
    <section className="catalog-grid" aria-labelledby="catalog-grid-title">
      <div className="catalog-grid__heading">
        <h2 id="catalog-grid-title" className="catalog-grid__title">
          {headline}
        </h2>
        {description ? <p className="catalog-grid__description">{description}</p> : null}
      </div>
      <div className="catalog-grid__list">
        {items.map((item) => {
          const intro = item.introSequences[0] ?? null;
          const videoSrc = intro?.src ?? item.video.url;

          return (
            <Link key={item.slug} href={`/notes/${item.slug}`} className="catalog-card">
              <div className="catalog-card__media">
                <video
                  className="catalog-card__video"
                  src={videoSrc}
                  muted
                  loop
                  playsInline
                  preload="metadata"
                />
                {/* Custom poster to hide orange placeholder */}
                <div className="catalog-card__poster" />
                <div className="catalog-card__overlay" />
              </div>
              <div className="catalog-card__content">
                <span className="catalog-card__kicker">{item.tags?.[0] ?? "Notes"}</span>
                <h3 className="catalog-card__title">{item.title}</h3>
                {item.summary ? (
                  <p className="catalog-card__summary">{item.summary}</p>
                ) : null}
                <span className="catalog-card__cta">discover</span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
