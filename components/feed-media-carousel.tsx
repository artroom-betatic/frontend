"use client";

import Image from "next/image";
import type { TouchEvent } from "react";
import { useRef, useState } from "react";
import type { FeedImageSlide } from "@/lib/feed-types";

type FeedMediaCarouselProps = {
  imageAlt: string;
  imageSlides?: FeedImageSlide[];
  imageSrc: string;
  priority?: boolean;
};

const swipeThresholdPx = 44;
const swipeVerticalTolerancePx = 80;

export function FeedMediaCarousel({
  imageAlt,
  imageSlides,
  imageSrc,
  priority = false,
}: FeedMediaCarouselProps) {
  const fallbackSlide = {
    imageAlt,
    imageSrc,
    label: "피드",
  };
  const slides = imageSlides?.length ? imageSlides : [fallbackSlide];
  const [slideIndex, setSlideIndex] = useState(0);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const safeSlideIndex = Math.min(slideIndex, slides.length - 1);
  const currentSlide = slides[safeSlideIndex] ?? fallbackSlide;
  const hasMultipleSlides = slides.length > 1;

  const showPreviousSlide = () => {
    if (!hasMultipleSlides) {
      return;
    }

    setSlideIndex((current) => (current - 1 + slides.length) % slides.length);
  };

  const showNextSlide = () => {
    if (!hasMultipleSlides) {
      return;
    }

    setSlideIndex((current) => (current + 1) % slides.length);
  };

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    const touch = event.touches[0];

    if (!touch) {
      return;
    }

    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
    };
  };

  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    const touchStart = touchStartRef.current;
    const touch = event.changedTouches[0];

    touchStartRef.current = null;

    if (!touchStart || !touch || !hasMultipleSlides) {
      return;
    }

    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;

    if (
      Math.abs(deltaX) < swipeThresholdPx ||
      Math.abs(deltaY) > swipeVerticalTolerancePx
    ) {
      return;
    }

    if (deltaX < 0) {
      showNextSlide();
    } else {
      showPreviousSlide();
    }
  };

  return (
    <div
      className="relative h-feed-media w-full touch-pan-y overflow-hidden bg-white"
      onTouchEnd={handleTouchEnd}
      onTouchStart={handleTouchStart}
    >
      <Image
        alt={currentSlide.imageAlt}
        className="object-cover"
        fill
        priority={priority}
        sizes="390px"
        src={currentSlide.imageSrc}
      />

      {hasMultipleSlides ? (
        <>
          <span className="absolute right-11 top-3.5 z-20 rounded-full bg-black/50 px-2 py-1 text-2xs font-semibold text-white">
            {safeSlideIndex + 1}/{slides.length} {currentSlide.label}
          </span>
          <button
            aria-label="이전 이미지"
            className="absolute left-2.25 top-1/2 z-20 flex size-6.5 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-muted"
            onClick={showPreviousSlide}
            type="button"
          >
            ‹
          </button>
          <button
            aria-label="다음 이미지"
            className="absolute right-2.25 top-1/2 z-20 flex size-6.5 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-muted"
            onClick={showNextSlide}
            type="button"
          >
            ›
          </button>
        </>
      ) : null}
    </div>
  );
}
