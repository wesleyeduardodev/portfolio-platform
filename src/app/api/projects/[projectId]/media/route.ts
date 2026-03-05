import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { mediaSchema } from "@/lib/validations";
import { storage } from "@/lib/storage";
import { withErrorHandler } from "@/lib/api-handler";

type Params = { params: Promise<{ projectId: string }> };

export const POST = withErrorHandler(async (req: Request, { params }: Params) => {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { projectId } = await params;

  // Verify project ownership
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId: session.user.id },
  });
  if (!project)
    return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

  const body = await req.json();
  const parsed = mediaSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { url, s3Key, fileName, fileSize, mimeType, width, height, type, thumbnailUrl } = parsed.data;

  const maxSort = await prisma.media.aggregate({
    where: { projectId },
    _max: { sortOrder: true },
  });

  const media = await prisma.media.create({
    data: {
      projectId,
      type: type || "IMAGE",
      url,
      s3Key: s3Key || null,
      thumbnailUrl: thumbnailUrl || null,
      fileName,
      fileSize,
      mimeType,
      width,
      height,
      sortOrder: (maxSort._max.sortOrder ?? -1) + 1,
    },
  });

  return NextResponse.json(media, { status: 201 });
});

export const PUT = withErrorHandler(async (req: Request, { params }: Params) => {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { projectId } = await params;

  const project = await prisma.project.findFirst({
    where: { id: projectId, userId: session.user.id },
  });
  if (!project)
    return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

  const body = await req.json();
  const { items } = body as { items: { id: string; sortOrder: number }[] };

  if (!items || !Array.isArray(items))
    return NextResponse.json({ error: "Items são obrigatórios" }, { status: 400 });

  await prisma.$transaction(
    items.map((item) =>
      prisma.media.updateMany({
        where: { id: item.id, projectId },
        data: { sortOrder: item.sortOrder },
      })
    )
  );

  return NextResponse.json({ ok: true });
});

export const DELETE = withErrorHandler(async (req: Request, { params }: Params) => {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { projectId } = await params;
  const { searchParams } = new URL(req.url);
  const mediaId = searchParams.get("mediaId");

  if (!mediaId)
    return NextResponse.json({ error: "mediaId é obrigatório" }, { status: 400 });

  // Verify ownership
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId: session.user.id },
  });
  if (!project)
    return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

  // Unset cover if this media is the cover
  if (project.coverMediaId === mediaId) {
    await prisma.project.update({
      where: { id: projectId },
      data: { coverMediaId: null },
    });
  }

  // Buscar media e verificar que pertence ao projeto
  const media = await prisma.media.findFirst({
    where: { id: mediaId, projectId },
  });

  if (!media)
    return NextResponse.json({ error: "Mídia não encontrada neste projeto" }, { status: 404 });

  if (media.s3Key) {
    try {
      await storage.delete(media.s3Key);
    } catch (err) {
      console.error("Falha ao deletar arquivo do S3:", err);
    }
  }

  await prisma.media.delete({ where: { id: mediaId } });

  return NextResponse.json({ ok: true });
});
