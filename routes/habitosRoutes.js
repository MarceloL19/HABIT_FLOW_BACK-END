const express = require("express");
const {
  listarHabitos,
  alternarCumplimiento,
  eliminarHabito
} = require("../controllers/habitosController");

const router = express.Router();

router.get("/:id", listarHabitos);
router.put("/:id/toggle", alternarCumplimiento);
router.delete("/:id", eliminarHabito);

module.exports = router;