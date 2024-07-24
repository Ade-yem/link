"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { useAccount } from "wagmi";
import { PaperAirplaneIcon, PaperClipIcon } from "@heroicons/react/24/outline";
import Loading from "~~/components/Loading";
import { SocketIndicator } from "~~/components/SocketIndicator";
import BackButton from "~~/components/backButton";
import { useSocket } from "~~/components/provider/socket";
import { Address } from "~~/components/scaffold-eth";
import { createPreview, getRoomFromPreview } from "~~/lib/db";
import { addFileToIpfs } from "~~/services/web3/pinata";
import { ChatMessage } from "~~/types/utils";

export default function Chat({ params }: { params: { address: string } }) {
  const { address } = useAccount();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const receiver = params.address;
  const [room, setRoom] = useState<string | undefined>(undefined);
  const { socket } = useSocket();

  useEffect(() => {
    setLoading(true);
    if (!room) {
      async function getRoom() {
        const res = await getRoomFromPreview(address as string, receiver as string);
        if (!res) {
          createPreview(address as string, receiver as string);
          const newRoom = await getRoomFromPreview(address as string, receiver as string);
          if (socket) socket.emit("join_room", { sender: address, receiver: receiver, room: newRoom });
          setRoom(newRoom);
          return;
        }
        if (socket) socket.emit("join_room", { sender: address, receiver: receiver, room: res });
        setRoom(res);
      }
      getRoom();
    }
    if (socket) {
      socket.on("message", (data: any) => {
        setMessages(prev => [...prev, data]);
      });
      socket.on("received_message", (data: ChatMessage) => {
        setMessages(prev => [...prev, data]);
      });
      setLoading(false);
    }
  }, [socket, receiver, address, room]);

  const submit = async (data: ChatMessage) => {
    if (socket) socket.emit("send_message", { data, room });
  };

  return (
    <div className="relative">
      <ChatHeader receiver={receiver} />
      <div className="container mt-20 min-h-[60vh] flex flex-col items-center justify-center mx-auto" id="chats">
        {messages.length === 0 && loading && <Loading />}
        {messages.length === 0 && !loading && "Nothing here yet!"}
        {messages.length > 0 &&
          messages.map((message, index) => <Message key={index} message={message} owner={address as string} />)}
      </div>
      <Input sender={address as string} receiver={receiver as string} submit={submit} />
    </div>
  );
}

function ChatHeader({ receiver }: { receiver: string }) {
  return (
    <div className="absolute top-4 right-0 left-0">
      <div className="flex justify-around">
        <div className="flex flex-start">
          <BackButton />
        </div>
        <div className="flex flex-start">
          <Address address={receiver as `0x${string}`} />
        </div>
        <div className="flex flex-end">
          <SocketIndicator />
        </div>
      </div>
    </div>
  );
}

function Message({ message, owner }: { message: ChatMessage; owner: string }) {
  return (
    <div
      className={`${"card max-w-40 shadow-xl p-3"} ${
        owner === message.sender ? "flex-start bg-success dark:bg-secondary" : "dark:bg-success bg-secondary flex-end"
      }`}
    >
      <figure>
        <Image src={message.imageURI ?? ""} alt={"Image"} className="rounded-full w-40 h-40 m-2" />
      </figure>
      <div className="card-body">
        <p className="text-base leading-snug">{message.message}</p>
      </div>
    </div>
  );
}

function Input({
  sender,
  receiver,
  submit,
}: {
  sender: string;
  receiver: string;
  submit: (message: ChatMessage) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState<boolean>(false);
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
    const formData = new FormData(e.currentTarget);
    const message = formData.get("message") as string;
    // Handle form submission with the message data
    const chat: ChatMessage = {
      sender: sender,
      receiver: receiver,
      message: message,
      imageURI: image,
    };
    submit(chat);
    setFile("");
  };
  return (
    <div className="fixed bottom-20 right-0 left-0 flex justify-center">
      <form onSubmit={e => handleSubmit(e)} className="flex justify-center flex-col space-x-2">
        {image.length > 1 && <Image src={image} alt="image" height={80} width={80} className="z-50" />}
        <input type="file" ref={fileRef} onChange={handleFileChange} className="hidden" />
        <div className="flex justify-center space-x-2">
          <label className="input input-bordered flex items-center gap-2">
            {loading && <span className="label-text-alt loading loading-dots loading-md text-accent"></span>}
            <input type="text" name="message" className="grow" placeholder="Write something..." />
            <div onClick={handleClick}>
              <PaperClipIcon className="w-6 h-6" />
            </div>
          </label>
          <button type="submit" className="btn btn-ghost btn-md">
            <PaperAirplaneIcon className="w-6 h-6" />
          </button>
        </div>
      </form>
    </div>
  );
}
