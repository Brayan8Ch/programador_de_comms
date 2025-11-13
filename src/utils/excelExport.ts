import * as XLSX from "xlsx";
import { Communication } from "@/types/communication";
import { format, eachDayOfInterval, getDay } from "date-fns";
import { es } from "date-fns/locale";

const dayAbbreviations = ["DO", "LU", "MA", "MI", "JU", "VI", "SA"];

export const exportToExcel = (communications: Communication[]) => {
  const rows: any[] = [];

  communications.forEach((comm) => {
    // Obtener todos los días en el rango
    const days = eachDayOfInterval({
      start: comm.fechaInicio,
      end: comm.fechaFin,
    });

    days.forEach((day) => {
      const dayOfWeek = getDay(day);
      const dayAbbr = dayAbbreviations[dayOfWeek];
      const canalesDelDia = comm.canalesPorDia[dayAbbr] || [];

      // Crear una fila por cada canal activo en ese día
      canalesDelDia.forEach((canal) => {
        rows.push({
          Área: comm.area || "",
          Responsable: comm.responsable || "",
          Campaña: comm.campana,
          Proceso: comm.proceso || "",
          "Sub-Campaña": comm.subCampana || "",
          "Sub-Campaña2": comm.subCampana2 || "",
          Segmento: comm.segmento || "",
          Canal: canal,
          Ciclo: comm.ciclo || "",
          Fecha: format(day, "dd/MM/yyyy", { locale: es }),
        });
      });
    });
  });

  // Crear el libro y la hoja
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Comunicaciones");

  // Ajustar ancho de columnas
  const colWidths = [
    { wch: 15 }, // Área
    { wch: 20 }, // Responsable
    { wch: 25 }, // Campaña
    { wch: 15 }, // Proceso
    { wch: 15 }, // Sub-Campaña
    { wch: 20 }, // Sub-Campaña2
    { wch: 15 }, // Segmento
    { wch: 25 }, // Canal
    { wch: 10 }, // Ciclo
    { wch: 12 }, // Fecha
  ];
  worksheet["!cols"] = colWidths;

  // Descargar el archivo
  const fileName = `comunicaciones_${format(new Date(), "yyyyMMdd_HHmmss")}.xlsx`;
  XLSX.writeFile(workbook, fileName);
};
