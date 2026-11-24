# opencode-todo

[Português](README.md) · [English](README.en.md) · [Español](README.es.md) · [Français](README.fr.md) · [Italiano](README.it.md) · [Русский](README.ru.md) · [हिन्दी](README.hi.md) · [中文](README.zh.md) · [日本語](README.ja.md)

Plugin pour [OpenCode](https://opencode.ai) avec une liste de tâches par session. L’agent crée et met à jour les éléments via les outils `todo_write` et `todo_list` ; la TUI affiche la progression dans la barre latérale et dans un volet ouvert avec `/todos`.

![Aperçu de la liste de tâches dans la barre latérale](docs/todo-preview.svg)

## Fonctionnalités

- Liste par session, persistée dans le stockage d’OpenCode.
- Les sous-agents mettent à jour la liste de la session racine.
- Mise à jour en temps réel via RPC.
- Icônes et couleurs par statut, avec alignement lors des retours à la ligne.
- Volet `/todos` pour consulter et effacer la liste.

## Installation

Clonez le dépôt dans le dossier des plugins d’OpenCode et installez les dépendances :

```bash
git clone https://github.com/juliano340/opencode-todo.git ~/.config/opencode/plugins/opencode-todo
cd ~/.config/opencode/plugins/opencode-todo
npm install
```

Sous Windows, utilisez un dossier équivalent, par exemple :

```powershell
git clone https://github.com/juliano340/opencode-todo.git "$env:USERPROFILE\.config\opencode\plugins\opencode-todo"
cd "$env:USERPROFILE\.config\opencode\plugins\opencode-todo"
npm install
```

Ajoutez le chemin absolu du dossier au champ `plugins` de votre fichier global `opencode.json` :

```jsonc
{
  "plugins": [
    "C:/Users/<usuario>/.config/opencode/plugins/opencode-todo"
  ]
}
```

Rechargez OpenCode ou utilisez `/reload`. Si la barre latérale ne se met pas à jour automatiquement, exécutez à nouveau `/reload`.

## Utilisation

L’agent tient la liste à jour automatiquement pendant son travail. Vous pouvez également :

- Ouvrir le volet avec `/todos`.
- Appuyer sur `c` pour effacer la liste, avec confirmation.
- Appuyer sur `Échap` pour fermer le volet.

### Statuts

| Statut | Icône | Apparence |
| --- | --- | --- |
| `pending` | `•` | Puce neutre, texte normal |
| `in_progress` | `▸` | Puce et texte dans la couleur d’avertissement du thème |
| `completed` | `✓` | Puce dans la couleur de succès, texte atténué |

Les textes longs passent à la ligne sous le titre, sans revenir dans la colonne de l’icône.

## Comportement

- Les données sont stockées dans `todos/<sessionID>` et survivent aux redémarrages.
- Lorsqu’un sous-agent écrit, la liste est enregistrée dans la session racine pour apparaître dans la barre latérale principale.
- Les éléments portant le même titre conservent leur `id` entre les mises à jour.
- Lorsque tous les éléments sont terminés, le prochain prompt efface la liste pour ne refléter que la tâche actuelle.
- La TUI lit les données via RPC (`todo.list`) et écoute l’événement `todo.changed`.

## Outils pour le modèle

### `todo_write`

Remplace l’intégralité de la liste. Envoyez toujours tous les éléments, pas seulement les modifications.

```json
{
  "todos": [
    { "title": "Implémenter un point de terminaison", "status": "completed" },
    { "title": "Valider l’intégration", "status": "in_progress" },
    { "title": "Publier la version", "status": "pending" }
  ]
}
```

### `todo_list`

Lit la liste actuelle de la session.

## Structure

| Fichier | Responsabilité |
| --- | --- |
| `src/rpc.ts` | Contrat RPC : `todo.list`, `todo.clear` et événement `todo.changed` |
| `src/index.ts` | Outils, stockage, RPC et nettoyage automatique |
| `src/tui.tsx` | Bloc dans la barre latérale et volet `/todos` |

## Développement

```bash
npm install
npx tsc --noEmit
```

Prérequis : l’API de plugins de la TUI d’OpenCode et un runtime compatible avec Bun, conformément à `package.json`.

## Licence

[MIT](LICENSE) © 2026 Juliano Pereira.
