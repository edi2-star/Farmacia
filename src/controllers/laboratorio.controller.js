const Laboratorio = require('../models/Laboratorio');
const OrdenCompra = require('../models/OrdenCompra');
const { validarLaboratorio, erroresDeMongoose, soloTexto } = require('../utils/validadores');

/** Escapa caracteres especiales de una expresion regular. */
function escaparRegex(texto) {
  return String(texto).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** GET /laboratorios - pagina del listado. */
async function mostrarListado(req, res) {
  const datos = await Laboratorio.find().sort({ CodLab: 1 }).lean();
  res.render('laboratorio/index', {
    titulo: 'Laboratorios',
    datos,
    mostrarBuscador: true,
    errores: {},
  });
}

/** GET /api/laboratorios - listado (con buscador y filtro por codigo exacto). */
async function listar(req, res) {
  const q = soloTexto(req.query.q);
  const codigo = soloTexto(req.query.codigo);

  const filtro = {};

  if (codigo) {
    filtro.CodLab = codigo.toUpperCase();
  } else if (q) {
    const rx = new RegExp(escaparRegex(q), 'i');
    filtro.$or = [{ CodLab: rx }, { razonSocial: rx }, { email: rx }, { telefono: rx }, { contacto: rx }, { direccion: rx }];
  }

  const datos = await Laboratorio.find(filtro).sort({ CodLab: 1 }).lean();
  res.json({ ok: true, datos });
}

/** GET /api/laboratorios/:id */
async function obtener(req, res) {
  const dato = await Laboratorio.findById(req.params.id).lean();
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
    const existente = await Laboratorio.findOne({ CodLab });
    if (existente) {
      return res
        .status(400)
        .json({ ok: false, errores: { CodLab: 'Ya existe un laboratorio con ese codigo.' }, mensaje: 'Codigo duplicado.' });
    }

    const creado = await Laboratorio.create({
      CodLab,
      razonSocial: soloTexto(req.body.razonSocial),
      direccion: soloTexto(req.body.direccion),
      telefono: soloTexto(req.body.telefono),
      email: soloTexto(req.body.email).toLowerCase(),
      contacto: soloTexto(req.body.contacto),
    });

    return res.status(201).json({ ok: true, mensaje: 'Laboratorio registrado correctamente.', datos: creado });
  } catch (err) {
    const erroresMongo = erroresDeMongoose(err);
    if (Object.keys(erroresMongo).length > 0) {
      return res.status(400).json({ ok: false, errores: erroresMongo, mensaje: 'No se pudo guardar el laboratorio.' });
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
    const duplicado = await Laboratorio.findOne({ CodLab, _id: { $ne: req.params.id } });
    if (duplicado) {
      return res
        .status(400)
        .json({ ok: false, errores: { CodLab: 'Ya existe otro laboratorio con ese codigo.' }, mensaje: 'Codigo duplicado.' });
    }

    const actualizado = await Laboratorio.findByIdAndUpdate(
      req.params.id,
      {
        CodLab,
        razonSocial: soloTexto(req.body.razonSocial),
        direccion: soloTexto(req.body.direccion),
        telefono: soloTexto(req.body.telefono),
        email: soloTexto(req.body.email).toLowerCase(),
        contacto: soloTexto(req.body.contacto),
      },
      { new: true, runValidators: true }
    );

    if (!actualizado) return res.status(404).json({ ok: false, mensaje: 'Laboratorio no encontrado.' });

    return res.json({ ok: true, mensaje: 'Laboratorio actualizado correctamente.', datos: actualizado });
  } catch (err) {
    const erroresMongo = erroresDeMongoose(err);
    if (Object.keys(erroresMongo).length > 0) {
      return res.status(400).json({ ok: false, errores: erroresMongo, mensaje: 'No se pudo actualizar el laboratorio.' });
    }
    throw err;
  }
}

/** DELETE /api/laboratorios/:id - solo administrador (por middleware). */
async function eliminar(req, res) {
  const laboratorio = await Laboratorio.findById(req.params.id);
  if (!laboratorio) return res.status(404).json({ ok: false, mensaje: 'Laboratorio no encontrado.' });

  const enUso = await OrdenCompra.countDocuments({ CodLab: laboratorio._id });
  if (enUso > 0) {
    return res.status(400).json({
      ok: false,
      mensaje: `No se puede eliminar: el laboratorio tiene ${enUso} orden(es) de compra asociadas.`,
    });
  }

  await laboratorio.deleteOne();
  return res.json({ ok: true, mensaje: 'Laboratorio eliminado correctamente.' });
}

module.exports = {
  mostrarListado,
  listar,
  obtener,
  crear,
  actualizar,
  eliminar,
  escaparRegex,
};
