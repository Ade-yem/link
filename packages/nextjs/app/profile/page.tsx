"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useAccount } from "wagmi";
import Loading from "~~/components/Loading";
import BackButton from "~~/components/backButton";
import { Address } from "~~/components/scaffold-eth";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { getDetailsFromIPFS } from "~~/services/web3/pinata";
import { Profile, Vendor } from "~~/types/utils";

export default function ProfilePage() {
  const [result, setResult] = useState<Profile>({
    name: "",
    email: "",
    phone: "",
    address: "",
    role: "vendor",
    picture: "",
    walletAddress: "",
  });
  const { writeContractAsync } = useScaffoldWriteContract("LinkContract");
  const [loading, setLoading] = useState<boolean>(false);
  const [venBalance, setVenBalance] = useState<bigint>(BigInt(0));
  const { address } = useAccount();
  const { data: isCustomer } = useScaffoldReadContract({
    contractName: "LinkContract",
    functionName: "customer_C",
    args: [address],
  });
  const { data: isVendor } = useScaffoldReadContract({
    contractName: "LinkContract",
    functionName: "vendor_C",
    args: [address],
  });

  const { data: cusVen } = useScaffoldReadContract({
    contractName: "LinkContract",
    functionName: isCustomer ? "customers" : "vendors",
    args: [address],
  });

  const { data: allTasks } = useScaffoldReadContract({
    contractName: "LinkContract",
    functionName: "getAllTasks",
  });

  function Pay(price: bigint, name: string) {
    setLoading(true);
    writeContractAsync({
      functionName: "payForTask",
      args: [name],
      value: price,
    });
    setLoading(false);
  }

  useEffect(() => {
    const parseResult = async () => {
      try {
        if (cusVen) {
          // @ts-ignore
          const details: any = await getDetailsFromIPFS(cusVen);
          console.log(details);
          details["walletAddress"] = address as string;
          setResult(details);
        } else throw new Error("Could not get data from the contract");
      } catch (error) {
        console.log(error);
      }
    };
    async function load() {
      if (cusVen) {
        setLoading(true);
        await parseResult();
        if (isVendor) {
          const dat = cusVen as unknown as Vendor;
          setVenBalance(dat.totalMoney);
        }
        setLoading(false);
      }
    }
    load();
  }, [cusVen, isVendor, isCustomer, address]);

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      {loading && <Loading />}
      {!loading && (
        <div className="flex flex-col items-center justify-center space-y-4">
          <BackButton />
          <h1 className="text-bold text-xl mt-8">Profile</h1>
          <div className="flex flex-col space-y-4 justify-center">
            <div>
              <Image src={result.picture ?? ""} alt={"Profile image"} className="rounded-full w-40 h-40 m-2" />
            </div>
            <div className="flex flex-col justify-center">
              <h3 className="font-bold mb-2 text-lg">{result.name}</h3>
              {isVendor && <p className="text-semibold mb-2">{result.service}</p>}
              {isVendor && <p className="text-semibold mb-2">Balance: {venBalance}</p>}
              <p className="flex space-x-2 justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M20.2334 10.7475C20.2334 17.2021 13.6224 21.1786 12.2485 21.936C12.1724 21.978 12.0869 22 12 22C11.9131 22 11.8276 21.978 11.7514 21.936C10.3765 21.1786 3.76758 17.2021 3.76758 10.7475C3.76758 5.6019 6.85492 2 12.0005 2C17.1461 2 20.2334 5.6019 20.2334 10.7475Z"
                    stroke="black"
                    strokeWidth="2"
                    strokeLinejoin="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M7.88379 10.2329C7.88379 11.3247 8.31749 12.3717 9.08947 13.1437C9.86146 13.9157 10.9085 14.3494 12.0002 14.3494C13.092 14.3494 14.139 13.9157 14.911 13.1437C15.683 12.3717 16.1167 11.3247 16.1167 10.2329C16.1167 9.14116 15.683 8.09412 14.911 7.32214C14.139 6.55015 13.092 6.11646 12.0002 6.11646C10.9085 6.11646 9.86146 6.55015 9.08947 7.32214C8.31749 8.09412 7.88379 9.14116 7.88379 10.2329V10.2329Z"
                    stroke="black"
                    strokeWidth="2"
                    strokeLinejoin="round"
                    stroke-linejoin="round"
                  />
                </svg>
                {result.address}
              </p>
            </div>
            <div className="flex justify-center space-x-4">
              {isCustomer && (
                <button className="btn btn-md bg-success dark:bg-secondary">
                  <a href={`/task`}>Hire Someone</a>
                </button>
              )}
              <button className="btn btn-md dark:bg-success bg-secondary">
                <a href={`/chat`}>Messages</a>
              </button>
            </div>
            {isVendor && (
              <div className="flex flex-col gap-3">
                <h3 className="text-lg font-bold mb-2">Best Collection</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 p-2 m-4">
                  <Image src={result.file1 ?? ""} alt="portflio1" className="max-h-[259px] max-w-[350px]" />
                  <Image src={result.file2 ?? ""} alt="portflio2" className="max-h-[259px] max-w-[350px]" />
                  <Image src={result.file3 ?? ""} alt="portflio3" className="max-h-[259px] max-w-[350px]" />
                </div>
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 p-2 m-4">
            {allTasks?.map(
              task =>
                (task.vendor === address || task.customer === address) && (
                  <div key={task.id} className="card bg-base-100 max-w-96 space-y-3 shadow-md">
                    <div className="card-body">
                      <h2 className="card-title">{task.name}</h2>
                      <Address address={isVendor ? task.customer : task.vendor} />
                      <p>{task.price} ETH</p>
                    </div>
                    <div className="card-actions justify-center">
                      <button className="btn dark:btn-success btn-secondary">
                        <a href={`/task/${task.id}`}>View</a>
                      </button>
                      {isCustomer && (
                        <button
                          onClick={() => Pay(task.price, task.name)}
                          className="btn btn-success dark:btn-secondary"
                        >
                          Pay
                        </button>
                      )}
                    </div>
                  </div>
                ),
            )}
          </div>
        </div>
      )}
    </div>
  );
}
