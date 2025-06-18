LOS DOCUMENTOS QUE USAMOS EN ESTE CASO POR PARTE DEL SISTEMA MONOLOGICO QUE MANEJA NODE.JS SON:

view/Evolucion
- aca agregamos el archivo subir_dataset.ejs , esto es nuestra vista donde el        admin podra actualizar los datos.

- copiar el codigo del archivo dashboard.ejs esta con las ultimas funciones.

src/routes/pagina  (aca debes copiarlo a la ruta que separaste en el sistema)

const { ensureAuthenticated } = require('../../middlewares/auth');
router.get('/Subir-Dataset', ensureAuthenticated, (req, res) => {
  const flaskHost = process.env.FLASK_HOST;
  res.render('Evolucion/subir_dataset', { flaskHost });
});

LO QUE ESTAMOS HACIENDO ES QUE LA PAGINA VERIFIQUE CUANDO INGRESE ACA ESTA RUTA ESTE LOGEADO Y SINO ESTA REDIRIGIR AL  LOGIN


