# Relatório de Melhorias — Portfolio Platform

> Gerado em 05/03/2026 por análise automatizada de 3 agentes especializados (UX público, UX admin, arquitetura).

---

## Prioridade ALTA

- [x] **1. Sistema de Toast/Notificações global** ✅
  - Criado `src/lib/toast.ts` (event emitter simples)
  - Criado `src/components/ui/Toaster.tsx` (Radix Toast com 3 variantes)
  - Adicionado no layout admin
  - Substituídos todos os `alert()` e `message` states em ProfileForm, SecurityForm, ProfilePhotoUploader

- [x] **2. Try/catch em TODAS as rotas API** ✅
  - Criado `src/lib/api-handler.ts` com wrapper `withErrorHandler`
  - Aplicado em todas as 10 rotas (19 handlers)
  - Mensagens padronizadas para português
  - Formatos de resposta consistentes

- [x] **3. Validação Zod faltante em rotas de media e upload** ✅
  - Criados schemas: `mediaSchema`, `presignSchema`, `uploadConfirmSchema`
  - Aplicados nas rotas de media POST, presign POST, upload confirm POST

- [x] **4. Limpeza de S3 ao deletar** ✅
  - Media DELETE agora limpa S3 antes de remover registro
  - Project DELETE busca e limpa todos os arquivos S3 do projeto
  - Upload confirm limpa foto anterior ao trocar perfil/capa

- [x] **5. Acessibilidade (A11y) — Página pública** ✅
  - Modal/Lightbox com `role="dialog"`, `aria-modal="true"`, `aria-label`
  - Todos os links/botões de ícone com `aria-label` descritivo
  - YouTube iframe com `title`
  - `focus-visible` em todos os botões e links interativos
  - Skip-link "Pular para o conteúdo" adicionado
  - ScrollProgress com `aria-hidden="true"`
  - Cover image decorativa com `alt=""` + `role="presentation"`
  - HeroSection gradient usando CSS variable
  - Fix `.sort()` mutando arrays (ProjectsGallery, ProjectModal)

---

## Prioridade MÉDIA

- [x] **6. Feedbacks ausentes no admin** ✅
  - Toast de sucesso/erro em: ProjectForm (edit), ProjectList (toggles, delete, reorder), contacts page (add, edit, delete, toggle, reorder)
  - Optimistic updates com rollback em caso de erro (toggleVisibility, toggleFeatured, reorder)

- [x] **7. Confirmações com Dialog do Radix** ✅
  - Criado `src/components/ui/ConfirmDialog.tsx` com Radix AlertDialog
  - Substituído `confirm()` nativo em ProjectList e contacts page
  - SecurityForm agora tem campo "Confirmar nova senha" com validação

- [ ] **8. Validações de upload**
  - Sem limite de tamanho de arquivo
  - Sem limite de quantidade por upload
  - Sem preview antes de confirmar
  - Sem opção de remover foto de perfil/capa

- [x] **9. MediaGrid inacessível no mobile/touch** ✅
  - Botões sempre visíveis em mobile (`opacity-100 md:opacity-0 md:group-hover:opacity-100`)
  - Background mais sutil em mobile
  - aria-labels em todos os botões

- [x] **10. Segurança — ownership e rate limiting** ✅ (parcial)
  - `coverMediaId` agora verifica que a mídia pertence ao projeto
  - Media DELETE verifica pertencimento ao projectId
  - Media reorder usa `updateMany` com filtro de `projectId`
  - Rate limiting: pendente (requer infra adicional)

- [ ] **11. Consistência nas APIs**
  - Métodos HTTP inconsistentes para reorder (PATCH vs PUT)

---

## Prioridade BAIXA

- [ ] **12. Performance da página pública**
  - `force-dynamic` → migrar para ISR
  - Google Fonts via URL → migrar para `next/font`
  - Stagger delay sem limite

- [ ] **13. Polish visual**
  - Foto de perfil fixa 120px no mobile
  - Gallery estreita em widescreen

- [ ] **14. Unsaved changes warning**
  - ProfileForm, ProjectForm, SecurityForm sem aviso ao sair

- [ ] **15. Sidebar sem avatar/nome do usuário logado**
