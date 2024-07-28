"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAccount } from "wagmi";
import {
  useScaffoldReadContract,
  useScaffoldWatchContractEvent,
  useScaffoldWriteContract,
} from "~~/hooks/scaffold-eth";
import { addFileToIpfs } from "~~/services/web3/pinata";
import { Profile } from "~~/types/utils";

const RegisterPage: React.FC = () => {
  const [name, setName] = useState("");
  const [picture, setPicture] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [service, setService] = useState("");
  const [role, setRole] = useState<"customer" | "vendor" | undefined>(undefined);
  const [email, setEmail] = useState("");
  const [file1, setFile1] = useState("");
  const [file2, setFile2] = useState("");
  const [file3, setFile3] = useState("");
  const [loadingPicture, setLoadingPicture] = useState(false);
  const [loadingFile1, setLoadingFile1] = useState(false);
  const [loadingFile2, setLoadingFile2] = useState(false);
  const [loadingFile3, setLoadingFile3] = useState(false);
  const [loading, setLoading] = useState(false);
  const { writeContractAsync } = useScaffoldWriteContract("LinkContract");
  const { address: connectedAddress } = useAccount();
  const IPFS_ENDPOINT = process.env.NEXT_PUBLIC_IPFS_ENDPOINT + "/ipfs";
  const router = useRouter();
  const handlePictureChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLoadingPicture(true);
      const data = await addFileToIpfs(file);
      setPicture(`${IPFS_ENDPOINT}/${data.IpfsHash}`);
      setLoadingPicture(false);
    } else {
      setPicture("");
      setLoadingPicture(false);
    }
  };

  const handleFile1Change = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLoadingFile1(true);
      const data = await addFileToIpfs(file);
      setFile1(`${IPFS_ENDPOINT}/${data.IpfsHash}`);
      setLoadingFile1(false);
    } else {
      setFile1("");
      setLoadingFile1(false);
    }
  };

  const handleFile2Change = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLoadingFile2(true);
      const data = await addFileToIpfs(file);
      setFile2(`${IPFS_ENDPOINT}/${data.IpfsHash}`);
      setLoadingFile2(false);
    } else {
      setFile2("");
      setLoadingFile2(false);
    }
  };

  const handleFile3Change = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLoadingFile3(true);
      const data = await addFileToIpfs(file);
      setFile3(`${IPFS_ENDPOINT}/${data.IpfsHash}`);
      setLoadingFile3(false);
    } else {
      setFile3("");
      setLoadingFile3(false);
    }
  };

  const { data: isCustomer } = useScaffoldReadContract({
    contractName: "LinkContract",
    functionName: "customer_C",
    args: [connectedAddress],
  });
  const { data: isVendor } = useScaffoldReadContract({
    contractName: "LinkContract",
    functionName: "vendor_C",
    args: [connectedAddress],
  });

  useEffect(() => {
    if (isCustomer || isVendor) {
      setLoading(false);
      toast.error("This account has been registered");
      // router.replace("/profile");
      return;
    }
  }, [isCustomer, isVendor, router]);

  useScaffoldWatchContractEvent({
    contractName: "LinkContract",
    eventName: role === "vendor" ? "VendorRegistered" : "CustomerRegistered",
    onLogs: logs => {
      logs.map(log => {
        const { vendor } = log.args;
        toast.success("Welcome " + vendor);
      });
    },
  });

  const handleSubmit = async (event: React.FormEvent) => {
    setLoading(true);
    event.preventDefault();
    // Handle form submission logic here
    const formData: Profile = {
      name: name,
      email: email,
      phoneNumber: phoneNumber,
      address: address,
      role: role,
      picture: "",
      service: "",
      file1: "",
      file2: "",
      file3: "",
      walletAddress: connectedAddress as string,
    };
    if (picture) {
      formData.picture = picture;
    }
    if (role === "vendor") {
      formData.service = service;
      formData.file1 = file1;
      formData.file2 = file2;
      formData.file3 = file3;
    }
    try {
      if (role === "vendor") {
        await writeContractAsync({
          functionName: "RegisterVendor",
          args: [name, email, phoneNumber, address, role, picture, service, file1, file2, file3],
        });
      } else {
        await writeContractAsync({
          functionName: "RegisterCustomer",
          args: [name, email, phoneNumber, address, role, picture],
        });
      }
      setLoading(false);
      router.replace("/profile");
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  return (
    <div className="m-2 p-4">
      <h1 className="text-3xl font-bold text-center">Register</h1>
      <form onSubmit={handleSubmit} className="flex flex-col justify-center mx-auto space-y-4 max-w-md">
        <label className="form-control w-full max-w-lg">
          <div className="label">
            <span className="label-text">What is your name?</span>
          </div>
          <input
            type="text"
            name="name"
            value={name}
            onChange={e => setName(e.target.value)}
            className="input input-bordered input-accent w-full max-w-lg"
          />
        </label>
        <label className="form-control w-full max-w-lg">
          <div className="label">
            <span className="label-text">What is your email?</span>
          </div>
          <input
            type="email"
            name="email"
            placeholder="name@link.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="input input-bordered input-accent w-full max-w-lg"
          />
        </label>

        <label className="form-control w-full max-w-lg">
          <div className="label">
            <span className="label-text">Your phone number</span>
          </div>
          <input
            type="text"
            name="phoneNumber"
            value={phoneNumber}
            onChange={e => setPhoneNumber(e.target.value)}
            className="input input-bordered input-accent w-full max-w-lg"
          />
        </label>

        <label className="form-control w-full max-w-lg">
          <div className="label">
            <span className="label-text">Home address</span>
          </div>
          <input
            type="text"
            name="address"
            value={address}
            onChange={e => setAddress(e.target.value)}
            className="input input-bordered input-accent w-full max-w-lg"
          />
        </label>

        <select
          className="select select-accent w-full max-w-lg"
          name="role"
          value={role}
          onChange={e => setRole(e.target.value as "vendor" | "customer" | undefined)}
        >
          <option defaultValue={""}>vendor or customer?</option>
          <option>vendor</option>
          <option>customer</option>
        </select>
        <label className="form-control w-full max-w-lg">
          <div className="label">
            <span className="label-text">Your Picture?</span>
            {loadingPicture && <span className="label-text-alt loading loading-dots loading-md text-accent"></span>}
          </div>
          <input
            type="file"
            onChange={handlePictureChange}
            className="file-input file-input-bordered file-input-success w-full max-w-lg"
          />
          <div className="label">
            <span className="label-text-alt">
              {picture && <Image src={picture} alt={""} width={100} height={100} />}
            </span>
          </div>
        </label>

        {role === "vendor" && (
          <div className="-mx-3 mb-6">
            <label className="form-control mb-2 w-full max-w-lg">
              <div className="label">
                <span className="label-text">Services (make them comma delimited)</span>
              </div>
              <input
                type="text"
                value={service}
                onChange={e => setService(e.target.value)}
                className="input input-bordered input-accent w-full max-w-lg"
              />
            </label>
            <h3 className="mb-2">Insert three of your best works</h3>
            <div className="flex flex-col gap-2">
              <label className="form-control w-full max-w-lg">
                <div className="label">
                  {loadingFile1 && <span className="label-text-alt loading loading-dots loading-md text-accent"></span>}
                </div>
                <input
                  type="file"
                  onChange={handleFile1Change}
                  className="file-input file-input-bordered file-input-success w-full max-w-lg"
                />
                <div className="label">
                  <span className="label-text-alt">
                    {file1.length > 1 && <Image src={file1} alt={""} width={100} height={100} />}
                  </span>
                </div>
              </label>
              <label className="form-control w-full max-w-lg">
                <div className="label">
                  {loadingFile2 && <span className="label-text-alt loading loading-dots loading-md text-accent"></span>}
                </div>
                <input
                  type="file"
                  onChange={handleFile2Change}
                  className="file-input file-input-bordered file-input-success w-full max-w-lg"
                />
                <div className="label">
                  <span className="label-text-alt">
                    {file2.length > 1 && <Image src={file2} alt={""} width={100} height={100} />}
                  </span>
                </div>
              </label>
              <label className="form-control w-full max-w-lg">
                <div className="label">
                  {loadingFile3 && <span className="label-text-alt loading loading-dots loading-md text-accent"></span>}
                </div>
                <input
                  type="file"
                  onChange={handleFile3Change}
                  className="file-input file-input-bordered file-input-success w-full max-w-lg"
                />
                <div className="label">
                  <span className="label-text-alt">
                    {file3.length > 1 && <Image src={file3} alt={""} width={100} height={100} />}
                  </span>
                </div>
              </label>
            </div>
          </div>
        )}
        <button type="submit" className="btn btn-success w-full max-w-lg">
          {loading && <span className="label-text-alt loading loading-dots loading-md text-accent"></span>}
          {!loading && "Submit"}
        </button>
      </form>
    </div>
  );
};

export default RegisterPage;
