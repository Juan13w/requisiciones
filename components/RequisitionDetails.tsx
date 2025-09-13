"use client"

import type { Requisition } from "@/types/requisition"
import "../styles/RequisitionDetails.css"

interface RequisitionDetailsProps {
  requisition: Requisition
  onClose: () => void
}

export default function RequisitionDetails({ requisition, onClose }: RequisitionDetailsProps) {
  const formatDate = (timestamp: number | Date | string) => {
    if (!timestamp) return "N/A"
    return new Date(timestamp).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "numeric",
      year: "numeric",
    })
  }

  const getStatusClass = () => {
    // Since we removed the estado field, we'll always return 'status-pending'
    return "status-pending"
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Detalles de Requisición</h3>
          <button onClick={onClose} className="close-button">&times;</button>
        </div>
        <div className="modal-body">
          <div className="req-header">
            <span className="req-consecutivo">{requisition.consecutivo}</span>
            <span className={`status-badge ${getStatusClass()}`}>
              Pendiente
            </span>
          </div>

          <div className="req-details-grid">
            <div className="detail-item">
              <label>Holding:</label>
              <p>{requisition.empresa}</p>
            </div>
            <div className="detail-item">
              <label>Fecha de Solicitud:</label>
              <p>{formatDate(requisition.fechaSolicitud)}</p>
            </div>
            <div className="detail-item">
              <label>Nombre del Solicitante:</label>
              <p>{requisition.nombreSolicitante}</p>
            </div>
            <div className="detail-item">
              <label>Proceso Solicitante:</label>
              <p>{requisition.proceso}</p>
            </div>
          </div>

          <div className="detail-item-full">
            <label>Descripción del Producto:</label>
            <p>{requisition.descripcion}</p>
          </div>

          <div className="detail-item-full">
            <label>Cantidad:</label>
            <p>{requisition.cantidad}</p>
          </div>

          <div className="detail-item-full">
            <label>Justificación:</label>
            <p>{requisition.justificacion}</p>
          </div>

          {requisition.imagenes && requisition.imagenes.length > 0 ? (
            <div className="detail-item-full">
              <label>Imágenes adjuntas:</label>
              <div className="image-thumbnails">
                {requisition.imagenes.map((img, index) => {
                  // Verificar si la imagen es una cadena base64 o una URL
                  const imageSrc = img.startsWith('data:') ? img : `data:image/jpeg;base64,${img}`;
                  return (
                    <div key={index} className="image-thumbnail">
                      <img 
                        src={imageSrc} 
                        alt={`Imagen ${index + 1}`}
                        className="thumbnail"
                        style={{ maxWidth: '100%', maxHeight: '200px', cursor: 'pointer' }}
                        onClick={() => {
                          const newWindow = window.open('', '_blank');
                          if (newWindow) {
                            newWindow.document.write(`
                              <!DOCTYPE html>
                              <html>
                                <head>
                                  <title>Imagen ${index + 1}</title>
                                  <style>
                                    body { margin: 0; padding: 20px; display: flex; justify-content: center; align-items: center; height: 100vh; background-color: #f5f5f5; }
                                    img { max-width: 90%; max-height: 90vh; object-fit: contain; }
                                  </style>
                                </head>
                                <body>
                                  <img src="${imageSrc}" alt="Imagen ampliada" />
                                </body>
                              </html>
                            `);
                            newWindow.document.close();
                          }
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="detail-item-full">
              <label>Imágenes adjuntas:</label>
              <p>No hay imágenes adjuntas</p>
            </div>
          )}
        </div>
        <div className="modal-footer">
          <span>Creada: {formatDate(requisition.fechaCreacion)}</span>
          {/* Asumiendo que hay una fecha de actualización, si no, se puede quitar */}
          <span>Actualizada: {formatDate(Date.now())}</span>
        </div>
      </div>
    </div>
  )
}
