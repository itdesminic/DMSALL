import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function listMenus(req, res) {
  const menus = await prisma.foodMenu.findMany({ include: { foodMenuItems: true } });
  res.json(menus);
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
      include: { foodMenuItems: true }
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
