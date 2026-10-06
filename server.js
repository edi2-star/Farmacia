require('dotenv').config();

const app = require('./app');
const { connectDB, closeDB } = require('./src/config/database');

const PORT = process.env.PORT || 4000;

async function iniciar() {
  if (!process.env.JWT_SECRET) {
    console.error('Falta JWT_SECRET en el archivo .env (ver .env.example).');
    process.exit(1);
  }

  try {
    await connectDB();
  } catch (err) {
    console.error('No se pudo conectar con MongoDB:', err.message);
    console.error('Verifica que MongoDB este corriendo y que MONGODB_URI sea correcto.');
    process.exit(1);
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
