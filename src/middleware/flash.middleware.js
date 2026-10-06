/** Expone mensajes flash leidos desde la query string (?exito= / ?error=). */
function flashLocals(req, res, next) {
  res.locals.exito = req.query.exito ? String(req.query.exito) : null;
  res.locals.error = req.query.error ? String(req.query.error) : null;
  next();
}

function redirigirCon(res, ruta, tipo, mensaje) {
  const prefijo = tipo === 'exito' ? 'exito' : 'error';
  return res.redirect(`${ruta}?${prefijo}=${encodeURIComponent(mensaje)}`);
}

module.exports = { flashLocals, redirigirCon };
