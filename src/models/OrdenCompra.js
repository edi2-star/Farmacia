const { query } = require('../config/database');

/** Normaliza la fecha (Date o string) a 'YYYY-MM-DD'. */
function formatearFecha(valor) {
  if (!valor) return null;
  if (valor instanceof Date) {
    const y = valor.getFullYear();
    const m = String(valor.getMonth() + 1).padStart(2, '0');
    const d = String(valor.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  return String(valor).slice(0, 10);
}

/** Convierte una fila (con JOIN a laboratorios) al objeto usado por la app. */
function mapear(fila) {
  if (!fila) return null;
  return {
    _id: fila.id,
    id: fila.id,
    NroOrdenC: fila.nroordenc,
    fechaEmision: formatearFecha(fila.fechaemision),
    Situacion: fila.situacion,
    Total: Number(fila.total),
    NrofacturaProv: fila.nrofacturaprov,
    CodLab: fila.lab_id
      ? { _id: fila.lab_id, id: fila.lab_id, CodLab: fila.lab_codlab, razonSocial: fila.lab_razonsocial }
      : null,
  };
}

const SELECT_BASE = `
  SELECT o.*, l.id AS lab_id, l.codlab AS lab_codlab, l.razonsocial AS lab_razonsocial
    FROM ordenes_compra o
    LEFT JOIN laboratorios l ON l.id = o.codlab`;

async function listar() {
  const { rows } = await query(`${SELECT_BASE} ORDER BY o.fechaemision DESC, o.nroordenc ASC`);
  return rows.map(mapear);
}

/** Busqueda por numero, situacion, factura o datos del laboratorio. */
async function buscar(q) {
  if (!q) return listar();
  const like = `%${q}%`;
  const { rows } = await query(
    `${SELECT_BASE}
      WHERE o.nroordenc ILIKE $1 OR o.situacion ILIKE $1 OR o.nrofacturaprov ILIKE $1
         OR l.codlab ILIKE $1 OR l.razonsocial ILIKE $1
      ORDER BY o.fechaemision DESC, o.nroordenc ASC`,
    [like]
  );
  return rows.map(mapear);
}

async function buscarPorId(id) {
  const { rows } = await query(`${SELECT_BASE} WHERE o.id = $1`, [id]);
  return mapear(rows[0]);
}

/** true si existe una orden con ese numero (opcionalmente excluyendo un id). */
async function existeNumero(numero, exceptoId = null) {
  const texto = exceptoId
    ? 'SELECT 1 FROM ordenes_compra WHERE nroordenc = $1 AND id <> $2'
    : 'SELECT 1 FROM ordenes_compra WHERE nroordenc = $1';
  const parametros = exceptoId ? [numero, exceptoId] : [numero];
  const { rowCount } = await query(texto, parametros);
  return rowCount > 0;
}

async function buscarIdPorNumero(numero) {
  const { rows } = await query('SELECT id FROM ordenes_compra WHERE nroordenc = $1', [numero]);
  return rows[0] ? rows[0].id : null;
}

async function contarPorLaboratorio(idLaboratorio) {
  const { rows } = await query('SELECT COUNT(*)::int AS total FROM ordenes_compra WHERE codlab = $1', [idLaboratorio]);
  return rows[0].total;
}

async function crear(datos) {
  const { rows } = await query(
    `INSERT INTO ordenes_compra (nroordenc, fechaemision, situacion, total, codlab, nrofacturaprov)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
    [datos.NroOrdenC, datos.fechaEmision, datos.Situacion, datos.Total, datos.CodLab, datos.NrofacturaProv]
  );
  return buscarPorId(rows[0].id);
}

async function actualizar(id, datos) {
  const { rowCount } = await query(
    `UPDATE ordenes_compra
        SET nroordenc = $1, fechaemision = $2, situacion = $3,
            total = $4, codlab = $5, nrofacturaprov = $6
      WHERE id = $7`,
    [datos.NroOrdenC, datos.fechaEmision, datos.Situacion, datos.Total, datos.CodLab, datos.NrofacturaProv, id]
  );
  if (!rowCount) return null;
  return buscarPorId(id);
}

async function eliminar(id) {
  const { rowCount } = await query('DELETE FROM ordenes_compra WHERE id = $1', [id]);
  return rowCount > 0;
}

module.exports = { listar, buscar, buscarPorId, buscarIdPorNumero, existeNumero, contarPorLaboratorio, crear, actualizar, eliminar, mapear };