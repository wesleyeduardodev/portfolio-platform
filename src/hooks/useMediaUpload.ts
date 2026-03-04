"use client";

import { useState } from "react";

interface UploadOptions {
  uploadType: "profile-photo" | "profile-cover" | "project-media";
  projectId?: string;
  onSuccess?: (data: { url: string; key: string }) => void;
}

export function useMediaUpload({ uploadType, projectId, onSuccess }: UploadOptions) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  async function upload(file: File) {
    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      // 1. Get presigned URL
      const presignRes = await fetch("/api/upload/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type,
          uploadType,
          projectId,
        }),
      });

      if (!presignRes.ok) throw new Error("Failed to get presigned URL");

      const { presignedUrl, key, publicUrl } = await presignRes.json();

      // 2. Upload to S3
      const xhr = new XMLHttpRequest();
      await new Promise<void>((resolve, reject) => {
        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
        });
        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve();
          else reject(new Error(`Upload failed: ${xhr.status}`));
        });
        xhr.addEventListener("error", () => reject(new Error("Upload failed")));
        xhr.open("PUT", presignedUrl);
        xhr.setRequestHeader("Content-Type", file.type);
        xhr.send(file);
      });

      // 3. Confirm
      if (uploadType === "profile-photo" || uploadType === "profile-cover") {
        await fetch("/api/upload/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: uploadType, key, url: publicUrl }),
        });
      }

      setProgress(100);
      onSuccess?.({ url: publicUrl, key });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return { upload, uploading, progress, error };
}
