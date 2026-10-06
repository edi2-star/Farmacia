const Usuario = require('../models/Usuario');
const { opcionesCookie, duracionCookie } = require('../middleware/auth.middleware');
const { validarRegistro, validarLogin, erroresDeMongoose, soloTexto } = require('../utils/validadores');
const { redirigirCon } = require('../middleware/flash.middleware');

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** GET /registro */
function mostrarRegistro(req, res) {
  res.render('auth/registro', {
    titulo: 'Registro',
    datos: {},
    errores: {},
  });
}

/** POST /registro - siempre crea role "usuario" (nunca se acepta el rol del formulario). */
async function registrar(req, res) {
  const datos = {
    nombre: soloTexto(req.body.nombre),
    email: soloTexto(req.body.email).toLowerCase(),
    password: String(req.body.password || ''),
    confirmarPassword: String(req.body.confirmarPassword || ''),
  };

  const errores = validarRegistro(datos);

  if (Object.keys(errores).length === 0) {
    const existe = await Usuario.findOne({ email: datos.email });
    if (existe) errores.email = 'Ese email ya esta registrado.';
  }

  if (Object.keys(errores).length > 0) {
    return res.status(400).render('auth/registro', {
      titulo: 'Registro',
      datos: { nombre: datos.nombre, email: datos.email },
      errores,
    });
  }

  try {
    await Usuario.create({
      nombre: datos.nombre,
      email: datos.email,
      password: datos.password,
      role: 'usuario',
    });
    return redirigirCon(res, '/login', 'exito', 'Cuenta creada correctamente. Ya puedes iniciar sesion.');
  } catch (err) {
    const erroresMongo = erroresDeMongoose(err);
    if (Object.keys(erroresMongo).length > 0) {
      return res.status(400).render('auth/registro', {
        titulo: 'Registro',
        datos: { nombre: datos.nombre, email: datos.email },
        errores: erroresMongo,
      });
    }
    throw err;
  }
}

/** GET /login */
function mostrarLogin(req, res) {
  res.render('auth/login', {
    titulo: 'Iniciar sesion',
    datos: {},
    errores: {},
  });
}

/** POST /login - genera el JWT y lo guarda en cookie HttpOnly. */
async function login(req, res) {
  const email = soloTexto(req.body.email).toLowerCase();
  const password = String(req.body.password || '');

  const errores = validarLogin({ email, password });
  if (Object.keys(errores).length > 0) {
    return res.status(400).render('auth/login', {
      titulo: 'Iniciar sesion',
      datos: { email },
      errores,
    });
  }

  const usuario = await Usuario.findOne({ email }).select('+password');
  if (!usuario || !(await usuario.compararPassword(password))) {
    return res.status(401).render('auth/login', {
      titulo: 'Iniciar sesion',
      datos: { email },
      errores: { general: 'Email o contrasena incorrectos.' },
    });
  }

  const token = require('jsonwebtoken').sign(
    { id: usuario._id, role: usuario.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '2h' }
  );

  res.cookie('token', token, opcionesCookie());

  return redirigirCon(res, '/menu', 'exito', `Bienvenido(a), ${usuario.nombre}.`);
}

/** GET / POST /logout */
function logout(req, res) {
  res.clearCookie('token');
  return redirigirCon(res, '/login', 'exito', 'Sesion cerrada correctamente.');
}

module.exports = {
  mostrarRegistro,
  registrar,
  mostrarLogin,
  login,
  logout,
  duracionCookie,
  REGEX_EMAIL,
};
