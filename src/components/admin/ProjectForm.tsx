"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { projectSchema, type ProjectInput } from "@/lib/validations";
import type { ProjectWithMedia } from "@/types";
import { Save, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "@/lib/toast";
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges";
import { MediaUploader } from "./MediaUploader";
import { MediaGrid } from "./MediaGrid";
import { YouTubeInput } from "./YouTubeInput";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

interface ProjectFormProps {
  project?: ProjectWithMedia;
}

export function ProjectForm({ project }: ProjectFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [deleteMediaId, setDeleteMediaId] = useState<string | null>(null);
  const isEditing = !!project;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProjectInput>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: project?.title || "",
      description: project?.description || "",
      category: project?.category || "",
      location: project?.location || "",
      year: project?.year || undefined,
      isVisible: project?.isVisible ?? true,
      isFeatured: project?.isFeatured ?? false,
    },
  });

  useUnsavedChanges(isDirty);

  async function onSubmit(data: ProjectInput) {
    setSaving(true);
    setError("");

    const url = isEditing
      ? `/api/projects/${project.id}`
      : "/api/projects";

    const res = await fetch(url, {
      method: isEditing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    setSaving(false);

    if (res.ok) {
      const result = await res.json();
      if (isEditing) {
        reset(data);
        toast.success("Projeto salvo com sucesso!");
        router.refresh();
      } else {
        router.push(`/admin/projects/${result.id}`);
      }
    } else {
      toast.error("Erro ao salvar projeto");
      setError("Erro ao salvar projeto");
    }
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/admin/projects"
          className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 transition"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditing ? "Editar Projeto" : "Novo Projeto"}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Form */}
        <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-100 shadow-sm">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Título *
              </label>
              <input
                {...register("title")}
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
              {errors.title && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição
              </label>
              <textarea
                {...register("description")}
                rows={4}
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoria
                </label>
                <input
                  {...register("category")}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  placeholder="Ex: Residencial"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ano
                </label>
                <input
                  type="number"
                  {...register("year")}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Localização
              </label>
              <input
                {...register("location")}
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                placeholder="Ex: São Paulo, SP"
              />
            </div>

            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  {...register("isVisible")}
                  className="rounded border-gray-300"
                />
                Visível
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  {...register("isFeatured")}
                  className="rounded border-gray-300"
                />
                Destaque
              </label>
            </div>

            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50 transition"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {saving ? "Salvando..." : "Salvar"}
            </button>
          </form>
        </div>

        {/* Media section (edit mode) */}
        {isEditing && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-100 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Enviar imagens
              </h2>
              <MediaUploader
                projectId={project.id}
                onUploadComplete={() => router.refresh()}
              />
            </div>

            <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-100 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Vídeo do YouTube
              </h2>
              <YouTubeInput
                projectId={project.id}
                onAdded={() => router.refresh()}
              />
            </div>

            {project.media.length > 0 && (
              <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Mídias ({project.media.length})
                </h2>
                <MediaGrid
                  media={project.media}
                  coverMediaId={project.coverMediaId}
                  projectId={project.id}
                  onReorder={async (orderedIds) => {
                    const items = orderedIds.map((id, i) => ({ id, sortOrder: i }));
                    await fetch(`/api/projects/${project.id}/media`, {
                      method: "PUT",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ items }),
                    });
                    router.refresh();
                  }}
                  onSetCover={async (mediaId) => {
                    await fetch(`/api/projects/${project.id}`, {
                      method: "PUT",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        title: project.title,
                        isVisible: project.isVisible,
                        isFeatured: project.isFeatured,
                        coverMediaId: mediaId,
                      }),
                    });
                    router.refresh();
                  }}
                  onDelete={(mediaId) => setDeleteMediaId(mediaId)}
                />
              </div>
            )}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={deleteMediaId !== null}
        onOpenChange={(open) => { if (!open) setDeleteMediaId(null); }}
        title="Excluir mídia"
        description="Tem certeza que deseja excluir esta mídia? Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        variant="danger"
        onConfirm={async () => {
          if (!deleteMediaId || !project) return;
          await fetch(
            `/api/projects/${project.id}/media?mediaId=${deleteMediaId}`,
            { method: "DELETE" }
          );
          setDeleteMediaId(null);
          router.refresh();
        }}
      />
    </div>
  );
}
