import React, { createContext, useState, useEffect, useContext } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const verifyUser = async () => {
    const token = localStorage.getItem('crm_token')
    if (!token) {
      setUser(null)
      setLoading(false)
      return
    }

    try {
      const response = await api.get('/auth/me')
      setUser(response.data.user)
    } catch (err) {
      console.error('Error verificando sesión:', err)
      localStorage.removeItem('crm_token')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    verifyUser()
  }, [])

  const login = (token, userData) => {
    localStorage.setItem('crm_token', token)
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('crm_token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, verifyUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider')
  }
  return context
}
