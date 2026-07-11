const express = require("express");
const {
  obtenerPerfil,
  actualizarPerfil,
  actualizarPreferencias
} = require("../controllers/usuariosController");

const router = express.Router();

router.get("/:id", obtenerPerfil);
router.put("/:id", actualizarPerfil);
router.put("/:id/preferencias", actualizarPreferencias);

module.exports = router;
