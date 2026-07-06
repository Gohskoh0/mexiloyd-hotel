import room1 from "@/assets/room-1.jpg.asset.json";
import room2 from "@/assets/room-2.jpg.asset.json";
import room3 from "@/assets/room-3.jpg.asset.json";
import room4 from "@/assets/room-4.jpg.asset.json";
import room5 from "@/assets/room-5.jpg.asset.json";
import room6 from "@/assets/room-6.jpg.asset.json";

// Real photographs from the hotel's Google Business profile.
const BY_SLUG: Record<string, string> = {
  "lakeside-standard": room1.url,
  "lakeside-deluxe": room3.url,
  "executive-lake-suite": room5.url,
};

const FALLBACK = room1.url;

export const roomPhotos = {
  room1: room1.url,
  room2: room2.url,
  room3: room3.url,
  room4: room4.url,
  room5: room5.url,
  room6: room6.url,
};

export function resolveRoomImage(src: string | undefined, slug?: string): string {
  if (src && (src.startsWith("http") || src.startsWith("/__l5e/"))) return src;
  if (slug && BY_SLUG[slug]) return BY_SLUG[slug];
  return FALLBACK;
}
