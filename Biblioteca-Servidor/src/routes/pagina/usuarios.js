const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const db = require('../../config/db');

// Vista principal
router.get('/dashboard-usuarios', async (req, res) => {
  try {
    const [usuarios] = await db.execute(`
      SELECT u.*, r.nombre_rol
      FROM usuarios u
      LEFT JOIN roles r ON u.id_rol = r.id_rol
    `);

    const [roles] = await db.execute(`SELECT * FROM roles WHERE estado_rol = 1`);

    res.render('dashboard/usuarios', { usuarios, roles });
  } catch (err) {
    console.error('❌ Error al cargar usuarios:', err);
    res.status(500).send('Error al cargar usuarios');
  }
});

// Crear usuario
router.post('/usuarios/crear', async (req, res) => {
  const { nombre, apellido, correo, contrasena, id_rol, telefono } = req.body;

  if (!nombre || !apellido || !correo || !contrasena || !id_rol) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  try {
    const [exist] = await db.execute(`SELECT * FROM usuarios WHERE correo = ?`, [correo]);
    if (exist.length) return res.status(409).json({ error: 'El correo ya está registrado' });

    const hash = await bcrypt.hash(contrasena, 10);

    await db.execute(`
      INSERT INTO usuarios (nombre, apellido, correo, contrasena, id_rol, telefono, estado_usuario)
      VALUES (?, ?, ?, ?, ?, ?, 1)
    `, [nombre, apellido, correo, hash, id_rol, telefono]);

    res.status(200).json({ mensaje: 'Usuario creado correctamente' });
  } catch (err) {
    console.error('❌ Error al crear usuario:', err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// Editar usuario
router.post('/usuarios/editar/:id', async (req, res) => {
  const id = req.params.id;
  const { nombre, apellido, correo, id_rol, telefono } = req.body;

  try {
    await db.execute(`
      UPDATE usuarios
      SET nombre = ?, apellido = ?, correo = ?, id_rol = ?, telefono = ?
      WHERE id_usuario = ?
    `, [nombre, apellido, correo, id_rol, telefono, id]);

    res.status(200).json({ mensaje: 'Usuario actualizado' });
  } catch (err) {
    console.error('❌ Error al editar usuario:', err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// Eliminar usuario
router.post('/usuarios/eliminar/:id', async (req, res) => {
  const id = req.params.id;
  try {
    await db.execute(`DELETE FROM usuarios WHERE id_usuario = ?`, [id]);
    res.status(200).json({ mensaje: 'Usuario eliminado' });
  } catch (err) {
    console.error('❌ Error al eliminar usuario:', err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

module.exports = router;
