import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'

export default function Login(){
  const { register, handleSubmit } = useForm()
  const navigate = useNavigate()
  const { login } = useAuth()

  const onSubmit = async (data) => {
    try {
      const response = await api.post('/auth/login', data)
      login(response.data.token, response.data.user)
      navigate('/')
    } catch (err) {
      console.error(err)
      alert(err.response?.data?.error || 'Error al iniciar sesión')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="w-full max-w-md bg-white p-6 rounded shadow">
        <h2 className="text-2xl font-semibold mb-4">Iniciar sesión</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <label className="block text-sm mb-1">Email</label>
            <input type="email" {...register('email')} className="w-full border p-2 rounded" placeholder="admin@empresa.local" />
          </div>
          <div className="mb-4">
            <label className="block text-sm mb-1">Contraseña</label>
            <input type="password" {...register('password')} className="w-full border p-2 rounded" placeholder="Admin123*" />
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">Entrar</button>
        </form>
      </div>
    </div>
  )
}
