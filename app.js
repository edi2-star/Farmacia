const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');

const { adjuntarUsuario } = require('./src/middleware/auth.middleware');
const { flashLocals } = require('./src/middleware/flash.middleware');

const authRoutes = require('./src/routes/auth.routes');
const webRoutes = require('./src/routes/web.routes');
const laboratorioRoutes = require('./src/routes/laboratorio.routes');
const ordenCompraRoutes = require('./src/routes/ordenCompra.routes');

const app = express();

// Render / proxys: confia en X-Forwarded-* (necesario para cookies secure en HTTPS).
app.set('trust proxy', 1);

// Vistas EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src', 'views'));

// Archivos estaticos (Bootstrap propio, JS del cliente)
app.use(express.static(path.join(__dirname, 'src', 'public')));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Cookies (JWT en cookie HttpOnly)
app.use(cookieParser());

// Locales para las vistas
app.use(adjuntarUsuario);
app.use(flashLocals);

// Rutas
app.use('/', webRoutes);
app.use('/', authRoutes);
app.use('/', laboratorioRoutes);
app.use('/', ordenCompraRoutes);

// 404
app.use((req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ ok: false, mensaje: 'Recurso no encontrado.' });
  }
  return res.status(404).render('error', {
    titulo: 'Pagina no encontrada',
    codigo: 404,
    mensaje: 'La pagina que buscas no existe o fue movida.',
  });
});

// Manejador centralizado de errores
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('Error no controlado:', err.message);
  if (req.path.startsWith('/api/') || (req.headers.accept || '').includes('application/json')) {
    return res.status(500).json({ ok: false, mensaje: 'Error interno del servidor.' });
  }
  return res.status(500).render('error', {
    titulo: 'Error del servidor',
    codigo: 500,
    mensaje: 'Ocurrio un error inesperado. Intenta nuevamente.',
  });
});

module.exports = app;
