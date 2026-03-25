# MarkType

**Gerador de documentação a partir de Markdown** — com pré-visualização em vários modelos visuais e exportação para **PDF**.

Destinado a **equipas que documentam software** (READMEs, guias internos, notas geradas por IA): em vez de entregar só ficheiros `.md` brutos, podes gerar um documento com aparência consistente e partilhar PDF.

[Funcionalidades](#funcionalidades) · [Arquitetura](#arquitetura) · [Requisitos](#requisitos) · [Instalação](#instalação) · [Configuração](#configuração) · [Como usar](#como-usar) · [API HTTP](#api-http) · [Produção](#build-e-produção) · [Contribuir](#contribuir)

---

## Funcionalidades

| Área | Descrição |
|------|-----------|
| **Editor** | Colar Markdown ou importar o `README.md` de um repositório **público** no GitHub. |
| **Modelos** | Cinco estilos de documento: Profissional, Moderno, SaaS, Documento (simples / impressão), Compliance. O modelo escolhe-se na **coluna de pré-visualização**. |
| **Pré-visualização** | Renderização em tempo real alinhada ao modelo. |
| **Exportar PDF** | Geração no servidor Next (Node runtime) com renderização HTML/CSS e upload para Supabase Storage. |
| **Persistência** | Após PDF com upload bem-sucedido, registo na tabela `documents` (Supabase). |

---

## Arquitetura

Monorepo **npm workspaces**:

- **`frontend/`** — Next.js (App Router): interface, rotas `/api/*` (BFF).
- **`supabase/migrations/`** — SQL aplicado pelo Supabase CLI (`supabase db reset` / cloud `db push`).
- **`packages/`** — `markdown`, `templates`, `document-styles` (HTML/CSS partilhado com a exportação PDF).

Fluxo resumido: o browser fala só com o Next; o Next gera PDF e integra com Supabase (Storage + DB).

---

## Requisitos

- **Node.js** 18+
- **npm** 9+ (suporte a `workspaces`)
- Conta gratuita em **[Supabase](https://supabase.com)** (Postgres + Storage)
- Opcional: **token GitHub** (`GITHUB_TOKEN`) para reduzir rate limit na importação de READMEs

---

## Instalação

### 1. Obter o código

```bash
git clone https://github.com/SEU_USUARIO/marktype.git
cd marktype
```

Substitui `SEU_USUARIO/marktype` pelo URL real do repositório público.

### 2. Instalar dependências

Na **raiz** do monorepo:

```bash
npm install
```

Isto instala `frontend`, `backend/worker` e os pacotes em `packages/` via workspaces.

### 3. Variáveis de ambiente

**Frontend (Next.js)**

```bash
cp frontend/.env.example frontend/.env.local
```

Edita `frontend/.env.local`:

| Variável | Uso |
|----------|-----|
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave anon (pública) |
| `SUPABASE_SERVICE_ROLE_KEY` | **Servidor apenas** — upload Storage e inserts; sem isto o upload costuma falhar |
| `WORKER_URL` | Legado/opcional (não necessário no fluxo Next + Supabase) |
| `GITHUB_TOKEN` | Opcional — importação de README |

---

## Configuração

### Supabase

#### Opção A — Local (Docker + CLI)

Na **raiz** do repositório (precisas de [Docker Desktop](https://www.docker.com/products/docker-desktop/) a correr):

```bash
npx supabase@latest start
```

No fim, o CLI mostra **API URL**, **anon key** e **service_role key**. Copia para `frontend/.env.local`:

| Variável | Valor típico (local) |
|----------|----------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `http://127.0.0.1:54321` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | (output de `supabase status`) |
| `SUPABASE_SERVICE_ROLE_KEY` | (output de `supabase status`) |

Comandos úteis: `npx supabase status`, `npx supabase stop`, `npx supabase db reset` (reaplica `supabase/migrations/`).

**Ligar o teu projeto na cloud** (opcional, para `db push` / backups): `npx supabase login` e depois `npx supabase link --project-ref <ref>` (o `ref` está em *Project Settings → General* no dashboard).

#### Opção B — Projeto em [app.supabase.com](https://app.supabase.com)

1. Cria o projeto no dashboard.
2. **SQL Editor** — cola e executa o conteúdo dos ficheiros em `supabase/migrations/` **por ordem** (prefixo `20250325...`).
3. O bucket **`pdfs`** e a policy de leitura vêm na migration `...04_storage_bucket_pdfs.sql`; se algo falhar, cria o bucket manualmente como **público** com o id `pdfs`.

### Arranque em desenvolvimento

Na raiz:

```bash
npm run dev
```

- App: **http://localhost:3000**

Comandos úteis:

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Ambiente completo do monorepo |
| `npm run dev:web` | Só Next |

---

## Como usar

### Na interface web

1. Abre **http://localhost:3000**.
2. Escreve ou cola **Markdown** no painel esquerdo, ou usa **Importar do GitHub** com a URL de um repo público.
3. No painel direito, escolhe o **modelo** no menu *Modelo do documento*.
4. Usa **Exportar PDF** no cabeçalho; quando o upload funcionar, o download inicia automaticamente.

### Modelos disponíveis (ids usados na API)

| ID | Nome na UI |
|----|------------|
| `professional` | Profissional |
| `modern` | Moderno |
| `saas` | Simples |
| `document` | Documento |
| `compliance` | Compliance |

---

## API HTTP

Todas as rotas abaixo são servidas pelo Next (`/api/...`). Corpo JSON em `POST` com `Content-Type: application/json`.

### `POST /api/parse-markdown`

```json
{ "markdown": "# Título\n\nParágrafo." }
```

Resposta: `{ "title", "description", "sections", "html", ... }`.

### `POST /api/import-github`

```json
{ "repoUrl": "https://github.com/facebook/react" }
```

Resposta: `{ "markdown": "...", "repoName": "facebook/react" }`.

### `POST /api/generate-pdf`

```json
{ "markdown": "# Olá", "template": "modern" }
```

Resposta de sucesso: `{ "url": "https://.../pdfs/docs/....pdf" }`.

## Build e produção

```bash
npm run build
```

Compila `packages/*` necessários e o **frontend**. Para servir o Next em produção:

```bash
npm run start --workspace=@marktype/web
```

Em produção garante que o Supabase e o bucket `pdfs` estão configurados no ambiente alvo.

### Vercel (Auth.js / login)

No **Project → Settings → Environment Variables** (Production), define:

| Variável | Notas |
|----------|--------|
| `AUTH_SECRET` | String aleatória longa (`openssl rand -base64 32`). **Não** é o Client Secret do GitHub. |
| `AUTH_URL` | URL pública do deploy, ex.: `https://mark-type.vercel.app` (sem path). |
| `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET` | Client ID e Client Secret do OAuth App no GitHub. |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Login por e-mail. |
| `SUPABASE_SERVICE_ROLE_KEY` | Servidor (PDF / Storage). |

No **GitHub OAuth App**, a **Authorization callback URL** deve ser exatamente:

`https://SEU_DOMINIO.vercel.app/api/auth/callback/github`

(não é a home `/`). Depois de alterar variáveis na Vercel, faz **Redeploy**.

Para validar: abre `https://SEU_DOMINIO.vercel.app/api/auth/session` — deve responder JSON (200), não erro 500.

---

## Schema da base (resumo)

Tabela `public.documents`: `id`, `created_at`, `updated_at`, `title`, `markdown`, `template` (um dos cinco ids), `pdf_url`, `user_id` (nullable). A RLS incluída é pensada para **MVP** — endurece antes de expor a produção pública.

---

## Contribuir

Contribuições são bem-vindas: issues para bugs ou ideias, pull requests com alterações focadas. Mantém o estilo do código existente e atualiza o README se mudares fluxos de configuração ou APIs.

1. Faz fork do repositório.
2. Cria um branch (`git checkout -b feat/alguma-coisa`).
3. Commit com mensagens claras.
4. Abre um Pull Request para o branch principal do projeto.

---

## Licença

**MIT** — vê o ficheiro de licença no repositório (se ainda não existir, podes adicionar `LICENSE` com texto MIT padrão).

© MarkType Contributors
