import standard from "@/assets/room-standard.jpg";
import deluxe from "@/assets/room-deluxe.jpg";
import executive from "@/assets/room-executive.jpg";

const map: Record<string, string> = {
  "/src/assets/room-standard.jpg": standard,
  "/src/assets/room-deluxe.jpg": deluxe,
  "/src/assets/room-executive.jpg": executive,
  "room-standard.jpg": standard,
  "room-deluxe.jpg": deluxe,
  "room-executive.jpg": executive,
};

export function resolveRoomImage(src: string | undefined): string {
  if (!src) return standard;
  return map[src] ?? src;
}
