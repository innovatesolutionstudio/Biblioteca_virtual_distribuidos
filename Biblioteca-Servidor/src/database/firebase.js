// src/database/firebase.js
const admin = require('firebase-admin');
const serviceAccount = require('./clave.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://biblioteca-virtual-96858-default-rtdb.firebaseio.com"
  });
}

const db = admin.firestore();
module.exports = db;
