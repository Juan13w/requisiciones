"use client"

import { useState, useEffect } from "react"
import { useRouter } from 'next/navigation'
import LoginForm from "./LoginForm"
import "./Navbar.css"

interface UserInfo {
  id: number
  email: string
  isAdmin?: boolean
}

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [showLoginForm, setShowLoginForm] = useState(false)
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [scrolled, setScrolled] = useState(false)
  const router = useRouter()

  // Verificar si el usuario ya está autenticado al cargar
  useEffect(() => {
    const usuarioLogueado = localStorage.getItem("usuarioLogueado") === "true"
    const usuarioData = localStorage.getItem("usuarioData")
    
    if (usuarioLogueado && usuarioData) {
      try {
        const user = JSON.parse(usuarioData)
        setUserInfo(user)
        setIsLoggedIn(true)
      } catch (error) {
        console.error("Error al analizar los datos del usuario:", error)
      }
    }
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled)
      }
    }

    document.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      document.removeEventListener('scroll', handleScroll)
    }
  }, [scrolled])

  const handleLoginClick = () => {
    setShowLoginForm(true)
  }

  const handleLogin = (userData: UserInfo) => {
    // Guardar datos en el estado local
    setUserInfo(userData)
    setIsLoggedIn(true)
    setShowLoginForm(false)
    
    // Guardar en localStorage
    localStorage.setItem("usuarioLogueado", "true")
    localStorage.setItem("usuarioData", JSON.stringify(userData))
    
    // Redirigir al panel de administración
    router.push('/admin')
  }

  const handleLogout = () => {
    // Limpiar estado
    setIsLoggedIn(false)
    setUserInfo(null)
    
    // Limpiar localStorage
    localStorage.removeItem("usuarioLogueado")
    localStorage.removeItem("usuarioData")
    
    // Redirigir a la página principal
    router.push('/')
  }

  const handleCloseForm = () => {
    setShowLoginForm(false)
  }

  return (
    <>
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="navbar-container">
          <div className="navbar-brand">
            <h2>TurnoSync</h2>
          </div>
          <div className="navbar-logos">
            {/* Logos have been moved to the footer */}
          </div>
          <div className="navbar-menu">
            {!isLoggedIn ? (
              <button className="navbar-button login-btn" onClick={handleLoginClick}>
                Inicio de sesión
              </button>
            ) : (
              <div className="user-menu">
                <span className="user-greeting">
                  {userInfo?.isAdmin
                    ? `${userInfo.email} (Admin)`
                    : userInfo?.email}
                </span>
                <button className="navbar-button logout-btn" onClick={handleLogout}>
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>
      
      {showLoginForm && (
        <LoginForm 
          isOpen={showLoginForm} 
          onClose={handleCloseForm} 
          onLogin={handleLogin} 
        />
      )}
    </>
  )
}

export default Navbar
