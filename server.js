require('dotenv').config();

const app = require('./app');
const { connectDB, closeDB, query } = require('./src/config/database');
const { sembrarInicial } = require('./src/seed');

const PORT = process.env.PORT || 4000;

/** Carga los datos iniciales solo si la base de datos esta vacia. */
async function sembrarSiVacio() {
  try {
    const { rows } = await query('SELECT COUNT(*)::int AS total FROM usuarios');
    if (rows[0].total === 0) {
      console.log('Base de datos vacia: cargando datos iniciales...');
      await sembrarInicial();
      console.log('Datos iniciales cargados correctamente.');
    }
  } catch (err) {
    console.error('No se pudieron cargar los datos iniciales:', err.message);
  }
}

async function iniciar() {
  if (!process.env.JWT_SECRET) {
    console.error('Falta JWT_SECRET en el archivo .env (ver .env.example).');
    process.exit(1);
  }

  try {
    await connectDB();
    await sembrarSiVacio();
  } catch (err) {
    console.error('No se pudo conectar con PostgreSQL:', err.message);
    console.error('El servidor arrancara igualmente; las rutas que usan la base de datos fallaran hasta configurar DATABASE_URL correctamente.');
  }

  const servidor = app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
    console.log(`Entorno: ${process.env.NODE_ENV || 'development'}`);
  });

  const cerrar = async (senal) => {
    console.log(`\nSenal ${senal} recibida, cerrando servidor...`);
    servidor.close(async () => {
      await closeDB();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10000).unref();
  };

  process.on('SIGINT', () => cerrar('SIGINT'));
  process.on('SIGTERM', () => cerrar('SIGTERM'));

  process.on('unhandledRejection', (err) => {
    console.error('Promesa rechazada sin manejar:', err);
  });
}

iniciar();
