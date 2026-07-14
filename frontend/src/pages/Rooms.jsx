import React from 'react'

const rooms = [
  { name: 'Sala A', date: 'Hoy', status: 'Disponible' },
  { name: 'Sala B', date: 'Mañana', status: 'Solicitada' },
  { name: 'Sala C', date: 'Próxima semana', status: 'Disponible' }
]

export default function Rooms(){
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Salas de reuniones</h1>
          <p className="text-slate-600">Solicitud de sala con estado y calendario.</p>
        </div>
        <button className="rounded bg-amber-600 px-4 py-2 text-white">Solicitar sala</button>
      </div>
      <div className="space-y-3">
        {rooms.map((room) => (
          <div key={room.name} className="flex items-center justify-between rounded border border-slate-200 p-3">
            <div>
              <p className="font-medium">{room.name}</p>
              <p className="text-sm text-slate-500">{room.date}</p>
            </div>
            <span className="rounded bg-slate-100 px-3 py-1 text-sm">{room.status}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
