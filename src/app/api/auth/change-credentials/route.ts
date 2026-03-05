import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { securitySchema } from "@/lib/validations";
import { withErrorHandler } from "@/lib/api-handler";

export const PUT = withErrorHandler(async (req) => {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = securitySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0].message },
      { status: 400 }
    );
  }

  const { email, currentPassword, newPassword } = parsed.data;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
  }

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Senha atual incorreta" }, { status: 403 });
  }

  const updateData: { email: string; passwordHash?: string } = { email };

  if (newPassword) {
    updateData.passwordHash = await bcrypt.hash(newPassword, 12);
  }

  await prisma.user.update({
    where: { id: user.id },
    data: updateData,
  });

  return NextResponse.json({ ok: true });
});
