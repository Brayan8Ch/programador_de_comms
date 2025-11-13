import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
    campana: "",
    proceso: "",
    subCampana: "",
    subCampana2: "",
    segmento: "",
    canal: "",
    ciclo: "",
  });
  const [fechaInicio, setFechaInicio] = useState<Date | undefined>(undefined);
  const [fechaFin, setFechaFin] = useState<Date | undefined>(undefined);
  const [frecuencia, setFrecuencia] = useState<string[]>([]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFrecuenciaToggle = (dia: string) => {
    setFrecuencia((prev) =>
      prev.includes(dia) ? prev.filter((d) => d !== dia) : [...prev, dia]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.campana || !formData.canal || !fechaInicio || !fechaFin) {
      toast.error("Por favor completa los campos obligatorios");
      return;
    }

    if (frecuencia.length === 0) {
      toast.error("Selecciona al menos un día de frecuencia");
      return;
    }

    const newCommunication: Communication = {
      id: Date.now().toString(),
      ...formData,
      fechaInicio,
      fechaFin,
      frecuencia,
    };

    onAddCommunication(newCommunication);
    toast.success("Comunicación agregada exitosamente");

    // Reset form
    setFormData({
      campana: "",
      proceso: "",
      subCampana: "",
      subCampana2: "",
      segmento: "",
      canal: "",
      ciclo: "",
    });
    setFechaInicio(undefined);
    setFechaFin(undefined);
    setFrecuencia([]);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nueva Comunicación</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <Label htmlFor="canal">Canal *</Label>
              <Select value={formData.canal} onValueChange={(value) => handleInputChange("canal", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar canal" />
                </SelectTrigger>
                <SelectContent>
                  {canalesDisponibles.map((canal) => (
                    <SelectItem key={canal} value={canal}>
                      {canal}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                    disabled={(date) => fechaInicio ? date < fechaInicio : false}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Frecuencia (Días de envío) *</Label>
            <div className="flex flex-wrap gap-4">
              {diasSemana.map((dia) => (
                <div key={dia.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={dia.value}
                    checked={frecuencia.includes(dia.value)}
                    onCheckedChange={() => handleFrecuenciaToggle(dia.value)}
                  />
                  <Label htmlFor={dia.value} className="cursor-pointer">
                    {dia.label}
                  </Label>
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
