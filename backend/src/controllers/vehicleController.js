import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// List all vehicles
export async function listVehicles(req, res) {
  try {
    const vehicles = await prisma.vehicle.findMany({
      orderBy: { no: 'asc' }
    });
    res.json(vehicles);
  } catch (err) {
    console.error('Error al listar vehículos:', err);
    res.status(500).json({ error: 'Error al obtener vehículos' });
  }
}

// Create a vehicle
export async function createVehicle(req, res) {
  const { employee, position, area, type, plate, usage, company } = req.body;
  
  if (!plate) {
    return res.status(400).json({ error: 'La placa del vehículo es obligatoria' });
  }

  try {
    // Check if plate already exists
    const existing = await prisma.vehicle.findUnique({ where: { plate } });
    if (existing) {
      return res.status(400).json({ error: 'Ya existe un vehículo registrado con esta placa' });
    }

    // Get max vehicle no to auto-increment it
    const lastVehicle = await prisma.vehicle.findFirst({
      orderBy: { no: 'desc' }
    });
    const nextNo = lastVehicle ? (lastVehicle.no || 0) + 1 : 1;

    const vehicle = await prisma.vehicle.create({
      data: {
        no: nextNo,
        employee,
        position,
        area,
        type,
        plate,
        usage,
        company
      }
    });

    res.json(vehicle);
  } catch (err) {
    console.error('Error al crear vehículo:', err);
    res.status(500).json({ error: 'Error del servidor al crear el vehículo' });
  }
}

// Update a vehicle
export async function updateVehicle(req, res) {
  const { id } = req.params;
  const { employee, position, area, type, plate, usage, company } = req.body;

  try {
    const vehicleId = parseInt(id, 10);
    const existing = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
    if (!existing) {
      return res.status(404).json({ error: 'Vehículo no encontrado' });
    }

    // Check if plate belongs to another vehicle
    if (plate && plate !== existing.plate) {
      const plateConflict = await prisma.vehicle.findUnique({ where: { plate } });
      if (plateConflict) {
        return res.status(400).json({ error: 'Ya existe otro vehículo con esa placa' });
      }
    }

    const updated = await prisma.vehicle.update({
      where: { id: vehicleId },
      data: {
        employee,
        position,
        area,
        type,
        plate,
        usage,
        company
      }
    });

    res.json(updated);
  } catch (err) {
    console.error('Error al actualizar vehículo:', err);
    res.status(500).json({ error: 'Error del servidor al actualizar el vehículo' });
  }
}

// Delete a vehicle
export async function deleteVehicle(req, res) {
  const { id } = req.params;

  try {
    const vehicleId = parseInt(id, 10);
    const existing = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
    if (!existing) {
      return res.status(404).json({ error: 'Vehículo no encontrado' });
    }

    await prisma.vehicle.delete({
      where: { id: vehicleId }
    });

    res.json({ ok: true, message: 'Vehículo eliminado correctamente' });
  } catch (err) {
    console.error('Error al eliminar vehículo:', err);
    res.status(500).json({ error: 'Error del servidor al eliminar el vehículo' });
  }
}
