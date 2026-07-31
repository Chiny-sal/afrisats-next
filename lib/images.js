/**
 * Returns the display URL for an item's product photo.
 * Uses image_url when set; callers should fall back here on <img> onError as well.
 */
export function getItemImageUrl(item) {
  if (item?.image_url) return item.image_url;
  const seed = item?.id || item?.thumbnail_seed || "default";
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/600/400`;
}
