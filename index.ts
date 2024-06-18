import express, { type Request, type Response } from "express";
import authRoutes from "./src/routes/authRoutes";
import { PORT } from "./src/config";

const app = express();

// Middleweres
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);

// Server init
app.listen(PORT, () => console.log(`Servidor corriendo en el puerto: ${PORT}`))