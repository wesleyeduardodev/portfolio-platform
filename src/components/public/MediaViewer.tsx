"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, Download } from "lucide-react";
import type { Media } from "@prisma/client";
import { extractYouTubeId, getYouTubeEmbedUrl } from "@/lib/youtube";

interface MediaViewerProps {
  media: Media[];
  initialIndex: number;
  onClose: () => void;
}

async function downloadMedia(url: string, fileName: string) {
  const res = await fetch(url);
  const blob = await res.blob();
  const blobUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = blobUrl;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(blobUrl);
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
  const isYouTube = item.type === "VIDEO" && item.mimeType === "video/youtube";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      role="dialog"
      aria-modal="true"
      aria-label="Visualizador de mídia"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        aria-label="Fechar visualizador"
        className="absolute top-4 right-4 z-10 rounded-full bg-white/10 p-2 text-white backdrop-blur-sm hover:bg-white/20 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        <X className="h-6 w-6" />
      </button>

      {/* Counter + Download */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
        <div className="rounded-full bg-white/10 px-3 py-1 text-sm text-white backdrop-blur-sm">
          {current + 1} / {media.length}
        </div>
        {!isYouTube && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              downloadMedia(item.url, item.fileName);
            }}
            aria-label="Baixar imagem"
            className="rounded-full bg-white/10 p-2 text-white backdrop-blur-sm hover:bg-white/20 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <Download className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Navigation — hidden on mobile (swipe available) */}
      {current > 0 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            goPrev();
          }}
          aria-label="Imagem anterior"
          className="absolute left-4 z-10 hidden md:block rounded-full bg-white/10 p-2 text-white backdrop-blur-sm hover:bg-white/20 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
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
          aria-label="Próxima imagem"
          className="absolute right-4 z-10 hidden md:block rounded-full bg-white/10 p-2 text-white backdrop-blur-sm hover:bg-white/20 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
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
          className="relative max-h-screen max-w-screen md:max-h-[85vh] md:max-w-[90vw]"
          onClick={(e) => e.stopPropagation()}
          onTouchStart={(e) => setTouchStart(e.touches[0].clientX)}
          onTouchEnd={(e) => {
            const diff = touchStart - e.changedTouches[0].clientX;
            if (diff > 50) goNext();
            if (diff < -50) goPrev();
          }}
        >
          {isYouTube ? (
            <iframe
              src={getYouTubeEmbedUrl(extractYouTubeId(item.url) || "")}
              title={item.altText || item.fileName || "Vídeo do projeto"}
              className="w-[90vw] max-w-4xl aspect-video rounded-none md:rounded-lg"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <Image
              src={item.url}
              alt={item.altText || item.fileName}
              width={item.width || 1200}
              height={item.height || 800}
              className="w-screen h-screen md:max-h-[85vh] md:w-auto md:h-auto object-contain rounded-none md:rounded-lg"
              sizes="100vw"
            />
          )}
          {item.caption && (
            <p className="absolute bottom-0 left-0 right-0 bg-black/50 p-3 text-center text-sm text-white backdrop-blur-sm rounded-none md:rounded-b-lg">
              {item.caption}
            </p>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
