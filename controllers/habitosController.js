const pool = require("../config/db");

// Devuelve la fecha de hoy en formato AAAA-MM-DD (para la tabla cumplimientos)
const fechaDeHoy = () => {
  return new Date().toISOString().slice(0, 10);
};

// Cuenta cuantos dias fue completado un habito (usa la tabla cumplimientos)
const contarCompletados = async (idHabito) => {
  const resultado = await pool.query(
    "SELECT COUNT(*) FROM cumplimientos WHERE id_habito = $1 AND completado = TRUE",
    [idHabito]
  );

  return Number(resultado.rows[0].count);
};

// Dice si el habito ya fue marcado como completado hoy (true o false)
const estaCompletadoHoy = async (idHabito) => {
  const resultado = await pool.query(
    "SELECT completado FROM cumplimientos WHERE id_habito = $1 AND fecha = $2",
    [idHabito, fechaDeHoy()]
  );

  if (resultado.rows.length === 0) {
    return false;
  }

  return resultado.rows[0].completado === true;
};

// Lista todos los habitos de un usuario, agregando racha y si esta completado hoy
const listarHabitos = async (req, res) => {
  const { idUsuario } = req.params;

  try {
    const resultado = await pool.query(
      "SELECT * FROM habitos WHERE id_usuario = $1 ORDER BY id_habito",
      [idUsuario]
    );

    const habitos = [];

    for (const habito of resultado.rows) {
      const diasCompletados = await contarCompletados(habito.id_habito);
      const completadoHoy = await estaCompletadoHoy(habito.id_habito);

      habitos.push({
        ...habito,
        diasCompletados: diasCompletados,
        racha: diasCompletados,
        completadoHoy: completadoHoy
      });
    }

    return res.status(200).json({ habitos: habitos });
  } catch (error) {
    console.error("Error al listar habitos:", error);
    return res.status(500).json({ mensaje: "Error del servidor" });
  }
};

// Crea un habito nuevo
const crearHabito = async (req, res) => {
  const { id_usuario, nombre, descripcion, categoria, frecuencia } = req.body;

  if (!id_usuario || !nombre) {
    return res.status(400).json({ mensaje: "El usuario y el nombre son obligatorios" });
  }

  try {
    const resultado = await pool.query(
      `INSERT INTO habitos (id_usuario, nombre, descripcion, categoria, frecuencia)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [id_usuario, nombre, descripcion, categoria, frecuencia]
    );

    return res.status(201).json({ habito: resultado.rows[0] });
  } catch (error) {
    console.error("Error al crear habito:", error);
    return res.status(500).json({ mensaje: "Error del servidor" });
  }
};

// Edita el nombre, descripcion, categoria y frecuencia de un habito
const actualizarHabito = async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, categoria, frecuencia } = req.body;

  if (!nombre) {
    return res.status(400).json({ mensaje: "El nombre es obligatorio" });
  }

  try {
    const resultado = await pool.query(
      `UPDATE habitos
       SET nombre = $1, descripcion = $2, categoria = $3, frecuencia = $4
       WHERE id_habito = $5
       RETURNING *`,
      [nombre, descripcion, categoria, frecuencia, id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ mensaje: "Habito no encontrado" });
    }

    return res.status(200).json({ habito: resultado.rows[0] });
  } catch (error) {
    console.error("Error al actualizar habito:", error);
    return res.status(500).json({ mensaje: "Error del servidor" });
  }
};

// Borra un habito
const eliminarHabito = async (req, res) => {
  const { id } = req.params;

  try {
    const resultado = await pool.query(
      "DELETE FROM habitos WHERE id_habito = $1 RETURNING id_habito",
      [id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ mensaje: "Habito no encontrado" });
    }

    return res.status(200).json({ mensaje: "Habito eliminado" });
  } catch (error) {
    console.error("Error al eliminar habito:", error);
    return res.status(500).json({ mensaje: "Error del servidor" });
  }
};

// Marca o desmarca un habito como completado hoy (guarda en la tabla cumplimientos)
const marcarCumplimiento = async (req, res) => {
  const { id } = req.params;
  const hoy = fechaDeHoy();

  try {
    // Miramos si ya existe una fila de hoy para este habito
    const existente = await pool.query(
      "SELECT id_cumplimiento, completado FROM cumplimientos WHERE id_habito = $1 AND fecha = $2",
      [id, hoy]
    );

    if (existente.rows.length === 0) {
      // No existe: creamos la fila marcada como completada
      await pool.query(
        "INSERT INTO cumplimientos (id_habito, fecha, completado) VALUES ($1, $2, TRUE)",
        [id, hoy]
      );
    } else {
      // Ya existe: invertimos el valor (si estaba true lo dejamos false y al reves)
      const nuevoValor = !existente.rows[0].completado;
      await pool.query(
        "UPDATE cumplimientos SET completado = $1 WHERE id_cumplimiento = $2",
        [nuevoValor, existente.rows[0].id_cumplimiento]
      );
    }

    const completadoHoy = await estaCompletadoHoy(id);
    const diasCompletados = await contarCompletados(id);

    return res.status(200).json({
      completadoHoy: completadoHoy,
      diasCompletados: diasCompletados,
      racha: diasCompletados
    });
  } catch (error) {
    console.error("Error al marcar cumplimiento:", error);
    return res.status(500).json({ mensaje: "Error del servidor" });
  }
};

module.exports = {
  listarHabitos,
  crearHabito,
  actualizarHabito,
  eliminarHabito,
  marcarCumplimiento
};
