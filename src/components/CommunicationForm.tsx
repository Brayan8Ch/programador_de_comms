import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, Plus } from "lucide-react";
import { Communication, diasSemana, canalesDisponibles } from "@/types/communication";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface CommunicationFormProps {
  onAddCommunication: (communication: Communication) => void;
}

export const CommunicationForm = ({ onAddCommunication }: CommunicationFormProps) => {
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

    // Reset form
    setFormData({
      area: "",
      responsable: "",
      campana: "",
      proceso: "",
      subCampana: "",
      subCampana2: "",
      segmento: "",
      ciclo: "",
    });
    setFechaInicio(undefined);
    setFechaFin(undefined);
    setCanalesPorDia({
      LU: [],
      MA: [],
      MI: [],
      JU: [],
      VI: [],
      SA: [],
      DO: [],
    });
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
            <p className="text-sm text-muted-foreground">
              Selecciona qué canales se usarán en cada día específico
            </p>
            <div className="space-y-4 border rounded-lg p-4 bg-muted/30">
              {diasSemana.map((dia) => (
                <div key={dia.value} className="space-y-2">
                  <div className="font-medium text-sm">{dia.label}</div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 pl-4">
                    {canalesDisponibles.map((canal) => (
                      <div key={`${dia.value}-${canal}`} className="flex items-center space-x-2">
                        <Checkbox
                          id={`${dia.value}-${canal}`}
                          checked={canalesPorDia[dia.value]?.includes(canal) || false}
                          onCheckedChange={() => handleCanalToggle(dia.value, canal)}
                        />
                        <Label
                          htmlFor={`${dia.value}-${canal}`}
                          className="cursor-pointer text-xs leading-tight"
                        >
                          {canal}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
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
