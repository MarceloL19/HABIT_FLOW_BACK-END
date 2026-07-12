const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const usuariosRoutes = require("./routes/usuariosRoutes");
const estadisticasRoutes = require("./routes/estadisticasRoutes");
const habitosRoutes = require("./routes/habitosRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ mensaje: "Backend de HabitFlow funcionando correctamente" });
});

app.use("/api/auth", authRoutes);
app.use("/api/usuarios", usuariosRoutes);
app.use("/api/estadisticas", estadisticasRoutes);
app.use("/api/habitos", habitosRoutes);

app.listen(PORT, () => {
  console.log(`Servidor HabitFlow escuchando en el puerto ${PORT}`);
});
