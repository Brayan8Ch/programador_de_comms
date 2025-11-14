export interface Communication {
  id: string;
  area: string;
  responsable: string;
  campana: string;
  proceso: string;
  subCampana: string;
  subCampana2: string;
  segmento: string;
  ciclo: string;
  fechaInicio: Date;
  fechaFin: Date;
  canalesPorDia: {
    [key: string]: string[]; // key = día (LU, MA, etc), value = array de canales
  };
}

export const diasSemana = [
  { value: "LU", label: "Lunes" },
  { value: "MA", label: "Martes" },
  { value: "MI", label: "Miércoles" },
  { value: "JU", label: "Jueves" },
  { value: "VI", label: "Viernes" },
  { value: "SA", label: "Sábado" },
  { value: "DO", label: "Domingo" },
];

export const canalesDisponibles = [
  "Mail UTP",
  "Mail Personal",
  "Banner - UTP +Class",
  "Banner - UTP +Portal",
  "TV SAE",
  "Call",
  "Totem",
  "SMS",
  "Notificación UTP +App",
];
