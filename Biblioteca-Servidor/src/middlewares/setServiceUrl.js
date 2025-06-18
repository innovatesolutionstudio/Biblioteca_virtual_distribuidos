module.exports = (req, res, next) => {
  res.locals.serviceUrls = req.session.serviceUrls || {
    flaskHost: '',
    phpHost: 'http://10.0.6.19:5003'
  };
  next();
};
