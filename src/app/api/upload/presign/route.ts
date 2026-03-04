import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generatePresignedUrl, buildS3Key, getPublicUrl } from "@/lib/s3";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { fileName, contentType, uploadType, projectId } = await req.json();

  if (!fileName || !contentType || !uploadType)
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const key = buildS3Key(uploadType, projectId, fileName);
  const presignedUrl = await generatePresignedUrl(key, contentType);
  const publicUrl = getPublicUrl(key);

  return NextResponse.json({ presignedUrl, key, publicUrl });
}
