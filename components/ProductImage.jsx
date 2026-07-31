"use client";

import { useState } from "react";
import { getItemImageUrl } from "@/lib/images";
import ThumbnailArt from "./ThumbnailArt";

export default function ProductImage({ item, className = "", aspect = "aspect-[4/3]" }) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  const src = errored ? getItemImageUrl(item) : (item.image_url || getItemImageUrl(item));
  const seed = item.id || item.thumbnail_seed || "default";

  return (
    <div className={`relative overflow-hidden bg-base ${aspect} ${className}`}>
      <ThumbnailArt seed={seed} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={item.title || "Product"}
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
        onLoad={() => setLoaded(true)}
        onError={() => {
          if (!errored) {
            setErrored(true);
            setLoaded(false);
          }
        }}
      />
    </div>
  );
}
