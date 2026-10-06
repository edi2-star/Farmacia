const bcrypt = require('bcryptjs');
const { query } = require('../config/database');

/** Convierte una fila de la tabla usuarios al objeto usado por la app. */
function mapear(fila) {
  if (!fila) return null;
  return {
    _id: fila.id,
    id: fila.id,
    nombre: fila.nombre,
    email: fila.email,
    role: fila.role,
    password: fila.password,
  };
}

async function buscarPorEmail(email) {
  const { rows } = await query('SELECT * FROM usuarios WHERE email = $1', [email]);
  return mapear(rows[0]);
}

async function buscarPorId(id) {
  const { rows } = await query('SELECT * FROM usuarios WHERE id = $1', [id]);
  return mapear(rows[0]);
}

async function crear({ nombre, email, password, role }) {
  const hash = await require('bcryptjs').hash(String(password), 10);
  const { rows } = await query(
    'INSERT INTO usuarios (nombre, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *',
    [nombre, email, hash, role || 'usuario']
  );
  return mapear(rows[0]);
}

async function actualizarBasico(email, { nombre, role }) {
  const { rows } = await query(
    'UPDATE usuarios SET nombre = $1, role = $2 WHERE email = $3 RETURNING *',
    [nombre, role, email]
  );
  return mapear(rows[0]);
}

function compararPassword(plano, hash) {
  const bcrypt = require('bcryptjs');
  return bcrypt.compare(String(plano), String(hash));
}

module.exports = { buscarPorEmail, buscarPorId, crear, actualizarBasico, compararPassword, mapear };