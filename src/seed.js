/**
 * Script de carga de datos iniciales (seed) sobre PostgreSQL.
 * Uso: npm run seed
 * No duplica registros: usa claves unicas (email, codlab, nroordenc).
 */
require('dotenv').config();

const { connectDB, closeDB } = require('./config/database');
const Usuario = require('./models/Usuario');
const Laboratorio = require('./models/Laboratorio');
const OrdenCompra = require('./models/OrdenCompra');

const USUARIOS = [
  { nombre: 'Administrador General', email: 'admin@farmacia.com', password: 'admin123', role: 'administrador' },
  { nombre: 'Moderador de Datos', email: 'moderador@farmacia.com', password: 'moderador123', role: 'moderador' },
  { nombre: 'Usuario Consulta', email: 'usuario@farmacia.com', password: 'usuario123', role: 'usuario' },
];

const LABORATORIOS = [
  {
    CodLab: 'LAB001',
    razonSocial: 'Laboratorios Andinos S.A.C.',
    direccion: 'Av. Industrias 1450 - San Borja',
    telefono: '01 456 7890',
    email: 'contacto@andinos.pe',
    contacto: 'Maria Rojas',
  },
  {
    CodLab: 'LAB002',
    razonSocial: 'Farmaceutica del Sur S.A.',
    direccion: 'Jr. Bolognesi 220 - Arequipa',
    telefono: '054 223 344',
    email: 'ventas@delsur.pe',
    contacto: 'Carlos Mendoza',
  },
  {
    CodLab: 'LAB003',
    razonSocial: 'Bioquimica Peruana E.I.R.L.',
    direccion: 'Calle Los Olivos 890 - Trujillo',
    telefono: '044 112 233',
    email: 'info@bioperu.pe',
    contacto: 'Lucia Fernandez',
  },
];

const ORDENES = [
  { NroOrdenC: 'OC-0001', fechaEmision: '2026-09-15', Situacion: 'Completada', Total: 1450.5, NrofacturaProv: 'F001-000120', laboratorio: 'LAB001' },
  { NroOrdenC: 'OC-0002', fechaEmision: '2026-09-28', Situacion: 'Pendiente', Total: 890, NrofacturaProv: 'F002-000455', laboratorio: 'LAB002' },
  { NroOrdenC: 'OC-0003', fechaEmision: '2026-10-02', Situacion: 'En proceso', Total: 2320.75, NrofacturaProv: 'F003-000087', laboratorio: 'LAB003' },
  { NroOrdenC: 'OC-0004', fechaEmision: '2026-10-05', Situacion: 'Pendiente', Total: 540.9, NrofacturaProv: 'F001-000131', laboratorio: 'LAB001' },
];

async function sembrarUsuarios() {
  let creados = 0;
  let actualizados = 0;

  for (const dato of USUARIOS) {
    const existente = await Usuario.buscarPorEmail(dato.email);
    if (existente) {
      await Usuario.actualizarBasico(dato.email, { nombre: dato.nombre, role: dato.role });
      actualizados += 1;
      continue;
    }
    await Usuario.crear(dato);
    creados += 1;
  }

  console.log(`Usuarios: ${creados} creados, ${actualizados} actualizados.`);
}

async function sembrarLaboratorios() {
  let creados = 0;
  let actualizados = 0;

  for (const dato of LABORATORIOS) {
    const existente = await Laboratorio.buscarPorCodigo(dato.CodLab);
    if (existente) {
      await Laboratorio.actualizar(existente._id, dato);
      actualizados += 1;
      continue;
    }
    await Laboratorio.crear(dato);
    creados += 1;
  }

  console.log(`Laboratorios: ${creados} creados, ${actualizados} actualizados.`);
}

async function sembrarOrdenes() {
  let creadas = 0;
  let actualizadas = 0;

  for (const dato of ORDENES) {
    const laboratorio = await Laboratorio.buscarPorCodigo(dato.laboratorio);
    if (!laboratorio) continue;

    const registro = {
      NroOrdenC: dato.NroOrdenC,
      fechaEmision: dato.fechaEmision,
      Situacion: dato.Situacion,
      Total: dato.Total,
      CodLab: laboratorio._id,
      NrofacturaProv: dato.NrofacturaProv,
    };

    const idExistente = await OrdenCompra.buscarIdPorNumero(dato.NroOrdenC);
    if (idExistente) {
      await OrdenCompra.actualizar(idExistente, registro);
      actualizadas += 1;
      continue;
    }

    await OrdenCompra.crear(registro);
    creadas += 1;
  }

  console.log(`Ordenes de compra: ${creadas} creadas, ${actualizadas} actualizadas.`);
}

async function main() {
  try {
    await connectDB();
    console.log('Cargando datos iniciales en PostgreSQL (bd_Farmacia)...');

    await sembrarUsuarios();
    await sembrarLaboratorios();
    await sembrarOrdenes();

    console.log('Seed finalizado correctamente.');
  } catch (err) {
    console.error('Error durante el seed:', err.message);
    process.exitCode = 1;
  } finally {
    await closeDB();
  }
}

main();