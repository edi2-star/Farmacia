const Laboratorio = require('../models/Laboratorio');
const OrdenCompra = require('../models/OrdenCompra');
const { validarLaboratorio, erroresDePg, soloTexto } = require('../utils/validadores');

/** GET /laboratorios - pagina del listado. */
async function mostrarListado(req, res) {
  const datos = await Laboratorio.listar();
  res.render('laboratorio/index', {
    titulo: 'Laboratorios',
    datos,
    mostrarBuscador: true,
    errores: {},
  });
}

/** GET /api/laboratorios - listado con filtro por codigo o texto libre. */
async function listar(req, res) {
  const q = soloTexto(req.query.q);
  const codigo = soloTexto(req.query.codigo);
  const datos = await Laboratorio.buscar({ q, codigo });
  res.json({ ok: true, datos });
}

/** GET /api/laboratorios/:id */
async function obtener(req, res) {
  if (!/^\d+$/.test(String(req.params.id))) {
    return res.status(404).json({ ok: false, mensaje: 'Laboratorio no encontrado.' });
  }
  const dato = await Laboratorio.buscarPorId(req.params.id);
  if (!dato) return res.status(404).json({ ok: false, mensaje: 'Laboratorio no encontrado.' });
  return res.json({ ok: true, datos: dato });
}

/** POST /api/laboratorios */
async function crear(req, res) {
  const errores = validarLaboratorio(req.body);
  if (Object.keys(errores).length > 0) {
    return res.status(400).json({ ok: false, errores, mensaje: 'Revisa los campos marcados.' });
  }

  const CodLab = soloTexto(req.body.CodLab).toUpperCase();

  try {
    const existente = await Laboratorio.buscarPorCodigo(CodLab);
    if (existente) {
      return res.status(400).json({
        ok: false,
        errores: { CodLab: 'Ya existe un laboratorio con ese codigo.' },
        mensaje: 'No se pudo guardar el laboratorio.',
      });
    }

    const creado = await Laboratorio.crear({
      CodLab,
      razonSocial: soloTexto(req.body.razonSocial),
      direccion: soloTexto(req.body.direccion),
      telefono: soloTexto(req.body.telefono),
      email: soloTexto(req.body.email).toLowerCase(),
      contacto: soloTexto(req.body.contacto),
    });

    return res.status(201).json({ ok: true, mensaje: 'Laboratorio registrado correctamente.', datos: creado });
  } catch (err) {
    const erroresBd = erroresDePg(err);
    if (Object.keys(erroresBd).length > 0) {
      return res.status(400).json({ ok: false, errores: erroresBd, mensaje: 'No se pudo guardar el laboratorio.' });
    }
    throw err;
  }
}

/** PUT /api/laboratorios/:id */
async function actualizar(req, res) {
  const errores = validarLaboratorio(req.body);
  if (Object.keys(errores).length > 0) {
    return res.status(400).json({ ok: false, errores, mensaje: 'Revisa los campos marcados.' });
  }

  const CodLab = soloTexto(req.body.CodLab).toUpperCase();

  try {
    const existente = await Laboratorio.buscarPorCodigo(CodLab);
    if (existente && String(existente._id) !== String(req.params.id)) {
      return res.status(400).json({
        ok: false,
        errores: { CodLab: 'Ya existe un laboratorio con ese codigo.' },
        mensaje: 'No se pudo guardar el laboratorio.',
      });
    }

    const actualizado = await Laboratorio.actualizar(req.params.id, {
      CodLab,
      razonSocial: soloTexto(req.body.razonSocial),
      direccion: soloTexto(req.body.direccion),
      telefono: soloTexto(req.body.telefono),
      email: soloTexto(req.body.email).toLowerCase(),
      contacto: soloTexto(req.body.contacto),
    });

    if (!actualizado) return res.status(404).json({ ok: false, mensaje: 'Laboratorio no encontrado.' });

    return res.json({ ok: true, mensaje: 'Laboratorio actualizado correctamente.', datos: actualizado });
  } catch (err) {
    const erroresBd = erroresDePg(err);
    if (Object.keys(erroresBd).length > 0) {
      return res.status(400).json({ ok: false, errores: erroresBd, mensaje: 'No se pudo guardar el laboratorio.' });
    }
    throw err;
  }
}

/** DELETE /api/laboratorios/:id - solo administrador (por middleware). */
async function eliminar(req, res) {
  const laboratorio = await Laboratorio.buscarPorId(req.params.id);
  if (!laboratorio) return res.status(404).json({ ok: false, mensaje: 'Laboratorio no encontrado.' });

  const enUso = await OrdenCompra.contarPorLaboratorio(laboratorio._id);
  if (enUso > 0) {
    return res.status(400).json({
      ok: false,
      mensaje: `No se puede eliminar: el laboratorio tiene ${enUso} orden(es) de compra asociadas.`,
    });
  }

  await Laboratorio.eliminar(laboratorio._id);
  return res.json({ ok: true, mensaje: 'Laboratorio eliminado correctamente.' });
}

module.exports = { mostrarListado, listar, obtener, crear, actualizar, eliminar };