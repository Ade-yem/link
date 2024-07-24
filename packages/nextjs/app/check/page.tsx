"use client";

import { SocketIndicator } from "~~/components/SocketIndicator";
import { useSocket } from "~~/components/provider/socket";

export default function CheckChat() {
  const { socket } = useSocket();
  console.log(socket);
  return (
    <div>
      <SocketIndicator />
    </div>
  );
}
