"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import type { ProjectWithMedia } from "@/types";

interface ProjectCardProps {
  project: ProjectWithMedia;
  onClick: () => void;
  index: number;
}

export function ProjectCard({ project, onClick, index }: ProjectCardProps) {
  const coverUrl =
    project.coverMedia?.url || project.media[0]?.url;

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.1, 0.5) }}
      onClick={onClick}
      aria-label={`Ver projeto ${project.title}`}
      className="group relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-surface text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      {coverUrl ? (
        <Image
          src={coverUrl}
          alt={project.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      ) : (
        <div className="h-full w-full bg-primary/5 flex items-center justify-center">
          <span className="text-text-muted text-sm">Sem imagem</span>
        </div>
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-5">
        <h3 className="font-heading text-xl md:text-2xl font-semibold text-white leading-tight">
          {project.title}
        </h3>
        {project.category && (
          <span className="mt-2 inline-block rounded-full bg-accent/90 px-3 py-0.5 text-xs font-medium text-white">
            {project.category}
          </span>
        )}
      </div>
    </motion.button>
  );
}
