"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import type { Media } from "@prisma/client";
import { extractYouTubeId, getYouTubeEmbedUrl } from "@/lib/youtube";

interface MediaViewerProps {
  media: Media[];
  initialIndex: number;
  onClose: () => void;
}

export function MediaViewer({
  media,
  initialIndex,
  onClose,
}: MediaViewerProps) {
  const [current, setCurrent] = useState(initialIndex);
  const [touchStart, setTouchStart] = useState(0);

  const goNext = useCallback(() => {
    setCurrent((c) => (c < media.length - 1 ? c + 1 : c));
  }, [media.length]);

  const goPrev = useCallback(() => {
    setCurrent((c) => (c > 0 ? c - 1 : c));
  }, []);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    }
    window.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose, goNext, goPrev]);

  const item = media[current];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 rounded-full bg-white/10 p-2 text-white backdrop-blur-sm hover:bg-white/20 transition"
      >
        <X className="h-6 w-6" />
      </button>

      {/* Counter */}
      <div className="absolute top-4 left-4 z-10 rounded-full bg-white/10 px-3 py-1 text-sm text-white backdrop-blur-sm">
        {current + 1} / {media.length}
      </div>

      {/* Navigation */}
      {current > 0 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            goPrev();
          }}
          className="absolute left-4 z-10 rounded-full bg-white/10 p-2 text-white backdrop-blur-sm hover:bg-white/20 transition"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      )}
      {current < media.length - 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            goNext();
          }}
          className="absolute right-4 z-10 rounded-full bg-white/10 p-2 text-white backdrop-blur-sm hover:bg-white/20 transition"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      )}

      {/* Media content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="relative max-h-[85vh] max-w-[90vw]"
          onClick={(e) => e.stopPropagation()}
          onTouchStart={(e) => setTouchStart(e.touches[0].clientX)}
          onTouchEnd={(e) => {
            const diff = touchStart - e.changedTouches[0].clientX;
            if (diff > 50) goNext();
            if (diff < -50) goPrev();
          }}
        >
          {item.type === "VIDEO" && item.mimeType === "video/youtube" ? (
            <iframe
              src={getYouTubeEmbedUrl(extractYouTubeId(item.url) || "")}
              className="w-[90vw] max-w-4xl aspect-video rounded-lg"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <Image
              src={item.url}
              alt={item.altText || item.fileName}
              width={item.width || 1200}
              height={item.height || 800}
              className="max-h-[85vh] w-auto object-contain rounded-lg"
              sizes="90vw"
            />
          )}
          {item.caption && (
            <p className="absolute bottom-0 left-0 right-0 bg-black/50 p-3 text-center text-sm text-white backdrop-blur-sm rounded-b-lg">
              {item.caption}
            </p>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
