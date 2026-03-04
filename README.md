# Portfolio Fernanda

Portfolio profissional para Fernanda Oliveira — Engenheira Civil & Designer de Interiores.

Site público elegante e minimalista com tons terrosos + painel admin completo para gerenciar projetos, mídias e contatos.

## Tech Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 16 (App Router) + TypeScript |
| Styling | Tailwind CSS 4 |
| Animações | Framer Motion |
| ORM | Prisma 6 |
| Database | PostgreSQL 17 |
| Auth | Auth.js v5 (credentials) |
| Storage | AWS S3 + presigned URLs |
| Validação | Zod + React Hook Form |
| Drag & Drop | @dnd-kit |
| Icons | Lucide React |

---

## Setup Local

### Pré-requisitos

- Node.js 20+
- Docker (para o PostgreSQL)
- npm

### 1. Clonar e instalar

```bash
git clone <repo-url> portfolio-platform
cd portfolio-platform
npm install
```

### 2. Configurar variáveis de ambiente

```bash
cp .env.example .env
```

Edite o `.env` conforme necessário. Os valores padrão já funcionam para desenvolvimento local.

### 3. Subir o banco de dados

```bash
docker compose up -d
```

Isso sobe um PostgreSQL 17 na porta **5437**.

### 4. Criar tabelas e popular com dados mock

```bash
npx prisma db push
npx tsx prisma/seed.ts
```

### 5. Rodar o dev server

```bash
npm run dev
```

Acesse:
- **Site público:** http://localhost:3000
- **Login admin:** http://localhost:3000/login
  - Email: `fernanda@fernanda-eng.com.br`
  - Senha: `change-me-in-production`
- **Painel admin:** http://localhost:3000/admin

### Comandos úteis

```bash
npm run dev          # Dev server
npm run build        # Build de produção
npm run start        # Rodar build de produção
npx prisma studio    # GUI visual do banco
npx prisma db push   # Sync schema → banco
npx tsx prisma/seed.ts  # Re-popular dados mock
```

---

## Deploy em Produção

### 1. Banco de dados (Railway, Neon, Supabase, etc.)

Crie um PostgreSQL em qualquer provedor. Exemplo com Railway:

1. Crie um novo projeto no [Railway](https://railway.app)
2. Adicione um serviço PostgreSQL
3. Copie a connection string (formato: `postgresql://user:password@host:port/dbname`)
4. Use essa URL como `DATABASE_URL` nas variáveis de ambiente da Vercel

Outros provedores compatíveis:
- **Neon** — serverless PostgreSQL, tem free tier generoso
- **Supabase** — PostgreSQL managed com extras
- **Render** — PostgreSQL simples e direto

### 2. Storage S3

1. Crie um bucket no AWS S3 (região `sa-east-1` recomendada)
2. Configure CORS no bucket para permitir uploads do browser:
   ```json
   [
     {
       "AllowedHeaders": ["*"],
       "AllowedMethods": ["PUT"],
       "AllowedOrigins": ["https://seu-dominio.com.br"],
       "ExposeHeaders": ["ETag"]
     }
   ]
   ```
3. Crie um IAM user com permissão `s3:PutObject` e `s3:GetObject` no bucket
4. (Opcional) Configure CloudFront como CDN na frente do bucket

### 3. Deploy na Vercel

1. Conecte o repositório na [Vercel](https://vercel.com)
2. Configure as variáveis de ambiente:

   ```
   DATABASE_URL=postgresql://user:password@host:port/dbname
   NEXTAUTH_SECRET=<gere com: openssl rand -base64 32>
   NEXTAUTH_URL=https://fernanda-eng.com.br
   ADMIN_EMAIL=fernanda@fernanda-eng.com.br
   ADMIN_PASSWORD=<senha-segura>
   AWS_REGION=sa-east-1
   AWS_ACCESS_KEY_ID=<sua-key>
   AWS_SECRET_ACCESS_KEY=<seu-secret>
   S3_BUCKET_NAME=<nome-do-bucket>
   CLOUDFRONT_URL=https://dxxxxxx.cloudfront.net  # opcional
   ```

3. Deploy. A Vercel roda o build automaticamente.
4. Após o primeiro deploy, rode o seed para criar o usuário admin:
   ```bash
   # Via Vercel CLI ou conectando direto no banco
   npx prisma db push
   npx tsx prisma/seed.ts
   ```

### 4. Domínio

Configure o domínio `fernanda-eng.com.br` (ou similar) apontando para a Vercel:
- Adicione o domínio no painel da Vercel
- Configure os registros DNS (CNAME ou A) conforme instruções da Vercel
- SSL é automático

---

## Estrutura do Projeto

```
portfolio-platform/
├── prisma/
│   ├── schema.prisma          # Schema do banco
│   └── seed.ts                # Dados mock
├── src/
│   ├── app/
│   │   ├── (public)/          # Página pública (raiz /)
│   │   ├── (admin)/admin/     # Painel admin
│   │   ├── api/               # API routes
│   │   ├── login/             # Página de login
│   │   ├── layout.tsx         # Layout raiz
│   │   └── globals.css        # Tokens de design
│   ├── components/
│   │   ├── public/            # Componentes da página pública
│   │   ├── admin/             # Componentes do admin
│   │   └── ui/                # Componentes base reutilizáveis
│   ├── lib/                   # Prisma, auth, S3, validações, utils
│   ├── hooks/                 # React hooks customizados
│   ├── types/                 # TypeScript types
│   └── middleware.ts          # Auth guard para /admin
├── docker-compose.yml         # PostgreSQL local
└── CLAUDE.md                  # Contexto para AI assistants
```

---

## Licença

Projeto privado. Todos os direitos reservados.
