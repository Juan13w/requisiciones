export interface Requisition {
  id: string;
  consecutivo: string;
  empresa: string;
  fechaSolicitud: string;
  nombreSolicitante: string;
  proceso: string;
  justificacion: string;
  descripcion: string;
  cantidad: number;
  imagenes: string[]; // URLs de las imágenes en base64
  estado: 'pendiente' | 'aprobada' | 'rechazada';
  fechaCreacion: number; // timestamp
}
