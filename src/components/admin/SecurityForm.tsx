"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { securitySchema, type SecurityInput } from "@/lib/validations";
import { signOut } from "next-auth/react";
import { Shield, Loader2 } from "lucide-react";
import { toast } from "@/lib/toast";

interface SecurityFormProps {
  email: string;
}

export function SecurityForm({ email }: SecurityFormProps) {
  const [saving, setSaving] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmError, setConfirmError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SecurityInput>({
    resolver: zodResolver(securitySchema),
    defaultValues: {
      email,
      currentPassword: "",
      newPassword: undefined,
    },
  });

  const newPassword = watch("newPassword");

  async function onSubmit(data: SecurityInput) {
    // Validate confirm password when newPassword is filled
    if (data.newPassword) {
      if (confirmPassword !== data.newPassword) {
        setConfirmError("As senhas não coincidem");
        return;
      }
    }
    setConfirmError("");
    setSaving(true);

    const res = await fetch("/api/auth/change-credentials", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      toast.success("Credenciais atualizadas! Redirecionando para login...");
      setTimeout(() => signOut({ callbackUrl: "/login" }), 1500);
    } else {
      const json = await res.json();
      toast.error(json.error || "Erro ao atualizar credenciais");
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

      {newPassword && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Confirmar nova senha *
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (confirmError) setConfirmError("");
            }}
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            placeholder="Repita a nova senha"
          />
          {confirmError && (
            <p className="mt-1 text-xs text-red-500">{confirmError}</p>
          )}
        </div>
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
