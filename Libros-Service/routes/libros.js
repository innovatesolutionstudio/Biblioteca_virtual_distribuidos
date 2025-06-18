const express = require('express');
const router = express.Router();
const db = require('../database/firebase');

router.get('/api/libros', async (req, res) => {
  try {
    const query = (req.query.q || '').toLowerCase();
    const categoria = (req.query.categoria || '').toLowerCase();

    const librosSnapshot = await db.collection('libros').get();
    const libros = [];

    librosSnapshot.forEach(doc => {
      const data = doc.data();
      const librosInternos = data.libros || {};

      for (const key in librosInternos) {
        const libro = librosInternos[key];
        const genero = libro.genero || '';
        const libroFinal = {
          id: doc.id,
          titulo: libro.titulo || 'Sin título',
          autor: libro.autor || 'Desconocido',
          ano_publicacion: libro.ano_publicacion || 'N/A',
          portada: data.portada || '/img/libros2.png',
          documento: data.documento || '#',
          genero,
          descripcion: libro.descripcion || ''
        };

        const texto = (libroFinal.titulo + libroFinal.autor + libroFinal.descripcion).toLowerCase();
        if (query && !texto.includes(query)) continue;
        if (categoria && genero.toLowerCase() !== categoria) continue;

        libros.push(libroFinal);
      }
    });

    res.json({ libros });
  } catch (error) {
    console.error('Error al cargar libros:', error);
    res.status(500).json({ error: 'Error al cargar libros' });
  }
});


// Ruta API: obtener un libro específico por ID
router.get('/api/libros/:id', async (req, res) => {
  try {
    const doc = await db.collection('libros').doc(req.params.id).get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Libro no encontrado' });
    }

    const data = doc.data();
    const libro001 = Object.values(data.libros || {})[0];

    const libro = {
      titulo: libro001.titulo || 'Sin título',
      autor: libro001.autor || 'Desconocido',
      ano_publicacion: libro001.ano_publicacion || 'N/A',
      edicion: libro001.edicion || '',
      editorial: libro001.editorial || '',
      genero: libro001.genero || '',
      idioma: libro001.idioma || '',
      sinopsis: libro001.sinopsis || '',
      portada: data.portada || '/img/libros2.png',
      documento: data.documento || '#'
    };

    res.json({ libro });
  } catch (error) {
    console.error('Error al obtener libro:', error);
    res.status(500).json({ error: 'Error al cargar libro' });
  }
});


module.exports = router;
