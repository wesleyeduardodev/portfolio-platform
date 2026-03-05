import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { storage } from "@/lib/storage";
import { presignSchema } from "@/lib/validations";
import { withErrorHandler } from "@/lib/api-handler";

export const POST = withErrorHandler(async (req) => {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const body = await req.json();
  const parsed = presignSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { fileName, contentType, uploadType } = parsed.data;
  const projectId = body.projectId as string | undefined;

  const key = storage.buildKey(session.user.id, uploadType, projectId ?? null, fileName);
  const presignedUrl = await storage.generatePresignedUrl(key, contentType);
  const publicUrl = storage.getPublicUrl(key);

  return NextResponse.json({ presignedUrl, key, publicUrl });
});
