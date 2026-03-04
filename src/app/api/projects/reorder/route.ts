import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { reorderSchema } from "@/lib/validations";

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = reorderSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  await prisma.$transaction(
    parsed.data.items.map((item) =>
      prisma.project.updateMany({
        where: { id: item.id, userId: session.user!.id },
        data: { sortOrder: item.sortOrder },
      })
    )
  );

  return NextResponse.json({ ok: true });
}
