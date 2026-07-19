import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';
import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';
import { PassThrough } from 'stream';

const prisma = new PrismaClient();
const PDF_OUTPUT_DIR = path.join(process.cwd(), 'uploads', 'pdfs');

function ensurePdfDir() {
  fs.mkdirSync(PDF_OUTPUT_DIR, { recursive: true });
}

const FORM_TEMPLATES = [
  {
    name: 'Revisión de Pre-Uso de Vehiculo Liviano',
    areaName: 'Seguridad',
    fields: [
      { label: 'Placa del Vehículo', type: 'text' },
      { label: 'Código del Vehículo', type: 'text' },
      { label: 'Hora', type: 'text' },
      { label: 'Día de la Semana', type: 'select', options: 'Lunes,Martes,Miércoles,Jueves,Viernes,Sábado,Domingo' },
      { label: 'Odómetro (Kilometraje)', type: 'text' },
      { label: 'Gerencia/Superintendencia', type: 'text' },
      { label: 'Supervisor de área', type: 'text' },
      // Parámetros
      { label: '1. Documentos vigentes (Seguro/Licencia/Matrícula/Rodamiento/Inspección Mecánica y de gases)', type: 'select', options: 'Correcto (✓),Incorrecto (X),No Aplicable (N/A)' },
      { label: '2. Carnet de Manejo Interno VIGENTE', type: 'select', options: 'Correcto (✓),Incorrecto (X),No Aplicable (N/A)' },
      { label: '3. Buen estado de la batería y asegurada', type: 'select', options: 'Correcto (✓),Incorrecto (X),No Aplicable (N/A)' },
      { label: '4. Luces intermitentes, luces direccionales', type: 'select', options: 'Correcto (✓),Incorrecto (X),No Aplicable (N/A)' },
      { label: '5. Doble tracción (para Subterráneo y Tajos)', type: 'select', options: 'Correcto (✓),Incorrecto (X),No Aplicable (N/A)' },
      { label: '6. Luz estroboscópica color ambar (centella)', type: 'select', options: 'Correcto (✓),Incorrecto (X),No Aplicable (N/A)' },
      { label: '7. Frenos y Dirección en buen estado', type: 'select', options: 'Correcto (✓),Incorrecto (X),No Aplicable (N/A)' },
      { label: '8. Frenos de Emergencia', type: 'select', options: 'Correcto (✓),Incorrecto (X),No Aplicable (N/A)' },
      { label: '9. Cinturón de Seguridad', type: 'select', options: 'Correcto (✓),Incorrecto (X),No Aplicable (N/A)' },
      { label: '10. 10 cintas refractivas (2 frente, 6 costados, 2 atrás)', type: 'select', options: 'Correcto (✓),Incorrecto (X),No Aplicable (N/A)' },
      { label: '11. Cuña de seguridad', type: 'select', options: 'Correcto (✓),Incorrecto (X),No Aplicable (N/A)' },
      { label: '12. Trabas para espárragos / Revisión de tuerca de espárragos', type: 'select', options: 'Correcto (✓),Incorrecto (X),No Aplicable (N/A)' },
      { label: '13. Alarma Retroceso', type: 'select', options: 'Correcto (✓),Incorrecto (X),No Aplicable (N/A)' },
      { label: '14. Pértiga, con banderola y luz en extremo superior color ambar', type: 'select', options: 'Correcto (✓),Incorrecto (X),No Aplicable (N/A)' },
      { label: '15. Conos de Seguridad (Mínimo 2 unidades de 36" para Tajo y Mina UG)', type: 'select', options: 'Correcto (✓),Incorrecto (X),No Aplicable (N/A)' },
      { label: '16. Nivel Fluidos (Aceite de motor, Coolant, Aceite Power Steering, Nivel de combustible)', type: 'select', options: 'Correcto (✓),Incorrecto (X),No Aplicable (N/A)' },
      { label: '17. Halógenos de Retroceso (Obligatorio en UG y Tajos)', type: 'select', options: 'Correcto (✓),Incorrecto (X),No Aplicable (N/A)' },
      { label: '18. Estado físico de carrocería (golpes, rayones)', type: 'select', options: 'Correcto (✓),Incorrecto (X),No Aplicable (N/A)' },
      { label: '19. Kit para Derrames de Materiales Peligrosos', type: 'select', options: 'Correcto (✓),Incorrecto (X),No Aplicable (N/A)' },
      { label: '20. Bocina', type: 'select', options: 'Correcto (✓),Incorrecto (X),No Aplicable (N/A)' },
      { label: '21. Cortador de corriente', type: 'select', options: 'Correcto (✓),Incorrecto (X),No Aplicable (N/A)' },
      { label: '22. GPS', type: 'select', options: 'Correcto (✓),Incorrecto (X),No Aplicable (N/A)' },
      { label: '23. Neumáticos, Llantas, Rines, Espárragos', type: 'select', options: 'Correcto (✓),Incorrecto (X),No Aplicable (N/A)' },
      { label: '24. Llanta de repuesto', type: 'select', options: 'Correcto (✓),Incorrecto (X),No Aplicable (N/A)' },
      { label: '25. Extintor, bolso porta extintor', type: 'select', options: 'Correcto (✓),Incorrecto (X),No Aplicable (N/A)' },
      { label: '26. Limpia Parabrisas', type: 'select', options: 'Correcto (✓),Incorrecto (X),No Aplicable (N/A)' },
      { label: '27. Herramientas (Gata, maneral, extensión para gata, alicate)', type: 'select', options: 'Correcto (✓),Incorrecto (X),No Aplicable (N/A)' },
      { label: '28. Limpieza Interior', type: 'select', options: 'Correcto (✓),Incorrecto (X),No Aplicable (N/A)' },
      { label: '29. Espejos, Vidrios, Aire acondicionado', type: 'select', options: 'Correcto (✓),Incorrecto (X),No Aplicable (N/A)' },
      { label: '30. Vidrios sin fisuras / Sin Polarizado', type: 'select', options: 'Correcto (✓),Incorrecto (X),No Aplicable (N/A)' },
      { label: '31. Cinta de precaución amarilla/roja', type: 'select', options: 'Correcto (✓),Incorrecto (X),No Aplicable (N/A)' },
      { label: '32. Otros', type: 'select', options: 'Correcto (✓),Incorrecto (X),No Aplicable (N/A)' },
      { label: '¿Se siente Fatigado?', type: 'select', options: 'Sí,No' },
      { label: 'Observaciones', type: 'textarea' }
    ]
  },
  {
    name: 'Reporte de 5 puntos de seguridad',
    areaName: 'Seguridad',
    fields: [
      { label: 'Punto 1 - Riesgo detectado', type: 'text' },
      { label: 'Punto 2 - Acción inmediata', type: 'text' },
      { label: 'Punto 3 - Responsable', type: 'text' },
      { label: 'Punto 4 - Evidencia', type: 'text' },
      { label: 'Punto 5 - Recomendación', type: 'text' },
      { label: 'Cumple con inspección', type: 'checkbox' },
      { label: 'Firma del responsable', type: 'text' }
    ]
  },
  {
    name: 'Solicitud de mantenimiento',
    areaName: 'Mantenimiento',
    fields: [
      { label: 'Equipo afectado', type: 'text' },
      { label: 'Descripción del problema', type: 'text' },
      { label: 'Prioridad', type: 'text' },
      { label: 'Responsable', type: 'text' }
    ]
  },
  {
    name: 'Reporte de incidente',
    areaName: 'Seguridad',
    fields: [
      { label: 'Detalle del incidente', type: 'text' },
      { label: 'Hora', type: 'text' },
      { label: 'Área', type: 'text' },
      { label: 'Acciones tomadas', type: 'text' }
    ]
  },
  {
    name: 'Formato de Control de Toma y Entrega de Muestras de Agua',
    areaName: 'Crimea',
    fields: [
      { label: 'Muestras', type: 'text' },
      { label: 'Realizado por', type: 'text' },
      { label: 'Revisado por', type: 'text' },
      { label: 'Fotos', type: 'text' }
    ]
  }
];

async function getOrCreateFormByName(name) {
  let form = await prisma.form.findFirst({ where: { name }, include: { formFields: true } });
  if (form) return form;

  const template = FORM_TEMPLATES.find((item) => item.name === name);
  if (!template) throw new Error('Plantilla no encontrada: ' + name);

  let area = await prisma.area.findUnique({ where: { name: template.areaName } });
  if (!area) {
    area = await prisma.area.create({ data: { name: template.areaName } });
  }

  form = await prisma.form.create({
    data: {
      name: template.name,
      areaId: area.id,
      formFields: {
        create: template.fields.map(f => ({
          label: f.label,
          type: f.type,
          options: f.options || null
        }))
      }
    },
    include: { formFields: true }
  });
  return form;
}

function drawCheckmark(doc, x, y, isFatiga = false) {
  if (isFatiga) {
    doc.moveTo(x + 2.5, y + 5.5)
       .lineTo(x + 5.5, y + 8.5)
       .lineTo(x + 9.5, y + 2.5)
       .strokeColor('#10b981')
       .lineWidth(1.2)
       .stroke();
  } else {
    doc.moveTo(x + 4, y + 4.5)
       .lineTo(x + 7, y + 7.5)
       .lineTo(x + 11.5, y + 2.5)
       .strokeColor('#10b981')
       .lineWidth(1.2)
       .stroke();
  }
  doc.strokeColor('#000000').lineWidth(1);
}

function drawCross(doc, x, y) {
  doc.moveTo(x + 4, y + 2.5)
     .lineTo(x + 11, y + 7.5)
     .moveTo(x + 11, y + 2.5)
     .lineTo(x + 4, y + 7.5)
     .strokeColor('#ef4444')
     .lineWidth(1.2)
     .stroke();
  doc.strokeColor('#000000').lineWidth(1);
}

function drawCrossFatiga(doc, x, y) {
  doc.moveTo(x + 3, y + 3)
     .lineTo(x + 9, y + 9)
     .moveTo(x + 9, y + 3)
     .lineTo(x + 3, y + 9)
     .strokeColor('#ef4444')
     .lineWidth(1.2)
     .stroke();
  doc.strokeColor('#000000').lineWidth(1);
}

export function generatePdfToStream(submissionId, formName, values, userName, outputStream) {
  // A4 dimensions: 595 x 842 points
  const doc = new PDFDocument({ size: 'A4', margin: 30 });
  doc.pipe(outputStream);

  if (formName === 'Revisión de Pre-Uso de Vehiculo Liviano') {
    // ----------------------------------------------------
    // CUSTOM INDUSTRIAL DESIGN (Equinox Gold style)
    // ----------------------------------------------------
    
    // Draw outer border
    doc.rect(30, 30, 535, 782).stroke();
    
    // Header Grid (Outer Box y=30 to y=85, height=55)
    doc.lineJoin('miter');
    doc.rect(30, 30, 535, 55).stroke();
    
    // Vertical split 1: Logo section (width 130)
    doc.moveTo(160, 30).lineTo(160, 85).stroke();
    // Vertical split 2: Title section (width 265)
    doc.moveTo(425, 30).lineTo(425, 85).stroke();
    
    // Logo Image
    const logoPath = path.join(process.cwd(), 'src', 'logo.jpg');
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 35, 42, { width: 120 });
    } else {
      doc.fontSize(11).font('Helvetica-Bold').text('EQUINOX GOLD', 40, 50);
    }
    
    // Title text
    doc.fontSize(11).font('Helvetica-Bold').text('REVISIÓN DE PRE-USO DE VEHICULO LIVIANO', 170, 50, { width: 240, align: 'center' });
    
    // Metadata block (Right Cell)
    doc.fontSize(7).font('Helvetica');
    doc.text('Código:', 430, 35);
    doc.font('Helvetica-Bold').text('FOR-13-015', 485, 35);
    
    doc.font('Helvetica').text('Revisión:', 430, 47);
    doc.font('Helvetica-Bold').text('2.0', 485, 47);
    
    doc.font('Helvetica').text('Fecha:', 430, 59);
    doc.font('Helvetica-Bold').text(new Date().toLocaleDateString('es-ES'), 485, 59);
    
    doc.font('Helvetica').text('No. Páginas:', 430, 71);
    doc.font('Helvetica-Bold').text('1/1', 485, 71);
    
    // Info Block (y=85 to y=145)
    doc.rect(30, 85, 535, 60).stroke();
    
    // Horizontal lines in Info Block
    doc.moveTo(30, 105).lineTo(565, 105).stroke();
    doc.moveTo(30, 125).lineTo(565, 125).stroke();
    
    // Vertical lines in Info Block
    doc.moveTo(297, 85).lineTo(297, 145).stroke(); // Split middle
    
    doc.fontSize(8).font('Helvetica');
    doc.text('Gerencia/Superintendencia:', 35, 92);
    doc.font('Helvetica-Bold').text(values['Gerencia/Superintendencia'] || '-', 150, 92);
    
    doc.font('Helvetica').text('Área:', 305, 92);
    doc.font('Helvetica-Bold').text(values['Área'] || '-', 335, 92);
    
    doc.font('Helvetica').text('Placa:', 35, 112);
    doc.font('Helvetica-Bold').text(values['Placa del Vehículo'] || '-', 70, 112);
    
    doc.font('Helvetica').text('Código del Vehículo:', 305, 112);
    doc.font('Helvetica-Bold').text(values['Código del Vehículo'] || '-', 395, 112);
    
    doc.font('Helvetica').text('Hora:', 230, 112);
    doc.font('Helvetica-Bold').text(values['Hora'] || '-', 255, 112);
    
    doc.font('Helvetica').text('Inspección realizada por:', 35, 132);
    doc.font('Helvetica-Bold').text(userName || '-', 140, 132);
    
    doc.font('Helvetica').text('Supervisor de área:', 305, 132);
    doc.font('Helvetica-Bold').text(values['Supervisor de área'] || '-', 395, 132);
    
    // Status Legend (y=145 to y=160)
    doc.rect(30, 145, 535, 15).fillAndStroke('#e2e8f0', '#000000');
    doc.fillColor('#000000').fontSize(8).font('Helvetica-Bold');
    doc.text('Correcto: [   ]', 110, 149);
    drawCheckmark(doc, 151, 145);
    doc.text('No Aplicable: [ N/A ]', 240, 149);
    doc.text('Incorrecto: [ X ]', 390, 149);
    
    // Category Header: OBLIGATORIO (y=160 to y=172)
    doc.rect(30, 160, 535, 12).fillAndStroke('#cbd5e1', '#000000');
    doc.fillColor('#000000').fontSize(7.5).font('Helvetica-Bold').text('OBLIGATORIO / PARÁMETROS A INSPECCIONAR', 35, 163);
    
    // ----------------------------------------------------
    // Checklist table 2-column layout (y=172 to y=364)
    // 16 rows per column, each 12 points high. Left: 1-16, Right: 17-32
    // ----------------------------------------------------
    doc.fontSize(6.5).font('Helvetica');
    
    const rowH = 12;
    const startY = 172;
    
    // Draw vertical center line for checklist split
    doc.moveTo(297, 172).lineTo(297, 172 + (16 * rowH)).stroke();
    
    for (let i = 0; i < 16; i++) {
      const cy = startY + (i * rowH);
      
      // Horizontal row line
      doc.moveTo(30, cy + rowH).lineTo(565, cy + rowH).stroke();
      
      // LEFT COLUMN: Parameter (1 to 16)
      const numL = i + 1;
      let labelL = FORM_TEMPLATES[0].fields.find(f => f.label.startsWith(`${numL}.`))?.label || '';
      
      // Clean label text for rendering
      let cleanL = labelL;
      if (cleanL.length > 55) cleanL = cleanL.substring(0, 52) + '...';
      
      doc.fillColor('#000000').text(cleanL, 35, cy + 3);
      
      // Render selection boxes for Left Column (C, I, N/A) at x=240
      const valL = values[labelL] || '';
      doc.rect(240, cy + 1, 15, 10).stroke(); // Correcto box
      doc.rect(257, cy + 1, 15, 10).stroke(); // Incorrecto box
      doc.rect(274, cy + 1, 18, 10).stroke(); // N/A box
      
      if (valL.includes('Correcto')) drawCheckmark(doc, 240, cy + 1);
      if (valL.includes('Incorrecto')) drawCross(doc, 257, cy + 1);
      if (valL.includes('No Aplicable')) {
        doc.fontSize(5.5).font('Helvetica-Bold').fillColor('#64748b');
        doc.text('N/A', 276.5, cy + 3.5);
        doc.fillColor('#000000');
      }
      
      // RIGHT COLUMN: Parameter (17 to 32)
      const numR = i + 17;
      let labelR = FORM_TEMPLATES[0].fields.find(f => f.label.startsWith(`${numR}.`))?.label || '';
      
      let cleanR = labelR;
      if (cleanR.length > 55) cleanR = cleanR.substring(0, 52) + '...';
      
      doc.fillColor('#000000').text(cleanR, 302, cy + 3);
      
      // Render selection boxes for Right Column at x=508
      const valR = values[labelR] || '';
      doc.rect(508, cy + 1, 15, 10).stroke(); // Correcto box
      doc.rect(525, cy + 1, 15, 10).stroke(); // Incorrecto box
      doc.rect(542, cy + 1, 18, 10).stroke(); // N/A box
      
      if (valR.includes('Correcto')) drawCheckmark(doc, 508, cy + 1);
      if (valR.includes('Incorrecto')) drawCross(doc, 525, cy + 1);
      if (valR.includes('No Aplicable')) {
        doc.fontSize(5.5).font('Helvetica-Bold').fillColor('#64748b');
        doc.text('N/A', 544.5, cy + 3.5);
        doc.fillColor('#000000');
      }
    }
    
    // Fatiga Box (y=364 to y=384)
    const fatigaY = startY + (16 * rowH); // 364
    doc.rect(30, fatigaY, 535, 20).stroke();
    
    doc.fontSize(8).font('Helvetica-Bold').fillColor('#000000');
    doc.text('¿Se siente Fatigado?', 35, fatigaY + 6);
    
    const fatigaVal = values['¿Se siente Fatigado?'] || 'No';
    
    // Checkbox for SÍ
    doc.rect(140, fatigaY + 4, 12, 12).stroke();
    doc.text('SÍ', 157, fatigaY + 6);
    if (fatigaVal === 'Sí') {
      drawCrossFatiga(doc, 140, fatigaY + 4);
    }

    // Checkbox for NO
    doc.rect(180, fatigaY + 4, 12, 12).stroke();
    doc.text('NO', 197, fatigaY + 6);
    if (fatigaVal === 'No' || !fatigaVal) {
      drawCheckmark(doc, 180, fatigaY + 4, true);
    }
    
    // Observaciones (y=384 to y=434)
    const obsY = fatigaY + 20; // 384
    doc.rect(30, obsY, 535, 50).stroke();
    doc.fontSize(8).font('Helvetica-Bold').text('Observaciones:', 35, obsY + 6);
    doc.fontSize(8).font('Helvetica').text(values['Observaciones'] || '-', 35, obsY + 16, { width: 520 });
    
    // Safety Alert text (y=434 to y=479, height=45)
    const alertY = obsY + 50; // 434
    doc.rect(30, alertY, 535, 45).fillAndStroke('#fee2e2', '#ef4444');
    doc.fillColor('#991b1b').fontSize(7.5).font('Helvetica-Bold');
    doc.text('Importante: Realice una inspección 360 de su equipo móvil antes de ponerlo en marcha.', 35, alertY + 6, { align: 'center' });
    doc.text('En caso de relevo de operador/conductor, el que recibe, debe validar la inspección realizada en el primer turno.', 35, alertY + 16, { align: 'center' });
    doc.text('Si marca uno de los espacios grises como incorrecto, se deberá detener el equipo para corregir la condición', 35, alertY + 26, { align: 'center' });
    doc.text('y/o si marca Sí en fatigado no puede iniciar su marcha.', 35, alertY + 34, { align: 'center' });
    
    // Signatures Block (y=479 to y=579, height=100)
    const sigY = alertY + 45; // 479
    doc.rect(30, sigY, 535, 100).stroke();
    
    // vertical line split signatures
    doc.moveTo(297, sigY).lineTo(297, sigY + 100).stroke();
    
    doc.moveTo(70, sigY + 65).lineTo(250, sigY + 65).stroke();
    
    if (values['Firma'] && values['Firma'].startsWith('data:image/png;base64,')) {
      try {
        const base64Data = values['Firma'].replace(/^data:image\/png;base64,/, "");
        const signatureBuffer = Buffer.from(base64Data, 'base64');
        doc.image(signatureBuffer, 80, sigY + 5, { width: 160, height: 55, align: 'center' });
      } catch (e) {
        console.error('Error insertando firma en PDF:', e);
      }
    }

    doc.fillColor('#000000').fontSize(8).font('Helvetica-Bold').text('Firma de Conductor / Operador', 70, sigY + 72, { width: 180, align: 'center' });
    doc.fontSize(7.5).font('Helvetica').text(userName || '-', 70, sigY + 82, { width: 180, align: 'center' });
    
    doc.moveTo(330, sigY + 65).lineTo(530, sigY + 65).stroke();
    doc.fontSize(8).font('Helvetica-Bold').text('Firma de Supervisor de Área', 330, sigY + 72, { width: 200, align: 'center' });
    doc.fontSize(7.5).font('Helvetica').text(values['Supervisor de área'] || '-', 330, sigY + 82, { width: 200, align: 'center' });
    
  } else {
    // ----------------------------------------------------
    // STANDARD REPORT DESIGN
    // ----------------------------------------------------
    doc.fontSize(20).font('Helvetica-Bold').text(formName, { align: 'center' });
    doc.moveDown();
    doc.fontSize(11).font('Helvetica').text(`Fecha: ${new Date().toLocaleString('es-ES')}`);
    doc.text(`Realizado por: ${userName}`);
    doc.moveDown();
    doc.fontSize(13).font('Helvetica-Bold').text('Datos registrados:');
    doc.moveDown(0.5);
    
    Object.entries(values).forEach(([key, value]) => {
      if (key === 'Firma') return; // Hide base64 text
      
      const displayValue = typeof value === 'boolean' ? (value ? 'Sí' : 'No') : (value || '-');
      doc.fontSize(11).font('Helvetica-Bold').text(`${key}: `, { goToId: true }).font('Helvetica').text(displayValue);
      doc.moveDown(0.3);
    });
    
    // Print signature at the bottom for standard reports if it exists
    if (values['Firma'] && values['Firma'].startsWith('data:image/png;base64,')) {
      doc.moveDown(2);
      doc.fontSize(11).font('Helvetica-Bold').text('Firma del Operador:');
      doc.moveDown(1);
      try {
        const base64Data = values['Firma'].replace(/^data:image\/png;base64,/, "");
        const signatureBuffer = Buffer.from(base64Data, 'base64');
        doc.image(signatureBuffer, doc.x, doc.y, { width: 160, height: 55 });
      } catch (e) {
        console.error('Error insertando firma en reporte estándar:', e);
      }
    }
  } else if (formName === 'Formato de Control de Toma y Entrega de Muestras de Agua') {
    // ----------------------------------------------------
    // CRIMEA WATER SAMPLES DESIGN (FOR-21-009)
    // ----------------------------------------------------
    doc.rect(30, 30, 535, 782).stroke();
    
    // Header Grid (Outer Box y=30 to y=85, height=55)
    doc.lineJoin('miter');
    doc.rect(30, 30, 535, 55).stroke();
    
    // Vertical split 1: Logo section (width 130)
    doc.moveTo(160, 30).lineTo(160, 85).stroke();
    // Vertical split 2: Title section (width 265)
    doc.moveTo(425, 30).lineTo(425, 85).stroke();
    
    // Logo Image
    const logoPath = path.join(process.cwd(), 'src', 'logo.jpg');
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 35, 42, { width: 120 });
    } else {
      doc.fontSize(11).font('Helvetica-Bold').text('EQUINOX GOLD', 40, 50);
    }
    
    // Title text
    doc.fontSize(9).font('Helvetica-Bold').text('FORMATO DE CONTROL DE TOMA Y ENTREGA DE MUESTRAS DE AGUA', 170, 45, { width: 240, align: 'center' });
    
    // Metadata block (Right Cell)
    doc.fontSize(7).font('Helvetica');
    doc.text('Código:', 430, 35);
    doc.font('Helvetica-Bold').text('FOR-21-009', 485, 35);
    
    doc.font('Helvetica').text('Revisión:', 430, 47);
    doc.font('Helvetica-Bold').text('0', 485, 47);
    
    doc.font('Helvetica').text('Fecha Emisión:', 430, 59);
    doc.font('Helvetica-Bold').text('21/1/2026', 485, 59);
    
    doc.font('Helvetica').text('No. Páginas:', 430, 71);
    doc.font('Helvetica-Bold').text('1/1', 485, 71);

    // Table Header (y=100)
    const tableTop = 100;
    doc.rect(30, tableTop, 535, 30).fillAndStroke('#e2e8f0', '#000000');
    doc.fillColor('#000000').fontSize(6).font('Helvetica-Bold');
    
    // Columns X coordinates and widths
    const cols = [
      { name: 'FECHA', x: 32, w: 45 },
      { name: 'ID MUESTRA', x: 80, w: 60 },
      { name: 'PUNTO MUESTREO', x: 145, w: 85 },
      { name: 'H. TOMA', x: 235, w: 35 },
      { name: 'H. ENTREGA', x: 275, w: 45 },
      { name: 'pH', x: 325, w: 20 },
      { name: 'T°(C°)', x: 350, w: 25 },
      { name: 'CONDICION', x: 380, w: 45 },
      { name: 'RESP. MUESTREO', x: 430, w: 65 },
      { name: 'RESP. RECEPCION', x: 500, w: 60 }
    ];

    // Draw Column Headers
    cols.forEach(c => {
      doc.text(c.name, c.x, tableTop + 10, { width: c.w, align: 'center' });
    });

    // Draw Vertical split lines in headers
    doc.moveTo(77, tableTop).lineTo(77, tableTop + 30).stroke();
    doc.moveTo(142, tableTop).lineTo(142, tableTop + 30).stroke();
    doc.moveTo(232, tableTop).lineTo(232, tableTop + 30).stroke();
    doc.moveTo(272, tableTop).lineTo(272, tableTop + 30).stroke();
    doc.moveTo(322, tableTop).lineTo(322, tableTop + 30).stroke();
    doc.moveTo(377, tableTop).lineTo(377, tableTop + 30).stroke();
    doc.moveTo(427, tableTop).lineTo(427, tableTop + 30).stroke();
    doc.moveTo(497, tableTop).lineTo(497, tableTop + 30).stroke();
    // Inner split for pH and T
    doc.moveTo(347, tableTop + 15).lineTo(347, tableTop + 30).stroke();
    doc.moveTo(322, tableTop + 15).lineTo(377, tableTop + 15).stroke();

    // Render Rows
    let samples = [];
    try {
      samples = JSON.parse(values['Muestras'] || '[]');
    } catch(e) {
      console.error(e);
    }

    let y = tableTop + 30;
    doc.font('Helvetica').fontSize(6);
    
    samples.forEach((row, i) => {
      // Draw Row Box
      doc.rect(30, y, 535, 20).stroke();
      
      // Draw values
      doc.text(row.date || '-', 32, y + 6, { width: 45, align: 'center' });
      doc.text(row.sampleId || '-', 80, y + 6, { width: 60, align: 'center' });
      doc.text(row.point || '-', 145, y + 6, { width: 85, align: 'center' });
      doc.text(row.timeTaken || '-', 235, y + 6, { width: 35, align: 'center' });
      doc.text(row.timeDelivered || '-', 275, y + 6, { width: 45, align: 'center' });
      doc.text(row.ph || '-', 325, y + 6, { width: 20, align: 'center' });
      doc.text(row.temp || '-', 350, y + 6, { width: 25, align: 'center' });
      doc.text(row.climate || '-', 380, y + 6, { width: 45, align: 'center' });
      doc.text(row.sampler || '-', 430, y + 6, { width: 65, align: 'center' });
      doc.text(row.receiver || '-', 500, y + 6, { width: 60, align: 'center' });

      // Draw vertical lines in row
      doc.moveTo(77, y).lineTo(77, y + 20).stroke();
      doc.moveTo(142, y).lineTo(142, y + 20).stroke();
      doc.moveTo(232, y).lineTo(232, y + 20).stroke();
      doc.moveTo(272, y).lineTo(272, y + 20).stroke();
      doc.moveTo(322, y).lineTo(322, y + 20).stroke();
      doc.moveTo(347, y).lineTo(347, y + 20).stroke();
      doc.moveTo(377, y).lineTo(377, y + 20).stroke();
      doc.moveTo(427, y).lineTo(427, y + 20).stroke();
      doc.moveTo(497, y).lineTo(497, y + 20).stroke();
      
      y += 20;
    });

    // Signature / responsible area at the bottom
    const sigY = 750;
    doc.moveTo(30, sigY).lineTo(565, sigY).stroke();
    doc.fontSize(8).font('Helvetica-Bold');
    doc.text('Realizado por: ' + (values['Realizado por'] || '-'), 35, sigY + 15, { width: 250 });
    doc.text('Revisado por: ' + (values['Revisado por'] || '-'), 305, sigY + 15, { width: 250 });

    // Photos Section
    let photos = [];
    try {
      photos = JSON.parse(values['Fotos'] || '[]');
    } catch(e) {}

    if (photos.length > 0) {
      doc.addPage();
      doc.rect(30, 30, 535, 782).stroke();
      doc.fontSize(14).font('Helvetica-Bold').text('Fotografías Adjuntas de Muestreo', 40, 50);
      
      let photoY = 80;
      photos.forEach((photo, idx) => {
        try {
          const base64Data = photo.replace(/^data:image\/[a-z]+;base64,/, "");
          const photoBuffer = Buffer.from(base64Data, 'base64');
          doc.image(photoBuffer, 40, photoY, { width: 240, height: 180 });
          doc.fontSize(10).font('Helvetica-Bold').text(`Fotografía #${idx + 1}`, 40, photoY + 190);
          photoY += 230;
        } catch(e) {
          console.error('Error insertando foto en reporte Crimea:', e);
        }
      });
    }
  }
  
  doc.end();

}

export async function listForms(req, res) {
  try {
    // Rename old form name in DB if it exists, to avoid duplicates and preserve submissions
    const oldForm = await prisma.form.findFirst({ where: { name: 'Inspección de Vehículo Liviano' } });
    if (oldForm) {
      await prisma.form.update({
        where: { id: oldForm.id },
        data: { name: 'Revisión de Pre-Uso de Vehiculo Liviano' }
      });
    }

    // Dynamic seeding: ensure all templates are in DB
    for (const temp of FORM_TEMPLATES) {
      const form = await getOrCreateFormByName(temp.name);
      
      // Sync missing fields dynamically
      const existingLabels = form.formFields.map(f => f.label);
      for (const field of temp.fields) {
        if (!existingLabels.includes(field.label)) {
          await prisma.formField.create({
            data: {
              formId: form.id,
              label: field.label,
              type: field.type,
              options: field.options || null
            }
          });
        }
      }
    }
    
    const forms = await prisma.form.findMany({ include: { area: true, formFields: true } });
    res.json(forms);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al listar formularios' });
  }
}

export async function createForm(req, res) {
  const { name, areaId, fields } = req.body;
  if (!name || !areaId) return res.status(400).json({ error: 'Nombre y área requeridos' });
  try {
    const form = await prisma.form.create({
      data: {
        name,
        areaId,
        formFields: { create: fields }
      },
      include: { formFields: true }
    });
    res.json(form);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error creando formulario' });
  }
}

async function getAnonymousUserId() {
  let user = await prisma.user.findUnique({ where: { email: 'anonimo@empresa.local' } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        name: 'Operador Anónimo',
        email: 'anonimo@empresa.local',
        password: 'blocked-password-hash',
        role: 'user'
      }
    });
  }
  return user.id;
}

export async function submitForm(req, res) {
  const { formName, values, alertLevel } = req.body;
  let userId = req.user?.userId;
  let userName = values['Inspección realizada por'] || req.user?.name || req.user?.email || 'Operador Anónimo';
  
  if (!formName || !values) {
    return res.status(400).json({ error: 'Formulario y datos requeridos' });
  }

  try {
    if (!userId) userId = await getAnonymousUserId();
    const form = await getOrCreateFormByName(formName);
    
    // Use alertLevel from frontend if provided, otherwise default to 'submitted'
    let finalStatus = 'submitted';
    if (alertLevel === 'critical') finalStatus = 'rejected';
    else if (alertLevel === 'warning') finalStatus = 'warning';

    const submission = await prisma.formSubmission.create({
      data: {
        formId: form.id,
        userId,
        status: finalStatus,
        answers: JSON.stringify(values)
      }
    });

    // Get user details for PDF
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const driverName = (user && user.email !== 'anonimo@empresa.local') ? (user.name || user.email) : userName;

    const pdfUrl = `/api/forms/pdf/${submission.id}`;

    let message = 'Formulario enviado correctamente.';
    let alertMessage = null;
    
    if (finalStatus === 'rejected') {
      alertMessage = '¡ALERTA CRÍTICA! Se detectaron fallas mecánicas vitales o fatiga. SE DEBE DETENER EL VEHÍCULO de inmediato.';
      message = 'Formulario registrado con estado RECHAZADO.';
    } else if (finalStatus === 'warning') {
      alertMessage = 'ADVERTENCIA MENOR: Se detectaron fallas menores. Conduzca con precaución y reporte al taller.';
      message = 'Formulario registrado con estado de ADVERTENCIA.';
    }

    if (formName === 'Formato de Control de Toma y Entrega de Muestras de Agua') {
      const sendToMelissa = req.body.sendToMelissa !== false;
      sendCrimeaEmailAsync(submission.id, sendToMelissa).catch(e => console.error('Error al enviar correo automático de Crimea:', e));
    }

    res.json({
      ok: true,
      message,
      alertMessage,
      status: finalStatus,
      submissionId: submission.id,
      pdfUrl
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error enviando formulario' });
  }
}

export async function listSubmissions(req, res) {
  try {
    const submissions = await prisma.formSubmission.findMany({
      include: {
        form: {
          include: { area: true }
        },
        user: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(submissions);
  } catch (err) {
    console.error('Error al listar envíos:', err);
    res.status(500).json({ error: 'Error al obtener envíos de la base de datos' });
  }
}

export async function downloadPdf(req, res) {
  try {
    const { id } = req.params;
    const submission = await prisma.formSubmission.findUnique({
      where: { id: parseInt(id) },
      include: { form: true, user: true }
    });

    if (!submission) {
      return res.status(404).json({ error: 'Envío no encontrado' });
    }

    const values = JSON.parse(submission.answers);
    const driverName = (submission.user && submission.user.email !== 'anonimo@empresa.local') 
      ? (submission.user.name || submission.user.email) 
      : (values['Inspección realizada por'] || 'Operador Anónimo');

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="form-${submission.id}.pdf"`);

    generatePdfToStream(submission.id, submission.form.name, values, driverName, res);
  } catch (err) {
    console.error('Error generando PDF on-demand:', err);
    res.status(500).json({ error: 'Error generando PDF' });
  }
}

export async function listPublicChecklists(req, res) {
  try {
    const submissions = await prisma.formSubmission.findMany({
      where: {
        form: {
          name: 'Revisión de Pre-Uso de Vehiculo Liviano'
        }
      },
      include: {
        form: {
          include: { area: true }
        },
        user: true
      },
      orderBy: { createdAt: 'desc' },
      take: 100
    });
    res.json(submissions);
  } catch (err) {
    console.error('Error al listar reportes públicos:', err);
    res.status(500).json({ error: 'Error al obtener reportes públicos' });
  }
}

export async function listVehicles(req, res) {
  try {
    const vehicles = await prisma.vehicle.findMany({
      orderBy: { no: 'asc' }
    });
    res.json(vehicles);
  } catch (err) {
    console.error('Error al listar vehículos:', err);
    res.status(500).json({ error: 'Error al obtener vehículos' });
  }
}

export async function sendEmailWithPdf(req, res) {
  const { submissionId, recipientEmail } = req.body;

  if (!submissionId || !recipientEmail) {
    return res.status(400).json({ error: 'submissionId y recipientEmail son requeridos' });
  }

  try {
    const submission = await prisma.formSubmission.findUnique({
      where: { id: parseInt(submissionId) },
      include: { form: true, user: true }
    });

    if (!submission) {
      return res.status(404).json({ error: 'Reporte no encontrado' });
    }

    const values = JSON.parse(submission.answers);
    const driverName = (submission.user && submission.user.email !== 'anonimo@empresa.local') 
      ? (submission.user.name || submission.user.email) 
      : (values['Inspección realizada por'] || 'Operador Anónimo');

    // Generate PDF to buffer in memory
    const pdfBuffer = await new Promise((resolve, reject) => {
      const pdfStream = new PassThrough();
      const chunks = [];
      pdfStream.on('data', (chunk) => chunks.push(chunk));
      pdfStream.on('end', () => resolve(Buffer.concat(chunks)));
      pdfStream.on('error', reject);
      generatePdfToStream(submission.id, submission.form.name, values, driverName, pdfStream);
    });

    // Configure Nodemailer transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: false, 
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    const mailOptions = {
      from: `"Desminic LL - Reportes" <${process.env.SMTP_USER}>`,
      to: recipientEmail,
      subject: `Checklist de Camioneta #${submission.id} - ${submission.form.name}`,
      text: `Adjunto encontrarás el reporte del checklist de pre-uso con código/placa ${values['Placa del Vehículo'] || ''} realizado por ${driverName}.`,
      attachments: [
        {
          filename: `reporte-${submission.id}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    };

    await transporter.sendMail(mailOptions);
    res.json({ ok: true, message: `Correo enviado exitosamente a ${recipientEmail}` });

  } catch (err) {
    console.error('Error en sendEmailWithPdf:', err);
    res.status(500).json({ error: err.message || 'Error interno al enviar el correo electrónico' });
  }
}

async function sendCrimeaEmailAsync(submissionId, sendToMelissa) {
  try {
    const submission = await prisma.formSubmission.findUnique({
      where: { id: submissionId },
      include: { form: true, user: true }
    });
    if (!submission) return;

    const values = JSON.parse(submission.answers);
    const driverName = values['Realizado por'] || 'Operador Anónimo';

    // Parse recipient emails
    let recipients = (process.env.CRIMEA_EMAIL_RECIPIENTS || 'pavel.useda@equinoxgold.com,byron.colleman@equinoxgold.com').split(',');
    recipients = recipients.map(email => email.trim());

    if (!sendToMelissa) {
      recipients = recipients.filter(email => !email.includes('melissa.lazo'));
    }

    // Generate PDF to buffer
    const pdfBuffer = await new Promise((resolve, reject) => {
      const pdfStream = new PassThrough();
      const chunks = [];
      pdfStream.on('data', (chunk) => chunks.push(chunk));
      pdfStream.on('end', () => resolve(Buffer.concat(chunks)));
      pdfStream.on('error', reject);
      generatePdfToStream(submission.id, submission.form.name, values, driverName, pdfStream);
    });

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: false, 
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    const mailOptions = {
      from: `"Desminic LL - Crimea Muestras" <${process.env.SMTP_USER}>`,
      to: recipients.join(', '),
      subject: `Formulario Crimea Muestras #${submission.id} - ${new Date().toLocaleDateString('es-ES')}`,
      text: `Se ha registrado una nueva toma y entrega de muestras de agua (FOR-21-009) realizada por ${driverName}.\n\nAdjunto encontrarás el reporte del formulario correspondiente en formato PDF.`,
      attachments: [
        {
          filename: `crimea-muestras-${submission.id}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    };

    await transporter.sendMail(mailOptions);
    console.log('Correo automático de Crimea enviado a:', recipients.join(', '));
  } catch (err) {
    console.error('Error al enviar correo automático de Crimea:', err);
  }
}
