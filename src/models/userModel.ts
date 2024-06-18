import { Database } from "sqlite";
import bcrypt from "bcryptjs"

export const createUser = async (db: Database, email: string, username: string, password: string) => {

  const hashedPass = await bcrypt.hash(password, 10);
  const result = await db.run(
    `INSERT INTO users (email, username, password) VALUES (?, ?, ?)`,
    email,
    username,
    hashedPass
  );

  return result;
}

export const findUserByEmail = async (db: Database, email: string) => {
  const user = await db.get("SELECT * FROM users WHERE email = ?", email);
  return user;
}