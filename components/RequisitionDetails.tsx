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

  const getStatusClass = (estado: string) => {
    switch (estado) {
      case "aprobada":
        return "status-approved"
      case "rechazada":
        return "status-rejected"
      default:
        return "status-pending"
    }
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
            <span className={`req-status ${getStatusClass(requisition.estado)}`}>
              {requisition.estado.charAt(0).toUpperCase() + requisition.estado.slice(1)}
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

          {requisition.imagenes && requisition.imagenes.length > 0 && (
            <div className="detail-item-full">
              <label>Imágenes adjuntas:</label>
              <div className="image-thumbnails">
                {requisition.imagenes.map((img, index) => (
                  <div key={index} className="image-thumbnail">
                    <img 
                      src={img} 
                      alt={`Imagen ${index + 1}`}
                      className="thumbnail"
                      onClick={() => window.open(img, '_blank')}
                    />
                  </div>
                ))}
              </div>
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
