# Studio AI — Arquitetura & Plano de Desenvolvimento

## O que e

Um chat de edicao de conteudo com IA embutido em cada site, acessivel em `site.com/studio`. O cliente conversa em linguagem natural para editar textos, imagens, contatos e qualquer dado do site. Toda alteracao passa por um fluxo de preview antes de ir para producao. O studio e projetado para ser facilmente embutido em qualquer projeto que siga a arquitetura content-driven (separacao clara entre codigo e conteudo).

---

## Stack

| Camada    | Tecnologia                                                               |
| --------- | ------------------------------------------------------------------------ |
| Frontend  | Next.js 16 (App Router) + React 19 + TypeScript 5.9 + Tailwind CSS v4    |
| IA        | Claude (Anthropic API) com tool use via `@anthropic-ai/sdk`              |
| Git       | GitHub REST API (fine-grained PAT) — ler, escrever, branches, PRs, merge |
| Deploy    | Vercel — preview automatico em PRs, producao em merge na `main`          |
| Auth      | JWT via `jose` (Edge-compatible) — username + senha em `.env.local`      |
| Validacao | Zod schemas espelhando as interfaces TypeScript dos componentes          |

**Dependencias novas a instalar:**

```bash
npm install @anthropic-ai/sdk jose zod
```

- `@anthropic-ai/sdk` — Client Anthropic com streaming e tool use
- `jose` — JWT Edge-compatible (sem dependencias nativas, funciona em Vercel Serverless/Edge)
- `zod` — Validacao de schemas em runtime (env vars + conteudo)

---

## Variaveis de ambiente

```env
# GitHub API
GITHUB_TOKEN=ghp_...              # Fine-grained PAT (permissions: Contents R/W, Pull Requests R/W, Deployments R, Metadata R)
GITHUB_OWNER=username
GITHUB_REPO=repo-name
GITHUB_DEFAULT_BRANCH=main

# Anthropic API
ANTHROPIC_API_KEY=sk-ant-...

# Auth
STUDIO_USERS=client@email.com:client,team@company.com:team   # usuario:role separados por virgula
STUDIO_PASSWORD=secure-password
AUTH_SECRET=random-32-char-string   # para assinar JWTs

# Vercel (opcional — para construir preview URL previsivel)
VERCEL_PROJECT_NAME=an-idea
```

**Validacao lazy:** `env.ts` usa Zod mas nao valida no import (quebraria o build no CI). Valida na primeira chamada em runtime e cacheia o resultado.

---

## Conceitos centrais

### Arquitetura content-driven

O site separa codigo (componentes) de conteudo (dados). Todo texto, imagem, contato e informacao visivel vem de arquivos JSON/MDX em `content/`. Componentes recebem dados via props e nunca tem texto hardcoded. As interfaces TypeScript dos componentes (com JSDoc) sao a fonte de verdade da estrutura de dados.

### Sessao de edicao

Uma "sessao" agrupa todas as alteracoes de uma conversa. O fluxo:

1. Cliente pede a primeira alteracao via chat
2. IA le o conteudo atual, propoe a mudanca com diff antes/depois
3. Cliente confirma → IA cria branch `studio/edit-{YYYY-MM-DD}-{slug}` + commit + abre PR para `main`
4. Vercel gera preview deployment do PR automaticamente
5. Cliente pede mais alteracoes → novos commits na mesma branch, preview atualiza
6. Cliente aprova → PR e mergeado (squash) → Vercel faz deploy de producao
7. Cliente descarta → PR e fechado + branch deletada → nada muda em producao

**Importante:** A branch e PR sao criados preguicosamente — apenas quando o agente faz o primeiro `write_content_file`. Conversas exploratórias (perguntas, leituras) nao criam branches.

### Perfis de acesso

**Cliente:** edita conteudo existente (textos, imagens, contatos, itens de listas, ordem de secoes, SEO, navegacao). Nao pode criar paginas, adicionar tipos de secao, ou alterar design/codigo.

---

## Estrutura de arquivos

```
src/
  app/
    (site)/                           # Route group — site publico com Header/Footer
      layout.tsx                      # Layout com Header + Footer (movido do root)
      page.tsx                        # Home (movido do root)
      [slug]/page.tsx                 # Paginas dinamicas (movido)
      error.tsx
      not-found.tsx

    (studio)/                         # Route group — studio SEM Header/Footer
      studio/
        layout.tsx                    # Studio layout (auth guard server-side, StudioProvider)
        page.tsx                      # Pagina principal do studio (chat + session panel)
        login/
          page.tsx                    # Pagina de login

    api/studio/
      auth/
        route.ts                     # POST login → JWT cookie
        me/route.ts                  # GET usuario atual (valida cookie)
        logout/route.ts              # POST logout (limpa cookie)
      sessions/
        route.ts                     # GET listar sessoes | POST criar sessao
        [sessionId]/
          route.ts                   # GET detalhes | DELETE descartar
          chat/route.ts              # POST mensagem → SSE stream
          approve/route.ts           # POST mergear PR
          history/route.ts           # GET historico de conversa

    layout.tsx                        # Root layout (html, body, fonts, globals.css APENAS)
    globals.css
    theme.generated.css
    favicon.ico

  middleware.ts                       # Auth: protege /studio (exceto /studio/login)

  components/
    studio/
      layout/
        StudioShell.tsx               # Layout responsivo (split desktop, tabs tablet, full mobile)
        StudioHeader.tsx              # Header minimo: brand + status + logout
        StatusPill.tsx                # Status flutuante mobile

      chat/
        ChatPanel.tsx                 # Container do chat (lista + input)
        MessageList.tsx               # Lista de mensagens com auto-scroll
        ChatMessage.tsx               # Bolha de mensagem (user/assistant/system)
        DiffPreview.tsx               # Visualizacao antes/depois de mudancas
        ActionButtons.tsx             # Botoes inline (aprovar/editar mais/descartar)
        PreviewCard.tsx               # Card com link do preview
        ChatInput.tsx                 # Input de texto + botao enviar
        StreamingIndicator.tsx        # Animacao de "digitando"

      session/
        SessionPanel.tsx              # Painel direito: status + preview iframe
        SessionStatus.tsx             # Badge de status (idle/editing/pending)
        SessionActions.tsx            # Botoes aprovar + descartar
        ChangeHistory.tsx             # Lista de mudancas na sessao
        PreviewFrame.tsx              # Wrapper do iframe de preview

      auth/
        LoginForm.tsx                 # Formulario username + senha

      ui/
        ConfirmDialog.tsx             # Modal de confirmacao (aprovar/descartar)

  hooks/studio/
    useChat.ts                        # Estado de mensagens + streaming
    useSession.ts                     # Estado da sessao
    useAuth.ts                        # Token + info do usuario
    useAutoScroll.ts                  # Auto-scroll na lista de mensagens
    useStreamingResponse.ts           # Leitor de SSE/ReadableStream

  lib/studio/
    env.ts                            # Validacao lazy de env vars com Zod
    auth.ts                           # Helpers JWT (sign/verify) com jose
    agent.ts                          # Loop do agente IA (tool use cycle)
    prompt.ts                         # Montagem do system prompt
    tools.ts                          # Definicoes de tools + dispatch de execucao
    types.ts                          # Interfaces TypeScript do studio
    constants.ts                      # Todas as strings de UI do studio
    api.ts                            # Helpers client-side para fetch API
    content-provider.ts               # Interface + factory (GitHub vs filesystem)
    github-content-provider.ts        # Implementacao com GitHub API
    filesystem-content-provider.ts    # Implementacao com filesystem local
    github.ts                         # Client REST do GitHub (fetch puro, sem Octokit)
    session-store.ts                  # Store de sessoes em memoria
    schemas/
      index.ts                        # Registry de schemas + validateContentFile()
      site-config.schema.ts
      navigation.schema.ts
      page-data.schema.ts
      media-manifest.schema.ts
      sections/
        hero.schema.ts
        features.schema.ts
        cta.schema.ts
        stats.schema.ts
        page-header.schema.ts
        portfolio-preview.schema.ts
        testimonials.schema.ts
        team.schema.ts
        timeline.schema.ts
        philosophy.schema.ts
        services-list.schema.ts
        process-steps.schema.ts
        portfolio-gallery.schema.ts
        contact-section.schema.ts
        project-detail.schema.ts
```

---

## Autenticacao

### Fluxo

1. **Login:** `POST /api/studio/auth` com `{ username, password }`
2. **Validacao:** Username existe em `STUDIO_USERS` e senha bate com `STUDIO_PASSWORD`
3. **JWT:** Assinado com `jose` (HMAC-SHA256) usando `AUTH_SECRET`. Payload: `{ sub: username, role: "client" | "team", iat, exp }`. Expira em 24h.
4. **Cookie:** `studio-token`, httpOnly, secure (so em producao), sameSite: lax
5. **Protecao:** `src/proxy.ts` (usar proxy no lugar do middleware - Next.js) intercepta `/studio` (exceto `/studio/login` e `/api/studio/auth`). Sem cookie valido → redirect para `/studio/login`.
6. **Logout:** `POST /api/studio/auth/logout` limpa o cookie.

### Helper de auth

`src/lib/studio/auth.ts` exporta `verifyAuth(request)` que:

1. Le o cookie `studio-token`
2. Verifica a assinatura JWT com `AUTH_SECRET`
3. Retorna `{ sub, role }` ou lanca erro

Cada rota protegida chama isso no topo. E uma funcao, nao middleware global, para manter o controle simples.

---

## Content Provider — Dualidade dev/producao

### O problema

Na Vercel, o filesystem e read-only. Toda leitura e escrita de conteudo deve passar pela GitHub API. Em desenvolvimento local, queremos feedback instantaneo via filesystem.

### Interface

```ts
interface ContentProvider {
  readFile(path: string): Promise<string>;
  writeFile(
    path: string,
    content: string,
    commitMessage: string,
    branch: string,
  ): Promise<{ sha: string }>;
  listFiles(directory: string): Promise<string[]>;
  readTextFile(path: string): Promise<string>; // Para arquivos fora de content/ (ai/*.md)
}
```

### Implementacoes

**`GitHubContentProvider`** — Producao (Vercel). Todas as operacoes via GitHub REST API.

**`FilesystemContentProvider`** — Desenvolvimento local. Leitura/escrita direta no filesystem. Operacoes de branch/PR nao sao executadas; escritas vao direto para o diretorio de trabalho. O "preview URL" e `http://localhost:3000`.

**Selecao:**

```ts
export function getContentProvider(): ContentProvider {
  if (process.env.NODE_ENV === "development" && !process.env.FORCE_GITHUB_API) {
    return new FilesystemContentProvider();
  }
  return new GitHubContentProvider();
}
```

Setar `FORCE_GITHUB_API=true` em dev permite testar o fluxo completo localmente.

---

## GitHub API Client

`src/lib/studio/github.ts` — Usa `fetch` puro (sem Octokit, para manter dependencias minimas).

### Operacoes

| Operacao          | Endpoint GitHub                                          |
| ----------------- | -------------------------------------------------------- |
| Ler arquivo       | `GET /repos/{owner}/{repo}/contents/{path}?ref={branch}` |
| Criar/atualizar   | `PUT /repos/{owner}/{repo}/contents/{path}`              |
| Obter ref         | `GET /repos/{owner}/{repo}/git/ref/heads/{branch}`       |
| Criar branch      | `POST /repos/{owner}/{repo}/git/refs`                    |
| Deletar branch    | `DELETE /repos/{owner}/{repo}/git/refs/heads/{branch}`   |
| Criar PR          | `POST /repos/{owner}/{repo}/pulls`                       |
| Mergear PR        | `PUT /repos/{owner}/{repo}/pulls/{number}/merge`         |
| Fechar PR         | `PATCH /repos/{owner}/{repo}/pulls/{number}`             |
| Listar PRs        | `GET /repos/{owner}/{repo}/pulls?state=open&head=...`    |
| Deployments       | `GET /repos/{owner}/{repo}/deployments?ref={branch}`     |
| Status deployment | `GET /repos/{owner}/{repo}/deployments/{id}/statuses`    |

### Commits multi-arquivo

Para editar multiplos arquivos num unico commit, usar a Git Trees API:

1. `GET /git/ref/heads/{branch}` → SHA do ultimo commit
2. `GET /git/commits/{sha}` → SHA da tree
3. `POST /git/trees` (base_tree + novos blobs) → nova tree SHA
4. `POST /git/commits` (parents: [latest], tree: newTree) → novo commit SHA
5. `PATCH /git/refs/heads/{branch}` → apontar para o novo commit

### Preview URL da Vercel

Apos commit, a Vercel cria um deployment automaticamente para a branch do PR. Para obter a URL:

1. Poll `GET /repos/{owner}/{repo}/deployments?ref={branch}&per_page=1`
2. Quando existir, obter statuses: `GET /repos/{owner}/{repo}/deployments/{id}/statuses`
3. Procurar `state: "success"` e extrair `environment_url`

**URL previsivel:** `https://{VERCEL_PROJECT_NAME}-git-{branch-name}-{vercel-team}.vercel.app` — pode ser retornada imediatamente antes da confirmacao de deploy.

---

## Gerenciamento de sessoes

### Modelo de dados

```ts
interface StudioSession {
  id: string; // UUID
  userId: string; // Do JWT sub
  role: "client" | "team";
  status: "active" | "previewing" | "approved" | "discarded";
  branch: string | null; // null ate o primeiro write
  prNumber: number | null;
  prUrl: string | null;
  previewUrl: string | null;
  createdAt: string; // ISO 8601
  updatedAt: string;
  title: string; // Auto-gerado a partir da primeira edicao
  changedFiles: string[]; // Caminhos de conteudo modificados
  commitCount: number;
  conversationHistory: Message[]; // Array de mensagens Anthropic completo
}
```

### Naming de branches

`studio/edit-{YYYY-MM-DD}-{short-slug}` onde `short-slug` e derivado do titulo da sessao (max 30 chars, kebab-case). Exemplo: `studio/edit-2026-04-07-hero-headline`.

Se o nome ja existir, adiciona sufixo aleatorio de 4 caracteres: `studio/edit-2026-04-07-hero-headline-a3f2`.

### Ciclo de vida

```
[nova] ──(usuario inicia chat)──> [active]
                                      │
                             (agente faz primeiro write)
                                      │
                              [active + branch criada + PR aberto]
                                      │
                        ┌─────────────┼─────────────┐
                        │             │              │
                  (mais edicoes)  (clica em       (clica em
                        │         Aprovar)        Descartar)
                        │             │              │
                        └──> [active] │              │
                                      v              v
                                [approved]     [discarded]
                              (PR mergeado)   (PR fechado +
                                              branch deletada)
```

### Persistencia

**Primaria: `Map<string, StudioSession>` em memoria.** Sessoes de studio sao curtas (minutos a horas). Funcoes serverless da Vercel compartilham memoria durante o tempo de vida da instancia.

**Recuperacao: Metadata no body do PR.** Quando uma sessao cria um PR, o body inclui um bloco machine-readable:

```markdown
## Edicoes de Conteudo

Mudancas feitas via Studio AI:

- Atualizado titulo hero da home
- Adicionado novo depoimento

---

<!-- studio-meta
{"sessionId":"abc-123","userId":"client@email.com","createdAt":"2026-04-07T14:30:00Z"}
-->
```

Quando o usuario retorna e o estado em memoria se perdeu:

1. Listar PRs abertos com prefixo `studio/edit-*` para este usuario
2. Extrair `studio-meta` do body do PR
3. Reconstruir objeto de sessao a partir do PR e estado da branch
4. Historico de conversa NAO e recuperado — a sessao retoma com conversa fresca, mas o agente pode ler os arquivos modificados para contexto

---

## Agente IA

### System prompt

Montado dinamicamente em `src/lib/studio/prompt.ts`. Composto de secoes estaticas (cacheadas) e dinamicas (por sessao):

```ts
async function buildSystemPrompt(session: StudioSession): Promise<string> {
  const [conventions, editingGuide, contentFileList, typeDefinitions] =
    await Promise.all([
      contentProvider.readTextFile("ai/CONVENTIONS.md"),
      contentProvider.readTextFile("ai/EDITING_GUIDE.md"),
      contentProvider.listContentFiles(),
      loadTypeDefinitions(),
    ]);

  return [
    ROLE_SECTION, // "Voce e um assistente de edicao de conteudo..."
    PERMISSIONS_SECTION(session.role), // Baseado no perfil (client vs team)
    `## Estrutura do Site\n${conventions}`,
    `## Regras de Edicao\n${editingGuide}`,
    `## Arquivos Disponiveis\n${formatFileList(contentFileList)}`,
    `## Definicoes de Tipos\n${typeDefinitions}`,
    SESSION_SECTION(session), // Branch, PR URL, status atual
    WORKFLOW_SECTION, // "Sempre ler antes de editar, mostrar diff, esperar confirmacao"
    TONE_SECTION, // "Direto, amigavel, sem jargao tecnico"
  ].join("\n\n---\n\n");
}
```

**Secoes chave:**

- **ROLE_SECTION:** Estabelece o agente como editor amigavel. Fala em portugues. Nunca inventa conteudo, sempre confirma antes de aplicar.
- **PERMISSIONS_SECTION:** Para role `"client"`, lista exatamente o que pode e nao pode mudar (espelha EDITING_GUIDE.md).
- **CONVENTIONS + EDITING_GUIDE:** Injetados verbatim dos arquivos `ai/`. Lidos via content provider e cacheados em `Map<string, { content: string; fetchedAt: number }>` com TTL de 5 minutos.
- **TYPE_DEFINITIONS:** Conteudo completo de `src/types/content.ts` + interfaces extraidas de `src/components/sections/*.tsx` (apenas a parte da interface, nao o JSX). O agente precisa saber constraints dos campos (max chars, union types, required vs optional).
- **SESSION_SECTION:** Nome da branch, URL do PR, lista de arquivos ja modificados, contagem de commits.
- **WORKFLOW_SECTION:** Instrucoes de fluxo — ler → propor → mostrar diff → esperar confirmacao → aplicar → compartilhar preview.
- **TONE_SECTION:** Tom direto, amigavel, sem jargao tecnico. Portugues brasileiro.

### Tools do agente

O agente tem acesso a 7 tools:

#### 1. `read_content_file`

Le um arquivo de conteudo para ver valores atuais antes de propor mudancas.

```ts
{
  name: "read_content_file",
  description: "Read a content file from the site. Returns the full JSON content. Use this before proposing any edit. Paths are relative to content/.",
  input_schema: {
    type: "object",
    properties: {
      path: { type: "string", description: "Ex: 'pages/home.data.json', 'site.config.json'" }
    },
    required: ["path"]
  }
}
```

#### 2. `write_content_file`

Escreve conteudo atualizado. Cria commit na branch da sessao. So usar apos confirmacao do usuario.

```ts
{
  name: "write_content_file",
  description: "Write updated content to a file. Creates a commit on the session branch. Only use AFTER the user confirms.",
  input_schema: {
    type: "object",
    properties: {
      path: { type: "string", description: "Ex: 'pages/home.data.json'" },
      content: { type: "string", description: "Complete updated file content as JSON string." },
      commit_message: { type: "string", description: "Short commit message. Ex: 'Update hero headline'" }
    },
    required: ["path", "content", "commit_message"]
  }
}
```

**Implementacao:**

1. Parse JSON para validar sintaxe
2. Validar contra schema Zod do tipo de arquivo
3. Se validacao falhar, retornar erros para o agente se auto-corrigir
4. Se for o primeiro write da sessao, criar branch e PR primeiro
5. Commit via GitHub API (ou filesystem em dev)
6. Retornar `{ success: true, commitSha, previewUrl }`

#### 3. `list_content_files`

Lista todos os arquivos em `content/` com data de modificacao.

```ts
{
  name: "list_content_files",
  description: "List all files in the content/ directory.",
  input_schema: { type: "object", properties: {}, required: [] }
}
```

#### 4. `read_type_definition`

Le a interface TypeScript de um componente de secao para entender constraints dos campos.

```ts
{
  name: "read_type_definition",
  description: "Read the TypeScript interface for a section component. Returns the interface with JSDoc constraints.",
  input_schema: {
    type: "object",
    properties: {
      section_type: { type: "string", description: "Ex: 'hero', 'stats', 'site-config', 'navigation'" }
    },
    required: ["section_type"]
  }
}
```

#### 5. `search_content`

Busca texto em todos os arquivos de conteudo. Util quando o usuario referencia um texto sem dizer qual arquivo.

```ts
{
  name: "search_content",
  description: "Search for text across all content files. Returns file paths and matching context.",
  input_schema: {
    type: "object",
    properties: {
      query: { type: "string", description: "Text to search for (case-insensitive)." }
    },
    required: ["query"]
  }
}
```

#### 6. `validate_content`

Valida JSON contra o schema sem escrever. Dry-run antes de apresentar o diff ao usuario.

```ts
{
  name: "validate_content",
  description: "Validate JSON content against schema without writing. Returns validation errors or confirms valid.",
  input_schema: {
    type: "object",
    properties: {
      path: { type: "string" },
      content: { type: "string" }
    },
    required: ["path", "content"]
  }
}
```

#### 7. `get_session_status`

Checa o estado atual da sessao — branch, PR, preview URL, lista de mudancas.

```ts
{
  name: "get_session_status",
  description: "Get current session status: branch, PR URL, preview URL, list of commits/changes.",
  input_schema: { type: "object", properties: {}, required: [] }
}
```

### Fluxo tipico de uma edicao

```
Usuario: "Mude o titulo do hero para 'Espacos que inspiram'"

Agente (pensa): Preciso ler o conteudo atual primeiro.
Agente → tool: read_content_file({ path: "pages/home.data.json" })
Agente ← resultado: JSON completo da home

Agente → tool: read_type_definition({ section_type: "hero" })
Agente ← resultado: HeroProps com JSDoc "Recommended max 80 characters"

Agente responde:
  "Encontrei o titulo atual do hero. Aqui esta a mudanca proposta:
   **Antes:** We design spaces that tell your story
   **Depois:** Espacos que inspiram
   O novo titulo tem 22 caracteres (dentro do maximo recomendado de 80).
   Posso aplicar?"

Usuario: "Sim"

Agente → tool: write_content_file({
  path: "pages/home.data.json",
  content: "...",
  commit_message: "Update hero headline on home page"
})
Agente ← resultado: { success: true, commitSha: "abc123", previewUrl: "https://..." }

Agente responde:
  "Pronto! O titulo foi atualizado. Voce pode ver o preview aqui: [link].
   Quer fazer mais alguma mudanca?"
```

### Loop do agente

```ts
// src/lib/studio/agent.ts
async function* runAgent(
  messages: Message[],
  session: StudioSession,
  tools: ToolDefinition[],
): AsyncGenerator<StreamEvent> {
  const systemPrompt = await buildSystemPrompt(session);
  let continueLoop = true;

  while (continueLoop) {
    const stream = await anthropic.messages.stream({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: systemPrompt,
      messages,
      tools,
    });

    // Stream text deltas para o frontend
    for await (const event of stream) {
      if (
        event.type === "content_block_delta" &&
        event.delta.type === "text_delta"
      ) {
        yield { type: "text_delta", text: event.delta.text };
      }
    }

    const finalMessage = await stream.finalMessage();
    messages.push({ role: "assistant", content: finalMessage.content });

    if (finalMessage.stop_reason === "tool_use") {
      // Executar tools e continuar o loop
      const toolResults = await executeTools(finalMessage.content, session);
      messages.push({ role: "user", content: toolResults });
      continueLoop = true;
    } else {
      continueLoop = false;
    }
  }

  yield { type: "done" };
}
```

---

## Validacao de conteudo

### Abordagem: Zod schemas espelhando as interfaces TypeScript

As interfaces TypeScript com JSDoc sao a fonte de verdade. Os schemas Zod sao escritos manualmente para espelhar essas interfaces, incluindo constraints dos JSDoc como refinements:

```ts
// src/lib/studio/schemas/sections/hero.schema.ts
import { z } from "zod";

export const heroSchema = z.object({
  headline: z.string().min(1).max(80),
  subheadline: z.string().max(200).optional(),
  cta: z.object({
    label: z.string().min(1).max(30),
    href: z.string().min(1),
    style: z.enum(["primary", "secondary", "whatsapp", "outline"]).optional(),
  }),
  secondaryCta: z
    .object({
      label: z.string().min(1),
      href: z.string().min(1),
    })
    .optional(),
  image: z.object({
    src: z.string().min(1),
    alt: z.string().min(1),
  }),
});
```

### Schema lookup

```ts
// src/lib/studio/schemas/index.ts
export function validateContentFile(
  path: string,
  content: unknown,
): { valid: true } | { valid: false; errors: string[] } {
  if (path === "site.config.json")
    return validateWith(siteConfigSchema, content);
  if (path === "navigation.json")
    return validateWith(navigationSchema, content);
  if (path === "media/manifest.json")
    return validateWith(mediaManifestSchema, content);
  if (path.startsWith("pages/") && path.endsWith(".data.json")) {
    // Valida o envelope PageData + cada secao contra seu schema
    return validatePageData(content);
  }
  return { valid: false, errors: [`Unknown file type: ${path}`] };
}
```

A validacao de PageData itera sobre cada secao e valida `section.data` contra o schema correspondente ao `section.type` usando um registry de schemas analogo ao `SECTION_REGISTRY`.

### Quando a validacao roda

- **Em `write_content_file`:** Antes de commitar. Se falhar, erros retornam para o agente se auto-corrigir (o usuario nao ve).
- **Em `validate_content`:** Dry-run explicito antes de apresentar diff.
- **Severity:** Constraints "recomendados" (max chars) geram warnings. Erros estruturais (campo obrigatorio ausente, tipo errado) bloqueiam o write.

---

## API Routes

### Streaming de chat: `POST /api/studio/sessions/[sessionId]/chat`

**Request body:** `{ message: string }`

**Response:** Server-Sent Events (SSE) via Web Streams API (`ReadableStream`):

```
event: text_delta
data: {"text": "Vou atualizar o titulo do hero..."}

event: tool_use
data: {"tool": "read_content_file", "input": {"path": "pages/home.data.json"}}

event: tool_result
data: {"tool": "read_content_file", "result": {"content": "..."}}

event: diff_preview
data: {"file": "pages/home.data.json", "before": "...", "after": "...", "summary": "Changed hero headline"}

event: changes_applied
data: {"commitSha": "abc123", "files": ["pages/home.data.json"], "previewUrl": "https://...vercel.app"}

event: done
data: {}

event: error
data: {"message": "..."}
```

O route handler:

1. Verifica auth
2. Carrega a sessao do session store
3. Adiciona mensagem do usuario ao historico
4. Chama o agente com historico completo
5. Streama a resposta incluindo loops de tool use
6. Persiste historico atualizado apos conclusao

---

## Design do frontend

### Layout responsivo

| Breakpoint      | Layout                                | Preview                        | Status            |
| --------------- | ------------------------------------- | ------------------------------ | ----------------- |
| >= 1024px (lg)  | Split: chat 60% / session+preview 40% | iframe embutido no painel dir. | No painel direito |
| 768-1023px (md) | Tabs: "Chat" e "Preview"              | iframe na tab Preview          | Banner no topo    |
| < 768px         | Chat full-width                       | Botao "abrir em nova aba"      | Pill flutuante    |

### Pagina de login

- Viewport inteiro centralizado, background `bg-muted`
- Card `bg-background shadow-lg max-w-md p-8`
- Nome da marca em `font-heading text-secondary text-2xl`
- Linha dourada decorativa `bg-secondary h-px w-12 mb-8`
- Inputs estilizados como os do ContactSection: `border border-foreground/10 focus:border-secondary`
- Botao submit usa `Button` existente com `style="primary"`
- Erro em `text-red-600 text-sm`

### Chat UI

- **Mensagens do usuario:** Alinhadas a direita, `bg-primary text-primary-foreground`
- **Mensagens do AI:** Alinhadas a esquerda, `bg-muted`
- **Mensagens de sistema:** Centralizadas, menores, `text-muted-foreground`
- **DiffPreview:** Card com antes (fundo vermelho sutil) e depois (fundo verde sutil)
- **Input:** `<textarea>` auto-grow (ate ~4 linhas), Enter envia, Shift+Enter nova linha, botao enviar cor dourada
- **Streaming:** Dots animados enquanto AI gera resposta

### State management

Sem biblioteca externa. React 19 built-in (`useState`, `useReducer`, `useContext`):

- **`StudioProvider`** em `(studio)/studio/layout.tsx` — compoe `useAuth`, `useChat`, `useSession`
- **`useChat`** — `useReducer` com actions: `ADD_USER_MESSAGE`, `START_STREAMING`, `APPEND_STREAM_CHUNK`, `COMPLETE_STREAM`
- **`useStreamingResponse`** — `response.body.getReader()` + `TextDecoder` para ler stream
- **`useSession`** — `useState` atualizado a partir de respostas da API
- **`useAutoScroll`** — Scroll automatico, respeita posicao do usuario (se scrollou para cima, nao forca scroll)

### Strings — zero hardcoded

`src/lib/studio/constants.ts` contem TODAS as strings de UI do studio (titulos, placeholders, botoes, mensagens de erro, confirmacoes). Segue o padrao do projeto de zero texto hardcoded em componentes.

---

## Route groups — Refatoracao necessaria

O `layout.tsx` atual renderiza Header + Footer ao redor de `{children}`. O studio nao deve herdar esses componentes. A solucao e usar Route Groups do Next.js:

**Antes:**

```
src/app/
  layout.tsx          ← tem Header + Footer
  page.tsx
  [slug]/page.tsx
```

**Depois:**

```
src/app/
  layout.tsx          ← APENAS html, body, fonts, globals.css
  (site)/
    layout.tsx        ← Header + Footer (codigo movido do root)
    page.tsx
    [slug]/page.tsx
    error.tsx
    not-found.tsx
  (studio)/
    studio/
      layout.tsx      ← Studio shell (sem Header/Footer)
      page.tsx
      login/page.tsx
```

O root `layout.tsx` mantem apenas:

- `<html>` com fonts e lang
- `<body>` com classes base
- Skip-to-content link
- `{children}`

O `(site)/layout.tsx` herda e adiciona Header + Footer. O `(studio)/studio/layout.tsx` herda e adiciona o studio shell.

---

## CI/CD

- **GitHub Actions:** CI roda type check + lint + build em push em `main` e em PRs
- **Vercel:** Preview automatico em PRs, deploy producao em push na `main` ou merge de PR
- **Branch protection:** CI precisa passar antes do merge (configurar no GitHub)
- **Auto-delete branches:** Habilitado no GitHub — limpa branches apos merge/close do PR
- **Env vars no CI:** Secrets vao nos GitHub Secrets, variaveis publicas em GitHub Variables. Build usa placeholders para vars que so sao necessarias em runtime

---

## Edge cases e tratamento de erros

### Race conditions em chat

Se duas abas enviam mensagens simultaneamente para a mesma sessao, o tool-use loop pode criar commits conflitantes. **Mitigacao:** Cada sessao tem um `lock: Promise<void>`. O route handler de chat aguarda o lock antes de iniciar.

### Rate limits do GitHub

Fine-grained PATs tem 5.000 req/hora. Uma sessao tipica usa ~10-20 chamadas por interacao. **Mitigacao:** Retry com backoff exponencial para respostas 403/429.

### SHA de arquivo stale

`PUT /contents/` exige a SHA atual do arquivo. Se dois commits acontecem rapido, a SHA pode estar stale. **Mitigacao:** Em 409 Conflict, refetch o arquivo e retry uma vez. O caminho de multi-file commit via Git Trees evita esse problema.

### Crescimento do historico de conversa

Conversas longas podem exceder o context window do Claude. **Mitigacao:** Rastrear contagem de tokens. Quando exceder 80% do limite, sumarizar mensagens antigas em um bloco condensado.

### Atraso no deploy da Vercel

Apos commit, o preview pode levar 30-60s. O agente informa: "Apliquei a mudanca. O preview esta sendo gerado e estara pronto em cerca de um minuto em [URL previsivel]". A tool `get_session_status` pode ser chamada depois para confirmar.

### Colisao de nomes de branch

Se ja existir uma branch com o mesmo nome, adiciona sufixo aleatorio de 4 caracteres.

### Recuperacao de sessao com conflitos

Se a branch `main` avancou desde a criacao da branch de edicao, o PR pode ter conflitos. Como as edicoes sao JSON isoladas, conflitos sao raros. Se o merge falhar, retorna erro sugerindo descartar e reaplicar as mudancas.

---

## Documentacao no projeto

| Arquivo               | Proposito                                                          | Lido por                                 |
| --------------------- | ------------------------------------------------------------------ | ---------------------------------------- |
| `CLAUDE.md`           | Instrucoes gerais do projeto + secao sobre o studio                | Claude Code (desenvolvimento)            |
| `ai/CONVENTIONS.md`   | Estrutura de conteudo do site (tipos de secao, arquivos, relacoes) | Agente do studio (runtime) + Claude Code |
| `ai/EDITING_GUIDE.md` | Regras de edicao (o que pode/nao pode, procedimentos, exemplos)    | Agente do studio (runtime) + Claude Code |
| `studio.md`           | Arquitetura completa do studio (este documento)                    | Claude Code (desenvolvimento)            |

---

## Plano de desenvolvimento — Fases

### Fase 1: Fundacao (rotas + auth + env)

1. Instalar dependencias: `@anthropic-ai/sdk`, `jose`, `zod`
2. Refatorar route groups: mover site para `(site)/`, criar `(studio)/`
3. Criar `src/lib/studio/env.ts` — validacao lazy de env vars
4. Criar `src/lib/studio/auth.ts` — helpers JWT (sign/verify)
5. Criar `src/middleware.ts` — protecao de rotas `/studio`
6. Criar API routes de auth: `POST /api/studio/auth`, `GET .../me`, `POST .../logout`
7. Criar `src/lib/studio/constants.ts` e `src/lib/studio/types.ts`
8. Criar componente `LoginForm` e pagina `/studio/login`
9. **Validacao:** Login funciona, cookie e setado, rotas protegidas redirecionam

### Fase 2: Content Provider + GitHub

1. Criar `src/lib/studio/github.ts` — client REST do GitHub
2. Criar `src/lib/studio/github-content-provider.ts`
3. Criar `src/lib/studio/filesystem-content-provider.ts`
4. Criar `src/lib/studio/content-provider.ts` — interface + factory
5. **Validacao:** Consegue ler/escrever arquivos via ambas implementacoes

### Fase 3: Schemas Zod

1. Criar schemas para todos os 15 tipos de secao em `schemas/sections/`
2. Criar schemas para `site-config`, `navigation`, `page-data`, `media-manifest`
3. Criar `schemas/index.ts` com `validateContentFile()` e registry
4. **Validacao:** Todos os arquivos JSON existentes passam na validacao

### Fase 4: Session Management

1. Criar `src/lib/studio/session-store.ts`
2. Criar API routes de sessao: `GET/POST /sessions`, `GET/DELETE /sessions/[id]`, `POST .../approve`
3. Implementar criacao lazy de branch/PR no primeiro write
4. Implementar recuperacao de sessao via PR metadata
5. **Validacao:** CRUD de sessoes funciona, branches e PRs sao criados/mergeados/fechados

### Fase 5: Agente IA

1. Criar `src/lib/studio/prompt.ts` — montagem do system prompt
2. Criar `src/lib/studio/tools.ts` — definicoes + dispatch
3. Criar `src/lib/studio/agent.ts` — loop do agente com tool use
4. Criar `POST /api/studio/sessions/[sessionId]/chat` — SSE streaming
5. **Validacao:** Conversa completa funciona: ler → propor → confirmar → escrever → preview

### Fase 6: Frontend — Chat UI

1. Criar hooks: `useChat`, `useStreamingResponse`, `useAutoScroll`, `useSession`, `useAuth`
2. Criar `StudioProvider` context
3. Criar componentes de layout: `StudioShell`, `StudioHeader`
4. Criar componentes de chat: `ChatPanel`, `MessageList`, `ChatMessage`, `ChatInput`, `StreamingIndicator`
5. Criar `DiffPreview`, `ActionButtons`, `PreviewCard`
6. Wiring: `(studio)/studio/page.tsx`
7. **Validacao:** Chat funciona end-to-end com streaming

### Fase 7: Frontend — Session + Preview

1. Criar `SessionPanel`, `SessionStatus`, `SessionActions`, `ChangeHistory`
2. Criar `PreviewFrame` (iframe wrapper)
3. Criar `ConfirmDialog`
4. Criar `StatusPill` (mobile)
5. Implementar fluxo de aprovacao/descarte com confirmacao
6. **Validacao:** Fluxo completo: editar → preview → aprovar/descartar

### Fase 8: Polish + Testes

1. Responsividade: testar todos os breakpoints
2. Tratamento de erros: timeout, rede, API failures
3. Acessibilidade: teclado, screen readers, focus management
4. Performance: memoizacao, lazy loading
5. Rodar `web-design-guidelines` no UI do studio
6. Rodar `vercel-react-best-practices` nos componentes React
7. `npm run build` para confirmar build sem erros
8. Deploy de preview na Vercel para teste final
