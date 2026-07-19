import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const email = 'iteqx';
  const hashed = await bcrypt.hash('N!caraguaN!caragua', 10);
  const exists = await prisma.user.findUnique({ where: { email } });
  if (!exists) {
    await prisma.user.create({
      data: {
        name: 'ITEQX',
        email: email,
        password: hashed,
        role: 'admin'
      }
    });
    console.log('Usuario ITEQX creado con exito.');
  } else {
    await prisma.user.update({
      where: { email },
      data: {
        password: hashed,
        name: 'ITEQX',
        role: 'admin'
      }
    });
    console.log('Usuario ITEQX actualizado con exito.');
  }
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
