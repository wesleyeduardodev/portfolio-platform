import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/admin/ProfileForm";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Editar Perfil</h1>
      <div className="max-w-xl bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
        <ProfileForm profile={profile} />
      </div>
    </div>
  );
}
