import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { profileSchema } from "@/lib/validations";
import { withErrorHandler } from "@/lib/api-handler";

export const GET = withErrorHandler(async () => {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
  });

  return NextResponse.json(profile);
});

export const PUT = withErrorHandler(async (req) => {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const body = await req.json();
  const parsed = profileSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const profile = await prisma.profile.upsert({
    where: { userId: session.user.id },
    update: parsed.data,
    create: { ...parsed.data, userId: session.user.id },
  });

  return NextResponse.json({ ok: true });
});
