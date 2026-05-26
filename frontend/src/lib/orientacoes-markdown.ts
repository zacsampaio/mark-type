/** Referência de sintaxe Markdown — aba Orientações */
export const ORIENTACOES_MARKDOWN = `# Como escrever em Markdown

Guia rápido de **sintaxe**. Escreva na aba *Colar Markdown* e veja o resultado à direita na pré-visualização.

## Títulos

Coloque \`#\` no **início da linha** (com espaço depois). Mais \`#\` = nível mais baixo na hierarquia.

\`\`\`
# Título principal
## Secção
### Subsecção
#### Detalhe do módulo
\`\`\`

## Negrito e itálico

\`\`\`
**negrito**
*itálico*
***negrito e itálico***
\`\`\`

Útil em manuais para nomes de botões e menus: clique em **Serviços** → **Projeção de Dívidas**.

## Listas

Com traço ou asterisco (uma linha em branco antes da lista ajuda):

\`\`\`
- Primeiro item
- Segundo item
  - Subitem (dois espaços antes do traço)
\`\`\`

Lista numerada:

\`\`\`
1. Abrir o sistema
2. Selecionar o módulo
3. Confirmar
\`\`\`

## Tabela

Use barras verticais \`|\`. A linha do meio só com hífens separa **cabeçalho** e **corpo**:

\`\`\`
| Seção              | Página |
|--------------------|--------|
| 1. Introdução      | 1      |
| 3.1.1 Projeção     | 2      |
\`\`\`

## Imagem

\`\`\`
![Descrição curta da figura](/docs/assets/nome-da-imagem.png)
\`\`\`

Na linha seguinte pode usar itálico para legenda: *Figura 1 — Menu Serviços.*

## Link

\`\`\`
[Texto visível](https://github.com/usuario/repositorio)
\`\`\`

## Linha separadora

Linha só com três hífenes (com linhas em branco antes e depois):

\`\`\`
---
\`\`\`

## Citação / nota

\`\`\`
> Atualização 14/05/2026 — Nome do autor
\`\`\`

## Código inline e bloco

Comando ou campo no meio do texto: use crase \`Protocolo\` ou \`PDF\`.

Bloco de várias linhas:

\`\`\`
npm run dev
\`\`\`

## Estrutura sugerida para manuais

Repita estes blocos em cada funcionalidade (texto normal, sem símbolos especiais no título da secção):

\`\`\`
#### 3.1.1 Nome do serviço

**Visão geral**
- Objetivo em tópicos.

**Execução**
Passos para abrir no menu.

**Informações de entrada**
Campos obrigatórios em lista ou tabela.

**Processo**
O que o sistema faz automaticamente.

**Validações**
Regras e mensagens de alerta.

**Controles**
O que aparece no painel de status.
\`\`\`

## Parágrafos

Separe parágrafos com **uma linha em branco**. Não use Tab no início da linha.

Evite começar um parágrafo com \`*\` ou \`**\` colado a palavras sem fechar — o negrito/itálico precisa de par fechado.
`;
