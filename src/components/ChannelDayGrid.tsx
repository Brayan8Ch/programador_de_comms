import React, { useMemo, useState, useEffect } from "react";
import { diasSemana, canalesDisponibles } from "@/types/communication";

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
  // Estado interno si no es controlado
  const initialSelected = useMemo(() => {
    const map: Record<string, Set<string>> = {};
    for (const d of diasSemana) map[d.value] = new Set<string>();
    if (value) {
      for (const [dia, canalesDelDia] of Object.entries(value)) {
        map[dia] = new Set(canalesDelDia || []);
      }
    }
    return map;
  }, [value]);

  const [selected, setSelected] = useState<Record<string, Set<string>>>(() => {
    const clone: Record<string, Set<string>> = {};
    for (const dia of Object.keys(initialSelected)) clone[dia] = new Set(initialSelected[dia]);
    return clone;
  });

  // Si es controlado por `value`, sincronizar el estado interno cuando `value` cambie
  useEffect(() => {
    if (value) {
      const clone: Record<string, Set<string>> = {};
      for (const d of diasSemana) clone[d.value] = new Set(value[d.value] || []);
      setSelected(clone);
    }
  }, [value]);

  const [lastClicked, setLastClicked] = useState<{ dia: string; canal: string } | null>(null);

  const toggleCell = (e: React.MouseEvent, dia: string, canal: string) => {
    const isShift = e.shiftKey;
    const isAlt = e.altKey;
    const isCtrl = e.ctrlKey || e.metaKey;

    const next: Record<string, Set<string>> = {};
    for (const k of Object.keys(selected)) next[k] = new Set(selected[k]);

    // ALT: toggle entire row (canal) across all days
    if (isAlt) {
      const days = Object.keys(next);
      // decide action: if any day for this canal is not selected -> select all, else deselect all
      const anyNotSelected = days.some((d) => !next[d].has(canal));
      for (const d of days) {
        if (anyNotSelected) next[d].add(canal);
        else next[d].delete(canal);
      }
      setSelected(next);
      setLastClicked({ dia, canal });
      if (onChange) {
        const plain: { [key: string]: string[] } = {};
        for (const k of Object.keys(next)) plain[k] = Array.from(next[k]);
        onChange(plain);
      }
      return;
    }

    // SHIFT: select range between lastClicked and current for same canal (across days)
    if (isShift && lastClicked && lastClicked.canal === canal) {
      const days = diasSemana.map((d) => d.value);
      const a = days.indexOf(lastClicked.dia);
      const b = days.indexOf(dia);
      if (a >= 0 && b >= 0) {
        const from = Math.min(a, b);
        const to = Math.max(a, b);
        // if any in range unselected -> select all in range, else deselect all
        const anyNotSelected = days.slice(from, to + 1).some((d) => !next[d].has(canal));
        for (let i = from; i <= to; i++) {
          const d = days[i];
          if (anyNotSelected) next[d].add(canal);
          else next[d].delete(canal);
        }
        setSelected(next);
        setLastClicked({ dia, canal });
        if (onChange) {
          const plain: { [key: string]: string[] } = {};
          for (const k of Object.keys(next)) plain[k] = Array.from(next[k]);
          onChange(plain);
        }
        return;
      }
    }

    // Default or CTRL: toggle single cell. CTRL behaves same but allows multi selection without range.
    if (!next[dia]) next[dia] = new Set<string>();
    const has = next[dia].has(canal);
    if (has) next[dia].delete(canal);
    else next[dia].add(canal);

    setSelected(next);
    setLastClicked({ dia, canal });

    if (onChange) {
      const plain: { [key: string]: string[] } = {};
      for (const k of Object.keys(next)) plain[k] = Array.from(next[k]);
      onChange(plain);
    }
  };

  return (
    <div className="overflow-auto">
      <div className="mb-2 text-sm text-muted-foreground px-2">
        <div>Atajos: <span className="font-semibold">Shift</span> para rango, <span className="font-semibold">Alt</span> para alternar fila completa, <span className="font-semibold">Ctrl/Cmd</span> para multiselección</div>
      </div>
      {canales.length === 0 ? (
        <div className="text-sm text-muted-foreground px-2 py-6 text-center border rounded-lg">
          Seleccioná al menos un canal arriba para habilitar la grilla.
        </div>
      ) : (
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden border rounded-lg">
            <table className="min-w-full table-fixed bg-white dark:bg-gray-800">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="w-48 px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Canal</th>
                  {diasSemana.map((d) => (
                    <th key={d.value} className="px-3 py-3 text-center text-sm font-medium text-gray-600 dark:text-gray-300">
                      <div className="text-xs font-semibold">{d.value}</div>
                      <div className="text-[10px] text-gray-400 dark:text-gray-400">{d.label}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800">
                {canales.map((canal) => (
                  <tr key={canal} className="border-t">
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-200">{canal}</td>
                    {diasSemana.map((d) => {
                      const isSelected = selected[d.value]?.has(canal) ?? false;
                      return (
                        <td key={d.value} className="px-2 py-2 text-center">
                          <button
                            type="button"
                            onClick={(e) => toggleCell(e, d.value, canal)}
                            className={`inline-block ${cellWidth} ${cellHeight} rounded-md transition-all duration-150 cursor-pointer ${isSelected ? 'bg-blue-500 text-white' : 'bg-transparent border border-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                            aria-pressed={isSelected}
                          >
                            <span className="sr-only">{isSelected ? 'Seleccionado' : 'No seleccionado'}</span>
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChannelDayGrid;
