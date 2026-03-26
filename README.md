# MarkType

**Gerador de documentação a partir de Markdown** — pré-visualização em vários modelos visuais e exportação para **PDF**, com opção de guardar ficheiros no **Supabase Storage** e registo na base de dados.

Pensado para **equipas que documentam software** (READMEs, guias, notas): em vez de partilhar só `.md` brutos, obténs um documento com aspeto consistente e um PDF pronto a enviar.

[O que o projeto inclui](#o-que-o-projeto-inclui) · [O que está configurado](#o-que-está-configurado) · [Como usar](#como-usar) · [Requisitos](#requisitos) · [Instalação](#instalação) · [Supabase](#configuração-supabase) · [API HTTP](#api-http) · [Produção](#build-e-produção)


---

## O que o projeto inclui

### Aplicação web (`frontend/`)

| Área | Descrição |
|------|-----------|
| **`/` (home)** | Editor Markdown à esquerda, pré-visualização à direita; importação de README de repositório **público** por URL; escolha de **modelo** na pré-visualização; **Exportar PDF**. |
| **`/login`** | Entrar com **GitHub** (OAuth) ou com **e-mail e senha** (contas criadas via Supabase Auth). |
| **`/repos`** | Após login com GitHub: lista dos **teus repositórios** (incluindo privados, graças ao token OAuth), abrir README no editor e, opcionalmente, **traduzir** o Markdown (requer `OPENAI_API_KEY`). |

### Pacotes partilhados (`packages/`)

| Pacote | Função |
|--------|--------|
| **`@marktype/markdown`** | Parsing / transformação de Markdown usada pela app. |
| **`@marktype/templates`** | Definição dos modelos de documento. |
| **`@marktype/document-styles`** | HTML/CSS alinhado ao modelo escolhido — partilhado entre pré-visualização e geração do PDF. |

### Infraestrutura de dados (`supabase/`)

- **Migrations SQL** em `supabase/migrations/` — esquema `documents`, valores de `template`, ligação a `auth.users`, bucket **`pdfs`** e políticas de Storage.
- **`seed.sql`** opcional para dados de desenvolvimento.

### Worker opcional (`backend/worker/`)

Serviço **Express** legado que gera PDF a partir de HTML (LaTeX se disponível, senão Puppeteer). O fluxo **principal** da aplicação gera o PDF **dentro do Next.js** (`/api/generate-pdf`); o worker só é relevante se integrares `WORKER_URL` noutro fluxo. O comando `npm run dev` na raiz arranca **frontend + worker** em paralelo.

---

## O que está configurado

### Monorepo (npm workspaces)

Na raiz, os workspaces incluem `frontend`, `backend/worker` e `packages/*`. Um único `npm install` na raiz instala tudo.

### Autenticação (Auth.js / NextAuth v5)

- **GitHub**: OAuth com escopos `read:user` e `repo` — necessário para listar repositórios e ler READMEs autenticados em `/repos` e em `GET /api/github/readme`.
- **E-mail e senha**: login via Supabase (`signInWithPassword`); registo exposto em `POST /api/auth/signup` (Supabase `signUp`).
- Sessão em **JWT**; em desenvolvimento, se `AUTH_SECRET` não estiver definido, usa-se um segredo local só para não quebrar o servidor (ver aviso no console).

### Geração de PDF

- Rota **`POST /api/generate-pdf`**: Markdown → HTML → `buildStyledDocumentHtml` → **Puppeteer** imprime A4 com margens definidas no código.
- **Em produção na Vercel**: usa `@sparticuz/chromium` + `puppeteer-core` (sem Chrome do sistema).
- **Em desenvolvimento local**: `puppeteer` com Chromium embutido.
- Depois do render, o PDF pode ser enviado ao bucket **`pdfs`** e guardado em `public.documents` (com `user_id` quando há sessão).

### Base de dados e ficheiros

- Tabela **`public.documents`**: metadados do export (título, markdown, template, URL do PDF, `user_id` opcional).
- **RLS** nas migrations está pensada para **MVP** (políticas permissivas); deve ser endurecida antes de exposição pública séria.

### Variáveis de ambiente (referência rápida)

Copia `frontend/.env.example` para `frontend/.env.local` e preenche conforme a funcionalidade:

| Objetivo | Variáveis principais |
|----------|----------------------|
| PDF + Storage + registo `documents` | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` |
| Login GitHub + `/repos` | `AUTH_SECRET`, `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET`; em produção também `AUTH_URL` |
| Login e-mail (Supabase) | As mesmas chaves **anon** + URL Supabase (e utilizadores criados no projeto Supabase) |
| Importar README público sem rate limit baixo | `GITHUB_TOKEN` (opcional) |
| Traduzir Markdown (`/repos`) | `OPENAI_API_KEY` (opcional); modelo configurável via `OPENAI_TRANSLATE_MODEL` |

O ficheiro `frontend/.env.example` documenta cada variável em comentários. O worker tem `backend/worker/.env.example` (`PORT`, `ENABLE_LATEX`) se fores usar esse serviço.

---

## Como usar

### 1. Instalar e configurar o ambiente

1. **Clonar** o repositório e entrar na pasta do projeto.
2. Na **raiz**: `npm install`.
3. **Supabase**: segue [Configuração Supabase](#configuração-supabase) (local com CLI ou projeto em cloud) e aplica as migrations em ordem.
4. **Frontend**: `cp frontend/.env.example frontend/.env.local` e preenche pelo menos as variáveis Supabase; para login completo, Auth e opcionalmente OpenAI/GitHub token.

### 2. Arrancar em desenvolvimento

Na **raiz**:

```bash
npm run dev
```

- Interface: **http://localhost:3000**  
- Isto corre o **Next** e o **worker** em paralelo. Para **só** a web: `npm run dev:web`.

### 3. Na página principal (`/`)

1. Escreve ou cola **Markdown**, ou usa **importar por URL** de um repositório **público** no GitHub.
2. No painel de pré-visualização, escolhe o **modelo** do documento.
3. Clica **Exportar PDF**; com Storage configurado, o download pode seguir após o upload bem-sucedido.

### 4. Login, repositórios e tradução

1. Vai a **`/login`**: entra com **GitHub** ou regista/inicia sessão com **e-mail** (conforme o teu Supabase Auth).
2. Em **`/repos`** (com sessão GitHub): vês a lista dos teus repos, podes abrir o README no editor e, se `OPENAI_API_KEY` estiver definida, usar **traduzir e abrir** para um idioma suportado.

### Modelos disponíveis (ids na API e na BD)

| ID | Nome na UI |
|----|------------|
| `professional` | Profissional |
| `modern` | Moderno |
| `saas` | Simples |
| `document` | Documento |
| `compliance` | Compliance |

---

## Requisitos

- **Node.js** 18+
- **npm** 9+ (workspaces)
- Conta **[Supabase](https://supabase.com)** (Postgres + Storage) para PDF persistido e login por e-mail
- Opcional: **GitHub OAuth App** (login GitHub + `/repos`)
- Opcional: **`GITHUB_TOKEN`** para importação anónima de READMEs públicos
- Opcional: **`OPENAI_API_KEY`** para tradução em `/repos`
- Supabase local: **[Docker](https://www.docker.com/products/docker-desktop/)** + [Supabase CLI](https://supabase.com/docs/guides/cli)

---

## Instalação (resumo)

```bash
git clone <URL_DO_TEU_REPOSITORIO>
cd mark-type   # ou o nome da pasta do clone
npm install
cp frontend/.env.example frontend/.env.local
# Edita frontend/.env.local com URL/keys do Supabase e, se precisares, Auth / OpenAI / GITHUB_TOKEN
```

---

## Configuração Supabase

### Opção A — Local (Docker + CLI)

Na raiz do repositório:

```bash
npx supabase@latest start
```

Usa `npx supabase status` para copiar **API URL**, **anon key** e **service_role** para `frontend/.env.local`.

| Variável | Valor típico (local) |
|----------|----------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `http://127.0.0.1:54321` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | (output de `supabase status`) |
| `SUPABASE_SERVICE_ROLE_KEY` | (output de `supabase status`) |

Úteis: `npx supabase stop`, `npx supabase db reset` (reaplica `supabase/migrations/`).

Para ligar à cloud: `npx supabase login` e `npx supabase link --project-ref <ref>`.

### Opção B — Projeto em [app.supabase.com](https://app.supabase.com)

1. Cria o projeto.
2. No **SQL Editor**, executa o conteúdo dos ficheiros em `supabase/migrations/` **por ordem** (prefixo `20250325...`).
3. O bucket **`pdfs`** e políticas vêm da migration de storage; se falhar, cria o bucket **público** com id `pdfs`.

---

## API HTTP

Rotas servidas pelo Next (`/api/...`). Em `POST`, usa `Content-Type: application/json` salvo indicação em contrário.

| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/api/parse-markdown` | `{ "markdown": "..." }` → estrutura parseada + HTML, etc. |
| `POST` | `/api/import-github` | `{ "repoUrl": "https://github.com/owner/repo" }` → README público (usa `GITHUB_TOKEN` se existir). |
| `GET` | `/api/github/readme` | Query `owner`, `repo` — requer **sessão GitHub**; README com token do utilizador. |
| `GET` | `/api/github/repos` | Lista repos do utilizador — requer **sessão GitHub**. |
| `POST` | `/api/translate-markdown` | `{ "markdown": "...", "targetLang": "pt-BR" \| "en" \| ... }` — requer **login** e `OPENAI_API_KEY`. |
| `POST` | `/api/generate-pdf` | `{ "markdown": "...", "template": "modern" }` → `{ "url": "..." }` em caso de sucesso com upload. |
| `POST` | `/api/auth/signup` | Registo e-mail: `{ "email", "password", "passwordConfirm" }`. |
| * | `/api/auth/*` | Handlers Auth.js (OAuth GitHub, credentials, callbacks). |

Exemplos já existentes no repositório:

**`POST /api/parse-markdown`**

```json
{ "markdown": "# Título\n\nParágrafo." }
```

**`POST /api/import-github`**

```json
{ "repoUrl": "https://github.com/facebook/react" }
```

**`POST /api/generate-pdf`**

```json
{ "markdown": "# Olá", "template": "modern" }
```

---

## Build e produção

```bash
npm run build
```

Compila os pacotes `packages/*` necessários, o **frontend** e o **worker**.

Servir só o Next em produção:

```bash
npm run start --workspace=@marktype/web
```

Garante Supabase (e bucket `pdfs`) e variáveis no ambiente de deploy.

### Vercel (Auth.js)

Em **Project → Settings → Environment Variables** (Production):

| Variável | Notas |
|----------|--------|
| `AUTH_SECRET` | `openssl rand -base64 32` — **não** é o Client Secret do GitHub. |
| `AUTH_URL` | URL pública do deploy, ex.: `https://mark-type.vercel.app` (sem path). |
| `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET` | OAuth App no GitHub. |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Login por e-mail e cliente Supabase. |
| `SUPABASE_SERVICE_ROLE_KEY` | Servidor (PDF / Storage / operações privilegiadas). |

**Callback URL** no GitHub OAuth App:

`https://SEU_DOMINIO/api/auth/callback/github`

Depois de alterar variáveis, faz **Redeploy**. Teste rápido: `https://SEU_DOMINIO/api/auth/session` deve responder JSON (200).

---

## Schema da base (resumo)

Tabela `public.documents`: `id`, `created_at`, `updated_at`, `title`, `markdown`, `template` (um dos cinco ids), `pdf_url`, `user_id` (nullable, referência a `auth.users`).

---

## Contribuir

Issues e pull requests são bem-vindos. Mantém o estilo existente e atualiza este README se mudares fluxos de configuração ou contratos de API.

1. Fork → branch (`feat/...`) → commits claros → PR.

---

## Licença

**MIT** — vê o ficheiro `LICENSE` no repositório.

© MarkType Contributors
