import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import ChannelDayGrid from "@/components/ChannelDayGrid";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, Plus } from "lucide-react";
import Switch from "@mui/material/Switch";
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
      return localStorage.getItem("theme") === "dark";
    } catch {
      return false;
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
  const [fechaInicio, setFechaInicio] = useState<Date | undefined>(undefined);
  const [fechaFin, setFechaFin] = useState<Date | undefined>(undefined);
  const [canalesPorDia, setCanalesPorDia] = useState<{ [key: string]: string[] }>({
    LU: [],
    MA: [],
    MI: [],
    JU: [],
    VI: [],
    SA: [],
    DO: [],
  });

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

    if (!formData.campana || !fechaInicio || !fechaFin) {
      toast.error("Por favor completa los campos obligatorios (Campaña, Fechas)");
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
      fechaInicio,
      fechaFin,
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
          <Switch checked={isDark} onChange={() => toggleTheme()} size="small" color="primary" inputProps={{ 'aria-label': 'Toggle theme' }} />
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <div className="space-y-2">
              <Label htmlFor="responsable">Responsable</Label>
              <div className="relative">
                <Input
                  id="responsable"
                  value={formData.responsable}
                  onChange={(e) => handleInputChange("responsable", e.target.value)}
                  placeholder="Ej: Juan Pérez"
                  disabled={!!locks.responsable}
                  className="pr-10"
                />
                <div className="absolute inset-y-0 right-2 flex items-center">
                  <Switch checked={!!locks.responsable} onChange={() => toggleLock("responsable")} size="small" color="primary" inputProps={{ 'aria-label': 'Bloquear responsable' }} />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="campana">Campaña *</Label>
              <div className="relative">
                <Input
                  id="campana"
                  value={formData.campana}
                  onChange={(e) => handleInputChange("campana", e.target.value)}
                  placeholder="Ej: Pronto Pago"
                  disabled={!!locks.campana}
                  className="pr-10"
                />
                <div className="absolute inset-y-0 right-2 flex items-center">
                  <Switch checked={!!locks.campana} onChange={() => toggleLock("campana")} size="small" color="primary" inputProps={{ 'aria-label': 'Bloquear campana' }} />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="proceso">Proceso</Label>
              <div className="relative">
                <Input
                  id="proceso"
                  value={formData.proceso}
                  onChange={(e) => handleInputChange("proceso", e.target.value)}
                  placeholder="Ej: Cobranza"
                  disabled={!!locks.proceso}
                  className="pr-10"
                />
                <div className="absolute inset-y-0 right-2 flex items-center">
                  <Switch checked={!!locks.proceso} onChange={() => toggleLock("proceso")} size="small" color="primary" inputProps={{ 'aria-label': 'Bloquear proceso' }} />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subCampana">Sub-Campaña 1</Label>
              <div className="relative">
                <Input
                  id="subCampana"
                  value={formData.subCampana}
                  onChange={(e) => handleInputChange("subCampana", e.target.value)}
                  placeholder="Ej: C1"
                  disabled={!!locks.subCampana}
                  className="pr-10"
                />
                <div className="absolute inset-y-0 right-2 flex items-center">
                  <Switch checked={!!locks.subCampana} onChange={() => toggleLock("subCampana")} size="small" color="primary" inputProps={{ 'aria-label': 'Bloquear subCampana' }} />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subCampana2">Sub-Campaña 2</Label>
              <div className="relative">
                <Input
                  id="subCampana2"
                  value={formData.subCampana2}
                  onChange={(e) => handleInputChange("subCampana2", e.target.value)}
                  placeholder="Ej: Último día"
                  disabled={!!locks.subCampana2}
                  className="pr-10"
                />
                <div className="absolute inset-y-0 right-2 flex items-center">
                  <Switch checked={!!locks.subCampana2} onChange={() => toggleLock("subCampana2")} size="small" color="primary" inputProps={{ 'aria-label': 'Bloquear subCampana2' }} />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="segmento">Segmento</Label>
              <div className="relative">
                <Input
                  id="segmento"
                  value={formData.segmento}
                  onChange={(e) => handleInputChange("segmento", e.target.value)}
                  placeholder="Ej: Premium"
                  disabled={!!locks.segmento}
                  className="pr-10"
                />
                <div className="absolute inset-y-0 right-2 flex items-center">
                  <Switch checked={!!locks.segmento} onChange={() => toggleLock("segmento")} size="small" color="primary" inputProps={{ 'aria-label': 'Bloquear segmento' }} />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ciclo">Ciclo</Label>
              <div className="relative">
                <Input
                  id="ciclo"
                  value={formData.ciclo}
                  onChange={(e) => handleInputChange("ciclo", e.target.value)}
                  placeholder="Ej: 02"
                  disabled={!!locks.ciclo}
                  className="pr-10"
                />
                <div className="absolute inset-y-0 right-2 flex items-center">
                  <Switch checked={!!locks.ciclo} onChange={() => toggleLock("ciclo")} size="small" color="primary" inputProps={{ 'aria-label': 'Bloquear ciclo' }} />
                </div>
              </div>
            </div>
          </div>

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
