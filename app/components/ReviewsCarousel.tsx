"use client";

import { useCallback, useState } from "react";

type ReviewItem = { quote?: string; attribution?: string };

/** Same shell as “What’s included” columns on large screens — three-column cards. */
export const reviewThreeColumnCardClass =
  "flex min-h-0 max-h-[min(16rem,52vh)] w-full min-w-0 flex-col overflow-y-auto bg-white/80 px-6 py-5 shadow-sm sm:px-10 sm:py-6 md:rounded-xl";

export function ReviewBlock({ quote, attribution }: ReviewItem) {
  return (
    <article className={`${reviewThreeColumnCardClass} shrink-0`}>
      {quote && (
        <div
          className="rich-text-content text-sm leading-relaxed text-[#6b4f62] sm:text-base"
          dangerouslySetInnerHTML={{ __html: quote }}
        />
      )}
      {attribution && (
        <div
          className="rich-text-content mt-4 text-sm text-[#6b4f62]"
          dangerouslySetInnerHTML={{ __html: attribution }}
        />
      )}
    </article>
  );
}

export default function ReviewsCarousel({ items }: { items: ReviewItem[] }) {
  const n = items.length;
  const [index, setIndex] = useState(0);

  const go = useCallback(
    (delta: number) => {
      if (n === 0) return;
      setIndex((i) => (i + delta + n * 10) % n);
    },
    [n]
  );

  if (n === 0) return null;

  return (
    <div className="relative w-full">
      <div className="overflow-hidden rounded-xl">
        <div
          className="flex transition-transform duration-300 ease-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {items.map((item, idx) => (
            <div key={idx} className="w-full shrink-0">
              <ReviewBlock quote={item.quote} attribution={item.attribution} />
            </div>
          ))}
        </div>
      </div>

      {n > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous review"
            onClick={() => go(-1)}
            className="absolute left-1 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-[#b8878a]/40 bg-white/95 text-[#6b4f62] shadow-md transition hover:bg-white sm:left-2 sm:h-10 sm:w-10"
          >
            <span className="text-lg leading-none" aria-hidden>
              ‹
            </span>
          </button>
          <button
            type="button"
            aria-label="Next review"
            onClick={() => go(1)}
            className="absolute right-1 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-[#b8878a]/40 bg-white/95 text-[#6b4f62] shadow-md transition hover:bg-white sm:right-2 sm:h-10 sm:w-10"
          >
            <span className="text-lg leading-none" aria-hidden>
              ›
            </span>
          </button>
        </>
      )}

      {n > 1 && (
        <div className="mt-3 flex justify-center gap-2">
          {items.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to review ${i + 1}`}
              aria-current={i === index ? "true" : undefined}
              onClick={() => setIndex(i)}
              className={`h-2 w-2 rounded-full transition ${i === index ? "bg-[#b8878a]" : "bg-[#b8878a]/30"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
