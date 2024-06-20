import { type Request, type Response } from "express";
import { createUser, findUserByEmail } from "../models/userModel";
import { Database } from "sqlite";
import { userSchema, userLoginSchema } from "../validation";
import { z } from "zod";
import bcrypt from 'bcryptjs';
import type { PrivateUser, PublicUser } from "../interfaces/User";

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

    res.status(200).json(publicUser);
    return publicUser;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(401).json({ error: error.errors });
    }
    res.status(401).json({ message: "Error al iniciar sesión" });
    return;
  }
}