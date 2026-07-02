"use client";

import Image from "next/image";
import { useState } from "react";

function GalleryImage({ src, alt, className }) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div
        className={`${className} flex items-center justify-center bg-slate-100 text-slate-400`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="h-10 w-10"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m2.25 15.75 5.16-5.16a2.25 2.25 0 0 1 3.182 0l5.16 5.16m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Z"
          />
        </svg>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      unoptimized
      sizes="(min-width: 1024px) 55vw, 100vw"
      onError={() => setHasError(true)}
      className={className}
    />
  );
}

export function ProductGallery({ images, title }) {
  const validImages = Array.isArray(images)
    ? images.filter((image) => typeof image === "string" && image.trim())
    : [];
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedImage = validImages[selectedIndex];

  if (!selectedImage) {
    return (
      <div className="flex aspect-[4/3] items-center justify-center rounded-2xl border border-slate-200 bg-slate-100 text-slate-400">
        <div className="text-center">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="mx-auto h-16 w-16"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m2.25 15.75 5.16-5.16a2.25 2.25 0 0 1 3.182 0l5.16 5.16m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Z"
            />
          </svg>
          <p className="mt-3 text-sm font-medium">No product image available</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <GalleryImage
          key={selectedImage}
          src={selectedImage}
          alt={`${title} – image ${selectedIndex + 1}`}
          className="object-contain p-4"
        />
      </div>

      {validImages.length > 1 && (
        <div
          className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-5"
          aria-label="Product images"
        >
          {validImages.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => setSelectedIndex(index)}
              className={`relative aspect-square overflow-hidden rounded-lg border-2 bg-white transition ${
                selectedIndex === index
                  ? "border-blue-600 ring-2 ring-blue-100"
                  : "border-slate-200 hover:border-blue-300"
              }`}
              aria-label={`View product image ${index + 1}`}
              aria-pressed={selectedIndex === index}
            >
              <GalleryImage
                src={image}
                alt=""
                className="object-contain p-1.5"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
