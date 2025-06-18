const admin = require('firebase-admin');
const serviceAccount = require('./clave.json'); // asegúrate que sea este el nombre correcto

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
module.exports = db;

