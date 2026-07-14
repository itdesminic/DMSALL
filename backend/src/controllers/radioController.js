import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function listRadios(req, res){
  const radios = await prisma.radio.findMany();
  res.json(radios);
}

export async function createRadio(req, res){
  const data = req.body;
  try{
    const radio = await prisma.radio.create({ data });
    res.json(radio);
  }catch(err){
    res.status(500).json({ error: 'Error creando radio' });
  }
}
