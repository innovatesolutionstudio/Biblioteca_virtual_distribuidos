// src/routes/pagina/index.js
const express = require('express');
const router = express.Router();
const db = require('../../config/db');
const axios = require('axios');


// Ruta principal - Página de inicio
router.get('/', (req, res) => {
  res.render('Pagina/index',{
     session: req.session
  }); // Usa una vista llamada 'inicio.ejs' o el motor que estés usando
  
});


router.get('/imagen/:id', async (req, res) => {
  try {
    const docId = req.params.id;
    const doc = await db.collection('imagenes').doc(docId).get();

    if (!doc.exists) {
      return res.status(404).send('Imagen no encontrada');
    }

    const data = doc.data();
    const imagen = {
      descripcion: data.descripcion || 'Sin descripción',
      fecha: data.fecha?.toDate().toLocaleString() || '', // ✅ conversión correcta
      imagen_base64: data.imagen_base64 || '',
      url: data.url || '',
      verificacion: data.verificacion || 0,
      codigo: data.codigo_peticion || ''
    };
    res.render('Pagina/imagen', {
      imagen,
      session: req.session
    });

  } catch (error) {
    console.error('Error al obtener la imagen:', error);
    res.status(500).send('Error al cargar la imagen');
  }
});



// Ruta para Galeria de imagenes generadas
router.get('/Galeria', (req, res) => {
  res.render('galeria/galeria',{
     session: req.session
  });
});


//ruta para mantenimiento 
router.get('/mantenimiento', (req, res) => {
  res.render('config/mantenimiento',{
     session: req.session
  });
});


// Ruta para Nuestra Bolivia
router.get('/Nuestra-Bolivia', (req, res) => {
  const isDocker = process.env.NODE_ENV === 'production';
  const iframeSrc = isDocker
    ? 'http://mapa-bolivia-service:5000'
    : 'http://localhost:5000';

  res.render('bolivia/mapas', { 
    session: req.session,
    iframeSrc
  });
});

// Ruta para elecciones Bolivia
router.get('/Ultimas-Elecciones', (req, res) => {
  const isDocker = process.env.NODE_ENV === 'production';
  const iframeSrc = isDocker
    ? 'http://elecciones-service:5003/informe'
    : 'http://localhost:5003/informe';

  res.render('elecciones/elecciones', { 
    session: req.session,
    iframeSrc
  });
});





router.get('/perfil', async (req, res) => {
  if (!req.session.user) {
    console.log(' No hay sesión activa. Redirigiendo a /login');
    return res.redirect('/login');
  }
 
  console.log(' ID de sesión:', req.session.user.id_usuario);
 
  try {
   const [rows] = await db.execute(
      'SELECT * FROM usuarios WHERE id_usuario = ?',
      [req.session.user.id_usuario]
    );
    console.log("usuario: ",rows[0])
    if (!rows || rows.length === 0) {
      console.log(' Usuario no encontrado en la base de datos');
      return res.status(404).send('Usuario no encontrado');
    }
 
    const usuario = rows[0];
    console.log(' Usuario encontrado:', usuario);
 
    res.render('Pagina/perfil', { usuario });
  } catch (error) {
    console.error(' Error al obtener usuario:', error);
    res.status(500).send('Error interno');
  }
});
 
// Ruta para actualizar el perfil
router.post('/perfil/actualizar', async (req, res) => {
  const { nombre, apellido, telefono } = req.body;
  const id = req.session.user.id_usuario;
 
  try {
    await db.query(
      'UPDATE usuarios SET nombre = ?, apellido = ?, telefono = ? WHERE id_usuario = ?',
      [nombre, apellido, telefono, id]
    );
 
    // Opcional: actualiza la sesión con los nuevos valores
    req.session.user.nombre = nombre;
    req.session.user.apellido = apellido;
    req.session.user.telefono = telefono;
 
    res.redirect('/perfil');
  } catch (error) {
    console.error('Error actualizando perfil:', error);
    res.status(500).send('Error actualizando');
  }
});





module.exports = router;