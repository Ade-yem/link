"use client";

import { useSocket } from "./provider/socket";

export const SocketIndicator = () => {
  const { isConnected } = useSocket();
  if (!isConnected) {
    return <div className="text-white badge badge-lg badge-warning py-2">Connecting...</div>;
  }
  return <div className="badge text-white badge-lg badge-success py-2">Live chat</div>;
};
