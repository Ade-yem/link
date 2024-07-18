"use client";

import { useState } from "react";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

export default function ViewTask({ params }: { params: { task: string } }) {
  const [loading, setLoading] = useState<boolean>(false);
  const { writeContractAsync } = useScaffoldWriteContract("LinkContract");

  const { data } = useScaffoldReadContract({
    contractName: "LinkContract",
    functionName: "getTask",
    // @ts-ignore
    args: [params.task],
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
  return (
    <div className="flex flex-col space-y-4 relative">
      <h1 className="text-bold text-xl">Vendor Profile</h1>
      {loading ? (
        <div className="flex justify-center">
          {data && (
            <div className="card">
              <div className="flex flex-col space-y-4">
                <div className="flex flex-col space-y-2">
                  <div className="flex flex-col space-y-2">
                    <div className="text-lg text-bold">Task Name</div>
                    <div className="text-lg">{data.name}</div>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <div className="text-lg text-bold">Task Description</div>
                    <div className="text-lg">{data.description}</div>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <div className="text-lg text-bold">Task Price</div>
                    <div className="text-lg">{data.price}</div>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <div className="text-lg text-bold">Task Status</div>
                    <div className="text-lg">{data.completed ? "Completed" : "Not completed"}</div>
                  </div>
                </div>
                <div className="card-actions">
                  <button className="btn btn-primary" onClick={() => Pay(data.price, data.name)}>
                    Pay for Task
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <span className="loading loading-lg loading-dots text-secondary"></span>
      )}
    </div>
  );
}
