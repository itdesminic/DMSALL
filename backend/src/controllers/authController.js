import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const DEMO_ADMIN = {
  id: 1,
  name: 'Gerencia',
  email: 'gerencia',
  password: 'DesminicLL26',
  role: 'admin',
};

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

export async function login(req, res) {
  const email = req.body?.email?.toString().trim();
  const password = req.body?.password?.toString();

  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña son requeridos' });
  }

  try {
    let user = null;
    try {
      user = await prisma.user.findUnique({ where: { email } });
    } catch (dbError) {
      console.warn('Base de datos no disponible, usando usuario demo:', dbError.message);
    }

    const isDemoAdmin = email.toLowerCase() === DEMO_ADMIN.email && password === DEMO_ADMIN.password;
    if (!user && !isDemoAdmin) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    if (!user) {
      user = {
        id: DEMO_ADMIN.id,
        name: DEMO_ADMIN.name,
        email: DEMO_ADMIN.email,
        password: await bcrypt.hash(DEMO_ADMIN.password, 10),
        role: DEMO_ADMIN.role,
      };
    }

    const isValid = user.password ? await bcrypt.compare(password, user.password) : false;
    if (!isValid && !isDemoAdmin) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '8h' });
    return res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role, site: user.site, permissions: user.permissions },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error del servidor' });
  }
}

export async function register(req, res) {
  const { name, email, password, role, site, permissions } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email y contraseña son requeridos' });
  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ error: 'El usuario ya existe' });
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { name, email, password: hashed, role: role || 'user', site: site || null, permissions: permissions || null } });
    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '8h' });
    res.status(201).json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role, site: user.site, permissions: user.permissions } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
}
