const express = require("express");
const {
  listarHabitos,
  crearHabito,
  actualizarHabito,
  alternarCumplimiento,
  eliminarHabito
} = require("../controllers/habitosController");

const router = express.Router();

router.get("/:id", listarHabitos);
router.post("/", crearHabito);
router.put("/:id", actualizarHabito);
router.put("/:id/toggle", alternarCumplimiento);
router.delete("/:id", eliminarHabito);

module.exports = router;