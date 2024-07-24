"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
      <div className="absolute top-6 left-10">
        <BackButton />
      </div>
      <h1 className="text-center">Chats</h1>
      <div className="flex flex-col justify-start p-3 min-h-[70vh] items-center">
        {chats.length === 0 && (
          <div>
            <p className="text-wrap leading-3 text-center font-semibold text-base">
              No chats yet, please send message to someone so they can appear here.
            </p>
            <p className="text-wrap leading-3 text-center font-semibold text-base">Chat feature coming soon.</p>
          </div>
        )}
        {chats.length > 0 && chats.map(chat => <ChatPreview key={chat.receiver} preview={chat} />)}
      </div>
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
      <Address address={preview.receiver as `0x${string}`} />
    </div>
  );
}
