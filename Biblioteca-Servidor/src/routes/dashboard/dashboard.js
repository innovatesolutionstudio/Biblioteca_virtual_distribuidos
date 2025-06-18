const express = require('express');
const router = express.Router();
const axios = require('axios');


// copia desde aqui
const FLASK_BASE_URL = 'http://dashboardcliente-service:5001';

// Ruta para página inicial de Evolución Histórica
router.get('/Evolucion-Historica', (req, res) => {
  res.render('Evolucion/evolucion_historica');
});

router.get('/Evolucion-Historica-Dashboard', async (req, res) => {
  const anioSeleccionado = req.query.anio;
  const departamentoSeleccionado = req.query.departamento || 'LA PAZ';
  const indicadorPoblacion = req.query.indicadorPoblacion || 'POBLACIÓN EMPADRONADA 2012';
  const indicadorPobreza = req.query.indicadorPobreza || 'Porcentaje de Población Pobre';

  const urlInflacion = anioSeleccionado
    ? `${FLASK_BASE_URL}/api/inflacion?anio=${anioSeleccionado}`
    : `${FLASK_BASE_URL}/api/inflacion`;
  const urlPoblacion = `${FLASK_BASE_URL}/api/poblacion?departamento=${encodeURIComponent(departamentoSeleccionado)}&indicador=${encodeURIComponent(indicadorPoblacion)}`;
  const urlPobreza = `${FLASK_BASE_URL}/api/pobreza?departamento=${encodeURIComponent(departamentoSeleccionado)}&indicador=${encodeURIComponent(indicadorPobreza)}`;

  // Inicializar datos
  let datosInflacion = [];
  let aniosDisponibles = [];
  let indicadoresPoblacion = [];
  let indicadoresPobreza = [];
  let datosPoblacion = { labels: [], valores: [], tipo: 'simple' };
  let datosPobreza = { labels: [], valores: [], tipo: 'simple' };

  try {
    // Validar conexión con Flask (ping a /api/anios por ser liviano)
    await axios.get(`${FLASK_BASE_URL}/api/anios`, { timeout: 2000 });
  } catch (error) {
    console.error('❌ Flask API no disponible:', error.message);

    if (
      error.code === 'ECONNREFUSED' ||
      error.code === 'ENOTFOUND' ||
      error.code === 'ECONNABORTED' ||
      error.response?.status >= 500
    ) {
      return res.redirect('/mantenimiento');
    }

    return res.status(500).send('Error al contactar con el servidor de datos.');
  }

  try {
    // Resto de llamadas con control individual
    try {
      const datosInflacionRes = await axios.get(urlInflacion, { timeout: 2000 });
      datosInflacion = datosInflacionRes.data;
    } catch (err) {
      console.error('Error en inflacion:', err.message);
    }

    try {
      const aniosRes = await axios.get(`${FLASK_BASE_URL}/api/anios`, { timeout: 2000 });
      aniosDisponibles = aniosRes.data;
    } catch (err) {
      console.error('Error en anios:', err.message);
    }

    try {
      const indicadoresPobRes = await axios.get(`${FLASK_BASE_URL}/api/indicadores_poblacion`, { timeout: 2000 });
      indicadoresPoblacion = indicadoresPobRes.data;
    } catch (err) {
      console.error('Error en indicadores_poblacion:', err.message);
    }

    try {
      const indicadoresPobrezaRes = await axios.get(`${FLASK_BASE_URL}/api/indicadores_pobreza`, { timeout: 2000 });
      indicadoresPobreza = indicadoresPobrezaRes.data;
    } catch (err) {
      console.error('Error en indicadores_pobreza:', err.message);
    }

    try {
      const datosPoblacionRes = await axios.get(urlPoblacion, { timeout: 2000 });
      datosPoblacion = datosPoblacionRes.data;
    } catch (err) {
      console.error('Error en poblacion:', err.message);
    }

    try {
      const datosPobrezaRes = await axios.get(urlPobreza, { timeout: 2000 });
      datosPobreza = datosPobrezaRes.data;
    } catch (err) {
      console.error('Error en pobreza:', err.message);
    }

    res.render('Evolucion/dashboard', {
      datosInflacion,
      aniosDisponibles,
      indicadoresPoblacion,
      indicadoresPobreza,
      datosPoblacion,
      datosPobreza,
      anioSeleccionado,
      departamentoSeleccionado,
      indicadorPoblacion,
      indicadorPobreza,
      flaskHost: FLASK_BASE_URL,
      session: req.session
    });

  } catch (error) {
    console.error('❌ Error inesperado:', error.message);
    res.status(500).json({ error: 'Error inesperado en el servidor. Por favor, intenta de nuevo.' });
  }
});



const { ensureAuthenticated } = require('../../middlewares/auth');

router.get('/Subir-Dataset', ensureAuthenticated, (req, res) => {
  const flaskHost = 'http://127.0.0.1:5001';  // el que maneja /api/previsualizar-dataset
  res.render('dashboard/subir_dataset', { flaskHost });
});


module.exports = router;
