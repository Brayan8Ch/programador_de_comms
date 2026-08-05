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
