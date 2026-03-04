import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { type, key, url } = await req.json();

  if (type === "profile-photo" || type === "profile-cover") {
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

  return NextResponse.json({ error: "Invalid type" }, { status: 400 });
}
