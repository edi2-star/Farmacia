/**
 * Protege rutas segun el rol del usuario autenticado.
 * Uso: router.delete('/x', verifyToken, authorizeRoles('administrador'), ctrl.eliminar)
 */
function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!req.usuario) {
      if (req.path.startsWith('/api/') || (req.headers.accept || '').includes('application/json')) {
        return res.status(401).json({ ok: false, mensaje: 'Debes iniciar sesion.' });
      }
      return res.redirect(`/login?error=${encodeURIComponent('Debes iniciar sesion para acceder a esa pagina.')}`);
    }

    if (!roles.includes(req.usuario.role)) {
      if (req.path.startsWith('/api/') || (req.headers.accept || '').includes('application/json')) {
        return res.status(403).json({
          ok: false,
          mensaje: `Tu rol (${req.usuario.role}) no tiene permisos para realizar esta accion.`,
        });
      }
      return res.status(403).render('error', {
        titulo: 'Acceso denegado',
        codigo: 403,
        mensaje: `Tu rol (${req.usuario.role}) no tiene permisos para acceder a este recurso.`,
      });
    }

    return next();
  };
}

module.exports = { authorizeRoles };
