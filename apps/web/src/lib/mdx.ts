import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import type { ReactNode } from "react";
import { compileMDX } from "next-mdx-remote/rsc";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";

import { personFrontmatterSchema } from "./content-schema";
import type { PersonFrontmatter } from "./content-schema";

export type PersonDocument = {
  frontmatter: PersonFrontmatter;
  content: ReactNode;
};

const CANDIDATE_COLLECTION_DIRS = [
  path.join(process.cwd(), "content", "people"),
  path.join(process.cwd(), "..", "content", "people"),
  path.join(process.cwd(), "..", "..", "content", "people"),
];

function resolvePeopleDirectory(): string {
  for (const dir of CANDIDATE_COLLECTION_DIRS) {
    if (existsSync(dir)) return dir;
  }
  throw new Error("Не удалось найти директорию с профилями (content/people).");
}

const PEOPLE_DIR = resolvePeopleDirectory();

export async function getPerson(slug: string): Promise<PersonDocument> {
  const filePath = path.join(PEOPLE_DIR, `${slug}.mdx`);
  const source = await readFile(filePath, "utf-8");
  const { frontmatter, content } = await compileMDX<PersonFrontmatter>({
    source,
    options: {
      parseFrontmatter: true,
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [
          rehypeSlug,
          [rehypeAutolinkHeadings, { behavior: "wrap", properties: { className: "heading-anchor" } }],
        ],
      },
    },
  });

  const parsedFrontmatter = personFrontmatterSchema.parse(frontmatter);

  return {
    frontmatter: parsedFrontmatter,
    content,
  };
}

export async function getAllPeopleSlugs(): Promise<string[]> {
  const entries = await readdir(PEOPLE_DIR);
  return entries
    .filter((entry) => entry.endsWith(".mdx"))
    .map((entry) => entry.replace(/\.mdx$/, ""))
    .sort();
}

export async function getAllPeople(): Promise<PersonDocument[]> {
  const slugs = await getAllPeopleSlugs();
  return Promise.all(slugs.map((slug) => getPerson(slug)));
}
