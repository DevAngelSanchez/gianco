import express from "express";
import { InicializeDb } from "../database";
import { login, register } from "../controllers/authController";

const router = express.Router();

InicializeDb().then(db => {
  router.post("/register", register(db));
  router.post("/login", login(db));
});

export default router;