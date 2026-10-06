const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const esTexto = (v) => typeof v === 'string' && v.trim().length > 0;
const soloTexto = (v) => String(v || '').trim();

/**
 * Validaciones del lado del servidor (nunca depender solo del navegador).
 * Devuelve un objeto { campo: 'mensaje de error' }. Vacio si todo esta bien.
 */
function validarLaboratorio(datos) {
  const errores = {};
  const CodLab = soloTexto(datos.CodLab);
  const razonSocial = soloTexto(datos.razonSocial);
  const direccion = soloTexto(datos.direccion);
  const telefono = soloTexto(datos.telefono);
  const email = soloTexto(datos.email);
  const contacto = soloTexto(datos.contacto);

  if (!CodLab) errores.CodLab = 'El codigo es obligatorio.';
  else if (CodLab.length > 20) errores.CodLab = 'El codigo no puede superar los 20 caracteres.';

  if (!razonSocial) errores.razonSocial = 'La razon social es obligatoria.';
  else if (razonSocial.length > 120) errores.razonSocial = 'La razon social es demasiado larga.';

  if (!direccion) errores.direccion = 'La direccion es obligatoria.';
  else if (direccion.length > 160) errores.direccion = 'La direccion es demasiado larga.';

  if (!telefono) errores.telefono = 'El telefono es obligatorio.';
  else if (!/^[0-9+\s()-]{6,20}$/.test(telefono)) errores.telefono = 'Telefono no valido (solo digitos, espacios, +, - o parentesis).';

  if (!email) errores.email = 'El email es obligatorio.';
  else if (!REGEX_EMAIL.test(email)) errores.email = 'El email no tiene un formato valido.';

  if (!contacto) errores.contacto = 'El contacto es obligatorio.';
  else if (contacto.length > 80) errores.contacto = 'El contacto es demasiado largo.';

  return errores;
}

function validarOrdenCompra(datos) {
  const errores = {};
  const NroOrdenC = soloTexto(datos.NroOrdenC);
  const fechaEmision = soloTexto(datos.fechaEmision);
  const Situacion = soloTexto(datos.Situacion);
  const Total = datos.Total;
  const CodLab = soloTexto(datos.CodLab);
  const NrofacturaProv = soloTexto(datos.NrofacturaProv);

  if (!NroOrdenC) errores.NroOrdenC = 'El numero de orden es obligatorio.';
  else if (NroOrdenC.length > 30) errores.NroOrdenC = 'El numero de orden no puede superar los 30 caracteres.';

  if (!fechaEmision) errores.fechaEmision = 'La fecha de emision es obligatoria.';
  else if (Number.isNaN(Date.parse(fechaEmision))) errores.fechaEmision = 'La fecha de emision no es valida.';

  if (!Situacion) errores.Situacion = 'La situacion es obligatoria.';

  if (Total === undefined || Total === null || Total === '') {
    errores.Total = 'El total es obligatorio.';
  } else if (typeof Total === 'number' && Number.isNaN(Total)) {
    errores.Total = 'El total debe ser un numero.';
  } else if (Number(Total) < 0) {
    errores.Total = 'El total no puede ser negativo.';
  }

  if (!CodLab) errores.CodLab = 'El laboratorio es obligatorio.';
  else if (!/^\d+$/.test(CodLab)) errores.CodLab = 'Selecciona un laboratorio valido.';

  if (!NrofacturaProv) errores.NrofacturaProv = 'El numero de factura del proveedor es obligatorio.';

  return errores;
}

function validarRegistro(datos) {
  const errores = {};
  const nombre = soloTexto(datos.nombre);
  const email = soloTexto(datos.email);
  const password = String(datos.password || '');
  const confirmar = String(datos.confirmarPassword || '');

  if (!nombre) errores.nombre = 'El nombre es obligatorio.';
  else if (nombre.length < 2) errores.nombre = 'El nombre debe tener al menos 2 caracteres.';
  else if (nombre.length > 80) errores.nombre = 'El nombre es demasiado largo.';

  if (!email) errores.email = 'El email es obligatorio.';
  else if (!REGEX_EMAIL.test(email)) errores.email = 'El email no tiene un formato valido.';

  if (!password) errores.password = 'La contrasena es obligatoria.';
  else if (password.length < 6) errores.password = 'La contrasena debe tener al menos 6 caracteres.';

  if (!confirmar) errores.confirmarPassword = 'Confirma la contrasena.';
  else if (password !== confirmar) errores.confirmarPassword = 'Las contrasenas no coinciden.';

  return errores;
}

function validarLogin(datos) {
  const errores = {};
  const email = soloTexto(datos.email);
  const password = String(datos.password || '');

  if (!email) errores.email = 'El email es obligatorio.';
  else if (!REGEX_EMAIL.test(email)) errores.email = 'El email no tiene un formato valido.';

  if (!password) errores.password = 'La contrasena es obligatoria.';

  return errores;
}

/** Mapea el nombre de una restriccion UNIQUE de PostgreSQL al campo del formulario. */
const CAMPO_POR_RESTRICCION = {
  usuarios_email_key: 'email',
  laboratorios_codlab_key: 'CodLab',
  ordenes_compra_nroordenc_key: 'NroOrdenC',
};

/** Convierte errores de PostgreSQL (pg) en { campo: mensaje }. */
function erroresDePg(err) {
  const salida = {};
  if (!err || !err.code) return salida;

  if (err.code === '23505') {
    const campo = CAMPO_POR_RESTRICCION[err.constraint] || 'campo';
    salida[campo] = 'Ya existe un registro con ese valor.';
  } else if (err.code === '23503') {
    salida.CodLab = 'El laboratorio seleccionado no existe.';
  } else if (err.code === '23502') {
    salida[err.column || 'campo'] = 'Este campo es obligatorio.';
  } else if (err.code === '23514') {
    salida.Total = 'El valor no cumple las reglas permitidas.';
  }
  return salida;
}

module.exports = {
  REGEX_EMAIL,
  esTexto,
  soloTexto,
  validarLaboratorio,
  validarOrdenCompra,
  validarRegistro,
  validarLogin,
  erroresDePg,
};
