# opencode-todo

[Português](README.md) · [English](README.en.md) · [Español](README.es.md) · [Français](README.fr.md) · [Italiano](README.it.md) · [Русский](README.ru.md) · [हिन्दी](README.hi.md) · [中文](README.zh.md) · [日本語](README.ja.md)

Plugin de [OpenCode](https://opencode.ai) con lista de tareas por sesión. El agente crea y actualiza los elementos mediante las herramientas `todo_write` y `todo_list`; la TUI muestra el progreso en la barra lateral y en un panel abierto con `/todos`.

![Vista previa de la lista de tareas en la barra lateral](docs/todo-preview.svg)

## Características

- Lista por sesión, persistida en el almacenamiento de OpenCode.
- Los subagentes actualizan la lista de la sesión raíz.
- Actualización en tiempo real mediante RPC.
- Iconos y colores por estado, con alineación en los saltos de línea.
- Panel `/todos` para consultar y borrar la lista.

## Instalación

Clona el repositorio en la carpeta de plugins de OpenCode e instala las dependencias:

```bash
git clone https://github.com/juliano340/opencode-todo.git ~/.config/opencode/plugins/opencode-todo
cd ~/.config/opencode/plugins/opencode-todo
npm install
```

En Windows, usa una carpeta equivalente, por ejemplo:

```powershell
git clone https://github.com/juliano340/opencode-todo.git "$env:USERPROFILE\.config\opencode\plugins\opencode-todo"
cd "$env:USERPROFILE\.config\opencode\plugins\opencode-todo"
npm install
```

Añade la ruta absoluta de la carpeta a `plugins` en tu `opencode.json` global:

```jsonc
{
  "plugins": [
    "C:/Users/<usuario>/.config/opencode/plugins/opencode-todo"
  ]
}
```

Recarga OpenCode o usa `/reload`. Si la barra lateral no se actualiza por sí sola, ejecuta `/reload` de nuevo.

## Uso

El agente mantiene la lista automáticamente durante el trabajo. Tú también puedes:

- Abrir el panel con `/todos`.
- Pulsar `c` para borrar la lista, con confirmación.
- Pulsar `Esc` para cerrar el panel.

### Estados

| Estado | Icono | Apariencia |
| --- | --- | --- |
| `pending` | `•` | Marcador neutro, texto normal |
| `in_progress` | `▸` | Marcador y texto en el color de advertencia del tema |
| `completed` | `✓` | Marcador en el color de éxito, texto atenuado |

Los textos largos se ajustan debajo del título, sin volver a la columna del icono.

## Comportamiento

- Los datos se guardan en `todos/<sessionID>` y sobreviven a los reinicios.
- Cuando un subagente escribe, la lista se guarda en la sesión raíz para aparecer en la barra lateral principal.
- Los elementos con el mismo título conservan el `id` entre actualizaciones.
- Cuando todos los elementos están completados, la siguiente solicitud borra la lista para mostrar solo la tarea actual.
- La TUI lee mediante RPC (`todo.list`) y escucha el evento `todo.changed`.

## Herramientas para el modelo

### `todo_write`

Reemplaza toda la lista. Envía siempre todos los elementos, no solo los cambios.

```json
{
  "todos": [
    { "title": "Implementar endpoint", "status": "completed" },
    { "title": "Validar integración", "status": "in_progress" },
    { "title": "Publicar versión", "status": "pending" }
  ]
}
```

### `todo_list`

Lee la lista actual de la sesión.

## Estructura

| Archivo | Responsabilidad |
| --- | --- |
| `src/rpc.ts` | Contrato RPC: `todo.list`, `todo.clear` y evento `todo.changed` |
| `src/index.ts` | Herramientas, almacenamiento, RPC y limpieza automática |
| `src/tui.tsx` | Bloque en la barra lateral y panel `/todos` |

## Desarrollo

```bash
npm install
npx tsc --noEmit
```

Requisitos: API de plugins de la TUI de OpenCode y entorno de ejecución compatible con Bun, según `package.json`.

## Licencia

[MIT](LICENSE) © 2026 Juliano Pereira.
