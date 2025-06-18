const express = require('express');
const router = express.Router();
const db = require('..//../database/firebase');



// Vista principal
router.get('/Subir-libros', async (req, res) => {

    res.render('dashboard/libros');
  
});

/*
const puppeteer = require('puppeteer');

const upload = multer({ dest: 'uploads/' });

function generarNombreArchivo(nombreOriginal) {
  const ext = path.extname(nombreOriginal);
  return `${Date.now()}-${nombreOriginal}`.replace(/\s/g, '_');
}
//  Función corregida para generar portada
const generarPortadaDesdePDF = async (rutaPDF, nombreSalida) => {
  const pdfBytes = fs.readFileSync(rutaPDF);
  const pdfDocOriginal = await PDFDocument.load(pdfBytes);

  const nuevoPDF = await PDFDocument.create();
  const [pagina] = await nuevoPDF.copyPages(pdfDocOriginal, [0]); //  copiar desde el original
  nuevoPDF.addPage(pagina);

  const tempPdfPath = rutaPDF.replace('.pdf', '_temp.pdf');
  const newPdfBytes = await nuevoPDF.save();
  fs.writeFileSync(tempPdfPath, newPdfBytes);

  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.goto(`file://${path.resolve(tempPdfPath)}`, { waitUntil: 'networkidle0' });

  const salida = path.join('uploads/portadas', `${nombreSalida}.png`);
  await page.screenshot({ path: salida, fullPage: true });

  await browser.close();
  fs.unlinkSync(tempPdfPath); // eliminar temporal

  return salida;
};

router.post('/libros/crear', upload.single('documento'), async (req, res) => {
  try {
    const {
      titulo, autor, ano_publicacion, descripcion,
      edicion, editorial, genero, idioma, sinopsis
    } = req.body;

    const file = req.file;
    if (!file) return res.status(400).json({ error: 'Debe subir un archivo PDF' });

    // Renombrar archivo
    const nuevoNombre = generarNombreArchivo(file.originalname);
    const rutaPDF = path.join('uploads', nuevoNombre);
    fs.renameSync(file.path, rutaPDF);

    // Generar portada
    const nombreBase = nuevoNombre.replace('.pdf', '');
    const rutaPortada = await generarPortadaDesdePDF(rutaPDF, nombreBase);
    const portadaRelativa = `/uploads/portadas/${path.basename(rutaPortada)}`;

    // Construir estructura de libro
    const libroID = Date.now().toString();
    const numeroLibro = '002'; // esto puede ser dinámico si necesitas

    const libroData = {
      titulo,
      autor,
      ano_publicacion: parseInt(ano_publicacion),
      descripcion,
      edicion,
      editorial,
      genero,
      idioma,
      sinopsis
    };

    // Insertar en Firestore
    await db.collection('libros').doc(libroID).set({
      documento: `/uploads/${nuevoNombre}`,
      portada: portadaRelativa,
      libros: {
        [numeroLibro]: libroData
      }
    });

    res.status(200).json({ mensaje: ' Libro guardado correctamente.' });

  } catch (error) {
    console.error(' Error al crear libro:', error);
    res.status(500).json({ error: 'Error al guardar libro.' });
  }
});

*/


module.exports = router;
