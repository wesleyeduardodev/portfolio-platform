import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ProjectList } from "@/components/admin/ProjectList";

export default async function ProjectsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const projects = await prisma.project.findMany({
    where: { userId: session.user.id },
    orderBy: { sortOrder: "asc" },
    include: {
      media: { orderBy: { sortOrder: "asc" } },
      coverMedia: true,
    },
  });

  return <ProjectList initialProjects={projects} />;
}
