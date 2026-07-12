const bcrypt = require("bcryptjs");
const pool = require("../config/db");

const correoValido = (correo) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
};

const armarUsuarioRespuesta = (fila) => {
  return {
    id_usuario: fila.id_usuario,
    nombre: fila.nombre,
    correo: fila.correo,
    preferencias: {
      tema: fila.tema,
      idioma: fila.idioma,
      notificaciones: fila.notificaciones
    }
  };
};

const buscarUsuarioConPreferencias = async (idUsuario) => {
  const resultado = await pool.query(
    `SELECT u.id_usuario, u.nombre, u.correo,
            p.tema, p.idioma, p.notificaciones
     FROM usuarios u
     INNER JOIN preferencias p ON p.id_usuario = u.id_usuario
     WHERE u.id_usuario = $1`,
    [idUsuario]
  );

  return resultado.rows[0];
};

const registrarUsuario = async (req, res) => {
  const { nombre, correo, password } = req.body;
  const nombreLimpio = nombre ? nombre.trim() : "";
  const correoLimpio = correo ? correo.trim().toLowerCase() : "";

  if (!nombreLimpio || !correoLimpio || !password) {
    return res.status(400).json({ mensaje: "Nombre, correo y password son obligatorios" });
  }

  if (!correoValido(correoLimpio)) {
    return res.status(400).json({ mensaje: "El correo no tiene un formato valido" });
  }

  const cliente = await pool.connect();
  let transaccionIniciada = false;

  try {
    const correoRegistrado = await cliente.query(
      "SELECT id_usuario FROM usuarios WHERE correo = $1",
      [correoLimpio]
    );

    if (correoRegistrado.rows.length > 0) {
      return res.status(400).json({ mensaje: "El correo ya esta registrado" });
    }

    const passwordEncriptado = await bcrypt.hash(password, 10);

    await cliente.query("BEGIN");
    transaccionIniciada = true;

    const usuarioCreado = await cliente.query(
      `INSERT INTO usuarios (nombre, correo, password)
       VALUES ($1, $2, $3)
       RETURNING id_usuario`,
      [nombreLimpio, correoLimpio, passwordEncriptado]
    );

    const idUsuario = usuarioCreado.rows[0].id_usuario;

    await cliente.query(
      `INSERT INTO preferencias (id_usuario, tema, idioma, notificaciones)
       VALUES ($1, 'claro', 'es', TRUE)`,
      [idUsuario]
    );

    await cliente.query("COMMIT");
    transaccionIniciada = false;

    const usuarioConPreferencias = await buscarUsuarioConPreferencias(idUsuario);

    return res.status(201).json({
      mensaje: "Usuario registrado correctamente",
      usuario: armarUsuarioRespuesta(usuarioConPreferencias)
    });
  } catch (error) {
    if (transaccionIniciada) {
      await cliente.query("ROLLBACK");
    }
    console.error("Error al registrar usuario:", error);
    return res.status(500).json({ mensaje: "Error del servidor" });
  } finally {
    cliente.release();
  }
};

const iniciarSesion = async (req, res) => {
  const { correo, password } = req.body;
  const correoLimpio = correo ? correo.trim().toLowerCase() : "";

  if (!correoLimpio || !password) {
    return res.status(400).json({ mensaje: "Correo y password son obligatorios" });
  }

  try {
    const resultado = await pool.query(
      "SELECT * FROM usuarios WHERE correo = $1",
      [correoLimpio]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ mensaje: "El usuario no existe" });
    }

    const usuario = resultado.rows[0];
    const passwordCorrecto = await bcrypt.compare(password, usuario.password);

    if (!passwordCorrecto) {
      return res.status(401).json({ mensaje: "La contrasena es incorrecta" });
    }

    const usuarioConPreferencias = await buscarUsuarioConPreferencias(usuario.id_usuario);

    return res.status(200).json({
      mensaje: "Inicio de sesion correcto",
      usuario: armarUsuarioRespuesta(usuarioConPreferencias)
    });
  } catch (error) {
    console.error("Error al iniciar sesion:", error);
    return res.status(500).json({ mensaje: "Error del servidor" });
  }
};

module.exports = {
  registrarUsuario,
  iniciarSesion
};
