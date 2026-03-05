import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { projectSchema } from "@/lib/validations";
import { withErrorHandler } from "@/lib/api-handler";
import { storage } from "@/lib/storage";

type Params = { params: Promise<{ projectId: string }> };

export const GET = withErrorHandler(async (_req: Request, { params }: Params) => {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { projectId } = await params;

  const project = await prisma.project.findFirst({
    where: { id: projectId, userId: session.user.id },
    include: { media: { orderBy: { sortOrder: "asc" } }, coverMedia: true },
  });

  if (!project)
    return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

  return NextResponse.json(project);
});

export const PUT = withErrorHandler(async (req: Request, { params }: Params) => {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { projectId } = await params;
  const body = await req.json();
  const { coverMediaId, ...rest } = body;
  const parsed = projectSchema.safeParse(rest);
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const updateData: Record<string, unknown> = { ...parsed.data };
  if (coverMediaId !== undefined) {
    if (coverMediaId !== null) {
      const media = await prisma.media.findFirst({
        where: { id: coverMediaId, projectId },
      });
      if (!media)
        return NextResponse.json({ error: "Mídia não pertence ao projeto" }, { status: 400 });
    }
    updateData.coverMediaId = coverMediaId;
  }

  const project = await prisma.project.updateMany({
    where: { id: projectId, userId: session.user.id },
    data: updateData,
  });

  if (project.count === 0)
    return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

  return NextResponse.json({ ok: true });
});

export const DELETE = withErrorHandler(async (_req: Request, { params }: Params) => {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { projectId } = await params;

  // Buscar medias do projeto para limpar S3 antes de deletar
  const mediaList = await prisma.media.findMany({
    where: { project: { id: projectId, userId: session.user.id } },
    select: { s3Key: true },
  });

  // Deletar arquivos do S3
  for (const media of mediaList) {
    if (media.s3Key) {
      try {
        await storage.delete(media.s3Key);
      } catch (err) {
        console.error("Falha ao deletar arquivo do S3:", err);
      }
    }
  }

  const result = await prisma.project.deleteMany({
    where: { id: projectId, userId: session.user.id },
  });

  if (result.count === 0)
    return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

  return NextResponse.json({ ok: true });
});
