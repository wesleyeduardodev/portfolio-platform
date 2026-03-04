"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { securitySchema, type SecurityInput } from "@/lib/validations";
import { signOut } from "next-auth/react";
import { Shield, Loader2 } from "lucide-react";

interface SecurityFormProps {
  email: string;
}

export function SecurityForm({ email }: SecurityFormProps) {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SecurityInput>({
    resolver: zodResolver(securitySchema),
    defaultValues: {
      email,
      currentPassword: "",
      newPassword: undefined,
    },
  });

  async function onSubmit(data: SecurityInput) {
    setSaving(true);
    setMessage("");

    const res = await fetch("/api/auth/change-credentials", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      setMessage("Credenciais atualizadas! Redirecionando para login...");
      setTimeout(() => signOut({ callbackUrl: "/login" }), 1500);
    } else {
      const json = await res.json();
      setMessage(json.error || "Erro ao atualizar credenciais");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email de login *
        </label>
        <input
          {...register("email")}
          type="email"
          className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        />
        {errors.email && (
          <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Senha atual *
        </label>
        <input
          {...register("currentPassword")}
          type="password"
          className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          placeholder="Confirme sua senha atual"
        />
        {errors.currentPassword && (
          <p className="mt-1 text-xs text-red-500">
            {errors.currentPassword.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nova senha
        </label>
        <input
          {...register("newPassword")}
          type="password"
          className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          placeholder="Deixe vazio para manter a senha atual"
        />
        {errors.newPassword && (
          <p className="mt-1 text-xs text-red-500">
            {errors.newPassword.message}
          </p>
        )}
      </div>

      {message && (
        <p
          className={`text-sm ${
            message.includes("Erro") || message.includes("incorreta")
              ? "text-red-500"
              : "text-green-600"
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
          <Shield className="h-4 w-4" />
        )}
        {saving ? "Salvando..." : "Atualizar credenciais"}
      </button>
    </form>
  );
}
