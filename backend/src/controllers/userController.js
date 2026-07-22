import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
const prisma = new PrismaClient();

// 1. Create User
export async function createUser(req, res) {
  const { name, email, password, role, site, permissions } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña requeridos.' });
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'Ya existe un usuario con este correo electrónico.' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
        role: role || 'user',
        site: site || null,
        permissions: permissions || null
      }
    });

    // Don't return password hash
    const { password: _, ...userWithoutPassword } = user;
    res.status(201).json(userWithoutPassword);
  } catch (err) {
    console.error('Error al crear usuario:', err);
    res.status(500).json({ error: 'No se pudo crear el usuario.' });
  }
}

// 2. List Users
export async function listUsers(req, res) {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        site: true,
        permissions: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(users);
  } catch (err) {
    console.error('Error al listar usuarios:', err);
    res.status(500).json({ error: 'No se pudo obtener el listado de usuarios.' });
  }
}

// 3. Update User
export async function updateUser(req, res) {
  const { id } = req.params;
  const { name, email, password, role, site, permissions } = req.body;

  try {
    const userId = parseInt(id, 10);
    const existing = await prisma.user.findUnique({ where: { id: userId } });
    if (!existing) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    // Check unique email if email is being updated
    if (email && email !== existing.email) {
      const emailCheck = await prisma.user.findUnique({ where: { email } });
      if (emailCheck) {
        return res.status(400).json({ error: 'El correo electrónico ya está en uso por otro usuario.' });
      }
    }

    const updateData = {
      name,
      email,
      role,
      site,
      permissions
    };

    if (password && password.trim() !== '') {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData
    });

    const { password: _, ...userWithoutPassword } = updatedUser;
    res.json(userWithoutPassword);
  } catch (err) {
    console.error('Error al actualizar usuario:', err);
    res.status(500).json({ error: 'No se pudo actualizar el usuario.' });
  }
}

// 4. Delete User
export async function deleteUser(req, res) {
  const { id } = req.params;
  
  try {
    const userId = parseInt(id, 10);

    // Prevent user deleting themselves
    if (req.user && req.user.id === userId) {
      return res.status(400).json({ error: 'No puedes eliminar tu propio usuario.' });
    }

    await prisma.user.delete({
      where: { id: userId }
    });
    res.json({ message: 'Usuario eliminado con éxito.' });
  } catch (err) {
    console.error('Error al eliminar usuario:', err);
    res.status(500).json({ error: 'No se pudo eliminar el usuario.' });
  }
}
