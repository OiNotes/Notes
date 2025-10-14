import type { PersonFrontmatter } from "@/lib/content-schema";

type NoteHeaderProps = {
  frontmatter: PersonFrontmatter;
};

export function NoteHeader({ frontmatter }: NoteHeaderProps) {
  return (
    <header className="note-head">
      <h1 className="note-head__title">{frontmatter.title}</h1>
      {frontmatter.summary ? (
        <p className="note-head__summary">{frontmatter.summary}</p>
      ) : null}
    </header>
  );
}
