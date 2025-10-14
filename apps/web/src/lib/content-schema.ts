import { z } from "zod";

const mediaAssetSchema = z.object({
  kind: z.enum(["video", "image", "pdf", "external"]).default("image"),
  src: z.string(),
  poster: z.string().optional(),
  alt: z.string().optional(),
  caption: z.string().optional(),
});

const introSequenceSchema = z.object({
  src: z.string(),
  poster: z.string().optional(),
  label: z.string().optional(),
});

const artifactSchema = z.object({
  id: z.string().optional(),
  title: z.string(),
  summary: z.string().optional(),
  type: z.enum(["essay", "timeline", "gallery", "notes"]).default("essay"),
  source: z.string().optional(),
  media: z.array(mediaAssetSchema).default([]),
});

const heroSchema = z.object({
  poster: z.string(),
  alt: z.string().optional(),
  accent: z.string().optional(),
  caption: z.string().optional(),
});

const featureVideoSchema = z.object({
  url: z.string(),
  poster: z.string(),
  duration: z.number().positive().optional(),
  aspectRatio: z.string().optional(),
  credits: z.string().optional(),
});

export const personFrontmatterSchema = z.object({
  title: z.string(),
  slug: z.string(),
  summary: z.string().optional(),
  excerpt: z.string().optional(),
  tags: z.array(z.string()).default([]),
  publishedAt: z.string().optional(),
  updatedAt: z.string().optional(),
  hero: heroSchema,
  video: featureVideoSchema,
  introSequences: z.array(introSequenceSchema).default([]),
  artifacts: z.array(artifactSchema).default([]),
  gallery: z.array(mediaAssetSchema).default([]),
});

export type MediaAsset = z.infer<typeof mediaAssetSchema>;
export type IntroSequence = z.infer<typeof introSequenceSchema>;
export type Artifact = z.infer<typeof artifactSchema>;
export type Hero = z.infer<typeof heroSchema>;
export type FeatureVideo = z.infer<typeof featureVideoSchema>;
export type PersonFrontmatter = z.infer<typeof personFrontmatterSchema>;
