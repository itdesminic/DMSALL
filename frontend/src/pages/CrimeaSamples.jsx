import React, { useState, useRef } from 'react'
import api, { getBackendUrl } from '../services/api'
import { Link } from 'react-router-dom'
import SignatureCanvas from 'react-signature-canvas'

export default function CrimeaSamples() {
  const realizadoSigRef = useRef(null)
  const revisadoSigRef = useRef(null)
  const [viewMode, setViewMode] = useState('list') // 'list' or 'create'
  const [submissions, setSubmissions] = useState([])
  const [listLoading, setListLoading] = useState(true)
  const [listError, setListError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  // Email modal state
  const [emailModalId, setEmailModalId] = useState(null)
  const [recipientEmail, setRecipientEmail] = useState('')
  const [emailSending, setEmailSending] = useState(false)
  const [emailMessage, setEmailMessage] = useState('')
  const [emailError, setEmailError] = useState(false)

  const [samples, setSamples] = useState([
    {
      date: new Date().toLocaleDateString('es-ES'),
      sampleId: '',
      point: 'Crimea',
      timeTaken: '',
      timeDelivered: '',
      ph: '',
      temp: '',
      climate: 'Lluvioso',
      sampler: '',
      receiver: ''
    }
  ])

  const [realizadoPor, setRealizadoPor] = useState('')
  const [revisadoPor, setRevisadoPor] = useState('Pavel Useda')
  const [sendToMelissa, setSendToMelissa] = useState(true)
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)
  const [pdfUrl, setPdfUrl] = useState('')

  const fetchSubmissions = async () => {
    setListLoading(true)
    setListError('')
    try {
      const response = await api.get('/forms/public-crimea')
      setSubmissions(response.data)
    } catch (err) {
      console.error(err)
      setListError('No se pudieron cargar los reportes anteriores.')
    } finally {
      setListLoading(false)
    }
  }

  useEffect(() => {
    fetchSubmissions()
  }, [])

  const handleOpenEmailModal = (submissionId) => {
    setEmailModalId(submissionId)
    setRecipientEmail('')
    setEmailMessage('')
    setEmailError(false)
  }

  const handleSendEmail = async (e) => {
    e.preventDefault()
    setEmailSending(true)
    setEmailMessage('')
    setEmailError(false)
    try {
      const response = await api.post('/forms/share-email', {
        submissionId: emailModalId,
        recipientEmail: recipientEmail
      })
      setEmailMessage(response.data.message || 'Correo enviado con éxito.')
      setTimeout(() => {
        setEmailModalId(null)
      }, 1500)
    } catch (err) {
      console.error(err)
      setEmailError(true)
      setEmailMessage(err.response?.data?.error || 'Error al enviar el correo.')
    } finally {
      setEmailSending(false)
    }
  }

  // Add row
  const addRow = () => {
    setSamples((prev) => [
      ...prev,
      {
        date: new Date().toLocaleDateString('es-ES'),
        sampleId: '',
        point: 'Crimea',
        timeTaken: '',
        timeDelivered: '',
        ph: '',
        temp: '',
        climate: 'Lluvioso',
        sampler: '',
        receiver: ''
      }
    ])
  }

  // Delete row
  const removeRow = (index) => {
    if (samples.length === 1) return
    setSamples((prev) => prev.filter((_, idx) => idx !== index))
  }

  // Handle cell change
  const handleCellChange = (index, field, value) => {
    setSamples((prev) =>
      prev.map((row, idx) => (idx === index ? { ...row, [field]: value } : row))
    )
  }

  // Compress & read image to base64
  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files)
    if (photos.length + files.length > 2) {
      alert('Solo puedes adjuntar un máximo de 2 fotografías.')
      return
    }

    files.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (event) => {
        const img = new Image()
        img.onload = () => {
          // Scale down image to avoid huge base64 strings
          const canvas = document.createElement('canvas')
          const max_width = 800
          const scale = max_width / img.width
          canvas.width = max_width
          canvas.height = img.height * scale
          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7) // compress to 70% quality
          setPhotos((prev) => [...prev, dataUrl])
        }
        img.src = event.target.result
      }
      reader.readAsDataURL(file)
    })
  }

  const removePhoto = (index) => {
    setPhotos((prev) => prev.filter((_, idx) => idx !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setIsError(false)
    setPdfUrl('')

    // Basic validation
    // Signature validation
    const realizadoSig = realizadoSigRef.current.isEmpty() ? null : realizadoSigRef.current.getCanvas().toDataURL('image/png')
    const revisadoSig = revisadoSigRef.current.isEmpty() ? null : revisadoSigRef.current.getCanvas().toDataURL('image/png')

    const emptyFields = samples.some(s => !s.sampleId || !s.point || !s.timeTaken || !s.timeDelivered || !s.ph || !s.temp || !s.sampler || !s.receiver)
    if (emptyFields || !realizadoPor || !revisadoPor) {
      setIsError(true)
      setMessage('Por favor completa todos los campos requeridos de la tabla y los nombres de Realizado y Revisado.')
      setLoading(false)
      return
    }

    try {
      const response = await api.post('/forms/submit', {
        formName: 'Formato de Control de Toma y Entrega de Muestras de Agua',
        values: {
          Muestras: JSON.stringify(samples),
          'Realizado por': realizadoPor,
          'Revisado por': revisadoPor,
          'Firma Realizado': realizadoSig,
          'Firma Revisado': revisadoSig,
          Fotos: JSON.stringify(photos)
        },
        sendToMelissa
      })

      setMessage('Formulario enviado y reporte remitido con éxito por correo.')
      if (response.data.pdfUrl) {
        setPdfUrl(`${getBackendUrl()}${response.data.pdfUrl}`)
      }

      // Reset
      setSamples([
        {
          date: new Date().toLocaleDateString('es-ES'),
          sampleId: '',
          point: 'Crimea',
          timeTaken: '',
          timeDelivered: '',
          ph: '',
          temp: '',
          climate: 'Lluvioso',
          sampler: '',
          receiver: ''
        }
      ])
      setRealizadoPor('')
      setRevisadoPor('Pavel Useda')
      if (realizadoSigRef.current) realizadoSigRef.current.clear()
      if (revisadoSigRef.current) revisadoSigRef.current.clear()
      setPhotos([])
      fetchSubmissions()
      setTimeout(() => {
        setViewMode('list')
      }, 2000)
    } catch (err) {
      console.error(err)
      setIsError(true)
      setMessage(err.response?.data?.error || 'Error al enviar el formulario.')
    } finally {
      setLoading(false)
    }
  }

  // Filter Crimea submissions
  const filteredSubmissions = submissions.filter((sub) => {
    try {
      const answers = JSON.parse(sub.answers || '{}')
      const realizado = (answers['Realizado por'] || '').toLowerCase()
      const revisado = (answers['Revisado por'] || '').toLowerCase()
      const search = searchTerm.toLowerCase()
      return realizado.includes(search) || revisado.includes(search) || sub.createdAt.includes(search)
    } catch(e) {
      return false
    }
  })

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-2 sm:px-4">
      {/* Header Branding Equinox Gold Style */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 pb-4 gap-4">
        <div className="flex items-center gap-3">
          <img src="/logo.jpg" alt="Logo Equinox Gold" className="h-10 object-contain rounded bg-white p-1" />
          <div>
            <h1 className="text-md font-bold text-slate-900 leading-tight">Control de Toma y Entrega</h1>
            <p className="text-xs text-slate-500 font-medium">Mina La Libertad | Crimea</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {viewMode === 'list' ? (
            <button
              onClick={() => setViewMode('create')}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-bold shadow-sm transition"
            >
              ➕ Registrar Muestras
            </button>
          ) : (
            <button
              onClick={() => setViewMode('list')}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition"
            >
              ← Volver al Listado
            </button>
          )}
          <div className="text-xs font-mono text-slate-500 bg-slate-100/80 px-3 py-1.5 rounded-lg border border-slate-200 hidden sm:block">
            Código: FOR-21-009 | Rev. 0
          </div>
        </div>
      </div>

      {viewMode === 'list' ? (
        /* LIST MODE VIEW */
        <div className="space-y-6">
          {/* Search bar */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Buscar por responsable o fecha</label>
            <input
              type="text"
              placeholder="Escribe el nombre de quien realizó o revisó..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {/* Submissions table */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              {listLoading ? (
                <div className="py-20 text-center text-slate-500 animate-pulse font-medium">
                  Cargando historial de muestras...
                </div>
              ) : listError ? (
                <div className="py-20 text-center text-rose-500 font-semibold">
                  ⚠️ {listError}
                </div>
              ) : (
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase">
                      <th className="px-6 py-4">Fecha y Hora</th>
                      <th className="px-6 py-4">Muestras</th>
                      <th className="px-6 py-4">Realizado por</th>
                      <th className="px-6 py-4">Revisado por</th>
                      <th className="px-6 py-4 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {filteredSubmissions.length > 0 ? (
                      filteredSubmissions.map((sub) => {
                        let answers = {}
                        let sampleCount = 0
                        try {
                          answers = JSON.parse(sub.answers || '{}')
                          sampleCount = JSON.parse(answers['Muestras'] || '[]').length
                        } catch(e) {}

                        return (
                          <tr key={sub.id} className="hover:bg-slate-50/50 transition">
                            <td className="px-6 py-4 text-slate-800">
                              <div>{new Date(sub.createdAt).toLocaleDateString('es-ES')}</div>
                              <div className="text-xs text-slate-400 font-normal mt-0.5">
                                {new Date(sub.createdAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                                💧 {sampleCount} {sampleCount === 1 ? 'muestra' : 'muestras'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-slate-900 font-semibold">{answers['Realizado por'] || 'Anónimo'}</td>
                            <td className="px-6 py-4 text-slate-600 font-semibold">{answers['Revisado por'] || '-'}</td>
                            <td className="px-6 py-4 text-right">
                              <div className="inline-flex gap-2">
                                <a
                                  href={`${getBackendUrl()}/api/forms/pdf/${sub.id}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm"
                                >
                                  📄 PDF
                                </a>
                                <button
                                  onClick={() => handleOpenEmailModal(sub.id)}
                                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm"
                                >
                                  ✉️ Correo
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center py-16 text-slate-400">
                          <span className="text-3xl block mb-2">🔍</span>
                          No se encontraron registros de toma de muestras de agua.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* CREATE MODE VIEW (FORM) */
        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-1">Muestras de Agua (FOR-21-009)</h2>
          <p className="text-xs text-slate-500 mb-6">Completa la tabla con los registros de la jornada y presiona Enviar para despachar el reporte PDF por correo.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Scrollable table container */}
            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-slate-50/50">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                    <th className="px-3 py-3 w-24">Fecha</th>
                    <th className="px-3 py-3 w-36">ID Muestra</th>
                    <th className="px-3 py-3 w-40">Punto Muestreo</th>
                    <th className="px-3 py-3 w-28">H. Toma</th>
                    <th className="px-3 py-3 w-28">H. Entrega</th>
                    <th className="px-3 py-3 w-20">pH</th>
                    <th className="px-3 py-3 w-20">T° (C°)</th>
                    <th className="px-3 py-3 w-32">Clima</th>
                    <th className="px-3 py-3 w-36">R. Muestreo</th>
                    <th className="px-3 py-3 w-36">R. Recepción</th>
                    <th className="px-3 py-3 text-center w-12">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {samples.map((row, index) => (
                    <tr key={index} className="bg-white hover:bg-slate-50/30 transition">
                      <td className="px-2.5 py-2">
                        <input
                          type="text"
                          value={row.date}
                          onChange={(e) => handleCellChange(index, 'date', e.target.value)}
                          className="w-full rounded border-slate-200 p-1 text-xs focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </td>
                      <td className="px-2.5 py-2">
                        <input
                          type="text"
                          placeholder="ej: MW-21-01"
                          value={row.sampleId}
                          onChange={(e) => handleCellChange(index, 'sampleId', e.target.value)}
                          className="w-full rounded border-slate-200 p-1 text-xs focus:ring-blue-500"
                          required
                        />
                      </td>
                      <td className="px-2.5 py-2">
                        <input
                          type="text"
                          placeholder="ej: Crimea"
                          value={row.point}
                          onChange={(e) => handleCellChange(index, 'point', e.target.value)}
                          className="w-full rounded border-slate-200 p-1 text-xs focus:ring-blue-500"
                          required
                        />
                      </td>
                      <td className="px-2.5 py-2">
                        <input
                          type="text"
                          placeholder="HH:MM"
                          value={row.timeTaken}
                          onChange={(e) => handleCellChange(index, 'timeTaken', e.target.value)}
                          className="w-full rounded border-slate-200 p-1 text-xs focus:ring-blue-500"
                          required
                        />
                      </td>
                      <td className="px-2.5 py-2">
                        <input
                          type="text"
                          placeholder="HH:MM"
                          value={row.timeDelivered}
                          onChange={(e) => handleCellChange(index, 'timeDelivered', e.target.value)}
                          className="w-full rounded border-slate-200 p-1 text-xs focus:ring-blue-500"
                          required
                        />
                      </td>
                      <td className="px-2.5 py-2">
                        <input
                          type="text"
                          placeholder="pH"
                          value={row.ph}
                          onChange={(e) => handleCellChange(index, 'ph', e.target.value)}
                          className="w-full rounded border-slate-200 p-1 text-xs focus:ring-blue-500"
                          required
                        />
                      </td>
                      <td className="px-2.5 py-2">
                        <input
                          type="text"
                          placeholder="T°"
                          value={row.temp}
                          onChange={(e) => handleCellChange(index, 'temp', e.target.value)}
                          className="w-full rounded border-slate-200 p-1 text-xs focus:ring-blue-500"
                          required
                        />
                      </td>
                      <td className="px-2.5 py-2">
                        <select
                          value={row.climate}
                          onChange={(e) => handleCellChange(index, 'climate', e.target.value)}
                          className="w-full rounded border-slate-200 p-1 text-xs focus:ring-blue-500 bg-white"
                        >
                          <option value="Lluvioso">Lluvioso</option>
                          <option value="Soleado">Soleado</option>
                          <option value="Nublado">Nublado</option>
                        </select>
                      </td>
                      <td className="px-2.5 py-2">
                        <input
                          type="text"
                          placeholder="Nombre"
                          value={row.sampler}
                          onChange={(e) => handleCellChange(index, 'sampler', e.target.value)}
                          className="w-full rounded border-slate-200 p-1 text-xs focus:ring-blue-500"
                          required
                        />
                      </td>
                      <td className="px-2.5 py-2">
                        <input
                          type="text"
                          placeholder="Nombre"
                          value={row.receiver}
                          onChange={(e) => handleCellChange(index, 'receiver', e.target.value)}
                          className="w-full rounded border-slate-200 p-1 text-xs focus:ring-blue-500"
                          required
                        />
                      </td>
                      <td className="px-2.5 py-2 text-center">
                        <button
                          type="button"
                          onClick={() => removeRow(index)}
                          disabled={samples.length === 1}
                          className="text-rose-500 hover:bg-rose-50 p-1.5 rounded transition disabled:opacity-30"
                          title="Eliminar fila"
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Add row button */}
            <div className="flex">
              <button
                type="button"
                onClick={addRow}
                className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 transition px-3.5 py-2 rounded-xl border border-blue-200/50"
              >
                ➕ Añadir Fila de Muestra
              </button>
            </div>

            {/* Photos attachments container */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/50 space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-slate-800">Fotografías Adjuntas de Muestreo</h4>
                <p className="text-xs text-slate-500">Puedes adjuntar un máximo de 2 fotografías representativas de la jornada.</p>
              </div>
              
              <div className="flex flex-wrap gap-4 items-center">
                {/* Photo Upload Box */}
                {photos.length < 2 && (
                  <label className="h-28 w-28 rounded-xl border-2 border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50/20 transition cursor-pointer flex flex-col items-center justify-center gap-1.5 text-center text-slate-400">
                    <span className="text-2xl">📷</span>
                    <span className="text-[10px] font-bold">Subir Foto</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                      multiple
                    />
                  </label>
                )}

                {/* Uploaded Photos Previews */}
                {photos.map((photo, idx) => (
                  <div key={idx} className="relative h-28 w-28 rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-white group">
                    <img src={photo} alt="Preview" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removePhoto(idx)}
                      className="absolute top-1 right-1 h-5 w-5 bg-black/60 hover:bg-rose-600 rounded-full flex items-center justify-center text-[10px] font-bold text-white transition"
                      title="Eliminar foto"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Signature names (Realizado por and Revisado por) */}
            <div className="grid gap-6 sm:grid-cols-2 bg-slate-50/50 p-5 rounded-2xl border border-slate-200">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Realizado por (Nombre)</label>
                  <input
                    type="text"
                    placeholder="Nombre de quien realiza el muestreo"
                    value={realizadoPor}
                    onChange={(e) => setRealizadoPor(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-blue-500 focus:ring-blue-500 bg-white font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Firma de Realizado</label>
                  <div className="border border-slate-200 rounded-xl bg-white overflow-hidden">
                    <SignatureCanvas
                      ref={realizadoSigRef}
                      penColor="black"
                      canvasProps={{ className: 'w-full h-32 bg-white cursor-crosshair' }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => realizadoSigRef.current.clear()}
                    className="mt-1.5 text-[10px] font-bold text-slate-500 hover:text-rose-500 transition"
                  >
                    Clear/Limpiar Firma
                  </button>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Revisado por (Nombre)</label>
                  <input
                    type="text"
                    placeholder="Nombre del supervisor revisor"
                    value={revisadoPor}
                    onChange={(e) => setRevisadoPor(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-blue-500 focus:ring-blue-500 bg-white font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Firma de Revisado</label>
                  <div className="border border-slate-200 rounded-xl bg-white overflow-hidden">
                    <SignatureCanvas
                      ref={revisadoSigRef}
                      penColor="black"
                      canvasProps={{ className: 'w-full h-32 bg-white cursor-crosshair' }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => revisadoSigRef.current.clear()}
                    className="mt-1.5 text-[10px] font-bold text-slate-500 hover:text-rose-500 transition"
                  >
                    Clear/Limpiar Firma
                  </button>
                </div>
              </div>
            </div>

            {/* Email Recipient copy to Melissa */}
            <div className="flex items-center gap-2 text-sm text-slate-700 select-none">
              <input
                type="checkbox"
                id="sendToMelissa"
                checked={sendToMelissa}
                onChange={(e) => setSendToMelissa(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4 cursor-pointer"
              />
              <label htmlFor="sendToMelissa" className="cursor-pointer font-medium text-xs">
                Enviar copia también a **Melissa Lazo** (melissa.lazo@equinoxgold.com)
              </label>
            </div>

            {/* Feedback messages */}
            {message && (
              <div className={`p-4 rounded-xl border text-sm font-semibold flex items-center gap-2.5 ${
                isError ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
              }`}>
                <span>{isError ? '❌' : '✓'}</span>
                <div>
                  <div>{message}</div>
                  {pdfUrl && (
                    <a
                      href={pdfUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-block text-xs text-blue-600 underline font-bold mt-1"
                    >
                      Abrir Reporte PDF Generado
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Submit */}
            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 transition text-sm font-bold text-white shadow-sm disabled:opacity-60"
              >
                {loading ? 'Enviando Reporte...' : 'Enviar Muestras de Agua'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Email Modal */}
      {emailModalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-250">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50">
              <div>
                <h3 className="text-md font-bold text-slate-900">Enviar Reporte por Correo</h3>
                <p className="text-xs text-slate-500 mt-0.5">El reporte PDF se adjuntará automáticamente.</p>
              </div>
              <button
                onClick={() => setEmailModalId(null)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 rounded-lg hover:bg-slate-200/50 transition"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSendEmail} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Correo Destinatario</label>
                <input
                  type="email"
                  placeholder="ejemplo@empresa.com"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              {emailMessage && (
                <div className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
                  emailError ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                }`}>
                  <span>{emailError ? '❌' : '✓'}</span>
                  <span>{emailMessage}</span>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEmailModalId(null)}
                  className="px-4 py-2 text-xs font-bold border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={emailSending}
                  className="px-4 py-2 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition disabled:opacity-60"
                >
                  {emailSending ? 'Enviando...' : 'Enviar Correo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
