# Paso Previo (Área/Responsable) y Filtro de Canales Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Agregar un paso previo de sesión (Área + Responsable, elegibles por combobox) que autocompleta cada alta de comunicación, y permitir elegir qué subconjunto de canales se muestra en la grilla canal×día por comunicación, para no saturar la tabla ahora que crece a 13 canales.

**Architecture:** Un nuevo componente `SessionSetup` gatea el render de `CommunicationForm` en `Index.tsx` hasta que el usuario elige Área/Responsable una vez; esos valores bajan como props iniciales (editables) al formulario. Un nuevo `Combobox` reutilizable (Popover + Command, sin dependencias nuevas) reemplaza los `Input` de texto libre de Área/Responsable, combinando lista fija + texto libre. `ChannelDayGrid` pasa a aceptar una prop `canales` para renderizar solo el subconjunto elegido en `CommunicationForm` vía checkboxes.

**Tech Stack:** React + TypeScript + Vite, shadcn/ui (Popover, Command, Checkbox, Card, Button, Label ya instalados), sin dependencias nuevas.

## Global Constraints

- No hay test runner en este proyecto (ver `CLAUDE.md`) — el "ciclo de test" de cada tarea es: `npm run lint` limpio + verificación manual en el navegador con `npm run dev` (puerto 8080). No se agregan Jest/Vitest.
- Nunca ejecutar `npm run build` ni `npm run build:dev` como parte de la verificación (regla global del usuario: "Never build after changes"). Usar solo `npm run lint` y `npm run dev`.
- No agregar dependencias nuevas — `Popover`, `Command` (cmdk) y `Checkbox` ya están en `src/components/ui/*`.
- Commits en conventional commits, sin trailer de co-autoría/IA (regla global del usuario).
- `Área` y `Responsable`: lista fija en código (`areasDisponibles`, `responsablesDisponibles` en `communication.ts`) que arranca vacía — el usuario la completa después editando ese archivo — combinada con la opción de escribir un valor libre en el combobox (no se persiste en localStorage, es decisión explícita del usuario: "lista fija pero también permite escribir").
- Los campos Área/Responsable en `CommunicationForm` quedan editables (pre-llenados desde la sesión, no de solo lectura) — decisión explícita del usuario.
- La grilla de canales por día arranca sin canales seleccionados por comunicación (no todos visibles) — así resuelve la saturación que motivó el pedido.
- **Baseline de lint:** `npm run lint` ya tiene 4 errores preexistentes sin relación con este plan (`command.tsx:24` interfaz vacía, `textarea.tsx:5` interfaz vacía, `excelExport.ts:9` `any`, `tailwind.config.ts:96` `require()`). Ningún task de este plan los toca. El criterio real en cada task es "no agregar errores nuevos respecto a ese baseline de 4", no "0 errores".

---

### Task 1: Ampliar canales y agregar listas fijas de Área/Responsable

**Files:**
- Modify: `src/types/communication.ts`

**Interfaces:**
- Produces: `areasDisponibles: string[]`, `responsablesDisponibles: string[]` (exportados desde `communication.ts`, consumidos por `SessionSetup` en Task 3 y `CommunicationForm` en Task 5).
- `canalesDisponibles` pasa de 9 a 13 entradas (mismo tipo `string[]`, ningún consumidor cambia de firma).

- [ ] **Step 1: Agregar los 4 canales nuevos y las listas fijas vacías**

En `src/types/communication.ts`, reemplazar el bloque de `canalesDisponibles` y agregar las dos listas nuevas al final del archivo:

```ts
export const canalesDisponibles = [
  "Mail UTP",
  "Mail Personal",
  "Banner - UTP +Class",
  "Banner - UTP +Portal",
  "TV SAE",
  "Call",
  "Totem",
  "SMS",
  "Notificación UTP +App",
  "Whatsapp",
  "Canal de Whatsapp",
  "Banner",
  "Banner - UTP+App",
];

// Completar con los valores reales de la organización.
export const areasDisponibles: string[] = [];

// Completar con los valores reales de la organización.
export const responsablesDisponibles: string[] = [];
```

- [ ] **Step 2: Verificar que no rompe nada existente**

Run: `npm run lint`
Expected: 0 errores (el archivo solo agrega exports y entradas a un array existente, ningún consumidor actual de `canalesDisponibles` cambia de forma).

- [ ] **Step 3: Commit**

```bash
git add src/types/communication.ts
git commit -m "feat(types): agregar canales de whatsapp/banner y listas fijas de area/responsable"
```

---

### Task 2: Combobox reutilizable (lista fija + texto libre)

**Files:**
- Create: `src/components/ui/combobox.tsx`

**Interfaces:**
- Produces: `Combobox` component con props `{ value: string; onChange: (value: string) => void; options: string[]; placeholder?: string }`. Consumido por `SessionSetup` (Task 3) y `CommunicationForm` (Task 5).
- Consumes: `Button` (`@/components/ui/button`), `Popover`/`PopoverTrigger`/`PopoverContent` (`@/components/ui/popover`), `Command`/`CommandInput`/`CommandList`/`CommandEmpty`/`CommandGroup`/`CommandItem` (`@/components/ui/command`), `cn` (`@/lib/utils`).

- [ ] **Step 1: Crear el componente**

```tsx
import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface ComboboxProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
}

export const Combobox = ({ value, onChange, options, placeholder = "Seleccionar..." }: ComboboxProps) => {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  const trimmedSearch = search.trim();
  const hasExactMatch = options.some((o) => o.toLowerCase() === trimmedSearch.toLowerCase());

  const selectValue = (next: string) => {
    onChange(next);
    setOpen(false);
    setSearch("");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          <span className={cn("truncate", !value && "text-muted-foreground")}>{value || placeholder}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command shouldFilter={false}>
          <CommandInput placeholder="Buscar o escribir..." value={search} onValueChange={setSearch} />
          <CommandList>
            <CommandEmpty>Sin resultados</CommandEmpty>
            <CommandGroup>
              {options
                .filter((o) => o.toLowerCase().includes(trimmedSearch.toLowerCase()))
                .map((option) => (
                  <CommandItem key={option} value={option} onSelect={() => selectValue(option)}>
                    <Check className={cn("mr-2 h-4 w-4", value === option ? "opacity-100" : "opacity-0")} />
                    {option}
                  </CommandItem>
                ))}
              {trimmedSearch && !hasExactMatch && (
                <CommandItem value={trimmedSearch} onSelect={() => selectValue(trimmedSearch)}>
                  Usar "{trimmedSearch}"
                </CommandItem>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
```

Nota: se usa `shouldFilter={false}` en `Command` y un `.filter()` manual sobre `options` porque el filtrado automático de `cmdk` no sabe convivir con el ítem sintético "Usar «texto»" que no pertenece a `options`.

- [ ] **Step 2: Verificar lint**

Run: `npm run lint`
Expected: sin errores nuevos respecto al baseline de 4 preexistentes (ver Global Constraints).

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/combobox.tsx
git commit -m "feat(ui): agregar combobox reutilizable con lista fija y texto libre"
```

---

### Task 3: Componente `SessionSetup` (paso previo)

**Files:**
- Create: `src/components/SessionSetup.tsx`

**Interfaces:**
- Consumes: `Combobox` (Task 2), `areasDisponibles`/`responsablesDisponibles` (Task 1), `Card`/`CardHeader`/`CardTitle`/`CardDescription`/`CardContent` (`@/components/ui/card`), `Button`, `Label`.
- Produces: `SessionInfo` type `{ area: string; responsable: string }` y `SessionSetup` component con props `{ onComplete: (info: SessionInfo) => void }`. Consumido por `Index.tsx` en Task 6.

- [ ] **Step 1: Crear el componente**

```tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Combobox } from "@/components/ui/combobox";
import { areasDisponibles, responsablesDisponibles } from "@/types/communication";

export interface SessionInfo {
  area: string;
  responsable: string;
}

interface SessionSetupProps {
  onComplete: (info: SessionInfo) => void;
}

export const SessionSetup = ({ onComplete }: SessionSetupProps) => {
  const [area, setArea] = useState("");
  const [responsable, setResponsable] = useState("");

  const canContinue = area.trim() !== "" && responsable.trim() !== "";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Antes de empezar</CardTitle>
        <CardDescription>
          Elegí el Área y el Responsable de esta sesión. Se autocompletan en cada comunicación que agregues después
          (podés corregirlos por comunicación si hace falta).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Área</Label>
            <Combobox value={area} onChange={setArea} options={areasDisponibles} placeholder="Seleccionar área" />
          </div>
          <div className="space-y-2">
            <Label>Responsable</Label>
            <Combobox
              value={responsable}
              onChange={setResponsable}
              options={responsablesDisponibles}
              placeholder="Seleccionar responsable"
            />
          </div>
        </div>
        <Button type="button" disabled={!canContinue} onClick={() => onComplete({ area, responsable })}>
          Continuar
        </Button>
      </CardContent>
    </Card>
  );
};
```

- [ ] **Step 2: Verificar lint**

Run: `npm run lint`
Expected: sin errores nuevos respecto al baseline de 4 preexistentes (ver Global Constraints).

- [ ] **Step 3: Commit**

```bash
git add src/components/SessionSetup.tsx
git commit -m "feat(form): agregar paso previo de sesion para area y responsable"
```

---

### Task 4: `ChannelDayGrid` acepta subconjunto de canales

**Files:**
- Modify: `src/components/ChannelDayGrid.tsx`

**Interfaces:**
- Produces: nueva prop opcional `canales?: string[]` en `ChannelDayGridProps` (default: `canalesDisponibles`, mantiene compatibilidad con el uso actual). Consumido por `CommunicationForm` en Task 5.

- [ ] **Step 1: Agregar la prop `canales` con fallback y estado vacío**

En `src/components/ChannelDayGrid.tsx`, agregar la prop a la interfaz y a la desestructuración (línea 4-14):

```tsx
interface ChannelDayGridProps {
  // valor controlado: mapa dia -> lista de canales
  value?: { [key: string]: string[] };
  // callback al cambiar la selección completa
  onChange?: (next: { [key: string]: string[] }) => void;
  // tamaño de celda opcional
  cellWidth?: string;
  cellHeight?: string;
  // subconjunto de canales a mostrar; por defecto muestra todos
  canales?: string[];
}

const ChannelDayGrid: React.FC<ChannelDayGridProps> = ({
  value,
  onChange,
  cellWidth = 'w-20',
  cellHeight = 'h-10',
  canales = canalesDisponibles,
}) => {
```

Reemplazar el `canalesDisponibles.map((canal) => (` de la tabla (línea 133) por `canales.map((canal) => (`.

Envolver el bloque `<div className="inline-block min-w-full align-middle">...</div>` (líneas 118-157) con un condicional para el estado vacío:

```tsx
{canales.length === 0 ? (
  <div className="text-sm text-muted-foreground px-2 py-6 text-center border rounded-lg">
    Seleccioná al menos un canal arriba para habilitar la grilla.
  </div>
) : (
  <div className="inline-block min-w-full align-middle">
    {/* ... tabla existente sin cambios, usando canales.map ... */}
  </div>
)}
```

- [ ] **Step 2: Verificar que el uso actual (sin pasar `canales`) sigue mostrando los 13 canales**

Run: `npm run dev`
Expected: abrir `http://localhost:8080`, la grilla de "Canales por Día de la Semana" en el formulario sigue mostrando todas las filas (comportamiento sin cambios porque `CommunicationForm` todavía no pasa `canales`, usa el default).

Run: `npm run lint`
Expected: sin errores nuevos respecto al baseline de 4 preexistentes (ver Global Constraints).

- [ ] **Step 3: Commit**

```bash
git add src/components/ChannelDayGrid.tsx
git commit -m "feat(form): permitir filtrar que canales muestra la grilla canal-dia"
```

---

### Task 5: `CommunicationForm` — combobox de Área/Responsable y selector de canales

**Files:**
- Modify: `src/components/CommunicationForm.tsx`

**Interfaces:**
- Consumes: `Combobox` (Task 2), `areasDisponibles`/`responsablesDisponibles` (Task 1), `canales` prop de `ChannelDayGrid` (Task 4).
- Produces: nuevas props opcionales en `CommunicationFormProps`: `initialArea?: string`, `initialResponsable?: string` (default `""` cada una — quedan opcionales en esta tarea para no romper el `Index.tsx` actual hasta Task 6). Consumido por `Index.tsx` en Task 6.

- [ ] **Step 1: Agregar props `initialArea`/`initialResponsable` y usarlas para inicializar el form**

En `src/components/CommunicationForm.tsx`, cambiar la interfaz y la firma del componente (líneas 17-21):

```tsx
interface CommunicationFormProps {
  onAddCommunication: (communication: Communication) => void;
  initialArea?: string;
  initialResponsable?: string;
}

export const CommunicationForm = ({
  onAddCommunication,
  initialArea = "",
  initialResponsable = "",
}: CommunicationFormProps) => {
  const [formData, setFormData] = useState({
    area: initialArea,
    responsable: initialResponsable,
    campana: "",
    proceso: "",
    subCampana: "",
    subCampana2: "",
    segmento: "",
    ciclo: "",
  });
```

- [ ] **Step 2: Reemplazar los `Input` de Área y Responsable por `Combobox`**

Agregar el import: `import { Combobox } from "@/components/ui/combobox";` y `import { Communication, diasSemana, canalesDisponibles, areasDisponibles, responsablesDisponibles } from "@/types/communication";` (extiende el import existente de la línea 13).

Reemplazar el bloque de Área (líneas 103-111):

```tsx
<div className="space-y-2">
  <Label htmlFor="area">Área</Label>
  <Combobox
    value={formData.area}
    onChange={(v) => handleInputChange("area", v)}
    options={areasDisponibles}
    placeholder="Seleccionar área"
  />
</div>
```

Reemplazar el bloque de Responsable (líneas 113-121):

```tsx
<div className="space-y-2">
  <Label htmlFor="responsable">Responsable</Label>
  <Combobox
    value={formData.responsable}
    onChange={(v) => handleInputChange("responsable", v)}
    options={responsablesDisponibles}
    placeholder="Seleccionar responsable"
  />
</div>
```

- [ ] **Step 3: Agregar el selector de canales (checkboxes) y conectarlo a la grilla**

Agregar el import: `import { Checkbox } from "@/components/ui/checkbox";` (ya está importado en la línea 8 — verificar que siga ahí, no duplicar).

Agregar el estado y el handler después de `canalesPorDia` (después de la línea 41):

```tsx
const [canalesSeleccionados, setCanalesSeleccionados] = useState<string[]>([]);

const toggleCanalSeleccionado = (canal: string) => {
  setCanalesSeleccionados((prev) => {
    const yaEstaba = prev.includes(canal);
    if (yaEstaba) {
      setCanalesPorDia((prevDias) => {
        const next: { [key: string]: string[] } = {};
        for (const dia of Object.keys(prevDias)) {
          next[dia] = prevDias[dia].filter((c) => c !== canal);
        }
        return next;
      });
      return prev.filter((c) => c !== canal);
    }
    return [...prev, canal];
  });
};
```

Reemplazar el bloque de la grilla (líneas 218-230) por el selector de canales + la grilla filtrada:

```tsx
<div className="space-y-3">
  <Label className="text-base">Canales a usar en esta comunicación *</Label>
  <p className="text-sm text-muted-foreground">
    Elegí qué canales aplican para esta comunicación, así la grilla de abajo no muestra los que no usás
  </p>
  <div className="flex flex-wrap gap-3">
    {canalesDisponibles.map((canal) => (
      <div key={canal} className="flex items-center gap-2">
        <Checkbox
          id={`canal-${canal}`}
          checked={canalesSeleccionados.includes(canal)}
          onCheckedChange={() => toggleCanalSeleccionado(canal)}
        />
        <Label htmlFor={`canal-${canal}`} className="font-normal cursor-pointer">
          {canal}
        </Label>
      </div>
    ))}
  </div>
</div>

<div className="space-y-3">
  <Label className="text-base">Canales por Día de la Semana *</Label>
  <p className="text-sm text-muted-foreground">Selecciona qué canales se usarán en cada día específico</p>
  <div className="mt-2">
    {/* Usar la cuadrícula de canales vs días. Controlamos su valor con `canalesPorDia`. */}
    <ChannelDayGrid
      value={canalesPorDia}
      onChange={(next) => setCanalesPorDia(next)}
      canales={canalesSeleccionados}
      cellWidth="w-16"
      cellHeight="h-8"
    />
  </div>
</div>
```

- [ ] **Step 4: Verificación manual end-to-end del formulario**

Run: `npm run dev`
Expected, en `http://localhost:8080`:
1. Área y Responsable son comboboxes: al abrirlos no hay opciones fijas todavía (listas vacías por diseño), pero escribir un texto y click en `Usar "texto"` lo setea como valor.
2. La sección "Canales a usar en esta comunicación" muestra los 13 canales como checkboxes, todos destildados al inicio.
3. La grilla de abajo arranca con el mensaje "Seleccioná al menos un canal arriba para habilitar la grilla."
4. Tildar 2-3 canales hace que la grilla muestre solo esas filas.
5. Destildar un canal que tenía celdas marcadas en la grilla lo saca de la grilla Y borra esas celdas de `canalesPorDia` (se puede verificar re-tildándolo: vuelve vacío, no con la selección vieja).
6. Enviar el formulario sin canales seleccionados muestra el toast de error existente ("Asigna al menos un canal a un día de la semana").

Run: `npm run lint`
Expected: sin errores nuevos respecto al baseline de 4 preexistentes (ver Global Constraints).

- [ ] **Step 5: Commit**

```bash
git add src/components/CommunicationForm.tsx
git commit -m "feat(form): combobox de area/responsable y selector de canales por comunicacion"
```

---

### Task 6: Gatear el formulario con `SessionSetup` en `Index.tsx`

**Files:**
- Modify: `src/pages/Index.tsx`

**Interfaces:**
- Consumes: `SessionSetup`, `SessionInfo` (Task 3), `initialArea`/`initialResponsable` props de `CommunicationForm` (Task 5).

- [ ] **Step 1: Agregar el estado de sesión y el render condicional**

Agregar el import (después de la línea 3): `import { SessionSetup, SessionInfo } from "@/components/SessionSetup";`

Agregar el estado, después de la línea 12 (`const [communications, setCommunications] = useState<Communication[]>([]);`):

```tsx
const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);
```

Reemplazar la línea 71 (`<CommunicationForm onAddCommunication={handleAddCommunication} />`) por:

```tsx
{sessionInfo ? (
  <CommunicationForm
    onAddCommunication={handleAddCommunication}
    initialArea={sessionInfo.area}
    initialResponsable={sessionInfo.responsable}
  />
) : (
  <SessionSetup onComplete={setSessionInfo} />
)}
```

- [ ] **Step 2: Verificación manual end-to-end de la app completa**

Run: `npm run dev`
Expected, en `http://localhost:8080`:
1. Al cargar la página, se ve la card "Antes de empezar" en vez del formulario de comunicación.
2. El botón "Continuar" está deshabilitado hasta completar Área y Responsable (usando "Usar «texto»" en el combobox, dado que las listas fijas arrancan vacías).
3. Al hacer click en "Continuar", aparece el formulario de comunicación con Área y Responsable ya precargados con lo elegido.
4. Cambiar el Área en el formulario de una comunicación puntual no rompe nada (el combobox sigue editable).
5. Las tabs de Cronograma/Lista siguen funcionando igual que antes.

Run: `npm run lint`
Expected: sin errores nuevos respecto al baseline de 4 preexistentes (ver Global Constraints).

- [ ] **Step 3: Commit**

```bash
git add src/pages/Index.tsx
git commit -m "feat(form): gatear el alta de comunicaciones con paso previo de area y responsable"
```

---

## Self-Review Notes

- **Cobertura del spec:** paso previo con Área/Responsable en dropdown → Tasks 1, 3, 6. Autocompletado editable en el registro → Task 5 Step 1-2. Filtro de canales en la grilla → Tasks 1 (canales nuevos), 4, 5 Step 3. Lista fija + texto libre → Task 2 (Combobox). Sesión única (no wizard por alta) → Task 6.
- **Placeholders:** ninguno — el único contenido "vacío" (`areasDisponibles`/`responsablesDisponibles`) es una decisión explícita del usuario, no un TBD de la implementación; el resto del código de cada task está completo y es pegable tal cual.
- **Consistencia de tipos:** `SessionInfo { area, responsable }` (Task 3) coincide exactamente con las props `initialArea`/`initialResponsable` que Task 5 agrega y Task 6 pasa. `ComboboxProps` (Task 2) se usa igual en Task 3 y Task 5. `ChannelDayGridProps.canales` (Task 4) coincide con el `canalesSeleccionados: string[]` que Task 5 le pasa.
