"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import BackButton from "~~/components/backButton";
import { Address } from "~~/components/scaffold-eth";
import { Preview } from "~~/types/utils";

export default function ChatList() {
  const [chats, setChats] = useState<Preview[]>([]);
  const { address } = useAccount();

  useEffect(() => {
    const fetchChats = async () => {
      if (address) {
        try {
          const chats = await fetch(process.env.NEXT_PUBLIC_SOCKET_URL + "/chat/previews", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ user: address }),
          });
          if (chats.ok) {
            const res = await chats.json();
            setChats(res.previews);
          }
        } catch (e) {
          console.error(e);
        }
      }
    };
    fetchChats();
  }, [address]);

  return (
    <div className="flex flex-col relative">
      <div className="absolute top-6 left-10">
        <BackButton />
      </div>
      <h1 className="text-center mt-10 text-bold text-xl">Chats</h1>
      <div className="grid grid-cols-1 p-3 min-h-[70vh] gap-0 items-center">
        {chats.length === 0 && (
          <div>
            <p className="text-wrap leading-3 text-center font-semibold text-base">
              No chats yet, please send message to someone so they can appear here.
            </p>
            <p className="text-wrap leading-3 text-center font-semibold text-base">Chat feature coming soon.</p>
          </div>
        )}
        {chats.length > 0 && chats.map(chat => <ChatPreview key={chat.room_hash} preview={chat} />)}
      </div>
    </div>
  );
}

function ChatPreview({ preview }: { preview: Preview }) {
  const router = useRouter();
  const { address } = useAccount();
  const showee = address === preview.user1 ? preview.user2 : preview.user1;
  return (
    <div
      onClick={() => {
        router.push(`/chat/${showee}?room=${preview.room}`);
      }}
      className="block border-t border-t-slate-300 cursor-pointer border-neutral py-8"
    >
      <Address disableAddressLink={true} address={showee as `0x${string}`} />
    </div>
  );
}
