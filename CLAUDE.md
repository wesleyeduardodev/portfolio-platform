# Portfolio Fernanda — CLAUDE.md

## Projeto
Portfolio single-tenant para Fernanda, engenheira civil e designer de interiores.
Site público elegante (inspirado em bio.site/larissareisarquitetura) + admin panel completo.

## Tech Stack
- **Framework:** Next.js 16 (App Router) + TypeScript
- **Styling:** Tailwind CSS 4 (tokens customizados em `globals.css` via `@theme`)
- **Animações:** Framer Motion
- **ORM:** Prisma 6 + PostgreSQL 17 (Docker local, porta 5437)
- **Auth:** Auth.js v5 (next-auth@beta) com credentials provider
- **Storage:** AWS S3 + presigned URLs (a configurar)
- **Validação:** Zod 3 + React Hook Form
- **Drag & Drop:** @dnd-kit (core + sortable)
- **UI:** Radix UI (Dialog, Toast, Switch, Label, Dropdown)
- **Icons:** Lucide React
- **Fontes:** Cormorant Garamond (headings) + Inter (body) via Google Fonts

## Estrutura de Rotas
```
/ ..................... Página pública (server component → client PublicPage)
/login ................ Login admin
/admin ................ Dashboard (stats + checklist)
/admin/profile ........ Editar perfil (nome, título, bio)
/admin/projects ....... Lista projetos (drag-and-drop reorder)
/admin/projects/new ... Novo projeto
/admin/projects/[id] .. Editar projeto + MediaUploader + MediaGrid
/admin/contacts ....... CRUD de contatos
```

## API Routes
```
POST/GET  /api/auth/[...nextauth]
GET/PUT   /api/profile
GET/POST  /api/projects
GET/PUT/DELETE /api/projects/[projectId]
POST/PUT/DELETE /api/projects/[projectId]/media
PUT       /api/projects/reorder
GET/POST/PUT/DELETE /api/contacts
POST      /api/upload/presign
POST      /api/upload/confirm
```

## Database
- PostgreSQL 17 (Docker) na porta **5437**
- Schema: Users, Profiles, Projects, Media, Contacts
- Convenção: snake_case no DB, camelCase no TypeScript via `@map`/`@@map`
- Seed: 6 projetos mock + 4 contatos + perfil da Fernanda (imagens Unsplash)

## Design Tokens (Tailwind)
```
bg: #F0EBE3       (fundo linho)
surface: #FAFAF7   (cards)
primary: #1A3C40   (verde floresta)
accent: #C6A664    (dourado)
text: #2C2C2C
text-muted: #7A7A72
whatsapp: #25D366
```

## Comandos
```bash
docker compose up -d              # Sobe PostgreSQL 17 na porta 5437
npx prisma db push                # Sync schema → DB
npx tsx prisma/seed.ts            # Seed com dados mock
npm run dev                       # Dev server localhost:3000
npx prisma studio                 # GUI do banco
```

## Credenciais Dev
- **Email:** fernanda@fernanda-eng.com.br
- **Senha:** change-me-in-production

## Decisões Técnicas
- Single-tenant: sem [slug] dinâmico, página pública na raiz `/`
- `force-dynamic` na página pública (precisa do DB em runtime)
- Zod v3 (não v4) por compatibilidade com @hookform/resolvers
- Prisma v6 (não v7) por breaking changes no v7 com datasource URL
- Middleware do Next.js 16 mostra warning de deprecation (migrar para "proxy" no futuro)
- next-auth@beta (v5) — JWT sessions, credentials provider

## O que falta (Fase 5 — Polish)
- [ ] Loading skeletons e error boundaries
- [ ] Meta tags OG dinâmicas por projeto
- [ ] Blur placeholders nas imagens
- [ ] Deploy (Vercel + Neon + S3)
- [ ] Configurar AWS S3 real (atualmente upload aponta para S3 mas sem credenciais)
