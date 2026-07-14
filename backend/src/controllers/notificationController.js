import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function listNotifications(req,res){
  const notes = await prisma.notification.findMany({ orderBy: { id:'desc' } });
  res.json(notes);
}

export async function createNotification(req,res){
  const { type, to, message } = req.body;
  if(!type || !to || !message) return res.status(400).json({ error: 'Faltan campos' });
  const notification = await prisma.notification.create({ data:{ type, to, message } });
  res.json(notification);
}
