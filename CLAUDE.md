# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

SPA en React + TypeScript + Vite para planificar y visualizar campañas de comunicación (canal × día × rango de fechas). Generada originalmente con Lovable, se despliega a GitHub Pages vía Actions (dominio custom `programadorcomms.bchumpitaz.dev` via `CNAME`).

## Commands

```sh
npm run dev        # servidor de desarrollo (Vite, puerto 8080, host 0.0.0.0)
npm run build       # build de producción a dist/
npm run build:dev   # build en modo development (sin minificar, útil para debug)
npm run lint         # ESLint sobre todo el repo
npm run preview      # sirve dist/ localmente
npm run deploy        # publica dist/ a gh-pages vía gh-pages CLI
```

No hay test runner configurado en este proyecto.

## Deploy y base pública

- El deploy real ocurre en `.github/workflows/deploy.yml`: en push a `publish` o `main`, hace `npm ci && npm run build` con `VITE_BASE=/programador_de_comms/` y publica `dist/` a la branch `gh-pages` (usada por GitHub Pages, con dominio custom desde `CNAME`).
- `vite.config.ts` lee `base` desde `process.env.VITE_BASE`, default `/`. No hardcodear la base — si hace falta cambiarla, ajustar la env var en el workflow, no el config.

## Arquitectura

Todo el estado vive en memoria en `src/pages/Index.tsx` (`useState<Communication[]>`) — no hay backend ni persistencia; refrescar la página borra los datos. El flujo de datos es top-down desde `Index`:

- **`CommunicationForm`** — alta de una `Communication`. Combina un formulario de campos simples (área, responsable, campaña, etc.), un `Calendar` (rango de fechas) y `ChannelDayGrid` para seleccionar canales por día. También maneja el toggle de tema claro/oscuro (clase `dark` en `<html>` + `localStorage`).
- **`ChannelDayGrid`** — grilla canal × día reutilizable, controlada u opcionalmente no controlada vía `value`/`onChange`. Soporta selección múltiple con modificadores de teclado: `Alt` alterna toda la fila (canal, todos los días), `Shift` selecciona un rango entre el último click y el actual (mismo canal), `Ctrl/Cmd` multiselección simple.
- **`ScheduleView`** — vista de cronograma tipo Gantt: filas = comunicaciones (reordenables por drag-and-drop con `@dnd-kit`), columnas = días calculados dinámicamente en base al rango min/max de fechas de todas las comunicaciones (`eachDayOfInterval`). Cada fila expande sub-filas por canal único usado en esa comunicación.
- **`CommunicationList`** — vista de lista/tabla, también reordenable.
- **`src/utils/excelExport.ts`** — `exportToExcel` (usa `xlsx` para generar un `.xlsx` con una fila por canal activo por día) y `copyToClipboard` (mismo formato, tab-separated, para pegar en Excel/Sheets).
- **`src/types/communication.ts`** — fuente de verdad del modelo `Communication` y de las constantes de dominio: `diasSemana` (abreviaturas LU/MA/.../DO) y `canalesDisponibles` (lista fija de canales: Mail UTP, Banner, TV SAE, Call, Totem, SMS, etc.). Si se agrega un canal o cambia el modelo, es acá.

Convención de días: los abreviaturas de `diasSemana` (`LU`..`DO`) son las keys de `canalesPorDia`, pero al mapear desde `Date` con `date-fns` (`getDay()`, domingo=0) se usa un array separado `dayAbbreviations = ["DO","LU","MA","MI","JU","VI","SA"]` indexado por ese valor — está duplicado en `ScheduleView.tsx` y `excelExport.ts`, mantenerlos en sync si se toca el orden de días.

## UI Stack

- shadcn/ui (`src/components/ui/*`, config en `components.json`, estilo "default", baseColor "slate") sobre Radix primitives + Tailwind. Alias de imports: `@/components`, `@/components/ui`, `@/lib`, `@/hooks` → `src/*` (definidos en `vite.config.ts` y `tsconfig`).
- Tailwind con variables CSS para theming (`cssVariables: true`) — dark mode por clase `.dark` en `<html>`.
- Hay una dependencia puntual a MUI (`@mui/material`, solo `Switch` en `CommunicationForm`) conviviendo con shadcn — no es la convención general del proyecto, no expandirla sin necesidad.
- ESLint: `@typescript-eslint/no-unused-vars` está deshabilitado a propósito.
