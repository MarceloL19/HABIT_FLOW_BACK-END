const express = require("express");
const {
  listarHabitos,
  crearHabito,
  actualizarHabito,
  eliminarHabito,
  marcarCumplimiento
} = require("../controllers/habitosController");

const router = express.Router();

router.get("/:idUsuario", listarHabitos);
router.post("/", crearHabito);
router.put("/:id", actualizarHabito);
router.delete("/:id", eliminarHabito);
router.post("/:id/cumplir", marcarCumplimiento);

module.exports = router;
