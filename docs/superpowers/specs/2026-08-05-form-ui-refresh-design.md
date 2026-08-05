# Form UI Refresh — dark mode default, sin locks, range-calendar

Fecha: 2026-08-05
Branch: `feature/form-ui-refresh`
Archivo principal afectado: `src/components/CommunicationForm.tsx`

## Contexto

`CommunicationForm.tsx` tiene hoy:
- Un toggle de tema oscuro/claro con `Switch` de `@mui/material`, default a claro (`localStorage.getItem("theme") === "dark"`, cae a `false`).
- 8 `Switch` de MUI (uno por input de texto: área, responsable, campaña, proceso, subCampana, subCampana2, segmento, ciclo) que "bloquean" el campo (`disabled`) para que no se borre al agregar la siguiente comunicación.
- Dos `Popover` + `Calendar` (`mode="single"`) independientes para Fecha Inicio y Fecha Fin, sin forma de tipear la fecha.

`src/components/ui/calendar.tsx` (react-day-picker) y `src/components/ui/switch.tsx` (Radix) ya existen en el proyecto — no se agregan dependencias nuevas.

## Cambios

### 1. Dark mode por default
El `useState<boolean>` inicial de `isDark` pasa de `false` a `true` cuando no hay valor guardado en `localStorage`. Si el usuario ya tiene `"light"` guardado de una sesión previa, se respeta ese valor (no se le pisa la preferencia).

### 2. Eliminar función de lock
Se borran por completo: los 8 `Switch` de MUI, el estado `locks`, `toggleLock`, y los `disabled={!!locks.x}` + wrapper `relative`/botón superpuesto de cada input. Los 8 inputs quedan como `Input` simples dentro de su `div.space-y-2`.

### 3. Theme toggle a shadcn Switch
El `Switch` de tema (el único que queda) pasa de `@mui/material` a `@/components/ui/switch`. Se elimina el import `Switch from "@mui/material/Switch"` y se agregan `@radix-ui/react-switch` (ya está, vía el componente shadcn) — no requiere nada nuevo. `@mui/material` y `@emotion/react`/`@emotion/styled` se sacan de `package.json` (dejan de tener uso en todo el repo tras este cambio — se verifica con grep antes de borrar).

### 4. Range-calendar + inputs tipeables
- Estado: `fechaInicio`/`fechaFin` (dos `Date | undefined`) se reemplazan por `dateRange: DateRange | undefined` (tipo de `react-day-picker`).
- Trigger: un solo `Button` dentro de un `Popover` que muestra `"dd/MM/yyyy - dd/MM/yyyy"` (o "Seleccionar fechas" si está vacío), abre `<Calendar mode="range" numberOfMonths={2} selected={dateRange} onSelect={setDateRange} />`.
- Debajo del trigger, dos `Input` de texto (Inicio / Fin), formato `DD/MM/YYYY`, editables a mano:
  - `onChange` solo actualiza un estado de texto local (string) por input — no parsea en cada tecla.
  - `onBlur` intenta `parse(valor, "dd/MM/yyyy", new Date())` de `date-fns` + `isValid`. Si es válido, actualiza `dateRange.from`/`dateRange.to`. Si no, el input vuelve a mostrar el último valor válido formateado (sin toast, no es un error bloqueante).
  - Elegir fechas en el calendario reformatea ambos inputs de texto (`format(date, "dd/MM/yyyy")`).
- Validación de submit: se mantiene el mismo chequeo (`!fechaInicio || !fechaFin` → ahora `!dateRange?.from || !dateRange?.to`) con el mismo mensaje de error por toast.
- El resto del componente (`Communication.fechaInicio`/`fechaFin` en `handleSubmit`) sigue recibiendo dos `Date`, tomados de `dateRange.from`/`dateRange.to` — no se toca `src/types/communication.ts` ni ningún otro componente (`ScheduleView`, `excelExport`, etc. no cambian).

## Fuera de alcance

- No se toca `ChannelDayGrid`, `ScheduleView`, `CommunicationList`, `excelExport.ts` ni `types/communication.ts`.
- No se agrega selector de rango con atajos (últimos 7 días, etc.) — no se pidió.
- No se valida rango mínimo/máximo de fechas tipeadas más allá de "fin no antes de inicio" (mismo comportamiento que ya existe hoy vía `disabled` en el calendario).

## Testing

Cambio de UI en un solo componente, sin lógica de negocio nueva más allá del parseo de fecha. Verificación manual en el navegador (`npm run dev` / `bun run dev`): alternar tema, tipear fechas válidas/inválidas en ambos inputs, seleccionar rango en el calendario, enviar el formulario y confirmar que la comunicación se agrega con las fechas correctas al cronograma.
