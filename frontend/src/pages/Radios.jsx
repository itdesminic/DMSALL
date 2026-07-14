import React from 'react'

const radios = [
  { code: 'RAD-001', area: 'Operaciones', status: 'Activo' },
  { code: 'RAD-002', area: 'Seguridad', status: 'En reparación' },
  { code: 'RAD-003', area: 'Mantenimiento', status: 'Disponible' }
]

export default function Radios(){
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Inventario de radios</h1>
          <p className="text-slate-600">Registro de radios, estados y movimientos.</p>
        </div>
        <button className="rounded bg-violet-600 px-4 py-2 text-white">Agregar radio</button>
      </div>
      <div className="space-y-3">
        {radios.map((radio) => (
          <div key={radio.code} className="flex items-center justify-between rounded border border-slate-200 p-3">
            <div>
              <p className="font-medium">{radio.code}</p>
              <p className="text-sm text-slate-500">Área: {radio.area}</p>
            </div>
            <span className="rounded bg-slate-100 px-3 py-1 text-sm">{radio.status}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
