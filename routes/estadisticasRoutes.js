const express = require("express");
const { obtenerEstadisticasUsuario } = require("../controllers/estadisticasController");

const router = express.Router();

router.get("/:idUsuario", obtenerEstadisticasUsuario);

module.exports = router;
