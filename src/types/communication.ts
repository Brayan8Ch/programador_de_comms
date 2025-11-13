export interface Communication {
  id: string;
  campana: string;
  proceso: string;
  subCampana: string;
  subCampana2: string;
  segmento: string;
  canal: string;
  ciclo: string;
  fechaInicio: Date;
  fechaFin: Date;
  frecuencia: string[];
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
  "Totem",
  "SMS",
  "Notificación UTP +App",
];
