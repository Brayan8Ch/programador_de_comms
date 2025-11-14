import { useMemo } from "react";
import { Communication } from "@/types/communication";
import { format, eachDayOfInterval, getDay } from "date-fns";
import { es } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Copy } from "lucide-react";
import { exportToExcel, copyToClipboard } from "@/utils/excelExport";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DndContext, closestCenter, DragEndEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

interface ScheduleViewProps {
  communications: Communication[];
  onReorder: (newOrder: Communication[]) => void;
}

interface SortableRowProps {
  comm: Communication;
  days: Date[];
  dayAbbreviations: string[];
}

const SortableRow = ({ comm, days, dayAbbreviations }: SortableRowProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: comm.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const isCommunicationActive = (comm: Communication, date: Date) => {
    const isInRange = date >= comm.fechaInicio && date <= comm.fechaFin;
    if (!isInRange) return { active: false, canales: [] };

    const dayOfWeek = getDay(date);
    const dayAbbr = dayAbbreviations[dayOfWeek];
    const canales = comm.canalesPorDia[dayAbbr] || [];
    
    return { active: canales.length > 0, canales };
  };

  // Obtener lista única de canales usados en esta comunicación (mantener orden consistente)
  const canalesUnicos = Array.from(
    new Set(Object.values(comm.canalesPorDia).flat())
  );

  // Si no hay canales, mostrar una fila vacía para mantener estructura
  const filasCanales = canalesUnicos.length > 0 ? canalesUnicos : ["(sin canal)"];

  return (
    <div ref={setNodeRef} style={style} className="border-b">
      <div className="sticky left-0 bg-card z-10 p-3 border-r w-[300px] flex items-start gap-2">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing hover:text-primary pt-1"
        >
          <GripVertical className="h-4 w-4" />
        </div>
        <div>
          <div className="text-sm font-medium">{comm.campana}</div>
          <div className="text-xs text-muted-foreground">
            {comm.area && <span>{comm.area} • </span>}
            {comm.responsable}
          </div>
          {comm.subCampana && (
            <div className="text-xs text-muted-foreground">{comm.subCampana}</div>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <div
          className="min-w-max"
          style={{ display: "grid", gridTemplateColumns: `repeat(${days.length}, 40px)`, gap: 0 }}
        >
          {filasCanales.map((canal) => (
            <>
              {days.map((day, idx) => {
                const dow = getDay(day);
                const dayAbbr = dayAbbreviations[dow];
                const canalesDia = comm.canalesPorDia[dayAbbr] || [];
                const activo = canalesDia.includes(canal);

                return (
                  <div
                    key={`${comm.id}-${canal}-${idx}`}
                    className={`w-10 h-8 border-r flex items-center justify-center ${activo ? "bg-sky-500" : "bg-transparent"}`}
                    title={activo ? canal : ""}
                  >
                    {activo ? <span className="text-white text-[11px]">&nbsp;</span> : null}
                  </div>
                );
              })}
            </>
          ))}
        </div>
      </div>
    </div>
  );
};

export const ScheduleView = ({ communications, onReorder }: ScheduleViewProps) => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const dateRange = useMemo(() => {
    if (communications.length === 0) return null;

    const allDates = communications.flatMap((comm) => [comm.fechaInicio, comm.fechaFin]);
    const minDate = new Date(Math.min(...allDates.map((d) => d.getTime())));
    const maxDate = new Date(Math.max(...allDates.map((d) => d.getTime())));

    return { start: minDate, end: maxDate };
  }, [communications]);

  const days = useMemo(() => {
    if (!dateRange) return [];
    return eachDayOfInterval({ start: dateRange.start, end: dateRange.end });
  }, [dateRange]);

  const dayAbbreviations = ["DO", "LU", "MA", "MI", "JU", "VI", "SA"];

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = communications.findIndex((c) => c.id === active.id);
      const newIndex = communications.findIndex((c) => c.id === over.id);

      const newOrder = [...communications];
      const [movedItem] = newOrder.splice(oldIndex, 1);
      newOrder.splice(newIndex, 0, movedItem);

      onReorder(newOrder);
    }
  };

  if (communications.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cronograma de Comunicaciones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            No hay comunicaciones programadas. Agrega una para comenzar.
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleExport = () => {
    try {
      exportToExcel(communications);
      toast.success("Excel exportado exitosamente");
    } catch (error) {
      console.error(error);
      toast.error("Error al exportar Excel");
    }
  };

  const handleCopy = async () => {
    try {
      await copyToClipboard(communications);
      toast.success("Comunicaciones copiadas al portapapeles");
    } catch (err) {
      console.error(err);
      toast.error("Error al copiar al portapapeles");
    }
  };

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <div>
          <CardTitle>Cronograma de Comunicaciones</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Arrastra las filas para reorganizar. Pasa el cursor sobre las celdas para ver los canales.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleCopy} variant="outline" size="sm">
            <Copy className="mr-2 h-4 w-4" />
            Copiar
          </Button>
          <Button onClick={handleExport} variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Exportar Excel
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="w-full">
          <div className="min-w-max">
            <div className="grid grid-cols-[300px_repeat(auto-fill,40px)] border-b">
              <div className="sticky left-0 bg-card z-10 p-3 border-r font-semibold text-schedule-header">
                Comunicación
              </div>
              {days.map((day, index) => (
                <div
                  key={index}
                  className="text-center p-2 text-xs font-medium border-r text-schedule-header"
                >
                  <div>{format(day, "EEE", { locale: es }).toUpperCase()}</div>
                  <div className="text-[10px]">{format(day, "dd")}</div>
                </div>
              ))}
            </div>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={communications.map((c) => c.id)}
                strategy={verticalListSortingStrategy}
              >
                {communications.map((comm) => (
                  <SortableRow
                    key={comm.id}
                    comm={comm}
                    days={days}
                    dayAbbreviations={dayAbbreviations}
                  />
                ))}
              </SortableContext>
            </DndContext>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
