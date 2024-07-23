"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { parseEther } from "viem";
import { useWalletClient } from "wagmi";
import { AddressInput } from "~~/components/scaffold-eth";
import { EtherInput } from "~~/components/scaffold-eth";
import { useScaffoldContract, useScaffoldWatchContractEvent } from "~~/hooks/scaffold-eth";

const TaskForm = ({ params }: { params: { vendor: string } }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [vendorAddress, setVendorAddress] = useState(params.vendor || "");
  const router = useRouter();
  useScaffoldWatchContractEvent({
    contractName: "LinkContract",
    eventName: "TaskAdded",
    onLogs: logs => {
      logs.map(log => {
        const { name } = log.args;
        toast.success(`📡 Task ${name} created`);
      });
    },
  });

  const { data: walletClient } = useWalletClient();
  const { data: Contract } = useScaffoldContract({
    contractName: "LinkContract",
    walletClient,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission logic here
    setLoading(true);
    try {
      await Contract?.write.addTask([title, description, parseEther(price), vendorAddress as `0x${string}`]);
      setLoading(false);
      router.push("/profile");
    } catch (error: any) {
      toast.error(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-4xl justify-center m-auto md:border-2 md:dark:border-slate-500 rounded-md p-4">
      <h1 className="text-4xl text-center text-slate-600 dark:text-slate-400">Create Task</h1>
      <form onSubmit={handleSubmit} className="w-full p-2">
        <div className="md:flex w-full">
          {/*Title and Description */}
          <div className="w-full">
            <div className="mb-2 flex flex-col space-y-2 p-4">
              <label>Title</label>
              <input
                type="text"
                id="title"
                value={title}
                className="flex border-2 border-slate-600 px-1 py-3.5 bg-base-200 rounded-full text-accent"
                onChange={e => setTitle(e.target.value)}
              />
            </div>
            <div className="mb-2 flex flex-col space-y-2 p-4">
              <label>Description</label>
              <textarea
                id="description"
                value={description}
                className="w-full outline-none dark:border-slate-600 border-slate-600 border-2 rounded-tl-lg rounded-br-lg bg-transparent py-2 px-8 text-slate-400"
                onChange={e => setDescription(e.target.value)}
              ></textarea>
            </div>
          </div>

          {/*Price and Vendor address */}
          <div className="w-full">
            <div className="mb-2 flex flex-col space-y-2 p-4">
              <label htmlFor="price">Price</label>
              <EtherInput value={price} onChange={e => setPrice(e)} />
            </div>
            <div className="mb-2 flex flex-col space-y-2 p-4">
              <label htmlFor="vendorAddress">Vendor Address</label>
              <AddressInput onChange={setVendorAddress} value={vendorAddress} placeholder="Input vendor's address" />
            </div>
          </div>
        </div>

        <div className="w-full grid items-center mt-8">
          <button type="submit" className="btn w-full max-w-lg mx-auto px-8 btn-success">
            {loading && <span className="loading loading-dots loading-md text-accent"></span>}
            {!loading && <span className="text-xl">Create Task</span>}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaskForm;
