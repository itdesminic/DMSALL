import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// 1. List Radios (With IT Admin Site Segmentation & Multi-filtering)
export async function listRadios(req, res) {
  try {
    const { 
      search, site, status, brand, model, type, serial, radioIdCode, 
      assignedTo, area, position, company 
    } = req.query;
    
    let where = {};
    
    // IT Admin Segmentation: Check if user is logged in, is admin, and has a specific site assigned
    if (req.user && req.user.role === 'admin' && req.user.site && req.user.site !== 'Todos') {
      where.site = req.user.site;
    } else if (site && site !== 'all') {
      // If Jefe de IT or public (who can select site)
      where.site = site;
    }

    // Global Search
    if (search) {
      where.OR = [
        { serial: { contains: search, mode: 'insensitive' } },
        { radioIdCode: { contains: search, mode: 'insensitive' } },
        { assignedTo: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
        { model: { contains: search, mode: 'insensitive' } },
        { position: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Specific Multi-filters
    if (status && status !== 'all') where.status = status;
    if (brand && brand !== 'all') where.brand = { contains: brand, mode: 'insensitive' };
    if (model && model !== 'all') where.model = { contains: model, mode: 'insensitive' };
    if (type && type !== 'all') where.type = { contains: type, mode: 'insensitive' };
    if (serial) where.serial = { contains: serial, mode: 'insensitive' };
    if (radioIdCode) where.radioIdCode = { contains: radioIdCode, mode: 'insensitive' };
    if (assignedTo) where.assignedTo = { contains: assignedTo, mode: 'insensitive' };
    if (area && area !== 'all') where.area = { contains: area, mode: 'insensitive' };
    if (position && position !== 'all') where.position = { contains: position, mode: 'insensitive' };
    if (company && company !== 'all') where.company = { contains: company, mode: 'insensitive' };

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

// 2. Create Radio
export async function createRadio(req, res) {
  const { 
    brand, model, type, site, company, serial, radioIdCode, 
    status, comments, assignedTo, channels, area, position 
  } = req.body;
  
  if (!serial) {
    return res.status(400).json({ error: 'El código de serie es obligatorio' });
  }

  try {
    const existingSerial = await prisma.radio.findUnique({ where: { serial } });
    if (existingSerial) {
      return res.status(400).json({ error: 'Ya existe un radio registrado con este código de serie' });
    }

    let finalRadioIdCode = radioIdCode;
    if (!finalRadioIdCode) {
      const allRadios = await prisma.radio.findMany({ select: { radioIdCode: true } });
      const numericIds = allRadios
        .map(r => parseInt(r.radioIdCode, 10))
        .filter(id => !isNaN(id));
      const maxId = numericIds.length > 0 ? Math.max(...numericIds) : 1000;
      finalRadioIdCode = (maxId + 1).toString();
    } else {
      const existingId = await prisma.radio.findUnique({ where: { radioIdCode: finalRadioIdCode } });
      if (existingId) {
        return res.status(400).json({ error: 'Ya existe un radio registrado con este ID de Radio' });
      }
    }

    const radio = await prisma.radio.create({
      data: {
        brand,
        model,
        type,
        site,
        company,
        serial,
        radioIdCode: finalRadioIdCode,
        status: status || 'bueno',
        comments,
        assignedTo,
        channels,
        area,
        position
      }
    });
    res.json(radio);
  } catch (err) {
    console.error('Error al crear radio:', err);
    res.status(500).json({ error: 'Error creando radio' });
  }
}

// 3. Update Radio
export async function updateRadio(req, res) {
  const { id } = req.params;
  const { 
    brand, model, type, site, company, serial, radioIdCode, 
    status, comments, assignedTo, channels, area, position 
  } = req.body;

  try {
    const radioId = parseInt(id, 10);

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

    if (radioIdCode) {
      const existingId = await prisma.radio.findFirst({
        where: {
          radioIdCode,
          NOT: { id: radioId }
        }
      });
      if (existingId) {
        return res.status(400).json({ error: 'Ya existe otro radio registrado con este ID de Radio' });
      }
    }

    const updated = await prisma.radio.update({
      where: { id: radioId },
      data: {
        brand,
        model,
        type,
        site,
        company,
        serial,
        radioIdCode,
        status,
        comments,
        assignedTo,
        channels,
        area,
        position
      }
    });

    res.json(updated);
  } catch (err) {
    console.error('Error al actualizar radio:', err);
    res.status(500).json({ error: 'Error al actualizar el radio' });
  }
}

// 4. Delete Radio
export async function deleteRadio(req, res) {
  const { id } = req.params;
  try {
    await prisma.radio.delete({
      where: { id: parseInt(id, 10) }
    });
    res.json({ message: 'Radio eliminado del inventario con éxito' });
  } catch (err) {
    console.error('Error al eliminar radio:', err);
    res.status(500).json({ error: 'Error al eliminar el radio' });
  }
}

// 5. Bulk Upload (Excel/CSV parse)
export async function bulkUpload(req, res) {
  const { items } = req.body; // Array of radio objects

  if (!items || !Array.isArray(items)) {
    return res.status(400).json({ error: 'Formato inválido. Se requiere un arreglo de radios.' });
  }

  try {
    let createdCount = 0;
    let updatedCount = 0;

    for (const item of items) {
      if (!item.serial) continue; // Skip if no serial

      // Clean/Transform fields
      const dataObj = {
        brand: item.brand || null,
        model: item.model || null,
        type: item.type || null,
        serial: item.serial,
        radioIdCode: item.radioIdCode ? item.radioIdCode.toString() : null,
        channels: item.channels ? item.channels.toString() : null,
        assignedTo: item.assignedTo || null,
        area: item.area || null,
        position: item.position || null,
        company: item.company || null,
        site: item.site || null,
        status: item.status || 'bueno',
        comments: item.comments || null
      };

      const existing = await prisma.radio.findUnique({
        where: { serial: item.serial }
      });

      if (existing) {
        await prisma.radio.update({
          where: { id: existing.id },
          data: dataObj
        });
        updatedCount++;
      } else {
        await prisma.radio.create({
          data: dataObj
        });
        createdCount++;
      }
    }

    res.json({
      message: 'Carga masiva completada con éxito.',
      created: createdCount,
      updated: updatedCount
    });
  } catch (err) {
    console.error('Error en carga masiva de radios:', err);
    res.status(500).json({ error: 'Error al procesar la carga masiva en el servidor.' });
  }
}

// 6. Submit Support Report (Public)
export async function submitReport(req, res) {
  const { type, radioSerial, radioIdCode, radioAssignedTo, reporterName, reporterPosition, description, site, isOperational } = req.body;

  if (!type || !reporterName || !description || !site) {
    return res.status(400).json({ error: 'Tipo de reporte, nombre del reportero, descripción y sitio/mina son obligatorios.' });
  }

  try {
    const report = await prisma.radioReport.create({
      data: {
        type,
        radioSerial: radioSerial || null,
        radioIdCode: radioIdCode ? radioIdCode.toString() : null,
        radioAssignedTo: radioAssignedTo || null,
        reporterName,
        reporterPosition: reporterPosition || null,
        description,
        site,
        isOperational: typeof isOperational === 'boolean' ? isOperational : null,
        status: 'pending'
      }
    });

    // Auto-update Radio Status based on Failure & Operability
    if (radioSerial) {
      const radio = await prisma.radio.findUnique({ where: { serial: radioSerial } });
      if (radio) {
        let newStatus = radio.status;
        if (type === 'failure') {
          newStatus = isOperational === false ? 'dañado' : 'mantenimiento';
        } else if (type === 'maintenance') {
          newStatus = 'mantenimiento';
        }
        
        await prisma.radio.update({
          where: { id: radio.id },
          data: { status: newStatus }
        });
      }
    }

    res.status(201).json(report);
  } catch (err) {
    console.error('Error al crear reporte de radio:', err);
    res.status(500).json({ error: 'Error al enviar el reporte.' });
  }
}

// 7. List Support Reports (IT Admin Site Segmented)
export async function listReports(req, res) {
  try {
    let where = {};

    // IT Admin Site Segmentation
    if (req.user && req.user.role === 'admin' && req.user.site && req.user.site !== 'Todos') {
      where.site = req.user.site;
    }

    const reports = await prisma.radioReport.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });
    res.json(reports);
  } catch (err) {
    console.error('Error al listar reportes:', err);
    res.status(500).json({ error: 'Error al obtener reportes de soporte.' });
  }
}

// 8. Update Support Report Status (IT Admin)
export async function updateReportStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body;

  if (!['pending', 'in_progress', 'resolved'].includes(status)) {
    return res.status(400).json({ error: 'Estado de reporte inválido.' });
  }

  try {
    const reportId = parseInt(id, 10);
    const updated = await prisma.radioReport.update({
      where: { id: reportId },
      data: { status }
    });
    res.json(updated);
  } catch (err) {
    console.error('Error al actualizar reporte:', err);
    res.status(500).json({ error: 'Error al cambiar estado del reporte.' });
  }
}
