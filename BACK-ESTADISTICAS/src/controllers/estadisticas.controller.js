import { generarEstadisticasUsuario } from "../services/estadisticas.service.js";

export const obtenerEstadisticasUsuario = async (req, res) => {
  try {
    const idUsuario = Number(req.params.idUsuario);

    if (!Number.isInteger(idUsuario)) {
      return res.status(400).json({ mensaje: "El idUsuario debe ser numerico" });
    }

    const estadisticas = await generarEstadisticasUsuario(idUsuario);

    return res.json(estadisticas);
  } catch (error) {
    return res.status(500).json({
      mensaje: "Error al obtener estadisticas",
      error: error.message
    });
  }
};
