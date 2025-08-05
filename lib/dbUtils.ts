import { db } from "@/lib/database/db";
import { users, hospitals, sessions } from "@/lib/database/schema";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "@/lib/config";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export const dbUtils = {
  authenticateUser: async (email: string, password: string) => {
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (!user) return null;

    const valid = await bcrypt.compare(password, user.password);
    return valid ? user : null;
  },

  getSessionByToken: async (token: string) => {
    const [session] = await db.select().from(sessions).where(eq(sessions.token, token)).limit(1);
    return session || null;
  },

  deleteSession: async (token: string) => {
    await db.delete(sessions).where(eq(sessions.token, token));
  },

  createSession: async (userId: string) => {
    const token = jwt.sign({ userId }, config.auth.jwtSecret, { expiresIn: "24h" });
    const expiresAt = new Date(Date.now() + config.auth.sessionDuration);

    await db.insert(sessions).values({ id: uuidv4(), userId, token, expiresAt });
    return { token, expiresAt };
  },

  getHospitalById: async (id: string) => {
    const [hospital] = await db.select().from(hospitals).where(eq(hospitals.id, id)).limit(1);
    return hospital || null;
  },

  getAllHospitals: async () => {
    return await db.select().from(hospitals);
  }
};
