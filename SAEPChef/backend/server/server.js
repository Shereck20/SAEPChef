const express = require("express");
const path = require("path");
const cors = require("cors");
require("dotenv").config();

const usuariosRoutes = require("../routes/usuarios_routes");
const receitasRoutes = require("../routes/receitas_routes");
const favoritosRoutes = require("../routes/favoritos_routes");

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.get("/api", (req, res) => {
    res.json({
        nome: "SAEPChef",
        status: "online"
    });
});

app.use("/api/usuarios", usuariosRoutes);
app.use("/api/receitas", receitasRoutes);
app.use("/api/favoritos", favoritosRoutes);

app.use(express.static(path.join(__dirname, "../../frontend")));

app.use((req, res) => {
    res.sendFile(path.join(__dirname, "../../frontend/index.html"));
});

const PORT = Number(process.env.PORT || 3000);

app.listen(PORT, () => {
    console.log(`SAEPChef rodando em http://localhost:${PORT}`);
});
