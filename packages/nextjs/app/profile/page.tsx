"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import man from "/public/man.svg";
import { NextPage } from "next";
import { useAccount } from "wagmi";
import Loading from "~~/components/Loading";
import BackButton from "~~/components/backButton";
import { Address } from "~~/components/scaffold-eth";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { DIVISOR } from "~~/types/utils";

type Tasks = {
  id: `0x${string}`;
  name: string;
  description: string;
  price: bigint;
  vendor: `0x${string}` | string;
  customer: `0x${string}` | string;
  completed: boolean;
}[];

const ProfilePage: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const { writeContractAsync } = useScaffoldWriteContract("LinkContract");
  const [loading, setLoading] = useState<boolean>(false);
  const [allTasks, setAllTasks] = useState<Tasks>([]);
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

  const { data: ven } = useScaffoldReadContract({
    contractName: "LinkContract",
    functionName: "vendors",
    args: [connectedAddress],
  });
  const { data: prof } = useScaffoldReadContract({
    contractName: "LinkContract",
    functionName: "profiles",
    args: [connectedAddress],
  });

  const { data: taskList } = useScaffoldReadContract({
    contractName: "LinkContract",
    functionName: "getAllTasks",
  });

  useEffect(() => {
    async function getTasks() {
      if (taskList) {
        const tasks: Tasks = [];
        for (const val of taskList) {
          if (isVendor && val.vendor === connectedAddress) {
            tasks.push(val);
          } else if (isCustomer && val.customer === connectedAddress) {
            tasks.push(val);
          }
        }
        setAllTasks(tasks);
      }
    }
    getTasks();
  }, [connectedAddress, isCustomer, isVendor, taskList]);

  function Pay(price: bigint, name: string) {
    setLoading(true);
    writeContractAsync({
      functionName: "payForTask",
      args: [name],
      value: price,
    });
    setLoading(false);
  }
  function Withdraw() {
    setLoading(true);
    writeContractAsync({
      functionName: "paySeller",
    });
    setLoading(false);
  }
  return (
    <div>
      {loading ? (
        <Loading />
      ) : (
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="absolute top-6 left-10">
            <BackButton />
          </div>
          <h1 className="text-bold text-2xl mt-8">Profile</h1>
          <div className="flex flex-col space-y-4 justify-center">
            <div className="justify-center flex">
              {prof && prof[5] !== undefined ? (
                <Image
                  src={prof[5]}
                  alt={"Profile image"}
                  width={160}
                  height={160}
                  className="rounded-full w-40 h-40 m-2"
                />
              ) : (
                <Image
                  src={man}
                  alt={"Profile image"}
                  width={160}
                  height={160}
                  className="rounded-full w-40 h-40 m-2"
                />
              )}
            </div>
            <div className="flex flex-col justify-center">
              {prof && prof[0] !== undefined && <h3 className="font-bold text-center mb-2 text-lg">{prof[0]}</h3>}
              {isVendor && ven && ven[0] !== undefined && <p className="text-semibold text-center mb-2">{ven[0]}</p>}
              {isVendor && ven && ven[5] && (
                <p className="text-semibold mb-2 text-center">My balance: {Number(ven[5]) / Number(DIVISOR)} ETH</p>
              )}
              {prof && prof[3] !== undefined && (
                <p className="flex space-x-2 justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M20.2334 10.7475C20.2334 17.2021 13.6224 21.1786 12.2485 21.936C12.1724 21.978 12.0869 22 12 22C11.9131 22 11.8276 21.978 11.7514 21.936C10.3765 21.1786 3.76758 17.2021 3.76758 10.7475C3.76758 5.6019 6.85492 2 12.0005 2C17.1461 2 20.2334 5.6019 20.2334 10.7475Z"
                      stroke="black"
                      strokeWidth="2"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M7.88379 10.2329C7.88379 11.3247 8.31749 12.3717 9.08947 13.1437C9.86146 13.9157 10.9085 14.3494 12.0002 14.3494C13.092 14.3494 14.139 13.9157 14.911 13.1437C15.683 12.3717 16.1167 11.3247 16.1167 10.2329C16.1167 9.14116 15.683 8.09412 14.911 7.32214C14.139 6.55015 13.092 6.11646 12.0002 6.11646C10.9085 6.11646 9.86146 6.55015 9.08947 7.32214C8.31749 8.09412 7.88379 9.14116 7.88379 10.2329V10.2329Z"
                      stroke="black"
                      strokeWidth="2"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {prof[3]}
                </p>
              )}
            </div>
            <div className="flex justify-center space-x-4">
              {isCustomer && (
                <button className="btn btn-md bg-success dark:bg-secondary">
                  <a href={`/service`}>Hire Someone</a>
                </button>
              )}
              {isVendor && (
                <button className="btn btn-md bg-success dark:bg-secondary" onClick={Withdraw}>
                  Withdraw
                </button>
              )}
              <button className="btn btn-md dark:bg-success bg-secondary">
                <a href={`/chat`}>Messages</a>
              </button>
            </div>
            {isVendor && ven && (
              <div className="flex flex-col gap-3">
                <h3 className="text-lg font-bold text-center my-2">Best Collection</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10 p-2 m-4">
                  <div className="bg-neutral-300 w-fit h-fit p-2">
                    {ven[1] && ven[1].length > 1 && (
                      <Image
                        src={ven[1] ?? ""}
                        alt="portflio1"
                        width={250}
                        height={250}
                        className="max-h-[259px] max-w-[350px]"
                      />
                    )}
                  </div>
                  <div className="bg-neutral-300 w-fit p-2">
                    {ven[2] && ven[2].length > 1 && (
                      <Image
                        src={ven[2]}
                        alt="portflio2"
                        width={250}
                        height={250}
                        className="max-h-[259px] max-w-[350px]"
                      />
                    )}
                  </div>
                  <div className="bg-neutral-300 w-fit p-2">
                    {ven[3] && ven[3].length > 1 && (
                      <Image
                        src={ven[3]}
                        alt="portflio3"
                        width={250}
                        height={250}
                        className="max-h-[259px] max-w-[350px]"
                      />
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
          <section className="flex flex-col justify-center gap-3">
            <h3 className="font-bold text-xl text-center text-underline">Tasks</h3>
            <br />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 p-2 m-4 gap-4">
              {allTasks?.map(task => (
                <div key={task.id} className="card bg-base-100 max-w-96 space-y-3 shadow-md">
                  <div className="card-body">
                    <h2 className="card-title">{task.name}</h2>
                    <Address address={isVendor ? (task.customer as `0x${string}`) : (task.vendor as `0x${string}`)} />
                    <p>{Number(task.price) / Number(DIVISOR)} ETH</p>
                  </div>
                  <div className="card-actions justify-center m-4">
                    <button className=" w-full rounded-xl text-center lg:px-2 lg:py-2 px-2 py-3 border shadow-md btn dark:btn-success btn-secondary">
                      <Link href={`/task/${task.id}`}>View</Link>
                    </button>
                    {isCustomer && !task.completed && (
                      <button
                        onClick={() => Pay(task.price, task.name)}
                        className="w-full rounded-xl text-center lg:px-2 lg:py-2 px-2 py-3 border shadow-md btn btn-success dark:btn-secondary"
                      >
                        Pay
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
