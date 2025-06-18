const express = require('express'); 
const router = express.Router();
const axios = require('axios');
const fetch = require('node-fetch');

router.get('/Asistente', async (req, res) => {
  try {
    const test = await fetch('http://chatbot-service/chatbot.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pregunta: 'ping' }),
      timeout: 50000
    });

    if (!test.ok) {
      console.error(`⚠️ chatbot.php respondió con estado ${test.status}`);
      return res.redirect('/mantenimiento');
    }

    res.render('ChatBot/chatbot', {
      session: req.session
    });

  } catch (error) {
    console.error('❌ Error al conectar con el microservicio ChatBot:', error.message);

    if (
      error.code === 'ECONNREFUSED' ||
      error.code === 'ENOTFOUND' ||
      error.code === 'ECONNABORTED'
    ) {
      return res.redirect('/mantenimiento');
    }

    res.status(500).send('Error al cargar el asistente.');
  }
});


router.post('/api/chatbot', async (req, res) => {
  try {
    if (!req.body || !req.body.pregunta) {
      return res.status(400).json({ respuesta: '❌ Pregunta no proporcionada.' });
    }

    const { pregunta } = req.body;
    console.log("📩 Enviando pregunta a microservicio PHP:", pregunta);

    const fetch = (await import('node-fetch')).default;
    const respuestaPhp = await fetch('http://chatbot-service/chatbot.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pregunta })
    });

    const textoPlano = await respuestaPhp.text();

    // Intenta parsear manualmente como JSON
    let data;
    try {
      data = JSON.parse(textoPlano);
    } catch (e) {
      console.error("⚠️ Respuesta del microservicio no es JSON válido:", textoPlano);
      return res.status(502).json({ respuesta: '⚠️ Respuesta inválida del microservicio PHP.' });
    }

    console.log("✅ Respuesta recibida del microservicio:", data);
    res.json(data);

  } catch (error) {
    console.error('❌ ERROR DETECTADO:', error);
    res.status(500).json({ respuesta: 'Error interno al contactar con el asistente.' });
  }
});


module.exports = router;
