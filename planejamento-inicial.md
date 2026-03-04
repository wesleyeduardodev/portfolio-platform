# Plano: Portfolio Fernanda — Single-Tenant

## Contexto
Construir o site portfolio de Fernanda, engenheira civil e designer de interiores. O site precisa ser extremamente bonito e elegante porque os clientes vao ver. Inspirado em bio.site/larissareisarquitetura — minimalista, tons terrosos. Dominio sera `fernanda-eng.com.br` (ou similar).

Decisao: **single-tenant** focado na Fernanda. Codigo limpo para facilitar generalizacao futura se necessario.

**Repositorio:** `portfolio-platform`
**Admin:** `/admin` (protegido por auth)
**DB local:** Docker + PostgreSQL
**Storage:** AWS S3 (a configurar)

---

## Tech Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 15 (App Router) + TypeScript |
| Styling | Tailwind CSS 4 |
| Animacoes | Framer Motion |
| ORM | Prisma 6 |
| Database | PostgreSQL (Docker local, Neon em prod) |
| Auth | Auth.js v5 (credentials) |
| Storage | AWS S3 + CloudFront |
| Validacao | Zod + React Hook Form |
| UI Admin | Radix UI |
| Drag & Drop | @dnd-kit |
| Icons | Lucide React |
| Fontes | Cormorant Garamond (headings) + Inter (body) |

---

## Estrutura do Projeto

```
portfolio-platform/
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── public/fonts/
├── src/
│   ├── app/
│   │   ├── (public)/
│   │   │   ├── page.tsx              # Pagina publica principal
│   │   │   └── loading.tsx
│   │   ├── (admin)/admin/
│   │   │   ├── layout.tsx            # Shell admin (sidebar)
│   │   │   ├── page.tsx              # Dashboard
│   │   │   ├── profile/page.tsx      # Editar perfil
│   │   │   ├── projects/
│   │   │   │   ├── page.tsx          # Lista projetos
│   │   │   │   ├── new/page.tsx
│   │   │   │   └── [projectId]/page.tsx
│   │   │   └── contacts/page.tsx
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/route.ts
│   │   │   ├── upload/presign/route.ts
│   │   │   ├── upload/confirm/route.ts
│   │   │   ├── projects/route.ts
│   │   │   ├── projects/[projectId]/route.ts
│   │   │   ├── projects/[projectId]/media/route.ts
│   │   │   ├── projects/reorder/route.ts
│   │   │   ├── profile/route.ts
│   │   │   └── contacts/route.ts
│   │   ├── login/page.tsx
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── public/
│   │   │   ├── HeroSection.tsx
│   │   │   ├── ActionCards.tsx
│   │   │   ├── ContactButtons.tsx
│   │   │   ├── ProjectsGallery.tsx
│   │   │   ├── ProjectCard.tsx
│   │   │   ├── ProjectModal.tsx
│   │   │   ├── MediaViewer.tsx
│   │   │   └── Footer.tsx
│   │   ├── admin/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── ProjectForm.tsx
│   │   │   ├── MediaUploader.tsx
│   │   │   ├── MediaGrid.tsx
│   │   │   ├── ProfileForm.tsx
│   │   │   └── ProjectList.tsx
│   │   └── ui/ (Button, Input, Dialog, Card, Toast)
│   ├── lib/
│   │   ├── prisma.ts
│   │   ├── auth.ts
│   │   ├── s3.ts
│   │   ├── validations.ts
│   │   └── utils.ts
│   ├── hooks/useMediaUpload.ts
│   ├── types/index.ts
│   └── middleware.ts                 # Auth guard para /admin
├── docker-compose.yml
├── package.json
└── tailwind.config.ts
```

**Simplificacao vs multi-tenant:**
- Sem `[slug]` dinamico — pagina publica e a raiz `/`
- Sem middleware de roteamento multi-tenant
- Sem tabela de UserSettings por usuario (config fica no .env ou hardcoded)
- Um unico usuario admin (Fernanda)

---

## Database Schema

Prisma com `@map`/`@@map` para snake_case no PostgreSQL:

```prisma
model User {
  id           String    @id @default(cuid())
  email        String    @unique
  passwordHash String    @map("password_hash")
  name         String
  createdAt    DateTime  @default(now()) @map("created_at")
  updatedAt    DateTime  @updatedAt @map("updated_at")
  profile      Profile?
  projects     Project[]
  contacts     Contact[]

  @@map("users")
}

model Profile {
  id              String  @id @default(cuid())
  userId          String  @unique @map("user_id")
  user            User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  displayName     String  @map("display_name")
  title           String?
  bio             String? @db.Text
  profilePhotoUrl String? @map("profile_photo_url")
  profilePhotoKey String? @map("profile_photo_key")
  coverPhotoUrl   String? @map("cover_photo_url")
  coverPhotoKey   String? @map("cover_photo_key")
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")

  @@map("profiles")
}

model Project {
  id           String   @id @default(cuid())
  userId       String   @map("user_id")
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  title        String
  description  String?  @db.Text
  category     String?
  location     String?
  year         Int?
  sortOrder    Int      @default(0) @map("sort_order")
  isVisible    Boolean  @default(true) @map("is_visible")
  isFeatured   Boolean  @default(false) @map("is_featured")
  coverMediaId String?  @unique @map("cover_media_id")
  media        Media[]
  coverMedia   Media?   @relation("ProjectCover", fields: [coverMediaId], references: [id])
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  @@index([userId, sortOrder], map: "idx_projects_user_sort")
  @@index([userId, isVisible], map: "idx_projects_user_visible")
  @@map("projects")
}

model Media {
  id             String    @id @default(cuid())
  projectId      String    @map("project_id")
  project        Project   @relation(fields: [projectId], references: [id], onDelete: Cascade)
  type           MediaType
  url            String
  s3Key          String    @map("s3_key")
  thumbnailUrl   String?   @map("thumbnail_url")
  fileName       String    @map("file_name")
  fileSize       Int       @map("file_size")
  mimeType       String    @map("mime_type")
  width          Int?
  height         Int?
  altText        String?   @map("alt_text")
  caption        String?
  sortOrder      Int       @default(0) @map("sort_order")
  coverOfProject Project?  @relation("ProjectCover")
  createdAt      DateTime  @default(now()) @map("created_at")

  @@index([projectId, sortOrder], map: "idx_media_project_sort")
  @@map("media")
}

enum MediaType {
  IMAGE
  VIDEO
}

model Contact {
  id        String      @id @default(cuid())
  userId    String      @map("user_id")
  user      User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  type      ContactType
  label     String
  value     String
  url       String?
  sortOrder Int         @default(0) @map("sort_order")
  isVisible Boolean     @default(true) @map("is_visible")
  createdAt DateTime    @default(now()) @map("created_at")

  @@index([userId, sortOrder], map: "idx_contacts_user_sort")
  @@map("contacts")
}

enum ContactType {
  WHATSAPP
  PHONE
  EMAIL
  INSTAGRAM
  OTHER
}
```

**Padrao PostgreSQL aplicado:**
- Tabelas: `users`, `profiles`, `projects`, `media`, `contacts` (snake_case, plural)
- Colunas: `user_id`, `password_hash`, `created_at`, `sort_order`, etc. (snake_case)
- Indices: nomeados com prefixo `idx_`
- No TypeScript, Prisma mantém camelCase (ex: `user.passwordHash`, `project.sortOrder`)

---

## Design Visual — Pagina Publica

### Paleta de Cores
| Token | Cor | Uso |
|---|---|---|
| bg | `#F0EBE3` | Fundo linho quente |
| surface | `#FAFAF7` | Cards |
| primary | `#1A3C40` | Botoes, headings — verde floresta |
| accent | `#C6A664` | Detalhes dourados — luxo sutil |
| text | `#2C2C2C` | Texto principal |
| text-muted | `#7A7A72` | Legendas |
| whatsapp | `#25D366` | Botao WhatsApp |

### Tipografia
- **Headings:** Cormorant Garamond, serif (elegante, arquitetural)
- **Body:** Inter, sans-serif (legivel, moderno)

### Layout da Pagina (scroll vertical)

**1. Hero (HeroSection.tsx)**
- Cover photo fullwidth — 45vh mobile, 50vh desktop
- Gradient overlay na base: `linear-gradient(to top, #F0EBE3 0%, transparent 60%)`
- Foto de perfil circular 120px, borda branca 4px, shadow, overlap -60px no cover
- Nome em Cormorant Garamond 32px/48px, cor primary
- Titulo em Inter 14px, cor muted

**2. Action Cards (ActionCards.tsx)**
- Dois cards bg primary (#1A3C40), border-radius 16px, padding 24px
- "Portfolio" → smooth scroll para secao de projetos
- "Contato para Projetos" → smooth scroll para contatos
- Icone dourado (accent) + seta animada + hover translateY(-2px)

**3. Contact Buttons (ContactButtons.tsx)**
- WhatsApp: bg #25D366, branco, destaque visual
- Telefone/Email: bg surface, border sutil, icone primary
- Full-width, height 52px, border-radius 12px, gap 10px

**4. Projects Gallery (ProjectsGallery.tsx + ProjectCard.tsx)**
- Linha dourada decorativa + titulo "PROJETOS" em Cormorant
- Grid: 1 coluna mobile, 2 colunas desktop, gap 16-20px
- Cards com imagem cover (4:3), overlay gradient com nome + categoria pill dourada
- Hover: image scale(1.03), overlay fade-in

**5. Project Detail (ProjectModal.tsx + MediaViewer.tsx)**
- Mobile: slide-up panel 95vh
- Desktop: side panel 50vw from right
- Hero image 16:9 + nome + descricao + metadata pills + gallery grid 3 colunas
- Lightbox fullscreen com swipe navigation

**6. Footer (Footer.tsx)**
- Linha dourada + icones sociais + nome + atribuicao

### Animacoes
- **Page load:** Staggered — cover zoom-out → profile fade-up → texto → cards slide-up
- **Scroll:** Intersection Observer, translateY(20px) + opacity
- **Hover:** Cards elevam, project images scale
- **Micro:** Blurhash placeholders, WhatsApp breathing animation, scroll progress bar dourada

---

## Upload S3

**Fluxo direto browser → S3:**
1. `POST /api/upload/presign` → gera presigned PUT URL
2. Browser upload direto com progress tracking
3. `POST /api/upload/confirm` → salva no DB

**Estrutura S3:**
```
portfolio-media/profile/photo-{ts}.ext
portfolio-media/profile/cover-{ts}.ext
portfolio-media/projects/{projectId}/original/{uuid}.ext
portfolio-media/projects/{projectId}/thumbnails/{uuid}-thumb.ext
```

---

## Admin Panel

- **Dashboard** — stats, checklist de perfil, link preview
- **Perfil** — form + upload/crop de fotos (profile + cover)
- **Projetos** — lista drag-and-drop, toggle visibilidade/destaque
- **Editor de Projeto** — metadata + MediaUploader (drag-and-drop multi-file) + MediaGrid (reorder) + selecao de capa
- **Contatos** — CRUD sortable (WhatsApp, telefone, email, Instagram)

---

## Sequencia de Implementacao

### Fase 1: Scaffold (Steps 1-4)
1. `pnpm create next-app portfolio-platform` com TypeScript + Tailwind + App Router
2. Instalar dependencias: Prisma, Framer Motion, Lucide, Radix UI, @dnd-kit, Zod, React Hook Form, bcrypt, @aws-sdk/client-s3
3. Docker compose para PostgreSQL
4. Schema Prisma + migrations + seed (dados mock da Fernanda)
5. Configurar Tailwind com tokens de design (cores, fontes)

### Fase 2: Pagina Publica (Steps 5-12) — PRIORIDADE
6. Layout raiz + globals.css (CSS variables, font imports)
7. HeroSection — cover + profile photo + nome/bio + animacao entrada
8. ActionCards — cards Portfolio e Contato com smooth scroll
9. ContactButtons — WhatsApp, telefone, email
10. ProjectsGallery + ProjectCard — grid responsivo
11. ProjectModal + MediaViewer — lightbox com swipe
12. Footer
13. Animacoes completas (Framer Motion)
14. Responsividade mobile-first

### Fase 3: Auth + S3 (Steps 13-16)
15. Auth.js com credentials provider
16. Middleware para proteger /admin
17. Login page
18. Setup S3 + lib presigned URLs + API routes de upload

### Fase 4: Admin Panel (Steps 17-21)
19. Layout admin com sidebar
20. Profile page (form + upload fotos)
21. Projects CRUD (lista + editor + media upload + reorder)
22. Contacts CRUD
23. Dashboard

### Fase 5: Polish + Deploy (Steps 22-25)
24. Loading states, skeletons, error boundaries
25. SEO (meta tags, OG image)
26. Performance (lazy loading, image optimization)
27. Deploy Vercel + Neon + S3

---

## Verificacao

- [ ] `pnpm dev` → pagina publica renderiza em localhost:3000
- [ ] Hero com cover photo + profile photo animados
- [ ] Smooth scroll ao clicar nos action cards
- [ ] Botoes de contato abrem WhatsApp, telefone e email
- [ ] Gallery de projetos com dados do seed
- [ ] Project modal abre com lightbox funcional
- [ ] Animacoes de entrada no mobile e desktop
- [ ] Login funciona, /admin protegido
- [ ] CRUD de projetos com upload de fotos para S3
- [ ] Drag-and-drop reorder de projetos e midias
- [ ] Lighthouse score > 90
