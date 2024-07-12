import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { getDetailsFromIPFS } from "~~/services/web3/pinata";
import { Profile, Vendor } from "~~/types/utils";

export default function ViewVendor() {
  const [result, setResult] = useState<Profile>({
    name: "",
    email: "",
    phone: "",
    address: "",
    role: "vendor",
    picture: "",
    walletAddress: "",
  });
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  const query = router.query.vendor;
  const { data } = useScaffoldReadContract({
    contractName: "LinkContract",
    functionName: "vendors",
    args: [query as string],
  });
  useEffect(() => {
    const parseResult = async () => {
      try {
        if (data) {
          const dat = data as unknown as Vendor;
          const details = await getDetailsFromIPFS(dat.ipfsDetails);
          details["walletAddress"] = dat.account;
          setResult(details);
        } else throw new Error("Could not get data from the contract");
      } catch (error) {
        console.log(error);
      }
    };
    async function load() {
      if (data as unknown as Vendor) {
        setLoading(true);
        await parseResult();
        setLoading(false);
      }
    }
    load();
  }, [data, query]);

  return (
    <div className="flex flex-col space-y-4 relative">
      <div className="absolute top-6 left-20" onClick={() => router.back()}>
        <svg width="35px" height="35px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
          <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
          <g id="SVGRepo_iconCarrier">
            {" "}
            <path
              d="M15 6L9 12L15 18M15 12H15.01"
              stroke="#000000"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            ></path>{" "}
          </g>
        </svg>
      </div>
      <h1 className="text-bold text-xl">Vendor Profile</h1>
      {loading ? (
        <div className="flex flex-col space-y-4 justify-center">
          <div>
            <Image src={result.picture ?? ""} alt={"Vendor's image"} className="rounded-full w-20 h-20 m-2" />
          </div>
          <div className="flex flex-col justify-center">
            <h3 className="font-bold mb-2 text-lg">{result.name}</h3>
            <p className="text-semibold mb-2">{result.service}</p>
            <p className="flex space-x-2 justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M20.2334 10.7475C20.2334 17.2021 13.6224 21.1786 12.2485 21.936C12.1724 21.978 12.0869 22 12 22C11.9131 22 11.8276 21.978 11.7514 21.936C10.3765 21.1786 3.76758 17.2021 3.76758 10.7475C3.76758 5.6019 6.85492 2 12.0005 2C17.1461 2 20.2334 5.6019 20.2334 10.7475Z"
                  stroke="black"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M7.88379 10.2329C7.88379 11.3247 8.31749 12.3717 9.08947 13.1437C9.86146 13.9157 10.9085 14.3494 12.0002 14.3494C13.092 14.3494 14.139 13.9157 14.911 13.1437C15.683 12.3717 16.1167 11.3247 16.1167 10.2329C16.1167 9.14116 15.683 8.09412 14.911 7.32214C14.139 6.55015 13.092 6.11646 12.0002 6.11646C10.9085 6.11646 9.86146 6.55015 9.08947 7.32214C8.31749 8.09412 7.88379 9.14116 7.88379 10.2329V10.2329Z"
                  stroke="black"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              {result.address}
            </p>
          </div>
          <div className="flex justify-center space-x-4">
            <button className="btn btn-md bg-success dark:bg-secondary">
              <a href={`/task/create/${result.walletAddress}`}>Hire me</a>
            </button>
            <button className="btn btn-md dark:bg-success bg-secondary">
              <a href={`/chat/${result.walletAddress}`}>Message</a>
            </button>
          </div>
          <div className="flex flex-col gap-3">
            <h3 className="text-lg font-bold mb-2">Best Collection</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
              <Image src={result.file1 ?? ""} alt="portflio1" className="h-24" />
              <Image src={result.file2 ?? ""} alt="portflio2" className="h-24" />
              <Image src={result.file3 ?? ""} alt="portflio3" className="h-24" />
            </div>
          </div>
        </div>
      ) : (
        <span className="loading loading-lg loading-dots text-secondary"></span>
      )}
    </div>
  );
}