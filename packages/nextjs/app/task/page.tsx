"use client";

import React, { useState } from "react";
import toast from "react-hot-toast";
import { parseEther } from "viem";
import { AddressInput } from "~~/components/scaffold-eth";
import { EtherInput } from "~~/components/scaffold-eth";
import { useScaffoldWatchContractEvent, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

// import { addFileToIpfs } from "~~/services/web3/pinata";

const TaskForm = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);
  //   const [image, setImage] = useState("");
  //   const [time, setTime] = useState("");
  const [vendorAddress, setVendorAddress] = useState("");
  //   const IPFS_ENDPOINT = process.env.NEXT_PUBLIC_IPFS_ENDPOINT + "/ipfs";
  const { writeContractAsync } = useScaffoldWriteContract("LinkContract");
  //   async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
  //     const file = e.target.files?.[0];
  //     if (file) {
  //       const data = await addFileToIpfs(file);
  //       setImage(`${IPFS_ENDPOINT}/${data.IpfsHash}`);
  //     }
  //   }
  useScaffoldWatchContractEvent({
    contractName: "LinkContract",
    eventName: "TaskAdded",
    onLogs: logs => {
      logs.map(log => {
        const { vendor, name, id, price } = log.args;
        toast.success(`📡 Task ${name} with id: ${id} created and assigned to ${vendor} at ${price}ETH`);
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission logic here
    setLoading(true);
    try {
      await writeContractAsync({
        functionName: "addTask",
        args: [title, description, parseEther(price), vendorAddress],
      });
      setLoading(false);
    } catch (error: any) {
      toast.error(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col max-w-lg justify-center m-auto">
      <h1>Create Task</h1>
      <form onSubmit={handleSubmit} className="flex-col w-full p-2">
        <div className="mb-2 flex flex-col space-y-2 p-4">
          <label>Title</label>
          <input
            type="text"
            id="title"
            value={title}
            className="w-full outline-none dark:border-slate-600 border-blue-100 border-2 rounded-full bg-transparent py-2 px-8"
            onChange={e => setTitle(e.target.value)}
          />
        </div>
        <div className="mb-2 flex flex-col space-y-2 p-4">
          <label>Description</label>
          <textarea
            id="description"
            value={description}
            className="w-full outline-none dark:border-slate-600 border-blue-100 border-2 rounded-tl-lg rounded-br-lg bg-transparent py-2 px-8"
            onChange={e => setDescription(e.target.value)}
          ></textarea>
        </div>
        <div className="mb-2 flex flex-col space-y-2 p-4">
          <label htmlFor="price">Price</label>
          <EtherInput value={price} onChange={e => setPrice(e)} />
        </div>
        <div className="mb-2 flex flex-col space-y-2 p-4">
          <label htmlFor="vendorAddress">Vendor Address</label>
          <AddressInput onChange={setVendorAddress} value={vendorAddress} placeholder="Input vendor's address" />
        </div>

        {/* <label htmlFor="image">Image</label>
      <input type="file" id="image" onChange={handleImageChange} /> */}

        <button type="submit" className="btn w-full btn-success">
          {loading && <span className="loading loading-dots loading-md text-accent"></span>}
          {!loading && <span className="">Create Task</span>}
        </button>
      </form>
    </div>
  );
};

export default TaskForm;
