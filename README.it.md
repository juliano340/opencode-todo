# opencode-todo

[Português](README.md) · [English](README.en.md) · [Español](README.es.md) · [Français](README.fr.md) · [Italiano](README.it.md) · [Русский](README.ru.md) · [हिन्दी](README.hi.md) · [中文](README.zh.md) · [日本語](README.ja.md)

Plugin per [OpenCode](https://opencode.ai) con elenco di attività per sessione. L'agente crea e aggiorna le voci tramite gli strumenti `todo_write` e `todo_list`; la TUI mostra lo stato di avanzamento nella barra laterale e in un pannello aperto con `/todos`.

![Anteprima dell'elenco delle attività nella barra laterale](docs/todo-preview.svg)

## Risorse

- Elenco per sessione, persistito nell'archivio di OpenCode.
- I sottoagenti aggiornano l'elenco della sessione principale.
- Aggiornamenti in tempo reale tramite RPC.
- Icone e colori in base allo stato, con testo allineato anche quando va a capo.
- Pannello `/todos` per consultare e svuotare l'elenco.

## Installazione

Clona il repository nella cartella dei plugin di OpenCode e installa le dipendenze:

```bash
git clone https://github.com/juliano340/opencode-todo.git ~/.config/opencode/plugins/opencode-todo
cd ~/.config/opencode/plugins/opencode-todo
npm install
```

Su Windows, usa una cartella equivalente, ad esempio:

```powershell
git clone https://github.com/juliano340/opencode-todo.git "$env:USERPROFILE\.config\opencode\plugins\opencode-todo"
cd "$env:USERPROFILE\.config\opencode\plugins\opencode-todo"
npm install
```

Aggiungi il percorso assoluto della cartella all'array `plugins` del tuo `opencode.json` globale:

```jsonc
{
  "plugins": [
    "C:/Users/<usuario>/.config/opencode/plugins/opencode-todo"
  ]
}
```

Ricarica OpenCode oppure usa `/reload`. Se la barra laterale non si aggiorna automaticamente, esegui di nuovo `/reload`.

## Utilizzo

L'agente tiene aggiornato l'elenco automaticamente durante il lavoro. Puoi anche:

- Aprire il pannello con `/todos`.
- Premere `c` per svuotare l'elenco, con conferma.
- Premere `Esc` per chiudere il pannello.

### Stato

| Stato | Icona | Aspetto |
| --- | --- | --- |
| `pending` | `•` | Indicatore neutro, testo normale |
| `in_progress` | `▸` | Indicatore e testo nel colore di avviso del tema |
| `completed` | `✓` | Indicatore nel colore di successo, testo attenuato |

I testi lunghi vanno a capo sotto il titolo, senza tornare alla colonna dell'icona.

## Comportamento

- I dati sono memorizzati in `todos/<sessionID>` e sopravvivono ai riavvii.
- Quando un sottoagente scrive, l'elenco viene salvato nella sessione radice per essere visualizzato nella barra laterale principale.
- Le voci con lo stesso titolo mantengono l'`id` tra un aggiornamento e l'altro.
- Quando tutte le voci sono completate, il prompt successivo svuota l'elenco per mostrare solo l'attività corrente.
- La TUI legge tramite RPC (`todo.list`) e ascolta l'evento `todo.changed`.

## Strumenti per il modello

### `todo_write`

Sostituisce l'intero elenco. Invia sempre tutte le voci, non solo le modifiche.

```json
{
  "todos": [
    { "title": "Implementare l'endpoint", "status": "completed" },
    { "title": "Convalidare l'integrazione", "status": "in_progress" },
    { "title": "Pubblicare la release", "status": "pending" }
  ]
}
```

### `todo_list`

Legge l'elenco attuale della sessione.

## Struttura

| File | Responsabilità |
| --- | --- |
| `src/rpc.ts` | Contratto RPC: `todo.list`, `todo.clear` ed evento `todo.changed` |
| `src/index.ts` | Strumenti, archiviazione, RPC e pulizia automatica |
| `src/tui.tsx` | Blocco nella barra laterale e pannello `/todos` |

## Sviluppo

```bash
npm install
npx tsc --noEmit
```

Requisiti: API dei plugin della TUI di OpenCode e runtime compatibile con Bun, come indicato in `package.json`.

## Licenza

[MIT](LICENSE) © 2026 Juliano Pereira.
