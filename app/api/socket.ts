import type { NextApiRequest } from "next";
import jwt from "jsonwebtoken";
import { Server as IOServer } from "socket.io";
import type { NextApiResponseWithSocket } from "@/types";

export default function handler(req: NextApiRequest, res: NextApiResponseWithSocket) {
  if (!res.socket.server.io) {
    const io = new IOServer(res.socket.server as any, {
      path: "/api/socketio",
    });

    io.use((socket, next) => {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("No token provided"));
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!);
        (socket as any).user = decoded;
        next();
      } catch {
        next(new Error("Invalid token"));
      }
    });

    io.on("connection", (socket) => {
      socket.on("joinHospital", (hospitalId: string) => {
        socket.join(`hospital_${hospitalId}`);
      });

      socket.on("leaveHospital", (hospitalId: string) => {
        socket.leave(`hospital_${hospitalId}`);
      });

      socket.on("disconnect", () => {});
    });

    (res.socket.server as any).io = io;
  }

  res.end();
}
