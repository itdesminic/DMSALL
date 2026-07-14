import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Eliminar el usuario administrador anterior si existe
  await prisma.user.deleteMany({ where: { email: 'admin@empresa.local' } });

  // Pre-crear el usuario Administrador nuevo
  const adminEmail = 'gerencia';
  const hashed = await bcrypt.hash('DesminicLL26', 10);
  const adminExists = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!adminExists) {
    await prisma.user.create({ 
      data: { 
        name: 'Gerencia', 
        email: adminEmail, 
        password: hashed, 
        role: 'admin' 
      } 
    });
    console.log('Usuario administrador inicial creado (gerencia).');
  } else {
    await prisma.user.update({
      where: { email: adminEmail },
      data: { password: hashed, name: 'Gerencia' }
    });
    console.log('Usuario administrador actualizado (gerencia).');
  }

  // Pre-crear el usuario Anónimo de respaldo
  const anonExists = await prisma.user.findUnique({ where: { email: 'anonimo@empresa.local' } });
  if (!anonExists) {
    const hashed = await bcrypt.hash('Anonimo123*', 10);
    await prisma.user.create({
      data: {
        name: 'Operador Anónimo',
        email: 'anonimo@empresa.local',
        password: hashed,
        role: 'user'
      }
    });
    console.log('Usuario anónimo de respaldo creado.');
  }
  
  // Áreas
  const areas = ['IT', 'Cocina', 'Seguridad', 'Operaciones', 'Mantenimiento', 'Recursos Humanos'];
  for (const name of areas) {
    const exists = await prisma.area.findFirst({ where: { name } });
    if (!exists) {
      await prisma.area.create({ data: { name } });
    }
  }
  
  // Salas de reuniones
  const rooms = ['Sala Principal', 'Sala Operaciones', 'Sala Gerencia'];
  for (const name of rooms) {
    const exists = await prisma.meetingRoom.findFirst({ where: { name } });
    if (!exists) {
      await prisma.meetingRoom.create({ data: { name } });
    }
  }
  
  // Radios
  const radios = [
    { code: 'R-001', brand: 'Motorola', model: 'XTR', serial: 'SN001', type: 'UHF' }, 
    { code: 'R-002', brand: 'Kenwood', model: 'KWD', serial: 'SN002', type: 'VHF' }
  ];
  for (const r of radios) {
    const exists = await prisma.radio.findUnique({ where: { code: r.code } });
    if (!exists) {
      await prisma.radio.create({ data: r });
    }
  }

  // Camionetas de la Empresa
  const vehicles = [
    { no: 1, employee: 'Luis Carrillo', position: 'Gerente de planta Proceso', area: 'Planta de proceso', type: 'Hilux', plate: 'M399611', usage: 'Personal', company: 'DESMINIC' },
    { no: 2, employee: 'Julio Navarro', position: 'Superintendente de mina OP', area: 'Superintendencia de volcán', type: 'Hilux', plate: 'M362352', usage: 'Personal', company: 'DESMINIC' },
    { no: 3, employee: 'Julio Rangel / Jose Holmes', position: 'Capitanes de mina', area: 'Superintendencia de Mina', type: 'Hilux', plate: 'M390241', usage: 'Operación', company: 'DESMINIC' },
    { no: 4, employee: 'René Antonio López López', position: 'Jefe de Manto. Industrial', area: 'Mantenimiento Industrial', type: 'Hilux', plate: 'M149882', usage: 'Operación', company: 'DESMINIC' },
    { no: 5, employee: 'Joe Quezada', position: 'Supervisor de tajo OP', area: 'Mina tajo mojón', type: 'Hilux', plate: 'M367419', usage: 'Operación', company: 'DESMINIC' },
    { no: 6, employee: 'Jorge Zamora', position: 'Ingeniero de Proyectos', area: 'Gerencia de Proyectos', type: 'Hilux', plate: 'M358396', usage: 'Operación', company: 'DESMINIC' },
    { no: 7, employee: 'Sergio Tijerino', position: 'Supervisor de geología', area: 'Geología de Mina', type: 'Hilux', plate: 'M359311', usage: 'Operación', company: 'DESMINIC' },
    { no: 8, employee: 'Benito Filemon Romero', position: 'Superintendente de Laboratorio', area: 'Laboratorio Químico y Met.', type: 'Hilux', plate: 'M359309', usage: 'Personal', company: 'DESMINIC' },
    { no: 9, employee: 'Heidi Vallecillo', position: 'Superint. de Sostenibilidad', area: 'Medio Ambiente', type: 'Hilux', plate: 'M359321', usage: 'Personal', company: 'DESMINIC' },
    { no: 10, employee: 'Julio Navarro', position: 'Superintendente de Mina OP', area: 'Conequisa', type: 'Hilux', plate: 'M362350', usage: 'Operación', company: 'DESMINIC' },
    { no: 11, employee: 'Julio Navarro', position: 'Superintendente de Mina OP', area: 'Superintendencia de volcán', type: 'Hilux', plate: 'M326092', usage: 'Operación', company: 'DESMINIC' },
    { no: 12, employee: 'Julio Rangel / Jose Holmes', position: 'Capitanes de mina', area: 'Mina UG', type: 'Hilux', plate: 'M331789', usage: 'Operación', company: 'DESMINIC' },
    { no: 13, employee: 'Sayra Poveda', position: 'Jefa de mineria artesanal', area: 'Minería Artesanal', type: 'Hilux', plate: 'M334704', usage: 'Operación', company: 'DESMINIC' },
    { no: 14, employee: 'Oscar Lorio/Ruben Urbina/Wilfredo Mena', position: 'Supervisor forestal', area: 'Medio Ambiente', type: 'Hilux', plate: 'M194714', usage: 'Operación', company: 'DESMINIC' },
    { no: 15, employee: 'Jefry Enoc Chavez', position: 'Superintendente Seg. Física', area: 'Seguridad Física', type: 'Hilux', plate: 'M326091', usage: 'Personal', company: 'DESMINIC' },
    { no: 16, employee: 'Miguel Angel Crovetto', position: 'Superint. Almacén y Logística', area: 'Almacén', type: 'Hilux', plate: 'M334473', usage: 'Personal', company: 'DESMINIC' },
    { no: 17, employee: 'Gerson Muñarte', position: 'Gerente de Petra', area: 'Mina UG', type: 'Hilux', plate: 'M283583', usage: 'Operación', company: 'DESMINIC' },
    { no: 18, employee: 'Hector Ugarte', position: 'Supervisor junior geología', area: 'Jefe de Geologia ASM', type: 'Hilux', plate: 'M259259', usage: 'Operación', company: 'DESMINIC' },
    { no: 19, employee: 'Walter Mendoza', position: 'Jefe de Relaciones Comunitaria', area: 'Sostenibilidad', type: 'Hilux', plate: 'M326093', usage: 'Operación', company: 'DESMINIC' },
    { no: 20, employee: 'Engels Espinoza', position: 'Superintendente de proyecto', area: 'Proyectos', type: 'Hilux', plate: 'M181445', usage: 'Operación', company: 'DESMINIC' },
    { no: 21, employee: 'Oscar Danilo Mejia', position: 'Supervisor de topografía', area: 'Mina UG', type: 'Land Cruiser', plate: 'M213057', usage: 'Operación', company: 'DESMINIC' },
    { no: 22, employee: 'Efren Chavarria', position: 'Jefe de compras', area: 'Almacén y Logística', type: 'Hilux', plate: 'M334753', usage: 'Operación', company: 'DESMINIC' },
    { no: 23, employee: 'Jorge Dimas Gomez', position: 'Jefe de planificación y geomec.', area: 'Planificación y Geomecánica', type: 'Hilux', plate: 'M192619', usage: 'Operación', company: 'DESMINIC' },
    { no: 24, employee: 'Gary Anthony Sinclair', position: 'Jefe de topografia y planificación', area: 'Topografía y Planificador UG', type: 'Hilux', plate: 'M196703', usage: 'Operación', company: 'DESMINIC' },
    { no: 25, employee: 'Gary Zambrana', position: 'Jefe de Servicios Generales', area: 'Administración', type: 'Hilux', plate: 'M326089', usage: 'Operación', company: 'DESMINIC' },
    { no: 26, employee: 'Eliezer Soto', position: 'Supervisor H & S', area: 'Jefatura de Emergencia', type: 'Hilux', plate: 'M261605', usage: 'Operación', company: 'DESMINIC' },
    { no: 27, employee: 'Rolando Chavarria/Elier Espinoza', position: 'Supervisor Proceso', area: 'Planta de proceso', type: 'Hilux', plate: 'M326090', usage: 'Operación', company: 'DESMINIC' },
    { no: 28, employee: 'Mario Zapata', position: 'Jefe de atención a emergencia', area: 'Seguridad industrial', type: 'Hilux', plate: 'M184554', usage: 'Operación', company: 'DESMINIC' },
    { no: 29, employee: 'Erwin Pichardo', position: 'Jefe taller móvil', area: 'Taller Movil', type: 'Hilux', plate: 'M301874', usage: 'Operación', company: 'DESMINIC' },
    { no: 30, employee: 'Erwin Pichardo', position: 'Jefe taller móvil', area: 'Taller Movil', type: 'Land Cruiser', plate: 'M283036', usage: 'Operación', company: 'LEASING' },
    { no: 31, employee: 'Joe Quezada', position: 'Supervisor de tajo OP', area: 'Mina tajo mojón', type: 'Hilux', plate: 'M358383', usage: 'Operación', company: 'DESMINIC' },
    { no: 32, employee: 'Leonardo Hernandez', position: 'Jefe de Manto. Eléctrico', area: 'Manto. Gral', type: 'Hilux', plate: 'M181442', usage: 'Operación', company: 'DESMINIC' },
    { no: 33, employee: 'Jaime Garcia Monge', position: 'Jefe de geología', area: 'Geologia volcán', type: 'Hilux', plate: 'M334758', usage: 'Operación', company: 'DESMINIC' },
    { no: 34, employee: 'Cuadrilla de Turneros De Taller Elec', position: 'Técnicos eléctricos', area: 'Taller Electricos', type: 'Land Cruiser', plate: 'M200479', usage: 'Operación', company: 'DESMINIC' },
    { no: 35, employee: 'Jaime Garcia Monge', position: 'Jefe de geología', area: 'Geologia volcán', type: 'Hilux', plate: 'M354151', usage: 'Operación', company: 'DESMINIC' },
    { no: 36, employee: 'Julio Navarro', position: 'Superintendente de Mina OP', area: 'Tajo Volcán', type: 'Hilux', plate: 'M380549', usage: 'Operación', company: 'DESMINIC' },
    { no: 37, employee: 'Maricela Medrano', position: 'Superintendente RRHH', area: 'Gerencia Administrativa', type: 'Toyota Rav -4', plate: 'M288160', usage: 'Operación', company: 'DESMINIC' },
    { no: 38, employee: 'William Ramirez', position: 'Superintendente Seg. Industrial', area: 'Seguridad industrial', type: 'Hilux', plate: 'M 434-572', usage: 'Personal', company: 'LEASING' },
    { no: 39, employee: 'Engels Espinoza', position: 'Superintendente de proyecto', area: 'Proyectos', type: 'Hilux', plate: 'M 451-169', usage: 'Personal', company: 'LEASING' },
    { no: 40, employee: 'Rene Lopez', position: 'Jefe de Manto. Industrial', area: 'Manto. Gral', type: 'Hilux', plate: 'M 451-170', usage: 'Personal', company: 'LEASING' },
    { no: 41, employee: 'Ramiro Marruco', position: 'Gerente de Mina', area: 'Mina', type: 'Hilux', plate: 'M 451-171', usage: 'Personal', company: 'LEASING' },
    { no: 42, employee: 'Julio Navarro', position: 'Superintendente de Mina OP', area: 'Tajo Volcán', type: 'Hilux', plate: 'M 452-012', usage: 'Personal', company: 'LEASING' },
    { no: 43, employee: 'Jairo Barea', position: 'Supervisor de Manto. Industrial', area: 'Mantenimiento', type: 'Hilux', plate: 'M 452-009', usage: 'Operación', company: 'LEASING' },
    { no: 44, employee: 'Ronier Lorio', position: 'Supervisor de mantenimiento', area: 'Mantenimiento', type: 'Hilux', plate: 'M 453-212', usage: 'Operación', company: 'LEASING' },
    { no: 45, employee: 'Byron Colleman', position: 'Jefe de presa de colas', area: 'Proyectos', type: 'Hilux', plate: 'M 452-014', usage: 'Operación', company: 'LEASING' },
    { no: 46, employee: 'Yovanny López', position: 'Jefe Manto. Eléctrico UG', area: 'Mantenimiento', type: 'Hilux', plate: 'M 453-318', usage: 'Operación', company: 'LEASING' },
    { no: 47, employee: 'Lanina De La Rosa', position: 'Superintendente servicios téc.', area: 'Mina', type: 'Hilux', plate: 'M 434-575', usage: 'Personal', company: 'LEASING' },
    { no: 48, employee: 'Juan Ignacio Olivas', position: 'Gerente general', area: 'Gerencia general', type: 'Hilux', plate: 'M 436-440', usage: 'Personal', company: 'LEASING' },
    { no: 49, employee: 'Julio Navarro', position: 'Superintendente de Mina OP', area: 'Tajo Volcán', type: 'Land Cruiser', plate: 'M 444-921', usage: 'Operación', company: 'LEASING' },
    { no: 50, employee: 'Julio Navarro', position: 'Superintendente de Mina OP', area: 'Tajo Volcán', type: 'Hilux', plate: 'M 444-967', usage: 'Operación', company: 'LEASING' },
    { no: 51, employee: 'Reynaldo Córdoba', position: 'Superintendente de Manto. Gral', area: 'Manto. Gral', type: 'Hilux', plate: 'M 451-160', usage: 'Personal', company: 'LEASING' },
    { no: 52, employee: 'Mónica Guadalupe Dávalos', position: 'Superintendente de Proceso', area: 'Proceso', type: 'Hilux', plate: 'M 460-099', usage: 'Personal', company: 'LEASING' },
    { no: 53, employee: 'Jorge Calderón', position: 'Superintendente de geología', area: 'Mina', type: 'Hilux', plate: 'M 460-450', usage: 'Personal', company: 'LEASING' },
    { no: 54, employee: 'Leonardo Kappes', position: 'Superintendente de mina', area: 'Mina', type: 'Hilux', plate: 'M 463-705', usage: 'Personal', company: 'LEASING' },
    { no: 55, employee: 'Jaime García', position: 'Jefe de geología', area: 'Geología Mina', type: 'Hilux', plate: 'M 452-008', usage: 'Personal', company: 'LEASING' },
    { no: 56, employee: 'Juan Carlos Diaz Escobar', position: 'Gerente de proyecto', area: 'Planificación de Negocios y Proyectos', type: 'Hilux', plate: 'M 461-390', usage: 'Personal', company: 'DESMINIC' },
    { no: 57, employee: 'Doris Escalona', position: 'Gerente administrativo', area: 'Administración', type: 'Hilux', plate: 'M 460-097', usage: 'Personal', company: 'LEASING' }
  ];

  for (const v of vehicles) {
    const exists = await prisma.vehicle.findUnique({ where: { plate: v.plate } });
    if (!exists) {
      await prisma.vehicle.create({ data: v });
    }
  }

  console.log('Verificación y siembra de datos completada de forma segura.');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
