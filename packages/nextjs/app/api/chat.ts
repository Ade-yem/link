// import { NextApiRequest, NextApiResponse } from "next";
import { Server } from "socket.io";

export default async function handler(req: any, res: any) {
  if (!res.socket.server.io) {
    const io = new Server(res.socket.server);
    io.on("connection", socket => {
      console.log("Client connected");

      socket.on("message", data => {
        console.log("Message received:", data);
        io.emit("message", data); // Broadcast the message to all connected clients
      });

      socket.on("disconnect", () => {
        console.log("Client disconnected");
      });
    });
    res.socket.server.io = io;
  }

  res.end();
}
