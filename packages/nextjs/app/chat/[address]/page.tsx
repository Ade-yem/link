"use client";

import { Dispatch, FormEvent, SetStateAction, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { Socket } from "socket.io-client";
import { v4 as uuidv4 } from "uuid";
import { useAccount } from "wagmi";
import { PaperAirplaneIcon, PaperClipIcon } from "@heroicons/react/24/outline";
import Loading from "~~/components/Loading";
import { SocketIndicator } from "~~/components/SocketIndicator";
import BackButton from "~~/components/backButton";
import { useSocket } from "~~/components/provider/socket";
import { Address } from "~~/components/scaffold-eth";
import { addFileToIpfs } from "~~/services/web3/pinata";
import { ChatMessage } from "~~/types/utils";

export default function Chat({ params }: { params: { address: string } }) {
  const { address } = useAccount();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const receiver = params.address;
  const search = useSearchParams();
  const query = search ? search.get("room")?.toLocaleLowerCase() : undefined;
  const [room_id, setRoom] = useState<string | undefined>(query);
  const socket: Socket = useSocket().socket;

  useEffect(() => {
    if (!room_id && address) {
      async function getRoom() {
        setLoading(true);
        const combineAddressesToGetRoomID = async (sender: `0x${string}`, receiver: `0x${string}`) => {
          const res = await fetch(process.env.NEXT_PUBLIC_SOCKET_URL + "/chat/getRoom", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ sender: sender, receiver: receiver }),
          });
          if (res.ok) {
            const result = await res.json();
            return result.room;
          } else {
            console.error("Unable to create room");
            return undefined;
          }
        };
        const roomID = await combineAddressesToGetRoomID(address as `0x${string}`, receiver as `0x${string}`);
        if (roomID) {
          setRoom(roomID);
          if (socket) socket.emit("join_room", { room: roomID });
        } else console.error("Unable to create room");
        setLoading(false);
      }
      getRoom();
    } else {
      if (socket && room_id) socket.emit("join_room", { room: room_id });
    }
    return () => {
      if (socket) socket.off("join_room");
    };
  }, [socket, room_id, address, receiver]);

  return (
    <div className="relative p-4" id="page">
      <ChatHeader receiver={receiver} socket={socket} />
      <Messages
        loading={loading}
        socket={socket}
        setLoading={setLoading}
        messages={messages}
        setMessages={setMessages}
        address={address as string}
      />
      <Input socket={socket} sender={address as string} receiver={receiver as string} room={room_id as string} />
    </div>
  );
}

function ChatHeader({ receiver, socket }: { receiver: string; socket: Socket }) {
  const [typing, setTyping] = useState<string>("");
  useEffect(() => {
    if (socket) {
      socket.on("typing", (data: string) => {
        setTyping(data);
      });
      return () => {
        socket.off("typing");
      };
    }
  }, [socket]);
  return (
    <div className="fixed top-20 right-0 left-0 z-20" id="header">
      <div className="flex justify-around">
        <div className="flex flex-start">
          <BackButton />
        </div>
        <div className="flex flex-start">
          <Address address={receiver as `0x${string}`} />
        </div>
        <div className="flex flex-start">{typing.length > 0 && <p className="text-xs">{typing}...</p>}</div>
        <div className="flex flex-end">
          <SocketIndicator />
        </div>
      </div>
    </div>
  );
}

function Messages({
  messages,
  loading,
  socket,
  setLoading,
  setMessages,
  address,
}: {
  socket: Socket;
  messages: ChatMessage[];
  loading: boolean;
  setLoading: Dispatch<SetStateAction<boolean>>;
  setMessages: Dispatch<SetStateAction<ChatMessage[]>>;
  address: string;
}) {
  useEffect(() => {
    if (socket) {
      socket.on("message", message => {
        setMessages((prev: ChatMessage[]) => [...prev, message]);
      });
      socket.on("history", (messages: ChatMessage[]) => {
        setLoading(true);
        setMessages(messages);
        setLoading(false);
      });
      return () => {
        socket.off("message");
        socket.off("history");
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket]);
  const messagesColumnRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesColumnRef.current) {
      messagesColumnRef.current.scrollTop = messagesColumnRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="container overflow-y-auto mt-20 grid grid-cols-1 mx-auto" id="chats" ref={messagesColumnRef}>
      {loading && <Loading />}
      {messages.length === 0 && !loading && (
        <div className="flex justify-center h-fit place-items-center">{"Nothing here yet!"}</div>
      )}
      {messages.length > 0 &&
        messages.map((message, index) => <Message key={index} message={message} owner={address as string} />)}
    </div>
  );
}

function Message({ message, owner }: { message: ChatMessage; owner: string }) {
  const convertTimeStampToDate = (timestamp: Date) => {
    const date = new Date(timestamp);
    return `${date.getDate()}/${date.getMonth()}/${date.getFullYear()} - ${date.getHours()}:${date.getMinutes()}`;
  };

  return (
    <div
      className={`${"card space-y-2 w-[80%] max-w-80 shadowxs m-1 p-3"} ${
        owner === message.sender
          ? "place-self-end bg-success dark:bg-secondary"
          : "dark:bg-success bg-secondary place-self-start"
      }`}
      id="chat"
    >
      {message.imageURI && message.imageURI.length > 0 && (
        <figure>
          <Image src={message.imageURI ?? ""} alt={"Image"} className="rounded-full w-40 h-40 m-2" />
        </figure>
      )}
      <p className="text-base leading-snug">{message.message}</p>
      <span className="text-xs">{message.timestamp && convertTimeStampToDate(message.timestamp)}</span>
    </div>
  );
}

function Input({ sender, receiver, room, socket }: { sender: string; receiver: string; room: string; socket: Socket }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);
  const [image, setFile] = useState<string>("");

  const handleClick = () => fileRef.current?.click();
  const IPFS_ENDPOINT = process.env.NEXT_PUBLIC_IPFS_ENDPOINT;
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      setLoading(true);
      const allowedExtensions = ["jpg", "jpeg", "png", "gif"];
      const fileExtension = file.name.split(".").pop()?.toLowerCase();
      if (fileExtension && allowedExtensions.includes(fileExtension)) {
        const data = await addFileToIpfs(file);
        setFile(`${IPFS_ENDPOINT}/${data.IpfsHash}`);
      } else {
        toast.error("Invalid file format. Only image files are allowed.");
      }
      setLoading(false);
    } else {
      setFile("");
      setLoading(false);
    }
    setLoading(false);
  };
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitLoading(true);
    const formData = new FormData(e.currentTarget);
    const message = formData.get("message") as string;
    // Handle form submission with the message data
    const chat: ChatMessage = {
      id: uuidv4(),
      sender: sender,
      receiver: receiver,
      message: message,
      imageURI: image,
      room: room,
    };
    socket.emit("send_message", chat);
    setFile("");
    // clear form
    e.currentTarget.reset();
    setSubmitLoading(false);
  };
  return (
    <div className="flex justify-center" id="input">
      <form onSubmit={e => handleSubmit(e)} className="flex justify-center flex-col space-x-2">
        {image.length > 1 && <Image src={image} alt="image" height={80} width={80} className="z-50" />}
        <input type="file" ref={fileRef} onChange={handleFileChange} className="hidden" />
        <div className="flex justify-center space-x-2">
          <label className="input input-bordered flex items-center gap-2">
            {loading && <span className="label-text-alt loading loading-dots loading-md text-accent"></span>}
            <input
              type="text"
              name="message"
              onChange={() => {
                if (socket) socket.emit("typing", { room, sender });
              }}
              className="grow"
              placeholder="Write something..."
            />
            <div onClick={handleClick}>
              <PaperClipIcon className="w-6 h-6" />
            </div>
          </label>
          <button type="submit" className="btn btn-ghost btn-md">
            {submitLoading && <span className="loading loading-spinner loading-md text-accent"></span>}
            {!submitLoading && <PaperAirplaneIcon className="w-6 h-6" />}
          </button>
        </div>
      </form>
    </div>
  );
}
