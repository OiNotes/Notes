import { FeatureCarousel } from "@/components/feature-carousel";
import { HeroTeaser } from "@/components/hero-teaser";
import { DecorativeBand } from "@/components/decorative-band";
import { getAllPeople, getPerson } from "@/lib/mdx";

const FEATURED_PERSON = "slow-morning-fieldnotes";

export default async function Home() {
  const profile = await getPerson(FEATURED_PERSON);
  const all = await getAllPeople();
  const frontmatters = all.map((item) => item.frontmatter);

  return (
    <>
      <HeroTeaser frontmatter={profile.frontmatter} />
      <FeatureCarousel items={frontmatters} headline="Выбор тем" />
      <DecorativeBand />
    </>
  );
}
