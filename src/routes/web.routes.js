const express = require('express');
const webController = require('../controllers/web.controller');
const { verifyToken } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/', webController.raiz);
router.get('/menu', verifyToken, webController.mostrarMenu);

// Health check para Render (no expone informacion sensible).
router.get('/health', (req, res) => {
  const conectado = require('mongoose').connection.readyState === 1;
  res.status(conectado ? 200 : 503).json({
    status: conectado ? 'ok' : 'degraded',
    service: 'Farmacia',
    database: conectado ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
