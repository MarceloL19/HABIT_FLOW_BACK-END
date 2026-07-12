const { generarEstadisticasUsuario } = require("../services/estadisticasService");

const obtenerEstadisticasUsuario = async (req, res) => {
  const idUsuario = Number(req.params.idUsuario);

  if (!Number.isInteger(idUsuario)) {
    return res.status(400).json({ mensaje: "El idUsuario debe ser numerico" });
  }

  try {
    const estadisticas = await generarEstadisticasUsuario(idUsuario);

    return res.status(200).json(estadisticas);
  } catch (error) {
    console.error("Error al obtener estadisticas:", error);
    return res.status(500).json({ mensaje: "Error del servidor" });
  }
};

module.exports = {
  obtenerEstadisticasUsuario
};
