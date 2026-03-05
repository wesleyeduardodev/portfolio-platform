# Relatório de Melhorias — Portfolio Platform

> Gerado em 05/03/2026 por análise automatizada de 3 agentes especializados (UX público, UX admin, arquitetura).
> Todas as melhorias foram implementadas e validadas com TypeScript sem erros.

---

## Prioridade ALTA — ✅ Completa

- [x] **1. Sistema de Toast/Notificações global**
  - `src/lib/toast.ts` — event emitter simples
  - `src/components/ui/Toaster.tsx` — Radix Toast com 3 variantes (success/error/info)
  - Substituídos todos os `alert()` e `message` states

- [x] **2. Try/catch em TODAS as rotas API**
  - `src/lib/api-handler.ts` — wrapper `withErrorHandler`
  - Aplicado em 10 rotas (19 handlers)
  - Mensagens padronizadas para português

- [x] **3. Validação Zod em rotas de media e upload**
  - Schemas: `mediaSchema`, `presignSchema`, `uploadConfirmSchema`
  - contentType restrito a `image/*`

- [x] **4. Limpeza de S3 ao deletar**
  - Media/projeto DELETE limpa S3
  - Troca de foto limpa arquivo anterior

- [x] **5. Acessibilidade (A11y) — Página pública**
  - `role="dialog"`, `aria-modal`, `aria-label` em modals
  - `focus-visible` em todos os interativos
  - Skip-link, `aria-hidden` no ScrollProgress
  - YouTube iframe com `title`
  - Cover image decorativa com `alt=""`
  - Gradient usando CSS variable
  - Fix `.sort()` mutando arrays

---

## Prioridade MÉDIA — ✅ Completa

- [x] **6. Feedbacks no admin**
  - Toast sucesso/erro em todos os CRUD (ProjectForm, ProjectList, contacts)
  - Optimistic updates com rollback

- [x] **7. Confirmações com Dialog do Radix**
  - `src/components/ui/ConfirmDialog.tsx` — Radix AlertDialog
  - Substituído `confirm()` nativo em ProjectList e contacts
  - Campo "Confirmar nova senha" no SecurityForm

- [x] **8. Validações de upload**
  - Limite 10MB por arquivo (media), 5MB (perfil)
  - Máximo 20 arquivos por upload
  - Opção de remover foto de perfil/capa com ConfirmDialog
  - DELETE endpoint em `/api/upload/confirm`

- [x] **9. MediaGrid acessível no mobile/touch**
  - Botões sempre visíveis em mobile
  - aria-labels em todos os botões

- [x] **10. Segurança — ownership**
  - coverMediaId verifica pertencimento ao projeto
  - Media delete/reorder filtra por projectId
  - Rate limiting: pendente (requer infra — Upstash/Redis)

- [x] **11. Consistência nas APIs**
  - Reorder de contacts migrado de PATCH para PUT
  - Mensagens de erro em português
  - Respostas padronizadas

---

## Prioridade BAIXA — ✅ Completa

- [x] **12. Performance da página pública**
  - `next/font` para Cormorant Garamond e Inter (self-hosted)
  - ISR com `revalidate: 60` ao invés de `force-dynamic`
  - Stagger delay limitado a 0.4-0.5s máximo

- [x] **13. Polish visual**
  - Foto de perfil responsiva (96px mobile, 120px desktop)
  - Gallery expandida para `max-w-4xl` com `lg:grid-cols-3`
  - HeroSection gradient com CSS variable

- [x] **14. Unsaved changes warning**
  - Hook `src/hooks/useUnsavedChanges.ts`
  - Aplicado em ProfileForm e ProjectForm
  - `reset(data)` após salvar para limpar dirty state

- [x] **15. Sidebar com nome do usuário**
  - Layout passa `userName` e `userEmail` para Sidebar
  - Exibido no footer da sidebar antes dos links
