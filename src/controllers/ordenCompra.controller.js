const OrdenCompra = require('../models/OrdenCompra');
const Laboratorio = require('../models/Laboratorio');
const { validarOrdenCompra, erroresDeMongoose, soloTexto } = require('../utils/validadores');
const { escaparRegex } = require('./laboratorio.controller');

const POBLAR = { path: 'CodLab', select: 'CodLab razonSocial' };

/** GET /ordenes-compra - pagina del listado. */
async function mostrarListado(req, res) {
  const [datos, laboratorios] = await Promise.all([
    OrdenCompra.find().populate(POBLAR).sort({ fechaEmision: -1, NroOrdenC: 1 }).lean(),
    Laboratorio.find().sort({ CodLab: 1 }).lean(),
  ]);

  res.render('ordenCompra/index', {
    titulo: 'Ordenes de compra',
    datos,
    laboratorios,
    mostrarBuscador: true,
    errores: {},
  });
}

/** GET /api/ordenes-compra - listado con populate + buscador. */
async function listar(req, res) {
  const q = soloTexto(req.query.q);
  const filtro = {};

  if (q) {
    const rx = new RegExp(escaparRegex(q), 'i');
    const labs = await Laboratorio.find({ $or: [{ CodLab: rx }, { razonSocial: rx }] }).select('_id').lean();
    filtro.$or = [
      { NroOrdenC: rx },
      { Situacion: rx },
      { NrofacturaProv: rx },
      { CodLab: { $in: labs.map((l) => l._id) } },
    ];
  }

  const datos = await OrdenCompra.find(filtro).populate(POBLAR).sort({ fechaEmision: -1, NroOrdenC: 1 }).lean();
  res.json({ ok: true, datos });
}

/** GET /api/ordenes-compra/:id */
async function obtener(req, res) {
  const dato = await OrdenCompra.findById(req.params.id).populate(POBLAR).lean();
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
    const existente = await OrdenCompra.findOne({ NroOrdenC });
    if (existente) {
      return res.status(400).json({
        ok: false,
        errores: { NroOrdenC: 'Ya existe una orden de compra con ese numero.' },
        mensaje: 'Numero de orden duplicado.',
      });
    }

    const laboratorio = await Laboratorio.findById(soloTexto(req.body.CodLab));
    if (!laboratorio) {
      return res.status(400).json({
        ok: false,
        errores: { CodLab: 'El laboratorio seleccionado no existe.' },
        mensaje: 'Laboratorio invalido.',
      });
    }

    const creado = await OrdenCompra.create({
      NroOrdenC,
      fechaEmision: req.body.fechaEmision,
      Situacion: soloTexto(req.body.Situacion),
      Total: Number(req.body.Total),
      CodLab: laboratorio._id,
      NrofacturaProv: soloTexto(req.body.NrofacturaProv),
    });

    const conLab = await OrdenCompra.findById(creado._id).populate(POBLAR).lean();
    return res.status(201).json({ ok: true, mensaje: 'Orden de compra registrada correctamente.', datos: conLab });
  } catch (err) {
    const erroresMongo = erroresDeMongoose(err);
    if (Object.keys(erroresMongo).length > 0) {
      return res.status(400).json({ ok: false, errores: erroresMongo, mensaje: 'No se pudo guardar la orden.' });
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
    const duplicada = await OrdenCompra.findOne({ NroOrdenC, _id: { $ne: req.params.id } });
    if (duplicada) {
      return res.status(400).json({
        ok: false,
        errores: { NroOrdenC: 'Ya existe otra orden con ese numero.' },
        mensaje: 'Numero de orden duplicado.',
      });
    }

    const laboratorio = await Laboratorio.findById(soloTexto(req.body.CodLab));
    if (!laboratorio) {
      return res.status(400).json({
        ok: false,
        errores: { CodLab: 'El laboratorio seleccionado no existe.' },
        mensaje: 'Laboratorio invalido.',
      });
    }

    const actualizado = await OrdenCompra.findByIdAndUpdate(
      req.params.id,
      {
        NroOrdenC,
        fechaEmision: req.body.fechaEmision,
        Situacion: soloTexto(req.body.Situacion),
        Total: Number(req.body.Total),
        CodLab: laboratorio._id,
        NrofacturaProv: soloTexto(req.body.NrofacturaProv),
      },
      { new: true, runValidators: true }
    );

    if (!actualizado) return res.status(404).json({ ok: false, mensaje: 'Orden de compra no encontrada.' });

    const conLab = await OrdenCompra.findById(actualizado._id).populate(POBLAR).lean();
    return res.json({ ok: true, mensaje: 'Orden de compra actualizada correctamente.', datos: conLab });
  } catch (err) {
    const erroresMongo = erroresDeMongoose(err);
    if (Object.keys(erroresMongo).length > 0) {
      return res.status(400).json({ ok: false, errores: erroresMongo, mensaje: 'No se pudo actualizar la orden.' });
    }
    throw err;
  }
}

/** DELETE /api/ordenes-compra/:id - solo administrador (por middleware). */
async function eliminar(req, res) {
  const orden = await OrdenCompra.findByIdAndDelete(req.params.id);
  if (!orden) return res.status(404).json({ ok: false, mensaje: 'Orden de compra no encontrada.' });
  return res.json({ ok: true, mensaje: 'Orden de compra eliminada correctamente.' });
}

module.exports = {
  mostrarListado,
  listar,
  obtener,
  crear,
  actualizar,
  eliminar,
};
