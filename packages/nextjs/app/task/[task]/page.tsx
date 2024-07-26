"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { DIVISOR } from "~~/types/utils";

export default function ViewTask({ params }: { params: { task: string } }) {
  const [loading, setLoading] = useState<boolean>(false);
  const { writeContractAsync } = useScaffoldWriteContract("LinkContract");
  const router = useRouter();
  const { data } = useScaffoldReadContract({
    contractName: "LinkContract",
    functionName: "getTask",
    args: [params.task as `0x${string}`],
  });

  function Pay(price: bigint, name: string) {
    setLoading(true);
    writeContractAsync({
      functionName: "payForTask",
      args: [name],
      value: price,
    });
    toast.success("Payment successful");
    setLoading(false);
    router.push("/profile");
  }
  return (
    <div className="flex flex-col space-y-4 m-4 justify-center">
      <h1 className="text-bold text-xl text-center p-3">Task</h1>
      <div className="flex justify-center">
        {data && (
          <div className="card leading-4">
            <div className="flex flex-col space-y-4">
              <div className="flex flex-col space-y-2">
                <div className="flex flex-col space-y-2">
                  <div className="text-base text-bold">Task Name</div>
                  <div className="text-base">{data.name}</div>
                </div>
                <div className="flex flex-col space-y-2">
                  <div className="text-base text-bold">Task Description</div>
                  <div className="text-base">{data.description}</div>
                </div>
                <div className="flex flex-col space-y-2">
                  <div className="text-base text-bold">Task Price</div>
                  <div className="text-base">{Number(data.price) / Number(DIVISOR)} ETH</div>
                </div>
                <div className="flex flex-col space-y-2">
                  <div className="text-base text-bold">Task Status</div>
                  <div className="text-base">{data.completed ? "Completed" : "Not completed"}</div>
                </div>
              </div>
              <div className="card-actions">
                {!data.completed && (
                  <button className="btn btn-primary" onClick={() => Pay(data.price, data.name)}>
                    {loading ? (
                      <span className="loading loading-lg loading-dots text-secondary"></span>
                    ) : (
                      "Pay for Task"
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
