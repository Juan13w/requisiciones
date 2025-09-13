"use client"

import { useState } from "react"
import type { Requisition } from "@/types/requisition"
import "../styles/RequisitionList.css"

interface RequisitionListProps {
  requisitions: Requisition[]
  onView: (id: string) => void
  onDelete: (id: string) => void
}

export default function RequisitionList({ requisitions, onView, onDelete }: RequisitionListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("todos")

  const formatDate = (timestamp: number | Date | string) => {
    return new Date(timestamp).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "numeric",
      year: "numeric",
    })
  }

  const getStatusClass = () => {
    // Como eliminamos el estado, siempre devolvemos 'status-pending'
    return "status-pending"
  }

  const filteredRequisitions = requisitions.filter((requisition) => {
    const searchTermLower = searchTerm.toLowerCase()
    const matchesSearch = (
      requisition.consecutivo.toLowerCase().includes(searchTermLower) ||
      requisition.descripcion.toLowerCase().includes(searchTermLower) ||
      requisition.nombreSolicitante.toLowerCase().includes(searchTermLower)
    )
    // Como eliminamos el estado, siempre devolvemos true para matchesStatus
    return matchesSearch
  })

  return (
    <div className="requisition-list-container">
      <h2 className="list-title">Mis Requisiciones</h2>
      <div className="filters-container">
        <div className="search-bar">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="search-icon"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input
            type="text"
            placeholder="Buscar por consecutivo, producto, solicitante..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="requisition-cards-grid">
        {filteredRequisitions.length > 0 ? (
          filteredRequisitions.map((requisition) => (
            <div key={requisition.id} className="requisition-card">
              <div className="card-header">
                <span className="consecutivo">{requisition.consecutivo}</span>
                <span className={`status-badge ${getStatusClass()}`}>
                  Pendiente
                </span>
                <button className="view-button" onClick={() => onView(requisition.id)}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                </button>
              </div>
              <p className="description">{requisition.descripcion}</p>
              <div className="details-grid">
                <span><strong>Holding:</strong> {requisition.empresa}</span>
                <span><strong>Solicitante:</strong> {requisition.nombreSolicitante}</span>
                <span><strong>Proceso:</strong> {requisition.proceso}</span>
                <span><strong>Cantidad:</strong> {requisition.cantidad}</span>
              </div>
              <div className="card-footer">
                <span>Fecha Solicitud: {formatDate(requisition.fechaSolicitud)}</span>
                <span>Creada: {formatDate(requisition.fechaCreacion)}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-list-message">
            <p>No se encontraron requisiciones que coincidan con la búsqueda.</p>
          </div>
        )}
      </div>
    </div>
  )
}
