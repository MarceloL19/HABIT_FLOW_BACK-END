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

const usuarioExiste = async (idUsuario) => {
  const resultado = await pool.query(
    "SELECT id_usuario FROM usuarios WHERE id_usuario = $1",
    [idUsuario]
  );

  return resultado.rows.length > 0;
};

const obtenerPerfil = async (req, res) => {
  const { id } = req.params;

  try {
    const usuario = await buscarUsuarioConPreferencias(id);

    if (!usuario) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    return res.status(200).json({ usuario: armarUsuarioRespuesta(usuario) });
  } catch (error) {
    console.error("Error al obtener perfil:", error);
    return res.status(500).json({ mensaje: "Error del servidor" });
  }
};

const actualizarPerfil = async (req, res) => {
  const { id } = req.params;
  const { nombre, correo } = req.body;
  const nombreLimpio = nombre ? nombre.trim() : "";
  const correoLimpio = correo ? correo.trim().toLowerCase() : "";

  if (!nombreLimpio || !correoLimpio) {
    return res.status(400).json({ mensaje: "Nombre y correo son obligatorios" });
  }

  if (!correoValido(correoLimpio)) {
    return res.status(400).json({ mensaje: "El correo no tiene un formato valido" });
  }

  try {
    const existe = await usuarioExiste(id);

    if (!existe) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    const correoUsado = await pool.query(
      `SELECT id_usuario FROM usuarios
       WHERE correo = $1 AND id_usuario <> $2`,
      [correoLimpio, id]
    );

    if (correoUsado.rows.length > 0) {
      return res.status(400).json({ mensaje: "El correo ya esta usado por otro usuario" });
    }

    await pool.query(
      `UPDATE usuarios
       SET nombre = $1, correo = $2
       WHERE id_usuario = $3`,
      [nombreLimpio, correoLimpio, id]
    );

    const usuarioActualizado = await buscarUsuarioConPreferencias(id);

    return res.status(200).json({
      mensaje: "Perfil actualizado correctamente",
      usuario: armarUsuarioRespuesta(usuarioActualizado)
    });
  } catch (error) {
    console.error("Error al actualizar perfil:", error);
    return res.status(500).json({ mensaje: "Error del servidor" });
  }
};

const actualizarPreferencias = async (req, res) => {
  const { id } = req.params;
  const { tema, idioma, notificaciones } = req.body;

  if (tema !== "claro" && tema !== "oscuro") {
    return res.status(400).json({ mensaje: "El tema debe ser claro u oscuro" });
  }

  if (idioma !== "es" && idioma !== "en") {
    return res.status(400).json({ mensaje: "El idioma debe ser es o en" });
  }

  if (typeof notificaciones !== "boolean") {
    return res.status(400).json({ mensaje: "Notificaciones debe ser true o false" });
  }

  try {
    const existe = await usuarioExiste(id);

    if (!existe) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    const resultado = await pool.query(
      `UPDATE preferencias
       SET tema = $1, idioma = $2, notificaciones = $3
       WHERE id_usuario = $4
       RETURNING tema, idioma, notificaciones`,
      [tema, idioma, notificaciones, id]
    );

    return res.status(200).json({
      mensaje: "Preferencias actualizadas correctamente",
      preferencias: resultado.rows[0]
    });
  } catch (error) {
    console.error("Error al actualizar preferencias:", error);
    return res.status(500).json({ mensaje: "Error del servidor" });
  }
};

module.exports = {
  obtenerPerfil,
  actualizarPerfil,
  actualizarPreferencias
};
