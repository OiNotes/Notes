import Link from "next/link";

import type { PersonFrontmatter } from "@/lib/content-schema";

const FALLBACK_CTA = {
  href: "#note",
  label: "читать далее",
};

type HeroTeaserProps = {
  frontmatter: PersonFrontmatter;
};

export function HeroTeaser({ frontmatter }: HeroTeaserProps) {
  const intro = frontmatter.introSequences[0] ?? null;
  const videoSrc = intro?.src ?? frontmatter.video.url;

  const ctaHref = FALLBACK_CTA.href;
  const ctaLabel = FALLBACK_CTA.label;

  return (
    <section className="hero-teaser" aria-labelledby="hero-title">
      <div className="hero-teaser__media">
        <video
          className="hero-teaser__video"
          src={videoSrc}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
        />
        <div className="hero-teaser__poster" />
        <div className="hero-teaser__overlay" />
      </div>
      <div className="hero-teaser__content">
        <h1 id="hero-title" className="hero-teaser__title">
          {frontmatter.title}
        </h1>
        {frontmatter.summary ? (
          <p className="hero-teaser__subtitle">{frontmatter.summary}</p>
        ) : null}
      </div>
      <div className="hero-teaser__progress" aria-hidden>
        <div className="hero-teaser__progress-bar" />
      </div>
    </section>
  );
}
