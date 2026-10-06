const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

/** Obtiene el JWT desde cookie HttpOnly o desde el header Authorization Bearer. */
function obtenerToken(req) {
  if (req.cookies && req.cookies.token) return req.cookies.token;
  const auth = req.headers.authorization;
  if (auth && auth.startsWith('Bearer ')) return auth.slice(7);
  return null;
}

function duracionCookie() {
  const texto = process.env.JWT_EXPIRES_IN || '2h';
  const match = /^(\d+)\s*([smhd])$/i.exec(texto.trim());
  if (!match) return 2 * 60 * 60 * 1000;
  const valor = parseInt(match[1], 10);
  const unidad = match[2].toLowerCase();
  const factor = { s: 1000, m: 60 * 1000, h: 60 * 60 * 1000, d: 24 * 60 * 60 * 1000 }[unidad];
  return valor * factor;
}

function opcionesCookie() {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: duracionCookie(),
  };
}

function esApi(req) {
  return req.path.startsWith('/api/') || (req.headers.accept || '').includes('application/json');
}

/**
 * Adjunta req.usuario / res.locals.usuario sin bloquear la peticion.
 * Se usa para que las vistas (navbar) sepan quien esta logueado.
 */
async function adjuntarUsuario(req, res, next) {
  try {
    const token = obtenerToken(req);
    if (!token) {
      req.usuario = null;
      res.locals.usuario = null;
      return next();
    }
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const usuario = await Usuario.buscarPorId(payload.id);
    req.usuario = usuario || null;
  } catch (err) {
    req.usuario = null;
  }
  res.locals.usuario = req.usuario;
  next();
}

/** Exige un JWT valido. Si no hay o es invalido, redirige al login (o 401 en API). */
async function verifyToken(req, res, next) {
  const token = obtenerToken(req);

  if (!token) {
    return redirigirLogin(req, res, false);
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const usuario = await Usuario.buscarPorId(payload.id);
    if (!usuario) {
      res.clearCookie('token');
      return redirigirLogin(req, res, true);
    }
    req.usuario = usuario;
    req.payload = payload;
    res.locals.usuario = usuario;
    return next();
  } catch (err) {
    res.clearCookie('token');
    return redirigirLogin(req, res, true);
  }
}

function redirigirLogin(req, res, invalido) {
  if (esApi(req)) {
    return res.status(401).json({ ok: false, mensaje: 'Sesion no valida o expirada. Inicia sesion novamente.' });
  }
  const mensaje = invalido
    ? 'Tu sesion ha expirado o no es valida, vuelve a iniciar sesion.'
    : 'Debes iniciar sesion para acceder a esa pagina.';
  return res.redirect(`/login?error=${encodeURIComponent(mensaje)}`);
}

module.exports = {
  obtenerToken,
  opcionesCookie,
  duracionCookie,
  adjuntarUsuario,
  verifyToken,
};
