import { Communication } from "@/types/communication";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";

interface CommunicationListProps {
  communications: Communication[];
  onDelete: (id: string) => void;
}

export const CommunicationList = ({ communications, onDelete }: CommunicationListProps) => {
  if (communications.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comunicaciones Programadas ({communications.length})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {communications.map((comm) => (
          <div
            key={comm.id}
            className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{comm.campana}</h3>
                <Badge variant="secondary">{comm.canal}</Badge>
              </div>
              <div className="text-sm text-muted-foreground grid grid-cols-2 gap-2">
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
                {comm.frecuencia.map((dia) => (
                  <Badge key={dia} variant="outline" className="text-xs">
                    {dia}
                  </Badge>
                ))}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(comm.id)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
