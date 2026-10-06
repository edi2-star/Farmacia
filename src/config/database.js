const { Pool } = require('pg');

let pool = null;
let conectado = false;

/** Lee la cadena de conexion (Render inyecta DATABASE_URL). */
function obtenerCadena() {
  return process.env.DATABASE_URL || '';
}

/** Activa SSL solo cuando corresponde (URL externa de Render / sslmode). */
function opcionesSsl(cadena) {
  if (process.env.PGSSL === 'false') return false;
  if (process.env.PGSSL === 'true') return { rejectUnauthorized: false };
  return /sslmode=require|\.render\.com|\.oregon-postgres/.test(cadena) ? { rejectUnauthorized: false } : false;
}

function crearPool() {
  const cadena = obtenerCadena();
  if (!cadena) {
    throw new Error('DATABASE_URL no esta definida. Configura el archivo .env (ver .env.example).');
  }
  const nuevo = new Pool({ connectionString: cadena, ssl: opcionesSsl(cadena), max: 10 });
  nuevo.on('error', (err) => console.error('PostgreSQL error de conexion:', err.message));
  return nuevo;
}

/** Crea las tablas si no existen (equivalente a las colecciones de MongoDB). */
async function inicializarEsquema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id         SERIAL PRIMARY KEY,
      nombre     VARCHAR(80)  NOT NULL,
      email      VARCHAR(120) NOT NULL UNIQUE,
      password   VARCHAR(120) NOT NULL,
      role       VARCHAR(20)  NOT NULL DEFAULT 'usuario'
                 CHECK (role IN ('administrador', 'moderador', 'usuario')),
      creado_en  TIMESTAMPTZ  NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS laboratorios (
      id           SERIAL PRIMARY KEY,
      codlab       VARCHAR(20)  NOT NULL UNIQUE,
      razonsocial  VARCHAR(120) NOT NULL,
      direccion    VARCHAR(160) NOT NULL,
      telefono     VARCHAR(20)  NOT NULL,
      email        VARCHAR(120) NOT NULL,
      contacto     VARCHAR(80)  NOT NULL,
      creado_en    TIMESTAMPTZ  NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS ordenes_compra (
      id              SERIAL PRIMARY KEY,
      nroordenc       VARCHAR(30)  NOT NULL UNIQUE,
      fechaemision    DATE         NOT NULL,
      situacion       VARCHAR(40)  NOT NULL,
      total           NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (total >= 0),
      codlab          INTEGER      NOT NULL REFERENCES laboratorios(id),
      nrofacturaprov  VARCHAR(40)  NOT NULL,
      creado_en       TIMESTAMPTZ  NOT NULL DEFAULT now()
    );
  `);
}

async function connectDB() {
  if (!pool) pool = crearPool();
  await pool.query('SELECT 1');
  await inicializarEsquema();
  conectado = true;

  let host = 'desconocido';
  try {
    host = new URL(obtenerCadena()).host;
  } catch (err) {
    /* se deja 'desconocido' */
  }
  console.log(`PostgreSQL conectado a: ${host}`);
  return pool;
}

async function query(texto, parametros) {
  if (!pool) pool = crearPool();
  return pool.query(texto, parametros);
}

function estaConectado() {
  return conectado;
}

async function closeDB() {
  if (pool) {
    await pool.end();
    pool = null;
    conectado = false;
    console.log('PostgreSQL: conexion cerrada correctamente.');
  }
}

module.exports = { connectDB, query, estaConectado, closeDB };