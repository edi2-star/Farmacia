const OrdenCompra = require('../models/OrdenCompra');
const Laboratorio = require('../models/Laboratorio');
const { validarOrdenCompra, erroresDePg, soloTexto } = require('../utils/validadores');

/** GET /ordenes-compra - pagina del listado (con laboratorio asociado). */
async function mostrarListado(req, res) {
  const [datos, laboratorios] = await Promise.all([OrdenCompra.listar(), Laboratorio.listar()]);
  res.render('ordenCompra/index', {
    titulo: 'Ordenes de compra',
    datos,
    laboratorios,
    mostrarBuscador: true,
    errores: {},
  });
}

/** GET /api/ordenes-compra - listado con laboratorio asociado y buscador. */
async function listar(req, res) {
  const q = soloTexto(req.query.q);
  const datos = await OrdenCompra.buscar(q);
  res.json({ ok: true, datos });
}

/** GET /api/ordenes-compra/:id */
async function obtener(req, res) {
  if (!/^\d+$/.test(String(req.params.id))) {
    return res.status(404).json({ ok: false, mensaje: 'Orden de compra no encontrada.' });
  }
  const dato = await OrdenCompra.buscarPorId(req.params.id);
  if (!dato) return res.status(404).json({ ok: false, mensaje: 'Orden de compra no encontrada.' });
  return res.json({ ok: true, datos: dato });
}

/** POST /api/ordenes-compra */
async function crear(req, res) {
  const errores = validarOrdenCompra(req.body);
  if (Object.keys(errores).length > 0) {
    return res.status(400).json({ ok: false, errores, mensaje: 'Revisa los campos marcados.' });
  }

  const NroOrdenC = soloTexto(req.body.NroOrdenC).toUpperCase();

  try {
    if (await OrdenCompra.existeNumero(NroOrdenC)) {
      return res.status(400).json({
        ok: false,
        errores: { NroOrdenC: 'Ya existe una orden de compra con ese numero.' },
        mensaje: 'No se pudo guardar la orden.',
      });
    }

    const laboratorio = await Laboratorio.buscarPorId(soloTexto(req.body.CodLab));
    if (!laboratorio) {
      return res.status(400).json({
        ok: false,
        errores: { CodLab: 'El laboratorio seleccionado no existe.' },
        mensaje: 'No se pudo guardar la orden.',
      });
    }

    const creado = await OrdenCompra.crear({
      NroOrdenC,
      fechaEmision: soloTexto(req.body.fechaEmision),
      Situacion: soloTexto(req.body.Situacion),
      Total: Number(req.body.Total),
      CodLab: laboratorio._id,
      NrofacturaProv: soloTexto(req.body.NrofacturaProv),
    });

    return res.status(201).json({ ok: true, mensaje: 'Orden de compra registrada correctamente.', datos: creado });
  } catch (err) {
    const erroresBd = erroresDePg(err);
    if (Object.keys(erroresBd).length > 0) {
      return res.status(400).json({ ok: false, errores: erroresBd, mensaje: 'No se pudo guardar la orden.' });
    }
    throw err;
  }
}

/** PUT /api/ordenes-compra/:id */
async function actualizar(req, res) {
  const errores = validarOrdenCompra(req.body);
  if (Object.keys(errores).length > 0) {
    return res.status(400).json({ ok: false, errores, mensaje: 'Revisa los campos marcados.' });
  }

  const NroOrdenC = soloTexto(req.body.NroOrdenC).toUpperCase();

  try {
    if (await OrdenCompra.existeNumero(NroOrdenC, req.params.id)) {
      return res.status(400).json({
        ok: false,
        errores: { NroOrdenC: 'Ya existe otra orden con ese numero.' },
        mensaje: 'No se pudo guardar la orden.',
      });
    }

    const laboratorio = await Laboratorio.buscarPorId(soloTexto(req.body.CodLab));
    if (!laboratorio) {
      return res.status(400).json({
        ok: false,
        errores: { CodLab: 'El laboratorio seleccionado no existe.' },
        mensaje: 'No se pudo guardar la orden.',
      });
    }

    const actualizado = await OrdenCompra.actualizar(req.params.id, {
      NroOrdenC,
      fechaEmision: soloTexto(req.body.fechaEmision),
      Situacion: soloTexto(req.body.Situacion),
      Total: Number(req.body.Total),
      CodLab: laboratorio._id,
      NrofacturaProv: soloTexto(req.body.NrofacturaProv),
    });

    if (!actualizado) return res.status(404).json({ ok: false, mensaje: 'Orden de compra no encontrada.' });

    return res.json({ ok: true, mensaje: 'Orden de compra actualizada correctamente.', datos: actualizado });
  } catch (err) {
    const erroresBd = erroresDePg(err);
    if (Object.keys(erroresBd).length > 0) {
      return res.status(400).json({ ok: false, errores: erroresBd, mensaje: 'No se pudo guardar la orden.' });
    }
    throw err;
  }
}

/** DELETE /api/ordenes-compra/:id - solo administrador (por middleware). */
async function eliminar(req, res) {
  const eliminado = await OrdenCompra.eliminar(req.params.id);
  if (!eliminado) return res.status(404).json({ ok: false, mensaje: 'Orden de compra no encontrada.' });
  return res.json({ ok: true, mensaje: 'Orden de compra eliminada correctamente.' });
}

module.exports = { mostrarListado, listar, obtener, crear, actualizar, eliminar };