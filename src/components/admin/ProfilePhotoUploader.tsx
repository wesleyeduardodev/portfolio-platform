"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Camera, Loader2, ImagePlus, Trash2 } from "lucide-react";
import { toast } from "@/lib/toast";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

interface ProfilePhotoUploaderProps {
  profilePhotoUrl: string | null;
  coverPhotoUrl: string | null;
}

export function ProfilePhotoUploader({
  profilePhotoUrl,
  coverPhotoUrl,
}: ProfilePhotoUploaderProps) {
  const router = useRouter();
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [removingPhoto, setRemovingPhoto] = useState(false);
  const [removingCover, setRemovingCover] = useState(false);
  const [confirmRemovePhoto, setConfirmRemovePhoto] = useState(false);
  const [confirmRemoveCover, setConfirmRemoveCover] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  async function uploadFile(
    file: File,
    uploadType: "profile-photo" | "profile-cover"
  ) {
    // 1. Get presigned URL
    const presignRes = await fetch("/api/upload/presign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileName: file.name,
        contentType: file.type,
        uploadType,
      }),
    });

    if (!presignRes.ok) throw new Error("Erro ao gerar URL de upload");
    const { presignedUrl, key, publicUrl } = await presignRes.json();

    // 2. Upload to S3
    const uploadRes = await fetch(presignedUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    });

    if (!uploadRes.ok) throw new Error("Erro no upload");

    // 3. Confirm in DB
    const confirmRes = await fetch("/api/upload/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: uploadType, key, url: publicUrl }),
    });

    if (!confirmRes.ok) throw new Error("Erro ao salvar");

    return publicUrl;
  }

  async function handleRemovePhoto(type: "profile-photo" | "profile-cover") {
    const setRemoving = type === "profile-photo" ? setRemovingPhoto : setRemovingCover;
    setRemoving(true);
    try {
      const res = await fetch("/api/upload/confirm", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });
      if (!res.ok) throw new Error("Erro ao remover");
      router.refresh();
      toast.success("Foto removida");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao remover");
    }
    setRemoving(false);
  }

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      toast.error("Arquivo muito grande. Máximo: 5MB");
      if (photoInputRef.current) photoInputRef.current.value = "";
      return;
    }

    setUploadingPhoto(true);
    try {
      await uploadFile(file, "profile-photo");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro no upload");
    }
    setUploadingPhoto(false);
    if (photoInputRef.current) photoInputRef.current.value = "";
  }

  async function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      toast.error("Arquivo muito grande. Máximo: 5MB");
      if (coverInputRef.current) coverInputRef.current.value = "";
      return;
    }

    setUploadingCover(true);
    try {
      await uploadFile(file, "profile-cover");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro no upload");
    }
    setUploadingCover(false);
    if (coverInputRef.current) coverInputRef.current.value = "";
  }

  return (
    <div className="space-y-6">
      {/* Cover Photo */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Foto de capa
        </label>
        <div
          onClick={() => coverInputRef.current?.click()}
          className="relative w-full h-40 rounded-lg overflow-hidden bg-gray-100 border-2 border-dashed border-gray-200 hover:border-gray-300 cursor-pointer transition group"
        >
          {coverPhotoUrl ? (
            <>
              <Image
                src={coverPhotoUrl}
                alt="Capa"
                fill
                className="object-cover"
                sizes="600px"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition rounded-full bg-white/90 p-2.5">
                  {uploadingCover ? (
                    <Loader2 className="h-5 w-5 animate-spin text-gray-600" />
                  ) : (
                    <Camera className="h-5 w-5 text-gray-600" />
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              {uploadingCover ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <>
                  <ImagePlus className="h-6 w-6 mb-1" />
                  <span className="text-xs">Clique para enviar</span>
                </>
              )}
            </div>
          )}
        </div>
        {coverPhotoUrl && (
          <button
            type="button"
            onClick={() => setConfirmRemoveCover(true)}
            disabled={removingCover}
            className="mt-2 inline-flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 transition disabled:opacity-50"
          >
            {removingCover ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Trash2 className="h-3.5 w-3.5" />
            )}
            Remover capa
          </button>
        )}
        <input
          ref={coverInputRef}
          type="file"
          accept="image/*"
          onChange={handleCoverChange}
          className="hidden"
        />
        <ConfirmDialog
          open={confirmRemoveCover}
          onOpenChange={setConfirmRemoveCover}
          title="Remover foto de capa"
          description="Tem certeza que deseja remover a foto de capa?"
          confirmLabel="Remover"
          variant="danger"
          onConfirm={() => {
            setConfirmRemoveCover(false);
            handleRemovePhoto("profile-cover");
          }}
        />
      </div>

      {/* Profile Photo */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Foto de perfil
        </label>
        <div className="flex items-center gap-4">
          <div
            onClick={() => photoInputRef.current?.click()}
            className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-2 border-dashed border-gray-200 hover:border-gray-300 cursor-pointer transition group shrink-0"
          >
            {profilePhotoUrl ? (
              <>
                <Image
                  src={profilePhotoUrl}
                  alt="Perfil"
                  fill
                  className="object-cover"
                  sizes="96px"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition rounded-full bg-white/90 p-1.5">
                    {uploadingPhoto ? (
                      <Loader2 className="h-4 w-4 animate-spin text-gray-600" />
                    ) : (
                      <Camera className="h-4 w-4 text-gray-600" />
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                {uploadingPhoto ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Camera className="h-5 w-5" />
                )}
              </div>
            )}
          </div>
          <div>
            <p className="text-xs text-gray-400">
              Clique na foto para alterar. Recomendado: 400x400px.
            </p>
            {profilePhotoUrl && (
              <button
                type="button"
                onClick={() => setConfirmRemovePhoto(true)}
                disabled={removingPhoto}
                className="mt-1.5 inline-flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 transition disabled:opacity-50"
              >
                {removingPhoto ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" />
                )}
                Remover foto
              </button>
            )}
          </div>
        </div>
        <input
          ref={photoInputRef}
          type="file"
          accept="image/*"
          onChange={handlePhotoChange}
          className="hidden"
        />
        <ConfirmDialog
          open={confirmRemovePhoto}
          onOpenChange={setConfirmRemovePhoto}
          title="Remover foto de perfil"
          description="Tem certeza que deseja remover a foto de perfil?"
          confirmLabel="Remover"
          variant="danger"
          onConfirm={() => {
            setConfirmRemovePhoto(false);
            handleRemovePhoto("profile-photo");
          }}
        />
      </div>
    </div>
  );
}
