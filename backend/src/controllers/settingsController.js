import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function listSettings(req,res){
  const settings = await prisma.systemSetting.findMany();
  res.json(settings);
}

export async function updateSetting(req,res){
  const { key, value } = req.body;
  if(!key) return res.status(400).json({ error: 'key requerido' });
  const setting = await prisma.systemSetting.upsert({
    where:{ key },
    update:{ value },
    create:{ key, value }
  });
  res.json(setting);
}
