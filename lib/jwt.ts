import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret"; // Replace in prod

export function verifyJwt(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as { role?: string; [key: string]: any };
  } catch (e) {
    return null;
  }
}
