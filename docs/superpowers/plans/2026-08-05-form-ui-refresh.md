# Form UI Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** En `CommunicationForm.tsx`: dark mode por default, eliminar la función de "lock" de los inputs, migrar el toggle de tema a shadcn `Switch` (sacando MUI/emotion del proyecto), y reemplazar los dos date-pickers de un solo día por un range-calendar de shadcn con inputs tipeables en formato DD/MM/YYYY.

**Architecture:** Cambio acotado a un solo componente (`src/components/CommunicationForm.tsx`), sin tocar el modelo de datos (`Communication` sigue recibiendo dos `Date`: `fechaInicio`/`fechaFin`) ni ningún otro componente consumidor (`ScheduleView`, `CommunicationList`, `excelExport.ts`). `Calendar` (react-day-picker) y `Switch` (Radix) ya existen en `src/components/ui/` — no se agregan dependencias.

**Tech Stack:** React 18, TypeScript, react-day-picker v8 (`mode="range"`, tipo `DateRange`), date-fns (`format`, `parse`, `isValid`), shadcn/ui, Tailwind.

## Global Constraints

- No se agregan dependencias nuevas. `@mui/material`, `@emotion/react`, `@emotion/styled` se eliminan de `package.json` en la Tarea 3 (única sección del repo que los usa tras la Tarea 2).
- Único archivo de código tocado: `src/components/CommunicationForm.tsx`. `package.json` y `bun.lockb` solo se tocan en la Tarea 3.
- No se toca `ChannelDayGrid.tsx`, `ScheduleView.tsx`, `CommunicationList.tsx`, `excelExport.ts` ni `types/communication.ts`.
- No hay test runner configurado en este proyecto (ver `CLAUDE.md`). Cada tarea se verifica manualmente en el navegador con `bun run dev` (o `npm run dev`) en vez de un test automatizado.
- Formato de fecha para tipeo/display: `dd/MM/yyyy` (date-fns), ej. `01/08/2026`.

---

### Task 1: Dark mode por default

**Files:**
- Modify: `src/components/CommunicationForm.tsx:24-30`

**Interfaces:**
- Consumes: nada nuevo.
- Produces: `isDark` (estado existente) ahora arranca en `true` cuando no hay preferencia guardada. Ninguna tarea posterior depende de este cambio.

- [ ] **Step 1: Cambiar el default de `isDark`**

Reemplazar:

```tsx
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      return localStorage.getItem("theme") === "dark";
    } catch {
      return false;
    }
  });
```

por:

```tsx
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem("theme");
      return stored ? stored === "dark" : true;
    } catch {
      return true;
    }
  });
```

- [ ] **Step 2: Verificar en el navegador**

Correr `bun run dev`, abrir la app. En DevTools → Application (o consola: `localStorage.clear()`) borrar `localStorage` y recargar la página: el `<html>` debe tener la clase `dark` y la UI debe verse en tema oscuro sin tocar el switch. Después, togglear a claro, recargar, y confirmar que se mantiene en claro (la preferencia guardada se respeta).

- [ ] **Step 3: Commit**

```bash
git add src/components/CommunicationForm.tsx
git commit -m "feat(form): dark mode por default cuando no hay preferencia guardada"
```

---

### Task 2: Eliminar la función de "lock" de los inputs

**Files:**
- Modify: `src/components/CommunicationForm.tsx:69-83` (estado `locks` + `toggleLock`)
- Modify: `src/components/CommunicationForm.tsx:142-278` (los 8 bloques de input)

**Interfaces:**
- Consumes: nada.
- Produces: los 8 inputs (`area`, `responsable`, `campana`, `proceso`, `subCampana`, `subCampana2`, `segmento`, `ciclo`) quedan sin `disabled` ni wrapper de switch. Tarea 3 y 4 no dependen de esto.

- [ ] **Step 1: Borrar el estado `locks` y `toggleLock`**

Borrar por completo este bloque:

```tsx
  // Locks per input field
  const [locks, setLocks] = useState<Record<string, boolean>>({
    area: false,
    responsable: false,
    campana: false,
    proceso: false,
    subCampana: false,
    subCampana2: false,
    segmento: false,
    ciclo: false,
  });

  const toggleLock = (field: string) => {
    setLocks((prev) => ({ ...prev, [field]: !prev[field] }));
  };
```

- [ ] **Step 2: Simplificar los 8 bloques de input**

Cada uno de los 8 campos sigue hoy este patrón (ejemplo con `area`):

```tsx
            <div className="space-y-2">
              <Label htmlFor="area">Área</Label>
              <div className="relative">
                <Input
                  id="area"
                  value={formData.area}
                  onChange={(e) => handleInputChange("area", e.target.value)}
                  placeholder="Ej: Marketing"
                  disabled={!!locks.area}
                  className="pr-10"
                />
                <div className="absolute inset-y-0 right-2 flex items-center">
                  <Switch checked={!!locks.area} onChange={() => toggleLock("area")} size="small" color="primary" inputProps={{ 'aria-label': 'Bloquear area' }} />
                </div>
              </div>
            </div>
```

Reemplazar por:

```tsx
            <div className="space-y-2">
              <Label htmlFor="area">Área</Label>
              <Input
                id="area"
                value={formData.area}
                onChange={(e) => handleInputChange("area", e.target.value)}
                placeholder="Ej: Marketing"
              />
            </div>
```

Es decir: se borra el `div.relative` wrapper, el `div.absolute` con el `Switch`, el prop `disabled={!!locks.x}` y el prop `className="pr-10"` del `Input`. Aplicar exactamente la misma transformación a los otros 7 campos, quedando así cada uno:

```tsx
            <div className="space-y-2">
              <Label htmlFor="responsable">Responsable</Label>
              <Input
                id="responsable"
                value={formData.responsable}
                onChange={(e) => handleInputChange("responsable", e.target.value)}
                placeholder="Ej: Juan Pérez"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="campana">Campaña *</Label>
              <Input
                id="campana"
                value={formData.campana}
                onChange={(e) => handleInputChange("campana", e.target.value)}
                placeholder="Ej: Pronto Pago"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="proceso">Proceso</Label>
              <Input
                id="proceso"
                value={formData.proceso}
                onChange={(e) => handleInputChange("proceso", e.target.value)}
                placeholder="Ej: Cobranza"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subCampana">Sub-Campaña 1</Label>
              <Input
                id="subCampana"
                value={formData.subCampana}
                onChange={(e) => handleInputChange("subCampana", e.target.value)}
                placeholder="Ej: C1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subCampana2">Sub-Campaña 2</Label>
              <Input
                id="subCampana2"
                value={formData.subCampana2}
                onChange={(e) => handleInputChange("subCampana2", e.target.value)}
                placeholder="Ej: Último día"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="segmento">Segmento</Label>
              <Input
                id="segmento"
                value={formData.segmento}
                onChange={(e) => handleInputChange("segmento", e.target.value)}
                placeholder="Ej: Premium"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ciclo">Ciclo</Label>
              <Input
                id="ciclo"
                value={formData.ciclo}
                onChange={(e) => handleInputChange("ciclo", e.target.value)}
                placeholder="Ej: 02"
              />
            </div>
```

El orden de los campos en el grid no cambia (área, responsable, campaña, proceso, subCampaña, subCampaña2, segmento, ciclo).

- [ ] **Step 3: Verificar en el navegador**

Correr `bun run dev`. Confirmar que los 8 inputs se renderizan sin ningún switch al costado, que se puede tipear en todos, y que la consola del navegador no tiene errores (nada referenciando `locks` ya que fue borrado).

- [ ] **Step 4: Commit**

```bash
git add src/components/CommunicationForm.tsx
git commit -m "feat(form): eliminar función de bloqueo de inputs"
```

---

### Task 3: Theme toggle a shadcn Switch y limpieza de MUI/emotion

**Files:**
- Modify: `src/components/CommunicationForm.tsx:13` (import)
- Modify: `src/components/CommunicationForm.tsx:133-139` (JSX del header)
- Modify: `package.json`

**Interfaces:**
- Consumes: `isDark`, `toggleTheme` (ya existen, sin cambios de firma).
- Produces: nada que otras tareas consuman.

- [ ] **Step 1: Cambiar el import**

Reemplazar:

```tsx
import Switch from "@mui/material/Switch";
```

por:

```tsx
import { Switch } from "@/components/ui/switch";
```

(dejarlo agrupado junto a los demás imports de `@/components/ui/*`, por ejemplo justo debajo del import de `Checkbox`).

- [ ] **Step 2: Actualizar el `Switch` del header**

Reemplazar:

```tsx
      <CardHeader className="flex items-center justify-between">
        <CardTitle>Nueva Comunicación</CardTitle>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Tema oscuro</span>
          <Switch checked={isDark} onChange={() => toggleTheme()} size="small" color="primary" inputProps={{ 'aria-label': 'Toggle theme' }} />
        </div>
      </CardHeader>
```

por:

```tsx
      <CardHeader className="flex items-center justify-between">
        <CardTitle>Nueva Comunicación</CardTitle>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Tema oscuro</span>
          <Switch checked={isDark} onCheckedChange={toggleTheme} aria-label="Alternar tema oscuro" />
        </div>
      </CardHeader>
```

(el `Switch` de shadcn usa `onCheckedChange`, no `onChange` — es la diferencia de API contra el de MUI).

- [ ] **Step 3: Confirmar que no queda ningún otro uso de MUI/emotion**

```bash
rg "@mui|@emotion" src
```

Debe devolver **cero** resultados (si hay alguno fuera de `CommunicationForm.tsx`, no seguir con el Step 4 — investigar primero).

- [ ] **Step 4: Sacar las dependencias del `package.json`**

En `package.json`, borrar estas cuatro líneas de `dependencies`:

```json
    "@emotion/react": "^11.14.0",
    "@emotion/styled": "^11.14.1",
```

y

```json
    "@mui/material": "^7.3.5",
```

- [ ] **Step 5: Reinstalar para actualizar el lockfile**

```bash
bun install
```

- [ ] **Step 6: Verificar en el navegador**

Correr `bun run dev`. Togglear el switch de tema varias veces, confirmar que visualmente es el switch de shadcn (no el de MUI) y que sigue cambiando la clase `dark` del `<html>` correctamente. Confirmar que no hay errores en consola.

- [ ] **Step 7: Commit**

```bash
git add src/components/CommunicationForm.tsx package.json bun.lockb
git commit -m "refactor(form): migrar theme switch a shadcn y sacar dependencia de MUI/emotion"
```

---

### Task 4: Range-calendar + inputs tipeables DD/MM/YYYY

**Files:**
- Modify: `src/components/CommunicationForm.tsx:1` (imports)
- Modify: `src/components/CommunicationForm.tsx:57-58` (estado de fechas)
- Modify: `src/components/CommunicationForm.tsx:103-129` (`handleSubmit`)
- Modify: `src/components/CommunicationForm.tsx:280-333` (JSX de fechas)

**Interfaces:**
- Consumes: `Communication` type de `@/types/communication` (sin cambios — sigue esperando `fechaInicio: Date` y `fechaFin: Date`).
- Produces: nada que otras tareas consuman (última tarea del plan).

- [ ] **Step 1: Agregar imports necesarios**

Agregar, junto a los imports existentes de `date-fns` y `react-day-picker`:

```tsx
import type { DateRange } from "react-day-picker";
```

y ampliar el import existente de `date-fns`:

```tsx
import { format, parse, isValid } from "date-fns";
```

(reemplaza la línea actual `import { format } from "date-fns";`).

- [ ] **Step 2: Reemplazar el estado de fechas**

Reemplazar:

```tsx
  const [fechaInicio, setFechaInicio] = useState<Date | undefined>(undefined);
  const [fechaFin, setFechaFin] = useState<Date | undefined>(undefined);
```

por:

```tsx
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [fechaInicioText, setFechaInicioText] = useState("");
  const [fechaFinText, setFechaFinText] = useState("");

  useEffect(() => {
    setFechaInicioText(dateRange?.from ? format(dateRange.from, "dd/MM/yyyy") : "");
    setFechaFinText(dateRange?.to ? format(dateRange.to, "dd/MM/yyyy") : "");
  }, [dateRange]);

  const handleFechaInicioBlur = () => {
    const parsed = parse(fechaInicioText, "dd/MM/yyyy", new Date());
    if (fechaInicioText.length === 10 && isValid(parsed)) {
      setDateRange((prev) => ({ from: parsed, to: prev?.to }));
    } else {
      setFechaInicioText(dateRange?.from ? format(dateRange.from, "dd/MM/yyyy") : "");
    }
  };

  const handleFechaFinBlur = () => {
    const parsed = parse(fechaFinText, "dd/MM/yyyy", new Date());
    if (fechaFinText.length === 10 && isValid(parsed)) {
      setDateRange((prev) => ({ from: prev?.from, to: parsed }));
    } else {
      setFechaFinText(dateRange?.to ? format(dateRange.to, "dd/MM/yyyy") : "");
    }
  };
```

- [ ] **Step 3: Actualizar `handleSubmit`**

Reemplazar la validación:

```tsx
    if (!formData.campana || !fechaInicio || !fechaFin) {
      toast.error("Por favor completa los campos obligatorios (Campaña, Fechas)");
      return;
    }
```

por:

```tsx
    if (!formData.campana || !dateRange?.from || !dateRange?.to) {
      toast.error("Por favor completa los campos obligatorios (Campaña, Fechas)");
      return;
    }
```

Y reemplazar la construcción del objeto:

```tsx
    const newCommunication: Communication = {
      id: Date.now().toString(),
      ...formData,
      fechaInicio,
      fechaFin,
      canalesPorDia,
    };
```

por:

```tsx
    const newCommunication: Communication = {
      id: Date.now().toString(),
      ...formData,
      fechaInicio: dateRange.from,
      fechaFin: dateRange.to,
      canalesPorDia,
    };
```

- [ ] **Step 4: Reemplazar el JSX de fechas**

Reemplazar todo el bloque (los dos `Popover`/`Calendar` de Fecha Inicio y Fecha Fin):

```tsx
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Fecha Inicio *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !fechaInicio && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {fechaInicio ? format(fechaInicio, "PPP", { locale: es }) : "Seleccionar fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={fechaInicio}
                    onSelect={setFechaInicio}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Fecha Fin *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !fechaFin && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {fechaFin ? format(fechaFin, "PPP", { locale: es }) : "Seleccionar fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={fechaFin}
                    onSelect={setFechaFin}
                    initialFocus
                    disabled={(date) => (fechaInicio ? date < fechaInicio : false)}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
```

por:

```tsx
          <div className="space-y-2">
            <Label>Fechas *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dateRange?.from && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from
                    ? dateRange.to
                      ? `${format(dateRange.from, "dd/MM/yyyy")} - ${format(dateRange.to, "dd/MM/yyyy")}`
                      : format(dateRange.from, "dd/MM/yyyy")
                    : "Seleccionar fechas"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="range"
                  numberOfMonths={2}
                  selected={dateRange}
                  onSelect={setDateRange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="fechaInicioText" className="text-xs text-muted-foreground">
                  Inicio (DD/MM/YYYY)
                </Label>
                <Input
                  id="fechaInicioText"
                  value={fechaInicioText}
                  onChange={(e) => setFechaInicioText(e.target.value)}
                  onBlur={handleFechaInicioBlur}
                  placeholder="01/08/2026"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="fechaFinText" className="text-xs text-muted-foreground">
                  Fin (DD/MM/YYYY)
                </Label>
                <Input
                  id="fechaFinText"
                  value={fechaFinText}
                  onChange={(e) => setFechaFinText(e.target.value)}
                  onBlur={handleFechaFinBlur}
                  placeholder="15/08/2026"
                />
              </div>
            </div>
          </div>
```

Nota: la referencia a `es` (locale de date-fns) puede dejar de usarse en este archivo tras este cambio — si `rg "\bes\." src/components/CommunicationForm.tsx` no devuelve más matches además del import, borrar `import { es } from "date-fns/locale";` para no dejar un import muerto.

- [ ] **Step 5: Verificar en el navegador**

Correr `bun run dev`:
1. Abrir el popover de fechas, seleccionar un rango en el calendario de dos meses → confirmar que el botón muestra `dd/mm/yyyy - dd/mm/yyyy` y que los dos inputs de texto se actualizan solos.
2. Tipear a mano una fecha válida (ej. `05/08/2026`) en el input de Inicio, sacar el foco (Tab o click afuera) → confirmar que el calendario y el botón reflejan el cambio.
3. Tipear una fecha inválida (ej. `99/99/9999` o texto suelto) en cualquiera de los dos inputs, sacar el foco → confirmar que el input vuelve al último valor válido (o queda vacío si nunca hubo uno).
4. Completar Campaña + canales + enviar el formulario con un rango cargado → confirmar que la comunicación aparece en el Cronograma con las fechas correctas.
5. Intentar enviar sin fechas → confirmar que sigue apareciendo el toast de error de campos obligatorios.

- [ ] **Step 6: Commit**

```bash
git add src/components/CommunicationForm.tsx
git commit -m "feat(form): range-calendar de shadcn con inputs tipeables DD/MM/YYYY para las fechas"
```
