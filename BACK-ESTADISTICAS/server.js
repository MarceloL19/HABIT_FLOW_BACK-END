import "dotenv/config";
import express from "express";
import cors from "cors";
import estadisticasRoutes from "./src/routes/estadisticas.routes.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173"
}));
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ mensaje: "Backend de estadisticas Habit Flow funcionando" });
});

app.use("/api/estadisticas", estadisticasRoutes);

app.listen(PORT, () => {
  console.log(`Servidor de estadisticas en http://localhost:${PORT}`);
});
