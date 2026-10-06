const express = require('express');
const webController = require('../controllers/web.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { estaConectado } = require('../config/database');

const router = express.Router();

router.get('/', webController.raiz);
router.get('/menu', verifyToken, webController.mostrarMenu);

// Health check para Render (no expone informacion sensible).
router.get('/health', (req, res) => {
  const conectado = estaConectado();
  res.status(conectado ? 200 : 503).json({
    status: conectado ? 'ok' : 'degraded',
    service: 'Farmacia',
    database: conectado ? 'connected' : 'disconnected',
    motor: 'postgresql',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
