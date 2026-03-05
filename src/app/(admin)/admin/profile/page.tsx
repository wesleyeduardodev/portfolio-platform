import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ProfileForm } from "@/components/admin/ProfileForm";
import { SecurityForm } from "@/components/admin/SecurityForm";
import { ProfilePhotoUploader } from "@/components/admin/ProfilePhotoUploader";
import {
  MessageCircle,
  Phone,
  Mail,
  Instagram,
  ExternalLink,
  ArrowRight,
} from "lucide-react";

const contactIcons: Record<string, typeof MessageCircle> = {
  WHATSAPP: MessageCircle,
  PHONE: Phone,
  EMAIL: Mail,
  INSTAGRAM: Instagram,
  OTHER: ExternalLink,
};

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [profile, user, contacts] = await Promise.all([
    prisma.profile.findUnique({ where: { userId: session.user.id } }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true },
    }),
    prisma.contact.findMany({
      where: { userId: session.user.id },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Editar Perfil</h1>

      {/* Row 1: Photos + Profile data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Fotos</h2>
          <ProfilePhotoUploader
            profilePhotoUrl={profile?.profilePhotoUrl || null}
            coverPhotoUrl={profile?.coverPhotoUrl || null}
          />
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Informações
          </h2>
          <ProfileForm profile={profile} />
        </div>
      </div>

      {/* Row 2: Security + Social Links */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Segurança
          </h2>
          <SecurityForm email={user?.email || ""} />
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Redes e Contatos
            </h2>
            <Link
              href="/admin/contacts"
              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition"
            >
              Gerenciar
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {contacts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-gray-400 mb-3">
                Nenhum contato cadastrado
              </p>
              <Link
                href="/admin/contacts"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition"
              >
                Adicionar contatos
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {contacts.map((contact) => {
                const Icon = contactIcons[contact.type] || ExternalLink;
                return (
                  <div
                    key={contact.id}
                    className="flex items-center gap-3 rounded-lg p-3 bg-gray-50/80"
                  >
                    <Icon className="h-4 w-4 text-primary shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {contact.label}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {contact.value}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded ${
                        contact.isVisible
                          ? "bg-green-50 text-green-600"
                          : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      {contact.isVisible ? "Visível" : "Oculto"}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
