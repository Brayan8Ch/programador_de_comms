import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import ChannelDayGrid from "@/components/ChannelDayGrid";
import { format, parse, isValid } from "date-fns";
import type { DateRange } from "react-day-picker";
import { CalendarIcon, Plus } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Communication, diasSemana, canalesDisponibles } from "@/types/communication";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface CommunicationFormProps {
  onAddCommunication: (communication: Communication) => void;
}

export const CommunicationForm = ({ onAddCommunication }: CommunicationFormProps) => {
  // Theme state
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem("theme");
      return stored ? stored === "dark" : true;
    } catch {
      return true;
    }
  });

  useEffect(() => {
    try {
      if (isDark) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("theme", "light");
      }
    } catch (e) {
      // ignore
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark((v) => !v);
  const [formData, setFormData] = useState({
    area: "",
    responsable: "",
    campana: "",
    proceso: "",
    subCampana: "",
    subCampana2: "",
    segmento: "",
    ciclo: "",
  });
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
  const [canalesPorDia, setCanalesPorDia] = useState<{ [key: string]: string[] }>({
    LU: [],
    MA: [],
    MI: [],
    JU: [],
    VI: [],
    SA: [],
    DO: [],
  });


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
      <CardHeader className="flex items-center justify-between">
        <CardTitle>Nueva Comunicación</CardTitle>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Tema oscuro</span>
          <Switch checked={isDark} onCheckedChange={toggleTheme} aria-label="Alternar tema oscuro" />
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="area">Área</Label>
              <Input
                id="area"
                value={formData.area}
                onChange={(e) => handleInputChange("area", e.target.value)}
                placeholder="Ej: Marketing"
              />
            </div>

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

          <div className="space-y-3">
            <Label className="text-base">Canales por Día de la Semana *</Label>
            <p className="text-sm text-muted-foreground">Selecciona qué canales se usarán en cada día específico</p>
            <div className="mt-2">
              {/* Usar la cuadrícula de canales vs días. Controlamos su valor con `canalesPorDia`. */}
              <ChannelDayGrid
                value={canalesPorDia}
                onChange={(next) => setCanalesPorDia(next)}
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
