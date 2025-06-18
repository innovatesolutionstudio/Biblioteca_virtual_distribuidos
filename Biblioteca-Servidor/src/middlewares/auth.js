exports.ensureAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    return next(); // Está autenticado
  }
  req.session.redirectTo = req.originalUrl;
  res.redirect('/login'); // No autenticado → lo redirige al login
};
