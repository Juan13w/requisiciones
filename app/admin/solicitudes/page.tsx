// app/admin/solicitudes/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, X, Search, Download } from 'lucide-react';
import Image from 'next/image';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';



type Requisicion = {
  requisicion_id: number;
  consecutivo: string;
  empresa: string;
  fecha_solicitud: string;
  proceso: string;
  descripcion: string;
  justificacion: string;
  cantidad: number;
  estado: string;
  img: string;
  comentario_rechazo?: string;
};

export default function SolicitudesPage() {
  const [solicitudes, setSolicitudes] = useState<Requisicion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReq, setSelectedReq] = useState<Requisicion | null>(null);

  useEffect(() => {
    const fetchSolicitudes = async () => {
      try {
        const response = await fetch('/api/requisiciones/list');
        if (!response.ok) {
          throw new Error('Error al cargar las solicitudes');
        }
        const data = await response.json();
        setSolicitudes(data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSolicitudes();
  }, []);

  const filteredSolicitudes = solicitudes.filter(solicitud =>
    Object.values(solicitud).some(
      value =>
        value &&
        value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const openDetails = (solicitud: Requisicion) => {
    setSelectedReq(solicitud);
  };

  const closeDetails = () => {
    setSelectedReq(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Todas las Solicitudes</h1>
          <p className="text-sm text-gray-500">
            Visualiza y gestiona todas las solicitudes de compra
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <div className="p-4 border-b">
          <div className="relative max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Buscar solicitudes..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Consecutivo</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Proceso</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Imagen</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSolicitudes.length > 0 ? (
                filteredSolicitudes.map((solicitud) => (
                  <TableRow key={solicitud.requisicion_id}>
                    <TableCell className="font-medium">{solicitud.consecutivo}</TableCell>
                    <TableCell>{solicitud.empresa}</TableCell>
                    <TableCell>
                      {new Date(solicitud.fecha_solicitud).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{solicitud.proceso}</TableCell>
                    <TableCell className="max-w-xs truncate" title={solicitud.descripcion}>
                      {solicitud.descripcion}
                    </TableCell>
                    <TableCell>
                      {solicitud.img ? (
                        <div className="relative h-10 w-10">
                          <Image
                            src={solicitud.img}
                            alt={`Imagen de ${solicitud.consecutivo}`}
                            fill
                            className="object-cover rounded"
                          />
                        </div>
                      ) : (
                        <span className="text-gray-400">Sin imagen</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          solicitud.estado === 'pendiente'
                            ? 'bg-yellow-100 text-yellow-800'
                            : solicitud.estado === 'aprobada'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {solicitud.estado.charAt(0).toUpperCase() + solicitud.estado.slice(1)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => openDetails(solicitud)}
                        className="h-8 w-8 p-0"
                      >
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">Ver detalles</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                    No se encontraron solicitudes
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

{/* Modal de Detalles */}
{selectedReq && (
  <div 
    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    onClick={closeDetails}
  >
    <div 
      className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative"
      onClick={(e) => e.stopPropagation()}
    >
      <button 
        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        onClick={closeDetails}
        aria-label="Cerrar"
      >
        <X className="h-6 w-6" />
      </button>

      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Detalles de la Requisición</h2>
          <span 
            className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
              selectedReq.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
              selectedReq.estado === 'aprobada' ? 'bg-green-100 text-green-800' :
              'bg-red-100 text-red-800'
            }`}
          >
            {selectedReq.estado.toUpperCase()}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Consecutivo</h3>
              <p className="font-medium">{selectedReq.consecutivo}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Empresa</h3>
              <p>{selectedReq.empresa}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Fecha de Solicitud</h3>
              <p>{new Date(selectedReq.fecha_solicitud).toLocaleDateString()}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Proceso</h3>
              <p>{selectedReq.proceso}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Cantidad</h3>
              <p>{selectedReq.cantidad}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Descripción</h3>
              <p className="whitespace-pre-line bg-gray-50 p-3 rounded">
                {selectedReq.descripcion}
              </p>
            </div>
            {selectedReq.comentario_rechazo && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Comentario de Rechazo</h3>
                <p className="text-red-600 bg-red-50 p-3 rounded">
                  {selectedReq.comentario_rechazo}
                </p>
              </div>
            )}
          </div>
        </div>

        {selectedReq.img && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Imagen Adjunta</h3>
            <div className="relative w-full h-64 border rounded-lg overflow-hidden">
              <Image
                src={selectedReq.img}
                alt={`Imagen de la requisición ${selectedReq.consecutivo}`}
                fill
                className="object-contain"
              />
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-4 border-t mt-6">
          <Button 
            variant="outline" 
            onClick={closeDetails}
          >
            Cerrar
          </Button>
          {selectedReq.estado === 'pendiente' && (
            <Button 
              variant="default"
              // onClick={() => handleAction(selectedReq.requisicion_id, 'aprobar')}
            >
              Aprobar
            </Button>
          )}
        </div>
      </div>
    </div>
  </div>
)}
    </div>
  );
}