import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ projectId: string }> };

export async function POST(req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { projectId } = await params;

  // Verify project ownership
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId: session.user.id },
  });
  if (!project)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const { url, s3Key, fileName, fileSize, mimeType, width, height, type } = body;

  const maxSort = await prisma.media.aggregate({
    where: { projectId },
    _max: { sortOrder: true },
  });

  const media = await prisma.media.create({
    data: {
      projectId,
      type: type || "IMAGE",
      url,
      s3Key,
      fileName,
      fileSize,
      mimeType,
      width,
      height,
      sortOrder: (maxSort._max.sortOrder ?? -1) + 1,
    },
  });

  return NextResponse.json(media, { status: 201 });
}

export async function PUT(req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { projectId } = await params;

  const project = await prisma.project.findFirst({
    where: { id: projectId, userId: session.user.id },
  });
  if (!project)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const { items } = body as { items: { id: string; sortOrder: number }[] };

  if (!items || !Array.isArray(items))
    return NextResponse.json({ error: "items required" }, { status: 400 });

  await prisma.$transaction(
    items.map((item) =>
      prisma.media.update({
        where: { id: item.id },
        data: { sortOrder: item.sortOrder },
      })
    )
  );

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { projectId } = await params;
  const { searchParams } = new URL(req.url);
  const mediaId = searchParams.get("mediaId");

  if (!mediaId)
    return NextResponse.json({ error: "mediaId required" }, { status: 400 });

  // Verify ownership
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId: session.user.id },
  });
  if (!project)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Unset cover if this media is the cover
  if (project.coverMediaId === mediaId) {
    await prisma.project.update({
      where: { id: projectId },
      data: { coverMediaId: null },
    });
  }

  await prisma.media.delete({ where: { id: mediaId } });

  return NextResponse.json({ ok: true });
}
