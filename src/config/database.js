const mongoose = require('mongoose');

let cierreIntencional = false;

/**
 * Conexion centralizada a MongoDB.
 * Solo cambia la variable MONGODB_URI en .env para pasar de local a Atlas.
 */
async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('MONGODB_URI no esta definida. Configura el archivo .env (ver .env.example).');
  }

  mongoose.set('strictQuery', true);
  cierreIntencional = false;

  mongoose.connection.on('connected', () => {
    console.log(`MongoDB conectado a: ${mongoose.connection.host}/${mongoose.connection.name}`);
  });

  mongoose.connection.on('disconnected', () => {
    if (!cierreIntencional) console.warn('MongoDB: conexion perdida.');
  });

  mongoose.connection.on('error', (err) => {
    console.error('MongoDB error de conexion:', err.message);
  });

  await mongoose.connect(uri);
  return mongoose.connection;
}

/**
 * Cierre apropiado de la conexion (senales del proceso / fallo critico).
 */
async function closeDB() {
  if (mongoose.connection.readyState !== 0) {
    cierreIntencional = true;
    await mongoose.connection.close();
    console.log('MongoDB: conexion cerrada correctamente.');
  }
}

module.exports = { connectDB, closeDB };
