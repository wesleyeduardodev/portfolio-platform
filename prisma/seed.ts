import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash(
    process.env.ADMIN_PASSWORD || "change-me-in-production",
    12
  );

  const user = await prisma.user.upsert({
    where: { email: process.env.ADMIN_EMAIL || "fernanda@fernanda-eng.com.br" },
    update: { email: process.env.ADMIN_EMAIL || "fernanda@fernanda-eng.com.br", passwordHash },
    create: {
      email: process.env.ADMIN_EMAIL || "fernanda@fernanda-eng.com.br",
      passwordHash,
      name: "Fernanda",
    },
  });

  await prisma.profile.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      displayName: "Fernanda Oliveira",
      title: "Engenheira Civil & Designer de Interiores",
      bio: "Transformando espaços em experiências. Projetos que unem engenharia de precisão com design sensível, criando ambientes que contam histórias.",
      profilePhotoUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face",
      coverPhotoUrl: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&h=600&fit=crop",
    },
  });

  const projects = [
    {
      title: "Residência Vila Nova",
      description: "Reforma completa de apartamento de 120m² no Vila Nova Conceição. Conceito aberto com integração de ambientes, paleta neutra com toques de madeira natural e iluminação cenográfica.",
      category: "Residencial",
      location: "São Paulo, SP",
      year: 2024,
      sortOrder: 0,
      isFeatured: true,
      images: [
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=800&h=600&fit=crop",
      ],
    },
    {
      title: "Escritório Criativo Pinheiros",
      description: "Projeto corporativo para startup de tecnologia. 200m² com espaços colaborativos, sala de reunião com vidro acústico e área de descompressão com jardim vertical.",
      category: "Comercial",
      location: "São Paulo, SP",
      year: 2024,
      sortOrder: 1,
      isFeatured: true,
      images: [
        "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1604328698692-f76ea9498e76?w=800&h=600&fit=crop",
      ],
    },
    {
      title: "Casa de Campo Atibaia",
      description: "Projeto completo de residência de 350m² em terreno de 1.200m². Arquitetura contemporânea com elementos naturais, piscina com borda infinita e paisagismo autoral.",
      category: "Residencial",
      location: "Atibaia, SP",
      year: 2023,
      sortOrder: 2,
      isFeatured: false,
      images: [
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop",
      ],
    },
    {
      title: "Clínica Estética Jardins",
      description: "Projeto de interiores para clínica de estética. Ambiente acolhedor com iluminação indireta, materiais nobres e fluxo funcional entre recepção, consultórios e salas de procedimento.",
      category: "Comercial",
      location: "São Paulo, SP",
      year: 2023,
      sortOrder: 3,
      isFeatured: false,
      images: [
        "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&h=600&fit=crop",
      ],
    },
    {
      title: "Apartamento Itaim",
      description: "Reforma de apartamento compacto de 65m². Soluções inteligentes de marcenaria, aproveitamento máximo de espaço e estética minimalista com personalidade.",
      category: "Residencial",
      location: "São Paulo, SP",
      year: 2025,
      sortOrder: 4,
      isFeatured: true,
      images: [
        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800&h=600&fit=crop",
      ],
    },
    {
      title: "Restaurante Orgânico",
      description: "Design de interiores para restaurante farm-to-table. Materiais sustentáveis, iluminação quente e integração com horta vertical no salão principal.",
      category: "Comercial",
      location: "São Paulo, SP",
      year: 2024,
      sortOrder: 5,
      isFeatured: false,
      images: [
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&h=600&fit=crop",
      ],
    },
  ];

  for (const proj of projects) {
    const { images, ...projectData } = proj;

    const project = await prisma.project.create({
      data: {
        ...projectData,
        userId: user.id,
      },
    });

    const mediaRecords = await Promise.all(
      images.map((url, index) =>
        prisma.media.create({
          data: {
            projectId: project.id,
            type: "IMAGE",
            url,
            s3Key: `seed/${project.id}/${index}.jpg`,
            fileName: `image-${index}.jpg`,
            fileSize: 0,
            mimeType: "image/jpeg",
            width: 800,
            height: 600,
            sortOrder: index,
          },
        })
      )
    );

    // Set first image as cover
    await prisma.project.update({
      where: { id: project.id },
      data: { coverMediaId: mediaRecords[0].id },
    });
  }

  // Contacts
  await prisma.contact.createMany({
    data: [
      {
        userId: user.id,
        type: "WHATSAPP",
        label: "WhatsApp",
        value: "11999999999",
        url: "https://wa.me/5511999999999",
        sortOrder: 0,
      },
      {
        userId: user.id,
        type: "PHONE",
        label: "Telefone",
        value: "11999999999",
        sortOrder: 1,
      },
      {
        userId: user.id,
        type: "EMAIL",
        label: "E-mail",
        value: "contato@fernanda-eng.com.br",
        sortOrder: 2,
      },
      {
        userId: user.id,
        type: "INSTAGRAM",
        label: "Instagram",
        value: "@fernanda.eng",
        url: "https://instagram.com/fernanda.eng",
        sortOrder: 3,
      },
    ],
  });

  console.log("Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
