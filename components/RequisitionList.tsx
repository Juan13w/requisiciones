"use client"

import { useState } from "react"
import type { Requisition } from "@/types/requisition"
import "../styles/RequisitionList.css"
import { Eye, Edit, Trash2, Send, Clock, Calendar, Package, FileText, User, Building } from 'lucide-react'

// Iconos reemplazados por imports de lucide-react

export interface RequisitionListProps extends React.HTMLAttributes<HTMLDivElement> {
  requisitions: Requisition[]
  onView: (id: string) => void
  onDelete: (id: string) => void
  onEdit?: (id: string) => void
  // Sobrescribir cualquier propiedad onClick que pueda venir de HTMLAttributes
  onClick?: never
}

export default function RequisitionList({ 
  requisitions, 
  onView, 
  onDelete, 
  onEdit,
  ...props 
}: RequisitionListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("todos")
  
  // Función para formatear fechas
  const formatDate = (timestamp: number | Date | string) => {
    const date = new Date(timestamp);
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return date.toLocaleDateString('es-ES', options);
  };
  
  // Función para obtener el color del estado
  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    switch(statusLower) {
      case 'pendiente':
        return 'status-pendiente';
      case 'aprobado':
      case 'aprobada':
        return 'status-aprobado';
      case 'rechazado':
      case 'rechazada':
        return 'status-rechazado';
      case 'en proceso':
        return 'status-en-proceso';
      case 'completado':
      case 'completada':
        return 'status-completado';
      case 'correccion':
        return 'status-correccion';
      default:
        return 'status-pendiente';
    }
  }

  
  const formatTimeAgo = (timestamp: number | Date | string) => {
    const now = new Date()
    const date = new Date(timestamp)
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    const intervals = {
      año: 31536000,
      mes: 2592000,
      semana: 604800,
      día: 86400,
      hora: 3600,
      minuto: 60,
      segundo: 1
    }
    
    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
      const interval = Math.floor(diffInSeconds / secondsInUnit)
      if (interval >= 1) {
        return `hace ${interval} ${interval === 1 ? unit : unit + 's'}`
      }
    }
    
    return 'justo ahora'
  }


  const filteredRequisitions = requisitions.filter((requisition) => {
    const searchTermLower = searchTerm.toLowerCase()
    const matchesSearch = (
      requisition.consecutivo.toLowerCase().includes(searchTermLower) ||
      requisition.descripcion.toLowerCase().includes(searchTermLower) ||
      requisition.nombreSolicitante.toLowerCase().includes(searchTermLower)
    );

    const matchesStatus = statusFilter === "todos" || requisition.estado === statusFilter;

    return matchesSearch && matchesStatus;
  })

  return (
    <div className="requisition-list-container">
      <h2 className="list-title">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <line x1="10" y1="9" x2="8" y2="9"></line>
        </svg>
        Lista de Requisiciones
      </h2>
      
      <div className="filters-container">
        <div className="search-bar">
          <div className="search-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
          <input 
            type="text" 
            placeholder="Buscar por número de requisición..." 
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <select 
          className="status-filter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="todos">Todos los estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="aprobado">Aprobado</option>
          <option value="rechazado">Rechazado</option>
          <option value="en proceso">En proceso</option>
          <option value="completado">Completado</option>
        </select>
      </div>
      
      <div className="requisition-list">
        {filteredRequisitions.length > 0 ? (
          filteredRequisitions.map((requisition) => (
            <div key={requisition.id} className="requisition-item">
              <div className="requisition-header">
                <div className="requisition-title">
                  <div className="consecutivo">
                    <FileText size={16} className="detail-icon" />
                    <span>{requisition.consecutivo || 'S/N'}</span>
                  </div>
                  <div className="solicitante">
                    <User size={16} className="detail-icon" />
                    <span>{requisition.nombreSolicitante || 'Solicitante no especificado'}</span>
                  </div>
                  <div className="fecha">
                    <Calendar size={16} className="detail-icon" />
                    <span>{requisition.fechaSolicitud ? formatDate(requisition.fechaSolicitud) : 'Sin fecha'}</span>
                  </div>
                </div>
                <span className={`requisition-status ${getStatusColor(requisition.estado)}`}>
                  {requisition.estado || 'Pendiente'}
                </span>
              </div>
              
              {requisition.descripcion && (
                <p className="description">
                  {requisition.descripcion}
                </p>
              )}
              
              <div className="requisition-details">
                {requisition.proceso && (
                  <div className="detail-item">
                    <Building size={14} className="detail-icon" />
                    <span>{requisition.proceso}</span>
                  </div>
                )}
                
                {requisition.cantidad && (
                  <div className="detail-item">
                    <Package size={14} className="detail-icon" />
                    <span>{requisition.cantidad} {requisition.cantidad === 1 ? 'unidad' : 'unidades'}</span>
                  </div>
                )}
              </div>
              
              <div className="requisition-footer">
                
                <div className="requisition-actions">
                  {requisition.estado === 'correccion' && onEdit && (
                    <button 
                      className="action-btn edit-btn" 
                      onClick={() => onEdit(requisition.id)}
                      title="Editar y reenviar"
                    >
                      <Edit size={16} className="action-icon" />
                      <span>Editar</span>
                    </button>
                  )}
                  
                  <button 
                    className="action-btn view-btn" 
                    onClick={() => onView(requisition.id)}
                    title="Ver detalles"
                  >
                    <Eye size={16} className="action-icon" />
                    <span>Ver detalles</span>
                  </button>
                  
                  {onDelete && (
                    <button 
                      className="action-btn delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm('¿Estás seguro de que deseas eliminar esta requisición?')) {
                          onDelete(requisition.id);
                        }
                      }}
                      title="Eliminar"
                    >
                      <Trash2 size={16} className="action-icon" />
                      <span>Eliminar</span>
                    </button>
                  )}
                </div>
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
