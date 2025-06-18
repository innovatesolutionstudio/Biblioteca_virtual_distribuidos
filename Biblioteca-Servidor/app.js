const express = require('express');
const app = express();
const path = require('path');

const session = require('express-session'); 
require('dotenv').config();


// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
 

// Configurar motor de vistas (por ejemplo, EJS)
app.set('views', path.join(__dirname, 'src/view'));
app.set('view engine', 'ejs');



// Acceso a documentos y portadas
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.json());



// Manejo de sesiones
app.use(session({
  secret: process.env.SECRET_KEY || 'mi_clave_secreta',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 5 * 60 * 1000
  }
}));

app.use((req, res, next) => {
  res.locals.session = req.session;
  res.locals.serviceUrls = {
    phpHost: 'http://chatbot-service',
    librosHost: 'http://libros-service',
    flaskHost: 'http://dashboardcliente-service',
    preguntaLBHost: 'http://preguntalb-service'
  };
  next();
});

 
// Middleware para evitar cacheo en rutas protegidas  ANTES de las rutas
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  next();
});
 

const setServiceUrl = require('./src/middlewares/setServiceUrl');
app.use(setServiceUrl);


// Rutas para la pagina principal 
const paginaRoutes = require('./src/routes/pagina/pagina');
const loginRoutes = require('./src/routes/login/login');
const bibliotecaRoutes = require('./src/routes/pagina/biblioteca');

const dashboarRoutes = require('./src/routes/dashboard/dashboard');
const chatbotRoutes = require('./src/routes/pagina/chatbot');
const dashboar_userRoutes = require('./src/routes/dashboard/dashboard_user');
const dashboar_usuariosRoutes = require('./src/routes/pagina/usuarios');
const dashboar_librosRoutes = require('./src/routes/pagina/libros');



app.use('/', paginaRoutes);
app.use(loginRoutes);
app.use(bibliotecaRoutes);

app.use(dashboarRoutes);
app.use(chatbotRoutes);
app.use(dashboar_userRoutes);
app.use(dashboar_usuariosRoutes);
app.use(dashboar_librosRoutes);
// Rutas
const ConfigRoutes = require('./src/routes/config/config');
app.use(ConfigRoutes);

const rt12 = require('./src/routes/rt12/crud_libros');
app.use(rt12);

// Puerto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
