const express = require('express');
const axios = require('axios');
const router = express.Router();


router.get('/Biblioteca', async (req, res) => {
  try {
    const query = req.query.q || '';
    const categoria = req.query.categoria || '';

    const response = await axios.get('http://libros-service:4000/api/libros', {
      params: { q: query, categoria: categoria },
      timeout: 5000  // opcional: para evitar espera infinita
    });

    const libros = response.data.libros || [];
    const generos = [...new Set(libros.map(l => l.genero.trim().toLowerCase()))].sort();

    res.render('biblioteca/biblioteca', {
      libros,
      query,
      categoria,
      generos
    });

  } catch (error) {
    console.error('❌ Error solicitando libros al microservicio:', error.message);

    // Detectar error por conexión fallida
    if (
      error.code === 'ECONNREFUSED' ||        // conexión rechazada
      error.code === 'ENOTFOUND' ||           // host no encontrado
      error.code === 'ECONNABORTED' ||        // timeout
      error.response?.status >= 500           // error 5xx en el microservicio
    ) {
      return res.redirect('/mantenimiento');
    }

    res.status(500).send('Error al consultar libros');
  }
});



router.get('/Libro/:id', async (req, res) => {
  try {
    const response = await axios.get(`http://libros-service:4000/api/libros/${req.params.id}`, {
      timeout: 5000 // evita cuelgues si el servicio no responde
    });

    const libro = response.data.libro;
    res.render('biblioteca/libro', { libro });

  } catch (error) {
    console.error('❌ Error al obtener libro desde el microservicio:', error.message);

    // Redirigir a /mantenimiento si el microservicio está caído o no responde
    if (
      error.code === 'ECONNREFUSED' ||
      error.code === 'ENOTFOUND' ||
      error.code === 'ECONNABORTED' ||
      error.response?.status >= 500
    ) {
      return res.redirect('/mantenimiento');
    }

    // Otro tipo de error (por ejemplo, 404 libro no encontrado)
    res.status(500).send('Error al cargar libro');
  }
});





module.exports = router;
