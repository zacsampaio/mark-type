# Como escrever manuais no MarkType

Este guia explica como produzir documentação no estilo do **Manual Central de Serviços Imobiliário** (Word), mas em Markdown, limpa e exportável para PDF.

**Sintaxe Markdown** (`#`, tabelas, listas, etc.): use a aba **Orientações** na coluna Entrada da aplicação.

## Modelo recomendado

Na pré-visualização, escolha o modelo **Manual**:

- Texto preto sobre fundo branco.
- Sem caixas coloridas, sem destaques de fundo em citações.
- Tipografia serifada (estilo documento formal).
- Tabelas simples (útil para sumário e glossário).

O documento pode começar diretamente pelo **Sumário** (sem capa repetida na pré-visualização). Data e autor ficam no **Histórico de revisões** no final.

## Estrutura por funcionalidade

Para cada módulo do sistema, use sempre os mesmos blocos — facilita leitura pela diretoria e por programadores novos:

```markdown
#### 3.1.1 Nome do módulo

**Visão geral**
- Objetivo de negócio em tópicos.

**Execução**
Como abrir no menu (negrito nos nomes de botões e menus).

![Captura da tela](assets/nome-da-imagem.png)
*Legenda curta da figura.*

**Informações de entrada**
Tabela ou lista de campos obrigatórios.

**Processo**
Passos numerados ou lista do fluxo automático.

**Validações**
Regras, alertas e confirmações.

**Controles**
O que aparece no painel de log/status.
```

## Imagens

1. Exporte capturas do sistema **sem** fundos decorativos desnecessários (recorte só a janela relevante).
2. Guarde em `docs/assets/` com nomes descritivos: `tela-projecao-dividas.png`.
3. No Markdown: `![legenda](assets/arquivo.png)` e, na linha seguinte, *Figura N — descrição.*

## Sumário

Use uma tabela Markdown (como no exemplo `manual-central-servicos-imobiliario.md`). Os números de página no PDF podem ser ajustados manualmente após a primeira exportação, ou mantidos como referência de secção.

## Gerar o PDF

1. `npm run dev` na raiz do projeto.
2. Abra http://localhost:3000
3. Cole o conteúdo de `docs/manual-central-servicos-imobiliario.md` (ou importe o ficheiro).
4. Modelo: **Manual** → **Exportar** → **PDF** (ou DOCX para editar no Word).

## Migrar do Word existente

Se tiver o ficheiro em `\\tarifador\dev\Documentações\...`:

1. Copie o texto por secção para o Markdown (mantendo a hierarquia `##`, `###`, `####`).
2. Substitua capturas embutidas no Word por ficheiros em `docs/assets/`.
3. Preencha as secções marcadas com `*(Completar...)*` no exemplo.

O exemplo completo está em: [manual-central-servicos-imobiliario.md](./manual-central-servicos-imobiliario.md)
