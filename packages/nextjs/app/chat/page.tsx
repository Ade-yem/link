"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import io from "socket.io-client";
import { useAccount } from "wagmi";
import BackButton from "~~/components/backButton";
import { Address } from "~~/components/scaffold-eth";
import { getPreview } from "~~/lib/db";
import { Preview } from "~~/types/utils";

export default function ChatList() {
  const [chats, setChats] = useState<Preview[]>([]);
  const { address } = useAccount();

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const chats = await getPreview(address as string);
        if (chats) setChats(chats);
      } catch (e) {
        console.error(e);
      }
    };
    fetchChats();
  }, [address]);

  return (
    <div className="flex flex-col relative">
      <BackButton />
      <h1>Chats</h1>
      {chats.map(chat => (
        <ChatPreview key={chat.receiver} preview={chat} />
      ))}
    </div>
  );
}

function ChatPreview({ preview }: { preview: Preview }) {
  const router = useRouter();
  const socket = io();
  const { address } = useAccount();

  return (
    <div
      onClick={() => {
        socket.emit("join_room", {
          sender: address,
          receiver: preview.receiver,
          room: preview.room,
        });
        router.push(`/chat/${preview.receiver}/${preview.room}`);
      }}
      className="flex flex-col border border-neutral gap-2 p-3"
    >
      {/* @ts-ignore */}
      <Address address={preview.receiver} />
    </div>
  );
}
