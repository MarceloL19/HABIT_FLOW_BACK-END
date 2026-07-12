const pool = require("../config/db");

const formatearFecha = (fecha) => {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return `${anio}-${mes}-${dia}`;
};

const fechaHoy = () => {
  return formatearFecha(new Date());
};

// Calcula la racha (dias consecutivos completados hasta hoy) y el total
// de dias completados de un habito, usando la tabla cumplimientos.
const calcularRachaYDias = async (idHabito) => {
  const resultado = await pool.query(
    "SELECT fecha FROM cumplimientos WHERE id_habito = $1 AND completado = TRUE",
    [idHabito]
  );

  const diasCompletados = resultado.rows.length;

  const fechasCompletadas = new Set(
    resultado.rows.map((fila) => formatearFecha(new Date(fila.fecha)))
  );

  let racha = 0;
  const cursor = new Date();

  // Si hoy todavia no esta completado, la racha se cuenta desde ayer
  // (para no cortar una racha activa solo porque hoy no se marco aun)
  if (!fechasCompletadas.has(formatearFecha(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }

  while (fechasCompletadas.has(formatearFecha(cursor))) {
    racha += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return { racha, diasCompletados };
};

const armarHabitoRespuesta = (fila) => {
  return {
    id_habito: fila.id_habito,
    nombre: fila.nombre,
    descripcion: fila.descripcion,
    categoria: fila.categoria,
    frecuencia: fila.frecuencia,
    activo: fila.activo,
    fecha_creacion: fila.fecha_creacion,
    completado_hoy: fila.completado === true,
    racha: fila.racha,
    dias_completados: fila.dias_completados
  };
};

const usuarioExiste = async (idUsuario) => {
  const resultado = await pool.query(
    "SELECT id_usuario FROM usuarios WHERE id_usuario = $1",
    [idUsuario]
  );

  return resultado.rows.length > 0;
};

const habitoExiste = async (idHabito) => {
  const resultado = await pool.query(
    "SELECT id_habito FROM habitos WHERE id_habito = $1",
    [idHabito]
  );

  return resultado.rows.length > 0;
};

const listarHabitos = async (req, res) => {
  const { id } = req.params;

  try {
    const existe = await usuarioExiste(id);

    if (!existe) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    const resultado = await pool.query(
      `SELECT h.id_habito, h.nombre, h.descripcion, h.categoria,
              h.frecuencia, h.activo, h.fecha_creacion,
              c.completado
       FROM habitos h
       LEFT JOIN cumplimientos c
         ON c.id_habito = h.id_habito AND c.fecha = $2
       WHERE h.id_usuario = $1 AND h.activo = TRUE
       ORDER BY h.fecha_creacion DESC`,
      [id, fechaHoy()]
    );

    // Para cada habito calculamos su racha y total de dias completados
    const habitos = await Promise.all(
      resultado.rows.map(async (fila) => {
        const { racha, diasCompletados } = await calcularRachaYDias(fila.id_habito);
        return armarHabitoRespuesta({
          ...fila,
          racha,
          dias_completados: diasCompletados
        });
      })
    );

    return res.status(200).json({ habitos });
  } catch (error) {
    console.error("Error al listar habitos:", error);
    return res.status(500).json({ mensaje: "Error del servidor" });
  }
};

const alternarCumplimiento = async (req, res) => {
  const { id } = req.params;

  try {
    const existe = await habitoExiste(id);

    if (!existe) {
      return res.status(404).json({ mensaje: "Habito no encontrado" });
    }

    const hoy = fechaHoy();

    const existente = await pool.query(
      "SELECT completado FROM cumplimientos WHERE id_habito = $1 AND fecha = $2",
      [id, hoy]
    );

    let nuevoEstado;

    if (existente.rows.length > 0) {
      nuevoEstado = !existente.rows[0].completado;

      await pool.query(
        `UPDATE cumplimientos
         SET completado = $1
         WHERE id_habito = $2 AND fecha = $3`,
        [nuevoEstado, id, hoy]
      );
    } else {
      nuevoEstado = true;

      await pool.query(
        `INSERT INTO cumplimientos (id_habito, fecha, completado)
         VALUES ($1, $2, $3)`,
        [id, hoy, nuevoEstado]
      );
    }

    const { racha, diasCompletados } = await calcularRachaYDias(id);

    return res.status(200).json({
      mensaje: "Cumplimiento actualizado correctamente",
      id_habito: Number(id),
      completado_hoy: nuevoEstado,
      racha,
      dias_completados: diasCompletados
    });
  } catch (error) {
    console.error("Error al alternar cumplimiento:", error);
    return res.status(500).json({ mensaje: "Error del servidor" });
  }
};

const eliminarHabito = async (req, res) => {
  const { id } = req.params;

  try {
    const existe = await habitoExiste(id);

    if (!existe) {
      return res.status(404).json({ mensaje: "Habito no encontrado" });
    }

    await pool.query("DELETE FROM habitos WHERE id_habito = $1", [id]);

    return res.status(200).json({ mensaje: "Habito eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar habito:", error);
    return res.status(500).json({ mensaje: "Error del servidor" });
  }
};

const crearHabito = async (req, res) => {
  const { id_usuario, nombre, descripcion, categoria, frecuencia } = req.body;
  const nombreLimpio = nombre ? nombre.trim() : "";

  if (!id_usuario || !nombreLimpio) {
    return res.status(400).json({ mensaje: "El usuario y el nombre son obligatorios" });
  }

  try {
    const existe = await usuarioExiste(id_usuario);

    if (!existe) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    const resultado = await pool.query(
      `INSERT INTO habitos (id_usuario, nombre, descripcion, categoria, frecuencia)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [id_usuario, nombreLimpio, descripcion, categoria, frecuencia]
    );

    // Un habito nuevo todavia no tiene cumplimientos: racha y dias en 0
    const habito = armarHabitoRespuesta({
      ...resultado.rows[0],
      racha: 0,
      dias_completados: 0
    });

    return res.status(201).json({
      mensaje: "Habito creado correctamente",
      habito
    });
  } catch (error) {
    console.error("Error al crear habito:", error);
    return res.status(500).json({ mensaje: "Error del servidor" });
  }
};

const actualizarHabito = async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, categoria, frecuencia } = req.body;
  const nombreLimpio = nombre ? nombre.trim() : "";

  if (!nombreLimpio) {
    return res.status(400).json({ mensaje: "El nombre es obligatorio" });
  }

  try {
    const existe = await habitoExiste(id);

    if (!existe) {
      return res.status(404).json({ mensaje: "Habito no encontrado" });
    }

    const resultado = await pool.query(
      `UPDATE habitos
       SET nombre = $1, descripcion = $2, categoria = $3, frecuencia = $4
       WHERE id_habito = $5
       RETURNING *`,
      [nombreLimpio, descripcion, categoria, frecuencia, id]
    );

    // Mantenemos la racha y el estado de hoy que ya tenia el habito
    const cumplimientoHoy = await pool.query(
      "SELECT completado FROM cumplimientos WHERE id_habito = $1 AND fecha = $2",
      [id, fechaHoy()]
    );
    const completado = cumplimientoHoy.rows.length > 0
      ? cumplimientoHoy.rows[0].completado
      : false;

    const { racha, diasCompletados } = await calcularRachaYDias(id);

    const habito = armarHabitoRespuesta({
      ...resultado.rows[0],
      completado,
      racha,
      dias_completados: diasCompletados
    });

    return res.status(200).json({
      mensaje: "Habito actualizado correctamente",
      habito
    });
  } catch (error) {
    console.error("Error al actualizar habito:", error);
    return res.status(500).json({ mensaje: "Error del servidor" });
  }
};

module.exports = {
  listarHabitos,
  crearHabito,
  actualizarHabito,
  alternarCumplimiento,
  eliminarHabito
};