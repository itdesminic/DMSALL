import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// 1. Submit Request (Public)
export async function submitRequest(req, res) {
  const { guestName, guestEmail, startDate, endDate, account } = req.body;

  if (!guestName || !startDate || !endDate || !account) {
    return res.status(400).json({ error: 'Nombre del huésped, fecha de inicio, fecha de fin y cuenta a cargar son obligatorios.' });
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return res.status(400).json({ error: 'Fechas de inicio o fin inválidas.' });
  }

  if (end <= start) {
    return res.status(400).json({ error: 'La fecha de salida debe ser posterior a la fecha de entrada.' });
  }

  // Validate 2 days in advance
  const minStartDate = new Date();
  minStartDate.setDate(minStartDate.getDate() + 2);
  minStartDate.setHours(0, 0, 0, 0);

  const inputStart = new Date(startDate);
  inputStart.setHours(0, 0, 0, 0);

  if (inputStart < minStartDate) {
    return res.status(400).json({ error: 'Debe reservar con al menos 2 días de anticipación.' });
  }

  // Calculate days difference
  const diffTime = Math.abs(end - start);
  const daysNum = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  try {
    const newRequest = await prisma.lodgingRequest.create({
      data: {
        guestName,
        guestEmail: guestEmail || null,
        days: daysNum,
        startDate: start,
        endDate: end,
        account,
        status: 'pending'
      }
    });
    res.status(201).json(newRequest);
  } catch (err) {
    console.error('Error al crear solicitud de hospedaje:', err);
    res.status(500).json({ error: 'Error al enviar la solicitud de hospedaje.' });
  }
}

// 2. List Requests (Admin/Auth)
export async function listRequests(req, res) {
  try {
    const requests = await prisma.lodgingRequest.findMany({
      include: {
        location: true,
        room: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(requests);
  } catch (err) {
    console.error('Error al listar solicitudes de hospedaje:', err);
    res.status(500).json({ error: 'Error al obtener las solicitudes.' });
  }
}

// 3. Update Request Status (Admin/Auth/User)
export async function updateRequestStatus(req, res) {
  const { id } = req.params;
  const { status, locationId, roomId } = req.body;

  if (!['pending', 'approved', 'rejected', 'cancelled'].includes(status)) {
    return res.status(400).json({ error: 'Estado inválido. Debe ser pending, approved, rejected o cancelled.' });
  }

  try {
    const requestId = parseInt(id, 10);
    const existing = await prisma.lodgingRequest.findUnique({
      where: { id: requestId }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Solicitud de hospedaje no encontrada.' });
    }

    const updateData = { status };

    // If request was approved and is now being rejected or cancelled, release the room
    if (existing.status === 'approved' && existing.roomId && (status === 'rejected' || status === 'cancelled')) {
      await prisma.lodgingRoom.update({
        where: { id: existing.roomId },
        data: { status: 'available' }
      });
      updateData.locationId = null;
      updateData.roomId = null;
    }

    if (status === 'approved') {
      if (!locationId || !roomId) {
        return res.status(400).json({ error: 'Debe especificar el local y el cuarto para la aprobación.' });
      }
      updateData.locationId = parseInt(locationId, 10);
      updateData.roomId = parseInt(roomId, 10);

      // Update room to occupied
      await prisma.lodgingRoom.update({
        where: { id: updateData.roomId },
        data: { status: 'occupied' }
      });
    } else if (status === 'rejected') {
      updateData.locationId = null;
      updateData.roomId = null;
    }

    const updatedRequest = await prisma.lodgingRequest.update({
      where: { id: requestId },
      data: updateData,
      include: {
        location: true,
        room: true
      }
    });

    res.json(updatedRequest);
  } catch (err) {
    console.error('Error al actualizar estado de la solicitud de hospedaje:', err);
    res.status(500).json({ error: 'Error al actualizar el estado de la solicitud.' });
  }
}

// 4. List Locations (Public/Admin)
export async function listLocations(req, res) {
  try {
    const locations = await prisma.lodgingLocation.findMany({
      include: {
        rooms: {
          orderBy: { number: 'asc' }
        }
      },
      orderBy: { name: 'asc' }
    });
    res.json(locations);
  } catch (err) {
    console.error('Error al listar ubicaciones de hospedaje:', err);
    res.status(500).json({ error: 'Error al obtener ubicaciones de hospedaje.' });
  }
}

// 5. Create Location (Admin)
export async function createLocation(req, res) {
  const { name, address } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'El nombre del local es obligatorio.' });
  }

  try {
    const location = await prisma.lodgingLocation.create({
      data: { name, address }
    });
    res.status(201).json(location);
  } catch (err) {
    console.error('Error al crear local de hospedaje:', err);
    res.status(500).json({ error: 'Error al crear local de hospedaje.' });
  }
}

// 6. Create Room (Admin)
export async function createRoom(req, res) {
  const { number, locationId, beds, status } = req.body;

  if (!number || !locationId) {
    return res.status(400).json({ error: 'El número de habitación y el localId son obligatorios.' });
  }

  try {
    const room = await prisma.lodgingRoom.create({
      data: {
        number,
        locationId: parseInt(locationId, 10),
        beds: beds ? parseInt(beds, 10) : 1,
        status: status || 'available'
      }
    });
    res.status(201).json(room);
  } catch (err) {
    console.error('Error al crear cuarto de hospedaje:', err);
    res.status(500).json({ error: 'Error al crear cuarto de hospedaje.' });
  }
}

// 7. Delete Location (Admin)
export async function deleteLocation(req, res) {
  const { id } = req.params;
  try {
    await prisma.lodgingLocation.delete({
      where: { id: parseInt(id, 10) }
    });
    res.json({ message: 'Local de hospedaje eliminado con éxito.' });
  } catch (err) {
    console.error('Error al eliminar local:', err);
    res.status(500).json({ error: 'Error al eliminar local.' });
  }
}

// 8. Delete Room (Admin)
export async function deleteRoom(req, res) {
  const { id } = req.params;
  try {
    await prisma.lodgingRoom.delete({
      where: { id: parseInt(id, 10) }
    });
    res.json({ message: 'Cuarto de hospedaje eliminado con éxito.' });
  } catch (err) {
    console.error('Error al eliminar cuarto:', err);
    res.status(500).json({ error: 'Error al eliminar cuarto.' });
  }
}
