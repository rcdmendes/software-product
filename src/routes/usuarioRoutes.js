// src/routes/usuarioRoutes.js
const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');

/* ===========================
   RATE LIMITERS
=========================== */

// Login — 5 tentativas por IP a cada 15 min (anti força bruta)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { erro: 'Muitas tentativas de login. Tente novamente em 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Reset de senha — 3 solicitações por hora
const resetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: { erro: 'Muitas solicitações de reset. Tente novamente em 1 hora.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rotas gerais — 100 requisições por 15 min
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { erro: 'Muitas requisições. Tente novamente em 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});

/* ===========================
   VALIDAÇÃO DE BODY
=========================== */
const validateJSON = (req, res, next) => {
  if (['POST', 'PUT'].includes(req.method)) {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ erro: 'Dados obrigatórios não fornecidos' });
    }
  }
  next();
};

/* ===========================
   ROTAS PÚBLICAS
=========================== */
router.post('/login',       loginLimiter, validateJSON, usuarioController.login);
router.post('/reset-senha', resetLimiter, validateJSON, usuarioController.resetSenha);

/* ===========================
   ROTAS PROTEGIDAS
=========================== */
router.get('/',      generalLimiter,              usuarioController.listarTodos);
router.post('/',     generalLimiter, validateJSON, usuarioController.criar);
router.put('/:id',   generalLimiter, validateJSON, usuarioController.atualizar);
router.delete('/:id',generalLimiter,              usuarioController.deletar);

module.exports = router;
