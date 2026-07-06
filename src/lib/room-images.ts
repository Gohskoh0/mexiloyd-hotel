import hotelAsset from "@/assets/mexiloyd-hotel.jpg.asset.json";

// Until each room type has its own uploaded photo, all rooms fall back
// to the hotel's own building photo — never third-party stock imagery.
const DEFAULT = hotelAsset.url;

export function resolveRoomImage(src: string | undefined, _slug?: string): string {
  if (src && (src.startsWith("http") || src.startsWith("/__l5e/"))) return src;
  return DEFAULT;
}
