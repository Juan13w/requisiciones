"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState, useCallback } from "react"
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
  const [userData, setUserData] = useState<{ [key: string]: any } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadRequisitions = useCallback(async () => {
    try {
      if (!userData) {
        console.log('No hay datos de usuario disponibles');
        return;
      }

      // Obtener el ID del coordinador del usuario logueado
      const coordinadorId = userData.coordinador_id || userData.id;
      console.log('Datos del usuario:', userData);
      console.log('ID del coordinador extraído:', coordinadorId);

      // Si no hay ID, no cargar nada
      if (!coordinadorId) {
        console.error('No se pudo encontrar el ID del coordinador en los datos del usuario');
        return;
      }

      // Pasar el ID del coordinador como parámetro de consulta
      const apiUrl = `/api/requisiciones?coordinadorId=${coordinadorId}`;
      console.log('URL de la API:', apiUrl);
      
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error en la respuesta de la API:', response.status, errorText);
        throw new Error(`Error al cargar las requisiciones: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Datos recibidos de la API:', data);
      
      if (!Array.isArray(data)) {
        console.error('La respuesta de la API no es un array:', data);
        throw new Error('Formato de respuesta inválido');
      }
      
      setRequisitions(data);
      console.log('Requisiciones cargadas:', data.length);
    } catch (error) {
      console.error("Error al cargar las requisiciones:", error);
      alert("Error al cargar las requisiciones. Por favor, revisa la consola para más detalles.");
    } finally {
      setIsLoading(false);
    }
  }, [userData]);

  // Cargar datos del usuario y sus requisiciones al iniciar
  useEffect(() => {
    const initializeDashboard = async () => {
      const isAuthenticated = localStorage.getItem("usuarioLogueado") === "true";
      const userDataStr = localStorage.getItem("usuarioData");

      console.log('Inicializando dashboard...');
      console.log('Usuario autenticado:', isAuthenticated);
      console.log('Datos del usuario (crudos):', userDataStr);

      if (!isAuthenticated || !userDataStr) {
        console.log('Usuario no autenticado o sin datos, redirigiendo a /');
        router.push("/");
        return;
      }

      try {
        const user = JSON.parse(userDataStr);
        console.log('Datos del usuario (parseados):', user);
        
        // Si el usuario es de compras, redirigir al dashboard de compras
        if (user.rol === "compras") {
          console.log('Usuario es de compras, redirigiendo...');
          router.push("/dashboard-compras");
          return;
        }
        
        console.log('Estableciendo datos del usuario en el estado...');
        setUserData(user);
      } catch (error) {
        console.error("Error al cargar datos del usuario:", error);
        alert("Error al cargar los datos del usuario. Por favor, inicia sesión nuevamente.");
        router.push("/");
      }
    };

    initializeDashboard();
  }, [router]);

  // Cargar requisiciones cuando userData esté disponible
  useEffect(() => {
    if (userData) {
      loadRequisitions();
    }
  }, [userData, loadRequisitions]);


  const handleLogout = () => {
    localStorage.removeItem("usuarioLogueado")
    localStorage.removeItem("usuarioData")
    router.push("/")
  }

  const handleSave = async (requisition: Omit<Requisition, "id" | "fechaCreacion" | "estado">) => {
    try {
      // Obtener los datos del usuario desde localStorage
      const usuarioData = localStorage.getItem('usuarioData');
      if (!usuarioData) {
        throw new Error('No se encontraron los datos del usuario');
      }

      const user = JSON.parse(usuarioData);
      
      // Validar campos requeridos
      if (!requisition.descripcion?.trim()) {
        throw new Error("La descripción es requerida");
      }
      if (!requisition.proceso?.trim()) {
        throw new Error("El proceso es requerido");
      }
      if (!requisition.cantidad || requisition.cantidad <= 0) {
        throw new Error("La cantidad debe ser mayor a cero");
      }
      
      // Preparar los datos para enviar
      const requisitionToSave = {
        ...requisition,
        empresa: requisition.empresa || user.empresa || '',
        nombreSolicitante: user.email || '',
        fechaSolicitud: new Date().toISOString().split('T')[0],
        justificacion: requisition.justificacion || '',
        usuarioData: user // Incluir todos los datos del usuario
      };
      
      console.log("Guardando requisición con datos:", requisitionToSave);
      
      // Si estamos editando (caso corrección), actualizar vía PUT
      let response: Response;
      if (editingId) {
        const putBody = {
          ...requisitionToSave,
          // Al reenviar tras corrección, vuelve a 'pendiente'
          estado: 'pendiente',
          // Limpia el comentario y fecha de rechazo (opcional)
          comentarioRechazo: '',
          fechaUltimoRechazo: null
        } as any;
        response = await fetch(`/api/requisiciones/${editingId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(putBody)
        });
      } else {
        // Enviar la solicitud al servidor (creación)
        response = await fetch("/api/requisiciones", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(requisitionToSave)
        });
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Error al guardar la requisición")
      }
      
      const newRequisition = await response.json()
      
      setShowForm(false)
      setEditingId(null)
      // Recargar las requisiciones desde el servidor para obtener la lista actualizada
      await loadRequisitions()
      
    } catch (error: unknown) {
      console.error("Error al guardar la requisición:", error)
      const errorMessage = error instanceof Error ? error.message : "Error al guardar la requisición"
      alert(errorMessage)
    }
  }

  const handleView = (id: string) => {
    const requisition = requisitions.find((r) => r.id === id)
    if (requisition) {
      setSelectedRequisition(requisition)
    }
  }

  const handleEdit = (id: string) => {
    setEditingId(id);
    setShowForm(true);
  }

  const handleDelete = (id: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar esta requisición?")) {
      setRequisitions((prev) => prev.filter((req) => req.id !== id))
    }
  }


  // Preparar datos iniciales para el formulario
  const getInitialData = () => {
    if (editingId) {
      return requisitions.find((r) => r.id === editingId);
    }
    return {
      consecutivo: `REQ-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      empresa: userData?.empresa || "",
      nombreSolicitante: userData?.email?.split("@")[0] || "",
      proceso: "",
      justificacion: "",
      descripcion: "",
      cantidad: 1,
      imagenes: [],
      fechaSolicitud: new Date().toISOString().split("T")[0],
    };
  };

  const initialData = getInitialData();

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
            onSave={handleSave}
            onCancel={() => {
              setShowForm(false)
              setEditingId(null)
            }}
            initialData={getInitialData()}
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
                  <span className="stat-number orange">{requisitions.filter(r => r.estado === "pendiente").length}</span>
                  <p>Esperando revisión</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-card-header">
                  <h3>Aprobadas</h3>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-circle-check"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
                </div>
                <div className="stat-card-body">
                  <span className="stat-number green">{requisitions.filter(r => r.estado === "aprobada").length}</span>
                  <p>En proceso o completadas</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-card-header">
                  <h3>Rechazadas</h3>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-circle-x"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
                </div>
                <div className="stat-card-body">
                  <span className="stat-number red">{requisitions.filter(r => r.estado === "rechazada").length}</span>
                  <p>Requieren revisión</p>
                </div>
              </div>
            </div>

            <div className="dashboard-main">
              <RequisitionList
                requisitions={requisitions}
                onView={handleView}
                onDelete={handleDelete}
                onEdit={handleEdit}
              />
            </div>
          </>
        )}
      </main>
    </div>
  )
}

export default Dashboard
