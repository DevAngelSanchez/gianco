import { z } from "zod";

export const userSchema = z.object({
  email: z.string().trim().email(),
  username: z.string().min(3),
  password: z.string().trim().min(6)
});

export const userLoginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().trim().min(6)
});

export type UserSchema = z.infer<typeof userSchema>;