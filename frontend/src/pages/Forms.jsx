import React, { useState, useEffect } from 'react'
import api, { getBackendUrl } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function Forms() {
  const { user } = useAuth()
  const [templates, setTemplates] = useState([])
  const [loadingTemplates, setLoadingTemplates] = useState(true)
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [formData, setFormData] = useState({})
  const [vehicles, setVehicles] = useState([])
  const [vehicleSearch, setVehicleSearch] = useState('')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  
  // Backend submission response states
  const [message, setMessage] = useState('')
  const [alertMessage, setAlertMessage] = useState('')
  const [pdfUrl, setPdfUrl] = useState('')
  const [loading, setLoading] = useState(false)

  // Fetch templates and vehicles from backend on load
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await api.get('/forms')
        setTemplates(response.data)
      } catch (err) {
        console.error('Error cargando plantillas:', err)
      } finally {
        setLoadingTemplates(false)
      }
    }
    const fetchVehicles = async () => {
      try {
        const response = await api.get('/forms/vehicles')
        setVehicles(response.data)
      } catch (err) {
        console.error('Error cargando vehículos:', err)
      }
    }
    fetchTemplates()
    fetchVehicles()
  }, [])

  const openTemplate = (templateName) => {
    const template = templates.find((item) => item.name === templateName)
    if (!template) return

    const initial = {}
    template.formFields.forEach((field) => {
      const fieldName = field.label
      if (field.type === 'checkbox') {
        initial[fieldName] = false
      } else if (field.type === 'select' && field.options) {
        const opts = field.options.split(',')
        // If it is a checklist, let's default to empty or Correcto
        if (field.options.includes('Correcto')) {
          initial[fieldName] = 'Correcto (✓)'
        } else {
          initial[fieldName] = opts[0]
        }
      } else {
        initial[fieldName] = ''
      }
    })
    
    setFormData(initial)
    setSelectedTemplate(templateName)
    setVehicleSearch('')
    setIsDropdownOpen(false)
    setMessage('')
    setAlertMessage('')
    setPdfUrl('')
  }

  const handleTextChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSelectOption = (fieldName, optionValue) => {
    setFormData({ ...formData, [fieldName]: optionValue })
  }

  const handleCheckboxChange = (fieldName, checked) => {
    setFormData({ ...formData, [fieldName]: checked })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setAlertMessage('')
    setPdfUrl('')
    try {
      const response = await api.post('/forms/submit', {
        formName: selectedTemplate,
        values: formData
      })
      
      setMessage(response.data.message)
      if (response.data.alertMessage) {
        setAlertMessage(response.data.alertMessage)
      }
      if (response.data.pdfUrl) {
        setPdfUrl(`${getBackendUrl()}${response.data.pdfUrl}`)
      }
    } catch (err) {
      console.error(err)
      setMessage(err.response?.data?.error || 'No se pudo enviar el formulario')
    } finally {
      setLoading(false)
    }
  }

  const activeTemplate = templates.find((item) => item.name === selectedTemplate)

  // Real-time critical safety checks on the frontend
  const checkCriticalAlert = () => {
    if (!selectedTemplate || selectedTemplate !== 'Inspección de Vehículo Liviano') return false

    // Check fatigue
    if (formData['¿Se siente Fatigado?'] === 'Sí') {
      return true
    }

    // Check if any checklist item is marked as Incorrecto
    let hasIncorrect = false
    Object.entries(formData).forEach(([key, value]) => {
      if (key.match(/^\d+\./) && value === 'Incorrecto (X)') {
        hasIncorrect = true
      }
    })
    return hasIncorrect
  }

  const isCritical = checkCriticalAlert()

  if (loadingTemplates) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-slate-500 animate-pulse text-lg font-medium">Cargando formularios disponibles...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Formularios Operativos</h1>
        <p className="text-sm text-slate-500 mt-1">
          Diligencia y consulta los reportes oficiales de la operación.
        </p>
      </div>

      {!selectedTemplate ? (
        // Grid of available templates
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => {
            const isVehicleForm = template.name === 'Revisión de Pre-Uso de Vehiculo Liviano'
            return (
              <div
                key={template.name}
                className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md hover:border-blue-500"
              >
                <div>
                  <div className={`inline-flex items-center rounded-lg px-3 py-1 text-xs font-medium mb-4 ${
                    isVehicleForm ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {template.area?.name || 'Operaciones'}
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 group-hover:text-blue-600 transition">
                    {template.name}
                  </h3>
                  <p className="mt-2 text-sm text-slate-500 line-clamp-3">
                    {isVehicleForm 
                      ? 'Formato FOR-13-015 de revisión de pre-uso semanal de vehículos livianos.' 
                      : `Formulario de registro y control para el área de ${template.area?.name || 'IT'}.`}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100">
                  <button
                    onClick={() => openTemplate(template.name)}
                    className="w-full rounded-xl bg-slate-50 py-2.5 px-4 text-center text-sm font-semibold text-slate-700 hover:bg-blue-600 hover:text-white transition"
                  >
                    Abrir Formulario
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        // Active Form View
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSelectedTemplate(null)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition"
            >
              ← Volver al listado
            </button>
            <div className="text-xs text-slate-400 font-mono">
              {selectedTemplate === 'Revisión de Pre-Uso de Vehiculo Liviano' ? 'Código: FOR-13-015 | Rev. 2.0' : ''}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="border-b border-slate-100 pb-4 mb-6">
              <h2 className="text-xl font-bold text-slate-900">{activeTemplate.name}</h2>
              <p className="text-sm text-slate-500 mt-1">Completa los campos requeridos a continuación. Todos los datos se guardarán en el historial.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {selectedTemplate === 'Revisión de Pre-Uso de Vehiculo Liviano' ? (
                <>
                  {/* Info general grid */}
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Información General</h3>
                  <div className="grid gap-4 md:grid-cols-3 bg-slate-50 p-4 rounded-xl mb-6">
                    {/* Vehículo precargado buscador */}
                    <div className="md:col-span-3 relative">
                      <label className="block text-xs font-bold text-blue-600 mb-1.5 uppercase">Buscar Camioneta por Placa o Supervisor</label>
                      <div className="relative z-10">
                        <input
                          type="text"
                          placeholder="Escribe la placa (ej: M358), el supervisor o modelo..."
                          value={vehicleSearch}
                          onFocus={() => setIsDropdownOpen(true)}
                          onChange={(e) => {
                            setVehicleSearch(e.target.value)
                            setIsDropdownOpen(true)
                          }}
                          className="w-full rounded-xl border-blue-200 bg-blue-50/20 p-3 text-sm focus:border-blue-500 focus:ring-blue-500 border font-semibold text-blue-900 placeholder-blue-400"
                        />
                        {vehicleSearch && (
                          <button
                            type="button"
                            onClick={() => {
                              setVehicleSearch('')
                              setIsDropdownOpen(true)
                              setFormData(prev => ({
                                ...prev,
                                'Placa del Vehículo': '',
                                'Código del Vehículo': '',
                                'Gerencia/Superintendencia': '',
                                'Supervisor de área': ''
                              }))
                            }}
                            className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 text-xs font-bold"
                          >
                            Limpiar
                          </button>
                        )}
                      </div>
                      
                      {isDropdownOpen && (
                        <>
                          <div className="fixed inset-0 z-0" onClick={() => setIsDropdownOpen(false)} />
                          <div className="absolute z-20 w-full mt-1 max-h-60 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg">
                            {vehicles
                              .filter(v => {
                                const term = vehicleSearch.toLowerCase()
                                return (
                                  v.plate.toLowerCase().includes(term) ||
                                  (v.employee || '').toLowerCase().includes(term) ||
                                  (v.type || '').toLowerCase().includes(term) ||
                                  (v.area || '').toLowerCase().includes(term)
                                )
                              })
                              .map(v => (
                                <div 
                                  key={v.plate}
                                  onClick={() => {
                                    setFormData(prev => ({
                                      ...prev,
                                      'Placa del Vehículo': v.plate,
                                      'Código del Vehículo': `C-${String(v.no).padStart(2, '0')}`,
                                      'Gerencia/Superintendencia': v.area || '',
                                      'Supervisor de área': v.employee || ''
                                    }))
                                    setVehicleSearch(`[${v.plate}] ${v.employee} - ${v.type}`)
                                    setIsDropdownOpen(false)
                                  }}
                                  className="px-4 py-2.5 hover:bg-blue-50/50 cursor-pointer text-sm border-b border-slate-100 last:border-0 text-slate-700 hover:text-slate-900"
                                >
                                  <span className="font-bold text-blue-600 font-mono">[{v.plate}]</span> {v.employee} - {v.type} ({v.area})
                                </div>
                              ))}
                          </div>
                        </>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Placa del Vehículo</label>
                      <input
                        type="text"
                        name="Placa del Vehículo"
                        value={formData['Placa del Vehículo'] || ''}
                        onChange={handleTextChange}
                        className="w-full rounded-lg border-slate-200 bg-white p-2.5 text-sm focus:border-blue-500 focus:ring-blue-500 border"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Código del Vehículo</label>
                      <input
                        type="text"
                        name="Código del Vehículo"
                        value={formData['Código del Vehículo'] || ''}
                        onChange={handleTextChange}
                        className="w-full rounded-lg border-slate-200 bg-white p-2.5 text-sm focus:border-blue-500 focus:ring-blue-500 border"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Hora</label>
                      <input
                        type="text"
                        name="Hora"
                        placeholder="HH:MM"
                        value={formData['Hora'] || ''}
                        onChange={handleTextChange}
                        className="w-full rounded-lg border-slate-200 bg-white p-2.5 text-sm focus:border-blue-500 focus:ring-blue-500 border"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Día de la Semana</label>
                      <select
                        name="Día de la Semana"
                        value={formData['Día de la Semana'] || 'Lunes'}
                        onChange={handleTextChange}
                        className="w-full rounded-lg border-slate-200 bg-white p-2.5 text-sm focus:border-blue-500 focus:ring-blue-500 border"
                      >
                        <option value="Lunes">Lunes</option>
                        <option value="Martes">Martes</option>
                        <option value="Miércoles">Miércoles</option>
                        <option value="Jueves">Jueves</option>
                        <option value="Viernes">Viernes</option>
                        <option value="Sábado">Sábado</option>
                        <option value="Domingo">Domingo</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Gerencia/Superintendencia</label>
                      <input
                        type="text"
                        name="Gerencia/Superintendencia"
                        value={formData['Gerencia/Superintendencia'] || ''}
                        onChange={handleTextChange}
                        className="w-full rounded-lg border-slate-200 bg-white p-2.5 text-sm focus:border-blue-500 focus:ring-blue-500 border"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Supervisor de Área</label>
                      <input
                        type="text"
                        name="Supervisor de área"
                        value={formData['Supervisor de área'] || ''}
                        onChange={handleTextChange}
                        className="w-full rounded-lg border-slate-200 bg-white p-2.5 text-sm focus:border-blue-500 focus:ring-blue-500 border"
                        required
                      />
                    </div>
                    {!user && (
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Inspección Realizada Por (Tu Nombre)</label>
                        <input
                          type="text"
                          name="Inspección realizada por"
                          value={formData['Inspección realizada por'] || ''}
                          onChange={handleTextChange}
                          className="w-full rounded-lg border-slate-200 bg-white p-2.5 text-sm focus:border-blue-500 focus:ring-blue-500 border"
                          required
                        />
                      </div>
                    )}
                  </div>

                  {/* Checklist Parameters split in two columns */}
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Parámetros a Inspeccionar</h3>
                  <div className="grid gap-6 md:grid-cols-2 border border-slate-100 rounded-xl p-4">
                    {/* Column 1: Items 1 to 16 */}
                    <div className="space-y-4">
                      {activeTemplate.formFields
                        .filter(f => f.label.match(/^[1-9]\.|^1[0-6]\./))
                        .map((field) => (
                          <div key={field.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-2 border-b border-slate-50 last:border-0">
                            <span className="text-xs text-slate-700 font-medium sm:max-w-[60%]">{field.label}</span>
                            <div className="grid grid-cols-3 sm:inline-flex w-full sm:w-auto rounded-lg border border-slate-200 p-0.5 bg-slate-50 text-xs font-semibold text-center">
                              <button
                                type="button"
                                onClick={() => handleSelectOption(field.label, 'Correcto (✓)')}
                                className={`py-2 px-1 sm:py-1 sm:px-2.5 rounded-md transition ${
                                  formData[field.label] === 'Correcto (✓)'
                                    ? 'bg-emerald-600 text-white shadow-sm'
                                    : 'text-slate-600 hover:bg-slate-200'
                                }`}
                              >
                                Correcto
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSelectOption(field.label, 'Incorrecto (X)')}
                                className={`py-2 px-1 sm:py-1 sm:px-2.5 rounded-md transition ${
                                  formData[field.label] === 'Incorrecto (X)'
                                    ? 'bg-rose-600 text-white shadow-sm'
                                    : 'text-slate-600 hover:bg-slate-200'
                                }`}
                              >
                                Incorrecto
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSelectOption(field.label, 'No Aplicable (N/A)')}
                                className={`py-2 px-1 sm:py-1 sm:px-2.5 rounded-md transition ${
                                  formData[field.label] === 'No Aplicable (N/A)'
                                    ? 'bg-slate-400 text-white shadow-sm'
                                    : 'text-slate-600 hover:bg-slate-200'
                                }`}
                              >
                                N/A
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>

                    {/* Column 2: Items 17 to 32 */}
                    <div className="space-y-4">
                      {activeTemplate.formFields
                        .filter(f => f.label.match(/^1[7-9]\.|^[2-3]\d\./))
                        .map((field) => (
                          <div key={field.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-2 border-b border-slate-50 last:border-0">
                            <span className="text-xs text-slate-700 font-medium sm:max-w-[60%]">{field.label}</span>
                            <div className="grid grid-cols-3 sm:inline-flex w-full sm:w-auto rounded-lg border border-slate-200 p-0.5 bg-slate-50 text-xs font-semibold text-center">
                              <button
                                type="button"
                                onClick={() => handleSelectOption(field.label, 'Correcto (✓)')}
                                className={`py-2 px-1 sm:py-1 sm:px-2.5 rounded-md transition ${
                                  formData[field.label] === 'Correcto (✓)'
                                    ? 'bg-emerald-600 text-white shadow-sm'
                                    : 'text-slate-600 hover:bg-slate-200'
                                }`}
                              >
                                Correcto
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSelectOption(field.label, 'Incorrecto (X)')}
                                className={`py-2 px-1 sm:py-1 sm:px-2.5 rounded-md transition ${
                                  formData[field.label] === 'Incorrecto (X)'
                                    ? 'bg-rose-600 text-white shadow-sm'
                                    : 'text-slate-600 hover:bg-slate-200'
                                }`}
                              >
                                Incorrecto
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSelectOption(field.label, 'No Aplicable (N/A)')}
                                className={`py-2 px-1 sm:py-1 sm:px-2.5 rounded-md transition ${
                                  formData[field.label] === 'No Aplicable (N/A)'
                                    ? 'bg-slate-400 text-white shadow-sm'
                                    : 'text-slate-600 hover:bg-slate-200'
                                }`}
                              >
                                N/A
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Fatigue segment */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/50 mt-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h4 className="text-sm font-semibold text-slate-800">¿Se siente Fatigado?</h4>
                        <p className="text-xs text-slate-500">Debe responder con honestidad para su seguridad y la de sus compañeros.</p>
                      </div>
                      <div className="grid grid-cols-2 sm:inline-flex w-full sm:w-auto rounded-lg border border-slate-200 p-0.5 bg-white text-xs font-semibold text-center">
                        <button
                          type="button"
                          onClick={() => handleSelectOption('¿Se siente Fatigado?', 'Sí')}
                          className={`py-2.5 px-1 sm:px-4 sm:py-2 rounded-md transition ${
                            formData['¿Se siente Fatigado?'] === 'Sí'
                              ? 'bg-rose-600 text-white shadow-sm'
                              : 'text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          Sí, me siento fatigado
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSelectOption('¿Se siente Fatigado?', 'No')}
                          className={`py-2.5 px-1 sm:px-4 sm:py-2 rounded-md transition ${
                            formData['¿Se siente Fatigado?'] === 'No' || !formData['¿Se siente Fatigado?']
                              ? 'bg-emerald-600 text-white shadow-sm'
                              : 'text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          No me siento fatigado
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Observations */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Observaciones</label>
                    <textarea
                      name="Observaciones"
                      value={formData['Observaciones'] || ''}
                      onChange={handleTextChange}
                      rows="3"
                      className="w-full rounded-lg border-slate-200 p-2.5 text-sm border focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Agregue comentarios adicionales..."
                    />
                  </div>
                </>
              ) : (
                // Render other standard forms
                <div className="space-y-4">
                  {activeTemplate.formFields.map((field) => {
                    const fieldName = field.label
                    const isCheckbox = field.type === 'checkbox'
                    return (
                      <div key={field.id}>
                        <label className="mb-1 block text-sm font-medium text-slate-700">{fieldName}</label>
                        {isCheckbox ? (
                          <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={Boolean(formData[fieldName])}
                              onChange={(e) => handleCheckboxChange(fieldName, e.target.checked)}
                              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                            />
                            Marcar como cumplido
                          </label>
                        ) : field.type === 'textarea' ? (
                          <textarea
                            name={fieldName}
                            value={formData[fieldName] || ''}
                            onChange={handleTextChange}
                            rows="3"
                            className="w-full rounded-lg border-slate-200 border p-2.5 text-sm focus:border-blue-500"
                            required
                          />
                        ) : (
                          <input
                            type="text"
                            name={fieldName}
                            value={formData[fieldName] || ''}
                            onChange={handleTextChange}
                            className="w-full rounded-lg border-slate-200 border p-2.5 text-sm focus:border-blue-500"
                            required
                          />
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Dynamic Safety Alert on the UI */}
              {isCritical && (
                <div className="rounded-xl border border-rose-300 bg-rose-50 p-4 text-sm text-rose-800 flex items-start gap-3 animate-bounce">
                  <span className="text-xl">⚠️</span>
                  <div>
                    <h4 className="font-bold">¡ALERTA CRÍTICA DE SEGURIDAD!</h4>
                    <p className="mt-1 text-xs">
                      Ha seleccionado una falla mecánica ("Incorrecto") o reportó fatiga. Al enviar este formulario, el estado quedará registrado como **RECHAZADO**. El equipo debe **DETENER SU MARCHA** de inmediato para corregir las condiciones.
                    </p>
                  </div>
                </div>
              )}

              {/* Submit button or Success state */}
              {pdfUrl ? (
                <div className="flex flex-col sm:flex-row items-center gap-4 bg-emerald-50 border border-emerald-200 rounded-xl p-4 w-full justify-between">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                    <span className="text-xl">✓</span> ¡Formulario ya enviado y registrado con éxito en la base de datos!
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      openTemplate(selectedTemplate)
                    }}
                    className="w-full sm:w-auto rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-xs font-bold transition shadow-sm whitespace-nowrap"
                  >
                    🔄 Llenar otro formulario
                  </button>
                </div>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full sm:w-auto rounded-xl px-6 py-3 text-sm font-bold text-white shadow-sm transition ${
                    isCritical 
                      ? 'bg-rose-600 hover:bg-rose-700 focus:ring-rose-500' 
                      : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                  } disabled:opacity-60`}
                >
                  {loading ? 'Procesando y Generando PDF...' : 'Enviar y Generar PDF'}
                </button>
              )}
            </form>
          </div>

          {/* Submission response */}
          {message && (
            <div className={`rounded-xl border p-5 text-sm ${
              alertMessage 
                ? 'border-amber-300 bg-amber-50 text-amber-900 shadow-sm' 
                : 'border-emerald-200 bg-emerald-50 text-emerald-800'
            }`}>
              <div className="flex items-start gap-3">
                <span className="text-lg">{alertMessage ? '⚠️' : '✓'}</span>
                <div>
                  <h4 className="font-bold">{message}</h4>
                  {alertMessage && (
                    <p className="mt-2 text-xs font-semibold text-rose-800 bg-rose-100/70 p-3 rounded-lg border border-rose-200/80">
                      {alertMessage}
                    </p>
                  )}
                  {pdfUrl && (
                    <div className="mt-4">
                      <a
                        href={pdfUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 transition px-3.5 py-2 font-bold text-slate-800 shadow-sm"
                      >
                        📄 Descargar PDF Oficial
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
