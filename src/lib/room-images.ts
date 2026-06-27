// Curated real-photography fallbacks (Unsplash) keyed by room slug.
const fallback: Record<string, string> = {
  "lakeside-standard": "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1600&q=80",
  "lakeside-deluxe": "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1600&q=80",
  "executive-lake-suite": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1600&q=80",
};

const DEFAULT =
  "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1600&q=80";

export function resolveRoomImage(src: string | undefined, slug?: string): string {
  if (src && (src.startsWith("http") || src.startsWith("/__l5e/"))) return src;
  if (slug && fallback[slug]) return fallback[slug];
  return DEFAULT;
}
