# 📊 Plataforma de Gestão de Broadcasts e Leads

Sistema web completo para gerenciamento de projetos, páginas do Facebook, cópias de mensagens, configuração de disparos automatizados e visualização de métricas.

## 📦 Tecnologias Utilizadas

- ✅ **Next.js 13+** (App Router)
- 🎨 **Tailwind CSS** com suporte a dark mode
- 🔄 **Zustand** para autenticação
- ⚛️ **React Query** para cache e chamadas de API
- 🔒 **SweetAlert2** para confirmações com tema
- 🧠 **Lucide React** para ícones modernos

---
## ⚙️ Comandos

```ts
Yarn install

Yarn dev
```
---


## 🧱 Estrutura do Projeto

```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── projects/
│       └── [id]/
│           ├── options/page.tsx
│           ├── broadcasts/page.tsx
│           └── facebook-profiles/
│               └── [profileId]/
│                   └── pages/
│                       ├── page.tsx
│                       └── [pageId]/
│                           └── messages/page.tsx
├── components/
│   ├── CopyModal.tsx
│   └── ToggleSwitch.tsx
├── hooks/
│   ├── useAuth.ts
│   ├── useProjects.ts
│   ├── useFacebookPages.ts
│   ├── useBroadcastCopys.ts
│   ├── useBroadcastConfig.ts
│   ├── useDashboard.ts
├── utils/
│   └── useSweetAlert.ts
```

---

## 🔐 Autenticação

A autenticação é gerenciada via `Zustand` com `localStorage` persistido:

```ts
// Armazena token, refreshToken e dados do usuário autenticado
useAuthStore.getState().user?.id
useAuthStore.getState().token
```

Após login, os dados são armazenados localmente e utilizados em headers de requisições protegidas.

---

## 🌐 API Endpoints

### 📁 Projetos
- `GET /api/v1/projects`
- `GET /api/v1/dashboard/:userId` → dashboard resumido por usuário

### 📄 Copys
- `GET /api/v1/broadcasts-copys-project?projectId=1`
- `POST /api/v1/broadcasts-copys-project`
- `PATCH /api/v1/broadcasts-copys-project/:id`
- `DELETE /api/v1/broadcasts-copys-project/:id`

### ⚙️ Configurações de Broadcast
- `GET /api/v1/broadcasts-config-project?projectId=1`

### 📨 Broadcasts enviados
- `GET /api/v1/broadcasts/project/:projectId?status=sent`

### 📘 Facebook Pages
- `GET /api/v1/facebook-pages?profileId=123`
- `POST /api/v1/facebook-pages`
- `DELETE /api/v1/facebook-pages?profileId=123&pageId=1`
- `PATCH /api/v1/facebook-pages/:pageId` → atualiza config (ex: palavras-chave, status)

### 💬 Mensagens automáticas por página
- `GET /api/v1/page_settings_message/:pageId`
- `POST /api/v1/page_settings_message`
- `PATCH /api/v1/page_settings_message/:id`
- `DELETE /api/v1/page_settings_message/:id`

### 🧲 Leads do Facebook
- `GET /api/v1/facebook/get-leads?facebookPageId=123`

---

## ⚛️ Hooks

- `useProjects`: busca todos os projetos
- `useBroadcastCopys`: busca cópias cadastradas para um projeto
- `useBroadcastConfig`: busca horários, URLs e timezone
- `useFacebookPages`: gerencia páginas vinculadas
- `usePageSettingsMessages`: gerencia mensagens automáticas
- `useDashboard`: coleta dados do dashboard resumido por usuário

---

## 🖥️ Principais Telas

### ✅ `/projects/[id]/options`
Página central com links de acesso rápido para:
- Broadcasts
- Perfis do Facebook
- Configurações e Métricas

### 🧾 `/broadcasts/copys`
Gerenciamento de cópias (textos + botões), com:
- Modal de criação/edição
- Exclusão com SweetAlert
- Visualização das configurações do projeto

### 🧑‍💻 `/projects/[id]/facebook-profiles/[profileId]/pages`
Listagem das páginas conectadas ao perfil, com:
- Contagem de leads
- Sidebar com ações: configurações, palavras-chave, desabilitar, excluir

### 💬 `/projects/[id]/facebook-profiles/[profileId]/pages/[pageId]/messages`
Configuração de:
- Mensagem de boas-vindas
- Mensagem de descadastro
- Botões e URLs

---

## 🌗 Suporte a Dark/Light Mode

Todo o projeto usa classes utilitárias do Tailwind CSS com suporte nativo a dark mode:

```tsx
<div className="bg-gray-800 dark:bg-white text-white dark:text-black" />
```

---