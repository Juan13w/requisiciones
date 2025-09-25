"use client"

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'

// Carga dinámica del componente Dashboard sin SSR
const Dashboard = dynamic(() => import('@/components/Dashboard'), { ssr: false })

const DashboardWrapper = () => {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    // Este efecto solo se ejecuta en el cliente
    setIsClient(true)
  }, [])

  return (
    <div className="min-h-screen">
      {isClient ? <Dashboard /> : <div>Cargando...</div>}
    </div>
  )
}

export default DashboardWrapper
