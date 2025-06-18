const express = require('express');
const router = express.Router();
const auth = require('./autenticador');

// GET - Vistas
router.get('/login', (req, res) => res.render('login/login'));
router.get('/forgot-password', (req, res) => {
  const error = req.query.error || null;
  res.render('login/recuperar_contrasena', { error });
});
 
router.get('/reset-password', (req, res) => res.render('login/reset-password'));


router.get('/register', (req, res) => res.render('login/registro')); // o registro
 
// POST - Lógica de login
router.post('/login', auth.login);
router.post('/send-reset-code', auth.sendResetCode);
router.post('/reset-password', auth.resetPassword);
router.post('/register', auth.register);
 
// GET - Zona privada
 
 
router.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.redirect('/app');
    res.clearCookie('connect.sid');
    // Agregamos un query string para mostrar el mensaje
    res.redirect('/login?logout=1');
  });
});
 
 
module.exports = router;