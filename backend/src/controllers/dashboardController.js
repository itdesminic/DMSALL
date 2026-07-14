import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function getDashboardStats(req, res) {
  try {
    const totalForms = await prisma.formSubmission.count();
    const totalPdfs = await prisma.generatedPdf.count();
    const totalFood = await prisma.foodConfirmation.count();
    const totalRadios = await prisma.radio.count();

    // Recent activity (e.g. recent form submissions)
    const recentSubmissions = await prisma.formSubmission.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { form: true, user: true }
    });

    const recentActivity = recentSubmissions.map(s => {
      const statusLabel = s.status === 'rejected' ? '🔴 RECHAZADO (Alerta)' : '🟢 ENVIADO';
      let answers = {};
      try {
        answers = JSON.parse(s.answers || '{}');
      } catch (e) {}
      const userName = (s.user && s.user.email !== 'anonimo@empresa.local')
        ? (s.user.name || s.user.email)
        : (answers['Inspección realizada por'] || 'Operador Anónimo');
      return `Formulario "${s.form.name}" registrado como ${statusLabel} por ${userName} el ${new Date(s.createdAt).toLocaleDateString('es-ES')} a las ${new Date(s.createdAt).toLocaleTimeString('es-ES', {hour: '2-digit', minute:'2-digit'})}`;
    });

    res.json({
      stats: [
        { title: 'Formularios', value: totalForms.toString(), detail: 'enviados en total' },
        { title: 'PDFs', value: totalPdfs.toString(), detail: 'generados en total' },
        { title: 'Comidas', value: totalFood.toString(), detail: 'confirmaciones registradas' },
        { title: 'Radios', value: totalRadios.toString(), detail: 'equipos en inventario' }
      ],
      recentActivity
    });
  } catch (err) {
    console.error('Error cargando stats del dashboard:', err);
    res.status(500).json({ error: 'Error del servidor cargando estadísticas' });
  }
}
