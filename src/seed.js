/**
 * Script de carga de datos iniciales (seed).
 * Uso: npm run seed
 * No duplica registros: usa claves unicas (email, CodLab, NroOrdenC).
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
    razonSocial: 'Farmacéutica del Sur S.A.',
    direccion: 'Jr. Bolognesi 220 - Arequipa',
    telefono: '054 223 344',
    email: 'ventas@delsur.pe',
    contacto: 'Carlos Mendoza',
  },
  {
    CodLab: 'LAB003',
    razonSocial: 'Bioquímica Peruana E.I.R.L.',
    direccion: 'Calle Los Olivos 890 - Trujillo',
    telefono: '044 112 233',
    email: 'info@bioperu.pe',
    contacto: 'Lucía Fernández',
  },
];

const ORDENES = [
  {
    NroOrdenC: 'OC-0001',
    fechaEmision: '2026-09-15',
    Situacion: 'Completada',
    Total: 1450.5,
    NrofacturaProv: 'F001-000120',
    laboratorio: 'LAB001',
  },
  {
    NroOrdenC: 'OC-0002',
    fechaEmision: '2026-09-28',
    Situacion: 'Pendiente',
    Total: 890,
    NrofacturaProv: 'F002-000455',
    laboratorio: 'LAB002',
  },
  {
    NroOrdenC: 'OC-0003',
    fechaEmision: '2026-10-02',
    Situacion: 'En proceso',
    Total: 2320.75,
    NrofacturaProv: 'F003-000087',
    laboratorio: 'LAB003',
  },
  {
    NroOrdenC: 'OC-0004',
    fechaEmision: '2026-10-05',
    Situacion: 'Pendiente',
    Total: 540.9,
    NrofacturaProv: 'F001-000131',
    laboratorio: 'LAB001',
  },
];

async function sembrarUsuarios() {
  let creados = 0;
  let actualizados = 0;

  for (const dato of USUARIOS) {
    const existente = await Usuario.findOne({ email: dato.email });
    if (existente) {
      let cambios = false;
      if (existente.role !== dato.role) {
        existente.role = dato.role;
        cambios = true;
      }
      if (existente.nombre !== dato.nombre) {
        existente.nombre = dato.nombre;
        cambios = true;
      }
      if (cambios) {
        await existente.save();
        actualizados += 1;
      }
      continue;
    }

    await Usuario.create({
      nombre: dato.nombre,
      email: dato.email,
      password: dato.password,
      role: dato.role,
    });
    creados += 1;
  }

  console.log(`Usuarios: ${creados} creados, ${actualizados} actualizados.`);
}

async function sembrarLaboratorios() {
  let creados = 0;
  let actualizados = 0;

  for (const dato of LABORATORIOS) {
    const existente = await Laboratorio.findOne({ CodLab: dato.CodLab });
    if (existente) {
      Object.assign(existente, dato);
      await existente.save();
      actualizados += 1;
      continue;
    }
    await Laboratorio.create(dato);
    creados += 1;
  }

  console.log(`Laboratorios: ${creados} creados, ${actualizados} actualizados.`);
  return Laboratorio.find().select('CodLab').lean();
}

async function sembrarOrdenes(laboratorios) {
  const porCodigo = new Map(laboratorios.map((lab) => [lab.CodLab, lab._id]));
  let creadas = 0;
  let actualizadas = 0;

  for (const dato of ORDENES) {
    const idLab = porCodigo.get(dato.laboratorio);
    if (!idLab) continue;

    const existente = await OrdenCompra.findOne({ NroOrdenC: dato.NroOrdenC });
    const registro = {
      NroOrdenC: dato.NroOrdenC,
      fechaEmision: dato.fechaEmision,
      Situacion: dato.Situacion,
      Total: dato.Total,
      NrofacturaProv: dato.NrofacturaProv,
      CodLab: idLab,
    };

    if (existente) {
      Object.assign(existente, registro);
      await existente.save();
      actualizadas += 1;
      continue;
    }

    await OrdenCompra.create(registro);
    creadas += 1;
  }

  console.log(`Ordenes de compra: ${creadas} creadas, ${actualizadas} actualizadas.`);
}

async function main() {
  try {
    await connectDB();
    console.log('Cargando datos iniciales en bd_Farmacia...');

    await sembrarUsuarios();
    const laboratorios = await sembrarLaboratorios();
    await sembrarOrdenes(laboratorios);

    console.log('Seed finalizado correctamente.');
  } catch (err) {
    console.error('Error durante el seed:', err.message);
    process.exitCode = 1;
  } finally {
    await closeDB();
  }
}

main();
