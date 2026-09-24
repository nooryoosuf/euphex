import type { MediaItem, NewsArticle, TimelineEvent } from "./types";
import data from "./content.json";

interface ContentFile {
  news: NewsArticle[];
  media: MediaItem[];
  timeline: TimelineEvent[];
}

const content = data as ContentFile;

export const NEWS = content.news;
export const MEDIA = content.media;
export const TIMELINE = content.timeline;

export const getArticle = (slug: string) => NEWS.find((n) => n.slug === slug);
