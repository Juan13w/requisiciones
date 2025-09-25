"use client";

import React, { useState, useEffect } from "react";
import { Bar, Pie, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface Estado { estado: string; cantidad: number; porcentaje: number; }
interface Proceso { proceso: string; cantidad: number; porcentaje: number; }
interface Dia { fecha: string; aprobadas: number; rechazadas: number; pendientes: number; total: number; }
interface ChartDataResponse { porEstado: Estado[]; porProceso: Proceso[]; porDia: Dia[]; }

export default function RequisitionCharts() {
  const [chartData, setChartData] = useState<ChartDataResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/requisiciones/estadisticas");
        if (!response.ok) throw new Error("Error en la API");
        const data = await response.json();
        setChartData(data.data);
      } catch (err) {
        setError("Error al cargar estadísticas");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="p-4 text-center">Cargando estadísticas...</div>;
  if (error) return <div className="p-4 text-center text-red-500">Error: {error}</div>;
  if (!chartData) return <div className="p-4 text-center">No hay datos disponibles.</div>;

  const { porEstado, porProceso, porDia } = chartData;

  // --- Datos para gráficos ---
  const barData = {
    labels: porDia.map(d => new Date(d.fecha).toLocaleDateString('es-ES', { weekday: 'short' })),
    datasets: [
      { label: "Aprobadas", data: porDia.map(d => d.aprobadas), backgroundColor: "#4CAF50" },
      { label: "Rechazadas", data: porDia.map(d => d.rechazadas), backgroundColor: "#F44336" },
      { label: "Pendientes", data: porDia.map(d => d.pendientes), backgroundColor: "#FFC107" },
    ],
  };

  const barOptions: ChartOptions<"bar"> = {
    responsive: true,
    plugins: { title: { display: true, text: "Requisiciones por Día y Estado" } },
    scales: { x: { stacked: true }, y: { stacked: true, beginAtZero: true } },
  };

  const pieData = {
    labels: porProceso.map(p => p.proceso),
    datasets: [{
      data: porProceso.map(p => p.cantidad),
      backgroundColor: ["#4CAF50","#2196F3","#FFC107","#9C27B0","#607D8B","#FF5722","#00BCD4"].slice(0, porProceso.length),
      borderWidth: 1, borderColor: '#fff'
    }],
  };

  const pieOptions: ChartOptions<"pie"> = {
    responsive: true,
    plugins: { title: { display: true, text: "Distribución por Proceso" }, legend: { position: "right" } },
  };

  const lineData = {
    labels: porDia.map(d => new Date(d.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })),
    datasets: [{
      label: "Total de Requisiciones",
      data: porDia.map(d => d.total),
      borderColor: "#3F51B5",
      backgroundColor: "rgba(63, 81, 181, 0.1)",
      tension: 0.3,
      fill: true
    }],
  };

  const lineOptions: ChartOptions<"line"> = {
    responsive: true,
    plugins: { title: { display: true, text: "Tendencia de Requisiciones" } },
    scales: { y: { beginAtZero: true } },
  };

  // --- Resumen de procesos ---
  const resumenProcesos = [...porProceso];
  const processColors = porProceso.reduce((acc, proc, index) => {
    const colors = ["#4CAF50","#2196F3","#FFC107","#9C27B0","#607D8B","#FF5722","#00BCD4"];
    return { ...acc, [proc.proceso]: colors[index % colors.length] };
  }, {} as Record<string, string>);

  return (
    <div className="w-full p-4">
      <h2 className="text-lg font-semibold mb-4 text-gray-800">Estadísticas de Requisiciones</h2>

      <div className="charts-container grid md:grid-cols-2 gap-6">
        <div className="chart-card bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold mb-2">Distribución por Proceso</h3>
          <Pie data={pieData} options={pieOptions} />
        </div>

        <div className="chart-card bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold mb-2">Tendencia de Requisiciones</h3>
          <Line data={lineData} options={lineOptions} />
        </div>

        <div className="chart-card bg-white p-4 rounded-lg shadow md:col-span-2">
          <h3 className="font-semibold mb-2">Requisiciones por Día y Estado</h3>
          <Bar data={barData} options={barOptions} />
        </div>
      </div>

      {/* ---- Cuadro de Resumen Estilizado ---- */}
      <div className="resumen-procesos">
        <div className="resumen-procesos-header">
          <h3>Resumen de Procesos</h3>
        </div>
        
        <div>
          {resumenProcesos.map((item, index) => (
            <div key={index} className="resumen-procesos-item">
              <div className="resumen-procesos-item-left">
                <svg className="resumen-procesos-item-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                <span className="resumen-procesos-item-text">{item.proceso}</span>
              </div>
              <div className="resumen-procesos-item-right">
                <span className="resumen-procesos-item-count">{item.cantidad}</span>
                <span className="resumen-procesos-item-percent">({item.porcentaje}%)</span>
              </div>
            </div>
          ))}
          
          <div className="resumen-procesos-total">
            <span className="resumen-procesos-total-text">Total</span>
            <span className="resumen-procesos-total-count">
              {resumenProcesos.reduce((sum, item) => sum + item.cantidad, 0)} solicitudes
            </span>
          </div>
        </div>
      </div>

    </div>
  );
}
