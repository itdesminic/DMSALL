import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function listMenus(req, res) {
  try {
    const menus = await prisma.foodMenu.findMany({
      include: {
        foodMenuItems: {
          include: {
            foodConfirmations: {
              include: {
                user: {
                  select: { id: true, name: true, email: true }
                }
              }
            }
          }
        }
      },
      orderBy: { weekStart: 'desc' }
    });
    res.json(menus);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al listar menús' });
  }
}

export async function createMenu(req, res) {
  const { weekStart, published, items } = req.body;
  try {
    const menu = await prisma.foodMenu.create({
      data: {
        weekStart: new Date(weekStart),
        published: published ?? false,
        foodMenuItems: { create: items ?? [] }
      },
      include: {
        foodMenuItems: {
          include: {
            foodConfirmations: true
          }
        }
      }
    });
    res.json(menu);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error creando menú' });
  }
}

export async function confirmFood(req, res) {
  const { menuItemId, notes } = req.body;
  const userId = req.user?.userId;
  if (!menuItemId) return res.status(400).json({ error: 'menuItemId requerido' });
  try {
    const exists = await prisma.foodConfirmation.findFirst({ where: { menuItemId, userId } });
    if (exists) return res.status(400).json({ error: 'Ya existe confirmación para este usuario y comida' });
    const confirmation = await prisma.foodConfirmation.create({ data: { menuItemId, userId, notes } });
    res.json(confirmation);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error confirmando comida' });
  }
}

export async function submitFeedback(req, res) {
  const { confirmationId, rating, opinion } = req.body;
  const userId = req.user?.userId;

  if (!confirmationId || !rating) {
    return res.status(400).json({ error: 'confirmationId y rating son requeridos.' });
  }

  try {
    const confirmation = await prisma.foodConfirmation.findFirst({
      where: { id: parseInt(confirmationId, 10), userId }
    });

    if (!confirmation) {
      return res.status(404).json({ error: 'Confirmación de comida no encontrada.' });
    }

    const updated = await prisma.foodConfirmation.update({
      where: { id: confirmation.id },
      data: {
        rating: parseInt(rating, 10),
        opinion: opinion || null
      }
    });

    res.json(updated);
  } catch (err) {
    console.error('Error al registrar opinión:', err);
    res.status(500).json({ error: 'Error al registrar opinión de comida.' });
  }
}
