import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { projectSchema } from "@/lib/validations";
import { withErrorHandler } from "@/lib/api-handler";

export const GET = withErrorHandler(async () => {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const projects = await prisma.project.findMany({
    where: { userId: session.user.id },
    orderBy: { sortOrder: "asc" },
    include: { media: { orderBy: { sortOrder: "asc" } }, coverMedia: true },
  });

  return NextResponse.json(projects);
});

export const POST = withErrorHandler(async (req) => {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const body = await req.json();
  const parsed = projectSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const maxSort = await prisma.project.aggregate({
    where: { userId: session.user.id },
    _max: { sortOrder: true },
  });

  const project = await prisma.project.create({
    data: {
      ...parsed.data,
      userId: session.user.id,
      sortOrder: (maxSort._max.sortOrder ?? -1) + 1,
    },
    include: { media: true, coverMedia: true },
  });

  return NextResponse.json(project, { status: 201 });
});
