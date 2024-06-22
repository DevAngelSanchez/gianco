import express from "express";
import authRoutes from "./src/routes/authRoutes";
import { PORT } from "./src/config";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

// Middleweres
app.use(cors());
app.use(cookieParser());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);

// Server init
app.listen(PORT, () => console.log(`Servidor corriendo en el puerto: ${PORT}`))