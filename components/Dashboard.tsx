"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { v4 as uuidv4 } from "uuid"
import RequisitionForm from "./RequisitionForm"
import RequisitionList from "./RequisitionList"
import RequisitionDetails from "./RequisitionDetails"
import type { Requisition } from "@/types/requisition"
import "../styles/Dashboard.css"

const STORAGE_KEY = "requisiciones"

const Dashboard = () => {
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [requisitions, setRequisitions] = useState<Requisition[]>([])
  const [selectedRequisition, setSelectedRequisition] = useState<Requisition | null>(null)

  // Cargar requisiciones al iniciar
  useEffect(() => {
    const isAuthenticated = localStorage.getItem("usuarioLogueado") === "true"
    const userData = localStorage.getItem("usuarioData")
    
    if (!isAuthenticated || !userData) {
      router.push("/")
      return
    }
    
    // Verificar el rol del usuario y redirigir si es necesario
    try {
      const user = JSON.parse(userData)
      if (user.rol === 'compras') {
        router.push('/dashboard-compras')
        return
      }
    } catch (error) {
      console.error('Error al analizar los datos del usuario:', error)
      router.push("/")
      return
    }

    // Cargar requisiciones desde la API
    const loadRequisitions = async () => {
      try {
        const response = await fetch('/api/requisiciones');
        if (!response.ok) {
          throw new Error('Error al cargar las requisiciones');
        }
        const data = await response.json();
        setRequisitions(data);
      } catch (error) {
        console.error("Error al cargar las requisiciones:", error);
        alert('Error al cargar las requisiciones. Por favor, recarga la página.');
      }
    };

    loadRequisitions();
  }, [router])

  // Guardar requisiciones cuando cambian
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(requisitions))
    } catch (error) {
      console.error("Error al guardar las requisiciones:", error)
    }
  }, [requisitions])

  const handleLogout = () => {
    localStorage.removeItem("usuarioLogueado")
    localStorage.removeItem("usuarioData")
    router.push("/")
  }

  const handleSaveRequisition = async (data: Omit<Requisition, "id" | "fechaCreacion" | "estado">) => {
    try {
      const response = await fetch('/api/requisiciones', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al guardar la requisición');
      }

      // Actualizar la lista de requisiciones
      const [newRequisitions] = await Promise.all([
        fetch('/api/requisiciones').then(res => res.json()),
      ]);
      
      setRequisitions(newRequisitions);
      setShowForm(false);
      setEditingId(null);
      
    } catch (error: unknown) {
      console.error('Error al guardar la requisición:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error al guardar la requisición';
      alert(errorMessage);
    }
  }

  const handleView = (id: string) => {
    const requisition = requisitions.find((r) => r.id === id)
    if (requisition) {
      setSelectedRequisition(requisition)
    }
  }

  const handleDelete = (id: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar esta requisición?")) {
      setRequisitions((prev) => prev.filter((req) => req.id !== id))
    }
  }

  return (
    <div className="dashboard">
      {selectedRequisition && (
        <RequisitionDetails
          requisition={selectedRequisition}
          onClose={() => setSelectedRequisition(null)}
        />
      )}
      <nav className="dashboard-nav">
        <div className="nav-container">
          <div className="nav-brand">
            <Link href="/dashboard" className="brand-link">
              Sistema de Requisiciones
            </Link>
          </div>
          <div className="nav-actions">
            <button
              onClick={() => {
                setEditingId(null)
                setShowForm(true)
              }}
              className="nav-button primary"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Nueva Requisición
            </button>
            <button onClick={handleLogout} className="logout-button">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013 3v1"
                />
              </svg>
              Cerrar sesión
            </button>
          </div>
        </div>
      </nav>

      <main className="dashboard-content">
        {showForm ? (
          <RequisitionForm
            onSave={handleSaveRequisition}
            onCancel={() => {
              setShowForm(false)
              setEditingId(null)
            }}
            initialData={editingId ? requisitions.find((r) => r.id === editingId) : undefined}
          />
        ) : (
          <>
            <div className="dashboard-header">
              <h1>Dashboard - RRHH</h1>
              <p>Gestiona tus requisiciones y solicitudes al departamento de compras</p>
            </div>

            <div className="stats-container">
              <div className="stat-card">
                <div className="stat-card-header">
                  <h3>Total Requisiciones</h3>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-info"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                </div>
                <div className="stat-card-body">
                  <span className="stat-number">{requisitions.length}</span>
                  <p>Presupuesto total: $NaN</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-card-header">
                  <h3>Pendientes</h3>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-clock"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                </div>
                <div className="stat-card-body">
                  <span className="stat-number orange">{requisitions.filter(r => r.estado === 'pendiente').length}</span>
                  <p>Esperando revisión</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-card-header">
                  <h3>Aprobadas</h3>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-circle-check"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
                </div>
                <div className="stat-card-body">
                  <span className="stat-number green">{requisitions.filter(r => r.estado === 'aprobada').length}</span>
                  <p>En proceso o completadas</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-card-header">
                  <h3>Rechazadas</h3>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-circle-x"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
                </div>
                <div className="stat-card-body">
                  <span className="stat-number red">{requisitions.filter(r => r.estado === 'rechazada').length}</span>
                  <p>Requieren revisión</p>
                </div>
              </div>
            </div>

            <div className="slide-in">
              <RequisitionList requisitions={requisitions} onView={handleView} onDelete={handleDelete} />
            </div>
          </>
        )}
      </main>
    </div>
  )
}

export default Dashboard
