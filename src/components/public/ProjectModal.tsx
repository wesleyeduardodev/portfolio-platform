"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { X, MapPin, Calendar, Grid3X3, Play, Download, Loader2 } from "lucide-react";
import type { ProjectWithMedia } from "@/types";
import { MediaViewer } from "./MediaViewer";
import { extractYouTubeId, getYouTubeThumbnail } from "@/lib/youtube";
import JSZip from "jszip";
import { saveAs } from "file-saver";

interface ProjectModalProps {
  project: ProjectWithMedia;
  onClose: () => void;
}

export function ProjectModal({ project, onClose }: ProjectModalProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape" && lightboxIndex === null) onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose, lightboxIndex]);

  const heroUrl = project.coverMedia?.url || project.media[0]?.url;

  const downloadableMedia = project.media.filter(
    (m) => !(m.type === "VIDEO" && m.mimeType === "video/youtube")
  );

  async function handleDownloadAll() {
    if (downloading || downloadableMedia.length === 0) return;
    setDownloading(true);
    try {
      const zip = new JSZip();
      const blobs = await Promise.all(
        downloadableMedia.map(async (m) => {
          const res = await fetch(m.url);
          return { blob: await res.blob(), name: m.fileName };
        })
      );
      for (const { blob, name } of blobs) {
        zip.file(name, blob);
      }
      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, `${project.title}.zip`);
    } catch (err) {
      console.error("Erro ao gerar ZIP:", err);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <>
      {/* Backdrop */}
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <motion.div
        key="panel"
        role="dialog"
        aria-modal="true"
        aria-label={`Projeto: ${project.title}`}
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="fixed inset-y-0 right-0 z-40 w-full md:w-[50vw] bg-bg overflow-y-auto"
      >
        <button
          onClick={onClose}
          aria-label="Fechar projeto"
          className="absolute top-4 right-4 z-10 rounded-full bg-white/80 p-2 shadow-md hover:bg-white transition backdrop-blur-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <X className="h-5 w-5 text-text" />
        </button>

        {heroUrl && (
          <div className="relative aspect-[16/9] w-full">
            <Image
              src={heroUrl}
              alt={project.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-bg via-transparent to-transparent" />
          </div>
        )}

        <div className="px-6 pb-12 -mt-8 relative">
          <h2 className="font-heading text-3xl md:text-4xl font-semibold text-primary">
            {project.title}
          </h2>

          <div className="mt-4 flex flex-wrap gap-2">
            {project.category && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-3 py-1 text-xs font-medium text-accent">
                <Grid3X3 className="h-3 w-3" />
                {project.category}
              </span>
            )}
            {project.location && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                <MapPin className="h-3 w-3" />
                {project.location}
              </span>
            )}
            {project.year && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                <Calendar className="h-3 w-3" />
                {project.year}
              </span>
            )}
          </div>

          {project.description && (
            <p className="mt-6 text-sm leading-relaxed text-text-muted">
              {project.description}
            </p>
          )}

          {project.media.length > 0 && (
            <div className="mt-8">
              <div className="mb-4 flex items-center gap-3">
                <div className="h-px flex-1 bg-accent/30" />
                <span className="text-xs font-medium uppercase tracking-widest text-accent">
                  Galeria
                </span>
                <div className="h-px flex-1 bg-accent/30" />
              </div>

              {project.allowDownload && downloadableMedia.length > 0 && (
                <div className="mb-4 flex justify-end">
                  <button
                    onClick={handleDownloadAll}
                    disabled={downloading}
                    className="inline-flex items-center gap-2 rounded-full bg-accent/15 px-4 py-2 text-xs font-medium text-accent hover:bg-accent/25 transition disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                  >
                    {downloading ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Preparando...
                      </>
                    ) : (
                      <>
                        <Download className="h-3.5 w-3.5" />
                        Baixar fotos
                      </>
                    )}
                  </button>
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {[...project.media]
                  .sort((a, b) => a.sortOrder - b.sortOrder)
                  .map((item, idx) => {
                    const isYouTube = item.type === "VIDEO" && item.mimeType === "video/youtube";
                    const thumbSrc = isYouTube
                      ? item.thumbnailUrl || getYouTubeThumbnail(extractYouTubeId(item.url) || "")
                      : item.thumbnailUrl || item.url;

                    return (
                      <button
                        key={item.id}
                        onClick={() => setLightboxIndex(idx)}
                        aria-label={`Ver imagem ${idx + 1} de ${project.media.length}`}
                        className="group relative aspect-square overflow-hidden rounded-lg bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                      >
                        <Image
                          src={thumbSrc}
                          alt={item.altText || item.fileName}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                          sizes="(max-width: 768px) 50vw, 17vw"
                        />
                        {isYouTube && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="rounded-full bg-red-600/90 p-2.5 shadow-lg">
                              <Play className="h-5 w-5 text-white fill-white" />
                            </div>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                      </button>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <MediaViewer
            media={[...project.media].sort((a, b) => a.sortOrder - b.sortOrder)}
            initialIndex={lightboxIndex}
            allowDownload={project.allowDownload}
            onClose={() => setLightboxIndex(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
