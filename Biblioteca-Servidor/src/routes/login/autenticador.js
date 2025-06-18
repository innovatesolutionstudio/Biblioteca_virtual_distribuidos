const bcrypt = require('bcrypt');
const db = require('../../config/db');
const nodemailer = require('nodemailer');
require('dotenv').config();
 
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
 
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const [userRows] = await db.execute(`
      SELECT u.*, r.nombre_rol 
      FROM usuarios u
      LEFT JOIN roles r ON u.id_rol = r.id_rol
      WHERE u.correo = ?
    `, [email]);

    const user = userRows[0];

    if (!user) {
      return res.redirect('/login?error=usuario');
    }

    const match = await bcrypt.compare(password, user.contrasena);
    if (!match) {
      return res.redirect('/login?error=contrasena');
    }

    // Guardar sesión
    req.session.user = {
      id_usuario: user.id_usuario,
      nombre: user.nombre,
      apellido: user.apellido,
      correo: user.correo,
      telefono: user.telefono,
      rol: user.nombre_rol || null
    };

    // Redirección según el rol
    if (!user.id_rol || !user.nombre_rol) {
      return res.redirect('/?login=exito');  // Usuario sin rol
    }

    if (user.nombre_rol.toLowerCase() === 'administrador') {
      return res.redirect('dashboard');
    }

    // Redirección genérica para otros roles
    return res.redirect('/?login=exito');

  } catch (err) {
    console.error(' Error en login:', err.message);
    return res.status(500).send('Error en el inicio de sesión');
  }
};

 

exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;
 
    const [exist] = await db.execute("SELECT * FROM usuarios WHERE correo = ?", [email]);
 
    if (exist.length) {
      return res.redirect('/register?error=existe');
    }
 
    const hashed = await bcrypt.hash(password, 10);
 
    await db.execute(
      "INSERT INTO usuarios (correo, contrasena) VALUES (?, ?)",
      [email, hashed]
    );
 
    return res.redirect('/register?registro=exito');
  } catch (err) {
    console.error('💥 Error en register:', err.message);
    return res.status(500).send('Error al registrar usuario: ' + err.message);
  }
};
 
exports.sendResetCode = async (req, res) => {
  const { email } = req.body;
  const [user] = await db.execute("SELECT * FROM usuarios WHERE correo = ?", [email]);
 
  if (!user.length) {
    // 🔥 Aquí va la redirección con el parámetro de error
    return res.redirect('/forgot-password?error=noregistrado');
  }
 
  try {
    const [user] = await db.execute("SELECT * FROM usuarios WHERE correo = ?", [email]);
    if (!user.length) return res.send('Correo no registrado');
 
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos
 
    await db.execute(
      "UPDATE usuarios SET codigo_otp = ?, vencimiento_otp = ? WHERE correo = ?",
      [otp, expiry, email]
    );
 
    await transporter.sendMail({
      from: `Biblioteca Virtual ISS <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Restablecimiento de contraseña - ISS',
      html: `
        <h3>Hola,</h3>
        <p>Hemos recibido una solicitud para restablecer tu contraseña.</p>
        <p>Tu código de verificación es: <strong>${otp}</strong></p>
        <p>Este código expirará en 10 minutos.</p>
        <p style="color: gray;">Atentamente,<br>Biblioteca Virtual ISS</p>
      `
    });
 
    return res.redirect('/reset-password');
  } catch (err) {
    console.error(' Error en sendResetCode:', err.message);
    return res.status(500).send('Error al enviar código de recuperación');
  }
};

exports.resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  console.log(req.body)
 
  // Verificar si el usuario existe
  const [user] = await db.execute("SELECT * FROM usuarios WHERE correo = ?", [email]);

  if (!user.length) {
    return res.redirect('/reset-password?error=noregistrado');
  }
 
  const now = new Date();
  console.log(user[0])
  // Verificar si el código es correcto
  if (user[0].codigo_otp !== otp) {
    return res.redirect('/reset-password?error=incorrecto');
  }
 
  // Verificar si el código ha expirado
  if (now > user[0].vencimiento_otp) {
    return res.redirect('/reset-password?error=expirado');
  }
 
  // Validar y actualizar nueva contraseña
  const hashed = await bcrypt.hash(newPassword, 10);
  await db.execute(`
    UPDATE usuarios
    SET contrasena = ?, codigo_otp = NULL, vencimiento_otp = NULL
    WHERE correo = ?
  `, [hashed, email]);
 
  // Redirigir al login con confirmación de éxito
  return res.redirect('/login?reset=ok');
};