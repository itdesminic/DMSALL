import React from 'react'

const menuItems = [
  { day: 'Lunes', time: 'Almuerzo', meal: 'Pollo al horno' },
  { day: 'Martes', time: 'Cena', meal: 'Sopa de verduras' },
  { day: 'Miércoles', time: 'Almuerzo', meal: 'Arroz con carne' }
]

export default function Food(){
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Menú semanal</h1>
          <p className="text-slate-600">Vista para cocina y comensales con confirmaciones.</p>
        </div>
        <button className="rounded bg-emerald-600 px-4 py-2 text-white">Publicar menú</button>
      </div>
      <div className="space-y-3">
        {menuItems.map((item) => (
          <div key={item.day + item.time} className="rounded border border-slate-200 p-3">
            <p className="font-medium">{item.day} · {item.time}</p>
            <p className="text-sm text-slate-500">{item.meal}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
