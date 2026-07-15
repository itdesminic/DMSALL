import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function listRadios(req, res){
  try {
    const { search, site, status } = req.query;
    
    let where = {};
    
    if (search) {
      where.OR = [
        { serial: { contains: search, mode: 'insensitive' } },
        { assignedTo: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
        { model: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (site && site !== 'all') {
      where.site = site;
    }
    
    if (status && status !== 'all') {
      where.status = status;
    }

    const radios = await prisma.radio.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });
    res.json(radios);
  } catch (err) {
    console.error('Error al listar radios:', err);
    res.status(500).json({ error: 'Error al obtener radios de la base de datos' });
  }
}

export async function createRadio(req, res){
  const { brand, model, site, company, serial, status, comments, assignedTo, channels } = req.body;
  
  if (!serial) {
    return res.status(400).json({ error: 'El código de serie es obligatorio' });
  }

  try{
    const existing = await prisma.radio.findUnique({ where: { serial } });
    if (existing) {
      return res.status(400).json({ error: 'Ya existe un radio registrado con este código de serie' });
    }

    const radio = await prisma.radio.create({
      data: {
        brand,
        model,
        site,
        company,
        serial,
        status: status || 'bueno',
        comments,
        assignedTo,
        channels
      }
    });
    res.json(radio);
  }catch(err){
    console.error('Error al crear radio:', err);
    res.status(500).json({ error: 'Error creando radio' });
  }
}

export async function updateRadio(req, res) {
  const { id } = req.params;
  const { brand, model, site, company, serial, status, comments, assignedTo, channels } = req.body;

  try {
    const radioId = parseInt(id);

    if (serial) {
      const existing = await prisma.radio.findFirst({
        where: {
          serial,
          NOT: { id: radioId }
        }
      });
      if (existing) {
        return res.status(400).json({ error: 'Ya existe otro radio registrado con este código de serie' });
      }
    }

    const updated = await prisma.radio.update({
      where: { id: radioId },
      data: {
        brand,
        model,
        site,
        company,
        serial,
        status,
        comments,
        assignedTo,
        channels
      }
    });

    res.json(updated);
  } catch (err) {
    console.error('Error al actualizar radio:', err);
    res.status(500).json({ error: 'Error al actualizar el radio' });
  }
}
