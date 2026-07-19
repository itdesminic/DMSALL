import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Find Crimea submissions
  const form = await prisma.form.findFirst({
    where: { name: 'Formato de Control de Toma y Entrega de Muestras de Agua' }
  });

  if (!form) {
    console.log('No se encontró el formulario de Crimea.');
    return;
  }

  // Find the latest submission for this form
  const latestSubmission = await prisma.formSubmission.findFirst({
    where: { formId: form.id },
    orderBy: { id: 'desc' }
  });

  if (latestSubmission) {
    console.log(`Eliminando el reporte de Crimea ID #${latestSubmission.id} creado el ${latestSubmission.createdAt}...`);
    await prisma.formSubmission.delete({
      where: { id: latestSubmission.id }
    });
    console.log('¡Reporte eliminado exitosamente!');
  } else {
    console.log('No hay reportes de Crimea para eliminar.');
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
