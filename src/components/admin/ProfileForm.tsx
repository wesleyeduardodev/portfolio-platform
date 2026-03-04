"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileSchema, type ProfileInput } from "@/lib/validations";
import type { Profile } from "@prisma/client";
import { Save, Loader2 } from "lucide-react";

interface ProfileFormProps {
  profile: Profile | null;
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: profile?.displayName || "",
      title: profile?.title || "",
      bio: profile?.bio || "",
    },
  });

  async function onSubmit(data: ProfileInput) {
    setSaving(true);
    setMessage("");

    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    setSaving(false);
    if (res.ok) {
      setMessage("Perfil salvo com sucesso!");
      setTimeout(() => setMessage(""), 3000);
    } else {
      setMessage("Erro ao salvar perfil");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nome de exibição *
        </label>
        <input
          {...register("displayName")}
          className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        />
        {errors.displayName && (
          <p className="mt-1 text-xs text-red-500">
            {errors.displayName.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Título / Profissão
        </label>
        <input
          {...register("title")}
          className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          placeholder="Ex: Engenheira Civil & Designer de Interiores"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Bio
        </label>
        <textarea
          {...register("bio")}
          rows={4}
          className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none"
          placeholder="Uma breve descrição sobre você..."
        />
      </div>

      {message && (
        <p
          className={`text-sm ${
            message.includes("Erro") ? "text-red-500" : "text-green-600"
          }`}
        >
          {message}
        </p>
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
        {saving ? "Salvando..." : "Salvar perfil"}
      </button>
    </form>
  );
}
