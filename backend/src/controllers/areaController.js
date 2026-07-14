import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function listAreas(req, res){
  const areas = await prisma.area.findMany();
  res.json(areas);
}

export async function createArea(req, res){
  const { name } = req.body;
  if(!name) return res.status(400).json({ error: 'Nombre requerido' });
  try{
    const area = await prisma.area.create({ data: { name } });
    res.json(area);
  }catch(err){
    res.status(500).json({ error: 'Error creando area' });
  }
}
