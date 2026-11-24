# opencode-todo

Plugin do [OpenCode](https://opencode.ai) com lista de tarefas por sessão. O agente cria e atualiza os itens pelas ferramentas `todo_write` e `todo_list`; a TUI mostra o progresso na sidebar e num painel aberto por `/todos`.

![Prévia da lista de todos na sidebar](docs/todo-preview.svg)

## Recursos

- Lista por sessão, persistida no storage do OpenCode.
- Subagentes atualizam a lista da sessão raiz.
- Atualização em tempo real por RPC.
- Ícones e cores por status, com alinhamento nas quebras de linha.
- Painel `/todos` para consultar e limpar a lista.

## Instalação

Clone o repositório para a pasta de plugins do OpenCode e instale as dependências:

```bash
git clone https://github.com/juliano340/opencode-todo.git ~/.config/opencode/plugins/opencode-todo
cd ~/.config/opencode/plugins/opencode-todo
npm install
```

No Windows, use uma pasta equivalente, por exemplo:

```powershell
git clone https://github.com/juliano340/opencode-todo.git "$env:USERPROFILE\.config\opencode\plugins\opencode-todo"
cd "$env:USERPROFILE\.config\opencode\plugins\opencode-todo"
npm install
```

Adicione o caminho absoluto da pasta ao `plugins` do seu `opencode.json` global:

```jsonc
{
  "plugins": [
    "C:/Users/<usuario>/.config/opencode/plugins/opencode-todo"
  ]
}
```

Recarregue o OpenCode ou use `/reload`. Se a sidebar não atualizar sozinha, execute `/reload` novamente.

## Uso

O agente mantém a lista automaticamente durante o trabalho. Você também pode:

- Abrir o painel com `/todos`.
- Pressionar `c` para limpar a lista, com confirmação.
- Pressionar `Esc` para fechar o painel.

### Status

| Status | Ícone | Aparência |
| --- | --- | --- |
| `pending` | `•` | Marcador neutro, texto normal |
| `in_progress` | `▸` | Marcador e texto na cor de aviso do tema |
| `completed` | `✓` | Marcador na cor de sucesso, texto atenuado |

Textos longos quebram abaixo do título, sem voltar para a coluna do ícone.

## Comportamento

- Os dados ficam em `todos/<sessionID>` e sobrevivem a reinícios.
- Quando um subagente escreve, a lista é gravada na sessão raiz para aparecer na sidebar principal.
- Itens com o mesmo título mantêm o `id` entre atualizações.
- Quando todos os itens estão concluídos, o próximo prompt limpa a lista para refletir apenas a tarefa atual.
- A TUI lê por RPC (`todo.list`) e escuta o evento `todo.changed`.

## Ferramentas para o modelo

### `todo_write`

Substitui a lista inteira. Envie sempre todos os itens, não apenas as mudanças.

```json
{
  "todos": [
    { "title": "Implementar endpoint", "status": "completed" },
    { "title": "Validar integração", "status": "in_progress" },
    { "title": "Publicar release", "status": "pending" }
  ]
}
```

### `todo_list`

Lê a lista atual da sessão.

## Estrutura

| Arquivo | Responsabilidade |
| --- | --- |
| `src/rpc.ts` | Contrato RPC: `todo.list`, `todo.clear` e evento `todo.changed` |
| `src/index.ts` | Ferramentas, storage, RPC e limpeza automática |
| `src/tui.tsx` | Bloco na sidebar e painel `/todos` |

## Desenvolvimento

```bash
npm install
npx tsc --noEmit
```

Requisitos: API de plugins da TUI do OpenCode e runtime compatível com Bun, conforme `package.json`.

## Licença

[MIT](LICENSE) © 2026 Juliano Pereira.
