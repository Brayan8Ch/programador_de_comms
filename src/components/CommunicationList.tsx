import { Communication } from "@/types/communication";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Download, GripVertical, Copy, Pencil } from "lucide-react";
import { format, eachDayOfInterval, getDay } from "date-fns";
import { es } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { exportToExcel, copyToClipboard } from "@/utils/excelExport";
import { DndContext, closestCenter, DragEndEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { toast } from "sonner";

interface CommunicationListProps {
  communications: Communication[];
  onDelete: (id: string) => void;
  onReorder: (newOrder: Communication[]) => void;
  onEdit?: (comm: Communication) => void;
}

interface SortableItemProps {
  comm: Communication;
  onDelete: (id: string) => void;
  onEdit?: (comm: Communication) => void;
}

const SortableItem = ({ comm, onDelete, onEdit }: SortableItemProps) => {
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

  // Obtener todos los canales únicos usados
  const todosLosCanales = Array.from(
    new Set(Object.values(comm.canalesPorDia).flat())
  );

  // Obtener días activos
  const diasActivos = Object.entries(comm.canalesPorDia)
    .filter(([_, canales]) => canales.length > 0)
    .map(([dia, _]) => dia);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-start gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing hover:text-primary pt-1"
      >
        <GripVertical className="h-5 w-5" />
      </div>
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold">{comm.campana}</h3>
          {todosLosCanales.slice(0, 2).map((canal) => (
            <Badge key={canal} variant="secondary">
              {canal}
            </Badge>
          ))}
          {todosLosCanales.length > 2 && (
            <Badge variant="outline">+{todosLosCanales.length - 2} más</Badge>
          )}
        </div>
        <div className="text-sm text-muted-foreground grid grid-cols-2 gap-2">
          {comm.area && <div>Área: {comm.area}</div>}
          {comm.responsable && <div>Responsable: {comm.responsable}</div>}
          {comm.proceso && <div>Proceso: {comm.proceso}</div>}
          {comm.subCampana && <div>Sub-Campaña 1: {comm.subCampana}</div>}
          {comm.subCampana2 && <div>Sub-Campaña 2: {comm.subCampana2}</div>}
          {comm.segmento && <div>Segmento: {comm.segmento}</div>}
          {comm.ciclo && <div>Ciclo: {comm.ciclo}</div>}
        </div>
        <div className="text-sm">
          <span className="font-medium">Período:</span>{" "}
          {format(comm.fechaInicio, "dd/MM/yyyy", { locale: es })} -{" "}
          {format(comm.fechaFin, "dd/MM/yyyy", { locale: es })}
        </div>
        <div className="flex gap-1 flex-wrap">
          {diasActivos.map((dia) => (
            <Badge key={dia} variant="outline" className="text-xs">
              {dia}
            </Badge>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={async () => {
            const ok = await copySingleCommunication(comm);
            if (ok) toast.success("Comunicación copiada al portapapeles");
            else toast.error("Error al copiar comunicación");
          }}
          className="hover:text-primary"
        >
          <Copy className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(comm.id)}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      {onEdit && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onEdit(comm)}
          className="hover:text-primary"
        >
          <Pencil className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

const copySingleCommunication = async (comm: Communication) => {
  try {
    const dayAbbreviations = ["DO", "LU", "MA", "MI", "JU", "VI", "SA"];
    const rows: string[] = [];
    /*
    const headers = [
      "Área",
      "Responsable",
      "Campaña",
      "Proceso",
      "Sub-Campaña",
      "Sub-Campaña2",
      "Segmento",
      "Canal",
      "Ciclo",
      "Fecha",
    ];
    rows.push(headers.join("\t"));
    */


    const days = eachDayOfInterval({ start: comm.fechaInicio, end: comm.fechaFin });
    days.forEach((day) => {
      const dayOfWeek = getDay(day);
      const dayAbbr = dayAbbreviations[dayOfWeek];
      const canalesDelDia = comm.canalesPorDia[dayAbbr] || [];
      canalesDelDia.forEach((canal) => {
        const row = [
          comm.area || "",
          comm.responsable || "",
          comm.campana,
          comm.proceso || "",
          comm.subCampana || "",
          comm.subCampana2 || "",
          comm.segmento || "",
          canal,
          comm.ciclo || "",
          format(day, "dd/MM/yyyy", { locale: es }),
        ];
        rows.push(row.join("\t"));
      });
    });

    const text = rows.join("\n");
    if (typeof navigator !== "undefined" && navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    const el = document.createElement("textarea");
    el.value = text;
    el.setAttribute("readonly", "");
    el.style.position = "absolute";
    el.style.left = "-9999px";
    document.body.appendChild(el);
    el.select();
    try {
      document.execCommand("copy");
    } finally {
      document.body.removeChild(el);
    }
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
};

export const CommunicationList = ({ communications, onDelete, onReorder, onEdit }: CommunicationListProps) => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

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

  const handleExport = () => {
    try {
      exportToExcel(communications);
      toast.success("Excel exportado exitosamente");
    } catch (error) {
      toast.error("Error al exportar Excel");
      console.error(error);
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

  const handleVerify = () => {
    try {
      const dayAbbreviations = ["DO", "LU", "MA", "MI", "JU", "VI", "SA"];
      const rows: Array<{ campana: string; date: string; day: string; canales: string[] }> = [];

      communications.forEach((comm) => {
        // iterate dates in range
        const start = comm.fechaInicio;
        const end = comm.fechaFin;
        const cur = new Date(start.getTime());
        while (cur <= end) {
          const dow = cur.getDay();
          const dayAbbr = dayAbbreviations[dow];
          const canales = comm.canalesPorDia[dayAbbr] || [];
          rows.push({ campana: comm.campana, date: cur.toISOString().split("T")[0], day: dayAbbr, canales });
          cur.setDate(cur.getDate() + 1);
        }
      });

      console.group("Verificación de comunicaciones (por fecha)");
      console.table(rows);
      console.groupEnd();
      toast.success("Resumen de comunicaciones volcado en la consola (devtools)");
    } catch (err) {
      console.error(err);
      toast.error("Error durante la verificación");
    }
  };

  if (communications.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>Comunicaciones Programadas ({communications.length})</CardTitle>
        <div className="flex gap-2">
          <Button onClick={handleCopy} variant="outline" size="sm">
            <Copy className="mr-2 h-4 w-4" />
            Copiar
          </Button>
          <Button onClick={handleVerify} variant="outline" size="sm">
            Verificar
          </Button>
          <Button onClick={handleExport} variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Exportar Excel
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Arrastra las comunicaciones para reorganizarlas
        </p>
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
              <SortableItem key={comm.id} comm={comm} onDelete={onDelete} />
            ))}
          </SortableContext>
        </DndContext>
      </CardContent>
    </Card>
  );
};
