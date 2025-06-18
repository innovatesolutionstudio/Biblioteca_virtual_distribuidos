const express = require('express');
const cors = require('cors');
const librosRouter = require('./routes/libros');

const app = express();
app.use(cors());
app.use(librosRouter);

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Microservicio de libros escuchando en el puerto ${PORT}`);
});
