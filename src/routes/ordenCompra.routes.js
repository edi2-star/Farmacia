const express = require('express');
const ctrl = require('../controllers/ordenCompra.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/roles.middleware');

const router = express.Router();

const puedeConsultar = ['administrador', 'moderador', 'usuario'];
const puedeEditar = ['administrador', 'moderador'];

// Pagina
router.get('/ordenes-compra', verifyToken, authorizeRoles(...puedeConsultar), ctrl.mostrarListado);

// API
router.get('/api/ordenes-compra', verifyToken, authorizeRoles(...puedeConsultar), ctrl.listar);
router.get('/api/ordenes-compra/:id', verifyToken, authorizeRoles(...puedeConsultar), ctrl.obtener);
router.post('/api/ordenes-compra', verifyToken, authorizeRoles(...puedeEditar), ctrl.crear);
router.put('/api/ordenes-compra/:id', verifyToken, authorizeRoles(...puedeEditar), ctrl.actualizar);
router.delete('/api/ordenes-compra/:id', verifyToken, authorizeRoles('administrador'), ctrl.eliminar);

module.exports = router;
