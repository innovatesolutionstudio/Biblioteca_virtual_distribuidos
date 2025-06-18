import express from 'express';
import admin from 'firebase-admin';
import cors from 'cors';
import fs from 'fs';

const app = express();
app.use(cors());
app.use(express.json());

const serviceAccount = JSON.parse(fs.readFileSync('./firebase/clave.json', 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://biblioteca-virtual-96858-default-rtdb.firebaseio.com"
});

const db = admin.database();

app.post('/consultar-libro', async (req, res) => {
  const pregunta = req.body.pregunta?.toLowerCase() || '';
  const ref = db.ref('libros');

  try {
    const snapshot = await ref.once('value');
    const libros = snapshot.val();

    if (!libros) return res.json({ resultado: 'No hay resultados' });

    const encontrados = Object.values(libros).filter(libro => {
      const titulo = libro.titulo?.toLowerCase();
      return titulo && pregunta.includes(titulo);
    });

    if (encontrados.length > 0) {
      const titulos = encontrados.map(l => l.titulo).join(', ');
      return res.json({ resultado: `📚 Sí, tenemos este libro en la biblioteca: ${titulos}` });
    }

    res.json({ resultado: '❌ Lo siento, no tenemos ese libro disponible por ahora.' });
  } catch (error) {
    console.error('❌ Error al consultar libros:', error.message);
    res.status(500).json({ error: 'Error al consultar libros' });
  }
});



const PORT = process.env.PORT || 4100;
app.listen(PORT, () => {
  console.log(`✅ Microservicio pregunta_de_libros corriendo en el puerto ${PORT}`);
});
