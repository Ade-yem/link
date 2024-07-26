"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { v4 as uuidv4 } from "uuid";
import { useAccount } from "wagmi";
import { PaperAirplaneIcon, PaperClipIcon } from "@heroicons/react/24/outline";
import Loading from "~~/components/Loading";
import BackButton from "~~/components/backButton";
import { Address } from "~~/components/scaffold-eth";
import { useScaffoldContract, useScaffoldWatchContractEvent, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { createPreview } from "~~/lib/db";
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

  const { writeContractAsync: writeChatContractAsync } = useScaffoldWriteContract("ChatContract");
  const { data: Contract } = useScaffoldContract({
    contractName: "ChatContract",
  });

  useEffect(() => {
    setLoading(true);
    if (!room_id) {
      async function getRoom() {
        const combineAddressesToGetRoomID = async (sender: `0x${string}`, receiver: `0x${string}`) => {
          const res = await Contract?.read.getRoomIDByAddress([sender, receiver]);
          if (!res || res.length === 0) {
            const res = await Contract?.read.getRoomIDByAddress([receiver, sender]);
            if (!res || res.length === 0) {
              const room = uuidv4();
              await writeChatContractAsync({
                functionName: "createRoom",
                args: [sender, receiver, room],
              });
              return await Contract?.read.getRoomIDByAddress([sender, receiver]);
            }
            return res;
          }
          return res;
        };
        const roomID = await combineAddressesToGetRoomID(address as `0x${string}`, receiver as `0x${string}`);
        if (roomID) {
          setRoom(roomID);
          await createPreview(address as string, receiver, roomID as string);
        } else console.error("Unable to create room");
      }
      getRoom();
    }
    async function getChats() {
      if (room_id) {
        const roomMessages = await Contract?.read.getRoomMessages([room_id]);
        if (roomMessages) {
          const uniqueMessages: { [id: string]: ChatMessage } = {};
          roomMessages.forEach((message: ChatMessage) => {
            uniqueMessages[message.id] = message;
          });
          setMessages(Object.values(uniqueMessages));
        }
      }
    }
    getChats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room_id, address, receiver]);

  useEffect(() => console.log("room id => ", room_id), [room_id]);

  useScaffoldWatchContractEvent({
    contractName: "ChatContract",
    eventName: "ChatCreated",
    onLogs: logs => {
      logs.map(log => {
        const { id, sender, receiver, message, imageURI, createdAt, room } = log.args;
        if (room === room_id) {
          const messageExists = messages.some(message => message.id === id);
          if (!messageExists) {
            const newMessage: ChatMessage = {
              id: id as string,
              sender: sender as string,
              receiver: receiver as string,
              message: message as string,
              imageURI: imageURI as string,
              createdAt: createdAt,
            };
            setMessages(prev => [...prev, newMessage]);
          }
        }
      });
    },
  });

  const submit = async (data: ChatMessage) => {
    await writeChatContractAsync({
      functionName: "createChat",
      args: [
        data.id,
        data.sender as `0x${string}`,
        data.receiver as `0x${string}`,
        data.message,
        data.imageURI,
        room_id,
      ],
    });
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
      </div>
    </div>
  );
}

function Message({ message, owner }: { message: ChatMessage; owner: string }) {
  const convertTimeStampToDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp));
    return `${date.getDate()}/${date.getMonth()}/${date.getFullYear()} - ${date.getHours()}:${date.getMinutes()}`;
  };

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
      <span className="text-xs">{message.createdAt && convertTimeStampToDate(message.createdAt)}</span>
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
    };
    await submit(chat);
    setFile("");
    formData.delete("message");
    setSubmitLoading(false);
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
            {submitLoading && <span className="loading loading-spinner loading-md text-accent"></span>}
            {!submitLoading && <PaperAirplaneIcon className="w-6 h-6" />}
          </button>
        </div>
      </form>
    </div>
  );
}
