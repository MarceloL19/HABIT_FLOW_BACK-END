import express from "express";
import { obtenerEstadisticasUsuario } from "../controllers/estadisticas.controller.js";

const router = express.Router();

router.get("/:idUsuario", obtenerEstadisticasUsuario);

export default router;
