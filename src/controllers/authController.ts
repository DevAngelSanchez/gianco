import { type Request, type Response } from "express";
import { createUser, findUserByEmail } from "../models/userModel";
import { Database } from "sqlite";
import { userSchema, userLoginSchema } from "../validation";
import { z } from "zod";
import bcrypt from 'bcryptjs';
import type { PrivateUser, PublicUser } from "../interfaces/User";
import jwt from "jsonwebtoken";
import { JWT_SECRET, NODE_ENV } from "../config";

export const register = (db: Database) => async (req: Request, res: Response) => {
  try {
    const parsedData = userSchema.parse(req.body);
    const { email, username, password } = parsedData;
    await createUser(db, email, username, password);
    res.status(201).json({ message: "Usario registrado correctamente" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(400).json({ message: "Error al registrar el usuario" })
  }
}

export const login = (db: Database) => async (req: Request, res: Response) => {
  const parsedData = userLoginSchema.parse(req.body);
  const { email, password } = parsedData;
  try {
    const privateUser: PrivateUser = await findUserByEmail(db, email);

    if (!privateUser) throw new Error("El usuario no existe.");

    const isValid = await bcrypt.compare(password, privateUser.password);
    if (!isValid) throw new Error("Contraseña incorrecta.");

    const publicUser: PublicUser = {
      id: privateUser.id,
      email: privateUser.email,
      username: privateUser.username
    };

    const token = jwt.sign({ id: publicUser.id, username: publicUser.username, email: publicUser.email }, JWT_SECRET, { expiresIn: "1h" });

    res.status(200)
      .cookie("access_token", token, {
        httpOnly: true, // la cookie solo se puede acceder desde el servidor
        secure: NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 1000 * 60 * 60
      })
      .json({ publicUser, token });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(401).json({ error: error.errors });
    }
    res.status(401).json({ message: "Error al iniciar sesión" });
    return;
  }
}

export const proteted = (db: Database) => async (req: Request, res: Response) => {
  const token = req.cookies.access_token;
  if (!token) {
    return res.status(403).json({ message: "Acceso no autorizado" });
  }

  try {
    const data = jwt.verify(token, JWT_SECRET);
    res.send(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(401).json({ error: error.errors });
    }
    res.status(401).json({ message: "Hubo un error al obtener acceso" });
    return;
  }
}