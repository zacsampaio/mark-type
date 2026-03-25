# DocCraft

**Gerador de documentação a partir de Markdown** — com pré-visualização em vários modelos visuais e exportação para **PDF** e **Microsoft Word (.docx)**.

Destinado a **equipas que documentam software** (READMEs, guias internos, notas geradas por IA): em vez de entregar só ficheiros `.md` brutos, podes gerar um documento com aparência consistente e partilhar PDF ou Word.

[Funcionalidades](#funcionalidades) · [Arquitetura](#arquitetura) · [Requisitos](#requisitos) · [Instalação](#instalação) · [Configuração](#configuração) · [Como usar](#como-usar) · [API HTTP](#api-http) · [Produção](#build-e-produção) · [Contribuir](#contribuir)

---

## Funcionalidades

| Área | Descrição |
|------|-----------|
| **Editor** | Colar Markdown ou importar o `README.md` de um repositório **público** no GitHub. |
| **Modelos** | Cinco estilos de documento: Profissional, Moderno, SaaS, Documento (simples / impressão), Compliance. O modelo escolhe-se na **coluna de pré-visualização**. |
| **Pré-visualização** | Renderização em tempo real alinhada ao modelo. |
| **Exportar PDF** | Serviço Node separado (worker): LaTeX se disponível, senão Puppeteer; a app Next faz upload para o Supabase Storage. |
| **Exportar Word** | Geração `.docx` na API Next (`html-to-docx`), com o mesmo HTML estilizado usado no fluxo de documento. |
| **Persistência (PDF)** | Após PDF com upload bem-sucedido, registo na tabela `documents` (Supabase). O Word, nesta versão, foca-se no ficheiro no bucket. |

---

## Arquitetura

Monorepo **npm workspaces**:

- **`frontend/`** — Next.js (App Router): interface, rotas `/api/*` (BFF).
- **`backend/worker/`** — Express: `POST /generate` devolve bytes de PDF.
- **`backend/supabase/migrations/`** — SQL para Postgres + notas de Storage.
- **`packages/`** — `markdown`, `templates`, `document-styles` (HTML/CSS partilhado entre PDF/Word).

Fluxo resumido: o browser fala só com o Next; o Next chama o worker para PDF e o Supabase para Storage/DB; o Word é gerido inteiramente no servidor Next.

---

## Requisitos

- **Node.js** 18+
- **npm** 9+ (suporte a `workspaces`)
- Conta gratuita em **[Supabase](https://supabase.com)** (Postgres + Storage)
- Opcional: **`pdflatex`** no PATH (melhor qualidade de PDF)
- Opcional: **Puppeteer** no worker (`npm install puppeteer --workspace=@doccraft/worker`) se não usares LaTeX
- Opcional: **token GitHub** (`GITHUB_TOKEN`) para reduzir rate limit na importação de READMEs

---

## Instalação

### 1. Obter o código

```bash
git clone https://github.com/SEU_USUARIO/doccraft.git
cd doccraft
```

Substitui `SEU_USUARIO/doccraft` pelo URL real do repositório público.

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
| `WORKER_URL` | URL do worker de PDF (local: `http://localhost:4000`) |
| `GITHUB_TOKEN` | Opcional — importação de README |

**Worker (PDF)**

```bash
cp backend/worker/.env.example backend/worker/.env
```

| Variável | Uso |
|----------|-----|
| `PORT` | Porta (predefinição `4000`) |
| `ENABLE_LATEX` | `false` para forçar fallback Puppeteer |

> As chaves do Supabase **não** vão para o worker.

---

## Configuração

### Supabase

1. Cria um projeto em [app.supabase.com](https://app.supabase.com).
2. **SQL Editor** — executa por ordem:
   - `backend/supabase/migrations/001_initial_schema.sql` — tabela `documents`, RLS de MVP.
   - Se já tinhas uma base criada só com os modelos antigos, executa também `002_template_values.sql`.
3. **Storage** — cria um bucket **público** com o nome exato **`pdfs`** (o código usa este id).
4. Se o upload falhar, configura políticas de `INSERT`/`SELECT` em `storage.objects` para o bucket `pdfs` (ver documentação Supabase).

### Arranque em desenvolvimento

Na raiz:

```bash
npm run dev
```

- App: **http://localhost:3000**
- Worker PDF: **http://localhost:4000**

Comandos úteis:

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Next + worker em paralelo |
| `npm run dev:web` | Só Next |
| `npm run dev:worker` | Só worker |

---

## Como usar

### Na interface web

1. Abre **http://localhost:3000**.
2. Escreve ou cola **Markdown** no painel esquerdo, ou usa **Importar do GitHub** com a URL de um repo público.
3. No painel direito, escolhe o **modelo** no menu *Modelo do documento*.
4. Usa **Exportar PDF** ou **Exportar Word** no cabeçalho; quando o upload funcionar, aparece link para descarregar.

Se o worker PDF estiver parado ou sem LaTeX/Puppeteer, a rota de PDF pode responder com **fallback** (HTML para imprimir ou PDF em base64 — vê mensagens na resposta JSON).

### Modelos disponíveis (ids usados na API)

| ID | Nome na UI |
|----|------------|
| `professional` | Profissional |
| `modern` | Moderno |
| `saas` | SaaS |
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

### `POST /api/generate-docx`

```json
{ "markdown": "# Olá", "template": "modern" }
```

Resposta de sucesso: `{ "url": "https://.../pdfs/docs/....docx" }`.

### Worker (direto, para testes)

```bash
curl -s http://localhost:4000/health
curl -X POST http://localhost:4000/generate \
  -H "Content-Type: application/json" \
  -d "{\"html\":\"<h1>Teste</h1>\",\"template\":\"modern\"}" \
  --output teste.pdf
```

---

## Build e produção

```bash
npm run build
```

Compila `packages/*` necessários, o **frontend** e o **worker**. Para servir o Next em produção:

```bash
npm run start --workspace=@doccraft/web
```

Para o worker:

```bash
npm run start --workspace=@doccraft/worker
```

Em produção define `WORKER_URL` para o URL público do worker. Garante que o Supabase e o bucket `pdfs` estão configurados no ambiente alvo.

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

© DocCraft Contributors
