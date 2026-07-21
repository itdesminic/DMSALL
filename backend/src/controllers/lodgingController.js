import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// 1. Submit Request (Public)
export async function submitRequest(req, res) {
  const { guestName, guestEmail, days, account } = req.body;

  if (!guestName || !days || !account) {
    return res.status(400).json({ error: 'Nombre del huésped, cantidad de días y cuenta a cargar son obligatorios.' });
  }

  const daysNum = parseInt(days, 10);
  if (isNaN(daysNum) || daysNum <= 0) {
    return res.status(400).json({ error: 'La cantidad de días debe ser un número entero mayor a 0.' });
  }

  try {
    const newRequest = await prisma.lodgingRequest.create({
      data: {
        guestName,
        guestEmail: guestEmail || null,
        days: daysNum,
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

// 3. Update Request Status (Admin/Auth)
export async function updateRequestStatus(req, res) {
  const { id } = req.params;
  const { status, locationId, roomId } = req.body;

  if (!['pending', 'approved', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Estado inválido. Debe ser pending, approved o rejected.' });
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

    if (status === 'approved') {
      if (!locationId || !roomId) {
        return res.status(400).json({ error: 'Debe especificar el local y el cuarto para la aprobación.' });
      }
      updateData.locationId = parseInt(locationId, 10);
      updateData.roomId = parseInt(roomId, 10);

      // Optionally update the room status to occupied
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
