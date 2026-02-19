import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Container } from "@/components/container";
import { HeroTeaser } from "@/components/hero-teaser";
import { Prose } from "@/components/prose";
import { TextReader } from "@/components/text-reader";
import { VideoCard } from "@/components/video-card";
import { LuxTimeline } from "@/components/lux-timeline";
import { getAllPeopleSlugs, getPerson } from "@/lib/mdx";

export const dynamicParams = false;

export async function generateStaticParams() {
  const slugs = await getAllPeopleSlugs();
  return slugs.map((slug) => ({ slug }));
}

/** Dynamic metadata for note pages */
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  try {
    const profile = await getPerson(slug);
    return {
      title: `${profile.frontmatter.title} | Oi/Notes`,
      description: profile.frontmatter.summary || profile.frontmatter.excerpt || `Read about ${profile.frontmatter.title} on Oi/Notes.`,
    };
  } catch {
    return {
      title: "Note | Oi/Notes",
      description: "Personal note on Oi/Notes.",
    };
  }
}

export default async function NotePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const profile = await getPerson(slug).catch(() => null);

  if (!profile) {
    notFound();
  }

  return (
    <>
      <HeroTeaser frontmatter={profile.frontmatter} />
      <Container as="article" className="note" id="note">
        <VideoCard
          source={profile.frontmatter.video.url}
          poster={profile.frontmatter.video.poster}
          title={profile.frontmatter.title}
          caption={profile.frontmatter.summary}
        />
        {/* Read more right after video */}
        <TextReader
          title={profile.frontmatter.title}
          content={
            <Prose className="note-body" id="note-content">
              {profile.content}
            </Prose>
          }
        />
        {/* Timeline below the reader */}
        <LuxTimeline showHeroPoint={slug === 'krassin-engineering-poems'} />
      </Container>
    </>
  );
}
