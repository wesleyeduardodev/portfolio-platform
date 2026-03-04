export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import type { PublicData } from "@/types";
import { PublicPage } from "./PublicPage";

async function getData(): Promise<PublicData> {
  const user = await prisma.user.findFirst({
    include: {
      profile: true,
      projects: {
        where: { isVisible: true },
        orderBy: { sortOrder: "asc" },
        include: {
          media: { orderBy: { sortOrder: "asc" } },
          coverMedia: true,
        },
      },
      contacts: {
        where: { isVisible: true },
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  return {
    profile: user?.profile ?? null,
    projects: user?.projects ?? [],
    contacts: user?.contacts ?? [],
  };
}

export default async function Home() {
  const data = await getData();

  return <PublicPage data={data} />;
}
