import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { FolderOpen, Image as ImageIcon, Phone, Eye } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [projectCount, mediaCount, contactCount, profile] = await Promise.all([
    prisma.project.count({ where: { userId: session.user.id } }),
    prisma.media.count({
      where: { project: { userId: session.user.id } },
    }),
    prisma.contact.count({ where: { userId: session.user.id } }),
    prisma.profile.findUnique({ where: { userId: session.user.id } }),
  ]);

  const stats = [
    { label: "Projetos", value: projectCount, icon: FolderOpen },
    { label: "Mídias", value: mediaCount, icon: ImageIcon },
    { label: "Contatos", value: contactCount, icon: Phone },
  ];

  const checklist = [
    { done: !!profile?.profilePhotoUrl, label: "Foto de perfil" },
    { done: !!profile?.coverPhotoUrl, label: "Foto de capa" },
    { done: !!profile?.bio, label: "Bio" },
    { done: projectCount > 0, label: "Pelo menos 1 projeto" },
    { done: contactCount > 0, label: "Pelo menos 1 contato" },
  ];

  return (
    <div>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          Bem-vinda, {profile?.displayName || session.user.name}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl p-3 sm:p-5 border border-gray-100 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">
                  {stat.value}
                </p>
              </div>
              <stat.icon className="h-8 w-8 text-gray-300" />
            </div>
          </div>
        ))}
      </div>

      {/* Checklist */}
      <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-100 shadow-sm mb-6 sm:mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Checklist do perfil
        </h2>
        <div className="space-y-3">
          {checklist.map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <div
                className={`h-5 w-5 rounded-full flex items-center justify-center text-xs ${
                  item.done
                    ? "bg-green-100 text-green-600"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                {item.done ? "✓" : "○"}
              </div>
              <span
                className={`text-sm ${
                  item.done ? "text-gray-700" : "text-gray-400"
                }`}
              >
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Preview link */}
      <a
        href="/"
        target="_blank"
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary/90 transition"
      >
        <Eye className="h-4 w-4" />
        Ver site público
      </a>
    </div>
  );
}
