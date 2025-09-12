"use client"

import type React from "react"

import { useState, useRef, type ChangeEvent, useEffect } from "react"
import type { Requisition } from "@/types/requisition"

interface RequisitionFormProps {
  onSave: (requisition: Omit<Requisition, "id" | "fechaCreacion" | "estado">) => void
  onCancel: () => void
  initialData?: Omit<Requisition, "id" | "fechaCreacion" | "estado">
}

export default function RequisitionForm({ onSave, onCancel, initialData }: RequisitionFormProps) {
  const [formData, setFormData] = useState<Omit<Requisition, "id" | "fechaCreacion" | "estado">>(
    initialData || {
      consecutivo: "",
      empresa: "",
      fechaSolicitud: new Date().toISOString().split("T")[0],
      nombreSolicitante: "",
      proceso: "",
      justificacion: "",
      descripcion: "",
      cantidad: 1,
      imagenes: [],
    },
  )

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Update form data when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData(initialData)
    }
  }, [initialData])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "cantidad" ? Number.parseInt(value) || 0 : value,
    }))
  }

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return

    const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
    const files = Array.from(e.target.files)

    // Validate file size
    const oversizedFiles = files.filter((file) => file.size > MAX_FILE_SIZE)
    if (oversizedFiles.length > 0) {
      alert(`Algunos archivos superan el tamaño máximo de 5MB`)
      return
    }

    const imagePromises = files.map((file) => {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = (error) => reject(error)
        reader.readAsDataURL(file)
      })
    })

    Promise.all(imagePromises)
      .then((images) => {
        setFormData((prev) => ({
          ...prev,
          imagenes: [...prev.imagenes, ...images],
        }))
      })
      .catch((error) => {
        console.error("Error al cargar las imágenes:", error)
        alert("Error al cargar una o más imágenes")
      })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      onSave(formData)
    } finally {
      setIsSubmitting(false)
    }
  }

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      imagenes: prev.imagenes.filter((_, i) => i !== index),
    }))
  }

  // Estilos comunes para los inputs
  const inputClass =
    "w-full px-4 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
  const labelClass = "block text-sm font-medium text-gray-700 mb-1.5"
  const buttonClass = `px-5 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
    isSubmitting ? "opacity-70 cursor-not-allowed" : ""
  }`

  return (
    <div className="requisition-form-container fade-in">
      <div className="form-header">
        <h2 className="form-title">{initialData ? "✏️ Editar Requisición" : "📝 Nueva Requisición"}</h2>
        <p className="form-subtitle">
          {initialData
            ? "Actualiza los datos de la requisición"
            : "Completa el formulario para crear una nueva requisición"}
        </p>
      </div>

      <div className="form-content">
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-field">
              <label className="form-label">Consecutivo</label>
              <input
                type="text"
                name="consecutivo"
                value={formData.consecutivo}
                onChange={handleChange}
                className="form-input"
                required
                placeholder="Ej: REQ-2023-001"
              />
            </div>

            <div className="form-field">
              <label className="form-label">Empresa</label>
              <input
                type="text"
                name="empresa"
                value={formData.empresa}
                onChange={handleChange}
                className="form-input"
                required
                placeholder="Nombre de la empresa"
              />
            </div>

            <div className="form-field">
              <label className="form-label">Fecha de Solicitud</label>
              <input
                type="date"
                name="fechaSolicitud"
                value={formData.fechaSolicitud}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-field">
              <label className="form-label">Solicitante</label>
              <input
                type="text"
                name="nombreSolicitante"
                value={formData.nombreSolicitante}
                onChange={handleChange}
                className="form-input"
                required
                placeholder="Nombre completo"
              />
            </div>

            <div className="form-field">
              <label className="form-label">Proceso</label>
              <input
                type="text"
                name="proceso"
                value={formData.proceso}
                onChange={handleChange}
                className="form-input"
                required
                placeholder="Ej: Compras, Ventas, etc."
              />
            </div>

            <div className="form-field">
              <label className="form-label">Cantidad</label>
              <input
                type="number"
                name="cantidad"
                min="1"
                value={formData.cantidad}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-field full-width">
              <label className="form-label">Justificación</label>
              <textarea
                name="justificacion"
                value={formData.justificacion}
                onChange={handleChange}
                className="form-input form-textarea"
                required
                placeholder="Describe la justificación de esta requisición"
              />
            </div>

            <div className="form-field full-width">
              <label className="form-label">Descripción</label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                className="form-input form-textarea"
                required
                placeholder="Proporciona una descripción detallada"
              />
            </div>
          </div>

          <div className="images-section">
            <label className="form-label">Imágenes Adjuntas</label>
            
            <div className="upload-container">
              <div className="upload-area">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  multiple
                  className="file-input"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="upload-label">
                  <div className="upload-content">
                    <svg className="upload-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 13V19H5V13H3V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V13H19ZM13 5.83L15.59 8.41L17 7L12 2L7 7L8.41 8.41L11 5.83V15H13V5.83Z" fill="#4F46E5"/>
                    </svg>
                    <div className="upload-text">
                      <span className="upload-title">Subir imagenes</span>
                    
                    </div>
                  </div>
                </label>
               </div>
              
              {formData.imagenes.length > 0 && (
                <div className="uploaded-images">
                  <h4 className="uploaded-files-title">Imágenes adjuntas</h4>
                  <div className="image-thumbnails">
                    {formData.imagenes.map((img, index) => (
                      <div key={index} className="image-thumbnail">
                        <img 
                          src={img} 
                          alt={`Imagen ${index + 1}`}
                          className="thumbnail"
                          onClick={() => window.open(img, '_blank')}
                        />
                        <button 
                          type="button" 
                          onClick={(e) => {
                            e.stopPropagation();
                            removeImage(index);
                          }}
                          className="remove-thumbnail"
                          title="Eliminar imagen"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="white"/>
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onCancel} className="form-button cancel" disabled={isSubmitting}>
              Cancelar
            </button>
            <button type="submit" className="form-button submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="loading-spinner"></div>
                  Procesando...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {initialData ? "Actualizar" : "Guardar"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
