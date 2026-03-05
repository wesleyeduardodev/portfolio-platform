import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { contactSchema } from "@/lib/validations";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const contacts = await prisma.contact.findMany({
    where: { userId: session.user.id },
    orderBy: { sortOrder: "asc" },
  });

  return NextResponse.json(contacts);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = contactSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const maxSort = await prisma.contact.aggregate({
    where: { userId: session.user.id },
    _max: { sortOrder: true },
  });

  const contact = await prisma.contact.create({
    data: {
      ...parsed.data,
      url: parsed.data.url || null,
      userId: session.user.id,
      sortOrder: (maxSort._max.sortOrder ?? -1) + 1,
    },
  });

  return NextResponse.json(contact, { status: 201 });
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { id, ...data } = body;

  if (!id)
    return NextResponse.json({ error: "id required" }, { status: 400 });

  const parsed = contactSchema.safeParse(data);
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const result = await prisma.contact.updateMany({
    where: { id, userId: session.user.id },
    data: { ...parsed.data, url: parsed.data.url || null },
  });

  if (result.count === 0)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ ok: true });
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { items } = body as { items: { id: string; sortOrder: number }[] };

  if (!items || !Array.isArray(items))
    return NextResponse.json({ error: "items required" }, { status: 400 });

  await prisma.$transaction(
    items.map((item) =>
      prisma.contact.updateMany({
        where: { id: item.id, userId: session.user!.id },
        data: { sortOrder: item.sortOrder },
      })
    )
  );

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id)
    return NextResponse.json({ error: "id required" }, { status: 400 });

  const result = await prisma.contact.deleteMany({
    where: { id, userId: session.user.id },
  });

  if (result.count === 0)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ ok: true });
}
