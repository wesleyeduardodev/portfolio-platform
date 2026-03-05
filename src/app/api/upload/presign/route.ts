import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { storage } from "@/lib/storage";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { fileName, contentType, uploadType, projectId } = await req.json();

  if (!fileName || !contentType || !uploadType)
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const key = storage.buildKey(session.user.id, uploadType, projectId, fileName);
  const presignedUrl = await storage.generatePresignedUrl(key, contentType);
  const publicUrl = storage.getPublicUrl(key);

  return NextResponse.json({ presignedUrl, key, publicUrl });
}
