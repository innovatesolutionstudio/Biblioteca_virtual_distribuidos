const express = require('express');
const router = express.Router();
const axios = require('axios');

router.get('/configurar-ip', async (req, res) => {
  const urls = req.session.serviceUrls || {
    flaskHost: 'http://localhost:5002',
    phpHost: 'http://localhost:5003'
  };

  const testConnection = async (url) => {
    try {
      await axios.get(url, { timeout: 2000 }); // intenta conectarse
      return true;
    } catch {
      return false;
    }
  };

  const flaskStatus = await testConnection(urls.flaskHost);
  const phpStatus = await testConnection(urls.phpHost);

  res.render('config/set_ip', {
    urls,
    statuses: {
      flask: flaskStatus,
      php: phpStatus
    }
  });
});

router.post('/configurar-ip/individual', (req, res) => {
  const { flaskHost, phpHost } = req.body;

  if (!req.session.serviceUrls) {
    req.session.serviceUrls = {};
  }

  if (flaskHost) {
    req.session.serviceUrls.flaskHost = flaskHost;
    return res.json({ mensaje: 'Flask host guardado correctamente' });
  }

  if (phpHost) {
    req.session.serviceUrls.phpHost = phpHost;
    return res.json({ mensaje: 'PHP host guardado correctamente' });
  }

  res.status(400).json({ mensaje: 'No se envió ningún valor válido' });
});



module.exports = router;
