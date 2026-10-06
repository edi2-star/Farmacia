const { query } = require('../config/database');

/** Convierte una fila de laboratorios al objeto usado por la app. */
function mapear(fila) {
  if (!fila) return null;
  return {
    _id: fila.id,
    id: fila.id,
    CodLab: fila.codlab,
    razonSocial: fila.razonsocial,
    direccion: fila.direccion,
    telefono: fila.telefono,
    email: fila.email,
    contacto: fila.contacto,
  };
}

async function listar() {
  const { rows } = await query('SELECT * FROM laboratorios ORDER BY codlab ASC');
  return rows.map(mapear);
}

/** Busqueda por codigo exacto o texto libre (numero, razon social, email, etc.). */
async function buscar({ q, codigo } = {}) {
  if (codigo) {
    const { rows } = await query('SELECT * FROM laboratorios WHERE codlab = $1 ORDER BY codlab ASC', [
      String(codigo).toUpperCase(),
    ]);
    return rows.map(mapear);
  }

  if (q) {
    const like = `%${q}%`;
    const { rows } = await query(
      `SELECT * FROM laboratorios
        WHERE codlab ILIKE $1 OR razonsocial ILIKE $1 OR email ILIKE $1
           OR telefono ILIKE $1 OR contacto ILIKE $1 OR direccion ILIKE $1
        ORDER BY codlab ASC`,
      [like]
    );
    return rows.map(mapear);
  }

  return listar();
}

async function buscarPorId(id) {
  const { rows } = await query('SELECT * FROM laboratorios WHERE id = $1', [id]);
  return mapear(rows[0]);
}

async function buscarPorCodigo(codlab) {
  const { rows } = await query('SELECT * FROM laboratorios WHERE codlab = $1', [String(codlab).toUpperCase()]);
  return mapear(rows[0]);
}

async function crear(datos) {
  const { rows } = await query(
    `INSERT INTO laboratorios (codlab, razonsocial, direccion, telefono, email, contacto)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [datos.CodLab, datos.razonSocial, datos.direccion, datos.telefono, datos.email, datos.contacto]
  );
  return mapear(rows[0]);
}

async function actualizar(id, datos) {
  const { rows } = await query(
    `UPDATE laboratorios
        SET codlab = $1, razonsocial = $2, direccion = $3,
            telefono = $4, email = $5, contacto = $6
      WHERE id = $7 RETURNING *`,
    [datos.CodLab, datos.razonSocial, datos.direccion, datos.telefono, datos.email, datos.contacto, id]
  );
  return mapear(rows[0]);
}

async function eliminar(id) {
  const { rowCount } = await query('DELETE FROM laboratorios WHERE id = $1', [id]);
  return rowCount > 0;
}

module.exports = { listar, buscar, buscarPorId, buscarPorCodigo, crear, actualizar, eliminar, mapear };