import { SplitScreen } from "@/components/split-screen";
import { JsonLd } from "@/components/json-ld";

/** Homepage — h1 is visually hidden for screen readers */
export default function Home() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Person",
          name: "Oi/Notes",
          url: process.env.NEXT_PUBLIC_BASE_URL || "https://oi-notes.vercel.app",
          description: "Personal creative workspace — engineering, art, and sound.",
          sameAs: [],
        }}
      />
      <h1 className="sr-only">Oi/Notes — Engineering, Art & Sound</h1>
      <SplitScreen />
    </>
  );
}
