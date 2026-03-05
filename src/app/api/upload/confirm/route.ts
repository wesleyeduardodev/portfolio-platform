import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadConfirmSchema } from "@/lib/validations";
import { storage } from "@/lib/storage";
import { withErrorHandler } from "@/lib/api-handler";

export const POST = withErrorHandler(async (req) => {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const body = await req.json();
  const parsed = uploadConfirmSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { type, key, url } = parsed.data;

  if (type === "profile-photo" || type === "profile-cover") {
    // Buscar key anterior para limpar do S3
    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
      select: { profilePhotoKey: true, coverPhotoKey: true },
    });

    const oldKey =
      type === "profile-photo"
        ? profile?.profilePhotoKey
        : profile?.coverPhotoKey;

    if (oldKey) {
      try {
        await storage.delete(oldKey);
      } catch (err) {
        console.error("Falha ao deletar arquivo anterior do S3:", err);
      }
    }

    const data =
      type === "profile-photo"
        ? { profilePhotoUrl: url, profilePhotoKey: key }
        : { coverPhotoUrl: url, coverPhotoKey: key };

    await prisma.profile.update({
      where: { userId: session.user.id },
      data,
    });

    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Tipo inválido" }, { status: 400 });
});
