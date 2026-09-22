import { Communication } from "@/types/communication";
import { differenceInCalendarDays, differenceInCalendarWeeks, getDay } from "date-fns";

// Indexado por getDay() (domingo = 0), NO por el orden de `diasSemana`.
const dayAbbreviations = ["DO", "LU", "MA", "MI", "JU", "VI", "SA"];

/**
 * Canales activos de una comunicación en una fecha concreta.
 * Devuelve [] si la fecha cae fuera del rango o en una semana omitida.
 * Las semanas se cuentan como semanas calendario (lunes) desde la semana de `fechaInicio`.
 */
export const canalesEnFecha = (comm: Communication, date: Date): string[] => {
  if (differenceInCalendarDays(date, comm.fechaInicio) < 0) return [];
  if (differenceInCalendarDays(date, comm.fechaFin) > 0) return [];

  const cada = comm.cadaNSemanas ?? 1;
  if (differenceInCalendarWeeks(date, comm.fechaInicio, { weekStartsOn: 1 }) % cada !== 0) return [];

  return comm.canalesPorDia[dayAbbreviations[getDay(date)]] ?? [];
};
