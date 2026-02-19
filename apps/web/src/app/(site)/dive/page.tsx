import type { Metadata } from "next";
import { FeatureCarousel } from "@/components/feature-carousel";
import { HeroTeaser } from "@/components/hero-teaser";
import { DecorativeBand } from "@/components/decorative-band";
import { getAllPeople, getPerson } from "@/lib/mdx";

export const metadata: Metadata = {
  title: "Dive — Featured Stories | Oi/Notes",
  description: "Deep-dive into curated stories, engineering poems, and field notes. Video + text format.",
};

const FEATURED_PERSON = "slow-morning-fieldnotes";

export default async function DivePage() {
    const profile = await getPerson(FEATURED_PERSON);
    const krassin = await getPerson("krassin-engineering-poems");

    return (
        <>
            <HeroTeaser frontmatter={profile.frontmatter} />
            <FeatureCarousel items={[krassin.frontmatter]} headline="Выбор тем" />
            <DecorativeBand />
        </>
    );
}
