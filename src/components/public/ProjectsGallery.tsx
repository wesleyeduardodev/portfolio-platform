"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { ProjectWithMedia } from "@/types";
import { ProjectCard } from "./ProjectCard";
import { ProjectModal } from "./ProjectModal";

interface ProjectsGalleryProps {
  projects: ProjectWithMedia[];
}

export function ProjectsGallery({ projects }: ProjectsGalleryProps) {
  const [selected, setSelected] = useState<ProjectWithMedia | null>(null);
  const visibleProjects = projects.filter((p) => p.isVisible);

  if (visibleProjects.length === 0) return null;

  return (
    <section id="projetos" className="mx-auto max-w-2xl px-6 mt-12">
      {/* Section header */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="flex items-center gap-4 mb-8"
      >
        <div className="h-px flex-1 bg-accent/40" />
        <h2 className="font-heading text-2xl md:text-3xl font-semibold text-primary tracking-wide">
          PROJETOS
        </h2>
        <div className="h-px flex-1 bg-accent/40" />
      </motion.div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
        {visibleProjects
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((project, i) => (
            <ProjectCard
              key={project.id}
              project={project}
              index={i}
              onClick={() => setSelected(project)}
            />
          ))}
      </div>

      {/* Modal */}
      <ProjectModal
        project={selected}
        onClose={() => setSelected(null)}
      />
    </section>
  );
}
