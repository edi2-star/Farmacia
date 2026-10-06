const express = require('express');
const authController = require('../controllers/auth.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/roles.middleware');

const router = express.Router();

// Evita repetir registro/login si ya hay una sesion activa.
function soloSinSesion(req, res, next) {
  if (req.usuario) return res.redirect('/menu');
  return next();
}

router.get('/registro', soloSinSesion, authController.mostrarRegistro);
router.post('/registro', soloSinSesion, authController.registrar);

router.get('/login', soloSinSesion, authController.mostrarLogin);
router.post('/login', soloSinSesion, authController.login);

router.get('/logout', authController.logout);
router.post('/logout', authController.logout);

// Ejemplo de ruta protegida exclusiva del administrador.
router.get('/administracion', verifyToken, authorizeRoles('administrador'), (req, res) => {
  res.json({ ok: true, mensaje: 'Zona exclusiva del administrador.', usuario: req.usuario.email });
});

module.exports = router;
