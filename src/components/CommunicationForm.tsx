import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Combobox } from "@/components/ui/combobox";
import ChannelDayGrid from "@/components/ChannelDayGrid";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";
import { CalendarIcon, Plus } from "lucide-react";
import {
  Communication,
  diasSemana,
  canalesDisponibles,
  areasDisponibles,
  responsablesDisponibles,
} from "@/types/communication";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [canalesPorDia, setCanalesPorDia] = useState<{ [key: string]: string[] }>({
    LU: [],
    MA: [],
    MI: [],
    JU: [],
    VI: [],
    SA: [],
    DO: [],
  });

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


  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCanalToggle = (dia: string, canal: string) => {
    setCanalesPorDia((prev) => {
      const canalesActuales = prev[dia] || [];
      const yaExiste = canalesActuales.includes(canal);

      return {
        ...prev,
        [dia]: yaExiste
          ? canalesActuales.filter((c) => c !== canal)
          : [...canalesActuales, canal],
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.campana || !dateRange?.from || !dateRange?.to) {
      toast.error("Por favor completa los campos obligatorios (Campaña, Fechas)");
      return;
    }

    if (dateRange.to < dateRange.from) {
      toast.error("La fecha de fin no puede ser anterior a la fecha de inicio");
      return;
    }

    // Verificar que al menos un día tenga canales asignados
    const hayCanales = Object.values(canalesPorDia).some((canales) => canales.length > 0);
    if (!hayCanales) {
      toast.error("Asigna al menos un canal a un día de la semana");
      return;
    }

    const newCommunication: Communication = {
      id: Date.now().toString(),
      ...formData,
      fechaInicio: dateRange.from,
      fechaFin: dateRange.to,
      canalesPorDia,
    };

    onAddCommunication(newCommunication);
    toast.success("Comunicación agregada exitosamente");
    // NOTE: Do not reset the form fields so the user keeps the inputs after adding a communication.
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nueva Comunicación</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="area">Área</Label>
              <Combobox
                value={formData.area}
                onChange={(v) => handleInputChange("area", v)}
                options={areasDisponibles}
                placeholder="Seleccionar área"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="responsable">Responsable</Label>
              <Combobox
                value={formData.responsable}
                onChange={(v) => handleInputChange("responsable", v)}
                options={responsablesDisponibles}
                placeholder="Seleccionar responsable"
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

          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            </div>
          </div>

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

          <Button type="submit" className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Agregar Comunicación
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
