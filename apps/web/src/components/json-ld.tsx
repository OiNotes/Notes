/**
 * JsonLd — renders JSON-LD structured data for SEO.
 *
 * Note: dangerouslySetInnerHTML is the standard Next.js pattern for JSON-LD.
 * The content is always serialized from trusted application data, never user input.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
