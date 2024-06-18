import { type Request, type Response } from "express";
import { createUser, findUserByEmail } from "../models/userModel";
import { Database } from "sqlite";
import { userSchema, userLoginSchema } from "../validation";
import { z } from "zod";
import bcrypt from 'bcryptjs';

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
    const user = await findUserByEmail(db, email);
    if (!user) throw new Error("El usuario no existe.");

    const isValid = bcrypt.compare(password, user.password);
    if (!isValid) throw new Error("Contraseña incorrecta.");

    res.status(200).json(user);
    return user;

  } catch (error) {

  }
}