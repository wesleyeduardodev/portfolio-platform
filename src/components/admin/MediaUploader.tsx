"use client";

import { useCallback, useState } from "react";
import { Upload, X, Loader2, ImagePlus } from "lucide-react";
import { cn } from "@/lib/utils";

interface MediaUploaderProps {
  projectId: string;
  onUploadComplete: (media: {
    url: string;
    s3Key: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    width?: number;
    height?: number;
  }) => void;
}

interface UploadingFile {
  id: string;
  file: File;
  progress: number;
  error?: string;
}

export function MediaUploader({ projectId, onUploadComplete }: MediaUploaderProps) {
  const [uploading, setUploading] = useState<UploadingFile[]>([]);
  const [dragOver, setDragOver] = useState(false);

  const uploadFile = useCallback(
    async (file: File) => {
      const id = Math.random().toString(36).slice(2);
      setUploading((prev) => [...prev, { id, file, progress: 0 }]);

      try {
        // 1. Get presigned URL
        const presignRes = await fetch("/api/upload/presign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName: file.name,
            contentType: file.type,
            uploadType: "project-media",
            projectId,
          }),
        });

        if (!presignRes.ok) throw new Error("Erro ao gerar URL de upload");
        const { presignedUrl, key, publicUrl } = await presignRes.json();

        // 2. Upload to S3 with progress
        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.upload.addEventListener("progress", (e) => {
            if (e.lengthComputable) {
              const progress = Math.round((e.loaded / e.total) * 100);
              setUploading((prev) =>
                prev.map((u) => (u.id === id ? { ...u, progress } : u))
              );
            }
          });
          xhr.addEventListener("load", () => {
            if (xhr.status >= 200 && xhr.status < 300) resolve();
            else reject(new Error(`Upload falhou: ${xhr.status}`));
          });
          xhr.addEventListener("error", () => reject(new Error("Upload falhou")));
          xhr.open("PUT", presignedUrl);
          xhr.setRequestHeader("Content-Type", file.type);
          xhr.send(file);
        });

        // 3. Get image dimensions
        let width: number | undefined;
        let height: number | undefined;
        if (file.type.startsWith("image/")) {
          const dims = await getImageDimensions(file);
          width = dims.width;
          height = dims.height;
        }

        // 4. Save to DB
        const mediaRes = await fetch(`/api/projects/${projectId}/media`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: publicUrl,
            s3Key: key,
            fileName: file.name,
            fileSize: file.size,
            mimeType: file.type,
            width,
            height,
            type: file.type.startsWith("video/") ? "VIDEO" : "IMAGE",
          }),
        });

        if (!mediaRes.ok) throw new Error("Erro ao salvar mídia");

        onUploadComplete({
          url: publicUrl,
          s3Key: key,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          width,
          height,
        });

        // Remove from uploading list
        setUploading((prev) => prev.filter((u) => u.id !== id));
      } catch (err) {
        setUploading((prev) =>
          prev.map((u) =>
            u.id === id
              ? { ...u, error: err instanceof Error ? err.message : "Erro" }
              : u
          )
        );
      }
    },
    [projectId, onUploadComplete]
  );

  const handleFiles = useCallback(
    (files: FileList | File[]) => {
      const validFiles = Array.from(files).filter(
        (f) => f.type.startsWith("image/") || f.type.startsWith("video/")
      );
      validFiles.forEach(uploadFile);
    },
    [uploadFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={cn(
          "flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-4 sm:p-8 transition-colors cursor-pointer",
          dragOver
            ? "border-accent bg-accent/5"
            : "border-gray-200 hover:border-gray-300 bg-gray-50/50"
        )}
        onClick={() => {
          const input = document.createElement("input");
          input.type = "file";
          input.multiple = true;
          input.accept = "image/*,video/*";
          input.onchange = () => {
            if (input.files) handleFiles(input.files);
          };
          input.click();
        }}
      >
        <ImagePlus className="h-8 w-8 text-gray-300 mb-2" />
        <p className="text-sm text-gray-500 text-center">
          <span className="font-medium text-primary">Clique para enviar</span> ou
          arraste arquivos aqui
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Imagens e vídeos (JPG, PNG, WEBP, MP4)
        </p>
      </div>

      {/* Upload progress */}
      {uploading.length > 0 && (
        <div className="space-y-2">
          {uploading.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 rounded-lg bg-white border border-gray-100 p-2 sm:p-3"
            >
              {item.error ? (
                <X className="h-4 w-4 text-red-500 shrink-0" />
              ) : (
                <Loader2 className="h-4 w-4 text-primary animate-spin shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-700 truncate">
                  {item.file.name}
                </p>
                {item.error ? (
                  <p className="text-xs text-red-500">{item.error}</p>
                ) : (
                  <div className="mt-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-accent transition-all duration-300"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                )}
              </div>
              <span className="text-xs text-gray-400 shrink-0">
                {item.error ? "" : `${item.progress}%`}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function getImageDimensions(
  file: File
): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(img.src);
    };
    img.onerror = () => resolve({ width: 0, height: 0 });
    img.src = URL.createObjectURL(file);
  });
}
