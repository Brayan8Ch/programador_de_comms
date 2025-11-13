import { useMemo } from "react";
import { Communication } from "@/types/communication";
import { format, eachDayOfInterval, isSameDay, getDay } from "date-fns";
import { es } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ScheduleViewProps {
  communications: Communication[];
}

export const ScheduleView = ({ communications }: ScheduleViewProps) => {
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

  const isCommunicationActive = (comm: Communication, date: Date) => {
    const isInRange = date >= comm.fechaInicio && date <= comm.fechaFin;
    if (!isInRange) return false;

    const dayOfWeek = getDay(date);
    const dayAbbr = dayAbbreviations[dayOfWeek];
    return comm.frecuencia.includes(dayAbbr);
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cronograma de Comunicaciones</CardTitle>
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

            <div>
              {communications.map((comm) => (
                <div
                  key={comm.id}
                  className="grid grid-cols-[300px_repeat(auto-fill,40px)] border-b hover:bg-schedule-row-hover transition-colors"
                >
                  <div className="sticky left-0 bg-card z-10 p-3 border-r">
                    <div className="text-sm font-medium">{comm.campana}</div>
                    <div className="text-xs text-muted-foreground">{comm.canal}</div>
                    {comm.subCampana && (
                      <div className="text-xs text-muted-foreground">{comm.subCampana}</div>
                    )}
                  </div>
                  {days.map((day, index) => (
                    <div
                      key={index}
                      className={`border-r p-1 ${
                        isCommunicationActive(comm, day)
                          ? "bg-schedule-cell"
                          : ""
                      }`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
