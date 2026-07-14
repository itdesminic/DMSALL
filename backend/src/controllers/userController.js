import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
const prisma = new PrismaClient();

export async function createUser(req, res){
  const { name, email, password, role } = req.body;
  if(!email || !password) return res.status(400).json({ error: 'Email y contraseña requeridos' });
  const hashed = await bcrypt.hash(password, 10);
  try{
    const user = await prisma.user.create({ data: { name, email, password: hashed, role } });
    res.json(user);
  }catch(err){
    res.status(500).json({ error: 'No se pudo crear usuario' });
  }
}

export async function listUsers(req, res){
  const users = await prisma.user.findMany({ select: { id:true, name:true, email:true, role:true, createdAt:true } });
  res.json(users);
}
