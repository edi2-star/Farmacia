const express = require('express');
const ctrl = require('../controllers/laboratorio.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/roles.middleware');

const router = express.Router();

const puedeConsultar = ['administrador', 'moderador', 'usuario'];
const puedeEditar = ['administrador', 'moderador'];

// Pagina
router.get('/laboratorios', verifyToken, authorizeRoles(...puedeConsultar), ctrl.mostrarListado);

// API
router.get('/api/laboratorios', verifyToken, authorizeRoles(...puedeConsultar), ctrl.listar);
router.get('/api/laboratorios/:id', verifyToken, authorizeRoles(...puedeConsultar), ctrl.obtener);
router.post('/api/laboratorios', verifyToken, authorizeRoles(...puedeEditar), ctrl.crear);
router.put('/api/laboratorios/:id', verifyToken, authorizeRoles(...puedeEditar), ctrl.actualizar);
router.delete('/api/laboratorios/:id', verifyToken, authorizeRoles('administrador'), ctrl.eliminar);

module.exports = router;
