"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
  Eye,
  EyeOff,
  Star,
  Pencil,
  Trash2,
  Plus,
} from "lucide-react";
import type { ProjectWithMedia } from "@/types";
import { cn } from "@/lib/utils";

interface ProjectListProps {
  initialProjects: ProjectWithMedia[];
}

function SortableProjectRow({
  project,
  onToggleVisibility,
  onToggleFeatured,
  onDelete,
}: {
  project: ProjectWithMedia;
  onToggleVisibility: () => void;
  onToggleFeatured: () => void;
  onDelete: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: project.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const coverUrl = project.coverMedia?.url || project.media[0]?.url;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-4 bg-white rounded-xl p-4 border border-gray-100 shadow-sm",
        isDragging && "opacity-50 shadow-lg"
      )}
    >
      <button
        {...attributes}
        {...listeners}
        className="shrink-0 cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-400"
      >
        <GripVertical className="h-5 w-5" />
      </button>

      {/* Thumbnail */}
      <div className="relative h-16 w-20 rounded-lg overflow-hidden bg-gray-100 shrink-0">
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt={project.title}
            fill
            className="object-cover"
            sizes="80px"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-gray-300 text-xs">
            Sem foto
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-gray-900 truncate">{project.title}</h3>
        <div className="flex items-center gap-2 mt-1">
          {project.category && (
            <span className="text-xs text-gray-500">{project.category}</span>
          )}
          <span className="text-xs text-gray-400">
            {project.media.length} mídia(s)
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={onToggleVisibility}
          className={`rounded-lg p-2 transition-colors ${
            project.isVisible
              ? "text-green-600 hover:bg-green-50"
              : "text-gray-300 hover:bg-gray-50"
          }`}
          title={project.isVisible ? "Visível" : "Oculto"}
        >
          {project.isVisible ? (
            <Eye className="h-4 w-4" />
          ) : (
            <EyeOff className="h-4 w-4" />
          )}
        </button>
        <button
          onClick={onToggleFeatured}
          className={`rounded-lg p-2 transition-colors ${
            project.isFeatured
              ? "text-amber-500 hover:bg-amber-50"
              : "text-gray-300 hover:bg-gray-50"
          }`}
          title={project.isFeatured ? "Destaque" : "Sem destaque"}
        >
          <Star
            className="h-4 w-4"
            fill={project.isFeatured ? "currentColor" : "none"}
          />
        </button>
        <Link
          href={`/admin/projects/${project.id}`}
          className="rounded-lg p-2 text-gray-400 hover:bg-gray-50 hover:text-primary transition-colors"
        >
          <Pencil className="h-4 w-4" />
        </Link>
        <button
          onClick={onDelete}
          className="rounded-lg p-2 text-gray-300 hover:bg-red-50 hover:text-red-500 transition-colors"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export function ProjectList({ initialProjects }: ProjectListProps) {
  const [projects, setProjects] = useState(initialProjects);
  const router = useRouter();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = projects.findIndex((p) => p.id === active.id);
    const newIndex = projects.findIndex((p) => p.id === over.id);

    const newProjects = [...projects];
    const [removed] = newProjects.splice(oldIndex, 1);
    newProjects.splice(newIndex, 0, removed);

    setProjects(newProjects);

    // Persist new order
    await fetch("/api/projects/reorder", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: newProjects.map((p, i) => ({ id: p.id, sortOrder: i })),
      }),
    });
  }

  async function toggleVisibility(id: string, current: boolean) {
    const project = projects.find((p) => p.id === id);
    if (!project) return;

    await fetch(`/api/projects/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: project.title,
        isVisible: !current,
        isFeatured: project.isFeatured,
      }),
    });

    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isVisible: !current } : p))
    );
  }

  async function toggleFeatured(id: string, current: boolean) {
    const project = projects.find((p) => p.id === id);
    if (!project) return;

    await fetch(`/api/projects/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: project.title,
        isVisible: project.isVisible,
        isFeatured: !current,
      }),
    });

    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isFeatured: !current } : p))
    );
  }

  async function deleteProject(id: string) {
    if (!confirm("Tem certeza que deseja excluir este projeto?")) return;

    await fetch(`/api/projects/${id}`, { method: "DELETE" });
    setProjects((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Projetos</h1>
        <Link
          href="/admin/projects/new"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary/90 transition"
        >
          <Plus className="h-4 w-4" />
          Novo projeto
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="bg-white rounded-xl p-12 border border-gray-100 shadow-sm text-center">
          <p className="text-gray-500">Nenhum projeto ainda.</p>
          <Link
            href="/admin/projects/new"
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            <Plus className="h-4 w-4" />
            Criar primeiro projeto
          </Link>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={projects.map((p) => p.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {projects.map((project) => (
                <SortableProjectRow
                  key={project.id}
                  project={project}
                  onToggleVisibility={() =>
                    toggleVisibility(project.id, project.isVisible)
                  }
                  onToggleFeatured={() =>
                    toggleFeatured(project.id, project.isFeatured)
                  }
                  onDelete={() => deleteProject(project.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
