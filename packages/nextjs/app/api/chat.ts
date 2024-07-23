import { Server } from "socket.io";
import { addMessageTo, getMessages } from "~~/lib/db";

export default async function handler(req: any, res: any) {
  if (!res.socket.server.io) {
    const io = new Server(res.socket.server);
    io.on("connection", socket => {
      console.log("Client connected");
      socket.on("join_room", data => {
        const { sender, receiver, room } = data;
        socket.join(room);
        const messages = getMessages(sender, receiver);
        socket.to(room).emit("messages", messages);
      });

      socket.on("send_message", data => {
        const { chat, room } = data;
        addMessageTo(chat.sender, chat);
        io.in(room).emit("received_message", chat);
      });

      socket.on("disconnect", () => {
        console.log("Client disconnected");
      });
    });
    res.socket.server.io = io;
  }

  res.end();
}
